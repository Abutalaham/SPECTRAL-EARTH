import { Link } from "@tanstack/react-router";
import { Upload, SlidersHorizontal, Play, BarChart3, ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepItem {
  icon: LucideIcon;
  title: string;
  text: string;
  stage: string;
}

const steps: StepItem[] = [
  {
    icon: Upload,
    title: "Upload",
    text: "Add an earlier and a later image of the same place.",
    stage: "Ingestion",
  },
  {
    icon: SlidersHorizontal,
    title: "Tune",
    text: "Choose a sensitivity from 1 to 100.",
    stage: "Calibration",
  },
  {
    icon: Play,
    title: "Analyze",
    text: "Pixels are compared in your browser.",
    stage: "Processing",
  },
  {
    icon: BarChart3,
    title: "Review & export",
    text: "Inspect the change map and download results.",
    stage: "Synthesis",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="relative border-y border-emerald-500/15 bg-gradient-to-b from-[#09110d] via-[#0b1611] to-[#09110d] px-6 py-28"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Workflow // Execution Pipeline</p>
        </div>

        <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
          Four steps, <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-lime-300">all on your device</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-light text-muted-foreground sm:text-base">
          Zero cloud uploads, zero telemetry, full privacy. Pure client-side raster and spectral processing.
        </p>

        {/* 3D Glassmorphism Cards Grid */}
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="group relative flex flex-col justify-between rounded-2xl border border-emerald-500/25 bg-[#0f1d16]/70 p-6 shadow-xl shadow-black/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-emerald-950/30"
              style={{
                boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.08), 0 10px 25px -5px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Step indicator header */}
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                  <span className="font-mono text-xs font-semibold text-accent">STEP 0{i + 1}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.stage}</span>
                </div>

                <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/60 text-accent transition-transform duration-300 group-hover:scale-105">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-4 text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">{s.text}</p>
              </div>

              {/* Progress connector glyph */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-500/40">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* Action button */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-sm font-medium shadow-lg shadow-primary/20">
            <Link to="/analyze">
              Start Analyzing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            No account or API key required. Runs immediately in your browser.
          </span>
        </div>
      </div>
    </section>
  );
}
