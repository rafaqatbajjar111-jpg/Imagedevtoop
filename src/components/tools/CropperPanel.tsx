import React, { useState, useEffect, useRef } from 'react';
import { ImageFileInfo, CropArea } from '../../types';
import { cropImage, downloadBlob, formatBytes, loadImage } from '../../utils/canvasHelpers';
import { Download, Crop, RefreshCcw } from 'lucide-react';

interface CropperPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const CropperPanel: React.FC<CropperPanelProps> = ({ imageInfo, onReset }) => {
  const [aspectPreset, setAspectPreset] = useState<string>('free');
  const [crop, setCrop] = useState<CropArea>({
    x: Math.round(imageInfo.width * 0.1),
    y: Math.round(imageInfo.height * 0.1),
    width: Math.round(imageInfo.width * 0.8),
    height: Math.round(imageInfo.height * 0.8),
  });

  const [croppedDataUrl, setCroppedDataUrl] = useState<string>('');
  const [croppedSize, setCroppedSize] = useState<number>(0);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [format, setFormat] = useState<string>('image/png');

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragModeRef = useRef<'move' | 'se' | 'nw' | 'ne' | 'sw' | null>(null);
  const startPosRef = useRef<{ x: number; y: number; crop: CropArea }>({
    x: 0,
    y: 0,
    crop: { x: 0, y: 0, width: 0, height: 0 },
  });

  const presets = [
    { id: 'free', label: 'Freeform', ratio: null },
    { id: '1:1', label: '1:1 (Square)', ratio: 1 },
    { id: '16:9', label: '16:9 (Landscape)', ratio: 16 / 9 },
    { id: '9:16', label: '9:16 (Story/Reel)', ratio: 9 / 16 },
    { id: '4:3', label: '4:3 (Standard)', ratio: 4 / 3 },
    { id: '3:2', label: '3:2 (Photo)', ratio: 3 / 2 },
  ];

