import { Community, CommunityPlan } from '@/lib/types';
import { DEFAULT_IMAGE_FRAME, type ImageFrame } from '@/lib/image-frame';
import { normalizeAssetUrl } from '@/lib/utils';
import {
  DEFAULT_GALLERY_DESCRIPTION,
  DEFAULT_GALLERY_HEADLINE,
  DEFAULT_GALLERY_LABEL,
  DEFAULT_FAQ_HEADLINE,
  DEFAULT_FAQ_LABEL,
  DEFAULT_PLANS_LABEL,
  DEFAULT_TESTIMONIALS_HEADLINE,
  DEFAULT_TESTIMONIALS_LABEL,
  SetupMediaItem,
  SetupPageDraft,
} from '@/components/community/setup-preview-types';
import {
  defaultPageFaqItems,
  defaultPageTestimonials,
  normalizePageFaqItems,
  normalizePageTestimonials,
  sanitizePersistableFaqItems,
  sanitizePersistableTestimonials,
} from '@/components/community/page-content';
import { mergePlanOrderIds, planColor } from '@/components/community/setup-utils';

const DEFAULT_SUB_HEADLINE =
  'Real-time alerts, weekly sessions, and a no-noise Discord. Cancel anytime.';

export type StoredCommunityPageSettings = {
  accentColor?: string;
  coverImageUrl?: string;
  coverImageFrame?: ImageFrame;
  logoImageFrame?: ImageFrame;
  galleryLabel?: string;
  galleryHeadline?: string;
  galleryDescription?: string;
  mediaItems?: SetupMediaItem[];
  autoplayVideoInHero?: boolean;
  showMemberStats?: boolean;
  visiblePlanIds?: string[];
  planOrderIds?: string[];
  featuredPlanId?: string | null;
  plansLabel?: string;
  testimonialsLabel?: string;
  testimonialsHeadline?: string;
  testimonials?: SetupPageDraft['testimonials'];
  faqLabel?: string;
  faqHeadline?: string;
  faq?: SetupPageDraft['faq'];
};

function readPageSettings(settings: Community['settings']): StoredCommunityPageSettings | null {
  if (!settings || typeof settings !== 'object') return null;
  const page = (settings as Record<string, unknown>).page;
  if (!page || typeof page !== 'object') return null;
  return page as StoredCommunityPageSettings;
}

export function isPersistableMediaItem(item: SetupMediaItem): boolean {
  const url = item.url?.trim();
  return !!url && !url.startsWith('blob:');
}

export function isRenderableMediaItem(item: SetupMediaItem): boolean {
  return !!item.url?.trim();
}

/** Drop blob previews, gradient placeholders, and other non-persisted gallery entries. */
export function sanitizePersistableMediaItems(items: SetupMediaItem[]): SetupMediaItem[] {
  return items.filter(isPersistableMediaItem);
}

/** Drop gradient-only placeholders while keeping in-session blob previews. */
export function sanitizeRenderableMediaItems(items: SetupMediaItem[]): SetupMediaItem[] {
  return items.filter(isRenderableMediaItem);
}

function normalizeMediaItemsForCompare(items: SetupMediaItem[] | undefined) {
  return sanitizeRenderableMediaItems(items ?? []).map(item => ({
    type: item.type,
    url: normalizeAssetUrl(item.url) ?? item.url?.trim() ?? '',
    filename: item.filename?.trim() ?? '',
    duration: item.duration?.trim() ?? '',
  }));
}

/** @deprecated Use sanitizePersistableMediaItems */
export function stripBlobMediaItems(items: SetupMediaItem[]): SetupMediaItem[] {
  return sanitizePersistableMediaItems(items);
}

export function mergePlanFieldsIntoPageDraft(
  draft: SetupPageDraft,
  plans: CommunityPlan[],
): SetupPageDraft {
  const planIds = plans.map(p => p.id);
  const existingVisible = draft.visiblePlanIds ?? [];
  const keptVisible = existingVisible.filter(id => planIds.includes(id));
  const addedVisible = planIds.filter(id => !keptVisible.includes(id));
  const visiblePlanIds =
    keptVisible.length === 0 && addedVisible.length > 0 ? planIds : [...keptVisible, ...addedVisible];

  const planOrderIds = mergePlanOrderIds(draft.planOrderIds, planIds);
  const featuredPlanId =
    draft.featuredPlanId && planIds.includes(draft.featuredPlanId) && visiblePlanIds.includes(draft.featuredPlanId)
      ? draft.featuredPlanId
      : null;

  const visibleChanged =
    existingVisible.length !== visiblePlanIds.length ||
    !existingVisible.every((id, i) => id === visiblePlanIds[i]);
  const orderChanged =
    (draft.planOrderIds ?? []).length !== planOrderIds.length ||
    !(draft.planOrderIds ?? []).every((id, i) => id === planOrderIds[i]);
  const featuredChanged = (draft.featuredPlanId ?? null) !== featuredPlanId;

  if (!visibleChanged && !orderChanged && !featuredChanged) return draft;
  return { ...draft, visiblePlanIds, planOrderIds, featuredPlanId };
}

