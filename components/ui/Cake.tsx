"use client";

/**
 * A hand-built, candlelit birthday cake (pure SVG, scales to any size).
 * Candles light up as gifts are unwrapped, and blow out for the wish.
 */
export default function Cake({
  candleCount = 5,
  litCount = 0,
  blownOut = false,
  className = "",
}: {
  candleCount?: number;
  litCount?: number;
  blownOut?: boolean;
  className?: string;
}) {
  // Evenly space the candles across the top tier.
  const left = 132;
  const right = 268;
  const candles = Array.from({ length: candleCount }, (_, i) => {
    const t = candleCount === 1 ? 0.5 : i / (candleCount - 1);
    return { x: left + t * (right - left), lit: !blownOut && i < litCount };
  });

  return (
    <svg
      viewBox="0 0 400 380"
      className={className}
      role="img"
      aria-label="birthday cake"
    >
      <defs>
        <linearGradient id="tierA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a121c" />
          <stop offset="1" stopColor="#3a0a14" />
        </linearGradient>
        <linearGradient id="tierB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a2030" />
          <stop offset="1" stopColor="#4a0c18" />
        </linearGradient>
        <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e9d8" />
          <stop offset="1" stopColor="#e9cfa6" />
        </linearGradient>
        <radialGradient id="flameGrad" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.45" stopColor="#ffb368" />
          <stop offset="1" stopColor="#c0303a" />
        </radialGradient>
        <radialGradient id="plate" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2a1014" />
          <stop offset="1" stopColor="#150508" />
        </radialGradient>
      </defs>

      {/* plate */}
      <ellipse cx="200" cy="346" rx="170" ry="22" fill="url(#plate)" />
      <ellipse
        cx="200"
        cy="343"
        rx="150"
        ry="16"
        fill="none"
        stroke="rgba(217,160,78,0.35)"
        strokeWidth="2"
      />

      {/* bottom tier */}
      <rect x="78" y="232" width="244" height="108" rx="16" fill="url(#tierA)" />
      <path
        d="M78 248 q20 18 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 v-16 H78 Z"
        fill="url(#frost)"
      />
      {/* gold dots */}
      {Array.from({ length: 9 }).map((_, i) => (
        <circle
          key={i}
          cx={96 + i * 26}
          cy={300}
          r="3.4"
          fill="rgba(217,160,78,0.7)"
        />
      ))}

      {/* top tier */}
      <rect x="120" y="150" width="160" height="96" rx="14" fill="url(#tierB)" />
      <path
        d="M120 166 q18 16 36 0 t36 0 t36 0 t36 0 t16 -4 v-12 H120 Z"
        fill="url(#frost)"
      />

      {/* candles */}
      {candles.map((c, i) => (
        <g key={i}>
          {/* candle body (striped) */}
          <rect
            x={c.x - 4}
            y={108}
            width="8"
            height="44"
            rx="3"
            fill="#f4e9d8"
          />
          <rect x={c.x - 4} y={118} width="8" height="6" fill="#c0303a" />
          <rect x={c.x - 4} y={134} width="8" height="6" fill="#c0303a" />
          {/* wick */}
          <rect x={c.x - 1} y={101} width="2" height="9" fill="#2a1a12" />

          {c.lit ? (
            <g className="flame">
              {/* glow */}
              <circle cx={c.x} cy={94} r="13" fill="rgba(255,179,104,0.35)" />
              {/* flame */}
              <path
                d={`M${c.x} 80 C ${c.x + 7} 90, ${c.x + 5} 102, ${c.x} 104 C ${c.x - 5} 102, ${c.x - 7} 90, ${c.x} 80 Z`}
                fill="url(#flameGrad)"
              />
              <ellipse cx={c.x} cy={99} rx="2.4" ry="4" fill="#fff3c4" />
            </g>
          ) : blownOut ? (
            // a tiny smoke wisp right after the wish is made
            <path
              d={`M${c.x} 100 q6 -8 0 -16 q-6 -8 0 -16`}
              fill="none"
              stroke="rgba(244,233,216,0.22)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
