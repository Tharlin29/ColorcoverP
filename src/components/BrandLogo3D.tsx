import { useId } from "react";

interface BrandLogo3DProps {
  variant?: "header" | "hero";
  className?: string;
}

interface LetterSpec {
  char: string;
  top: string;
  mid: string;
  bottom: string;
  depth: string;
}

// Exact pastel-vibrant color cadence inspired by the GBTK STUDIO 3D balloon lettering
const TITLE_LETTERS: LetterSpec[] = [
  { char: "G", top: "#FFA08D", mid: "#FF7860", bottom: "#E8563E", depth: "#C73E29" },
  { char: "B", top: "#72CFC7", mid: "#36A89E", bottom: "#21877F", depth: "#16645E" },
  { char: "T", top: "#FFE796", mid: "#FFD15C", bottom: "#F0B22E", depth: "#C78B14" },
  { char: "K", top: "#DFC2F7", mid: "#C194E8", bottom: "#9E6ECA", depth: "#7A4CA6" },
  { char: " ", top: "transparent", mid: "transparent", bottom: "transparent", depth: "transparent" },
  { char: "S", top: "#FFA08D", mid: "#FF7860", bottom: "#E8563E", depth: "#C73E29" },
  { char: "T", top: "#A6E5E0", mid: "#6BCBC4", bottom: "#43A8A1", depth: "#2A7E78" },
  { char: "U", top: "#FFE796", mid: "#FFD15C", bottom: "#F0B22E", depth: "#C78B14" },
  { char: "D", top: "#DFC2F7", mid: "#C194E8", bottom: "#9E6ECA", depth: "#7A4CA6" },
  { char: "I", top: "#FFA890", mid: "#FF8066", bottom: "#E65B40", depth: "#C24129" },
  { char: "O", top: "#BFE0C2", mid: "#8FC495", bottom: "#68A36F", depth: "#497E50" },
];

const SUBTITLE_TEXT = "PRINTABLE PAGE & COLORING BOOKS";

// Playful alternating pastel letter palette with strong readability inside white sticker outline
const SUBTITLE_PALETTE = [
  "#EF705B", // Coral
  "#54B0A8", // Mint Teal
  "#A982D9", // Lavender
  "#E5AE32", // Butter Yellow
  "#EC836D", // Peach Coral
  "#73B07C", // Sage Green
  "#3C9C95", // Deep Aqua
];