  const applyPreset = (presetId: string) => {
    setAspectPreset(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (!found || !found.ratio) return;

    const r = found.ratio;
    let targetW = imageInfo.width * 0.8;
    let targetH = targetW / r;

    if (targetH > imageInfo.height * 0.9) {
      targetH = imageInfo.height * 0.8;
      targetW = targetH * r;
    }

    const x = Math.max(0, Math.round((imageInfo.width - targetW) / 2));
    const y = Math.max(0, Math.round((imageInfo.height - targetH) / 2));

    setCrop({
      x,
      y,
      width: Math.round(targetW),
      height: Math.round(targetH),
    });
  };

  // Run crop calculation
  useEffect(() => {
    let isCancelled = false;
    const runCrop = async () => {
      setIsProcessing(true);
      try {
        const img = await loadImage(imageInfo.dataUrl);
        const result = await cropImage(img, crop, format, 0.92);
        if (!isCancelled) {
          setCroppedDataUrl(result.dataUrl);
          setCroppedSize(result.size);
          setCroppedBlob(result.blob);
        }
      } catch (err) {
        console.error('Crop error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timer = setTimeout(runCrop, 100);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [imageInfo.dataUrl, crop, format]);

  const handleDownload = () => {
    if (!croppedBlob) return;
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = imageInfo.name.replace(/\.[^/.]+$/, '');
    downloadBlob(croppedBlob, `${baseName}-cropped-${crop.width}x${crop.height}.${ext}`);
  };

  // Interactive Drag on display overlay
  const handlePointerDown = (mode: 'move' | 'se' | 'nw' | 'ne' | 'sw', e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    dragModeRef.current = mode;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = imageInfo.width / rect.width;
      const scaleY = imageInfo.height / rect.height;

      const dx = (moveEv.clientX - startPosRef.current.x) * scaleX;
      const dy = (moveEv.clientY - startPosRef.current.y) * scaleY;
      const initial = startPosRef.current.crop;

      if (dragModeRef.current === 'move') {
        const nextX = Math.max(0, Math.min(imageInfo.width - initial.width, initial.x + dx));
        const nextY = Math.max(0, Math.min(imageInfo.height - initial.height, initial.y + dy));
        setCrop((prev) => ({ ...prev, x: Math.round(nextX), y: Math.round(nextY) }));
      } else if (dragModeRef.current === 'se') {
        let nextW = Math.max(20, Math.min(imageInfo.width - initial.x, initial.width + dx));
        let nextH = Math.max(20, Math.min(imageInfo.height - initial.y, initial.height + dy));

        const activePreset = presets.find((p) => p.id === aspectPreset);
        if (activePreset?.ratio) {
          nextH = nextW / activePreset.ratio;
        }

        setCrop((prev) => ({ ...prev, width: Math.round(nextW), height: Math.round(nextH) }));
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      dragModeRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Convert crop rect into percentage for visual CSS overlay
  const overlayLeft = (crop.x / imageInfo.width) * 100;
  const overlayTop = (crop.y / imageInfo.height) * 100;
  const overlayWidth = (crop.width / imageInfo.width) * 100;
  const overlayHeight = (crop.height / imageInfo.height) * 100;

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Crop className="w-4 h-4 text-amber-500" />
              Crop Area & Aspect Ratio
            </h4>
            <p className="text-xs text-zinc-500">
              Drag the golden bounding box or adjust pixel coordinates
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

        {/* Aspect Ratio Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                aspectPreset === preset.id
                  ? 'bg-amber-400 text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Exact Coordinate controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500">Left (X):</span>
            <input
              type="number"
              value={crop.x}
              onChange={(e) => setCrop({ ...crop, x: Math.max(0, Number(e.target.value)) })}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
            />
          </div>
          <div>
            <span className="text-zinc-500">Top (Y):</span>
            <input
              type="number"
              value={crop.y}
              onChange={(e) => setCrop({ ...crop, y: Math.max(0, Number(e.target.value)) })}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
            />
          </div>
          <div>
            <span className="text-zinc-500">Width:</span>
            <input
              type="number"
              value={crop.width}
              onChange={(e) => setCrop({ ...crop, width: Math.max(10, Number(e.target.value)) })}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
            />
          </div>
          <div>
            <span className="text-zinc-500">Height:</span>
            <input
              type="number"
              value={crop.height}
              onChange={(e) => setCrop({ ...crop, height: Math.max(10, Number(e.target.value)) })}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Interactive Visual Canvas / Image Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span>Drag Crop Area (Move or Drag Corner Handle)</span>
            <button
              onClick={() =>
                setCrop({
                  x: 0,
                  y: 0,
                  width: imageInfo.width,
                  height: imageInfo.height,
                })
              }
              className="flex items-center gap-1 text-amber-600 hover:text-amber-500"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset Crop Box
            </button>
          </div>

          <div
            ref={containerRef}
            className="relative select-none touch-none mx-auto max-h-[360px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden"
          >
            <div className="relative inline-block max-h-[340px] max-w-full">
              <img
                src={imageInfo.dataUrl}
                alt="Source to crop"
                className="max-h-[340px] max-w-full object-contain pointer-events-none block"
              />

              {/* Shading Mask Outside Crop Box */}
              <div
                style={{
                  left: `${overlayLeft}%`,
                  top: `${overlayTop}%`,
                  width: `${overlayWidth}%`,
                  height: `${overlayHeight}%`,
                }}
                onPointerDown={(e) => handlePointerDown('move', e)}
                className="absolute border-2 border-amber-400 bg-amber-400/10 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-shadow"
              >
                {/* 3x3 Rule of Thirds Gridlines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div></div>
                </div>

                {/* Resize Handle - Bottom Right */}
                <div
                  onPointerDown={(e) => handlePointerDown('se', e)}
                  className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-amber-400 border-2 border-zinc-950 cursor-se-resize shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cropped Output Preview */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 text-zinc-500">
            <span className="text-amber-600 dark:text-amber-400 font-bold">Cropped Output Result</span>
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
              {crop.width} &times; {crop.height} px &middot; {formatBytes(croppedSize)}
            </span>
          </div>

          <div className="min-h-[260px] max-h-[360px] flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-950 p-2 overflow-hidden">
            {croppedDataUrl ? (
              <img
                src={croppedDataUrl}
                alt="Cropped preview"
                className="max-h-[320px] max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <span className="text-xs text-zinc-400">Computing crop...</span>
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
          disabled={!croppedBlob || isProcessing}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Cropped Image ({formatBytes(croppedSize)})</span>
        </button>
      </div>
    </div>
  );
};
