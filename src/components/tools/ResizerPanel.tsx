import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { resizeImage, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, Lock, Unlock, Maximize2 } from 'lucide-react';

interface ResizerPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const ResizerPanel: React.FC<ResizerPanelProps> = ({ imageInfo, onReset }) => {
  const [width, setWidth] = useState<number>(imageInfo.width);
  const [height, setHeight] = useState<number>(imageInfo.height);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>('image/png');
  const [resizedDataUrl, setResizedDataUrl] = useState<string>('');
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const aspectRatio = imageInfo.width / Math.max(1, imageInfo.height);

  const handleWidthChange = (newW: number) => {
    const w = Math.max(1, Math.round(newW));
    setWidth(w);
    if (lockAspectRatio) {
      setHeight(Math.max(1, Math.round(w / aspectRatio)));
    }
  };

  const handleHeightChange = (newH: number) => {
    const h = Math.max(1, Math.round(newH));
    setHeight(h);
    if (lockAspectRatio) {
      setWidth(Math.max(1, Math.round(h * aspectRatio)));
    }
  };

  const applyPercentage = (pct: number) => {
    const w = Math.max(1, Math.round((imageInfo.width * pct) / 100));
    const h = Math.max(1, Math.round((imageInfo.height * pct) / 100));
    setWidth(w);
    setHeight(h);
  };

  const applyResolution = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspectRatio(false);
  };

  useEffect(() => {
    let isCancelled = false;
    const runResize = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await resizeImage(img, width, height, format, 0.92);
        if (!isCancelled) {
          setResizedDataUrl(result.dataUrl);
          setResizedSize(result.size);
          setResizedBlob(result.blob);
        }
      } catch (err) {
        console.error('Resize error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runResize, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, width, height, format]);

  const handleDownload = () => {
    if (!resizedBlob) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(resizedBlob, `${baseName}-${width}x${height}.${ext}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-500" />
              Dimensions & Aspect Ratio
            </h4>
            <p className="text-xs text-zinc-500">
              Original: {imageInfo.width} &times; {imageInfo.height} px ({formatBytes(imageInfo.size)})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Format:</span>
            <div className="flex rounded-xl p-1 bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold">
              {['image/png', 'image/jpeg', 'image/webp'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    format === fmt
                      ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {fmt.split('/')[1].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Width & Height Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Width (pixels)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10000"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">px</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Height (pixels)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10000"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">px</span>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Lock Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              lockAspectRatio
                ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
          </button>
        </div>

        {/* Scale Presets */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Scale Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {[25, 50, 75, 100, 150, 200].map((pct) => (
              <button
                key={pct}
                onClick={() => applyPercentage(pct)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Standard Resolutions:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '1920×1080 (FHD)', w: 1920, h: 1080 },
              { label: '1280×720 (HD)', w: 1280, h: 720 },
              { label: '1080×1080 (Square)', w: 1080, h: 1080 },
              { label: '800×600', w: 800, h: 600 },
              { label: '500×500', w: 500, h: 500 },
            ].map((res) => (
              <button
                key={res.label}
                onClick={() => applyResolution(res.w, res.h)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 transition-colors"
              >
                {res.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-100/50 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
          <span>Resized Output Preview</span>
          <span className="tabular-nums text-zinc-900 dark:text-white font-bold">
            {width} &times; {height} px &middot; {formatBytes(resizedSize)}
          </span>
        </div>
        <div className="min-h-[260px] max-h-[400px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
          {resizedDataUrl ? (
            <img
              src={resizedDataUrl}
              alt="Resized preview"
              className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="text-xs text-zinc-400">Rendering preview...</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Choose Different Image
        </button>

        <button
          onClick={handleDownload}
          disabled={!resizedBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Resized Image ({formatBytes(resizedSize)})</span>
        </button>
      </div>
    </div>
  );
};
