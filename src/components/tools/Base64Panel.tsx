import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { fileToBase64, downloadText, formatBytes } from '../../utils/canvasHelpers';
import { Binary, Copy, Check, Download, Code2, Eye } from 'lucide-react';

interface Base64PanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const Base64Panel: React.FC<Base64PanelProps> = ({ imageInfo, onReset }) => {
  const [base64String, setBase64String] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [formatMode, setFormatMode] = useState<'raw' | 'html' | 'css'>('raw');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    const runEncode = async () => {
      setIsProcessing(true);
      try {
        const str = await fileToBase64(imageInfo.file);
        if (!isCancelled) {
          setBase64String(str);
        }
      } catch (err) {
        console.error('Base64 encoding error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    runEncode();
    return () => {
      isCancelled = true;
    };
  }, [imageInfo.file]);

  const getExportString = (): string => {
    if (formatMode === 'html') {
      return `<img src="${base64String}" alt="${imageInfo.name}" width="${imageInfo.width}" height="${imageInfo.height}" />`;
    }
    if (formatMode === 'css') {
      return `background-image: url("${base64String}");`;
    }
    return base64String;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = getExportString();
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadText(text, `${baseName}-base64.txt`);
  };

  const charCount = base64String.length;
  const base64Bytes = Math.round((charCount * 3) / 4);

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-amber-500" />
              Image to Base64 Data URL
            </h4>
            <p className="text-xs text-zinc-500">
              Embed images directly into HTML/CSS files without external asset dependencies
            </p>
          </div>

          <div className="flex rounded-xl p-1 bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold">
            {[
              { id: 'raw', label: 'Data URL' },
              { id: 'html', label: 'HTML <img>' },
              { id: 'css', label: 'CSS background' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormatMode(fmt.id as 'raw' | 'html' | 'css')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  formatMode === fmt.id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-zinc-400">Total Characters</span>
            <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white tabular-nums mt-0.5">
              {charCount.toLocaleString()} chars
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-zinc-400">Base64 Encoded Size</span>
            <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white tabular-nums mt-0.5">
              {formatBytes(base64Bytes)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 col-span-2 sm:col-span-1">
            <span className="text-zinc-400">Encoding Overhead</span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              +33% standard ASCII
            </p>
          </div>
        </div>
      </div>

      {/* Code Preview Box */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-950 text-zinc-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
          <span className="font-mono text-zinc-400 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            {formatMode === 'raw' ? 'Data URL String' : formatMode === 'html' ? 'HTML Image Element' : 'CSS Property'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Save .txt</span>
            </button>
          </div>
        </div>

        {/* Text area */}
        <textarea
          readOnly
          value={getExportString()}
          rows={7}
          className="w-full bg-transparent font-mono text-[11px] text-zinc-300 select-all focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Image Verification preview */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0">
          <img
            src={base64String}
            alt="Base64 preview"
            className="max-h-full max-w-full object-contain rounded-sm"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            Rendered from Base64 string
          </span>
          <p className="text-[11px] text-zinc-500">
            Self-contained inline data with zero external HTTP requests
          </p>
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
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Base64 Text File</span>
        </button>
      </div>
    </div>
  );
};
