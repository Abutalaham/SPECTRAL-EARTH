/*
 * Pure pixel-difference logic (no DOM). Kept separate so it can be tested
 * and reused by any future backend.
 */

/** Largest possible RGB Euclidean distance: sqrt(3 * 255²). */
export const MAX_RGB_DISTANCE = Math.sqrt(3 * 255 * 255);

/**
 * Threshold mapping from the sensitivity slider (1–100) to an RGB distance.
 *
 *   threshold = MAX_RGB_DISTANCE × (1 − sensitivity / 100) × 0.6 + 2
 *
 * - sensitivity 1   → ~264 (only very large colour changes count)
 * - sensitivity 50  → ~134.5
 * - sensitivity 100 → 2     (almost any difference counts — many false positives)
 *
 * A pixel is "changed" when its distance is strictly greater than the threshold.
 */
export function sensitivityToThreshold(sensitivity: number): number {
  const s = Math.min(100, Math.max(1, sensitivity));
  return MAX_RGB_DISTANCE * (1 - s / 100) * 0.6 + 2;
}

export interface DifferenceOutput {
  /** 1 = changed, 0 = unchanged, 255 = not analyzed (outside both images). */
  mask: Uint8Array;
  changedPixels: number;
  totalPixels: number;
}

/**
 * Compare two RGBA buffers of identical size.
 * `valid` marks pixels covered by BOTH images; others are skipped.
 */
export function computeDifference(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  threshold: number,
  valid?: Uint8Array,
): DifferenceOutput {
  const count = a.length / 4;
  const mask = new Uint8Array(count);
  // Compare squared distances to avoid a sqrt per pixel.
  const t2 = threshold * threshold;
  let changed = 0;
  let total = 0;
  for (let p = 0; p < count; p++) {
    if (valid && !valid[p]) {
      mask[p] = 255;
      continue;
    }
    const i = p * 4;
    const dr = a[i]! - b[i]!;
    const dg = a[i + 1]! - b[i + 1]!;
    const db = a[i + 2]! - b[i + 2]!;
    total++;
    if (dr * dr + dg * dg + db * db > t2) {
      mask[p] = 1;
      changed++;
    }
  }
  return { mask, changedPixels: changed, totalPixels: total };
}
