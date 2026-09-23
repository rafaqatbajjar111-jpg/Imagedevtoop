import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { compressImage, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';

interface CompressorPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const CompressorPanel: React.FC<CompressorPanelProps> = ({ imageInfo, onReset }) => {
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<string>('image/jpeg');
  const [compressedDataUrl, setCompressedDataUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const runCompression = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await compressImage(img, format, quality / 100);
        if (!isCancelled) {
          setCompressedDataUrl(result.dataUrl);
          setCompressedSize(result.size);
          setCompressedBlob(result.blob);
        }
      } catch (err) {
        console.error('Compression error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runCompression, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, quality, format]);

  const handleDownload = () => {
    if (!compressedBlob) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedBlob, `${baseName}-compressed.${ext}`);
  };

  const savingsPct = imageInfo.size > 0 && compressedSize > 0
    ? Math.round(((imageInfo.size - compressedSize) / imageInfo.size) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Compression Settings
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Adjust quality level to balance fidelity and file size reduction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Target:</span>
            <div className="flex rounded-xl p-1 bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold">
              {[
                { id: 'image/jpeg', label: 'JPG' },
                { id: 'image/webp', label: 'WebP' },
                { id: 'image/png', label: 'PNG' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    format === fmt.id
                      ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">Image Quality</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-bold tabular-nums">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>Smaller file (5%)</span>
            <span>Balanced (75%)</span>
            <span>Maximum fidelity (100%)</span>
          </div>
        </div>

        {/* Comparison Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">Original</p>
            <p className="text-base font-bold text-zinc-900 dark:text-white tabular-nums mt-0.5">
              {formatBytes(imageInfo.size)}
            </p>
            <p className="text-[11px] text-zinc-500">{imageInfo.width} &times; {imageInfo.height} px</p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">Compressed</p>
            <p className="text-base font-bold text-zinc-900 dark:text-white tabular-nums mt-0.5">
              {isProcessing ? 'Optimizing...' : formatBytes(compressedSize)}
            </p>
            <p className="text-[11px] text-zinc-500">{format.split('/')[1].toUpperCase()} @ {quality}%</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-300/80 dark:border-amber-700/40 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Size Reduction</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {savingsPct > 0 ? `-${savingsPct}%` : '0%'}
              </span>
              {savingsPct > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span>Original Photo</span>
            <span className="tabular-nums">{formatBytes(imageInfo.size)}</span>
          </div>
          <div className="flex-1 min-h-[240px] max-h-[360px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            <img
              src={imageInfo.dataUrl}
              alt="Original preview"
              className="max-h-[320px] max-w-full object-contain rounded-lg shadow-xs"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span className="text-amber-600 dark:text-amber-400 font-bold">Compressed Result</span>
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">{formatBytes(compressedSize)}</span>
          </div>
          <div className="flex-1 min-h-[240px] max-h-[360px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden relative">
            {compressedDataUrl ? (
              <img
                src={compressedDataUrl}
                alt="Compressed preview"
                className="max-h-[320px] max-w-full object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="text-xs text-zinc-400">Processing compression...</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Choose Different Image
        </button>

        <button
          onClick={handleDownload}
          disabled={!compressedBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Download Compressed Image ({formatBytes(compressedSize)})</span>
        </button>
      </div>
    </div>
  );
};
