"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState, lerp } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useEnvironment";

/**
 * Premium smooth-scroll wrapper.
 *
 * Lenis interpolates the scroll position; we drive GSAP's ticker from Lenis so
 * ScrollTrigger and the smooth scroll share a single clock (no jitter, no
 * double rAF). On every frame we also publish normalised progress + velocity
 * into `scrollState`, which the WebGL scene reads without re-rendering React.
 *
 * For `prefers-reduced-motion` we skip Lenis entirely and just track native
 * scroll, so the page is calm and fully usable.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const updateProgress = (scroll: number, velocity = 0) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.scrollY = scroll;
      scrollState.progress = max > 0 ? scroll / max : 0;
      // Smooth the velocity so particles surge gently rather than snapping.
      scrollState.velocity = lerp(scrollState.velocity, velocity, 0.1);
    };

    // -------- Reduced motion: native scroll, no hijack --------
    if (reduced) {
      const onScroll = () => updateProgress(window.scrollY);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    // -------- Full experience: Lenis + GSAP --------
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      updateProgress(e.scroll, e.velocity);
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger ask Lenis where it is.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
