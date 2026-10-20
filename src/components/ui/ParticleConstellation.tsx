import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

type ConstellationTheme = "terra" | "cyan" | "purple";
type GravityMode = "off" | "attraction" | "repulsion";
type RippleMode = "cyan" | "purple" | "off";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  radius: number;
}

interface Shockwave {
  x: number;
  y: number;
  startedAt: number;
}

interface ParticleConstellationProps {
  children: ReactNode;
  className?: string;
}

const PALETTES: Record<ConstellationTheme, { nodes: string[]; line: string }> = {
  terra: { nodes: ["#39DDF5", "#42F59B", "#A7FFE0"], line: "57, 221, 245" },
  cyan: { nodes: ["#39DDF5", "#8BEFFF", "#A7FFE0"], line: "57, 221, 245" },
  purple: { nodes: ["#A78BFA", "#39DDF5", "#C4B5FD"], line: "167, 139, 250" },
};

const INTERACTIVE_TARGETS =
  "button, a, input, select, textarea, label, summary, form, .cursor-pointer, [role='button'], [role='slider'], [role='switch'], [role='tab'], [contenteditable='true']";

export function ParticleConstellation({ children, className = "" }: ParticleConstellationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Shockwave[]>([]);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });
  const drawRef = useRef<() => void>(() => {});
  const previewTimerRef = useRef<number | null>(null);
  const [particleCount, setParticleCount] = useState(80);
  const [connectionRadius, setConnectionRadius] = useState(120);
  const [effectiveRadius, setEffectiveRadius] = useState(120);
  const [theme, setTheme] = useState<ConstellationTheme>("terra");
  const [gravity, setGravity] = useState<GravityMode>("off");
  const [ripple, setRipple] = useState<RippleMode>("cyan");
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [previewActive, setPreviewActive] = useState(false);
  const [effectiveCount, setEffectiveCount] = useState(80);
  const { isSmallScreen, isLowConcurrency, isSaveData, prefersReducedMotion } =
    useDeviceCapabilities();

  const optionsRef = useRef({
    particleCount,
    connectionRadius,
    theme,
    gravity,
    ripple,
    motionEnabled,
    previewActive,
    effectiveCount,
    effectiveRadius,
  });
  optionsRef.current = {
    particleCount,
    connectionRadius,
    theme,
    gravity,
    ripple,
    motionEnabled,
    previewActive,
    effectiveCount,
    effectiveRadius,
  };

  useEffect(() => {
    const deviceLimit = isSmallScreen ? 28 : isLowConcurrency || isSaveData ? 36 : 100;
    const nextCount = Math.min(particleCount, deviceLimit);
    setEffectiveCount(nextCount);
  }, [particleCount, isSmallScreen, isLowConcurrency, isSaveData]);

  useEffect(() => {
    setEffectiveRadius(isSmallScreen ? Math.min(connectionRadius, 80) : connectionRadius);
  }, [connectionRadius, isSmallScreen]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!wrapper || !canvas || !context) return;

    let visible = true;
    let running = false;
    let frameId: number | null = null;
    let timerId: number | null = null;
    let lastFrameAt = 0;

    const syncParticles = () => {
      const { width, height } = dimensionsRef.current;
      const target = optionsRef.current.effectiveCount;
      while (particlesRef.current.length < target) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
          radius: 0.8 + Math.random() * 0.8,
        });
      }
      if (particlesRef.current.length > target) particlesRef.current.length = target;
    };

    const draw = (timestamp = performance.now(), animate = false) => {
      const { width, height, dpr } = dimensionsRef.current;
      if (!width || !height) return;
      syncParticles();
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#06110E";
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.52,
        height * 0.28,
        0,
        width * 0.52,
        height * 0.28,
        Math.max(width, height) * 0.8,
      );
      glow.addColorStop(0, "rgba(22, 110, 88, 0.16)");
      glow.addColorStop(1, "rgba(6, 17, 14, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const options = optionsRef.current;
      const palette = PALETTES[options.theme];
      const delta = Math.min((timestamp - lastFrameAt) / 16.67 || 1, 2);
      const cursor = cursorRef.current;
      const now = performance.now();

      if (animate) {
        particlesRef.current.forEach((particle) => {
          particle.phase += 0.012 * delta;
          particle.vx += Math.cos(particle.phase) * 0.0018 * delta;
          particle.vy += Math.sin(particle.phase * 0.8) * 0.0018 * delta;

          const centerDx = width / 2 - particle.x;
          const centerDy = height / 2 - particle.y;
          const centerDistance = Math.max(1, Math.hypot(centerDx, centerDy));
          if (options.gravity !== "off") {
            const direction = options.gravity === "attraction" ? 1 : -1;
            const force = direction * 0.0035 * delta;
            particle.vx += (centerDx / centerDistance) * force;
            particle.vy += (centerDy / centerDistance) * force;
          }

          if (cursor) {
            const dx = particle.x - cursor.x;
            const dy = particle.y - cursor.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 96) {
              const force = (1 - distance / 96) * 0.035 * delta;
              particle.vx += (dx / distance) * force;
              particle.vy += (dy / distance) * force;
            }
          }

          wavesRef.current.forEach((wave) => {
            const age = now - wave.startedAt;
            const progress = age / 850;
            if (progress < 0 || progress > 1) return;
            const radius = progress * 125;
            const dx = particle.x - wave.x;
            const dy = particle.y - wave.y;
            const distance = Math.hypot(dx, dy);
            const difference = Math.abs(distance - radius);
            if (distance > 0 && difference < 24) {
              const force = (1 - difference / 24) * 0.025 * delta;
              particle.vx += (dx / distance) * force;
              particle.vy += (dy / distance) * force;
            }
          });

          particle.vx *= 0.985;
          particle.vy *= 0.985;
          const speed = Math.hypot(particle.vx, particle.vy);
          if (speed > 0.65) {
            particle.vx = (particle.vx / speed) * 0.65;
            particle.vy = (particle.vy / speed) * 0.65;
          }
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
          if (particle.x < 0 || particle.x > width) {
            particle.x = Math.max(0, Math.min(width, particle.x));
            particle.vx *= -0.6;
          }
          if (particle.y < 0 || particle.y > height) {
            particle.y = Math.max(0, Math.min(height, particle.y));
            particle.vy *= -0.6;
          }
        });
      }

      const nodes = particlesRef.current;
      const radius = options.effectiveRadius;
      const radiusSquared = radius * radius;
      const lineBoost = options.previewActive ? 1.5 : 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= radiusSquared) continue;
          const opacity = (1 - Math.sqrt(distanceSquared) / radius) * 0.2 * lineBoost;
          context.strokeStyle = `rgba(${palette.line}, ${opacity})`;
          context.lineWidth = 0.65;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      nodes.forEach((particle, index) => {
        const color = palette.nodes[index % palette.nodes.length]!;
        const pulse = options.previewActive ? 1.35 : 1;
        context.globalAlpha = 0.62 + Math.sin(particle.phase) * 0.12;
        context.fillStyle = color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      if (options.ripple !== "off") {
        const waveColor = options.ripple === "purple" ? "167, 139, 250" : "57, 221, 245";
        wavesRef.current = wavesRef.current.filter((wave) => {
          const progress = (now - wave.startedAt) / 850;
          if (progress >= 1) return false;
          if (progress < 0) return true;
          context.beginPath();
          context.arc(wave.x, wave.y, progress * 125, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${waveColor}, ${(1 - progress) * 0.42})`;
          context.lineWidth = 1.2;
          context.stroke();
          return true;
        });
      } else {
        wavesRef.current = [];
      }
    };

    drawRef.current = () => draw(performance.now(), false);

    const stop = () => {
      running = false;
      if (timerId !== null) window.clearTimeout(timerId);
      if (frameId !== null) cancelAnimationFrame(frameId);
      timerId = null;
      frameId = null;
    };

    const tick = (timestamp: number) => {
      frameId = null;
      if (!running) return;
      const interval = isSmallScreen ? 50 : 1000 / 30;
      if (timestamp - lastFrameAt >= interval) {
        draw(timestamp, true);
        lastFrameAt = timestamp;
      }
      timerId = window.setTimeout(() => {
        frameId = requestAnimationFrame(tick);
      }, interval);
    };

    const start = () => {
      if (
        running ||
        !visible ||
        document.hidden ||
        prefersReducedMotion ||
        !optionsRef.current.motionEnabled
      )
        return;
      running = true;
      lastFrameAt = 0;
      frameId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.25 : 1.5);
      dimensionsRef.current = { width: rect.width, height: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawRef.current();
    });
    resizeObserver.observe(wrapper);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(wrapper);

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    drawRef.current();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      drawRef.current = () => {};
    };
  }, [isSmallScreen, motionEnabled, prefersReducedMotion]);

  useEffect(() => {
    drawRef.current();
  }, [
    particleCount,
    effectiveCount,
    connectionRadius,
    effectiveRadius,
    theme,
    gravity,
    ripple,
    previewActive,
  ]);

  useEffect(() => {
    if (motionEnabled && !prefersReducedMotion) return;
    wavesRef.current = [];
    drawRef.current();
  }, [motionEnabled, prefersReducedMotion]);

  useEffect(
    () => () => {
      if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current);
    },
    [],
  );

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest(INTERACTIVE_TARGETS));

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || isSmallScreen || !motionEnabled || prefersReducedMotion)
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    cursorRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerLeave = () => {
    cursorRef.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      isInteractiveTarget(event.target) ||
      !motionEnabled ||
      prefersReducedMotion ||
      ripple === "off"
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    wavesRef.current.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      startedAt: performance.now(),
    });
    if (wavesRef.current.length > 3) wavesRef.current.shift();
  };

  const triggerPreview = () => {
    if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current);
    setPreviewActive(true);
    previewTimerRef.current = window.setTimeout(() => {
      setPreviewActive(false);
      previewTimerRef.current = null;
    }, 1200);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative isolate overflow-hidden rounded-2xl bg-[#06110E]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        aria-hidden="true"
      />
      <div className={`relative z-10 space-y-8 ${className}`}>{children}</div>

      <details className="relative z-10 mt-8 rounded-xl border border-emerald-300/20 bg-[#0A1914]/95 shadow-lg shadow-black/20">
        <summary className="cursor-pointer list-none px-5 py-4 font-medium text-emerald-50 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-inset">
          <span className="flex items-center justify-between gap-3">
            <span>Constellation Settings</span>
            <span className="font-mono text-xs text-emerald-200/70">Decorative visuals only</span>
          </span>
        </summary>
        <div className="grid gap-5 border-t border-emerald-300/10 p-5 lg:grid-cols-2">
          <div className="space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="flex justify-between gap-3">
                <span>Particle Count</span>
                <span className="font-mono text-emerald-200">
                  {particleCount} selected · {effectiveCount} rendered
                </span>
              </span>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={particleCount}
                onChange={(event) => setParticleCount(Number(event.currentTarget.value))}
                className="w-full accent-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Particle Count"
              />
              <span className="block text-xs text-emerald-100/60">
                Device limits reduce the rendered count on smaller or constrained devices.
              </span>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="flex justify-between">
                <span>Connection Radius</span>
                <span className="font-mono text-emerald-200">
                  {connectionRadius === effectiveRadius
                    ? `${connectionRadius} px`
                    : `${connectionRadius} selected · ${effectiveRadius} px used`}
                </span>
              </span>
              <input
                type="range"
                min={60}
                max={200}
                step={10}
                value={connectionRadius}
                onChange={(event) => setConnectionRadius(Number(event.currentTarget.value))}
                className="w-full accent-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Connection Radius"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-emerald-300/10 bg-black/15 p-3 text-sm">
              <span>
                <span className="block font-medium">Motion Effects</span>
                <span className="text-xs text-emerald-100/60">
                  Turn movement and ripples on or off.
                </span>
              </span>
              <input
                type="checkbox"
                checked={motionEnabled}
                onChange={(event) => setMotionEnabled(event.currentTarget.checked)}
                className="h-4 w-4 accent-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Motion Effects"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="block">
                Constellation Theme{" "}
                <span className="text-xs text-emerald-100/60">(Terra Cyber recommended)</span>
              </span>
              <select
                value={theme}
                onChange={(event) => setTheme(event.currentTarget.value as ConstellationTheme)}
                className="w-full rounded-md border border-emerald-300/20 bg-[#10251D] px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Constellation Theme"
              >
                <option value="terra">Terra Cyber</option>
                <option value="cyan">Cyber Cyan</option>
                <option value="purple">Purple Neon</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="block">Particle Gravity Field</span>
              <select
                value={gravity}
                onChange={(event) => setGravity(event.currentTarget.value as GravityMode)}
                className="w-full rounded-md border border-emerald-300/20 bg-[#10251D] px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Particle Gravity Field"
              >
                <option value="off">Off — gentle drift and cursor repulsion</option>
                <option value="attraction">Attraction — gently toward center</option>
                <option value="repulsion">Repulsion — gently away from center</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="block">Ripple Effects</span>
              <select
                value={ripple}
                onChange={(event) => setRipple(event.currentTarget.value as RippleMode)}
                className="w-full rounded-md border border-emerald-300/20 bg-[#10251D] px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Ripple Effects"
              >
                <option value="cyan">Cyan Wave Ripple</option>
                <option value="purple">Purple Neon Ripple</option>
                <option value="off">Off</option>
              </select>
            </label>
          </div>

          <div
            className={`rounded-lg border p-4 transition-colors duration-300 lg:col-span-2 ${previewActive ? "border-cyan-300/60 bg-cyan-950/30" : "border-emerald-300/10 bg-black/15"}`}
          >
            <h2 className="text-sm font-medium text-emerald-50">Motion &amp; Loading Preview</h2>
            <p className="mt-1 text-xs text-emerald-100/60">
              Visual demonstration only. It does not analyze images or create results.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={triggerPreview}
                disabled={previewActive}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-950/40 px-3 py-2 text-sm text-cyan-50 transition-colors hover:bg-cyan-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-default"
              >
                {previewActive ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Trigger Action Process
              </button>
              <span role="status" aria-live="polite" className="text-xs text-emerald-100/70">
                {previewActive ? "Previewing interaction…" : "Idle — visual preview only"}
              </span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
