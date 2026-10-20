import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Sparkles, BookOpen, Layers, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectralUploadCard } from "./SpectralUploadCard";
import { CopernicusHelpModal } from "./CopernicusHelpModal";
import { SpectralResultsDashboard } from "./SpectralResultsDashboard";
import {
  ParsedBand,
  parseGeoTiff,
  computeNdviRaster,
  computeNdviDifference,
  rasterToCanvasUrl,
  ndviToColor,
  ndviDiffToColor,
  SpectralAnalysisResult,
} from "@/lib/analysis/ndvi";
import { generateSampleSentinelBands } from "@/lib/analysis/ndviSamples";

export function SpectralAnalysisView() {
  const [earlierRed, setEarlierRed] = useState<ParsedBand | null>(null);
  const [earlierNir, setEarlierNir] = useState<ParsedBand | null>(null);
  const [laterRed, setLaterRed] = useState<ParsedBand | null>(null);
  const [laterNir, setLaterNir] = useState<ParsedBand | null>(null);

  const [earlierDate, setEarlierDate] = useState("2026-06-15");
  const [laterDate, setLaterDate] = useState("2026-09-20");

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [runError, setRunError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const [result, setResult] = useState<SpectralAnalysisResult | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result.earlier.previewUrl);
        URL.revokeObjectURL(result.later.previewUrl);
        URL.revokeObjectURL(result.diff.previewUrl);
      }
    };
  }, [result]);

  const handleFileUpload = async (slot: string, file: File) => {
    setLoadingSlot(slot);
    setErrors((prev) => ({ ...prev, [slot]: null }));
    try {
      const parsed = await parseGeoTiff(file);

      if (slot === "earlierRed") setEarlierRed(parsed);
      else if (slot === "earlierNir") setEarlierNir(parsed);
      else if (slot === "laterRed") setLaterRed(parsed);
      else if (slot === "laterNir") setLaterNir(parsed);
      setResult(null);

      // Auto-extract date from filename if follows Sentinel-2 pattern (e.g. 20260615)
      const dateMatch = file.name.match(/(\d{4})(\d{2})(\d{2})/);
      if (dateMatch) {
        const formatted = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        if (slot.startsWith("earlier")) setEarlierDate(formatted);
        else setLaterDate(formatted);
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [slot]: (err as Error).message }));
    } finally {
      setLoadingSlot(null);
    }
  };

  const loadSampleData = () => {
    const samples = generateSampleSentinelBands();
    setResult(null);
    setEarlierRed(samples.earlierRed);
    setEarlierNir(samples.earlierNir);
    setLaterRed(samples.laterRed);
    setLaterNir(samples.laterNir);
    setEarlierDate("2026-06-15");
    setLaterDate("2026-09-20");
    setErrors({});
    setRunError(null);
  };

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessing(false);
    setProgressMsg("");
  };

  const runAnalysis = async () => {
    if (!earlierRed || !earlierNir || !laterRed || !laterNir || processing) return;

    // Dimension validation
    if (earlierRed.width !== earlierNir.width || earlierRed.height !== earlierNir.height) {
      setRunError(
        `Earlier B04 (${earlierRed.width}×${earlierRed.height}) and B08 (${earlierNir.width}×${earlierNir.height}) dimensions do not match.`,
      );
      return;
    }
    if (laterRed.width !== laterNir.width || laterRed.height !== laterNir.height) {
      setRunError(
        `Later B04 (${laterRed.width}×${laterRed.height}) and B08 (${laterNir.width}×${laterNir.height}) dimensions do not match.`,
      );
      return;
    }
    if (earlierRed.width !== laterRed.width || earlierRed.height !== laterRed.height) {
      setRunError(
        `Earlier observation (${earlierRed.width}×${earlierRed.height}) and Later observation (${laterRed.width}×${laterRed.height}) dimensions do not match. Please ensure both covers identical spatial extents.`,
      );
      return;
    }

    setProcessing(true);
    setRunError(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const W = earlierRed.width;
      const H = earlierRed.height;

      // Step 1: Calculate Earlier NDVI
      setProgressMsg(`Computing Baseline NDVI for ${earlierDate} (${W}×${H} raster)...`);
      await new Promise((r) => setTimeout(r, 40));
      if (controller.signal.aborted) return;

      const earlierResult = computeNdviRaster(earlierRed.data, earlierNir.data, W, H, {
        red: earlierRed.metadata.noDataValue,
        nir: earlierNir.metadata.noDataValue,
      });

      // Step 2: Calculate Later NDVI
      setProgressMsg(`Computing Comparison NDVI for ${laterDate}...`);
      await new Promise((r) => setTimeout(r, 40));
      if (controller.signal.aborted) return;

      const laterResult = computeNdviRaster(laterRed.data, laterNir.data, W, H, {
        red: laterRed.metadata.noDataValue,
        nir: laterNir.metadata.noDataValue,
      });

      // Step 3: Compute Difference
      setProgressMsg("Calculating ΔNDVI difference raster and vegetation shifts...");
      await new Promise((r) => setTimeout(r, 40));
      if (controller.signal.aborted) return;

      const pixelScale = earlierRed.metadata.pixelScaleMeters;
      const diffResult = computeNdviDifference(
        earlierResult.ndvi,
        laterResult.ndvi,
        earlierResult.validMask,
        laterResult.validMask,
        W,
        H,
        pixelScale,
      );

      // Step 4: Render Visual Previews
      setProgressMsg("Generating scientific colormap previews...");
      const [earlierUrl, laterUrl, diffUrl] = await Promise.all([
        rasterToCanvasUrl(earlierResult.ndvi, earlierResult.validMask, W, H, ndviToColor),
        rasterToCanvasUrl(laterResult.ndvi, laterResult.validMask, W, H, ndviToColor),
        rasterToCanvasUrl(diffResult.diff, diffResult.validMask, W, H, ndviDiffToColor),
      ]);

      if (controller.signal.aborted) {
        [earlierUrl, laterUrl, diffUrl].forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      const newResult: SpectralAnalysisResult = {
        createdAt: new Date().toISOString(),
        width: W,
        height: H,
        ...(pixelScale !== undefined ? { pixelScaleMeters: pixelScale } : {}),
        earlierDate,
        laterDate,
        earlierFiles: {
          redName: earlierRed.fileName,
          nirName: earlierNir.fileName,
          redSize: earlierRed.fileSize,
          nirSize: earlierNir.fileSize,
        },
        laterFiles: {
          redName: laterRed.fileName,
          nirName: laterNir.fileName,
          redSize: laterRed.fileSize,
          nirSize: laterNir.fileSize,
        },
        earlier: {
          ndvi: earlierResult.ndvi,
          validMask: earlierResult.validMask,
          stats: earlierResult.stats,
          previewUrl: earlierUrl,
        },
        later: {
          ndvi: laterResult.ndvi,
          validMask: laterResult.validMask,
          stats: laterResult.stats,
          previewUrl: laterUrl,
        },
        diff: {
          data: diffResult.diff,
          validMask: diffResult.validMask,
          stats: diffResult.stats,
          previewUrl: diffUrl,
        },
      };

      setResult(newResult);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (err) {
      if (!controller.signal.aborted) {
        setRunError((err as Error).message);
      }
    } finally {
      setProcessing(false);
      setProgressMsg("");
      abortControllerRef.current = null;
    }
  };

  const resetAll = () => {
    cancelAnalysis();
    setEarlierRed(null);
    setEarlierNir(null);
    setLaterRed(null);
    setLaterNir(null);
    setErrors({});
    setRunError(null);
    setResult(null);
  };

  const isReady = Boolean(earlierRed && earlierNir && laterRed && laterNir);

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
              SENTINEL-2 SPECTRAL ANALYSIS (BETA)
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Compute true Normalized Difference Vegetation Index (NDVI) from 10m raw Level-2A GeoTIFF bands.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHelpModal(true)} className="text-xs gap-1.5 border-emerald-500/30">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span>How to get Sentinel-2 Data</span>
          </Button>

          <Button variant="outline" size="sm" onClick={loadSampleData} className="text-xs gap-1.5 border-emerald-500/30">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Load Synthetic Sample</span>
          </Button>
        </div>
      </div>

      {/* Observation 1: Earlier Date Bands */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-primary">OBSERVATION 1 (BASELINE)</span>
            <span className="text-xs text-muted-foreground">· Date:</span>
            <input
              type="date"
              value={earlierDate}
              onChange={(e) => {
                setEarlierDate(e.target.value);
                setResult(null);
              }}
              className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SpectralUploadCard
            label="Baseline Red Band"
            bandCode="B04 (Red)"
            bandHint="665 nm · 10m"
            parsedBand={earlierRed}
            error={errors["earlierRed"] ?? null}
            loading={loadingSlot === "earlierRed"}
            onFileSelect={(f) => handleFileUpload("earlierRed", f)}
            onRemove={() => {
              setEarlierRed(null);
              setResult(null);
            }}
          />
          <SpectralUploadCard
            label="Baseline Near-Infrared Band"
            bandCode="B08 (NIR)"
            bandHint="842 nm · 10m"
            parsedBand={earlierNir}
            error={errors["earlierNir"] ?? null}
            loading={loadingSlot === "earlierNir"}
            onFileSelect={(f) => handleFileUpload("earlierNir", f)}
            onRemove={() => {
              setEarlierNir(null);
              setResult(null);
            }}
          />
        </div>
      </section>

      {/* Observation 2: Later Date Bands */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">OBSERVATION 2 (COMPARISON)</span>
            <span className="text-xs text-muted-foreground">· Date:</span>
            <input
              type="date"
              value={laterDate}
              onChange={(e) => {
                setLaterDate(e.target.value);
                setResult(null);
              }}
              className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SpectralUploadCard
            label="Comparison Red Band"
            bandCode="B04 (Red)"
            bandHint="665 nm · 10m"
            parsedBand={laterRed}
            error={errors["laterRed"] ?? null}
            loading={loadingSlot === "laterRed"}
            onFileSelect={(f) => handleFileUpload("laterRed", f)}
            onRemove={() => {
              setLaterRed(null);
              setResult(null);
            }}
          />
          <SpectralUploadCard
            label="Comparison Near-Infrared Band"
            bandCode="B08 (NIR)"
            bandHint="842 nm · 10m"
            parsedBand={laterNir}
            error={errors["laterNir"] ?? null}
            loading={loadingSlot === "laterNir"}
            onFileSelect={(f) => handleFileUpload("laterNir", f)}
            onRemove={() => {
              setLaterNir(null);
              setResult(null);
            }}
          />
        </div>
      </section>

      {/* Action / Trigger Bar */}
      <div className="rounded-xl border border-emerald-500/20 bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={runAnalysis}
              disabled={!isReady || processing}
              className="gap-2 px-6"
            >
              {processing ? <Layers className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              <span>{processing ? "Computing..." : "Run NDVI Spectral Analysis"}</span>
            </Button>

            {processing && (
              <Button variant="destructive" size="sm" onClick={cancelAnalysis} className="gap-1.5">
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}

            <Button variant="ghost" onClick={resetAll} disabled={processing} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            {isReady ? "Ready: 4 bands configured" : "Requires 4 bands (2 Red, 2 NIR)"}
          </p>
        </div>

        {processing && progressMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-emerald-950/20 p-3 text-xs text-accent">
            <Layers className="h-4 w-4 shrink-0 animate-spin" />
            <span>{progressMsg}</span>
          </div>
        )}

        {runError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{runError}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {result && <SpectralResultsDashboard result={result} />}
      </div>

      {/* Help Modal */}
      {showHelpModal && <CopernicusHelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
}
