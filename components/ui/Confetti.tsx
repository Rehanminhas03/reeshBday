"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#d9a04e", "#f0c987", "#c0303a", "#f4e9d8", "#ff8a6a"];
const GLYPHS = ["♥", "✦", "●", "❤", "✧"];

/**
 * A celebratory confetti burst rendered in the DOM. Mount it (with a unique
 * `key`) to fire; it animates outward once and is meant to be unmounted by the
 * parent after ~1.8s. Skips entirely for reduced motion.
 */
export default function Confetti({
  count = 42,
  originY = 50,
  reduced = false,
}: {
  count?: number;
  /** vertical origin as a % of the container height */
  originY?: number;
  reduced?: boolean;
}) {
  const pieces = useMemo(() => {
    // Deterministic-ish spread without Math.random dependency issues.
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const spread = 120 + ((i * 53) % 220);
      const x = Math.cos(angle) * spread + (((i * 31) % 60) - 30);
      const y = Math.sin(angle) * spread - (((i * 17) % 180) + 60);
      return {
        x,
        y,
        rot: ((i * 47) % 360) - 180,
        scale: 0.7 + ((i * 13) % 60) / 100,
        color: COLORS[i % COLORS.length],
        glyph: GLYPHS[i % GLYPHS.length],
        delay: ((i * 7) % 18) / 100,
        duration: 1.3 + ((i * 11) % 60) / 100,
      };
    });
  }, [count]);

  if (reduced) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80] overflow-visible"
      aria-hidden
    >
      <div
        className="absolute left-1/2"
        style={{ top: `${originY}%` }}
      >
        {pieces.map((p, i) => (
          <motion.span
            key={i}
            className="confetti-piece"
            style={{ color: p.color, fontSize: `${14 * p.scale}px` }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: p.scale }}
            animate={{
              x: p.x,
              y: [0, p.y, p.y + 220],
              opacity: [1, 1, 0],
              rotate: p.rot,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {p.glyph}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
