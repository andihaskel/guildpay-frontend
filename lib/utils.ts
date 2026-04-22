import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Rewrites legacy t3.storageapi.dev bucket URLs to the proxied /assets route.
// New uploads already return the correct api.accessgate.io/assets/... URL.
export function normalizeAssetUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const match = url.match(/^https:\/\/t3\.storageapi\.dev\/[^/]+\/(.+)$/);
  if (match) return `${API_BASE}/assets/${match[1]}`;
  return url;
}
