import { useCallback } from "react";
import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { SylvaHero } from "@/shaders/landing-pages/SylvaHero";

/**
 * Full-screen SylvaHero (Living Green). The authored page file stays
 * byte-exact; Spectral Earth copy and navigation are applied to the live
 * same-origin frame after it loads.
 */
export function HeroSection() {
  const navigate = useNavigate();

  const applyScene = useCallback(
    function apply(frame: HTMLIFrameElement) {
      const doc = frame.contentDocument;
      // The frame may still be loading (or have loaded before hydration): retry until ready.
      if (!doc || doc.readyState === "loading" || !doc.querySelector(".headline")) {
        frame.addEventListener("load", () => apply(frame), { once: true });
        if (doc && doc.readyState !== "complete") return;
        setTimeout(() => apply(frame), 300);
        return;
      }
      if (doc.documentElement.dataset["spectral"] === "1") return;
      doc.documentElement.dataset["spectral"] = "1";

      const set = (sel: string, text: string, all = false) => {
        const els = all ? Array.from(doc.querySelectorAll(sel)) : [doc.querySelector(sel)];
        els.forEach((el) => el && (el.textContent = text));
      };
      const lines = doc.querySelectorAll(".headline span i");
      if (lines[0]) lines[0].textContent = "See how our";
      if (lines[1]) lines[1].textContent = "planet changes.";
      set(".lede", "Compare satellite imagery, identify environmental changes, and turn visual differences into actionable insights.");
      set(".liquid-button--explore .lbl", "Start Analyzing");
      set(".ghost", "EARTH");
      doc.title = "Spectral Earth";

      const dock = doc.querySelectorAll(".dock-item span:not(.glyph)");
      ["Overview", "Features", "Workflow", "Analyze"].forEach((t, i) => dock[i] && (dock[i].textContent = t));
      const stats = doc.querySelectorAll(".stat dt");
      const vals = doc.querySelectorAll(".stat dd");
      if (stats[0]) stats[0].textContent = "Processing";
      if (vals[0]) vals[0].textContent = "In-browser";
      if (stats[1]) stats[1].textContent = "Metric";
      if (vals[1]) vals[1].textContent = "RGB distance";
      const labels = doc.querySelectorAll(".card .label");
      const heads = doc.querySelectorAll(".card h2");
      if (labels[0]) labels[0].textContent = "Baseline";
      if (heads[0]) heads[0].textContent = "Earlier vs. later.";
      if (labels[1]) labels[1].textContent = "Output";
      if (heads[1]) heads[1].textContent = "Change Map";
      set(".scroll", "Explore Features");
      const track = doc.createElement("span");
      track.className = "track";
      doc.querySelector(".scroll")?.appendChild(track);

      const go = (e: Event) => {
        e.preventDefault();
        navigate({ to: "/analyze" });
      };
      const scrollTo = (id: string) => (e: Event) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      };
      doc.querySelector(".liquid-button--explore")?.addEventListener("click", go);
      doc.querySelector(".dock-item--enter")?.addEventListener("click", go);
      doc.querySelector(".liquid-button--play")?.addEventListener("click", go);
      doc.querySelector(".liquid-button--play")?.setAttribute("aria-label", "Open the analysis workspace");
      const items = doc.querySelectorAll(".dock-item");
      items[1]?.addEventListener("click", (e) => e.preventDefault());
      items[2]?.addEventListener("click", scrollTo("features"));
      items[3]?.addEventListener("click", scrollTo("workflow"));
      items[0]?.addEventListener("click", (e) => e.preventDefault());
      doc.querySelector(".scroll")?.addEventListener("click", scrollTo("features"));
      doc.querySelectorAll(".knob").forEach((k) => k.addEventListener("click", scrollTo("workflow")));
    },
    [navigate],
  );

  return (
    <section className="relative h-[100svh] w-full" aria-label="Spectral Earth introduction">
      <div className="shader-frame absolute inset-0">
        <ClientOnly fallback={<div className="h-full w-full bg-background" />}>
        <SylvaHero
          variant="living-green"
          headingFont="lexend"
          bodyFont="lexend"
          headingWeight="300"
          bodyWeight="300"
          primaryColor="#ffffff"
          headingSize={63}
          bodySize={16.5}
          headingLetterSpacing={-0.006}
          applyScene={applyScene}
          style={{ width: "100%", height: "100%" }}
        />
        </ClientOnly>
      </div>
    </section>
  );
}
