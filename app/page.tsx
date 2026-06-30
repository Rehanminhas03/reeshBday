import fs from "node:fs";
import path from "node:path";
import Experience from "@/components/Experience";
import type { MediaItem } from "@/lib/media";

/**
 * Server component: reads the asset folders at request time so the site picks
 * up however many photos AND videos you've dropped into /public/photos
 * automatically, and uses your /public/models/rose.glb if it exists. No config
 * needed — just add files and refresh.
 */
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;
const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function readMedia(): { photos: MediaItem[]; videos: MediaItem[] } {
  try {
    const dir = path.join(process.cwd(), "public", "photos");
    const files = fs.readdirSync(dir);
    const photos = files
      .filter((f) => IMAGE_RE.test(f))
      .sort(naturalSort)
      .map((f) => ({
        url: `/photos/${encodeURIComponent(f)}`,
        type: "image" as const,
      }));
    const videos = files
      .filter((f) => VIDEO_RE.test(f))
      .sort(naturalSort)
      .map((f) => ({
        url: `/photos/${encodeURIComponent(f)}`,
        type: "video" as const,
      }));
    return { photos, videos };
  } catch {
    return { photos: [], videos: [] };
  }
}

function hasRoseModel(): boolean {
  try {
    return fs.existsSync(
      path.join(process.cwd(), "public", "models", "rose.glb"),
    );
  } catch {
    return false;
  }
}

// Re-read the folders on each request in dev so newly-added files show up.
export const dynamic = "force-dynamic";

export default function Home() {
  const { photos, videos } = readMedia();
  const hasModel = hasRoseModel();
  return <Experience photos={photos} videos={videos} hasModel={hasModel} />;
}
