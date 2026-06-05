import type { Palette } from "@/lib/fragrances";

// A vector flacon, tinted per scent — the detail-page product visual (no second WebGL
// canvas, honouring the hero-only-3D decision). Liquid gradient body, gold/metal cap,
// a glass highlight, and a printed label.
export function SvgFlacon({ palette, name, className }: { palette: Palette; name: string; className?: string }) {
  const gid = `liquid-${name.replace(/\s+/g, "")}`;
  return (
    <svg viewBox="0 0 200 320" className={className} role="img" aria-label={`${name} flacon`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.light} stopOpacity="0.85" />
          <stop offset="42%" stopColor={palette.liquid} />
          <stop offset="100%" stopColor={palette.liquid} stopOpacity="0.92" />
        </linearGradient>
      </defs>

      {/* body */}
      <path d="M44 300 L44 120 Q44 96 68 88 L74 70 L126 70 L132 88 Q156 96 156 120 L156 300 Q156 308 148 308 L52 308 Q44 308 44 300 Z" fill={`url(#${gid})`} />
      {/* neck */}
      <rect x="84" y="44" width="32" height="30" rx="3" fill={palette.liquid} opacity="0.55" />
      {/* collar */}
      <rect x="80" y="38" width="40" height="10" rx="2" fill={palette.cap} />
      {/* cap */}
      <rect x="82" y="10" width="36" height="32" rx="4" fill={palette.cap} />
      <rect x="82" y="10" width="36" height="10" rx="4" fill="#ffffff" opacity="0.18" />

      {/* glass highlight */}
      <rect x="58" y="120" width="12" height="160" rx="6" fill="#ffffff" opacity="0.14" />
      {/* label */}
      <rect x="66" y="170" width="68" height="86" rx="2" fill="#f4efe6" opacity="0.92" />
      <text x="100" y="196" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="600" fill="#1a1813">
        ÉTHEREAL
      </text>
      <rect x="84" y="204" width="32" height="1.4" fill={palette.cap} />
      <text x="100" y="226" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" fill="#3a342b">
        {name}
      </text>
      <text x="100" y="244" textAnchor="middle" fontFamily="Georgia, serif" fontSize="6.5" letterSpacing="1" fill="#8a7a55">
        EAU DE PARFUM
      </text>
    </svg>
  );
}
