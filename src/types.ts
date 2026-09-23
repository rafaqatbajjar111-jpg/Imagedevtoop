export type ToolId =
  | 'compressor'
  | 'resizer'
  | 'jpg-to-png'
  | 'png-to-jpg'
  | 'cropper'
  | 'rotator'
  | 'converter'
  | 'favicon'
  | 'metadata'
  | 'base64';

export interface ToolMeta {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  category: 'optimize' | 'resize' | 'convert' | 'developer';
  icon: string;
  keywords: string[];
  acceptedTypes: string[];
}

export interface ImageFileInfo {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  orientation?: number;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  lensModel?: string;
  software?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  flash?: string;
  colorSpace?: string;
  [key: string]: string | number | undefined;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
