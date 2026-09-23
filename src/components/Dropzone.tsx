import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Clipboard, AlertCircle } from 'lucide-react';
import { createSampleImage } from '../utils/canvasHelpers';

interface DropzoneProps {
  onFileLoaded: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileLoaded,
  acceptedTypes = ['image/*'],
  maxSizeMB = 50,
  label = 'Drop your image here, or click to browse',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, SVG, GIF, etc.).');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image exceeds maximum allowed size of ${maxSizeMB}MB.`);
      return;
    }
    onFileLoaded(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    try {
      const sample = await createSampleImage();
      processFile(sample);
    } catch (err) {
      console.error(err);
    }
  };

  // Listen for paste event anywhere while dropzone is visible
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const item = e.clipboardData.files[0];
        if (item.type.startsWith('image/')) {
          processFile(item);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all group ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-amber-400 dark:hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400/15 group-hover:bg-amber-400 text-amber-600 group-hover:text-zinc-950 flex items-center justify-center transition-all duration-200 mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-y-0.5" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          {label}
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          Supports JPG, PNG, WebP, SVG, BMP, and GIF up to {maxSizeMB}MB
        </p>

        {/* Action triggers */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs"
          >
            Browse Files
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSample();
            }}
            className="px-3.5 py-2 rounded-xl border border-amber-400 bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Load Sample</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span className="flex items-center gap-1">
            <Clipboard className="w-3 h-3" />
            Paste image from clipboard (Ctrl+V)
          </span>
          <span>&middot;</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Local browser processing
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
