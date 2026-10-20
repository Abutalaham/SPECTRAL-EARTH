import { DIFFERENCE_METRIC, LIMITATIONS, type AnalysisResult } from "./types";

export function buildReport(r: AnalysisResult) {
  return {
    project: "Spectral Earth — Satellite-Based Environmental Change Detection System",
    analysisDate: r.createdAt,
    images: {
      earlier: { filename: r.before.name, width: r.before.width, height: r.before.height },
      later: { filename: r.after.name, width: r.after.width, height: r.after.height },
    },
    analysisCanvas: { width: r.canvasWidth, height: r.canvasHeight },
    differenceMetric: DIFFERENCE_METRIC,
    sensitivity: r.sensitivity,
    threshold: Number(r.threshold.toFixed(3)),
    changedPixelCount: r.changedPixels,
    unchangedPixelCount: r.unchangedPixels,
    totalAnalyzedPixelCount: r.totalPixels,
    changedPixelPercentage: Number(r.changedPercent.toFixed(4)),
    limitations: LIMITATIONS,
  };
}

export function buildCsv(r: AnalysisResult) {
  const rows: [string, string | number][] = [
    ["analysis_date", r.createdAt],
    ["earlier_image", r.before.name],
    ["later_image", r.after.name],
    ["canvas_width", r.canvasWidth],
    ["canvas_height", r.canvasHeight],
    ["sensitivity", r.sensitivity],
    ["threshold", r.threshold.toFixed(3)],
    ["changed_pixels", r.changedPixels],
    ["unchanged_pixels", r.unchangedPixels],
    ["total_analyzed_pixels", r.totalPixels],
    ["changed_percent", r.changedPercent.toFixed(4)],
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return ["metric,value", ...rows.map(([k, v]) => `${k},${esc(v)}`)].join("\n");
}

export function interpretation(r: AnalysisResult) {
  const pct = r.changedPercent.toFixed(1);
  const level =
    r.changedPercent < 2 ? "very few" : r.changedPercent < 10 ? "a limited share of" : r.changedPercent < 30 ? "a substantial share of" : "a large share of";
  return `The selected threshold (sensitivity ${r.sensitivity}) identified ${pct}% of analyzed pixels — ${level} the image — as different between the two images. These differences may reflect land-cover changes, illumination differences, shadows, clouds, seasonal variation, or image misalignment. Additional validation is required before drawing environmental conclusions.`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadUrl(url: string, filename: string) {
  const blob = await (await fetch(url)).blob();
  downloadBlob(blob, filename);
}
