"use client";

import { useSyncExternalStore } from "react";

/**
 * `useSyncExternalStore` is the idiomatic React 19 way to read browser-only,
 * SSR-unsafe values (media queries, viewport): no `setState`-in-effect, no
 * hydration mismatch (the server snapshot is a stable default).
 */
function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

/**
 * Detects `prefers-reduced-motion`. When true we serve a calmer experience:
 * no smooth-scroll hijack, frozen particles, a static (already-bloomed) rose.
 */
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = subscribeMedia(REDUCED_QUERY);

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false, // server snapshot
  );
}

export type Quality = "high" | "medium" | "low";

/** Recompute the quality tier from the current device + viewport. */
function getQuality(): Quality {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (w < 768 || coarse || cores <= 4) {
    return w < 480 ? "low" : "medium";
  }
  return "high";
}

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/**
 * Picks a quality tier from the device. Drives particle counts, post-processing
 * passes, pixel ratio and shadow usage so phones stay at 60fps.
 */
export function useQuality(): Quality {
  return useSyncExternalStore(
    subscribeResize,
    getQuality,
    () => "high" as Quality, // server snapshot
  );
}
