import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { generateFaviconSizes, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

interface FaviconPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

interface FaviconResult {
  size: number;
  blob: Blob;
  dataUrl: string;
  byteSize: number;
}

export const FaviconPanel: React.FC<FaviconPanelProps> = ({ imageInfo, onReset }) => {
  const [favicons, setFavicons] = useState<FaviconResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const results = await generateFaviconSizes(img, [16, 32, 48, 180]);
        if (!isCancelled) {
          setFavicons(results);
        }
      } catch (err) {
        console.error('Favicon generator error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [imageInfo.dataUrl]);

  const handleDownloadSingle = (fav: FaviconResult) => {
    const filename = fav.size === 180 ? 'apple-touch-icon.png' : `favicon-${fav.size}x${fav.size}.png`;
    downloadBlob(fav.blob, filename);
  };

  const handleDownloadAll = () => {
    favicons.forEach((fav, i) => {
      setTimeout(() => {
        handleDownloadSingle(fav);
      }, i * 200);
    });
  };

  const htmlCode = `<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const f16 = favicons.find((f) => f.size === 16);
  const f32 = favicons.find((f) => f.size === 32);
  const f48 = favicons.find((f) => f.size === 48);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Standard Web Favicon Package
          </h4>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            4 Standard Sizes
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          Source image is automatically centered and square-cropped to pixel-perfect standards.
        </p>
      </div>

      {/* Realistic Browser Tab Simulation */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-100/50 dark:bg-zinc-900/40 space-y-4">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Live Browser Tab Simulation (16×16 px)
        </span>
        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-800/80 p-2 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/80 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-xs">
            {f16 ? (
              <img src={f16.dataUrl} alt="16x16 tab icon" className="w-4 h-4 rounded-xs shrink-0" />
            ) : (
              <div className="w-4 h-4 bg-zinc-300 animate-pulse rounded-xs" />
            )}
            <span className="truncate">My Awesome Website</span>
            <span className="text-zinc-400 hover:text-zinc-700 ml-auto cursor-pointer">&times;</span>
          </div>
        </div>
      </div>

      {/* Generated Sizes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {favicons.map((fav) => (
          <div
            key={fav.size}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 flex flex-col items-center justify-between text-center space-y-3 shadow-xs hover:border-amber-400 transition-colors"
          >
            <div>
              <span className="text-xs font-black text-zinc-900 dark:text-white">
                {fav.size} &times; {fav.size} px
              </span>
              <p className="text-[11px] text-zinc-400">
                {fav.size === 16 ? 'Browser Tab' : fav.size === 32 ? 'High-DPI Bookmark' : fav.size === 48 ? 'Desktop Shortcut' : 'Apple Touch Icon'}
              </p>
            </div>

            <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-1">
              <img
                src={fav.dataUrl}
                alt={`${fav.size}x${fav.size}`}
                style={{ width: `${Math.min(fav.size, 48)}px`, height: `${Math.min(fav.size, 48)}px` }}
                className="object-contain"
              />
            </div>

            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {formatBytes(fav.byteSize)}
            </span>

            <button
              onClick={() => handleDownloadSingle(fav)}
              className="w-full py-1.5 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-amber-400 hover:text-zinc-950 dark:hover:bg-amber-400 dark:hover:text-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>

      {/* HTML Embed Snippet */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            HTML &lt;head&gt; Embed Code
          </span>
          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHtml ? 'Copied HTML!' : 'Copy Snippet'}</span>
          </button>
        </div>
        <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-300 font-mono text-xs overflow-x-auto">
          {htmlCode}
        </pre>
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
          onClick={handleDownloadAll}
          disabled={favicons.length === 0 || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download All Favicon Sizes (16, 32, 48, 180)</span>
        </button>
      </div>
    </div>
  );
};
