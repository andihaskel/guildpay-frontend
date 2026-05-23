import { Community, CommunityChannel, CommunityPlan } from '@/lib/types';
import { planColor } from '@/components/community/setup-utils';
import {
  cloneDefaultSellingPoints,
  normalizePlanSellingPoints,
} from '@/components/community/plan-selling-points';
import { SetupPageDraft, SetupPreviewModel, DEFAULT_SETUP_MEDIA, PlanSellingPoint } from '@/components/community/setup-preview-types';

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
    if (!parsed.page.mediaItems?.length) {
      parsed.page.mediaItems = DEFAULT_SETUP_MEDIA;
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
    if (parsed.planSellingPoints) {
      parsed.planSellingPoints = Object.fromEntries(
        Object.entries(parsed.planSellingPoints).map(([planId, points]) => [
          planId,
          normalizePlanSellingPoints(points),
        ]),
      );
    }
    const legacy = parsed as SetupPreviewModel & { sellingPoints?: string[] };
    if (!parsed.planSellingPoints && parsed.plans?.length) {
      const fallback = legacy.sellingPoints
        ? normalizePlanSellingPoints(legacy.sellingPoints)
        : cloneDefaultSellingPoints();
      parsed.planSellingPoints = Object.fromEntries(
        parsed.plans.map(plan => [plan.id, cloneDefaultSellingPoints(plan.id)]),
      );
      if (legacy.sellingPoints?.length) {
        parsed.planSellingPoints[parsed.plans[0].id] = fallback;
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
  return {
    slug: community.slug,
    page: {
      communityName: community.name,
      tagline: community.tagline || 'Daily signals + live sessions',
      headline: 'Trade alongside a proven desk.',
      subHeadline: 'Real-time alerts, weekly sessions, and a no-noise Discord. Cancel anytime.',
      accentColor: planColor(community.name),
      mediaItems: DEFAULT_SETUP_MEDIA,
      autoplayVideoInHero: true,
      showMemberStats: true,
    },
    plans,
    channels,
    selectedPlanId: selectedPlanId ?? plans[0]?.id ?? null,
    planSellingPoints: Object.fromEntries(
      plans.map(plan => [plan.id, cloneDefaultSellingPoints(plan.id)]),
    ),
    faq: DEFAULT_COMMUNITY_FAQ,
    testimonials: DEFAULT_COMMUNITY_TESTIMONIALS,
  };
}
