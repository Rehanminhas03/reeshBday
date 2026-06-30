# 🌹 For You — A Candlelit Love Letter

A single-page, cinematic romantic web experience: a blooming 3D rose, falling
petals, floating ember-hearts, a DNA double-helix photo gallery, and a love
letter that reveals line by line — all driven by one buttery, scroll-linked
timeline.

Built to feel like an Awwwards "Site of the Day": warm, intimate, candlelit.

---

## ▶️ Run it (works out of the box)

```bash
npm install      # already done if you're reading this
npm run dev
```

Then open **http://localhost:3000**.

It runs immediately with the **procedural rose** and soft **placeholder photo
cards** — no assets required. Add your own photos and refresh to make it yours.

Other commands:

```bash
npm run build    # production build
npm run start    # serve the production build
```

---

## 💛 Make it personal (the only files you'll touch)

### 1. Words — `lib/config.ts`
All the personal text lives at the top of this one file:

- `HER_NAME` — her name (hero + finale)
- `OPENING_LINE` — the opening line under her name
- `LOVE_MESSAGE` — the love letter (an array; each entry is one revealed line)
- `FINAL_LINE` / `FINAL_SUBLINE` — the closing wish

### 2. Photos — `public/photos/`
Drop in `photo-1.jpg`, `photo-2.jpg`, … and refresh. The site reads **however
many** images exist, automatically. **3:4 portrait** looks best.
See `public/photos/README.md`.

### 3. (Optional) Rose model — `public/models/rose.glb`
Drop a `rose.glb` here to replace the procedural rose. If it's missing or fails
to load, the procedural rose is used. See `public/models/README.md`.

---

## 🎬 The journey (one continuous scroll)

1. **Hero** — the rose blooms open; her name and opening line fade up.
2. **Petals & embers** — petals fall, glowing hearts rise; density surges with
   scroll velocity.
3. **The rose reacts** — slow cinematic camera push + scroll-linked rotation.
4. **DNA photo helix** — your photos spiral on a double helix; scrolling spins
   it and the front photo scales up and brightens.
5. **Love letter** — a heartfelt message reveals line by line behind a candle glow.
6. **Final wish** — the rose returns, hearts swell, the closing line appears.

---

## 🧱 Tech & structure

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind v4**
- **React Three Fiber + drei** for 3D · **@react-three/postprocessing** (Bloom,
  DOF, Vignette, film-grain Noise)
- **GSAP + ScrollTrigger** synced to **Lenis** smooth scroll
- **Framer Motion** for text reveals & micro-interactions
- **next/font**: Cormorant Garamond (serif) + Inter (sans)

```
app/
  layout.tsx           fonts, metadata
  page.tsx             server component — reads photos/model, renders Experience
  globals.css          palette, film grain, vignette, glass, reduced-motion
components/
  Experience.tsx       client root: lazy 3D scene + sections + overlays
  SmoothScroll.tsx     Lenis ↔ GSAP ticker, publishes scroll progress
  sections/            Hero, Petals interlude, Helix intro, Love letter, Final
  three/
    Scene.tsx          Canvas, camera rig, candle lights, environment, assembly
    Rose.tsx           procedural rose (+ GLTF) with bloom-open timeline
    Petals.tsx         instanced falling petals
    Hearts.tsx         instanced glowing hearts
    DnaHelix.tsx       photo double-helix gallery
    PostFX.tsx         post-processing stack
    Loader.tsx         glowing-heart loading screen
lib/
  config.ts            ← EDIT ME (all personal content)
  scroll.ts            shared render-free scroll state + math helpers
  useEnvironment.ts    reduced-motion + device quality detection
```

## ⚡ Performance & accessibility

- Instanced particles, shared geometries/materials, scroll state kept out of
  React re-renders → aims for 60fps.
- **Quality tiers** auto-detected: phones get fewer particles, lighter
  post-processing, and lower pixel ratio.
- **`prefers-reduced-motion`** respected: native scroll, calm/static scene.
- 3D is lazy-loaded behind a tasteful loader with drei `<Preload>`.
