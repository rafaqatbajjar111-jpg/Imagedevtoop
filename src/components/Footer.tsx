import React from 'react';
import { Box, Shield, Heart } from 'lucide-react';
import { ToolId } from '../types';
import { TOOLS } from '../data/tools';

interface FooterProps {
  onSelectTool: (id: ToolId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black">
                <Box className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg text-zinc-950 dark:text-white">
                ImageToolBox
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
              Fast, privacy-first single-page web image tool suite. All computations and canvas encodings happen locally inside your browser. No files are ever sent to remote servers.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% In-Browser &middot; Client-Side HTML5 Canvas</span>
            </div>
          </div>

          {/* Quick Tools Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-3">
              Optimize & Resize
            </h4>
            <ul className="space-y-2 text-xs">
              {TOOLS.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => {
                      onSelectTool(tool.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Tools Column 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-3">
              Convert & Developer
            </h4>
            <ul className="space-y-2 text-xs">
              {TOOLS.slice(5).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => {
                      onSelectTool(tool.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ImageToolBox. Free Online Image Tools. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with pure client-side web APIs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
