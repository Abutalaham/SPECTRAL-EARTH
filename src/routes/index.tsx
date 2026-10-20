import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, Leaf, FileDown, Upload, SlidersHorizontal, Play, BarChart3, ShieldAlert } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spectral Earth — See How Our Planet Changes" },
      { name: "description", content: "Compare two satellite or aerial images in your browser and visualize pixel-level environmental change." },
      { property: "og:title", content: "Spectral Earth — See How Our Planet Changes" },
      { property: "og:description", content: "Browser-based image change detection with change maps and downloadable reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: ScanSearch, title: "Change Detection", text: "Pixel-by-pixel RGB comparison of two images with an adjustable sensitivity threshold." },
  { icon: Leaf, title: "Environmental Insights", text: "Change maps, distribution charts and a plain-language interpretation of the measured differences." },
  { icon: FileDown, title: "Downloadable Reports", text: "Export the change map as PNG and the results as JSON or CSV — generated locally." },
];

const steps = [
  { icon: Upload, title: "Upload", text: "Add an earlier and a later image of the same place." },
  { icon: SlidersHorizontal, title: "Tune", text: "Choose a sensitivity from 1 to 100." },
  { icon: Play, title: "Analyze", text: "Pixels are compared in your browser." },
  { icon: BarChart3, title: "Review & export", text: "Inspect the change map and download results." },
];

function Landing() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-sm uppercase tracking-widest text-primary">Features</p>
        <h2 className="mt-2 text-3xl font-light md:text-4xl">Built for careful comparison</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y bg-sidebar">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-sm uppercase tracking-widest text-primary">Workflow</p>
          <h2 className="mt-2 text-3xl font-light md:text-4xl">Four steps, all on your device</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border bg-card p-6">
                <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                <s.icon className="mt-3 h-5 w-5 text-accent" aria-hidden />
                <h3 className="mt-3 font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/analyze">Start Analyzing</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex gap-4 rounded-xl border border-accent/30 bg-card p-6">
          <ShieldAlert className="h-6 w-6 shrink-0 text-accent" aria-hidden />
          <div>
            <h2 className="font-medium">Responsible use</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Image differences do not automatically prove environmental damage. Clouds, lighting, seasons, shadows,
              sensor settings and misalignment all produce pixel differences. Spectral Earth uses a baseline
              image-difference method — validate findings with other data before drawing conclusions.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
          <span>Spectral Earth — Satellite-Based Environmental Change Detection System</span>
          <span>A learning project · Images are processed locally in your browser</span>
        </div>
      </footer>
    </div>
  );
}
