import { useState } from "react";

/** Draggable before/after viewer. Both images share the analysis canvas size. */
export function CompareSlider({ before, after, width, height }: { before: string; after: string; width: number; height: number }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-muted" style={{ aspectRatio: `${width} / ${height}` }}>
      <img src={after} alt="Later image" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Earlier image" className="h-full w-full object-contain" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${pos}%` }} />
      <span className="absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 text-xs">Earlier</span>
      <span className="absolute right-2 top-2 rounded bg-background/80 px-2 py-0.5 text-xs">Later</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparison position"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 accent-[var(--accent)]"
      />
    </div>
  );
}
