/** A user-provided image that has been decoded in the browser. */
export interface LoadedImage {
  file: File;
  /** Object URL for previews. Revoke with URL.revokeObjectURL when removed. */
  url: string;
  width: number;
  height: number;
  element: HTMLImageElement;
}

export interface AnalysisStats {
  changedPixels: number;
  unchangedPixels: number;
  totalPixels: number;
  changedPercent: number;
}

export interface AnalysisResult extends AnalysisStats {
  createdAt: string;
  sensitivity: number;
  threshold: number;
  canvasWidth: number;
  canvasHeight: number;
  before: { name: string; width: number; height: number };
  after: { name: string; width: number; height: number };
  /** Later image with changed pixels highlighted. */
  overlayUrl: string;
  /** Pure black/white change mask (white = changed). */
  maskUrl: string;
  /** Both images as drawn on the common analysis canvas. */
  beforeNormalizedUrl: string;
  afterNormalizedUrl: string;
}

export const DIFFERENCE_METRIC =
  "Euclidean distance between corresponding RGB pixel values: sqrt(dR² + dG² + dB²), range 0–441.67";

export const LIMITATIONS = [
  "This is a baseline pixel-difference algorithm, not a trained machine learning model or satellite-specific spectral analysis.",
  "Detected differences do not prove actual environmental change.",
  "Clouds, lighting, seasons, shadows, camera settings, image misalignment and resolution differences can all produce differences.",
  "No geographic registration is performed and no ground area (hectares, km²) is measured.",
  "Results should be validated with additional data before drawing environmental conclusions.",
];
