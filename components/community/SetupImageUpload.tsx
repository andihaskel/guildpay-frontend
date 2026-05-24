'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FramedImage } from '@/components/community/FramedImage';
import { COMMUNITY_IMAGE_TYPES, uploadCommunityMedia } from '@/lib/community-media-upload';
import {
  clampImageFrame,
  DEFAULT_IMAGE_FRAME,
  IMAGE_FRAME_SCALE_MAX,
  IMAGE_FRAME_SCALE_MIN,
  type ImageFrame,
} from '@/lib/image-frame';

type SetupImageUploadProps = {
  communityId: string;
  variant: 'cover' | 'logo';
  label: string;
  hint?: string;
  value?: string;
  frame?: ImageFrame;
  onChange: (url: string | undefined) => void;
  onFrameChange?: (frame: ImageFrame) => void;
  fallback?: React.ReactNode;
};

function ZoomIcon({ direction }: { direction: 'in' | 'out' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      {direction === 'out' ? (
        <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function SetupImageUpload({
  communityId,
  variant,
  label,
  hint,
  value,
  frame = DEFAULT_IMAGE_FRAME,
  onChange,
  onFrameChange,
  fallback,
}: SetupImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(frame);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  frameRef.current = frame;

  const emitFrame = useCallback(
    (next: ImageFrame) => {
      onFrameChange?.(clampImageFrame(next));
    },
    [onFrameChange],
  );

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadCommunityMedia(communityId, file);
      onChange(url);
      emitFrame(DEFAULT_IMAGE_FRAME);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    emitFrame(DEFAULT_IMAGE_FRAME);
    setError(null);
  };

  const adjustZoom = (delta: number) => {
    emitFrame({ ...frame, scale: frame.scale + delta });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!value || !onFrameChange) return;
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || !onFrameChange) return;

    const rect = viewport.getBoundingClientRect();
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    dragRef.current = { x: e.clientX, y: e.clientY };

    const sensitivityX = 100 / Math.max(rect.width, 1);
    const sensitivityY = 100 / Math.max(rect.height, 1);
    const current = frameRef.current;

    emitFrame({
      ...current,
      x: current.x - dx * sensitivityX,
      y: current.y - dy * sensitivityY,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!value || !onFrameChange || !viewport) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const current = frameRef.current;
      emitFrame({ ...current, scale: current.scale + delta });
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [value, emitFrame, onFrameChange]);

  const slotClass =
    variant === 'cover' ? 'setup-hero-upload setup-hero-upload-cover' : 'setup-hero-upload setup-hero-upload-logo';

  return (
    <div className="setup-hero-upload-wrap">
      <div className={slotClass}>
        {value ? (
          <div
            ref={viewportRef}
            className={`setup-hero-upload-viewport${dragging ? ' is-dragging' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            title="Drag to reposition · Scroll to zoom"
          >
            <FramedImage src={value} frame={frame} className="setup-hero-upload-img" />
          </div>
        ) : (
          fallback
        )}

        {value && !uploading ? (
          <div className="setup-hero-upload-toolbar">
            <button
              type="button"
              className="setup-hero-upload-tool"
              onClick={() => adjustZoom(-0.15)}
              disabled={frame.scale <= IMAGE_FRAME_SCALE_MIN}
              aria-label="Zoom out"
            >
              <ZoomIcon direction="out" />
            </button>
            <span className="setup-hero-upload-zoom-label">{Math.round(frame.scale * 100)}%</span>
            <button
              type="button"
              className="setup-hero-upload-tool"
              onClick={() => adjustZoom(0.15)}
              disabled={frame.scale >= IMAGE_FRAME_SCALE_MAX}
              aria-label="Zoom in"
            >
              <ZoomIcon direction="in" />
            </button>
            <button
              type="button"
              className="setup-hero-upload-tool setup-hero-upload-tool-text"
              onClick={() => inputRef.current?.click()}
              aria-label={`Change ${label.toLowerCase()}`}
            >
              Change
            </button>
          </div>
        ) : !value ? (
          <button
            type="button"
            className="setup-hero-upload-overlay"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label={label}
            title={hint ?? label}
          >
            {uploading ? (
              <span className="setup-hero-upload-spinner" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Upload</span>
              </>
            )}
          </button>
        ) : (
          <div className="setup-hero-upload-overlay setup-hero-upload-overlay-busy" aria-hidden>
            <span className="setup-hero-upload-spinner" />
          </div>
        )}

        {value && !uploading ? (
          <button
            type="button"
            className="setup-hero-upload-remove"
            onClick={remove}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            ×
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={COMMUNITY_IMAGE_TYPES.join(',')}
        className="setup-visually-hidden"
        onChange={onInputChange}
      />
      {value ? (
        <p className="setup-hero-upload-hint">Drag to reposition · Scroll or use +/- to zoom</p>
      ) : null}
      {error ? <p className="setup-hero-upload-error">{error}</p> : null}
    </div>
  );
}
