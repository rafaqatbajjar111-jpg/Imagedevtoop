/**
 * Client-side HTML5 Canvas utilities for ImageToolBox
 * 100% in-browser processing via Canvas, Blob, and File APIs.
 */

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to decode image: ' + String(err)));
    img.src = src;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

/**
 * High-quality canvas compression
 */
export async function compressImage(
  img: HTMLImageElement,
  targetMimeType = 'image/jpeg',
  quality = 0.8
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  // If compressing to JPEG, fill background with white to avoid black transparency
  if (targetMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas compression failed to generate blob'));
        const dataUrl = canvas.toDataURL(targetMimeType, quality);
        resolve({ blob, dataUrl, size: blob.size });
      },
      targetMimeType,
      quality
    );
  });
}

/**
 * Resize image with step-down multi-pass if scaling down by more than 50%
 */
export async function resizeImage(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  mimeType = 'image/png',
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  let currentW = img.naturalWidth || img.width;
  let currentH = img.naturalHeight || img.height;

  // For high-quality downsampling, use an offscreen canvas
  let canvas = document.createElement('canvas');
  canvas.width = currentW;
  canvas.height = currentH;
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  ctx.drawImage(img, 0, 0, currentW, currentH);

  // Halve iteratively if target is significantly smaller for smoother rendering
  while (currentW * 0.5 > targetW && currentH * 0.5 > targetH) {
    const nextW = Math.floor(currentW * 0.5);
    const nextH = Math.floor(currentH * 0.5);
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d');
    if (!nextCtx) break;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(canvas, 0, 0, currentW, currentH, 0, 0, nextW, nextH);

    canvas = nextCanvas;
    ctx = nextCtx;
    currentW = nextW;
    currentH = nextH;
  }

  // Final draw to exact target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = Math.max(1, Math.round(targetW));
  finalCanvas.height = Math.max(1, Math.round(targetH));
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) throw new Error('Could not acquire 2D canvas context');

  if (mimeType === 'image/jpeg') {
    finalCtx.fillStyle = '#FFFFFF';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  }

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(canvas, 0, 0, currentW, currentH, 0, 0, finalCanvas.width, finalCanvas.height);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Resize blob failed'));
        const dataUrl = finalCanvas.toDataURL(mimeType, quality);
        resolve({ blob, dataUrl, size: blob.size });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Format converter with optional background fill color for transparent PNG to JPG
 */
export async function convertFormat(
  img: HTMLImageElement,
  targetMime: string,
  quality = 0.9,
  bgColor = '#FFFFFF'
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failure');

  if (targetMime === 'image/jpeg' || bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Format conversion failed'));
        const dataUrl = canvas.toDataURL(targetMime, quality);
        resolve({ blob, dataUrl, size: blob.size });
      },
      targetMime,
      quality
    );
  });
}

/**
 * Interactive crop utility
 */
export async function cropImage(
  img: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  mimeType = 'image/png',
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  const canvas = document.createElement('canvas');
  const cw = Math.max(1, Math.round(crop.width));
  const ch = Math.max(1, Math.round(crop.height));
  canvas.width = cw;
  canvas.height = ch;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failure');

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cw, ch);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    Math.round(crop.x),
    Math.round(crop.y),
    cw,
    ch,
    0,
    0,
    cw,
    ch
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Cropping failed to output blob'));
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({ blob, dataUrl, size: blob.size });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Rotate & Flip utility
 */
export async function rotateImage(
  img: HTMLImageElement,
  angleDeg: number,
  flipH: boolean,
  flipV: boolean,
  mimeType = 'image/png',
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Normalize angle between 0 and 359
  const normalizedAngle = ((angleDeg % 360) + 360) % 360;
  const rad = (normalizedAngle * Math.PI) / 180;

  // Calculate new bounding box dimensions
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.round(origW * cos + origH * sin);
  const newH = Math.round(origW * sin + origH * cos);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, newW);
  canvas.height = Math.max(1, newH);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failure');

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Move origin to center of rotated canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Rotate failed'));
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({ blob, dataUrl, size: blob.size });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Favicon Generator: creates standard sizes 16x16, 32x32, 48x48, 180x180
 */
export async function generateFaviconSizes(
  img: HTMLImageElement,
  sizes = [16, 32, 48, 180]
): Promise<Array<{ size: number; blob: Blob; dataUrl: string; byteSize: number }>> {
  const results: Array<{ size: number; blob: Blob; dataUrl: string; byteSize: number }> = [];

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const minDim = Math.min(srcW, srcH);
  const srcX = (srcW - minDim) / 2;
  const srcY = (srcH - minDim) / 2;

  for (const s of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Center crop square into favicon
    ctx.drawImage(img, srcX, srcY, minDim, minDim, 0, 0, s, s);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Favicon blob error'))), 'image/png');
    });

    results.push({
      size: s,
      blob,
      dataUrl: canvas.toDataURL('image/png'),
      byteSize: blob.size,
    });
  }

  return results;
}

/**
 * Read File as Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a clean high-resolution sample graphic file for quick in-browser testing
 */
export async function createSampleImage(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context missing');

  // Vibrant aesthetic backdrop: warm sunset gradient
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, '#F59E0B');
  grad.addColorStop(0.4, '#EF4444');
  grad.addColorStop(0.8, '#8B5CF6');
  grad.addColorStop(1, '#3B82F6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Geometric abstract accents
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(300, 250, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.roundRect(500, 350, 550, 320, 24);
  ctx.fill();

  // Glass card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(140, 420, 480, 260, 20);
  ctx.fill();

  // Text on card
  ctx.fillStyle = '#09090B';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillText('ImageToolBox', 180, 490);

  ctx.fillStyle = '#52525B';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Sample Test Image · 1200 × 800', 180, 530);

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(180, 570, 160, 44, 8);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('100% Client-Side', 198, 598);

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
  return new File([blob], 'sample-imagetoolbox.png', { type: 'image/png' });
}
