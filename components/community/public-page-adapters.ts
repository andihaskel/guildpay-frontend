import { CommunityChannel, CommunityPlan } from '@/lib/types';
import { fmtAmount } from '@/components/community/setup-utils';
import {
  planHasMonthly,
  planHasYearly,
  planIsOneTime,
  planOneTimeAmountMinor,
  sellingPointsForPlan,
} from '@/components/community/plan-model';
import {
  CommunityPublicPageViewProps,
  PublicPageFeature,
  PublicPageMediaItem,
  PublicPagePerk,
  PublicPagePlanOption,
  PublicPageTestimonial,
  PublicPageFaqItem,
} from '@/components/community/community-public-page-types';
import { SetupPreviewModel, PlanSellingPoint, DEFAULT_GALLERY_DESCRIPTION, DEFAULT_GALLERY_HEADLINE, DEFAULT_GALLERY_LABEL, DEFAULT_FAQ_HEADLINE, DEFAULT_FAQ_LABEL, DEFAULT_TESTIMONIALS_HEADLINE, DEFAULT_TESTIMONIALS_LABEL, PageTestimonial } from '@/components/community/setup-preview-types';
import { normalizePageFaqItems, normalizePageTestimonials } from '@/components/community/page-content';
import {
  draftMediaToPublicItems,
  parsePublicPageFrame,
  publicCommunityPlanToCommunityPlan,
  type PublicCommunityResponse,
} from '@/components/community/public-community-types';
import { planFeaturesToSellingPoints } from '@/components/community/plan-model';
import { DEFAULT_IMAGE_FRAME } from '@/lib/image-frame';
import { normalizeAssetUrl } from '@/lib/utils';

const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg, #f4b860, #e0735a)',
  'linear-gradient(135deg, #5865f2, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #064e3b)',
  'linear-gradient(135deg, #0ea5e9, #1e3a8a)',
];

const DEFAULT_FEATURES: PublicPageFeature[] = [
  { icon: '💬', title: 'Access to group chats', description: 'Join private conversations with other members.' },
  { icon: '⚡', title: 'Real-time updates', description: 'Stay connected with instant messages and updates.' },
  { icon: '🔒', title: 'Community-only content', description: 'Resources and discussions for members only.' },
];

function planChannels(plan: CommunityPlan, channels: CommunityChannel[]) {
  const ids = new Set(plan.channel_ids ?? []);
  return channels.filter(c => ids.has(c.id));
}

function sellingPointsToFeatures(points: PlanSellingPoint[]): PublicPageFeature[] {
  if (points.length === 0) return DEFAULT_FEATURES;
  return points.map(point => ({
    id: point.id,
    icon: point.icon,
    title: point.title,
    description: point.description,
  }));
}

function planPriceParts(plan: CommunityPlan, billing: 'monthly' | 'yearly') {
  if (planIsOneTime(plan)) {
    const amount = planOneTimeAmountMinor(plan);
    return {
      amount: fmtAmount(amount, plan.currency),
      period: ' · one-time',
      subHtml: 'One-time payment · lifetime access',
      ctaSuffix: '',
    };
  }

  const hasYearly = planHasYearly(plan);
  const hasMonthly = planHasMonthly(plan);

  if (billing === 'yearly' && hasYearly) {
    const strike =
      hasMonthly && plan.monthly_amount_minor > 0
        ? fmtAmount(plan.monthly_amount_minor * 12, plan.currency)
        : undefined;
    const savings =
      hasMonthly && plan.monthly_amount_minor > 0
        ? Math.max(0, plan.monthly_amount_minor * 12 - (plan.yearly_amount_minor ?? 0))
        : 0;
    return {
      amount: fmtAmount(plan.yearly_amount_minor!, plan.currency),
      period: '/ year',
      strikeAmount: strike,
      subHtml:
        savings > 0
          ? `Billed annually · <strong>save ${fmtAmount(savings, plan.currency)} vs monthly</strong>`
          : 'Billed annually · cancel anytime',
      ctaSuffix: '/ yr',
    };
  }

  if (hasMonthly) {
    return {
      amount: fmtAmount(plan.monthly_amount_minor, plan.currency),
      period: '/ month',
      subHtml: 'Billed monthly · cancel anytime',
      ctaSuffix: '/ mo',
    };
  }

  if (hasYearly) {
    return {
      amount: fmtAmount(plan.yearly_amount_minor!, plan.currency),
      period: '/ year',
      subHtml: 'Billed annually · cancel anytime',
      ctaSuffix: '/ yr',
    };
  }

  return { amount: fmtAmount(0, plan.currency), period: '', subHtml: '', ctaSuffix: '' };
}

