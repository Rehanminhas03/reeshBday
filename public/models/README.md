# 🌹 The 3D rose model

## ✅ Already set up for you

Your `rose-big-rose` model (a long-stemmed rose) was converted from `.obj` to a
web-ready **`rose.glb`** in this folder, with its textures embedded. The site
detects `rose.glb` automatically and uses it as the hero rose — auto-centered,
auto-scaled, and lit by the candlelight.

### Notes on your other files
- `rose/rose.c4d` — Cinema 4D format. **Browsers can't load `.c4d`** (no web
  loader exists), so this one can't be used on the site.
- `rose-big-rose/…` (`.fbx`, `.mb`, `.obj`) — source files. Only the `.obj` is
  web-loadable; it's already been converted to `rose.glb`. You can keep these
  for reference or delete the folders to slim the project — `rose.glb` is all
  the site needs.

---

# Want to swap in a different rose?

The hero already renders a **procedural 3D rose** (layered, translucent petals
that bloom open on load) — so the site looks beautiful with **no model file at
all**.

If you'd like to use a custom, higher-detail rose instead:

1. Export or download a rose as **`rose.glb`** (binary glTF).
2. Place it in this folder so the path is exactly:
   ```
   public/models/rose.glb
   ```
3. Refresh. The site detects the file and uses it automatically. The model
   still gets the warm candlelight, bloom, and the scroll-driven rotation /
   bloom-open animation.

## Tips

- **Format:** `.glb` (single-file binary glTF) is preferred.
- **Scale:** aim for roughly **2–3 units** tall; it's auto-rotated and lit.
- **Origin:** center the model at its base/center for the nicest rotation.
- If the model fails to load for any reason, the site silently falls back to
  the procedural rose — nothing breaks.
