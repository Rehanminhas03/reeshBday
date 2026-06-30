/**
 * A tiny, render-free shared scroll store.
 *
 * The 3D scene must NOT re-render React on every scroll frame (that would
 * murder 60fps). Instead, Lenis writes the current scroll progress into this
 * mutable object once per frame, and the R3F components read it inside
 * useFrame. No React state, no re-renders — just buttery numbers.
 */
export const scrollState = {
  /** Normalised 0 → 1 progress through the entire page. */
  progress: 0,
  /** Smoothed scroll velocity (used to energise the particles). */
  velocity: 0,
  /** Raw pixel scroll position. */
  scrollY: 0,
  /** 0→1 progress through the pinned horizontal gallery (drives the rose
   *  receding into the background while the photos take the stage). */
  galleryProgress: 0,
};

/** Linear interpolation helper used all over the scene. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clamp a number to a range. */
export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

/**
 * Maps a value from one range to another (e.g. turn global scroll progress
 * into a local 0→1 progress for a single section).
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1,
) => {
  const t = clamp((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
};

/** Smoothstep easing for organic, non-linear motion. */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
