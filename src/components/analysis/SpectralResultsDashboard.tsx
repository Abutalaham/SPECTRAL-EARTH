import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, ShieldCheck, Compass, Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectralAnalysisResult } from "@/lib/analysis/ndvi";

interface SpectralResultsProps {
  result: SpectralAnalysisResult;
}

type ViewMode = "diff" | "earlier" | "later";

export function SpectralResultsDashboard({ result }: SpectralResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("diff");

  const downloadDiffPng = () => {
    const a = document.createElement("a");
    a.href = result.diff.previewUrl;
    a.download = `spectral-earth-ndvi-diff-${result.earlierDate}-to-${result.laterDate}.png`;
    a.click();
  };

  const downloadJson = () => {
    const payload = {
      project: "Spectral Earth — Satellite-Based Environmental Change Detection System",
      analysisType: "Sentinel-2 Multispectral NDVI Analysis",
      generatedAt: result.createdAt,
      spatialMetadata: {
        width: result.width,
        height: result.height,
        pixelScaleMeters: result.pixelScaleMeters ?? "Unspecified in GeoTIFF tags",
        totalRasterPixels: result.width * result.height,
      },
      observations: {
        earlier: {
          date: result.earlierDate,
          files: result.earlierFiles,
          stats: result.earlier.stats,
        },
        later: {
          date: result.laterDate,
          files: result.laterFiles,
          stats: result.later.stats,
        },
      },
      ndviDifference: {
        formula: "NDVI_diff = NDVI_later - NDVI_earlier",
        stats: result.diff.stats,
        candidateChangeCategories: {
          loss: "diff <= -0.1 (candidate canopy/vegetation decrease)",
          stable: "-0.1 < diff < 0.1 (no significant spectral change)",
          gain: "diff >= 0.1 (candidate canopy/vegetation increase)",
        },
      },
      scientificDisclaimer:
        "NDVI differences do not automatically confirm deforestation or environmental damage. Seasonality, clouds, harvesting, and sensor angle can affect spectral indices. Ground-truthing is required.",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spectral-earth-ndvi-report-${result.earlierDate}-to-${result.laterDate}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadCsv = () => {
    const headers = [
      "Metric",
      "Value",
      "Unit/Description",
    ];
    const rows = [
      ["Analysis Type", "Sentinel-2 NDVI Difference", "Band Math: (NIR - Red) / (NIR + Red)"],
      ["Observation A Date", result.earlierDate, "Baseline observation"],
      ["Observation B Date", result.laterDate, "Comparison observation"],
      ["Raster Width", result.width.toString(), "Pixels"],
      ["Raster Height", result.height.toString(), "Pixels"],
      ["Total Pixels", (result.width * result.height).toString(), "Pixels"],
      ["Earlier Mean NDVI", result.earlier.stats.mean.toFixed(4), "Range -1.0 to +1.0"],
      ["Later Mean NDVI", result.later.stats.mean.toFixed(4), "Range -1.0 to +1.0"],
      ["Mean NDVI Change", result.diff.stats.meanChange.toFixed(4), "ΔNDVI"],
      ["Candidate Loss Pixels", result.diff.stats.candidateLossPixels.toString(), `${result.diff.stats.candidateLossPercent.toFixed(1)}% of valid pixels`],
      ["Stable Pixels", result.diff.stats.stablePixels.toString(), `${result.diff.stats.stablePercent.toFixed(1)}% of valid pixels`],
      ["Candidate Gain Pixels", result.diff.stats.candidateGainPixels.toString(), `${result.diff.stats.candidateGainPercent.toFixed(1)}% of valid pixels`],
      ["Valid Compared Pixels", result.diff.stats.validPixels.toString(), `${result.diff.stats.validPercent.toFixed(1)}% of raster`],
      ["Invalid/NoData Pixels", result.diff.stats.invalidPixels.toString(), "Pixels skipped due to zero/NoData"],
      [
        "Estimated Area Analyzed",
        result.diff.stats.estimatedAreaKm2 !== undefined
          ? result.diff.stats.estimatedAreaKm2.toFixed(3)
          : "N/A",
        result.pixelScaleMeters !== undefined
          ? `km² (based on ${result.pixelScaleMeters}m pixels)`
          : "Unavailable without a projected CRS in meters",
      ],
    ];

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spectral-earth-ndvi-summary-${result.earlierDate}-to-${result.laterDate}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const activeMapUrl =
    viewMode === "diff"
      ? result.diff.previewUrl
      : viewMode === "earlier"
      ? result.earlier.previewUrl
      : result.later.previewUrl;

  return (
    <div className="space-y-6">
      {/* Top Controls & Map Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-card p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={viewMode === "diff" ? "default" : "outline"}
            onClick={() => setViewMode("diff")}
            className="text-xs"
          >
            ΔNDVI Change Map
          </Button>
          <Button
            size="sm"
            variant={viewMode === "earlier" ? "default" : "outline"}
            onClick={() => setViewMode("earlier")}
            className="text-xs"
          >
            Earlier NDVI ({result.earlierDate})
          </Button>
          <Button
            size="sm"
            variant={viewMode === "later" ? "default" : "outline"}
            onClick={() => setViewMode("later")}
            className="text-xs"
          >
            Later NDVI ({result.laterDate})
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={downloadDiffPng} className="text-xs gap-1.5 border-emerald-500/30">
            <Download className="h-3.5 w-3.5 text-accent" />
            <span>Map PNG</span>
          </Button>
          <Button size="sm" variant="outline" onClick={downloadJson} className="text-xs gap-1.5 border-emerald-500/30">
            <FileJson className="h-3.5 w-3.5 text-primary" />
            <span>JSON</span>
          </Button>
          <Button size="sm" variant="outline" onClick={downloadCsv} className="text-xs gap-1.5 border-emerald-500/30">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#080e0b] shadow-2xl">
        <div className="relative flex aspect-square sm:aspect-video w-full items-center justify-center p-2">
          <img
            src={activeMapUrl}
            alt="Sentinel-2 NDVI Map Output"
            className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
            style={{ imageRendering: "pixelated" }}
          />

          <div className="absolute left-4 top-4 rounded-lg border border-black/40 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md">
            <span className="font-mono font-medium">
              {viewMode === "diff"
                ? "ΔNDVI Difference (Later - Earlier)"
                : viewMode === "earlier"
                ? `Baseline NDVI: ${result.earlierDate}`
                : `Comparison NDVI: ${result.laterDate}`}
            </span>
            <span className="ml-2 font-mono text-[10px] text-emerald-400">
              {result.width} × {result.height} px
            </span>
          </div>
        </div>

        {/* Dynamic Color Legend */}
        <div className="border-t border-emerald-500/15 bg-card/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          {viewMode === "diff" ? (
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="text-red-400 font-semibold">Vegetation Loss (diff &lt; -0.1)</span>
                <span className="text-slate-300">Stable (±0.04)</span>
                <span className="text-emerald-400 font-semibold">Vegetation Gain (diff &gt; +0.1)</span>
              </div>
              <div className="mt-1.5 h-3 w-full rounded-full bg-gradient-to-r from-[#dc2626] via-[#f97316] via-[#eab308] via-[#475569] via-[#84cc16] via-[#10b981] to-[#06b6d4] shadow-inner" />
              <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>-1.0</span>
                <span>-0.5</span>
                <span>0.0</span>
                <span>+0.5</span>
                <span>+1.0</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="text-blue-400 font-semibold">Water / Cloud (&lt; 0.0)</span>
                <span className="text-amber-200">Bare Soil (0.0 - 0.2)</span>
                <span className="text-lime-300">Moderate Canopy (0.4)</span>
                <span className="text-emerald-400 font-semibold">Dense Canopy (&gt; 0.6)</span>
              </div>
              <div className="mt-1.5 h-3 w-full rounded-full bg-gradient-to-r from-[#1e40af] via-[#d4b886] via-[#8cb043] via-[#459e3d] to-[#14532d] shadow-inner" />
              <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>-1.0</span>
                <span>0.0</span>
                <span>0.3</span>
                <span>0.6</span>
                <span>1.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
          <p className="text-xs text-muted-foreground">Baseline Mean NDVI</p>
          <p className="mt-1 font-mono text-2xl font-light text-white">
            {result.earlier.stats.mean.toFixed(3)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            Min: {result.earlier.stats.min.toFixed(2)} · Max: {result.earlier.stats.max.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
          <p className="text-xs text-muted-foreground">Comparison Mean NDVI</p>
          <p className="mt-1 font-mono text-2xl font-light text-white">
            {result.later.stats.mean.toFixed(3)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            Min: {result.later.stats.min.toFixed(2)} · Max: {result.later.stats.max.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
          <p className="text-xs text-muted-foreground">Mean NDVI Change (Δ)</p>
          <div className="mt-1 flex items-center gap-1.5">
            {result.diff.stats.meanChange < -0.01 ? (
              <ArrowDownRight className="h-5 w-5 text-red-400" />
            ) : result.diff.stats.meanChange > 0.01 ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            ) : (
              <Minus className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="font-mono text-2xl font-light text-white">
              {result.diff.stats.meanChange > 0 ? "+" : ""}
              {result.diff.stats.meanChange.toFixed(3)}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            Net shift across valid raster
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
          <p className="text-xs text-muted-foreground">Candidate Vegetation Shift</p>
          <p className="mt-1 font-mono text-xl font-light text-red-400">
            {result.diff.stats.candidateLossPercent.toFixed(1)}% <span className="text-xs text-muted-foreground">loss</span>
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-400 font-mono">
            {result.diff.stats.candidateGainPercent.toFixed(1)}% gain · {result.diff.stats.stablePercent.toFixed(1)}% stable
          </p>
        </div>
      </div>

      {/* Area & Raster Details */}
      <div className="rounded-xl border border-emerald-500/20 bg-card p-5">
        <h4 className="font-mono text-xs uppercase tracking-wider text-primary">Raster Metrics & Coverage</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">Total Grid Dimensions:</span>
            <p className="font-mono text-white">{result.width} × {result.height} ({result.width * result.height} pixels)</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Valid Analyzed Pixels:</span>
            <p className="font-mono text-emerald-300">
              {result.diff.stats.validPixels.toLocaleString()} ({result.diff.stats.validPercent.toFixed(1)}%)
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Estimated Surface Area:</span>
            <p className="font-mono text-white">
              {result.diff.stats.estimatedAreaKm2 !== undefined
                ? `${result.diff.stats.estimatedAreaKm2.toFixed(3)} km² (${result.pixelScaleMeters}m pixel scale)`
                : "Exact area requires verified pixel scale tag"}
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Disclaimer & Ground-Truth Guidance */}
      <div className="flex gap-3 rounded-xl border border-accent/30 bg-card p-4 text-xs text-muted-foreground">
        <Info className="h-5 w-5 shrink-0 text-accent mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-white">Scientific Interpretation Caveat</p>
          <p className="leading-relaxed">
            Decreases in NDVI are reported strictly as <strong>candidate decreases</strong>. Reductions in infrared reflectance commonly reflect agricultural crop harvest cycles, summer dry season senescence, variable sun elevation, atmospheric haze, or localized shadows, rather than permanent deforestation. Always cross-reference with official ESA Level-2A quality flags and regional ground truth data.
          </p>
        </div>
      </div>
    </div>
  );
}
