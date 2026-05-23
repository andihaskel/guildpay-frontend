'use client';

import { useCallback, useRef, useState } from 'react';
import { SetupMediaItem } from '@/components/community/setup-preview-types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

function formatFileSize(bytes?: number) {
  if (bytes == null) return '';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
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
        <img src={item.url} alt={item.filename} className="setup-media-tile-img" />
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
      <div className="setup-media-tile-meta">
        <span>{item.filename}</span>
        <span>{formatFileSize(item.sizeBytes)}</span>
      </div>
    </div>
  );
}

export function SetupMediaGallery({
  items,
  autoplayVideoInHero,
  onItemsChange,
  onAutoplayChange,
}: {
  items: SetupMediaItem[];
  autoplayVideoInHero: boolean;
  onItemsChange: (items: SetupMediaItem[]) => void;
  onAutoplayChange: (value: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const next = [...items];
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith('video/');
        if (!isVideo && !ALLOWED_IMAGE_TYPES.includes(file.type)) continue;
        if (!isVideo && file.size > MAX_IMAGE_BYTES) continue;
        if (isVideo && file.size > MAX_VIDEO_BYTES) continue;

        const url = URL.createObjectURL(file);
        let duration: string | undefined;
        if (isVideo) {
          duration = await getVideoDuration(file);
        }

        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: isVideo ? 'video' : 'image',
          url,
          filename: file.name,
          sizeBytes: file.size,
          duration: duration || undefined,
        });
      }
      if (next.length !== items.length) onItemsChange(next);
    },
    [items, onItemsChange],
  );

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    dragIndexRef.current = index;
    onItemsChange(reordered);
  };

  const handleDrop = () => {
    dragIndexRef.current = null;
  };

  const removeItem = (id: string) => {
    const removed = items.find(i => i.id === id);
    if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url);
    onItemsChange(items.filter(i => i.id !== id));
  };

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <label
        className={`setup-media-dropzone${isDragOver ? ' is-drag' : ''}`}
        htmlFor="setup-media-file-input"
        onDragEnter={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length) void processFiles(e.dataTransfer.files);
        }}
      >
        <span className="setup-media-dropzone-icon">
          <UploadIcon />
        </span>
        <span className="setup-media-dropzone-title">
          Drop photos &amp; videos here, or <b>click to browse</b>
        </span>
        <span className="setup-media-dropzone-sub">
          JPG, PNG, WebP up to 10 MB · MP4, MOV up to 80 MB · Recommended 1600×900
        </span>
        <input
          ref={inputRef}
          id="setup-media-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/*"
          multiple
          className="setup-visually-hidden"
          onChange={e => {
            const files = e.target.files;
            e.target.value = '';
            if (files?.length) void processFiles(files);
          }}
        />
      </label>

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
          <button type="button" className="setup-media-tile-add" onClick={() => inputRef.current?.click()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add more
          </button>
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