export function BrandLogo3D({ variant = "header", className = "" }: BrandLogo3DProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const isHero = variant === "hero";
  const viewBoxWidth = isHero ? 506 : 292;
  const viewBoxHeight = isHero ? 114 : 64;
  const titleFontSize = isHero ? 60 : 33;
  const titleY = isHero ? 60 : 34;
  const titleLetterSpacing = isHero ? 2.2 : 1.2;
  const titleX = isHero ? 6 : 4;

  const subFontSize = isHero ? 21 : 12.2;
  const subY = isHero ? 98 : 54;
  const subLetterSpacing = isHero ? 0.9 : 0.48;
  const subStrokeWidth = isHero ? 7.2 : 4.6;

  const extrudeSteps = isHero
    ? [
        { dx: 1.8, dy: 6.2 },
        { dx: 1.4, dy: 4.8 },
        { dx: 1.0, dy: 3.4 },
        { dx: 0.5, dy: 2.0 },
      ]
    : [
        { dx: 1.0, dy: 3.4 },
        { dx: 0.7, dy: 2.3 },
        { dx: 0.35, dy: 1.2 },
      ];

  let colorIdx = 0;
  const subtitleChars = SUBTITLE_TEXT.split("").map((ch) => {
    if (ch === " ") {
      return { ch, color: "transparent" };
    }
    const color = SUBTITLE_PALETTE[colorIdx % SUBTITLE_PALETTE.length];
    colorIdx += 1;
    return { ch, color };
  });

  return (
    <span
      className={`inline-flex items-center select-none shrink-0 ${className}`}
      aria-label="GBTK STUDIO — PRINTABLE PAGE & COLORING BOOKS"
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className={
          isHero
            ? "w-full max-w-[440px] sm:max-w-[500px] h-auto overflow-visible"
            : "h-[38px] sm:h-[46px] w-auto overflow-visible"
        }
        role="img"
        aria-hidden="true"
      >
        <defs>
          {TITLE_LETTERS.map((spec, idx) =>
            spec.char === " " ? null : (
              <linearGradient
                key={idx}
                id={`${uid}-grad-${idx}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={spec.top} />
                <stop offset="48%" stopColor={spec.mid} />
                <stop offset="100%" stopColor={spec.bottom} />
              </linearGradient>
            )
          )}

          {/* Glossy Puffy 3D Balloon Bevel & Specular Shine */}
          <filter
            id={`${uid}-puffy3d`}
            x="-12%"
            y="-20%"
            width="124%"
            height="155%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation={isHero ? 2.8 : 1.7} result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale={isHero ? 6.5 : 4.5}
              specularConstant="1.05"
              specularExponent="24"
              lightingColor="#FFFFFF"
              result="specOut"
            >
              <fePointLight x={isHero ? 140 : 80} y={isHero ? -130 : -85} z={isHero ? 190 : 120} />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specClipped" />

            <feOffset in="SourceAlpha" dx="0" dy={isHero ? 2.4 : 1.5} result="rimShift" />
            <feComposite in="SourceAlpha" in2="rimShift" operator="out" result="topRimRaw" />
            <feGaussianBlur in="topRimRaw" stdDeviation={isHero ? 1.1 : 0.7} result="topRimBlur" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.62" result="whiteFlood" />
            <feComposite in="whiteFlood" in2="topRimBlur" operator="in" result="topRimLight" />

            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="topRimLight" />
              <feMergeNode in="specClipped" />
            </feMerge>
          </filter>

          {/* Soft Ambient Drop Shadow */}
          <filter id={`${uid}-shadow`} x="-10%" y="-15%" width="125%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={isHero ? 3.5 : 2.0} result="shBlur" />
            <feOffset in="shBlur" dx={isHero ? 2 : 1.2} dy={isHero ? 7.5 : 4.2} result="shOff" />
            <feFlood floodColor="#3B2418" floodOpacity="0.22" result="shColor" />
            <feComposite in="shColor" in2="shOff" operator="in" />
          </filter>

          {/* Soft Sticker Drop Shadow for Subtitle */}
          <filter id={`${uid}-sub-shadow`} x="-10%" y="-25%" width="120%" height="170%">
            <feDropShadow
              dx="0"
              dy={isHero ? 2.2 : 1.3}
              stdDeviation={isHero ? 1.8 : 1.0}
              floodColor="#27272A"
              floodOpacity="0.18"
            />
          </filter>
        </defs>

        {/* === MAIN 3D TITLE: GBTK STUDIO === */}
        <g
          fontFamily="'Fredoka', 'Baloo 2', 'Outfit', sans-serif"
          fontWeight="700"
          fontSize={titleFontSize}
          letterSpacing={titleLetterSpacing}
        >
          {/* 1. Ambient soft ground shadow */}
          <text x={titleX} y={titleY} filter={`url(#${uid}-shadow)`} fill="#000000">
            GBTK STUDIO
          </text>

          {/* 2. Stacked 3D extrusion side walls */}
          {extrudeSteps.map((step, sIdx) => (
            <text
              key={sIdx}
              x={titleX + step.dx}
              y={titleY + step.dy}
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke fill"
            >
              {TITLE_LETTERS.map((spec, idx) => (
                <tspan
                  key={idx}
                  fill={spec.depth}
                  stroke={spec.depth}
                  strokeWidth={isHero ? 3.2 : 2.0}
                >
                  {spec.char}
                </tspan>
              ))}
            </text>
          ))}

          {/* 3. Glossy puffy pastel front face */}
          <text
            x={titleX}
            y={titleY}
            filter={`url(#${uid}-puffy3d)`}
            strokeLinejoin="round"
            strokeLinecap="round"
            paintOrder="stroke fill"
          >
            {TITLE_LETTERS.map((spec, idx) => (
              <tspan
                key={idx}
                fill={spec.char === " " ? "none" : `url(#${uid}-grad-${idx})`}
                stroke={spec.char === " " ? "none" : spec.bottom}
                strokeWidth={isHero ? 1.6 : 1.0}
              >
                {spec.char}
              </tspan>
            ))}
          </text>
        </g>

        {/* === SUBTITLE: PRINTABLE PAGE & COLORING BOOKS (Die-cut white sticker 3D style) === */}
        <g
          fontFamily="'Fredoka', 'Baloo 2', 'Outfit', sans-serif"
          fontWeight="700"
          fontSize={subFontSize}
          letterSpacing={subLetterSpacing}
          filter={`url(#${uid}-sub-shadow)`}
        >
          {/* Crisp thick white die-cut sticker outline */}
          <text
            x={titleX + 2}
            y={subY}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth={subStrokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            paintOrder="stroke fill"
          >
            {SUBTITLE_TEXT}
          </text>

          {/* Subtle 3D letter depth beneath pastel letters */}
          <text x={titleX + 2} y={subY + (isHero ? 1.1 : 0.7)} fill="#18181B" fillOpacity="0.16">
            {SUBTITLE_TEXT}
          </text>

          {/* Alternating pastel letters */}
          <text x={titleX + 2} y={subY}>
            {subtitleChars.map((item, idx) => (
              <tspan key={idx} fill={item.color}>
                {item.ch}
              </tspan>
            ))}
          </text>
        </g>
      </svg>
    </span>
  );
}
