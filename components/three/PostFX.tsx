"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  DepthOfField,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { Quality } from "@/lib/useEnvironment";

/**
 * Cinematic post-processing stack. Tuned for taste, not blowout:
 *   • Bloom    — only the hottest highlights (candles, hearts) glow.
 *   • DOF      — softly blurs the deep background (desktop only).
 *   • Vignette — gentle darkening at the frame edges.
 *   • Noise    — fine film grain over everything.
 *
 * On lower-tier devices we drop DOF and soften bloom to protect the framerate.
 */
export default function PostFX({ quality }: { quality: Quality }) {
  const isHigh = quality === "high";
  const isLow = quality === "low";

  return (
    <EffectComposer enableNormalPass={false} multisampling={isHigh ? 4 : 0}>
      <Bloom
        intensity={isLow ? 0.5 : 0.85}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
      {/* Depth of field: full bokeh on desktop, neutralised (bokehScale 0,
          tiny target) on phones so it costs almost nothing. */}
      <DepthOfField
        focusDistance={0.012}
        focalLength={0.04}
        bokehScale={isHigh ? 3.2 : 0}
        height={isHigh ? 480 : 240}
      />
      <Vignette
        offset={0.32}
        darkness={0.72}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.OVERLAY}
        opacity={isLow ? 0.18 : 0.32}
      />
    </EffectComposer>
  );
}
