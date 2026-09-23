import { ExifData } from '../types';

/**
 * Client-side binary EXIF parser for JPEG files using DataView.
 * Fully in-browser, zero dependencies, zero network requests.
 */
export async function extractExif(file: File): Promise<ExifData> {
  const result: ExifData = {};

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // Verify JPEG SOI marker (0xFFD8)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
      return result;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (view.getUint8(offset) !== 0xff) {
        break;
      }

      const marker = view.getUint8(offset + 1);

      // APP1 marker (0xFFE1) contains EXIF data
      if (marker === 0xe1) {
        const app1Length = view.getUint16(offset + 2, false);
        const exifStart = offset + 4;

        // Verify Exif header string "Exif\0\0"
        const exifHeader = String.fromCharCode(
          view.getUint8(exifStart),
          view.getUint8(exifStart + 1),
          view.getUint8(exifStart + 2),
          view.getUint8(exifStart + 3)
        );

        if (exifHeader === 'Exif') {
          const tiffStart = exifStart + 6;
          parseTiff(view, tiffStart, result);
        }
        break;
      } else if (marker === 0xd9 || marker === 0xda) {
        // SOS (Start of Scan) or EOI: headers end
        break;
      } else {
        // Skip current marker segment
        const segmentLength = view.getUint16(offset + 2, false);
        offset += 2 + segmentLength;
      }
    }
  } catch (err) {
    console.debug('EXIF extraction skipped or unreadable:', err);
  }

  return result;
}

function parseTiff(view: DataView, tiffStart: number, result: ExifData) {
  // Byte order: 0x4949 ('II') = little-endian, 0x4D4D ('MM') = big-endian
  const byteOrder = view.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949;

  // Verify TIFF magic number 42 (0x002A)
  if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) {
    return;
  }

  const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
  if (ifd0Offset < 8) return;

  const tags = parseIFD(view, tiffStart, tiffStart + ifd0Offset, littleEndian);

  // Common IFD0 tags
  if (tags[0x010f]) result.make = String(tags[0x010f]).trim();
  if (tags[0x0110]) result.model = String(tags[0x0110]).trim();
  if (tags[0x0112]) result.orientation = Number(tags[0x0112]);
  if (tags[0x0131]) result.software = String(tags[0x0131]).trim();
  if (tags[0x0132]) result.dateTime = String(tags[0x0132]).trim();

  // SubIFD (ExifIFD) pointer tag 0x8769
  if (tags[0x8769]) {
    const exifIfdOffset = Number(tags[0x8769]);
    const exifTags = parseIFD(view, tiffStart, tiffStart + exifIfdOffset, littleEndian);

    if (exifTags[0x829a]) {
      // Exposure Time (Rational)
      const val = exifTags[0x829a];
      result.exposureTime = typeof val === 'number' ? (val < 1 ? `1/${Math.round(1 / val)}s` : `${val}s`) : String(val);
    }
    if (exifTags[0x829d]) {
      // F-Number
      result.fNumber = Number(Number(exifTags[0x829d]).toFixed(1));
    }
    if (exifTags[0x8827]) {
      // ISO Speed
      result.iso = Number(exifTags[0x8827]);
    }
    if (exifTags[0x920a]) {
      // Focal length
      result.focalLength = Number(Number(exifTags[0x920a]).toFixed(1));
    }
    if (exifTags[0xa434]) {
      // Lens Model
      result.lensModel = String(exifTags[0xa434]).trim();
    }
    if (exifTags[0x9003]) {
      // Date Time Original
      result.dateTime = String(exifTags[0x9003]).trim();
    }
    if (exifTags[0x9209]) {
      // Flash
      const flashVal = Number(exifTags[0x9209]);
      result.flash = (flashVal & 1) !== 0 ? 'Fired' : 'Did not fire';
    }
    if (exifTags[0xa001]) {
      // Color space: 1 = sRGB, 65535 = Uncalibrated
      result.colorSpace = Number(exifTags[0xa001]) === 1 ? 'sRGB' : 'Wide Gamut / Uncalibrated';
    }
  }

  // GPS IFD pointer tag 0x8825
  if (tags[0x8825]) {
    const gpsIfdOffset = Number(tags[0x8825]);
    const gpsTags = parseIFD(view, tiffStart, tiffStart + gpsIfdOffset, littleEndian);

    if (gpsTags[0x0002] && gpsTags[0x0001]) {
      // GPS Latitude
      const latRef = String(gpsTags[0x0001] || 'N');
      result.gpsLatitude = `${latRef} ${formatGpsCoord(gpsTags[0x0002])}`;
    }
    if (gpsTags[0x0004] && gpsTags[0x0003]) {
      // GPS Longitude
      const lonRef = String(gpsTags[0x0003] || 'E');
      result.gpsLongitude = `${lonRef} ${formatGpsCoord(gpsTags[0x0004])}`;
    }
  }
}

