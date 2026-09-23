import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { convertFormat, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface FormatConverterPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const FormatConverterPanel: React.FC<FormatConverterPanelProps> = ({ imageInfo, onReset }) => {
  const [targetFormat, setTargetFormat] = useState<string>('image/webp');
  const [quality, setQuality] = useState<number>(85);
  const [convertedDataUrl, setConvertedDataUrl] = useState<string>('');
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  const formats = [
    { mime: 'image/webp', name: 'WebP', desc: 'Modern high compression' },
    { mime: 'image/jpeg', name: 'JPG / JPEG', desc: 'Universal compatibility' },
    { mime: 'image/png', name: 'PNG', desc: 'Lossless fidelity' },
  ];

  useEffect(() => {
    let isCancelled = false;
    const runConversion = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await convertFormat(img, targetFormat, quality / 100, '#FFFFFF');
        if (!isCancelled) {
          setConvertedDataUrl(result.dataUrl);
          setConvertedSize(result.size);
          setConvertedBlob(result.blob);
        }
      } catch (err) {
        console.error('Format conversion error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runConversion, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, targetFormat, quality]);

  const handleDownload = () => {
    if (!convertedBlob) return;
    const ext = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/png' ? 'png' : 'jpg';
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(convertedBlob, `${baseName}-converted.${ext}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            Universal Image Format Converter
          </h4>
          <p className="text-xs text-zinc-500">
            Source format: {imageInfo.type || 'image/unknown'} &middot; {formatBytes(imageInfo.size)}
          </p>
        </div>

        {/* Target Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Choose Output Target Format:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {formats.map((fmt) => (
              <button
                key={fmt.mime}
                onClick={() => setTargetFormat(fmt.mime)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetFormat === fmt.mime
                    ? 'border-amber-500 ring-2 ring-amber-400/30 bg-white dark:bg-zinc-800 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/40 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-950 dark:text-white">{fmt.name}</span>
                  {targetFormat === fmt.mime && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">{fmt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quality control for lossy formats */}
        {targetFormat !== 'image/png' && (
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-700 dark:text-zinc-300">Output Encoding Quality</span>
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
        )}
      </div>

      {/* Comparison Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span>Original ({imageInfo.name.split('.').pop()?.toUpperCase()})</span>
            <span className="tabular-nums">{formatBytes(imageInfo.size)}</span>
          </div>
          <div className="h-[280px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            <img
              src={imageInfo.dataUrl}
              alt="Original"
              className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Converted ({targetFormat.split('/')[1].toUpperCase()})
            </span>
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
              {isProcessing ? 'Converting...' : formatBytes(convertedSize)}
            </span>
          </div>
          <div className="h-[280px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            {convertedDataUrl ? (
              <img
                src={convertedDataUrl}
                alt="Converted"
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
          disabled={!convertedBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download {targetFormat.split('/')[1].toUpperCase()} ({formatBytes(convertedSize)})</span>
        </button>
      </div>
    </div>
  );
};
