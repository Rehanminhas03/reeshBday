"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Cake from "../ui/Cake";
import GiftBox from "../ui/GiftBox";
import Modal from "../ui/Modal";
import Confetti from "../ui/Confetti";
import type { MediaItem } from "@/lib/media";
import {
  HER_NAME,
  GAME_TITLE,
  GAME_INSTRUCTION,
  WISH_PROMPT,
  WISH_HINT,
  GIFT_NOTES,
  FINALE_TITLE,
  FINAL_SUBLINE,
  LOVE_MESSAGE,
} from "@/lib/config";

const ACCENTS = ["rose", "amber", "oxblood"] as const;

/**
 * "Unwrap the Gifts" — the interactive birthday game + grand finale.
 *
 * Each video becomes a wrapped gift. Tapping one plays it (with sound) in a
 * modal and lights a candle on the cake. Once every gift is open, all the
 * candles are lit and a "make a wish" prompt appears — tapping the cake blows
 * them out and reveals the love-letter finale with confetti.
 */
export default function GiftGame({
  videos,
  reduced = false,
}: {
  videos: MediaItem[];
  reduced?: boolean;
}) {
  // If no videos exist yet, fall back to a few message-only gifts.
  const gifts: MediaItem[] =
    videos.length > 0
      ? videos
      : [
          { url: "", type: "image" },
          { url: "", type: "image" },
          { url: "", type: "image" },
        ];

  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [blownOut, setBlownOut] = useState(false);
  const [confetti, setConfetti] = useState<{
    id: number;
    count: number;
    originY: number;
  } | null>(null);
  const burstId = useRef(0);

  const allOpened = opened.size === gifts.length;
  const finaleName = FINALE_TITLE.replace("{name}", HER_NAME);

  const fireConfetti = (count: number, originY: number) => {
    burstId.current += 1;
    setConfetti({ id: burstId.current, count, originY });
    window.setTimeout(() => setConfetti(null), 2000);
  };

  const openGift = (i: number) => {
    setActive(i);
    setOpened((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
    fireConfetti(reduced ? 0 : 36, 42);
  };

  const makeWish = () => {
    if (blownOut) return;
    setBlownOut(true);
    fireConfetti(reduced ? 0 : 64, 30);
  };

  const activeItem = active != null ? gifts[active] : null;
  const activeNote =
    active != null ? GIFT_NOTES[active % GIFT_NOTES.length] : "";

  return (
    <section
      id="game"
      className="pointer-events-auto relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-12 px-6 py-28"
    >
      {/* heading */}
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 font-sans text-xs uppercase tracking-[0.45em] text-amber/70">
          chapter three
        </span>
        <h2 className="text-shadow-glow font-serif text-5xl font-light leading-tight text-cream md:text-7xl">
          {GAME_TITLE}
        </h2>
        <p className="mt-5 font-serif text-xl italic text-cream/70 md:text-2xl">
          {allOpened ? WISH_PROMPT : GAME_INSTRUCTION}
        </p>
        {!allOpened && (
          <p className="mt-3 font-sans text-sm tracking-[0.2em] text-cream/40">
            {opened.size} / {gifts.length} unwrapped
          </p>
        )}
      </div>

      {/* cake — candles light as gifts open; tap to make a wish when ready */}
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={allOpened ? makeWish : undefined}
          aria-label={allOpened ? "make a wish and blow out the candles" : "cake"}
          className={`relative w-[clamp(260px,42vw,520px)] ${
            allOpened && !blownOut ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {allOpened && !blownOut && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-near-black/60 px-4 py-1 font-sans text-[11px] uppercase tracking-[0.25em] text-amber/80 backdrop-blur">
              {WISH_HINT}
            </span>
          )}
          <Cake
            candleCount={gifts.length}
            litCount={opened.size}
            blownOut={blownOut}
            className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          />
        </button>
      </div>

      {/* the gifts */}
      {!blownOut && (
        <div className="flex max-w-4xl flex-wrap items-center justify-center gap-6 md:gap-10">
          {gifts.map((_, i) => (
            <GiftBox
              key={i}
              accent={ACCENTS[i % ACCENTS.length]}
              opened={opened.has(i)}
              onClick={() => openGift(i)}
              label={`open gift ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* grand finale */}
      {blownOut && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex max-w-2xl flex-col items-center gap-8 text-center"
        >
          <h3 className="text-shadow-glow font-serif text-5xl font-light leading-tight text-cream md:text-7xl">
            {finaleName}
          </h3>
          <div className="flex flex-col gap-2">
            {LOVE_MESSAGE.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + i * 0.18,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-serif text-xl font-light leading-relaxed text-cream/85 md:text-2xl"
              >
                {line}
              </motion.p>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + LOVE_MESSAGE.length * 0.18 + 0.3 }}
            className="font-serif text-lg italic text-amber/70 md:text-xl"
          >
            {FINAL_SUBLINE}
          </motion.p>
          <span
            className="text-3xl text-rose"
            style={{ filter: "drop-shadow(0 0 16px rgba(192,48,58,0.7))" }}
          >
            ♥
          </span>
        </motion.div>
      )}

      {/* confetti bursts */}
      {confetti && (
        <Confetti
          key={confetti.id}
          count={confetti.count}
          originY={confetti.originY}
          reduced={reduced}
        />
      )}

      {/* surprise modal */}
      <Modal open={active != null} onClose={() => setActive(null)}>
        {activeItem && activeItem.url ? (
          <>
            <video
              src={activeItem.url}
              controls
              autoPlay
              playsInline
              preload="metadata"
            />
            <p className="px-6 py-5 text-center font-serif text-xl italic text-cream/90 md:text-2xl">
              {activeNote}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <span className="text-4xl">💛</span>
            <p className="max-w-md font-serif text-2xl italic leading-relaxed text-cream/90">
              {activeNote || "a little surprise, just for you"}
            </p>
            <p className="font-sans text-xs tracking-[0.2em] text-cream/40">
              add your videos to /public/photos to fill these gifts
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
