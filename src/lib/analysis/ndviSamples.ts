import { ParsedBand } from "./ndvi";

/**
 * Creates a calibrated Sentinel-2 Level-2A sample dataset (128x128 pixels at 10m ground resolution).
 * Simulates a verified environmental scenario:
 *   - Observation A (June): Peak Summer Canopy (high NDVI 0.65 - 0.85).
 *   - Observation B (September): Post-Harvest / Canopy Senescence with a central agricultural field transition.
 *   - Water reservoir (negative NDVI ~ -0.45).
 *   - Urban/rocky roads (low NDVI ~ 0.12).
 */
export function generateSampleSentinelBands(): {
  earlierRed: ParsedBand;
  earlierNir: ParsedBand;
  laterRed: ParsedBand;
  laterNir: ParsedBand;
} {
  const width = 128;
  const height = 128;
  const total = width * height;

  const earlierRedData = new Float32Array(total);
  const earlierNirData = new Float32Array(total);
  const laterRedData = new Float32Array(total);
  const laterNirData = new Float32Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;

      // Feature 1: Water body in top-left (x < 35 && y < 35)
      const distWater = Math.hypot(x - 18, y - 18);
      if (distWater < 16) {
        // Water: high red absorption, near-total NIR absorption -> NDVI ~ -0.4
        earlierRedData[i] = 450 + Math.sin(x * 0.5) * 20;
        earlierNirData[i] = 180 + Math.cos(y * 0.5) * 15;
        laterRedData[i] = 460 + Math.sin(x * 0.5) * 20;
        laterNirData[i] = 190 + Math.cos(y * 0.5) * 15;
        continue;
      }

      // Feature 2: Road/Bare Ridge running across diagonally (y ~ 0.5x + 30)
      const distRoad = Math.abs(y - (0.4 * x + 40));
      if (distRoad < 2.5) {
        // Bare soil/paved: Red ~ 1400, NIR ~ 1600 -> NDVI ~ 0.06
        earlierRedData[i] = 1450;
        earlierNirData[i] = 1620;
        laterRedData[i] = 1480;
        laterNirData[i] = 1640;
        continue;
      }

      // Feature 3: Agricultural Field in center (45 <= x <= 95 && 50 <= y <= 95)
      const inField = x >= 45 && x <= 95 && y >= 50 && y <= 95;
      if (inField) {
        // Earlier: Dense green crop canopy (Red ~ 350, NIR ~ 3800 -> NDVI ~ 0.83)
        earlierRedData[i] = 340 + ((x + y) % 15) * 2;
        earlierNirData[i] = 3850 + ((x * y) % 25) * 3;

        // Later: Post-harvest bare soil / stubble (Red ~ 1650, NIR ~ 2100 -> NDVI ~ 0.12)
        // This creates a candidate vegetation loss of ΔNDVI ~ -0.71
        laterRedData[i] = 1620 + ((x + y) % 20) * 3;
        laterNirData[i] = 2050 + ((x * y) % 30) * 3;
        continue;
      }

      // Feature 4: Surrounding mixed forest/grassland
      const baseVariation = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 60;
      // Earlier forest: Red ~ 400, NIR ~ 3200 -> NDVI ~ 0.77
      earlierRedData[i] = 410 + baseVariation;
      earlierNirData[i] = 3200 + baseVariation * 2;

      // Later forest: Slight seasonal foliage change: Red ~ 520, NIR ~ 2900 -> NDVI ~ 0.69
      laterRedData[i] = 510 + baseVariation;
      laterNirData[i] = 2920 + baseVariation * 2;
    }
  }

  const metadata = {
    width,
    height,
    samplesPerPixel: 1,
    pixelScaleMeters: 10, // 10m Sentinel-2 ground sampling distance
    crs: "EPSG:32632 (WGS 84 / UTM zone 32N)",
  };

  return {
    earlierRed: {
      fileName: "T32TMR_20260615T102021_B04_10m.jp2.tif",
      fileSize: 32768,
      width,
      height,
      data: earlierRedData,
      metadata: { ...metadata, date: "2026-06-15" },
    },
    earlierNir: {
      fileName: "T32TMR_20260615T102021_B08_10m.jp2.tif",
      fileSize: 32768,
      width,
      height,
      data: earlierNirData,
      metadata: { ...metadata, date: "2026-06-15" },
    },
    laterRed: {
      fileName: "T32TMR_20260920T102021_B04_10m.jp2.tif",
      fileSize: 32768,
      width,
      height,
      data: laterRedData,
      metadata: { ...metadata, date: "2026-09-20" },
    },
    laterNir: {
      fileName: "T32TMR_20260920T102021_B08_10m.jp2.tif",
      fileSize: 32768,
      width,
      height,
      data: laterNirData,
      metadata: { ...metadata, date: "2026-09-20" },
    },
  };
}
