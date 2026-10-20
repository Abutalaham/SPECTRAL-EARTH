import { ScanSearch, Leaf, FileDown, LucideIcon } from "lucide-react";
import { useTilt } from "@/hooks/useTilt";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  text: string;
  tag: string;
}

const features: FeatureItem[] = [
  {
    icon: ScanSearch,
    title: "Change Detection",
    text: "Pixel-by-pixel RGB comparison of two images with an adjustable sensitivity threshold.",
    tag: "Spatial Analysis",
  },
  {
    icon: Leaf,
    title: "Environmental Insights",
    text: "Change maps, distribution charts and a plain-language interpretation of the measured differences.",
    tag: "Vegetation & Canopy",
  },
  {
    icon: FileDown,
    title: "Downloadable Reports",
    text: "Export the change map as PNG and the results as JSON or CSV — generated locally.",
    tag: "Open Data Export",
  },
];

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const cardRef = useTilt<HTMLDivElement>(4);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#13231b]/90 to-[#0c1712]/90 p-7 shadow-xl shadow-black/40 backdrop-blur-sm transition-shadow duration-300 hover:border-emerald-400/40 hover:shadow-emerald-950/40"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Dynamic specular light highlight on desktop pointer movement */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(52, 211, 153, 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/60 text-primary shadow-inner">
          <feature.icon className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
          0{index + 1} // {feature.tag}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-medium tracking-tight text-white">{feature.title}</h3>
      <p className="mt-2.5 text-sm font-light leading-relaxed text-muted-foreground">{feature.text}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#09110d] px-6 py-28 text-foreground"
    >
      {/* Quantum Engine Layered Background: Coordinate Grid & Orbital Rings */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.08)_0%,_transparent_65%)]" />

      {/* Subtle coordinate grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #34d399 1px, transparent 1px),
            linear-gradient(to bottom, #34d399 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Orbital depth rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/10 [mask-image:radial-gradient(circle,black_40%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-500/10 [mask-image:radial-gradient(circle,black_30%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Quantum Engine // Core Capabilities</p>
        </div>

        <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
          Built for <span className="font-normal text-white">careful comparison</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-light text-muted-foreground sm:text-base">
          Engineered for geospatial intelligence, environmental monitoring, and browser-first data processing.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
