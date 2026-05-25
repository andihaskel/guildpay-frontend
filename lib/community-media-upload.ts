import { api } from '@/lib/api';
import { compressImage } from '@/lib/compress-image';
import type { ApiError } from '@/lib/types';
import { normalizeAssetUrl } from '@/lib/utils';

export const COMMUNITY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const COMMUNITY_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;

function fileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function normalizeVideoMime(type: string, filename: string): string | null {
  const normalized = type.toLowerCase().trim();
  switch (normalized) {
    case 'video/mp4':
    case 'video/x-m4v':
      return 'video/mp4';
    case 'video/quicktime':
      return 'video/quicktime';
    case 'video/webm':
      return 'video/webm';
    default:
      break;
  }
  switch (fileExtension(filename)) {
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    default:
      return null;
  }
}

function normalizeImageMime(type: string, filename: string): string | null {
  const normalized = type.toLowerCase().trim();
  if (normalized === 'image/jpg' || normalized === 'image/pjpeg') return 'image/jpeg';
  if (COMMUNITY_IMAGE_TYPES.includes(normalized as (typeof COMMUNITY_IMAGE_TYPES)[number])) {
    return normalized;
  }
  switch (fileExtension(filename)) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
}

export function isUploadableImageFile(file: File): boolean {
  if (file.type.startsWith('video/')) return false;
  return normalizeImageMime(file.type, file.name) != null;
}

function uploadErrorMessage(err: unknown): string {
  const apiErr = err as ApiError;
  if (apiErr?.statusCode === 401) {
    return 'Session expired. Please sign in again and retry.';
  }
  const raw =
    (typeof apiErr?.message === 'string' && apiErr.message.trim()) ||
    (typeof apiErr?.error === 'string' && apiErr.error.trim()) ||
    (err instanceof Error && err.message.trim()) ||
    '';
  if (raw.includes('content_type must be an image MIME type')) {
    return 'Video uploads are not enabled on the API yet. Deploy the latest backend or point NEXT_PUBLIC_API_URL to a local API with video presign support.';
  }
  if (raw) return raw;
  return 'Upload failed. Please try again.';
}

export async function uploadCommunityMedia(communityId: string, file: File): Promise<string> {
  if (!isUploadableImageFile(file)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are supported.');
  }

  let compressed;
  try {
    compressed = await compressImage(file);
  } catch {
    throw new Error('Could not read this image. Try JPG or PNG instead.');
  }

  if (!COMMUNITY_IMAGE_TYPES.includes(compressed.content_type as (typeof COMMUNITY_IMAGE_TYPES)[number])) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are supported.');
  }

  return presignAndUploadCommunityBlob(
    communityId,
    compressed.blob,
    compressed.filename,
    compressed.content_type,
  );
}

async function presignAndUploadCommunityBlob(
  communityId: string,
  blob: Blob,
  filename: string,
  contentType: string,
): Promise<string> {
  let presign: Awaited<ReturnType<typeof api.presignCommunityMedia>>;
  try {
    presign = await api.presignCommunityMedia(communityId, {
      filename,
      content_type: contentType,
    });
  } catch (err) {
    throw new Error(uploadErrorMessage(err));
  }

  const uploadHeaders: Record<string, string> = {
    ...(presign.headers ?? {}),
    'Content-Type': contentType,
  };

  let uploadResp: Response;
  try {
    uploadResp = await fetch(presign.upload_url, {
      method: presign.method || 'PUT',
      headers: uploadHeaders,
      body: blob,
    });
  } catch {
    throw new Error('Could not reach storage. Check your connection and try again.');
  }

  if (!uploadResp.ok) {
    throw new Error(`Upload failed with status ${uploadResp.status}`);
  }

  const assetUrl = normalizeAssetUrl(presign.asset_url) || presign.asset_url;
  if (!assetUrl.trim()) {
    throw new Error('Upload succeeded but no asset URL was returned.');
  }

  return assetUrl;
}

export async function uploadCommunityVideo(communityId: string, file: File): Promise<string> {
  const contentType = normalizeVideoMime(file.type, file.name);
  if (!contentType) {
    throw new Error('Only MP4, MOV, and WebM videos are supported.');
  }

  return presignAndUploadCommunityBlob(communityId, file, file.name, contentType);
}

export async function uploadCommunityGalleryMedia(communityId: string, file: File): Promise<string> {
  if (isVideoFile(file)) {
    return uploadCommunityVideo(communityId, file);
  }
  return uploadCommunityMedia(communityId, file);
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true;
  const ext = fileExtension(file.name);
  return ext === 'mp4' || ext === 'mov' || ext === 'webm' || ext === 'm4v';
}

export function isSupportedGalleryFile(file: File): boolean {
  return isVideoFile(file) || isUploadableImageFile(file);
}
