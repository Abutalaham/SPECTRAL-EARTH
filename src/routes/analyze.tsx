import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Play, RotateCcw, Sparkles, Lock, Home, ScanSearch, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UploadPanel } from "@/components/analysis/UploadPanel";
import { ResultsDashboard } from "@/components/analysis/ResultsDashboard";
import { loadImageFile, revokeResult, runAnalysis, validateFile } from "@/lib/analysis/engine";
import { makeSampleFiles } from "@/lib/analysis/samples";
import type { AnalysisResult, LoadedImage } from "@/lib/analysis/types";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analysis Workspace — Spectral Earth" },
      { name: "description", content: "Upload two images, set a sensitivity and detect pixel-level changes locally in your browser." },
      { property: "og:title", content: "Analysis Workspace — Spectral Earth" },
      { property: "og:description", content: "Run browser-based change detection on two images and export the results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Workspace,
});

type Slot = "before" | "after";

function Workspace() {
  const [images, setImages] = useState<Record<Slot, LoadedImage | null>>({ before: null, after: null });
  const [errors, setErrors] = useState<Record<Slot, string | null>>({ before: null, after: null });
  const [sensitivity, setSensitivity] = useState(50);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  // Keep latest values for cleanup when leaving the page.
  const live = useRef({ images, result });
  live.current = { images, result };
  useEffect(() => () => {
    Object.values(live.current.images).forEach((i) => i && URL.revokeObjectURL(i.url));
    revokeResult(live.current.result);
  }, []);

  const replaceResult = (r: AnalysisResult | null) => {
    setResult((old) => { revokeResult(old); return r; });
  };

  const setSlot = async (slot: Slot, file: File) => {
    const err = validateFile(file);
    if (err) { setErrors((e) => ({ ...e, [slot]: err })); return; }
    try {
      const img = await loadImageFile(file);
      setImages((prev) => { if (prev[slot]) URL.revokeObjectURL(prev[slot]!.url); return { ...prev, [slot]: img }; });
      setErrors((e) => ({ ...e, [slot]: null }));
      replaceResult(null);
    } catch (e) {
      setErrors((x) => ({ ...x, [slot]: (e as Error).message }));
    }
  };

  const remove = (slot: Slot) => {
    setImages((prev) => { if (prev[slot]) URL.revokeObjectURL(prev[slot]!.url); return { ...prev, [slot]: null }; });
    replaceResult(null);
  };

  const loadSamples = async () => {
    const [a, b] = await makeSampleFiles();
    await setSlot("before", a);
    await setSlot("after", b);
  };

  const run = async () => {
    if (!images.before || !images.after || running) return;
    setRunning(true);
    setRunError(null);
    // Yield one frame so the loading state paints before heavy work.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    try {
      const r = await runAnalysis(images.before, images.after, sensitivity);
      replaceResult(r);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setRunError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    remove("before");
    remove("after");
    setErrors({ before: null, after: null });
    setRunError(null);
    setSensitivity(50);
  };

  const ready = !!images.before && !!images.after;
  const aspectMismatch =
    ready && Math.abs(images.before!.width / images.before!.height - images.after!.width / images.after!.height) > 0.01;

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[220px_1fr]">
      <aside className="sticky top-0 z-20 flex items-center gap-2 border-b bg-sidebar px-4 py-3 md:h-screen md:flex-col md:items-stretch md:border-b-0 md:border-r md:py-6">
        <Link to="/" className="mr-auto flex items-center gap-2 font-medium md:mb-6 md:mr-0">
          <ScanSearch className="h-5 w-5 text-primary" /> Spectral Earth
        </Link>
        <nav aria-label="Workspace" className="flex gap-1 text-sm md:flex-col">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><Home className="h-4 w-4" /><span className="hidden sm:inline">Overview</span></Link>
          <Link to="/analyze" className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2"><ScanSearch className="h-4 w-4" /><span className="hidden sm:inline">Workspace</span></Link>
        </nav>
        <p className="mt-auto hidden items-start gap-2 text-xs text-muted-foreground md:flex">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Images are processed locally in your browser and never uploaded or stored.
        </p>
      </aside>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-light">Analysis workspace</h1>
            <p className="text-sm text-muted-foreground">Upload two images of the same location captured at different times.</p>
          </div>
          <Button variant="outline" onClick={loadSamples}><Sparkles /> Load synthetic samples</Button>
        </header>

        <section aria-labelledby="upload-h" className="space-y-4">
          <h2 id="upload-h" className="text-sm uppercase tracking-widest text-primary">1 · Images</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <UploadPanel label="Earlier image" hint="Baseline" image={images.before} error={errors.before} onFile={(f) => setSlot("before", f)} onRemove={() => remove("before")} />
            <UploadPanel label="Later image" hint="Comparison" image={images.after} error={errors.after} onFile={(f) => setSlot("after", f)} onRemove={() => remove("after")} />
          </div>
          <div className="flex gap-3 rounded-lg border bg-card p-4 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-accent" />
            <p>
              Accurate change detection requires images of the same location, comparable resolution, good alignment and similar capture conditions.
              Both images are fitted to a common canvas (preserving aspect ratio); no geographic registration is performed.
              {aspectMismatch && <strong className="block pt-1 text-accent">These images have different aspect ratios — only the overlapping area will be analyzed.</strong>}
              {" "}The synthetic samples are computer-drawn scenes, not real satellite imagery.
            </p>
          </div>
        </section>

        <section aria-labelledby="settings-h" className="space-y-4">
          <h2 id="settings-h" className="text-sm uppercase tracking-widest text-primary">2 · Settings</h2>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <label id="sens-label" className="font-medium">Sensitivity</label>
              <span className="tabular-nums text-lg">{sensitivity}</span>
            </div>
            <Slider className="mt-4" min={1} max={100} step={1} value={[sensitivity]} onValueChange={(v) => setSensitivity(v[0] ?? 50)} aria-labelledby="sens-label" />
            <p className="mt-3 text-xs text-muted-foreground">
              Higher sensitivity detects smaller pixel differences and may increase false positives. Rerun the analysis after changing it.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={run} disabled={!ready || running}>
                {running ? <Loader2 className="animate-spin" /> : <Play />} {running ? "Analyzing…" : "Run Analysis"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={running}><RotateCcw /> Reset Analysis</Button>
            </div>
            {!ready && <p className="mt-3 text-xs text-muted-foreground">Add both images to enable analysis.</p>}
            {runError && <p role="alert" className="mt-3 text-sm text-destructive">{runError}</p>}
            {result && result.sensitivity !== sensitivity && (
              <p className="mt-3 text-xs text-accent">Sensitivity changed — run the analysis again to update the results.</p>
            )}
          </div>
        </section>

        <section ref={resultsRef} aria-labelledby="results-h" className="scroll-mt-20 space-y-4">
          <h2 id="results-h" className="text-sm uppercase tracking-widest text-primary">3 · Results</h2>
          {result ? (
            <ResultsDashboard result={result} />
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Results appear here after you run an analysis.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
