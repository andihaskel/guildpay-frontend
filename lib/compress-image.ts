const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.82;

export interface CompressedFile {
  blob: Blob;
  content_type: string;
  filename: string;
}

export async function compressImage(file: File): Promise<CompressedFile> {
  // GIFs: no recomprimir, devolver tal cual
  if (file.type === 'image/gif') {
    return { blob: file, content_type: file.type, filename: file.name };
  }

  // Videos: no comprimir
  if (file.type.startsWith('video/')) {
    return { blob: file, content_type: file.type, filename: file.name };
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D not available')); return; }
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP, fall back to JPEG
      const outputType = 'image/webp';
      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          const ext = outputType === 'image/webp' ? '.webp' : '.jpg';
          const base = file.name.replace(/\.[^.]+$/, '');
          resolve({ blob, content_type: outputType, filename: base + ext });
        },
        outputType,
        JPEG_QUALITY,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}
