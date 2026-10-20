/* Browser-side change detection: loads images, normalizes them to a common
 * canvas, runs computeDifference and renders the overlay + mask. */
import { computeDifference, sensitivityToThreshold } from "./difference";
import type { AnalysisResult, LoadedImage } from "./types";

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
/** Longest side of the analysis canvas, keeps processing fast on phones. */
export const MAX_ANALYSIS_SIDE = 1024;

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Unsupported file type. Use PNG, JPEG or WebP.";
  if (file.size > MAX_FILE_BYTES) return "File is larger than 20 MB.";
  if (file.size === 0) return "File is empty.";
  return null;
}

export function loadImageFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        URL.revokeObjectURL(url);
        reject(new Error("Image has no readable dimensions."));
        return;
      }
      resolve({ file, url, width: img.naturalWidth, height: img.naturalHeight, element: img });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The file could not be decoded as an image."));
    };
    img.src = url;
  });
}

/** Rectangle that fits an image inside W×H while preserving aspect ratio. */
function containRect(iw: number, ih: number, W: number, H: number) {
  const s = Math.min(W / iw, H / ih);
  const w = Math.round(iw * s);
  const h = Math.round(ih * s);
  return { x: Math.floor((W - w) / 2), y: Math.floor((H - h) / 2), w, h };
}

function canvasToUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(URL.createObjectURL(b)) : reject(new Error("Could not encode image."))), "image/png"),
  );
}

export async function runAnalysis(
  before: LoadedImage,
  after: LoadedImage,
  sensitivity: number,
): Promise<AnalysisResult> {
  // Common canvas uses the earlier image's aspect ratio.
  const scale = Math.min(1, MAX_ANALYSIS_SIDE / Math.max(before.width, before.height));
  const W = Math.max(1, Math.round(before.width * scale));
  const H = Math.max(1, Math.round(before.height * scale));

  const make = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    return { c, ctx };
  };

  const A = make();
  const B = make();
  const ra = containRect(before.width, before.height, W, H);
  const rb = containRect(after.width, after.height, W, H);
  A.ctx.drawImage(before.element, ra.x, ra.y, ra.w, ra.h);
  B.ctx.drawImage(after.element, rb.x, rb.y, rb.w, rb.h);

  let da: ImageData, db: ImageData;
  try {
    da = A.ctx.getImageData(0, 0, W, H);
    db = B.ctx.getImageData(0, 0, W, H);
  } catch {
    throw new Error("Pixel data could not be read from these images (browser security restriction).");
  }

  // Only pixels covered by both images are analyzed (handles differing aspect ratios).
  const valid = new Uint8Array(W * H);
  const x0 = Math.max(ra.x, rb.x), x1 = Math.min(ra.x + ra.w, rb.x + rb.w);
  const y0 = Math.max(ra.y, rb.y), y1 = Math.min(ra.y + ra.h, rb.y + rb.h);
  for (let y = y0; y < y1; y++) valid.fill(1, y * W + x0, y * W + x1);

  const threshold = sensitivityToThreshold(sensitivity);
  const diff = computeDifference(da.data, db.data, threshold, valid);

  // Overlay: desaturated later image + bright magenta for changed pixels.
  const overlay = make();
  const ov = overlay.ctx.createImageData(W, H);
  const mask = make();
  const mk = mask.ctx.createImageData(W, H);
  for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    const m = diff.mask[p];
    const g = 0.3 * db.data[i]! + 0.59 * db.data[i + 1]! + 0.11 * db.data[i + 2]!;
    if (m === 1) {
      ov.data[i] = 255; ov.data[i + 1] = 30; ov.data[i + 2] = 200;
      mk.data[i] = mk.data[i + 1] = mk.data[i + 2] = 255;
    } else if (m === 255) {
      ov.data[i] = ov.data[i + 1] = ov.data[i + 2] = 20;
      mk.data[i] = 60; mk.data[i + 1] = 60; mk.data[i + 2] = 60;
    } else {
      ov.data[i] = ov.data[i + 1] = ov.data[i + 2] = g * 0.6;
    }
    ov.data[i + 3] = 255;
    mk.data[i + 3] = 255;
  }
  overlay.ctx.putImageData(ov, 0, 0);
  mask.ctx.putImageData(mk, 0, 0);

  const [overlayUrl, maskUrl, beforeNormalizedUrl, afterNormalizedUrl] = await Promise.all([
    canvasToUrl(overlay.c), canvasToUrl(mask.c), canvasToUrl(A.c), canvasToUrl(B.c),
  ]);

  return {
    createdAt: new Date().toISOString(),
    sensitivity,
    threshold,
    canvasWidth: W,
    canvasHeight: H,
    changedPixels: diff.changedPixels,
    unchangedPixels: diff.totalPixels - diff.changedPixels,
    totalPixels: diff.totalPixels,
    changedPercent: diff.totalPixels ? (diff.changedPixels / diff.totalPixels) * 100 : 0,
    before: { name: before.file.name, width: before.width, height: before.height },
    after: { name: after.file.name, width: after.width, height: after.height },
    overlayUrl, maskUrl, beforeNormalizedUrl, afterNormalizedUrl,
  };
}

export function revokeResult(r: AnalysisResult | null) {
  if (!r) return;
  [r.overlayUrl, r.maskUrl, r.beforeNormalizedUrl, r.afterNormalizedUrl].forEach((u) => URL.revokeObjectURL(u));
}
