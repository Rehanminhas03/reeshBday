"use client";

import { motion } from "framer-motion";
import TextReveal from "./TextReveal";
import { HER_NAME, HERO_EYEBROW, HERO_EMOJI, OPENING_LINE } from "@/lib/config";

/* A consistent full-height section shell that lets the 3D scene show through. */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex min-h-screen w-full flex-col items-center justify-center px-6 ${className}`}
    >
      {children}
    </section>
  );
}

/* ----------------------------- 1 · HERO ----------------------------------- */
export function Hero() {
  return (
    <Section id="hero">
      <div className="pointer-events-none flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 flex items-center gap-4 font-sans text-sm uppercase tracking-[0.55em] text-amber/85 md:text-base"
        >
          <span className="h-px w-10 bg-amber/40" />
          {HERO_EYEBROW}
          <span className="h-px w-10 bg-amber/40" />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-shadow-glow font-serif text-7xl font-light leading-[0.95] text-cream sm:text-8xl md:text-9xl"
        >
          {HER_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.0, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-3xl md:text-4xl"
        >
          {HERO_EMOJI}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl font-serif text-2xl italic text-cream/80 md:text-3xl"
        >
          {OPENING_LINE}
        </motion.p>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1.6 }}
        className="absolute bottom-10 flex flex-col items-center gap-3"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-cream/40">
          scroll to begin
        </span>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-amber/30 p-1.5">
          <span className="scroll-hint-dot h-1.5 w-1.5 rounded-full bg-amber/80" />
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------- 2 · PETALS / EMBERS ---------------------------- */
export function PetalsInterlude() {
  return (
    <Section id="petals">
      <TextReveal
        lines={[
          "Petals fall like quiet promises,",
          "and every ember rises for you.",
        ]}
        className="max-w-3xl text-center"
        lineClassName="font-serif text-4xl font-light italic leading-relaxed text-cream/85 md:text-5xl"
      />
    </Section>
  );
}
