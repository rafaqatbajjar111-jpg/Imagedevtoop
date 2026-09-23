import React, { useState, useEffect } from 'react';
import { ImageFileInfo } from '../../types';
import { rotateImage, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

interface RotatorPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const RotatorPanel: React.FC<RotatorPanelProps> = ({ imageInfo, onReset }) => {
  const [angle, setAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [format, setFormat] = useState<string>('image/png');
  const [rotatedDataUrl, setRotatedDataUrl] = useState<string>('');
  const [rotatedSize, setRotatedSize] = useState<number>(0);
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const runRotation = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await rotateImage(img, angle, flipH, flipV, format, 0.92);
        if (!isCancelled) {
          setRotatedDataUrl(result.dataUrl);
          setRotatedSize(result.size);
          setRotatedBlob(result.blob);
        }
      } catch (err) {
        console.error('Rotation error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runRotation, 100);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, angle, flipH, flipV, format]);

  const rotateBy = (delta: number) => {
    setAngle((prev) => ((prev + delta) % 360 + 360) % 360);
  };

  const handleDownload = () => {
    if (!rotatedBlob) return;
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(rotatedBlob, `${baseName}-transformed.${ext}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-500" />
              Rotation & Mirror Transformation
            </h4>
            <p className="text-xs text-zinc-500">
              Transform image orientation with zero quality degradation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Format:</span>
            <div className="flex rounded-xl p-1 bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold">
              {['image/png', 'image/jpeg'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    format === fmt
                      ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {fmt === 'image/jpeg' ? 'JPG' : 'PNG'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Transform Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => rotateBy(90)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Rotate 90° CW</span>
          </button>

          <button
            onClick={() => rotateBy(-90)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Rotate 90° CCW</span>
          </button>

          <button
            onClick={() => rotateBy(180)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Rotate 180°</span>
          </button>

          <button
            onClick={() => setFlipH(!flipH)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors shadow-xs ${
              flipH
                ? 'border-amber-400 bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-amber-400'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span>Flip Horizontal</span>
          </button>

          <button
            onClick={() => setFlipV(!flipV)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors shadow-xs ${
              flipV
                ? 'border-amber-400 bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-amber-400'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5 text-amber-500" />
            <span>Flip Vertical</span>
          </button>

          {(angle !== 0 || flipH || flipV) && (
            <button
              onClick={() => {
                setAngle(0);
                setFlipH(false);
                setFlipV(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Custom Fine-Tune Slider */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">Custom Rotation Angle</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-amber-500"
          />
        </div>
      </div>

      {/* Output Preview */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-100/50 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
          <span>Transformed Preview</span>
          <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
            Angle: {angle}° &middot; {formatBytes(rotatedSize)}
          </span>
        </div>

        <div className="min-h-[280px] max-h-[400px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
          {rotatedDataUrl ? (
            <img
              src={rotatedDataUrl}
              alt="Rotated preview"
              className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm transition-all"
            />
          ) : (
            <span className="text-xs text-zinc-400">Transforming...</span>
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
          disabled={!rotatedBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Transformed Image</span>
        </button>
      </div>
    </div>
  );
};