function parseIFD(view: DataView, tiffStart: number, ifdOffset: number, littleEndian: boolean): Record<number, unknown> {
  const tags: Record<number, unknown> = {};
  if (ifdOffset + 2 > view.byteLength) return tags;

  const numEntries = view.getUint16(ifdOffset, littleEndian);
  let entryOffset = ifdOffset + 2;

  for (let i = 0; i < numEntries && entryOffset + 12 <= view.byteLength; i++, entryOffset += 12) {
    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);

    const value = readTagValue(view, tiffStart, entryOffset + 8, type, count, littleEndian);
    if (value !== undefined) {
      tags[tag] = value;
    }
  }

  return tags;
}

function readTagValue(
  view: DataView,
  tiffStart: number,
  valueOffset: number,
  type: number,
  count: number,
  littleEndian: boolean
): unknown {
  // Types: 1=BYTE, 2=ASCII, 3=SHORT, 4=LONG, 5=RATIONAL, 7=UNDEFINED, 9=SLONG, 10=SRATIONAL
  const typeSizes: Record<number, number> = {
    1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8,
  };

  const itemSize = typeSizes[type] || 1;
  const totalSize = itemSize * count;
  const dataOffset = totalSize <= 4 ? valueOffset : tiffStart + view.getUint32(valueOffset, littleEndian);

  if (dataOffset + totalSize > view.byteLength) return undefined;

  if (type === 2) {
    // ASCII string
    let str = '';
    for (let i = 0; i < count - 1; i++) {
      const charCode = view.getUint8(dataOffset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str;
  }

  if (type === 3) {
    // SHORT (16-bit)
    if (count === 1) return view.getUint16(dataOffset, littleEndian);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) arr.push(view.getUint16(dataOffset + i * 2, littleEndian));
    return arr;
  }

  if (type === 4) {
    // LONG (32-bit)
    if (count === 1) return view.getUint32(dataOffset, littleEndian);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) arr.push(view.getUint32(dataOffset + i * 4, littleEndian));
    return arr;
  }

  if (type === 5 || type === 10) {
    // RATIONAL (numerator/denominator)
    const readSingleRational = (offset: number) => {
      const num = type === 5 ? view.getUint32(offset, littleEndian) : view.getInt32(offset, littleEndian);
      const den = type === 5 ? view.getUint32(offset + 4, littleEndian) : view.getInt32(offset + 4, littleEndian);
      return den === 0 ? 0 : num / den;
    };

    if (count === 1) return readSingleRational(dataOffset);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) arr.push(readSingleRational(dataOffset + i * 8));
    return arr;
  }

  return undefined;
}

function formatGpsCoord(coord: unknown): string {
  if (Array.isArray(coord) && coord.length >= 3) {
    const deg = Math.floor(coord[0]);
    const min = Math.floor(coord[1]);
    const sec = Number(coord[2]).toFixed(1);
    return `${deg}° ${min}' ${sec}"`;
  }
  return String(coord);
}
