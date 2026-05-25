import { CommunityChannel, CommunityPlan } from '@/lib/types';
import type { ImageFrame } from '@/lib/image-frame';

export type PageTestimonial = {
  id: string;
  quote: string;
  author: string;
  since: string;
};

export type PageFaqItem = {
  id: string;
  q: string;
  a: string;
};

export const DEFAULT_TESTIMONIALS_LABEL = 'Testimonials';
export const DEFAULT_TESTIMONIALS_HEADLINE = 'What members are saying';
export const DEFAULT_FAQ_LABEL = 'Common questions';
export const DEFAULT_FAQ_HEADLINE = 'Everything you need to know';
export const DEFAULT_PLANS_LABEL = 'Choose a plan';

export type PlanSellingPoint = {
  id: string;
  icon: string;
  title: string;
  description?: string;
};

export type SetupMediaItem = {
  id: string;
  type: 'image' | 'video';
  url?: string;
  gradient?: string;
  filename: string;
  sizeBytes?: number;
  duration?: string;
};

export const DEFAULT_GALLERY_LABEL = 'Inside the community';
export const DEFAULT_GALLERY_HEADLINE = "A peek at what's inside";
export const DEFAULT_GALLERY_DESCRIPTION =
  "Streams, behind-the-scenes clips, screenshots, and the kind of stuff you won't find anywhere else.";

export type SetupPageDraft = {
  communityName: string;
  tagline: string;
  headline: string;
  subHeadline: string;
  accentColor: string;
  coverImageUrl?: string;
  coverImageFrame?: ImageFrame;
  logoUrl?: string;
  logoImageFrame?: ImageFrame;
  galleryLabel: string;
  galleryHeadline: string;
  galleryDescription: string;
  mediaItems: SetupMediaItem[];
  autoplayVideoInHero: boolean;
  /** Show “X online now · Y members” in the hero */
  showMemberStats?: boolean;
  /** Plan IDs shown on the public page, in display order */
  visiblePlanIds?: string[];
  /** Full plan order used in the Page → Plans picker */
  planOrderIds?: string[];
  /** Plan shown with the “Most popular” badge on the public page (optional) */
  featuredPlanId?: string | null;
  plansLabel: string;
  testimonialsLabel: string;
  testimonialsHeadline: string;
  testimonials: PageTestimonial[];
  faqLabel: string;
  faqHeadline: string;
  faq: PageFaqItem[];
};

export type SetupPreviewModel = {
  slug?: string;
  page: SetupPageDraft;
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  selectedPlanId: string | null;
  planSellingPoints: Record<string, PlanSellingPoint[]>;
};
