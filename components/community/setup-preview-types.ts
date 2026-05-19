import { CommunityChannel, CommunityPlan } from '@/lib/types';

export type SetupPreviewFaq = { q: string; a: string };
export type SetupPreviewTestimonial = { quote: string; author: string; since: string };

export type SetupPageDraft = {
  communityName: string;
  tagline: string;
  headline: string;
  subHeadline: string;
  accentColor: string;
};

export type SetupPreviewModel = {
  slug?: string;
  page: SetupPageDraft;
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  selectedPlanId: string | null;
  sellingPoints: string[];
  faq: SetupPreviewFaq[];
  testimonials: SetupPreviewTestimonial[];
};
