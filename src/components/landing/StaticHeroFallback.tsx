import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Cpu, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StaticHeroFallback() {
  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/60 via-[#0e1612] to-[#080d0a] px-6 py-10 text-foreground md:px-12">
      {/* Decorative subtle ambient depth rings - zero CPU load */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-emerald-500/10 bg-emerald-500/5 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[32rem] w-[32rem] rounded-full border border-emerald-500/10 bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Header Badge */}
      <header className="relative z-10 flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-3.5 py-1 text-xs font-light tracking-widest text-emerald-300 backdrop-blur-sm">
          <Satellite className="h-3.5 w-3.5 text-accent" />
          <span>SPECTRAL EARTH</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span className="text-[10px] uppercase text-muted-foreground">Mobile Engine</span>
        </div>

        <nav aria-label="Quick jump" className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#features" onClick={scrollToFeatures} className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-foreground transition-colors">
            Workflow
          </a>
        </nav>
      </header>

      {/* Center Hero Content */}
      <main className="relative z-10 my-auto max-w-2xl py-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-accent">
          <Compass className="h-3.5 w-3.5" />
          <span>EARTH OBSERVATION SYSTEM</span>
        </div>

        <h1 className="mt-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
          See how our <br />
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-lime-200 to-emerald-400">
            planet changes.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-emerald-100/70 sm:text-lg">
          Compare satellite imagery, identify environmental changes, and turn visual differences into actionable insights.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-12 px-7 text-sm font-medium shadow-lg shadow-primary/20">
            <Link to="/analyze">
              Start Analyzing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-emerald-500/30 bg-emerald-950/20 px-6 text-sm text-foreground hover:bg-emerald-900/40"
          >
            <a href="#features" onClick={scrollToFeatures}>
              Explore Features
            </a>
          </Button>
        </div>

        {/* Scientific Stat Chips */}
        <div className="mt-10 grid max-w-md grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Processing</span>
            </div>
            <p className="mt-1 text-sm font-medium text-emerald-200">100% In-browser</p>
          </div>

          <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Satellite className="h-3.5 w-3.5 text-accent" />
              <span>Dual Modes</span>
            </div>
            <p className="mt-1 text-sm font-medium text-emerald-200">RGB & Sentinel-2</p>
          </div>
        </div>
      </main>

      {/* Footer Scroll Prompt */}
      <footer className="relative z-10 flex items-center justify-between border-t border-emerald-500/10 pt-4 text-xs text-muted-foreground">
        <span>Smooth 60 FPS mobile mode</span>
        <a href="#features" onClick={scrollToFeatures} className="inline-flex items-center gap-1 hover:text-foreground">
          Scroll down
          <ArrowRight className="h-3 w-3 rotate-90" />
        </a>
      </footer>
    </div>
  );
}
