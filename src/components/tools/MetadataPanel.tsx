import React, { useState, useEffect } from 'react';
import { ImageFileInfo, ExifData } from '../../types';
import { extractExif } from '../../utils/exifParser';
import { formatBytes, downloadText } from '../../utils/canvasHelpers';
import { Info, Copy, Check, Download, Camera, MapPin, Calendar, FileText, Search } from 'lucide-react';

interface MetadataPanelProps {
  imageInfo: ImageFileInfo;
  onReset: () => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ imageInfo, onReset }) => {
  const [exif, setExif] = useState<ExifData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const runExif = async () => {
      setLoading(true);
      try {
        const data = await extractExif(imageInfo.file);
        if (!isCancelled) {
          setExif(data);
        }
      } catch (err) {
        console.error('EXIF extraction error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    runExif();
    return () => {
      isCancelled = true;
    };
  }, [imageInfo.file]);

  const megapixels = ((imageInfo.width * imageInfo.height) / 1000000).toFixed(2);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(imageInfo.width, imageInfo.height);
  const aspectFraction = `${Math.round(imageInfo.width / divisor)}:${Math.round(imageInfo.height / divisor)}`;

  const metaSections = [
    {
      title: 'File & Container Info',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'File Name', value: imageInfo.name },
        { label: 'MIME Type', value: imageInfo.type || 'image/jpeg' },
        { label: 'File Size', value: `${formatBytes(imageInfo.size)} (${imageInfo.size.toLocaleString()} bytes)` },
        { label: 'Last Modified', value: new Date(imageInfo.lastModified).toLocaleString() },
      ],
    },
    {
      title: 'Geometric Properties',
      icon: <Info className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'Dimensions', value: `${imageInfo.width} × ${imageInfo.height} px` },
        { label: 'Resolution', value: `${megapixels} Megapixels` },
        { label: 'Aspect Ratio', value: aspectFraction },
        { label: 'Color Depth', value: '24-bit / 32-bit (sRGB)' },
      ],
    },
    {
      title: 'Camera & Lens (EXIF)',
      icon: <Camera className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'Camera Make', value: exif.make || 'Not embedded' },
        { label: 'Camera Model', value: exif.model || 'Not embedded' },
        { label: 'Lens Model', value: exif.lensModel || 'Not embedded' },
        { label: 'Focal Length', value: exif.focalLength ? `${exif.focalLength} mm` : 'Not embedded' },
        { label: 'Shutter Speed', value: exif.exposureTime || 'Not embedded' },
        { label: 'Aperture (F-Stop)', value: exif.fNumber ? `f/${exif.fNumber}` : 'Not embedded' },
        { label: 'ISO Sensitivity', value: exif.iso ? String(exif.iso) : 'Not embedded' },
        { label: 'Flash Mode', value: exif.flash || 'Not embedded' },
        { label: 'Color Space', value: exif.colorSpace || 'sRGB' },
        { label: 'Software / OS', value: exif.software || 'Not embedded' },
      ],
    },
    {
      title: 'Capture Timestamp & Location',
      icon: <Calendar className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'Date/Time Original', value: exif.dateTime || 'Not embedded' },
        { label: 'GPS Latitude', value: exif.gpsLatitude || 'Not embedded' },
        { label: 'GPS Longitude', value: exif.gpsLongitude || 'Not embedded' },
      ],
    },
  ];

  const handleCopySummary = () => {
    let summary = `Image Metadata Report - ${imageInfo.name}\n=====================================\n`;
    metaSections.forEach((sec) => {
      summary += `\n[${sec.title}]\n`;
      sec.items.forEach((item) => {
        summary += `${item.label}: ${item.value}\n`;
      });
    });
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    let summary = `Image Metadata Report - ${imageInfo.name}\n=====================================\n`;
    metaSections.forEach((sec) => {
      summary += `\n[${sec.title}]\n`;
      sec.items.forEach((item) => {
        summary += `${item.label}: ${item.value}\n`;
      });
    });
    downloadText(summary, `${imageInfo.name}-metadata.txt`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            In-Browser Image EXIF & Metadata Inspector
          </h4>
          <p className="text-xs text-zinc-500">
            Parsed client-side from binary headers &middot; Zero bytes sent over network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-amber-400 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-amber-400 dark:text-zinc-950 text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .txt</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Tags */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter metadata fields (e.g. ISO, Lens, Dimensions, GPS)..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Metadata Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metaSections.map((section) => {
          const filteredItems = section.items.filter(
            (i) =>
              i.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
              String(i.value).toLowerCase().includes(filterQuery.toLowerCase())
          );

          if (filteredItems.length === 0 && filterQuery) return null;

          return (
            <div
              key={section.title}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xs"
            >
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white">
                {section.icon}
                <span>{section.title}</span>
              </div>

              <div className="space-y-2 text-xs">
                {filteredItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50"
                  >
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{item.label}</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-right max-w-[200px] truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Choose Different Image
        </button>

        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Metadata inspected locally &middot; No privacy risk
        </span>
      </div>
    </div>
  );
};
