import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { convertFormat, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, Palette, CheckCircle2, ArrowRight } from 'lucide-react';

interface PngToJpgPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const PngToJpgPanel: React.FC<PngToJpgPanelProps> = ({ imageInfo, onReset }) => {
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [quality, setQuality] = useState<number>(90);
  const [jpgDataUrl, setJpgDataUrl] = useState<string>('');
  const [jpgSize, setJpgSize] = useState<number>(0);
  const [jpgBlob, setJpgBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  const colorPresets = [
    { label: 'Pure White', hex: '#FFFFFF' },
    { label: 'Soft Gray', hex: '#F4F4F5' },
    { label: 'Dark Slate', hex: '#18181B' },
    { label: 'Deep Black', hex: '#000000' },
    { label: 'Warm Cream', hex: '#FAF5EE' },
    { label: 'Yellow Pop', hex: '#FBBF24' },
  ];

  useEffect(() => {
    let isCancelled = false;
    const runConversion = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await convertFormat(img, 'image/jpeg', quality / 100, bgColor);
        if (!isCancelled) {
          setJpgDataUrl(result.dataUrl);
          setJpgSize(result.size);
          setJpgBlob(result.blob);
        }
      } catch (err) {
        console.error('PNG to JPG error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runConversion, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, bgColor, quality]);

  const handleDownload = () => {
    if (!jpgBlob) return;
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(jpgBlob, `${baseName}-converted.jpg`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              Background Fill & Quality
            </h4>
            <p className="text-xs text-zinc-500">
              JPG doesn't support transparency. Transparent PNG pixels will fill with this color.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
            <span className="text-zinc-600 dark:text-zinc-300 uppercase">PNG</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 uppercase font-black">JPG</span>
          </div>
        </div>

        {/* Color Presets & Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Background Color for Transparent Areas
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {colorPresets.map((preset) => (
              <button
                key={preset.hex}
                onClick={() => setBgColor(preset.hex)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  bgColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.label}</span>
              </button>
            ))}

            {/* Custom Color Input */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
              <span className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Quality Slider */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">JPG Compression Quality</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-bold tabular-nums">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-amber-500"
          />
        </div>
      </div>

      {/* Live Preview Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source PNG with checkered pattern */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span>Original PNG (Transparency)</span>
            <span className="tabular-nums">{formatBytes(imageInfo.size)}</span>
          </div>
          <div
            className="h-[280px] flex items-center justify-center rounded-xl p-2 overflow-hidden shadow-inner"
            style={{
              backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <img
              src={imageInfo.dataUrl}
              alt="Source PNG"
              className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Converted JPG with background color applied */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Resulting JPG (Filled Background)
            </span>
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
              {isProcessing ? 'Rendering...' : formatBytes(jpgSize)}
            </span>
          </div>
          <div className="h-[280px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            {jpgDataUrl ? (
              <img
                src={jpgDataUrl}
                alt="Converted JPG"
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <span className="text-xs text-zinc-400">Rendering preview...</span>
            )}
          </div>
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
          disabled={!jpgBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download JPG Image ({formatBytes(jpgSize)})</span>
        </button>
      </div>
    </div>
  );
};
