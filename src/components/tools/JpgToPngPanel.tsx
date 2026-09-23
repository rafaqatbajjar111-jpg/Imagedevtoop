import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { convertFormat, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, FileImage, CheckCircle2, ArrowRight } from 'lucide-react';

interface JpgToPngPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const JpgToPngPanel: React.FC<JpgToPngPanelProps> = ({ imageInfo, onReset }) => {
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [pngSize, setPngSize] = useState<number>(0);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    const runConversion = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await convertFormat(img, 'image/png', 1.0, 'transparent');
        if (!isCancelled) {
          setPngDataUrl(result.dataUrl);
          setPngSize(result.size);
          setPngBlob(result.blob);
        }
      } catch (err) {
        console.error('JPG to PNG error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    runConversion();
    return () => {
      isCancelled = true;
    };
  }, [imageInfo.dataUrl]);

  const handleDownload = () => {
    if (!pngBlob) return;
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(pngBlob, `${baseName}-converted.png`);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black">
            <FileImage className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Lossless PNG Format Ready
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Converts JPEG compression artifacts into lossless RGB/RGBA pixel matrix
            </p>
          </div>
        </div>

        {/* Format Conversion Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
          <span className="text-zinc-600 dark:text-zinc-300 uppercase">JPG</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-amber-600 dark:text-amber-400 uppercase font-black">PNG (Lossless)</span>
        </div>
      </div>

      {/* Comparison preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span>Source JPG</span>
            <span className="tabular-nums">{formatBytes(imageInfo.size)}</span>
          </div>
          <div className="h-[280px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            <img
              src={imageInfo.dataUrl}
              alt="Source JPG"
              className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Converted PNG
            </span>
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
              {isProcessing ? 'Converting...' : formatBytes(pngSize)}
            </span>
          </div>
          <div className="h-[280px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt="Converted PNG"
                className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
              />
            ) : (
              <span className="text-xs text-zinc-400">Processing conversion...</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Choose Different Image
        </button>

        <button
          onClick={handleDownload}
          disabled={!pngBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG Image ({formatBytes(pngSize)})</span>
        </button>
      </div>
    </div>
  );
};