function buildPlanOptions(
  plans: CommunityPlan[],
  featuredPlanId?: string | null,
): PublicPagePlanOption[] {
  return plans.map((plan, index) => {
    const hasYearly = planHasYearly(plan);
    const hasMonthly = planHasMonthly(plan);
    const isOneTime = planIsOneTime(plan);
    const billing: 'monthly' | 'yearly' = hasMonthly ? 'monthly' : 'yearly';
    const price = planPriceParts(plan, billing);
    const trialDays = plan.trial_days && plan.trial_days > 0 ? plan.trial_days : null;

    let tag: string | undefined;
    let tagVariant: 'popular' | 'save' | undefined;
    if (featuredPlanId && plan.id === featuredPlanId) {
      tag = 'Most popular';
      tagVariant = 'popular';
    } else if (index === plans.length - 1 && plans.length > 2) {
      tag = 'Limited';
      tagVariant = 'save';
    }

    const ctaLabel = trialDays
      ? `Start ${trialDays}-day free trial`
      : isOneTime
        ? `Join for ${price.amount}`
        : `Join for ${price.amount}${price.ctaSuffix}`;

    return {
      id: plan.id,
      name: plan.offer_name,
      description: plan.description,
      amount: price.amount,
      period: price.period,
      strikeAmount: price.strikeAmount,
      tag,
      tagVariant,
      subHtml: trialDays
        ? `<strong>${trialDays}-day free trial</strong> · then ${price.amount}${price.period}`
        : price.subHtml,
      ctaLabel,
    };
  });
}

function buildPerks(plan: CommunityPlan | null, channels: CommunityChannel[]): PublicPagePerk[] {
  const linked = plan ? planChannels(plan, channels) : [];
  const perks: PublicPagePerk[] = linked.slice(0, 2).map(ch => ({
    type: 'discord' as const,
    label: `Discord — ${ch.name}`,
    muted: '· member access',
  }));

  perks.push(
    { type: 'check', label: 'Cancel anytime' },
    { type: 'check', label: 'Secure payment via Stripe' },
  );
  return perks;
}

function setupMediaItems(model: SetupPreviewModel): PublicPageMediaItem[] {
  return draftMediaToPublicItems(model.page.mediaItems ?? []);
}

function mapTestimonialsToPublic(items: PageTestimonial[]): PublicPageTestimonial[] {
  return items.map((t, i) => ({
    quote: t.quote,
    author: t.author,
    role: t.since ? `Member · ${t.since}` : 'Member',
    initials: (t.author.trim()[0] || 'M').toUpperCase(),
    avatarGradient: TESTIMONIAL_GRADIENTS[i % TESTIMONIAL_GRADIENTS.length],
  }));
}

function mapFaqToPublic(items: ReturnType<typeof normalizePageFaqItems>): PublicPageFaqItem[] {
  return items.map(item => ({ q: item.q, a: item.a }));
}

