"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

/**
 * Tasteful loading screen: a single glowing heart that fills with light as the
 * 3D assets stream in, then fades away. Lives in the DOM (outside the Canvas)
 * and reads drei's global progress store.
 */
export default function Loader() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setHidden(true), 900);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (hidden) return null;

  const fill = Math.min(100, Math.round(progress));

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0506] transition-opacity duration-700"
      style={{ opacity: !active && progress >= 100 ? 0 : 1 }}
      aria-hidden
    >
      <div className="relative h-24 w-24">
        {/* dim heart outline */}
        <Heart className="absolute inset-0 h-full w-full text-rose-deep/40" />
        {/* glowing heart, clipped to fill from the bottom */}
        <div
          className="absolute inset-0 overflow-hidden transition-[height] duration-300"
          style={{ height: `${fill}%`, top: "auto", bottom: 0 }}
        >
          <Heart
            className="absolute bottom-0 left-0 h-24 w-24 text-rose"
            glow
          />
        </div>
      </div>
      <p className="mt-8 font-serif text-lg italic tracking-wide text-amber/70">
        lighting the candles…
      </p>
      <p className="mt-1 font-sans text-xs tracking-[0.3em] text-cream/30">
        {fill}%
      </p>
    </div>
  );
}

function Heart({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={
        glow
          ? { filter: "drop-shadow(0 0 12px rgba(192,48,58,0.8))" }
          : undefined
      }
    >
      <path d="M12 21s-7.5-4.9-10-9.2C.4 8.6 1.9 5 5.3 5c2 0 3.4 1.2 4.2 2.3l.5.7.5-.7C11.3 6.2 12.7 5 14.7 5 18.1 5 19.6 8.6 22 11.8 19.5 16.1 12 21 12 21z" />
    </svg>
  );
}
