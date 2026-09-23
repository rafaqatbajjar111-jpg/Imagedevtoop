import React from 'react';
import { Sun, Moon, ShieldCheck, Box } from 'lucide-react';
import { ToolId } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onSelectTool: (id: ToolId | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleTheme, onSelectTool }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div
          onClick={() => onSelectTool(null)}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-950 dark:text-white">
                ImageToolBox
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hidden sm:block leading-none -mt-0.5">
              Free Online Image Tools
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <a
            href="#tools"
            className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            All 10 Tools
          </a>
          <a
            href="#privacy"
            className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Browser Privacy</span>
          </a>
          <a
            href="#faq"
            className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Zero Server Uploads
          </div>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-amber-400 hover:text-amber-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
