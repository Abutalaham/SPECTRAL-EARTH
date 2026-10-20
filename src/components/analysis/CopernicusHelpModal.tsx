import { ExternalLink, Info, CheckCircle2, AlertTriangle, Download, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopernicusHelpProps {
  onClose: () => void;
}

export function CopernicusHelpModal({ onClose }: CopernicusHelpProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#0d1612] p-6 shadow-2xl text-foreground sm:p-8">
        <div className="flex items-start justify-between border-b border-emerald-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-accent">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white">How to Get Sentinel-2 Data</h3>
              <p className="text-xs text-muted-foreground">Official Copernicus Data Space Browser Guide</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-white">
            ✕
          </Button>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-emerald-100/90 flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-accent mt-0.5" />
            <div>
              <p className="font-medium text-white">What is Sentinel-2?</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sentinel-2 is a European Space Agency (ESA) constellation providing free 10m-resolution multispectral imagery of Earth every 5 days.
                For accurate vegetation NDVI, always use <strong>Level-2A (Bottom-of-Atmosphere / Surface Reflectance)</strong> products.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-accent">Step-by-step acquisition workflow</h4>

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-mono">1</span>
                  <span>Open Copernicus Browser</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Navigate to the official portal at{" "}
                  <a
                    href="https://browser.dataspace.copernicus.eu/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent underline hover:text-white"
                  >
                    browser.dataspace.copernicus.eu
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  . Zoom to your region of interest (e.g., an agricultural valley, forest perimeter, or reservoir).
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-mono">2</span>
                  <span>Select Sentinel-2 L2A & Filter Cloud Cover</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  In the search panel, select <strong>Sentinel-2</strong> $\rightarrow$ <strong>L2A</strong>.
                  Set maximum cloud coverage to &lt; 15% to ensure clear ground visibility without cloud shadow interference.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-mono">3</span>
                  <span>Export Raw B04 (Red) & B08 (NIR) Bands</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Click the <strong>Download / Export</strong> icon $\rightarrow$ choose <strong>Analytical</strong>.
                  Select:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-emerald-200/80">
                  <li><strong>B04 (Red)</strong> — 10m ground resolution</li>
                  <li><strong>B08 (Near Infrared)</strong> — 10m ground resolution</li>
                  <li>Format: <strong>TIFF (16-bit raw reflectance)</strong> or 32-bit float</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Crop a moderate bounding box (e.g. 512×512 to 2048×2048 pixels) for fast in-browser computation.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-mono">4</span>
                  <span>Repeat for the Comparison Date</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Select a second observation date for the exact same bounding box (e.g. before and after a drought, harvest, or fire) and export its B04 and B08 files.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-xs text-amber-200/80 flex gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              <strong>Important:</strong> Standard JPEG or PNG photos do not contain raw spectral infrared reflectance values. Only true GeoTIFF files with separate Red and NIR bands can compute authentic NDVI.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/15 pt-4">
          <Button asChild variant="outline" size="sm" className="border-emerald-500/30">
            <a href="https://browser.dataspace.copernicus.eu/" target="_blank" rel="noreferrer">
              Open Copernicus Browser <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>

          <Button onClick={onClose} size="sm">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
