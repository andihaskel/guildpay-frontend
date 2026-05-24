import { Community } from '@/lib/types';
import type { ImageFrame } from '@/lib/image-frame';
import {
  SetupPageDraft,
  PageFaqItem,
  PageTestimonial,
} from '@/components/community/setup-preview-types';
import {
  sanitizePersistableFaqItems,
  sanitizePersistableTestimonials,
} from '@/components/community/page-content';
import { sanitizePersistableMediaItems } from '@/components/community/community-page-draft';

/** Payload shape for `settings.page` accepted by PUT /creator/communities/{id}. */
export type CommunityPageSettingsApiPayload = {
  accentColor?: string;
  coverImageUrl?: string;
  coverImageFrame?: ImageFrame;
  logoImageFrame?: ImageFrame;
  galleryLabel?: string;
  galleryHeadline?: string;
  galleryDescription?: string;
  mediaItems?: Array<{
    id: string;
    type: 'image' | 'video';
    url?: string;
    filename?: string;
    duration?: string;
  }>;
  autoplayVideoInHero?: boolean;
  showMemberStats?: boolean;
  visiblePlanIds?: string[];
  planOrderIds?: string[];
  featuredPlanId?: string | null;
  testimonialsLabel?: string;
  testimonialsHeadline?: string;
  testimonials?: Array<{
    id: string;
    quote: string;
    author: string;
    since?: string;
  }>;
  faqLabel?: string;
  faqHeadline?: string;
  faq?: Array<{
    id: string;
    q: string;
    a: string;
  }>;
};

export type UpdateCommunityPageRequest = {
  name?: string;
  tagline?: string;
  logo_url?: string;
  settings?: {
    page?: CommunityPageSettingsApiPayload;
    [key: string]: unknown;
  };
};

function toApiMediaItems(items: SetupPageDraft['mediaItems']) {
  return sanitizePersistableMediaItems(items).map(item => ({
    id: item.id,
    type: item.type,
    url: item.url,
    ...(item.filename ? { filename: item.filename } : {}),
    ...(item.duration ? { duration: item.duration } : {}),
  }));
}

function toApiTestimonials(items: PageTestimonial[]) {
  return sanitizePersistableTestimonials(items).map(item => ({
    id: item.id,
    quote: item.quote,
    author: item.author,
    ...(item.since ? { since: item.since } : {}),
  }));
}

function toApiFaqItems(items: PageFaqItem[]) {
  return sanitizePersistableFaqItems(items).map(item => ({
    id: item.id,
    q: item.q,
    a: item.a,
  }));
}

export function buildCommunityPageSettingsPayload(
  draft: SetupPageDraft,
): CommunityPageSettingsApiPayload {
  return {
    accentColor: draft.accentColor,
    coverImageUrl: draft.coverImageUrl,
    coverImageFrame: draft.coverImageFrame,
    logoImageFrame: draft.logoImageFrame,
    galleryLabel: draft.galleryLabel.trim(),
    galleryHeadline: draft.galleryHeadline.trim(),
    galleryDescription: draft.galleryDescription.trim(),
    mediaItems: toApiMediaItems(draft.mediaItems),
    autoplayVideoInHero: draft.autoplayVideoInHero,
    showMemberStats: draft.showMemberStats,
    visiblePlanIds: draft.visiblePlanIds,
    planOrderIds: draft.planOrderIds,
    featuredPlanId: draft.featuredPlanId ?? null,
    testimonialsLabel: draft.testimonialsLabel.trim(),
    testimonialsHeadline: draft.testimonialsHeadline.trim(),
    testimonials: toApiTestimonials(draft.testimonials),
    faqLabel: draft.faqLabel.trim(),
    faqHeadline: draft.faqHeadline.trim(),
    faq: toApiFaqItems(draft.faq),
  };
}

export function buildUpdateCommunityPageRequest(
  community: Community,
  draft: SetupPageDraft,
): UpdateCommunityPageRequest {
  const existing =
    community.settings && typeof community.settings === 'object' ? community.settings : {};

  return {
    name: draft.communityName.trim(),
    tagline: draft.subHeadline.trim(),
    logo_url: draft.logoUrl ?? '',
    settings: {
      ...existing,
      page: buildCommunityPageSettingsPayload(draft),
    },
  };
}