export function buildSetupPreviewPageProps(
  model: SetupPreviewModel,
  selectedPlanId: string | null,
  onSelectPlan?: (id: string) => void,
): CommunityPublicPageViewProps {
  const { page, plans, channels, slug, planSellingPoints } = model;
  const visiblePlanIds = page.visiblePlanIds?.length
    ? page.visiblePlanIds
    : plans.map(p => p.id);
  const visiblePlans = visiblePlanIds
    .map(id => plans.find(p => p.id === id))
    .filter((p): p is CommunityPlan => !!p);
  const plan =
    (selectedPlanId && visiblePlans.find(p => p.id === selectedPlanId)) ||
    visiblePlans[0] ||
    null;
  const sellingPoints = plan ? sellingPointsForPlan(plan, planSellingPoints[plan.id]) : [];

  const memberCount = plan?.member_counts.active ?? 0;

  const mappedTestimonials = mapTestimonialsToPublic(page.testimonials ?? []);
  const mappedFaq = mapFaqToPublic(page.faq ?? []);

  const selected = selectedPlanId ?? visiblePlans[0]?.id;
  const selectedPlanOption =
    buildPlanOptions(visiblePlans, page.featuredPlanId).find(p => p.id === selected) ??
    buildPlanOptions(visiblePlans, page.featuredPlanId)[0];

  const galleryItems = setupMediaItems(model);

  return {
    accentColor: page.accentColor,
    compact: false,
    communityName: page.communityName,
    tagline: page.subHeadline || undefined,
    coverImageUrl: page.coverImageUrl,
    coverImageFrame: page.coverImageFrame,
    heroImageUrl: page.logoUrl,
    heroImageFrame: page.logoImageFrame,
    avatarInitial: (page.communityName.trim()[0] || '?').toUpperCase(),
    memberCount: memberCount > 0 ? memberCount : 28,
    showMemberStats: page.showMemberStats !== false,
    mediaItems: galleryItems,
    galleryLabel: page.galleryLabel,
    galleryHeadline: page.galleryHeadline,
    galleryDescription: page.galleryDescription,
    galleryCountLabel: galleryItems.length
      ? `${galleryItems.length} item${galleryItems.length === 1 ? '' : 's'}`
      : undefined,
    features: sellingPointsToFeatures(sellingPoints),
    plans: buildPlanOptions(visiblePlans, page.featuredPlanId),
    selectedPlanId: selected ?? undefined,
    onSelectPlan,
    priceSubHtml: selectedPlanOption?.subHtml,
    ctaLabel: selectedPlanOption?.ctaLabel,
    perks: buildPerks(plan, channels),
    testimonials: mappedTestimonials,
    testimonialsLabel: page.testimonialsLabel?.trim() || DEFAULT_TESTIMONIALS_LABEL,
    testimonialsHeadline: page.testimonialsHeadline?.trim() || DEFAULT_TESTIMONIALS_HEADLINE,
    faq: mappedFaq,
    faqLabel: page.faqLabel?.trim() || DEFAULT_FAQ_LABEL,
    faqHeadline: page.faqHeadline?.trim() || DEFAULT_FAQ_HEADLINE,
    emptyPlansMessage: 'Add a plan to preview pricing.',
    showFooterLinks: false,
    showTopChrome: false,
    interactive: true,
  };
}

const DEFAULT_PUBLIC_FAQ: PublicPageFaqItem[] = [
  {
    q: 'How does access work?',
    a: "After checkout, you'll get an invite link and be auto-assigned your role in Discord within seconds.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard and keep access until the end of your billing period.',
  },
  {
    q: 'Is my payment secure?',
    a: 'All payments are processed by Stripe. We never see or store your card details.',
  },
];