export function pageDraftFromCommunity(community: Community, plans: CommunityPlan[]): SetupPageDraft {
  const stored = readPageSettings(community.settings);
  const planIds = plans.map(p => p.id);
  const visiblePlanIds = stored?.visiblePlanIds?.filter(id => planIds.includes(id)) ?? planIds;
  const planOrderIds = mergePlanOrderIds(stored?.planOrderIds, planIds);
  const featuredPlanId =
    stored?.featuredPlanId && planIds.includes(stored.featuredPlanId) && visiblePlanIds.includes(stored.featuredPlanId)
      ? stored.featuredPlanId
      : null;

  const tagline = community.tagline?.trim() || DEFAULT_SUB_HEADLINE;

  return {
    communityName: community.name,
    tagline: tagline || 'Daily signals + live sessions',
    headline: 'Trade alongside a proven desk.',
    subHeadline: tagline,
    accentColor: stored?.accentColor ?? planColor(community.name),
    coverImageUrl: normalizeAssetUrl(stored?.coverImageUrl),
    coverImageFrame: stored?.coverImageFrame ?? DEFAULT_IMAGE_FRAME,
    logoUrl: normalizeAssetUrl(community.logo_url),
    logoImageFrame: stored?.logoImageFrame ?? DEFAULT_IMAGE_FRAME,
    galleryLabel: stored?.galleryLabel?.trim() || DEFAULT_GALLERY_LABEL,
    galleryHeadline: stored?.galleryHeadline?.trim() || DEFAULT_GALLERY_HEADLINE,
    galleryDescription: stored?.galleryDescription?.trim() || DEFAULT_GALLERY_DESCRIPTION,
    mediaItems: sanitizePersistableMediaItems(stored?.mediaItems ?? []),
    autoplayVideoInHero: stored?.autoplayVideoInHero ?? true,
    showMemberStats: stored?.showMemberStats ?? true,
    visiblePlanIds,
    planOrderIds,
    featuredPlanId,
    plansLabel: stored?.plansLabel?.trim() || DEFAULT_PLANS_LABEL,
    testimonialsLabel: stored?.testimonialsLabel?.trim() || DEFAULT_TESTIMONIALS_LABEL,
    testimonialsHeadline: stored?.testimonialsHeadline?.trim() || DEFAULT_TESTIMONIALS_HEADLINE,
    testimonials:
      stored?.testimonials != null
        ? normalizePageTestimonials(stored.testimonials)
        : defaultPageTestimonials(),
    faqLabel: stored?.faqLabel?.trim() || DEFAULT_FAQ_LABEL,
    faqHeadline: stored?.faqHeadline?.trim() || DEFAULT_FAQ_HEADLINE,
    faq: stored?.faq != null ? normalizePageFaqItems(stored.faq) : defaultPageFaqItems(),
  };
}

export function normalizePageDraftForCompare(draft: SetupPageDraft): string {
  return JSON.stringify({
    communityName: draft.communityName.trim(),
    subHeadline: draft.subHeadline.trim(),
    accentColor: draft.accentColor,
    coverImageUrl: draft.coverImageUrl ?? null,
    coverImageFrame: draft.coverImageFrame ?? DEFAULT_IMAGE_FRAME,
    logoUrl: draft.logoUrl ?? null,
    logoImageFrame: draft.logoImageFrame ?? DEFAULT_IMAGE_FRAME,
    galleryLabel: draft.galleryLabel.trim(),
    galleryHeadline: draft.galleryHeadline.trim(),
    galleryDescription: draft.galleryDescription.trim(),
    mediaItems: normalizeMediaItemsForCompare(draft.mediaItems),
    autoplayVideoInHero: draft.autoplayVideoInHero,
    showMemberStats: draft.showMemberStats !== false,
    visiblePlanIds: draft.visiblePlanIds ?? [],
    planOrderIds: draft.planOrderIds ?? [],
    featuredPlanId: draft.featuredPlanId ?? null,
    plansLabel: draft.plansLabel.trim(),
    testimonialsLabel: draft.testimonialsLabel.trim(),
    testimonialsHeadline: draft.testimonialsHeadline.trim(),
    testimonials: sanitizePersistableTestimonials(draft.testimonials),
    faqLabel: draft.faqLabel.trim(),
    faqHeadline: draft.faqHeadline.trim(),
    faq: sanitizePersistableFaqItems(draft.faq),
  });
}

export function pageDraftsEqual(a: SetupPageDraft, b: SetupPageDraft): boolean {
  return normalizePageDraftForCompare(a) === normalizePageDraftForCompare(b);
}
