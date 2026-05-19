import { Community, CommunityChannel, CommunityPlan } from '@/lib/types';
import { planColor } from '@/components/community/setup-utils';
import { SetupPreviewModel } from '@/components/community/setup-preview-types';

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
    return JSON.parse(raw) as SetupPreviewModel;
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
    },
    plans,
    channels,
    selectedPlanId: selectedPlanId ?? plans[0]?.id ?? null,
    sellingPoints: DEFAULT_COMMUNITY_SELLING_POINTS,
    faq: DEFAULT_COMMUNITY_FAQ,
    testimonials: DEFAULT_COMMUNITY_TESTIMONIALS,
  };
}
