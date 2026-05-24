import { Community, CommunityPlan } from '@/lib/types';
import { DEFAULT_IMAGE_FRAME, type ImageFrame } from '@/lib/image-frame';
import { normalizeAssetUrl } from '@/lib/utils';
import {
  DEFAULT_SETUP_MEDIA,
  SetupMediaItem,
  SetupPageDraft,
} from '@/components/community/setup-preview-types';
import { mergePlanOrderIds, planColor } from '@/components/community/setup-utils';

const DEFAULT_SUB_HEADLINE =
  'Real-time alerts, weekly sessions, and a no-noise Discord. Cancel anytime.';

export type StoredCommunityPageSettings = {
  accentColor?: string;
  coverImageUrl?: string;
  coverImageFrame?: ImageFrame;
  logoImageFrame?: ImageFrame;
  mediaItems?: SetupMediaItem[];
  autoplayVideoInHero?: boolean;
  showMemberStats?: boolean;
  visiblePlanIds?: string[];
  planOrderIds?: string[];
  featuredPlanId?: string | null;
};

function readPageSettings(settings: Community['settings']): StoredCommunityPageSettings | null {
  if (!settings || typeof settings !== 'object') return null;
  const page = (settings as Record<string, unknown>).page;
  if (!page || typeof page !== 'object') return null;
  return page as StoredCommunityPageSettings;
}

export function stripBlobMediaItems(items: SetupMediaItem[]): SetupMediaItem[] {
  return items.filter(item => !item.url?.startsWith('blob:'));
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
    mediaItems: stored?.mediaItems?.length ? stored.mediaItems : DEFAULT_SETUP_MEDIA,
    autoplayVideoInHero: stored?.autoplayVideoInHero ?? true,
    showMemberStats: stored?.showMemberStats ?? true,
    visiblePlanIds,
    planOrderIds,
    featuredPlanId,
  };
}

export function buildCommunityPageUpdate(community: Community, draft: SetupPageDraft) {
  const existing =
    community.settings && typeof community.settings === 'object' ? community.settings : {};

  return {
    name: draft.communityName.trim(),
    tagline: draft.subHeadline.trim(),
    logo_url: draft.logoUrl ?? '',
    settings: {
      ...existing,
      page: {
        accentColor: draft.accentColor,
        coverImageUrl: draft.coverImageUrl,
        coverImageFrame: draft.coverImageFrame,
        logoImageFrame: draft.logoImageFrame,
        mediaItems: stripBlobMediaItems(draft.mediaItems),
        autoplayVideoInHero: draft.autoplayVideoInHero,
        showMemberStats: draft.showMemberStats,
        visiblePlanIds: draft.visiblePlanIds,
        planOrderIds: draft.planOrderIds,
        featuredPlanId: draft.featuredPlanId ?? null,
      } satisfies StoredCommunityPageSettings,
    },
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
    mediaItems: stripBlobMediaItems(draft.mediaItems),
    autoplayVideoInHero: draft.autoplayVideoInHero,
    showMemberStats: draft.showMemberStats !== false,
    visiblePlanIds: draft.visiblePlanIds ?? [],
    planOrderIds: draft.planOrderIds ?? [],
    featuredPlanId: draft.featuredPlanId ?? null,
  });
}

export function pageDraftsEqual(a: SetupPageDraft, b: SetupPageDraft): boolean {
  return normalizePageDraftForCompare(a) === normalizePageDraftForCompare(b);
}
