import {
  PageFaqItem,
  PageTestimonial,
} from '@/components/community/setup-preview-types';
import {
  DEFAULT_COMMUNITY_FAQ,
  DEFAULT_COMMUNITY_TESTIMONIALS,
} from '@/components/community/community-preview';

export function createPageContentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultPageTestimonials(): PageTestimonial[] {
  return DEFAULT_COMMUNITY_TESTIMONIALS.map(item => ({
    id: createPageContentId(),
    quote: item.quote,
    author: item.author,
    since: item.since,
  }));
}

export function defaultPageFaqItems(): PageFaqItem[] {
  return DEFAULT_COMMUNITY_FAQ.map(item => ({
    id: createPageContentId(),
    q: item.q,
    a: item.a,
  }));
}

export function normalizePageTestimonials(raw: unknown): PageTestimonial[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const quote = typeof record.quote === 'string' ? record.quote.trim() : '';
      const author = typeof record.author === 'string' ? record.author.trim() : '';
      if (!quote || !author) return null;
      return {
        id: typeof record.id === 'string' && record.id ? record.id : createPageContentId(),
        quote,
        author,
        since: typeof record.since === 'string' ? record.since.trim() : '',
      } satisfies PageTestimonial;
    })
    .filter((item): item is PageTestimonial => item != null);
}

export function normalizePageFaqItems(raw: unknown): PageFaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const q = typeof record.q === 'string' ? record.q.trim() : '';
      const a = typeof record.a === 'string' ? record.a.trim() : '';
      if (!q || !a) return null;
      return {
        id: typeof record.id === 'string' && record.id ? record.id : createPageContentId(),
        q,
        a,
      } satisfies PageFaqItem;
    })
    .filter((item): item is PageFaqItem => item != null);
}

export function sanitizePersistableTestimonials(items: PageTestimonial[]): PageTestimonial[] {
  return normalizePageTestimonials(items);
}

export function sanitizePersistableFaqItems(items: PageFaqItem[]): PageFaqItem[] {
  return normalizePageFaqItems(items);
}
