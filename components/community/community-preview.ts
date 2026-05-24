import { Community, CommunityChannel, CommunityPlan } from '@/lib/types';
import { pageDraftFromCommunity } from '@/components/community/community-page-draft';
import {
  defaultPageFaqItems,
  defaultPageTestimonials,
  normalizePageFaqItems,
  normalizePageTestimonials,
} from '@/components/community/page-content';
import {
  normalizePlanSellingPoints,
} from '@/components/community/plan-selling-points';
import {
  SetupPageDraft,
  SetupPreviewModel,
  PlanSellingPoint,
  DEFAULT_GALLERY_DESCRIPTION,
  DEFAULT_GALLERY_HEADLINE,
  DEFAULT_GALLERY_LABEL,
  DEFAULT_FAQ_HEADLINE,
  DEFAULT_FAQ_LABEL,
  DEFAULT_TESTIMONIALS_HEADLINE,
  DEFAULT_TESTIMONIALS_LABEL,
} from '@/components/community/setup-preview-types';

export const COMMUNITY_PREVIEW_ACTIVE_KEY = 'ag-community-preview-active';

const STORAGE_KEY = (communityId: string) => `ag-community-preview:${communityId}`;

export const DEFAULT_COMMUNITY_SELLING_POINTS = [
  'Daily trade ideas — 3-5 setups per market day',
  'Live sessions Mon & Thu — 1h walkthrough + Q&A',
  'Cancel anytime — instant from member portal',
];

export const DEFAULT_COMMUNITY_FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes — from your member portal, instant.' },
  { q: 'Do you guarantee returns?', a: 'No. We share our process, not promises.' },
];

export const DEFAULT_COMMUNITY_TESTIMONIALS = [
  { quote: 'Paid for itself in a week.', author: 'Jorge T.', since: 'Oct 2025' },
  { quote: 'No noise, just setups.', author: 'Maria L.', since: 'Feb 2026' },
];

export function getCommunityPreviewPath(communityId: string) {
  return `/preview/community/${communityId}`;
}

export function getCommunityPublicPath(creatorSlug: string, communitySlug: string) {
  return `/p/${creatorSlug}/${communitySlug}`;
}

export function getCommunityPublicUrl(creatorSlug: string, communitySlug: string, origin?: string) {
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://accessgate.io');
  return `${base}${getCommunityPublicPath(creatorSlug, communitySlug)}`;
}

export function getCommunityPublicDisplayHost(origin?: string) {
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://accessgate.io');
  try {
    return new URL(base).host.replace(/^www\./, '');
  } catch {
    return 'accessgate.io';
  }
}

export function saveCommunityPreviewDraft(communityId: string, model: SetupPreviewModel) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY(communityId), JSON.stringify(model));
  } catch {
    /* quota or private mode */
  }
}

export function loadCommunityPreviewDraft(communityId: string): SetupPreviewModel | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(communityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SetupPreviewModel;
    if (!parsed.page.mediaItems) {
      parsed.page.mediaItems = [];
    } else {
      parsed.page.mediaItems = parsed.page.mediaItems.filter(item => !!item.url?.trim());
    }
    if (!parsed.page.galleryLabel?.trim()) {
      parsed.page.galleryLabel = DEFAULT_GALLERY_LABEL;
    }
    if (!parsed.page.galleryHeadline?.trim()) {
      parsed.page.galleryHeadline = DEFAULT_GALLERY_HEADLINE;
    }
    if (!parsed.page.galleryDescription?.trim()) {
      parsed.page.galleryDescription = DEFAULT_GALLERY_DESCRIPTION;
    }
    if (parsed.page.autoplayVideoInHero == null) {
      parsed.page.autoplayVideoInHero = true;
    }
    if (parsed.page.showMemberStats == null) {
      parsed.page.showMemberStats = true;
    }
    if (!parsed.page.visiblePlanIds?.length && parsed.plans?.length) {
      parsed.page.visiblePlanIds = parsed.plans.map(plan => plan.id);
    }
    if (!parsed.page.planOrderIds?.length && parsed.plans?.length) {
      parsed.page.planOrderIds = parsed.page.visiblePlanIds ?? parsed.plans.map(plan => plan.id);
    }
    if (!parsed.page.testimonialsLabel?.trim()) {
      parsed.page.testimonialsLabel = DEFAULT_TESTIMONIALS_LABEL;
    }
    if (!parsed.page.testimonialsHeadline?.trim()) {
      parsed.page.testimonialsHeadline = DEFAULT_TESTIMONIALS_HEADLINE;
    }
    if (!parsed.page.faqLabel?.trim()) {
      parsed.page.faqLabel = DEFAULT_FAQ_LABEL;
    }
    if (!parsed.page.faqHeadline?.trim()) {
      parsed.page.faqHeadline = DEFAULT_FAQ_HEADLINE;
    }
    const legacy = parsed as SetupPreviewModel & {
      sellingPoints?: string[];
      testimonials?: Array<{ quote: string; author: string; since: string }>;
      faq?: Array<{ q: string; a: string }>;
    };
    if (parsed.page.testimonials == null && legacy.testimonials?.length) {
      parsed.page.testimonials = legacy.testimonials.map(item => ({
        id: `pc_${Math.random().toString(36).slice(2, 9)}`,
        quote: item.quote,
        author: item.author,
        since: item.since,
      }));
    }
    if (parsed.page.testimonials == null) {
      parsed.page.testimonials = defaultPageTestimonials();
    } else {
      parsed.page.testimonials = normalizePageTestimonials(parsed.page.testimonials);
    }
    if (parsed.page.faq == null && legacy.faq?.length) {
      parsed.page.faq = legacy.faq.map(item => ({
        id: `pc_${Math.random().toString(36).slice(2, 9)}`,
        q: item.q,
        a: item.a,
      }));
    }
    if (parsed.page.faq == null) {
      parsed.page.faq = defaultPageFaqItems();
    } else {
      parsed.page.faq = normalizePageFaqItems(parsed.page.faq);
    }
    if (parsed.planSellingPoints) {
      parsed.planSellingPoints = Object.fromEntries(
        Object.entries(parsed.planSellingPoints).map(([planId, points]) => [
          planId,
          normalizePlanSellingPoints(points),
        ]),
      );
    }
    const legacySelling = parsed as SetupPreviewModel & { sellingPoints?: string[] };
    if (!parsed.planSellingPoints && parsed.plans?.length) {
      parsed.planSellingPoints = Object.fromEntries(
        parsed.plans.map(plan => [plan.id, normalizePlanSellingPoints(plan.features)]),
      );
      if (legacySelling.sellingPoints?.length && parsed.plans[0]) {
        parsed.planSellingPoints[parsed.plans[0].id] = normalizePlanSellingPoints(legacySelling.sellingPoints);
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isCommunityPreviewDraftActive(communityId: string) {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(COMMUNITY_PREVIEW_ACTIVE_KEY) === communityId;
}

export function buildCommunityPreviewModel(
  community: Community,
  plans: CommunityPlan[],
  channels: CommunityChannel[],
  selectedPlanId?: string | null,
): SetupPreviewModel {
  const page = pageDraftFromCommunity(community, plans);
  return {
    slug: community.slug,
    page,
    plans,
    channels,
    selectedPlanId: selectedPlanId ?? page.visiblePlanIds?.[0] ?? plans[0]?.id ?? null,
    planSellingPoints: Object.fromEntries(
      plans.map(plan => [plan.id, normalizePlanSellingPoints(plan.features)]),
    ),
  };
}
