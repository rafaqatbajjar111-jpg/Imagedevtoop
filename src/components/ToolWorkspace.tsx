import React from 'react';
import { ToolId, ImageFileInfo } from '../types';
import { TOOLS } from '../data/tools';
import { Dropzone } from './Dropzone';
import { CompressorPanel } from './tools/CompressorPanel';
import { ResizerPanel } from './tools/ResizerPanel';
import { JpgToPngPanel } from './tools/JpgToPngPanel';
import { PngToJpgPanel } from './tools/PngToJpgPanel';
import { CropperPanel } from './tools/CropperPanel';
import { RotatorPanel } from './tools/RotatorPanel';
import { FormatConverterPanel } from './tools/FormatConverterPanel';
import { FaviconPanel } from './tools/FaviconPanel';
import { MetadataPanel } from './tools/MetadataPanel';
import { Base64Panel } from './tools/Base64Panel';
import { formatBytes } from '../utils/canvasHelpers';
import { ArrowLeft, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ToolWorkspaceProps {
  activeToolId: ToolId;
  onSelectTool: (id: ToolId | null) => void;
  imageInfo: ImageFileInfo | null;
  onFileLoaded: (file: File) => void;
  onResetImage: () => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  activeToolId,
  onSelectTool,
  imageInfo,
  onFileLoaded,
  onResetImage,
}) => {
  const currentTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];

  return (
    <div id="workspace" className="scroll-mt-24 space-y-6">
      {/* Top Navigation & Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTool(null)}
            className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-amber-400 hover:text-amber-500 transition-colors shadow-xs"
            aria-label="Back to all tools"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                {currentTool.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {currentTool.description}
            </p>
          </div>
        </div>

        {/* Quick Tool Switcher Dropdown / Pills for quick swapping */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <select
            value={activeToolId}
            onChange={(e) => onSelectTool(e.target.value as ToolId)}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs cursor-pointer"
          >
            {TOOLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {imageInfo && (
            <button
              onClick={onResetImage}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Image</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      {!imageInfo ? (
        <div className="py-6">
          <Dropzone
            onFileLoaded={onFileLoaded}
            acceptedTypes={currentTool.acceptedTypes}
            label={`Upload image for ${currentTool.name}`}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {imageInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-500 font-medium">
              <span>{imageInfo.width} &times; {imageInfo.height} px</span>
              <span>&middot;</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatBytes(imageInfo.size)}</span>
              <span>&middot;</span>
              <span className="uppercase text-amber-600 dark:text-amber-400 font-bold">
                {imageInfo.file.type.split('/')[1] || 'IMAGE'}
              </span>
            </div>
          </div>

          {/* Active Tool Control Interface */}
          {activeToolId === 'compressor' && (
            <CompressorPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'resizer' && (
            <ResizerPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'jpg-to-png' && (
            <JpgToPngPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'png-to-jpg' && (
            <PngToJpgPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'cropper' && (
            <CropperPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'rotator' && (
            <RotatorPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'converter' && (
            <FormatConverterPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'favicon' && (
            <FaviconPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'metadata' && (
            <MetadataPanel imageInfo={imageInfo} onReset={onResetImage} />
          )}
          {activeToolId === 'base64' && (
            <Base64Panel imageInfo={imageInfo} onReset={onResetImage} />
          )}
        </div>
      )}
    </div>
  );
};
