import type { ImageFrame } from '@/lib/image-frame';

export type PublicPageMediaItem = {
  id: string;
  type: 'image' | 'video';
  url?: string;
  gradient?: string;
  bgIndex?: number;
  caption?: string;
  duration?: string;
  wide?: boolean;
  tall?: boolean;
};

export type PublicPageFeature = {
  id?: string;
  icon: string;
  title: string;
  description?: string;
};

export type PublicPagePlanOption = {
  id: string;
  name: string;
  description?: string;
  amount: string;
  period: string;
  strikeAmount?: string;
  tag?: string;
  tagVariant?: 'popular' | 'save';
  subHtml?: string;
  ctaLabel: string;
};

export type PublicPagePerk = {
  type: 'discord' | 'telegram' | 'check';
  label: string;
  muted?: string;
};

export type PublicPageTestimonial = {
  quote: string;
  author: string;
  role: string;
  initials: string;
  avatarGradient: string;
};

export type PublicPageFaqItem = {
  q: string;
  a: string;
};

export type CommunityPublicPageViewProps = {
  accentColor?: string;
  compact?: boolean;
  communityName: string;
  handle?: string;
  tagline?: string;
  heroImageUrl?: string;
  heroImageFrame?: ImageFrame;
  coverImageUrl?: string;
  coverImageFrame?: ImageFrame;
  avatarInitial?: string;
  onlineCount?: number;
  memberCount?: number;
  showMemberStats?: boolean;
  sinceLabel?: string;
  mediaItems?: PublicPageMediaItem[];
  galleryLabel?: string;
  galleryHeadline?: string;
  galleryDescription?: string;
  galleryCountLabel?: string;
  features?: PublicPageFeature[];
  plans?: PublicPagePlanOption[];
  selectedPlanId?: string;
  onSelectPlan?: (id: string) => void;
  priceSubHtml?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  perks?: PublicPagePerk[];
  testimonials?: PublicPageTestimonial[];
  faq?: PublicPageFaqItem[];
  emptyPlansMessage?: string;
  showFooterLinks?: boolean;
  showTopChrome?: boolean;
  interactive?: boolean;
};

export const GALLERY_BG_GRADIENTS: Record<number, string> = {
  1: 'radial-gradient(circle at 30% 30%, #5865f2 0%, #1a1a2e 55%, #0a0a0a 100%)',
  2: 'linear-gradient(135deg, #1a1a2e 0%, #4752c4 60%, #0a0a0a 100%)',
  3: 'radial-gradient(circle at 70% 60%, #8b5cf6 0%, #3b1e5e 45%, #0a0a0a 100%)',
  4: 'linear-gradient(160deg, #0a0a0a 0%, #1e3a8a 55%, #5865f2 100%)',
  5: 'radial-gradient(circle at 50% 100%, #f97316 0%, #7c2d12 45%, #0a0a0a 100%)',
  6: 'linear-gradient(135deg, #064e3b 0%, #10b981 50%, #0a0a0a 100%)',
  7: 'radial-gradient(circle at 20% 80%, #ec4899 0%, #500724 50%, #0a0a0a 100%)',
  8: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 100%)',
};
