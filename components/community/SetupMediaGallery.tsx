'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { SetupMediaItem } from '@/components/community/setup-preview-types';
import {
  COMMUNITY_IMAGE_TYPES,
  isSupportedGalleryFile,
  isVideoFile,
  uploadCommunityGalleryMedia,
} from '@/lib/community-media-upload';
import type { ApiError } from '@/lib/types';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

function formatUploadError(err: unknown): string {
  const apiErr = err as ApiError;
  if (typeof apiErr?.message === 'string' && apiErr.message.trim()) return apiErr.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return 'Upload failed. Please try again.';
}

function getVideoDuration(file: File): Promise<string> {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const sec = Math.round(video.duration);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      URL.revokeObjectURL(video.src);
      resolve(`${m}:${String(s).padStart(2, '0')}`);
    };
    video.onerror = () => resolve('');
    video.src = URL.createObjectURL(file);
  });
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 16V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  );
}

function PlayIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5v14l12-7z" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M21 17l-5-5-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 4l-5 8 5 8M15 4l5 8-5 8M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MediaTile({
  item,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: SetupMediaItem;
  index: number;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
}) {
  const isCover = index === 0;
  const bgStyle = item.url
    ? undefined
    : { background: item.gradient ?? 'var(--surface-3)' };

  return (
    <div
      className="setup-media-tile"
      data-media-type={item.type}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      {item.url && item.type === 'image' ? (
        <img src={item.url} alt="" className="setup-media-tile-img" />
      ) : item.url && item.type === 'video' ? (
        <video src={item.url} className="setup-media-tile-img" muted playsInline />
      ) : (
        <div className="setup-media-tile-img" style={bgStyle} />
      )}

      {isCover ? (
        <span className="setup-media-tile-badge is-cover">
          <StarIcon />
          Cover
        </span>
      ) : item.type === 'video' ? (
        <span className="setup-media-tile-badge">
          <PlayIcon />
          {item.duration || 'Video'}
        </span>
      ) : (
        <span className="setup-media-tile-badge">
          <PhotoIcon />
          Photo
        </span>
      )}

      {item.type === 'video' ? (
        <span className="setup-media-tile-play">
          <PlayIcon size={14} />
        </span>
      ) : null}

      <div className="setup-media-tile-overlay" />
      <div className="setup-media-tile-actions">
        <button type="button" aria-label="Move" tabIndex={-1}>
          <MoveIcon />
        </button>
        <button type="button" aria-label="Remove" onClick={onRemove}>
          <RemoveIcon />
        </button>
      </div>
    </div>
  );
}

export type SetupMediaItemsUpdater =
  | SetupMediaItem[]
  | ((prev: SetupMediaItem[]) => SetupMediaItem[]);

export function SetupMediaGallery({
  items,
  autoplayVideoInHero,
  onItemsChange,
  onAutoplayChange,
  communityId,
}: {
  items: SetupMediaItem[];
  autoplayVideoInHero: boolean;
  onItemsChange: (update: SetupMediaItemsUpdater) => void;
  onAutoplayChange: (value: boolean) => void;
  communityId?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError(null);
      const pending: SetupMediaItem[] = [];
      const errors: string[] = [];
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      setUploading(true);
      try {
        for (const file of fileList) {
          if (!isSupportedGalleryFile(file)) {
            errors.push(`${file.name}: unsupported file type (use JPG, PNG, WebP, GIF, MP4, MOV, or WebM)`);
            continue;
          }

          const isVideo = isVideoFile(file);
          if (!isVideo && file.size > MAX_IMAGE_BYTES) {
            errors.push(`${file.name}: image must be 10 MB or smaller`);
            continue;
          }
          if (isVideo && file.size > MAX_VIDEO_BYTES) {
            errors.push(`${file.name}: video must be 80 MB or smaller`);
            continue;
          }

          if (!communityId) {
            const url = URL.createObjectURL(file);
            let duration: string | undefined;
            if (isVideo) {
              duration = await getVideoDuration(file);
            }
            pending.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              type: isVideo ? 'video' : 'image',
              url,
              filename: file.name,
              sizeBytes: file.size,
              duration: duration || undefined,
            });
            continue;
          }

          try {
            const durationPromise = isVideo ? getVideoDuration(file) : Promise.resolve(undefined);
            const url = await uploadCommunityGalleryMedia(communityId, file);
            const duration = (await durationPromise) || undefined;
            pending.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              type: isVideo ? 'video' : 'image',
              url,
              filename: file.name,
              sizeBytes: file.size,
              duration,
            });
          } catch (err) {
            errors.push(`${file.name}: ${formatUploadError(err)}`);
          }
        }

        if (pending.length > 0) {
          onItemsChange(prev => [...(prev ?? []), ...pending]);
        } else if (errors.length === 0) {
          errors.push('No files could be added. Try JPG, PNG, WebP, GIF, MP4, MOV, or WebM.');
        }
      } catch (err) {
        setUploadError(formatUploadError(err));
        return;
      } finally {
        setUploading(false);
      }

      if (errors.length > 0) {
        setUploadError(errors.join(' · '));
      }
    },
    [onItemsChange, communityId],
  );

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    dragIndexRef.current = index;
    onItemsChange(prev => {
      const list = prev ?? [];
      const reordered = [...list];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(index, 0, moved);
      return reordered;
    });
  };

  const handleDrop = () => {
    dragIndexRef.current = null;
  };

  const removeItem = (id: string) => {
    onItemsChange(prev => {
      const list = prev ?? [];
      const removed = list.find(i => i.id === id);
      if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      return list.filter(i => i.id !== id);
    });
  };

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <label
        className={`setup-media-dropzone${isDragOver ? ' is-drag' : ''}${uploading ? ' is-uploading' : ''}`}
        htmlFor={uploading ? undefined : inputId}
        onDragEnter={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          if (e.dataTransfer.files.length) void processFiles(e.dataTransfer.files);
        }}
      >
        <span className="setup-media-dropzone-icon">
          <UploadIcon />
        </span>
        <span className="setup-media-dropzone-title">
          {uploading ? (
            'Uploading…'
          ) : (
            <>
              Drop photos &amp; videos here, or <b>click to browse</b>
            </>
          )}
        </span>
        <span className="setup-media-dropzone-sub">
          {communityId
            ? 'JPG, PNG, WebP, GIF up to 10 MB · MP4, MOV, WebM up to 80 MB · Recommended 1600×900'
            : 'JPG, PNG, WebP up to 10 MB · MP4, MOV, WebM up to 80 MB · Recommended 1600×900'}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={`${COMMUNITY_IMAGE_TYPES.join(',')},video/*`}
          multiple
          className="setup-media-dropzone-input"
          disabled={uploading}
          onChange={e => {
            const selected = e.target.files ? Array.from(e.target.files) : [];
            e.target.value = '';
            if (selected.length) void processFiles(selected);
          }}
        />
      </label>
      {uploadError ? (
        <p style={{ fontSize: '12px', color: 'var(--danger, #ef4444)', margin: 0 }}>{uploadError}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="setup-media-grid">
          {items.map((item, index) => (
            <MediaTile
              key={item.id}
              item={item}
              index={index}
              onRemove={() => removeItem(item.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Drag tiles to reorder. The first item becomes the page cover.
        </span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoplayVideoInHero}
            onChange={e => onAutoplayChange(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Autoplay video in hero
        </label>
      </div>
    </div>
  );
}
