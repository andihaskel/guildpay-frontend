import { api } from '@/lib/api';
import { compressImage } from '@/lib/compress-image';
import { normalizeAssetUrl } from '@/lib/utils';

export const COMMUNITY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export async function uploadCommunityMedia(communityId: string, file: File): Promise<string> {
  if (!COMMUNITY_IMAGE_TYPES.includes(file.type as (typeof COMMUNITY_IMAGE_TYPES)[number])) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are supported.');
  }

  const compressed = await compressImage(file);
  const presign = await api.presignCommunityMedia(communityId, {
    filename: compressed.filename,
    content_type: compressed.content_type,
  });

  const uploadResp = await fetch(presign.upload_url, {
    method: presign.method,
    headers: { 'Content-Type': compressed.content_type },
    body: compressed.blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Upload failed with status ${uploadResp.status}`);
  }

  return normalizeAssetUrl(presign.asset_url) || presign.asset_url;
}
