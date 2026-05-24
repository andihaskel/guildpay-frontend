'use client';

import { DEFAULT_IMAGE_FRAME, imageFrameStyle, type ImageFrame } from '@/lib/image-frame';

type FramedImageProps = {
  src: string;
  alt?: string;
  frame?: ImageFrame;
  className?: string;
};

export function FramedImage({ src, alt = '', frame = DEFAULT_IMAGE_FRAME, className }: FramedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={imageFrameStyle(frame)} draggable={false} />
  );
}
