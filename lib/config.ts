/**
 * ============================================================================
 *  EDIT ME — All the personal content lives here.
 *  Change the name, the lines, and the love letter. Nothing else required.
 * ============================================================================
 */

/** Her name. Shown in the hero and the final wish. */
export const HER_NAME = "Reesha";

/** A little emoji accent shown under her name. */
export const HERO_EMOJI = "😊 ❤️";

/** Small eyebrow text above her name in the hero. */
export const HERO_EYEBROW = "Happy Birthday";

/** The short opening line that fades up under her name in the hero. */
export const OPENING_LINE = "Today, the whole world celebrates you.";

/** Heading + subline for the photo/video gallery section. */
export const MOMENTS_TITLE = "Our Favourite Moments";
export const MOMENTS_SUBLINE = "scroll — and let our story drift by";

/**
 * A sweet little birthday note for each photo/video card. The gallery pairs
 * note #1 with card #1, and so on; if you have more media than notes, the
 * notes gently repeat. Add, remove, or rewrite freely.
 */
export const GALLERY_NOTES: string[] = [
  "where it all began 💛",
  "your smile — my favourite view",
  "every laugh, framed forever",
  "us, against the whole world",
  "the day I knew it was you",
  "a thousand little forevers",
  "still my favourite person",
  "you make ordinary days golden",
  "my home is wherever you are",
  "here's to growing old together",
  "you, lit by candlelight",
  "and a million more to come ✨",
];

/* ---------------------------------------------------------------------------
   THE GAME — "Unwrap the Gifts"
   Each of your videos becomes a wrapped gift. Tapping a gift plays that video
   (with sound) as a surprise. The note below is shown with each surprise; if
   you have more videos than notes, the notes gently repeat.
--------------------------------------------------------------------------- */
export const GAME_TITLE = "A Few Little Surprises";
export const GAME_INSTRUCTION = "Tap a gift to unwrap a surprise 🎁";
export const WISH_PROMPT = "All unwrapped — now make a wish 🎂";
export const WISH_HINT = "tap the candles to blow them out";

/** A caption shown with each unwrapped surprise (video). */
export const GIFT_NOTES: string[] = [
  "press play, my love 💋",
  "this one always makes me smile",
  "caught you being perfect",
  "our kind of happy",
  "a moment I never want to forget",
  "just us, just this",
];

/** The headline of the grand finale, after the wish. {name} → HER_NAME. */
export const FINALE_TITLE = "Happy Birthday, {name} ❤️";

/** The final line revealed at the very end of the journey. */
export const FINAL_LINE = "Happy Birthday, my love.";
export const FINAL_SUBLINE = "Here's to every chapter still unwritten.";

/**
 * The love letter. Each string is rendered as its own line and revealed,
 * one after another, with a soft masked stagger as it scrolls into view.
 * Add or remove lines freely.
 */
export const LOVE_MESSAGE: string[] = [
  "From the very first moment,",
  "the whole world rearranged itself around you.",
  "Every ordinary day turned golden",
  "simply because you were in it.",
  "You are my favourite thought,",
  "my softest place to land,",
  "and the most beautiful reason",
  "my heart has ever learned to beat.",
];

/**
 * Photos for the DNA helix. The site automatically reads every image you drop
 * into /public/photos (photo-1.jpg, photo-2.jpg, ...). You do NOT need to edit
 * this — it's just a fallback caption set used for the placeholder slots that
 * appear before you add your own pictures.
 */
export const PHOTO_PLACEHOLDER_CAPTIONS: string[] = [
  "us",
  "always",
  "you & me",
  "forever",
  "our story",
  "my heart",
  "this love",
  "everyday",
];

/** Warm cinematic palette shared between CSS and the 3D scene. */
export const PALETTE = {
  oxblood: "#3a0a14",
  burgundy: "#5a0f1e",
  amber: "#d9a04e",
  gold: "#f0c987",
  rose: "#c0303a",
  roseDeep: "#7a121c",
  nearBlack: "#0a0506",
  candle: "#ffb368",
} as const;
