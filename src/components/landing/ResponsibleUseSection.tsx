import { ShieldAlert, Compass } from "lucide-react";
import { useTilt } from "@/hooks/useTilt";

export function ResponsibleUseSection() {
  const cardRef = useTilt<HTMLDivElement>(2.5);

  return (
    <section className="relative overflow-hidden bg-[#06110E] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(66,245,155,0.09),transparent_58%),radial-gradient(ellipse_at_10%_10%,rgba(57,221,245,0.05),transparent_42%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl">
        <div
          ref={cardRef}
          className="group relative rounded-2xl border border-emerald-300/25 bg-[#0A1914]/95 p-8 shadow-2xl transition-[border-color,box-shadow] duration-300 hover:border-cyan-300/35 motion-reduce:transition-none md:p-10"
          style={{
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(167, 255, 224, 0.09)",
          }}
        >
          {/* Subtle Kinetic Specular Light Following Pointer on Desktop */}
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(57, 221, 245, 0.08), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-inner">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                  Responsible Scientific Use
                </h2>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                  Caveats & Validation
                </span>
              </div>

              <p className="text-sm font-light leading-relaxed text-emerald-100/80 sm:text-base">
                Image differences do not automatically prove environmental damage. Clouds, atmospheric scattering, seasonal foliage cycles, cast shadows, sensor calibrations, and geographic misalignment all produce pixel-level differences.
              </p>

              <p className="text-sm font-light leading-relaxed text-muted-foreground">
                Spectral Earth is designed as an investigative baseline tool — always cross-validate findings with official multispectral ground-truth datasets, weather history, and registered geographic surveys before drawing ecological or legal conclusions.
              </p>

              <div className="flex items-center gap-2 pt-2 font-mono text-xs text-muted-foreground/80">
                <Compass className="h-3.5 w-3.5 text-accent" />
                <span>Geospatial Best Practice: Always confirm coordinate alignment and sensor metadata.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
