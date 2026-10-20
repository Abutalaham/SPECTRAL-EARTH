import { useRef, useEffect } from "react";
import { useDeviceCapabilities } from "./useDeviceCapabilities";

/**
 * High-performance 3D tilt hook for desktop devices.
 * Directly mutates element transform via requestAnimationFrame to avoid React re-renders.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTiltDeg = 4) {
  const ref = useRef<T>(null);
  const { canRunTilt } = useDeviceCapabilities();

  useEffect(() => {
    const el = ref.current;
    if (!el || !canRunTilt) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      // Only fine pointer (mouse / trackpad) should trigger tilt
      if (e.pointerType !== "mouse") return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles clamped to maxTiltDeg
      const rotateX = ((y - centerY) / centerY) * -maxTiltDeg;
      const rotateY = ((x - centerX) / centerX) * maxTiltDeg;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
        el.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
      });
    };

    const handlePointerLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        el.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
      });
    };

    const handlePointerEnter = () => {
      el.style.transition = "transform 0.1s ease-out";
    };

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    el.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.removeEventListener("pointerenter", handlePointerEnter);
    };
  }, [canRunTilt, maxTiltDeg]);

  return ref;
}
