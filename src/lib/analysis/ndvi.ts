/**
 * Pure scientific Sentinel-2 NDVI calculation and raster processing engine.
 * Isolated from DOM and UI for independent unit testing and reusability.
 *
 * Formula: NDVI = (NIR - Red) / (NIR + Red)
 * Sentinel-2 Bands:
 *   B04 = Red (central wavelength ~665 nm, 10m resolution)
 *   B08 = Near-Infrared (central wavelength ~842 nm, 10m resolution)
 */

export interface GeoTiffMetadata {
  width: number;
  height: number;
  samplesPerPixel: number;
  bitsPerSample?: number;
  noDataValue?: number;
  pixelScaleMeters?: number; // ModelPixelScaleTag[0]
  crs?: string;
  date?: string;
}

export interface ParsedBand {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  data: Float32Array;
  metadata: GeoTiffMetadata;
}

export interface NdviSummaryStats {
  validPixels: number;
  invalidPixels: number;
  totalPixels: number;
  validPercent: number;
  min: number;
  max: number;
  mean: number;
}

export interface DateNdviResult {
  ndvi: Float32Array;
  validMask: Uint8Array; // 1 = valid, 0 = invalid / nodata
  stats: NdviSummaryStats;
  previewUrl: string;
}

export interface NdviDifferenceStats {
  validPixels: number;
  invalidPixels: number;
  totalPixels: number;
  validPercent: number;
  meanChange: number;
  minChange: number;
  maxChange: number;
  candidateLossPixels: number; // diff <= -0.1
  candidateGainPixels: number; // diff >= 0.1
  stablePixels: number;        // -0.1 < diff < 0.1
  candidateLossPercent: number;
  candidateGainPercent: number;
  stablePercent: number;
  estimatedAreaKm2?: number; // Only if pixelScaleMeters is verified
}

export interface SpectralAnalysisResult {
  createdAt: string;
  width: number;
  height: number;
  pixelScaleMeters?: number;
  earlierDate: string;
  laterDate: string;
  earlierFiles: { redName: string; nirName: string; redSize: number; nirSize: number };
  laterFiles: { redName: string; nirName: string; redSize: number; nirSize: number };
  earlier: DateNdviResult;
  later: DateNdviResult;
  diff: {
    data: Float32Array;
    validMask: Uint8Array;
    stats: NdviDifferenceStats;
    previewUrl: string;
  };
}

/**
 * Calculates a single NDVI value from Red and NIR reflectances.
 * Returns null if either value is invalid, NoData, or if the denominator is ~0.
 */
export function computeNdviPixel(red: number, nir: number, noDataValue?: number): number | null {
  if (Number.isNaN(red) || Number.isNaN(nir)) return null;
  if (!Number.isFinite(red) || !Number.isFinite(nir)) return null;
  if (noDataValue !== undefined && (red === noDataValue || nir === noDataValue)) return null;

  // Sentinel-2 L2A zero reflectance is frequently used as swath/nodata
  if (red === 0 && nir === 0) return null;

  const denom = nir + red;
  // Reject zero or negligible denominator to avoid division by zero
  if (Math.abs(denom) < 1e-6) return null;

  const ndvi = (nir - red) / denom;

  // Numerical tolerance: clamp strictly to physical range [-1, 1]
  if (ndvi < -1) return -1;
  if (ndvi > 1) return 1;
  return ndvi;
}

/**
 * Computes the NDVI raster and summary statistics for a given pair of Red and NIR bands.
 */
