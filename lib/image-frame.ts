import type { CSSProperties } from 'react';

export type ImageFrame = {
  /** Zoom level (1 = default cover fit) */
  scale: number;
  /** Horizontal focal point 0–100 (object-position %) */
  x: number;
  /** Vertical focal point 0–100 (object-position %) */
  y: number;
};

export const DEFAULT_IMAGE_FRAME: ImageFrame = { scale: 1, x: 50, y: 50 };

export const IMAGE_FRAME_SCALE_MIN = 1;
export const IMAGE_FRAME_SCALE_MAX = 3;

export function clampImageFrame(frame: ImageFrame): ImageFrame {
  return {
    scale: Math.min(IMAGE_FRAME_SCALE_MAX, Math.max(IMAGE_FRAME_SCALE_MIN, frame.scale)),
    x: Math.min(100, Math.max(0, frame.x)),
    y: Math.min(100, Math.max(0, frame.y)),
  };
}

export function imageFrameStyle(frame: ImageFrame = DEFAULT_IMAGE_FRAME): CSSProperties {
  const f = clampImageFrame(frame);
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${f.x}% ${f.y}%`,
    transform: f.scale !== 1 ? `scale(${f.scale})` : undefined,
    transformOrigin: `${f.x}% ${f.y}%`,
  };
}