export function buildPublicCommunityPageProps(
  data: PublicCommunityResponse,
  selectedPlanId: string | null,
  onSelectPlan?: (id: string) => void,
  onCtaClick?: () => void,
  ctaLoading?: boolean,
): CommunityPublicPageViewProps {
  const page = data.page;
  const mappedPlans = data.plans.map(publicCommunityPlanToCommunityPlan);
  const visiblePlans = mappedPlans.filter(plan => {
    const raw = data.plans.find(p => p.id === plan.id);
    return raw?.accepts_signups !== false;
  });
  const plan =
    (selectedPlanId && visiblePlans.find(p => p.id === selectedPlanId)) ||
    visiblePlans[0] ||
    null;
  const sellingPoints = plan ? planFeaturesToSellingPoints(plan) : [];

  const selected = selectedPlanId ?? visiblePlans[0]?.id;
  const planOptions = buildPlanOptions(visiblePlans, page?.featuredPlanId ?? null);
  const selectedPlanOption = planOptions.find(p => p.id === selected) ?? planOptions[0];

  const mediaItems = page?.mediaItems?.length
    ? draftMediaToPublicItems(page.mediaItems)
    : [];

  const publicTestimonials =
    page?.testimonials != null
      ? mapTestimonialsToPublic(normalizePageTestimonials(page.testimonials))
      : [];
  const publicFaq =
    page?.faq != null ? mapFaqToPublic(normalizePageFaqItems(page.faq)) : DEFAULT_PUBLIC_FAQ;

  return {
    accentColor: page?.accentColor,
    communityName: data.community_name,
    tagline: data.tagline || undefined,
    coverImageUrl: normalizeAssetUrl(page?.coverImageUrl),
    coverImageFrame: parsePublicPageFrame(page?.coverImageFrame) ?? DEFAULT_IMAGE_FRAME,
    heroImageUrl: normalizeAssetUrl(data.logo_url),
    heroImageFrame: parsePublicPageFrame(page?.logoImageFrame) ?? DEFAULT_IMAGE_FRAME,
    showMemberStats: page?.showMemberStats !== false,
    mediaItems,
    galleryLabel: page?.galleryLabel?.trim() || DEFAULT_GALLERY_LABEL,
    galleryHeadline: page?.galleryHeadline?.trim() || DEFAULT_GALLERY_HEADLINE,
    galleryDescription: page?.galleryDescription?.trim() || DEFAULT_GALLERY_DESCRIPTION,
    galleryCountLabel: mediaItems.length
      ? `${mediaItems.length} item${mediaItems.length === 1 ? '' : 's'}`
      : undefined,
    features: sellingPointsToFeatures(sellingPoints),
    plans: planOptions,
    selectedPlanId: selected ?? undefined,
    onSelectPlan,
    priceSubHtml: selectedPlanOption?.subHtml,
    ctaLabel: selectedPlanOption?.ctaLabel,
    onCtaClick,
    ctaLoading,
    perks: [
      { type: 'check', label: 'Cancel anytime' },
      { type: 'check', label: 'Secure payment via Stripe' },
    ],
    testimonials: publicTestimonials,
    testimonialsLabel: page?.testimonialsLabel?.trim() || DEFAULT_TESTIMONIALS_LABEL,
    testimonialsHeadline: page?.testimonialsHeadline?.trim() || DEFAULT_TESTIMONIALS_HEADLINE,
    faq: publicFaq,
    faqLabel: page?.faqLabel?.trim() || DEFAULT_FAQ_LABEL,
    faqHeadline: page?.faqHeadline?.trim() || DEFAULT_FAQ_HEADLINE,
    showFooterLinks: true,
    showTopChrome: true,
    interactive: true,
  };
}

export type PublicPageApiData = {
  creator_slug: string;
  offer_name: string;
  hero_image_url?: string;
  description?: string;
  features?: Array<{ id: string; icon: string; title: string; description: string }>;
  media_gallery_enabled?: boolean;
  media_items?: Array<{
    id: string;
    type: 'image' | 'video';
    url?: string;
    caption?: string;
    duration?: string;
    wide?: boolean;
    tall?: boolean;
  }>;
  discord_channels?: Array<{ id: string; name: string }>;
  monthly_amount_minor: number;
  yearly_amount_minor: number;
  currency: string;
  has_yearly: boolean;
  trial_days?: number;
};

