import { useEffect, useState } from "react";

export interface DeviceCapabilities {
  /** Screen width < 768px */
  isSmallScreen: boolean;
  /** Pointer is touch / coarse */
  isTouchDevice: boolean;
  /** User system preference: prefers-reduced-motion */
  prefersReducedMotion: boolean;
  /** Browser indicates Save-Data / 2G-3G network */
  isSaveData: boolean;
  /** Low CPU cores (<= 4) */
  isLowConcurrency: boolean;
  /** Whether the full 3D WebGL scene should run */
  canRun3DHero: boolean;
  /** Whether interactive tilt animations should run */
  canRunTilt: boolean;
}

function checkCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    return {
      isSmallScreen: false,
      isTouchDevice: false,
      prefersReducedMotion: false,
      isSaveData: false,
      isLowConcurrency: false,
      canRun3DHero: true,
      canRunTilt: true,
    };
  }

  const isSmallScreen = window.innerWidth < 768 || window.matchMedia("(max-width: 768px)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // @ts-expect-error - connection is vendor-specific in navigator
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSaveData = connection ? Boolean(connection.saveData) : false;
  const isLowConcurrency = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

  // The 3D WebGL hero is disabled on mobile/touch, reduced motion, or constrained connections
  const canRun3DHero = !isSmallScreen && !isTouchDevice && !prefersReducedMotion && !isSaveData;
  // Tilt is fine on desktop fine-pointer devices without reduced motion
  const canRunTilt = !isTouchDevice && !prefersReducedMotion;

  return {
    isSmallScreen,
    isTouchDevice,
    prefersReducedMotion,
    isSaveData,
    isLowConcurrency,
    canRun3DHero,
    canRunTilt,
  };
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(checkCapabilities);

  useEffect(() => {
    const update = () => setCapabilities(checkCapabilities());

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 768px)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    const addListener = (mql: MediaQueryList, fn: () => void) => {
      if (mql.addEventListener) mql.addEventListener("change", fn);
      else mql.addListener(fn);
    };
    const removeListener = (mql: MediaQueryList, fn: () => void) => {
      if (mql.removeEventListener) mql.removeEventListener("change", fn);
      else mql.removeListener(fn);
    };

    addListener(motionQuery, update);
    addListener(widthQuery, update);
    addListener(pointerQuery, update);
    window.addEventListener("resize", update);

    return () => {
      removeListener(motionQuery, update);
      removeListener(widthQuery, update);
      removeListener(pointerQuery, update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return capabilities;
}
