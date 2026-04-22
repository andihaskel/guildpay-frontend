const MAX_WIDTH = 1600;
const QUALITY = 0.82;

export interface CompressedFile {
  blob: Blob;
  content_type: string;
  filename: string;
}

function replaceExt(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, '') + ext;
}

function tryBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<CompressedFile> {
  if (file.type === 'image/gif' || file.type.startsWith('video/')) {
    return { blob: file, content_type: file.type, filename: file.name };
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
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

      // Try WebP first, fall back to JPEG
      let blob = await tryBlob(canvas, 'image/webp', QUALITY);
      let contentType = 'image/webp';
      let ext = '.webp';

      if (!blob) {
        blob = await tryBlob(canvas, 'image/jpeg', QUALITY);
        contentType = 'image/jpeg';
        ext = '.jpg';
      }

      if (!blob) { reject(new Error('Canvas toBlob failed')); return; }

      resolve({ blob, content_type: contentType, filename: replaceExt(file.name, ext) });
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}