export function buildLivePublicPageProps(
  pageData: PublicPageApiData,
  billingInterval: 'monthly' | 'yearly',
  onSelectBilling: (interval: 'monthly' | 'yearly') => void,
  onCtaClick: () => void,
  ctaLoading: boolean,
): CommunityPublicPageViewProps {
  const trialDays = pageData.trial_days && pageData.trial_days > 0 ? pageData.trial_days : null;
  const plans: PublicPagePlanOption[] = [];

  if (pageData.monthly_amount_minor > 0) {
    const amount = fmtAmount(pageData.monthly_amount_minor, pageData.currency);
    plans.push({
      id: 'monthly',
      name: 'Monthly',
      description: 'Full access · cancel anytime.',
      amount,
      period: '/ month',
      subHtml: trialDays
        ? `<strong>${trialDays}-day free trial</strong> · then ${amount}/ month`
        : 'Billed monthly · cancel anytime',
      ctaLabel: trialDays ? `Start ${trialDays}-day free trial` : `Join for ${amount}/ mo`,
    });
  }

  if (pageData.has_yearly && pageData.yearly_amount_minor > 0) {
    const amount = fmtAmount(pageData.yearly_amount_minor, pageData.currency);
    const strike =
      pageData.monthly_amount_minor > 0
        ? fmtAmount(pageData.monthly_amount_minor * 12, pageData.currency)
        : undefined;
    const savings =
      pageData.monthly_amount_minor > 0
        ? Math.max(0, pageData.monthly_amount_minor * 12 - pageData.yearly_amount_minor)
        : 0;
    plans.push({
      id: 'yearly',
      name: 'Annual',
      description: 'Best value · billed once a year.',
      amount,
      period: '/ year',
      strikeAmount: strike,
      tag: 'Most popular',
      subHtml:
        savings > 0
          ? `Billed annually · <strong>save ${fmtAmount(savings, pageData.currency)} vs monthly</strong>`
          : 'Billed annually · cancel anytime',
      ctaLabel: trialDays
        ? `Start ${trialDays}-day free trial`
        : savings > 0
          ? `Join for ${amount} / yr — save ${fmtAmount(savings, pageData.currency)}`
          : `Join for ${amount} / yr`,
    });
  }

  const selected = plans.find(p => p.id === billingInterval) ?? plans[0];
  const perks: PublicPagePerk[] = (pageData.discord_channels ?? []).slice(0, 2).map(ch => ({
    type: 'discord' as const,
    label: `Discord — ${ch.name}`,
    muted: '· member access',
  }));
  perks.push(
    { type: 'check', label: 'Cancel anytime' },
    { type: 'check', label: 'Secure payment via Stripe' },
  );

  const mediaItems: PublicPageMediaItem[] =
    pageData.media_gallery_enabled && pageData.media_items?.length
      ? pageData.media_items.map((item, index) => ({
          id: item.id,
          type: item.type,
          url: item.url,
          bgIndex: (index % 8) + 1,
          caption: item.caption,
          duration: item.duration,
          wide: item.wide ?? (index === 0 || index === 3 || index === 7),
          tall: item.tall ?? index === 0,
        }))
      : [];

  const defaultFaq = [
    {
      q: 'How does access work?',
      a: "After checkout, you'll get an invite link and be auto-assigned your role in Discord within seconds.",
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Cancel from your dashboard and keep access until the end of your billing period.',
    },
    {
      q: 'Is my payment secure?',
      a: 'All payments are processed by Stripe. We never see or store your card details.',
    },
  ];

  return {
    communityName: pageData.offer_name,
    handle: pageData.creator_slug,
    tagline: pageData.description,
    heroImageUrl: pageData.hero_image_url,
    mediaItems,
    galleryCountLabel: mediaItems.length ? `${mediaItems.length} items` : undefined,
    features: (pageData.features ?? []).map(f => ({
      id: f.id,
      icon: f.icon,
      title: f.title,
      description: f.description,
    })),
    plans,
    selectedPlanId: selected?.id,
    onSelectPlan: id => onSelectBilling(id as 'monthly' | 'yearly'),
    priceSubHtml: selected?.subHtml,
    ctaLabel: selected?.ctaLabel,
    onCtaClick,
    ctaLoading,
    perks,
    faq: defaultFaq,
    showFooterLinks: true,
    interactive: true,
  };
}
