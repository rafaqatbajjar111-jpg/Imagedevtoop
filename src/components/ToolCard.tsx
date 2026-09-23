import React from 'react';
import { ToolMeta } from '../types';
import {
  Minimize2,
  Maximize2,
  FileImage,
  FileCode2,
  Crop,
  RotateCw,
  RefreshCw,
  Sparkles,
  Info,
  Binary,
  ArrowRight,
} from 'lucide-react';

interface ToolCardProps {
  tool: ToolMeta;
  onOpen: (id: ToolMeta['id']) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Minimize2: <Minimize2 className="w-5 h-5" />,
  Maximize2: <Maximize2 className="w-5 h-5" />,
  FileImage: <FileImage className="w-5 h-5" />,
  FileCode2: <FileCode2 className="w-5 h-5" />,
  Crop: <Crop className="w-5 h-5" />,
  RotateCw: <RotateCw className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Info: <Info className="w-5 h-5" />,
  Binary: <Binary className="w-5 h-5" />,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onOpen }) => {
  return (
    <div
      onClick={() => onOpen(tool.id)}
      className="group relative cursor-pointer rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-xl dark:hover:shadow-amber-400/5 transition-all duration-300"
    >
      <div>
        {/* Card Header with Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 group-hover:bg-amber-400 text-amber-600 group-hover:text-zinc-950 flex items-center justify-center transition-all duration-200 shadow-xs">
            {iconMap[tool.icon] || <Sparkles className="w-5 h-5" />}
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {tool.category}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
          {tool.tagline}
        </p>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
          Open Tool
        </span>
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber-400 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-950 flex items-center justify-center transition-all group-hover:translate-x-1">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
