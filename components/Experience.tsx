"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "./SmoothScroll";
import Loader from "./three/Loader";
import HorizontalGallery from "./sections/HorizontalGallery";
import GiftGame from "./sections/GiftGame";
import type { MediaItem } from "@/lib/media";
import { Hero, PetalsInterlude } from "./sections/Sections";
import { useReducedMotion, useQuality } from "@/lib/useEnvironment";

/**
 * The WebGL scene is heavy and browser-only, so we lazy-load it with SSR
 * disabled. Everything text-based renders instantly; the 3D streams in behind
 * the tasteful <Loader />.
 */
const Scene = dynamic(() => import("./three/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Experience({
  photos,
  videos,
  hasModel,
}: {
  photos: MediaItem[];
  videos: MediaItem[];
  hasModel: boolean;
}) {
  const reduced = useReducedMotion();
  const quality = useQuality();

  return (
    <>
      <Loader />

      {/* Fixed, full-screen 3D backdrop (rose, petals, embers) */}
      <div className="fixed inset-0 z-0">
        <Scene hasModel={hasModel} quality={quality} reduced={reduced} />
      </div>

      {/* Scrolling birthday narrative, section by section, layered above the
          canvas. Text beats are `pointer-events-none` so the mouse reaches the
          canvas for parallax; the gallery & game re-enable their own events. */}
      <SmoothScroll>
        <main className="relative z-10">
          <div className="pointer-events-none">
            <Hero />
            <PetalsInterlude />
          </div>

          {/* Chapter two — large, horizontally-scrolling photos */}
          <HorizontalGallery photos={photos} reduced={reduced} />

          {/* Chapter three — the gift-unwrapping game + grand finale */}
          <GiftGame videos={videos} reduced={reduced} />
        </main>
      </SmoothScroll>

      {/* Page-wide texture overlays */}
      <div className="vignette-overlay" />
      <div className="grain-overlay" />
    </>
  );
}
