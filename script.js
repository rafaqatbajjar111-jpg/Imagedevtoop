/**
 * ImageToolBox - Vanilla JavaScript Core Engine
 * 100% Client-Side In-Browser Image Manipulation
 * Uses HTML5 Canvas API, File API, Blob API, and URL.createObjectURL()
 */

const ImageToolBoxEngine = {
  // 1. Image Compressor
  async compress(imageElement, mimeType = 'image/jpeg', quality = 0.8) {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    const ctx = canvas.getContext('2d');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL(mimeType, quality),
          size: blob ? blob.size : 0,
        });
      }, mimeType, quality);
    });
  },

  // 2. Image Resizer
  async resize(imageElement, targetWidth, targetHeight, mimeType = 'image/png', quality = 0.92) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(targetWidth));
    canvas.height = Math.max(1, Math.round(targetHeight));
    const ctx = canvas.getContext('2d');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL(mimeType, quality),
          size: blob ? blob.size : 0,
        });
      }, mimeType, quality);
    });
  },

  // 3. JPG to PNG Converter
  async jpgToPng(imageElement) {
    return this.convertFormat(imageElement, 'image/png', 1.0, 'transparent');
  },

  // 4. PNG to JPG Converter (with background color option)
  async pngToJpg(imageElement, bgColor = '#FFFFFF', quality = 0.9) {
    return this.convertFormat(imageElement, 'image/jpeg', quality, bgColor);
  },

  // 5. Image Cropper
  async crop(imageElement, cropRect, mimeType = 'image/png', quality = 0.92) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(cropRect.width));
    canvas.height = Math.max(1, Math.round(cropRect.height));
    const ctx = canvas.getContext('2d');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      imageElement,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL(mimeType, quality),
          size: blob ? blob.size : 0,
        });
      }, mimeType, quality);
    });
  },

  // 6. Image Rotator & Flipper
  async rotate(imageElement, angleDeg, flipH = false, flipV = false, mimeType = 'image/png') {
    const origW = imageElement.naturalWidth || imageElement.width;
    const origH = imageElement.naturalHeight || imageElement.height;
    const rad = ((angleDeg % 360) * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newW = Math.round(origW * cos + origH * sin);
    const newH = Math.round(origW * sin + origH * cos);

    const canvas = document.createElement('canvas');
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, -origW / 2, -origH / 2, origW, origH);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL(mimeType, 0.92),
          size: blob ? blob.size : 0,
        });
      }, mimeType, 0.92);
    });
  },

  // 7. Universal Format Converter
  async convertFormat(imageElement, targetMime, quality = 0.9, bgColor = '#FFFFFF') {
    const canvas = document.createElement('canvas');
    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (targetMime === 'image/jpeg' || (bgColor && bgColor !== 'transparent')) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, 0, 0, w, h);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL(targetMime, quality),
          size: blob ? blob.size : 0,
        });
      }, targetMime, quality);
    });
  },

  // 8. Favicon Generator (16x16, 32x32, 48x48)
  async generateFavicons(imageElement, sizes = [16, 32, 48, 180]) {
    const srcW = imageElement.naturalWidth || imageElement.width;
    const srcH = imageElement.naturalHeight || imageElement.height;
    const minDim = Math.min(srcW, srcH);
    const srcX = (srcW - minDim) / 2;
    const srcY = (srcH - minDim) / 2;

    const list = [];
    for (const size of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imageElement, srcX, srcY, minDim, minDim, 0, 0, size, size);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      list.push({
        size,
        blob,
        dataUrl: canvas.toDataURL('image/png'),
        byteSize: blob ? blob.size : 0,
      });
    }
    return list;
  },

  // 9. Read Metadata
  getMetadata(file, imageElement) {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      width: imageElement.naturalWidth || imageElement.width,
      height: imageElement.naturalHeight || imageElement.height,
      megapixels: (((imageElement.naturalWidth || 1) * (imageElement.naturalHeight || 1)) / 1000000).toFixed(2),
    };
  },

  // 10. Image to Base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Utility to download blob
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};

// Export to window
if (typeof window !== 'undefined') {
  window.ImageToolBoxEngine = ImageToolBoxEngine;
}
