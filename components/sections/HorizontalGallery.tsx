"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scroll";
import type { MediaItem } from "@/lib/media";
import {
  GALLERY_NOTES,
  MOMENTS_TITLE,
  MOMENTS_SUBLINE,
  PHOTO_PLACEHOLDER_CAPTIONS,
} from "@/lib/config";

/* ---------------------------------------------------------------------------
   One gallery card. Real <img>/<video> elements (so videos actually PLAY) with
   a birthday note beneath. Videos play only while on-screen (Intersection
   Observer) to keep things smooth.
--------------------------------------------------------------------------- */
function MediaCard({
  item,
  index,
  note,
}: {
  item: MediaItem;
  index: number;
  note: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Force the muted *property* (React's attribute alone can be unreliable),
    // otherwise browsers block muted-autoplay.
    v.muted = true;
    v.defaultMuted = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <article className="gallery-card">
      <div className="gallery-media">
        <span className="gallery-badge">
          {item.type === "video" ? "▶ moment" : "✦ moment"}
        </span>
        {item.type === "video" ? (
          <video
            ref={videoRef}
            src={item.url}
            muted
            loop
            playsInline
            preload="metadata"
            // muted + playsInline lets it autoplay on every browser
            autoPlay
          />
        ) : item.url ? (
          // Eager load: lazy-loading doesn't reliably fire inside the
          // horizontally-transformed (off-screen) scroll track.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={note} decoding="async" />
        ) : (
          // placeholder slot before real photos are added
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-burgundy/40 to-near-black">
            <span className="text-5xl text-amber/50">✦</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="gallery-num">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="gallery-note">{note}</p>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------------
   Horizontal, scroll-driven gallery. As you scroll vertically the section pins
   and the row of large cards glides HORIZONTALLY — one continuous, buttery
   move (GSAP ScrollTrigger, scrubbed, synced to Lenis).

   prefers-reduced-motion → a calm vertical stack, no pinning.
--------------------------------------------------------------------------- */
export default function HorizontalGallery({
  photos,
  reduced = false,
}: {
  photos: MediaItem[];
  reduced?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Fall back to placeholder cards if no photos have been added yet.
  const items: MediaItem[] =
    photos.length > 0
      ? photos
      : PHOTO_PLACEHOLDER_CAPTIONS.map(() => ({
          url: "",
          type: "image" as const,
        }));

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollState.galleryProgress = self.progress;
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });
    }, section);

    // Recompute once everything has settled (fonts/layout).
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 400);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, [reduced, items.length]);

  /* ---- Reduced-motion: calm vertical stack ---- */
  if (reduced) {
    return (
      <section className="pointer-events-auto relative z-10 flex flex-col items-center gap-16 px-6 py-32">
        <GalleryHeading />
        <div className="flex w-full max-w-md flex-col items-center gap-20">
          {items.map((item, i) => (
            <MediaCard
              key={(item.url || "ph") + i}
              item={item}
              index={i}
              note={GALLERY_NOTES[i % GALLERY_NOTES.length]}
            />
          ))}
        </div>
      </section>
    );
  }

  /* ---- Full experience: pinned horizontal scroll ---- */
  return (
    <section
      ref={sectionRef}
      className="pointer-events-auto relative z-10 h-screen w-full overflow-hidden"
    >
      <div className="flex h-full items-center">
        <div
          ref={trackRef}
          className="flex items-center gap-[5vw] px-[12vw] will-change-transform"
        >
          {/* Intro panel rides in as the first "card" */}
          <div className="flex w-[58vw] max-w-[520px] flex-none flex-col justify-center pr-[4vw]">
            <GalleryHeading />
          </div>

          {items.map((item, i) => (
            <MediaCard
              key={(item.url || "ph") + i}
              item={item}
              index={i}
              note={GALLERY_NOTES[i % GALLERY_NOTES.length]}
            />
          ))}

          {/* breathing room at the end */}
          <div className="w-[12vw] flex-none" aria-hidden />
        </div>
      </div>

      {/* progress bar */}
      <div className="absolute bottom-10 left-1/2 h-px w-40 -translate-x-1/2 overflow-hidden bg-cream/15">
        <div
          ref={fillRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-amber to-rose"
        />
      </div>
    </section>
  );
}

function GalleryHeading() {
  return (
    <div className="flex flex-col gap-5">
      <span className="font-sans text-sm uppercase tracking-[0.45em] text-amber/75">
        chapter two
      </span>
      <h2 className="text-shadow-glow font-serif text-6xl font-light leading-tight text-cream md:text-7xl">
        {MOMENTS_TITLE}
      </h2>
      <p className="max-w-sm font-serif text-xl italic text-cream/65 md:text-2xl">
        {MOMENTS_SUBLINE}
      </p>
    </div>
  );
}
