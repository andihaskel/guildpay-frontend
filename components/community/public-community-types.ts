import { CommunityPlan } from '@/lib/types';
import { StoredCommunityPageSettings } from '@/components/community/community-page-draft';
import { SetupMediaItem } from '@/components/community/setup-preview-types';
import { PublicPageMediaItem } from '@/components/community/community-public-page-types';
import type { ImageFrame } from '@/lib/image-frame';

export type PublicCommunityPageMediaItem = {
  id: string;
  type: string;
  url?: string;
  gradient?: string;
  filename?: string;
  duration?: string;
};

export type PublicCommunityPageSettings = StoredCommunityPageSettings & {
  mediaItems?: PublicCommunityPageMediaItem[];
};

export type PublicCommunityPlan = {
  id: string;
  plan_slug: string;
  offer_name: string;
  hero_image_url?: string;
  cover_url?: string;
  description?: unknown;
  features?: Array<{ id: string; icon: string; title: string; description?: string }> | unknown;
  media_items?: Array<{ id?: string; type: string; url?: string }>;
  media_gallery_enabled?: boolean;
  monthly_amount_minor: number;
  yearly_amount_minor?: number | null;
  trial_days?: number | null;
  currency: string;
  accepts_signups: boolean;
  has_yearly: boolean;
};

export type PublicCommunityResponse = {
  creator_slug: string;
  community_slug: string;
  community_name: string;
  tagline?: string;
  logo_url?: string;
  page?: PublicCommunityPageSettings;
  plans: PublicCommunityPlan[];
};

export function isPublicCommunityResponse(data: unknown): data is PublicCommunityResponse {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return typeof record.community_name === 'string' && Array.isArray(record.plans);
}

export function draftMediaToPublicItems(items: SetupMediaItem[] | PublicCommunityPageMediaItem[]): PublicPageMediaItem[] {
  return items
    .filter(item => item.url || item.gradient)
    .map((item, index) => ({
      id: item.id,
      type: item.type === 'video' ? 'video' : 'image',
      url: item.url,
      gradient: item.gradient,
      bgIndex: (index % 8) + 1,
      caption: item.filename?.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      duration: item.duration,
      wide: index === 0 || index === 3 || index === 7,
      tall: index === 0,
    }));
}

export function publicCommunityPlanToCommunityPlan(plan: PublicCommunityPlan): CommunityPlan {
  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === 'string'
      ? []
      : [];

  return {
    id: plan.id,
    offer_name: plan.offer_name,
    description: typeof plan.description === 'string' ? plan.description : undefined,
    monthly_amount_minor: plan.monthly_amount_minor ?? 0,
    yearly_amount_minor: plan.yearly_amount_minor ?? undefined,
    one_time_amount_minor: undefined,
    currency: plan.currency || 'usd',
    trial_days: plan.trial_days ?? undefined,
    monthly_enabled: (plan.monthly_amount_minor ?? 0) > 0,
    annual_enabled: !!(plan.has_yearly && (plan.yearly_amount_minor ?? 0) > 0),
    billing_type: 'recurring',
    accepts_signups: plan.accepts_signups,
    features: features as CommunityPlan['features'],
    member_counts: { active: 0, trialing: 0, canceling: 0 },
    created_at: '',
    updated_at: '',
  };
}

export function parsePublicPageFrame(frame: unknown): ImageFrame | undefined {
  if (!frame || typeof frame !== 'object') return undefined;
  const f = frame as Record<string, unknown>;
  if (typeof f.scale !== 'number' || typeof f.x !== 'number' || typeof f.y !== 'number') return undefined;
  return { scale: f.scale, x: f.x, y: f.y };
}