export function computeNdviRaster(
  red: Float32Array,
  nir: Float32Array,
  width: number,
  height: number,
  noDataValue?: number,
): { ndvi: Float32Array; validMask: Uint8Array; stats: NdviSummaryStats } {
  const total = width * height;
  if (red.length !== total || nir.length !== total) {
    throw new Error(
      `Band dimensions mismatch: Red has ${red.length} pixels, NIR has ${nir.length} pixels (expected ${total}).`,
    );
  }

  const ndvi = new Float32Array(total);
  const validMask = new Uint8Array(total);

  let valid = 0;
  let sum = 0;
  let min = 1.0;
  let max = -1.0;

  for (let i = 0; i < total; i++) {
    const val = computeNdviPixel(red[i]!, nir[i]!, noDataValue);
    if (val === null) {
      ndvi[i] = 0;
      validMask[i] = 0;
    } else {
      ndvi[i] = val;
      validMask[i] = 1;
      valid++;
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  const invalid = total - valid;
  const mean = valid > 0 ? sum / valid : 0;

  return {
    ndvi,
    validMask,
    stats: {
      validPixels: valid,
      invalidPixels: invalid,
      totalPixels: total,
      validPercent: total > 0 ? (valid / total) * 100 : 0,
      min: valid > 0 ? min : 0,
      max: valid > 0 ? max : 0,
      mean,
    },
  };
}

/**
 * Computes difference between two NDVI rasters:
 *   ΔNDVI = NDVI_later - NDVI_earlier
 * Only evaluates pixels that are valid in BOTH dates.
 */
export function computeNdviDifference(
  earlierNdvi: Float32Array,
  laterNdvi: Float32Array,
  earlierMask: Uint8Array,
  laterMask: Uint8Array,
  width: number,
  height: number,
  pixelScaleMeters?: number,
): { diff: Float32Array; validMask: Uint8Array; stats: NdviDifferenceStats } {
  const total = width * height;
  const diff = new Float32Array(total);
  const validMask = new Uint8Array(total);

  let valid = 0;
  let sum = 0;
  let min = 2.0;
  let max = -2.0;

  let loss = 0;
  let gain = 0;
  let stable = 0;

  for (let i = 0; i < total; i++) {
    if (!earlierMask[i] || !laterMask[i]) {
      diff[i] = 0;
      validMask[i] = 0;
      continue;
    }

    const d = laterNdvi[i]! - earlierNdvi[i]!;
    diff[i] = d;
    validMask[i] = 1;
    valid++;
    sum += d;

    if (d < min) min = d;
    if (d > max) max = d;

    if (d <= -0.1) loss++;
    else if (d >= 0.1) gain++;
    else stable++;
  }

  const mean = valid > 0 ? sum / valid : 0;
  const invalid = total - valid;

  // Calculate estimated area only if verified pixel scale exists (e.g. 10m -> 100m² = 0.0001 km² per pixel)
  let estimatedAreaKm2: number | undefined;
  if (pixelScaleMeters && pixelScaleMeters > 0) {
    const areaPerPixelKm2 = (pixelScaleMeters * pixelScaleMeters) / 1_000_000;
    estimatedAreaKm2 = valid * areaPerPixelKm2;
  }

  return {
    diff,
    validMask,
    stats: {
      validPixels: valid,
      invalidPixels: invalid,
      totalPixels: total,
      validPercent: total > 0 ? (valid / total) * 100 : 0,
      meanChange: mean,
      minChange: valid > 0 ? min : 0,
      maxChange: valid > 0 ? max : 0,
      candidateLossPixels: loss,
      candidateGainPixels: gain,
      stablePixels: stable,
      candidateLossPercent: valid > 0 ? (loss / valid) * 100 : 0,
      candidateGainPercent: valid > 0 ? (gain / valid) * 100 : 0,
      stablePercent: valid > 0 ? (stable / valid) * 100 : 0,
      estimatedAreaKm2,
    },
  };
}

/**
 * Scientific color lookup for an NDVI value [-1, 1].
 * Returns [R, G, B, A] in range 0-255.
 */
export function ndviToColor(val: number, isValid: boolean): [number, number, number, number] {
  if (!isValid) return [12, 18, 15, 255]; // Charcoal dark background for invalid

  if (val < 0.0) {
    // Water, ice, clouds, shadows: Deep Blue / Slate
    return [30, 64, 110, 255];
  } else if (val < 0.2) {
    // Bare soil, sand, rocks, urban: Sandy / Tan
    const t = val / 0.2;
    return [Math.round(180 + t * 20), Math.round(150 + t * 20), Math.round(110 + t * 10), 255];
  } else if (val < 0.4) {
    // Sparse vegetation, scrubland: Pale yellow-green
    const t = (val - 0.2) / 0.2;
    return [Math.round(200 - t * 60), Math.round(190 + t * 20), Math.round(100 - t * 40), 255];
  } else if (val < 0.6) {
    // Moderate vegetation: Leaf green
    const t = (val - 0.4) / 0.2;
    return [Math.round(140 - t * 80), Math.round(210 - t * 30), Math.round(60 - t * 10), 255];
  } else {
    // Dense vegetation / canopy: Deep Emerald Green
    const t = Math.min(1, (val - 0.6) / 0.4);
    return [Math.round(60 - t * 40), Math.round(180 - t * 60), Math.round(50 + t * 10), 255];
  }
}

/**
 * Diverging color lookup for ΔNDVI [-1, 1].
 * Negative: Red/Orange (vegetation loss).
 * Zero: Neutral Slate.
 * Positive: Emerald/Cyan (vegetation gain).
 */
export function ndviDiffToColor(val: number, isValid: boolean): [number, number, number, number] {
  if (!isValid) return [12, 18, 15, 255];

  if (val <= -0.25) {
    // Severe decrease: Deep Crimson Red
    return [220, 38, 38, 255];
  } else if (val <= -0.1) {
    // Moderate decrease: Orange / Amber
    return [249, 115, 22, 255];
  } else if (val < -0.04) {
    // Slight decrease: Yellow / Ochre
    return [234, 179, 8, 255];
  } else if (val <= 0.04) {
    // Stable: Neutral Slate Gray
    return [71, 85, 105, 255];
  } else if (val < 0.1) {
    // Slight increase: Light Sage
    return [132, 204, 22, 255];
  } else if (val < 0.25) {
    // Moderate increase: Emerald
    return [16, 185, 129, 255];
  } else {
    // Significant increase: Vivid Teal
    return [6, 182, 212, 255];
  }
}

/**
 * Renders a raster array to an HTML Canvas Element and returns object URL.
 */
export async function rasterToCanvasUrl(
  data: Float32Array,
  validMask: Uint8Array,
  width: number,
  height: number,
  colorFn: (val: number, isValid: boolean) => [number, number, number, number],
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not acquire 2D canvas context.");

  const imgData = ctx.createImageData(width, height);
  const total = width * height;

  for (let i = 0; i < total; i++) {
    const [r, g, b, a] = colorFn(data[i]!, Boolean(validMask[i]));
    const idx = i * 4;
    imgData.data[idx] = r;
    imgData.data[idx + 1] = g;
    imgData.data[idx + 2] = b;
    imgData.data[idx + 3] = a;
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode canvas to PNG blob."));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

/**
 * Lazy parser for GeoTIFF (.tif, .tiff) files.
 * Uses geotiff.js loaded dynamically on demand.
 */
export async function parseGeoTiff(file: File): Promise<ParsedBand> {
  // Validate basic file extension
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".tif") && !lower.endsWith(".tiff")) {
    throw new Error(`File "${file.name}" is not a recognized TIFF file (.tif or .tiff).`);
  }

  // Lazy load geotiff.js
  const { fromArrayBuffer } = await import("geotiff");
  const buffer = await file.arrayBuffer();

  let tiff;
  try {
    tiff = await fromArrayBuffer(buffer);
  } catch {
    throw new Error(`Failed to decode GeoTIFF in "${file.name}". Ensure it is an uncorrupted TIFF.`);
  }

  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const samplesPerPixel = image.getSamplesPerPixel();

  // Read first band
  const rasters = await image.readRasters({ interleave: false });
  if (!rasters || rasters.length === 0) {
    throw new Error(`GeoTIFF "${file.name}" contains no raster data bands.`);
  }

  const rawBand = rasters[0] as TypedArray;
  const total = width * height;
  const data = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    data[i] = Number(rawBand[i]);
  }

  const fileDir = image.getFileDirectory?.() || {};
  let noDataValue: number | undefined;
  if (typeof fileDir.GDAL_NODATA === "string") {
    noDataValue = parseFloat(fileDir.GDAL_NODATA);
  }

  let pixelScaleMeters: number | undefined;
  if (Array.isArray(fileDir.ModelPixelScaleTag) && fileDir.ModelPixelScaleTag.length > 0) {
    pixelScaleMeters = fileDir.ModelPixelScaleTag[0];
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    width,
    height,
    data,
    metadata: {
      width,
      height,
      samplesPerPixel,
      bitsPerSample: Array.isArray(fileDir.BitsPerSample) ? fileDir.BitsPerSample[0] : undefined,
      noDataValue,
      pixelScaleMeters,
    },
  };
}

type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;
