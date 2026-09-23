import React from 'react';
import { Search, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoadSample: () => void;
  activeFilter: string;
  onFilterChange: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onLoadSample,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-zinc-100 dark:border-zinc-900 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-zinc-900/40 dark:via-zinc-950 dark:to-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Anti-Slop Clean Subhead */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/50 text-xs font-semibold text-amber-950 dark:text-amber-200 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>HTML5 Canvas &middot; 100% Client-Side Suite</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Free Online <span className="underline decoration-amber-400 decoration-wavy decoration-4">Image Tools</span>
        </h1>

        {/* Description */}
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          High-performance, privacy-focused image manipulation suite. Compress, resize, crop, rotate, convert, and inspect images instantly with zero server uploads.
        </p>

        {/* Privacy Notice Banner */}
        <div id="privacy" className="mt-6 inline-flex items-center gap-2.5 p-3 sm:px-5 sm:py-2.5 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 text-xs sm:text-sm font-medium shadow-md">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-left text-zinc-200">
            <strong className="text-amber-400 font-semibold">Strict Privacy Guarantee:</strong> Your images are processed directly in your browser and are not uploaded to our server.
          </span>
        </div>

        {/* Search Bar & Quick Categories */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tools (e.g. compress, crop, favicon, resize, png to jpg)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={onLoadSample}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-400 text-black hover:bg-amber-300 transition-colors flex items-center gap-1 shadow-xs"
              >
                <Zap className="w-3 h-3 fill-black" />
                <span>Try Demo</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All 10 Tools' },
              { id: 'optimize', label: 'Compress' },
              { id: 'resize', label: 'Resize & Crop' },
              { id: 'convert', label: 'Format Converters' },
              { id: 'developer', label: 'Favicon & Dev' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => onFilterChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === cat.id
                    ? 'bg-zinc-950 text-white dark:bg-amber-400 dark:text-zinc-950 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant HTML5 Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No File Size Restrictions</span>
          </div>
        </div>
      </div>
    </section>
  );
};
