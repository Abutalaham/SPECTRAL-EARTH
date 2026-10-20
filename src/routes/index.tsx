import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { ResponsibleUseSection } from "@/components/landing/ResponsibleUseSection";

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

function Landing() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <ResponsibleUseSection />

      <footer className="border-t border-emerald-500/10 bg-[#070d0a]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
          <span>Spectral Earth — Satellite-Based Environmental Change Detection System</span>
          <span>A learning project · Images are processed locally in your browser</span>
        </div>
      </footer>
    </div>
  );
}
