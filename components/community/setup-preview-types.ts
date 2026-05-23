import { CommunityChannel, CommunityPlan } from '@/lib/types';

export type SetupPreviewFaq = { q: string; a: string };
export type SetupPreviewTestimonial = { quote: string; author: string; since: string };

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

export const DEFAULT_SETUP_MEDIA: SetupMediaItem[] = [
  {
    id: 'demo-1',
    type: 'image',
    gradient: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 60%, #db2777 100%)',
    filename: 'hero-gradient.jpg',
    sizeBytes: 1_200_000,
  },
  {
    id: 'demo-2',
    type: 'video',
    gradient: 'radial-gradient(ellipse at 30% 40%, #1f2937 0%, #0a0a0a 70%)',
    filename: 'intro-pitch.mp4',
    sizeBytes: 14_600_000,
    duration: '0:42',
  },
  {
    id: 'demo-3',
    type: 'image',
    gradient: 'linear-gradient(160deg, #2f9d6b 0%, #0891b2 100%)',
    filename: 'desk-shot.jpg',
    sizeBytes: 2_400_000,
  },
  {
    id: 'demo-4',
    type: 'image',
    gradient: 'linear-gradient(200deg, #d97706 0%, #dc2626 100%)',
    filename: 'chart-overlay.jpg',
    sizeBytes: 880_000,
  },
];

export type SetupPageDraft = {
  communityName: string;
  tagline: string;
  headline: string;
  subHeadline: string;
  accentColor: string;
  mediaItems: SetupMediaItem[];
  autoplayVideoInHero: boolean;
  /** Show “X online now · Y members” in the hero */
  showMemberStats?: boolean;
  /** Plan IDs shown on the public page, in display order */
  visiblePlanIds?: string[];
  /** Full plan order used in the Page → Plans picker */
  planOrderIds?: string[];
};

export type SetupPreviewModel = {
  slug?: string;
  page: SetupPageDraft;
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  selectedPlanId: string | null;
  planSellingPoints: Record<string, PlanSellingPoint[]>;
  faq: SetupPreviewFaq[];
  testimonials: SetupPreviewTestimonial[];
};
