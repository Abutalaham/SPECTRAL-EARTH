import { describe, it, expect } from "vitest";
import {
  computeNdviPixel,
  computeNdviRaster,
  computeNdviDifference,
  ndviToColor,
  ndviDiffToColor,
} from "./ndvi";

describe("NDVI Pixel Calculation", () => {
  it("calculates 0 when Red and NIR reflectances are equal", () => {
    const ndvi = computeNdviPixel(1500, 1500);
    expect(ndvi).toBeCloseTo(0.0, 5);
  });

  it("calculates positive NDVI for healthy vegetation (NIR > Red)", () => {
    // Red = 500, NIR = 3500 -> (3500 - 500) / (3500 + 500) = 3000 / 4000 = 0.75
    const ndvi = computeNdviPixel(500, 3500);
    expect(ndvi).toBeCloseTo(0.75, 4);
  });

  it("calculates negative NDVI for water bodies (Red > NIR)", () => {
    // Red = 1200, NIR = 400 -> (400 - 1200) / (400 + 1200) = -800 / 1600 = -0.5
    const ndvi = computeNdviPixel(1200, 400);
    expect(ndvi).toBeCloseTo(-0.5, 4);
  });

  it("handles zero denominator safely by returning null", () => {
    const ndvi = computeNdviPixel(0, 0);
    expect(ndvi).toBeNull();
  });

  it("handles NoData values correctly", () => {
    const ndvi = computeNdviPixel(9999, 1500, 9999);
    expect(ndvi).toBeNull();
  });

  it("handles NaN or non-finite inputs", () => {
    expect(computeNdviPixel(NaN, 1500)).toBeNull();
    expect(computeNdviPixel(1500, Infinity)).toBeNull();
  });
});

describe("NDVI Raster Calculation", () => {
  it("processes full rasters and computes summary statistics accurately", () => {
    // 2x2 raster
    const width = 2;
    const height = 2;
    const red = new Float32Array([500, 1200, 1500, 0]);
    const nir = new Float32Array([3500, 400, 1500, 0]);

    const result = computeNdviRaster(red, nir, width, height);

    expect(result.stats.totalPixels).toBe(4);
    expect(result.stats.validPixels).toBe(3);
    expect(result.stats.invalidPixels).toBe(1);

    // Pixel 0: 0.75
    expect(result.ndvi[0]).toBeCloseTo(0.75, 2);
    // Pixel 1: -0.5
    expect(result.ndvi[1]).toBeCloseTo(-0.5, 2);
    // Pixel 2: 0.0
    expect(result.ndvi[2]).toBeCloseTo(0.0, 2);
    // Pixel 3: invalid (0, 0)
    expect(result.validMask[3]).toBe(0);

    // Mean of (0.75 - 0.5 + 0.0) / 3 = 0.25 / 3 = 0.0833
    expect(result.stats.mean).toBeCloseTo(0.0833, 3);
    expect(result.stats.min).toBeCloseTo(-0.5, 2);
    expect(result.stats.max).toBeCloseTo(0.75, 2);
  });

  it("throws descriptive error on mismatched band dimensions", () => {
    const red = new Float32Array([500, 1000]);
    const nir = new Float32Array([1500]);
    expect(() => computeNdviRaster(red, nir, 2, 1)).toThrow("mismatch");
  });
});

describe("NDVI Difference Calculation", () => {
  it("calculates accurate differences between dates and categorizes loss and gain", () => {
    const width = 3;
    const height = 1;
    // Earlier: 0.8 (healthy), 0.2 (sparse), 0.5 (moderate)
    const earlierNdvi = new Float32Array([0.8, 0.2, 0.5]);
    const earlierMask = new Uint8Array([1, 1, 1]);

    // Later: 0.3 (loss: -0.5), 0.6 (gain: +0.4), 0.52 (stable: +0.02)
    const laterNdvi = new Float32Array([0.3, 0.6, 0.52]);
    const laterMask = new Uint8Array([1, 1, 1]);

    const result = computeNdviDifference(
      earlierNdvi,
      laterNdvi,
      earlierMask,
      laterMask,
      width,
      height,
      10, // 10m Sentinel-2 resolution
    );

    expect(result.stats.validPixels).toBe(3);
    expect(result.stats.candidateLossPixels).toBe(1); // -0.5
    expect(result.stats.candidateGainPixels).toBe(1); // +0.4
    expect(result.stats.stablePixels).toBe(1);        // +0.02

    // Estimated area: 3 pixels * (10m * 10m) = 300 m² = 0.0003 km²
    expect(result.stats.estimatedAreaKm2).toBeCloseTo(0.0003, 5);
  });
});

describe("NDVI Colormaps", () => {
  it("returns dark background for invalid pixels", () => {
    const color = ndviToColor(0.5, false);
    expect(color[3]).toBe(255);
    expect(color[0]).toBeLessThan(20);
  });

  it("returns deep emerald for high NDVI vegetation", () => {
    const color = ndviToColor(0.85, true);
    // Green channel should be significantly higher than red
    expect(color[1]).toBeGreaterThan(color[0]);
  });

  it("returns red for severe negative NDVI difference", () => {
    const color = ndviDiffToColor(-0.4, true);
    expect(color[0]).toBeGreaterThan(200); // High red
    expect(color[1]).toBeLessThan(50);
  });
});
