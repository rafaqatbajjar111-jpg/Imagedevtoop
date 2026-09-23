import React, { useState, useEffect, useRef } from 'react';
import { ToolId, ImageFileInfo } from './types';
import { TOOLS } from './data/tools';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AdBanner } from './components/AdBanner';
import { ToolCard } from './components/ToolCard';
import { ToolWorkspace } from './components/ToolWorkspace';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { loadImage, createSampleImage } from './utils/canvasHelpers';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageFileInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('imagetoolbox-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('imagetoolbox-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('imagetoolbox-theme', 'light');
    }
  };

  const handleSelectTool = (id: ToolId | null) => {
    setActiveToolId(id);
    if (id) {
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleFileLoaded = async (file: File) => {
    try {
      const dataUrl = URL.createObjectURL(file);
      const img = await loadImage(dataUrl);
      setImageInfo({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dataUrl,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error('Error loading image file:', err);
    }
  };

  const handleResetImage = () => {
    if (imageInfo?.dataUrl) {
      URL.revokeObjectURL(imageInfo.dataUrl);
    }
    setImageInfo(null);
  };

  const handleLoadSample = async () => {
    try {
      const sample = await createSampleImage();
      if (!activeToolId) {
        setActiveToolId('compressor');
      }
      handleFileLoaded(sample);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tools based on query & category
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCat = categoryFilter === 'all' || tool.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesQuery =
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header */}
      <Header
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        onSelectTool={handleSelectTool}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLoadSample={handleLoadSample}
          activeFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
        />

        {/* 3. Ad Placement: Top Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner slot="top-banner" />
        </div>

        {/* 4. Active Tool Workspace (when a tool is selected) */}
        {activeToolId && (
          <div ref={workspaceRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xl dark:shadow-none">
              <ToolWorkspace
                activeToolId={activeToolId}
                onSelectTool={handleSelectTool}
                imageInfo={imageInfo}
                onFileLoaded={handleFileLoaded}
                onResetImage={handleResetImage}
              />
            </div>
          </div>
        )}

        {/* 5. Tool Cards Grid */}
        <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                Toolbox Catalog
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                All 10 Client-Side Image Utilities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">
              Showing {filteredTools.length} of {TOOLS.length} available tools
            </p>
          </div>

          {filteredTools.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
              <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                No tools found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <>
              {/* First 6 Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.slice(0, 6).map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onOpen={(id) => handleSelectTool(id)}
                  />
                ))}
              </div>

              {/* 6. Ad Placement: Between tool groups */}
              {filteredTools.length > 6 && (
                <AdBanner slot="in-feed" className="my-10" />
              )}

              {/* Remaining Tools */}
              {filteredTools.length > 6 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredTools.slice(6).map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onOpen={(id) => handleSelectTool(id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 7. Ad Placement: Before Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner slot="pre-footer" />
        </div>

        {/* 8. FAQ Section */}
        <FaqSection />
      </main>

      {/* 9. Semantic Footer */}
      <Footer onSelectTool={handleSelectTool} />
    </div>
  );
}
