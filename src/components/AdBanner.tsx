import React from 'react';

interface AdBannerProps {
  slot: 'top-banner' | 'in-feed' | 'pre-footer';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, className = '' }) => {
  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-600 mb-1.5">
        Advertisement &middot; Sponsored
      </span>
      <div
        data-ad-slot={slot}
        className="w-full max-w-4xl min-h-[90px] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between p-4 px-6 text-zinc-500 dark:text-zinc-400 transition-colors"
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            Ad
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Reserved AdSense Leaderboard Space ({slot === 'top-banner' ? '728×90 / 320×50' : slot === 'in-feed' ? 'Responsive Mid-Content' : 'Footer Anchor'})
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              High-visibility clean ad container &middot; Compliant with Google AdSense policy guidelines
            </p>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
          AdSense Ready
        </div>
      </div>
    </div>
  );
};
