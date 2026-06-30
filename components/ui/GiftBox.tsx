"use client";

type Accent = "rose" | "amber" | "oxblood";

const ACCENTS: Record<Accent, { box: string; boxDark: string; ribbon: string }> =
  {
    rose: { box: "#a01624", boxDark: "#6f0f19", ribbon: "#f0c987" },
    amber: { box: "#c98a3a", boxDark: "#8a5a1e", ribbon: "#f4e9d8" },
    oxblood: { box: "#5a0f1e", boxDark: "#360912", ribbon: "#d9a04e" },
  };

/**
 * A wrapped gift box (pure SVG). Idle-floats via CSS until opened; on hover it
 * lifts and glows. When `opened`, the lid lifts off and a sparkle appears.
 */
export default function GiftBox({
  accent = "rose",
  opened = false,
  onClick,
  label,
}: {
  accent?: Accent;
  opened?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const c = ACCENTS[accent];

  return (
    <button
      type="button"
      onClick={opened ? undefined : onClick}
      aria-label={label}
      className={`gift bg-transparent ${opened ? "is-opened" : ""}`}
    >
      <svg
        viewBox="0 0 200 210"
        role="img"
        aria-hidden
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id={`giftbody-${accent}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.box} />
            <stop offset="1" stopColor={c.boxDark} />
          </linearGradient>
        </defs>

        {/* glow under the box */}
        <ellipse cx="100" cy="196" rx="64" ry="10" fill="rgba(0,0,0,0.45)" />

        {/* box body */}
        <rect
          x="42"
          y="86"
          width="116"
          height="104"
          rx="8"
          fill={`url(#giftbody-${accent})`}
        />
        {/* vertical ribbon */}
        <rect x="90" y="86" width="20" height="104" fill={c.ribbon} opacity="0.92" />

        {/* lid — lifts up & tilts when opened */}
        <g
          style={{
            transform: opened ? "translateY(-26px) rotate(-8deg)" : "none",
            transformOrigin: "100px 78px",
            transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <rect x="34" y="64" width="132" height="30" rx="7" fill={c.box} />
          <rect x="90" y="64" width="20" height="30" fill={c.ribbon} />
          {/* bow */}
          <circle cx="100" cy="60" r="7" fill={c.ribbon} />
          <path
            d="M100 60 C 78 40, 64 44, 70 60 C 76 74, 92 66, 100 60 Z"
            fill={c.ribbon}
          />
          <path
            d="M100 60 C 122 40, 136 44, 130 60 C 124 74, 108 66, 100 60 Z"
            fill={c.ribbon}
          />
        </g>

        {/* sparkle when opened */}
        {opened && (
          <g
            fill="#f0c987"
            style={{
              transformOrigin: "100px 100px",
              animation: "none",
            }}
          >
            <path d="M100 96 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 Z" />
          </g>
        )}
      </svg>
    </button>
  );
}
