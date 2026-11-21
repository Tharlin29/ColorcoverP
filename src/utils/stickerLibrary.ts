import {
  buildCharacterStickerSvg,
  buildSymbolStickerSvg,
  GlyphStyle,
  SYMBOL_GLYPHS,
} from "./glyphVectorEngine";
import {
  buildCartoonStudioPack,
  CartoonThemeId,
} from "./cartoonStudioPack";
import {
  buildExpandedStickerPack,
  ExpandedStickerCategory,
} from "./stickerExpansionPack";

export type { CartoonThemeId, ExpandedStickerCategory };

export type StickerMode = "sticker" | "cartoon";

export type StickerSubCategory =
  | "alphabet"
  | "numbers"
  | "symbols"
  | "christmas"
  | "new-year"
  | "popular"
  | ExpandedStickerCategory;

export type CartoonSubCategory = CartoonThemeId;

export interface StickerAsset {
  id: string;
  label: string;
  mode: StickerMode;
  category: StickerSubCategory | CartoonSubCategory;
  keywords?: string;
  aspectRatio: number;
  defaultWidthPct: number;
  svg?: string;
  getSvg?: () => string;
}

const resolvedSvgCache = new Map<string, string>();
const resolvedDataUrlCache = new Map<string, string>();

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveAssetSvg(asset: StickerAsset): string {
  if (asset.svg) return asset.svg;
  const cached = resolvedSvgCache.get(asset.id);
  if (cached) return cached;
  const generated = asset.getSvg ? asset.getSvg() : "";
  if (generated) {
    resolvedSvgCache.set(asset.id, generated);
  }
  return generated;
}

export function resolveAssetDataUrl(asset: StickerAsset): string {
  const cached = resolvedDataUrlCache.get(asset.id);
  if (cached) return cached;
  const svg = resolveAssetSvg(asset);
  const url = svgToDataUrl(svg);
  if (svg) {
    resolvedDataUrlCache.set(asset.id, url);
  }
  return url;
}

// ---------- Programmatic 4-Style English Alphabets (A–Z) ----------
const ALPHABET_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function getAlphabetStickers(style: GlyphStyle): StickerAsset[] {
  return ALPHABET_CHARS.map((ch) => ({
    id: `alpha-${style}-${ch}`,
    label: `${ch} (${style === "3d" ? "3D" : style === "dot" ? "Dot" : style === "handwriting" ? "Script" : "Sticker"})`,
    mode: "sticker",
    category: "alphabet",
    aspectRatio: 1,
    defaultWidthPct: 16,
    svg: buildCharacterStickerSvg(ch, style),
  }));
}

// ---------- Programmatic 4-Style Numbers (0–10) ----------
const NUMBER_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function getNumberStickers(style: GlyphStyle): StickerAsset[] {
  return NUMBER_CHARS.map((num) => ({
    id: `num-${style}-${num}`,
    label: `${num} (${style === "3d" ? "3D" : style === "dot" ? "Dot" : style === "handwriting" ? "Script" : "Sticker"})`,
    mode: "sticker",
    category: "numbers",
    aspectRatio: num === "10" ? 164 / 124 : 1,
    defaultWidthPct: num === "10" ? 21 : 16,
    svg: buildCharacterStickerSvg(num, style),
  }));
}

// ---------- Symbols (+, -, ×, ÷, =, ?, !, %, #, &, etc.) ----------
export function getSymbolStickers(): StickerAsset[] {
  return SYMBOL_GLYPHS.map((sym) => ({
    id: sym.id,
    label: sym.label,
    mode: "sticker",
    category: "symbols",
    aspectRatio: 1,
    defaultWidthPct: 14,
    svg: buildSymbolStickerSvg(sym),
  }));
}

// ---------- Christmas B&W Coloring Stickers ----------
export const CHRISTMAS_STICKERS: StickerAsset[] = [
  {
    id: "xmas-santa-hat",
    label: "Santa Hat",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 46 128 C 48 64, 96 34, 146 56 C 166 65, 174 88, 166 106 C 148 92, 134 90, 134 114 L 138 130 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 78 122 C 88 86, 114 66, 138 68" fill="none" stroke-width="3.2"/>
    <circle cx="164" cy="112" r="20" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 155 104 Q 160 98, 168 102" fill="none" stroke-width="2.6"/>
    <path d="M 32 132 C 26 132, 24 148, 36 154 C 52 162, 74 156, 94 160 C 118 164, 142 154, 152 142 C 156 132, 148 122, 134 124 C 116 118, 84 118, 56 124 C 44 120, 34 124, 32 132 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 54 140 Q 64 134, 74 140 M 96 142 Q 108 136, 118 142" fill="none" stroke-width="2.6"/>
    <path d="M 42 54 L 46 62 L 54 66 L 46 70 L 42 78 L 38 70 L 30 66 L 38 62 Z" fill="#FFFFFF" stroke-width="3"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-snowman",
    label: "Cozy Snowman",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Twig Arms -->
    <path d="M 56 122 L 24 102 M 34 108 L 28 92 M 38 111 L 24 116" fill="none" stroke-width="4.5"/>
    <path d="M 144 122 L 176 102 M 166 108 L 172 92 M 162 111 L 176 116" fill="none" stroke-width="4.5"/>
    <!-- Body & Head -->
    <circle cx="100" cy="140" r="44" fill="#FFFFFF" stroke-width="5.5"/>
    <circle cx="100" cy="84" r="32" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Top Hat -->
    <path d="M 68 58 L 132 58" fill="none" stroke-width="6"/>
    <path d="M 78 58 L 82 24 L 118 24 L 122 58 Z" fill="#FFFFFF" stroke-width="5"/>
    <path d="M 80 48 L 120 48" fill="none" stroke-width="3.5"/>
    <!-- Face -->
    <circle cx="88" cy="78" r="4" fill="#000000"/>
    <circle cx="112" cy="78" r="4" fill="#000000"/>
    <path d="M 100 84 L 124 89 L 100 94 Z" fill="#FFFFFF" stroke-width="3.8"/>
    <path d="M 88 98 Q 100 107, 112 98" fill="none" stroke-width="3.2"/>
    <!-- Knit Scarf -->
    <path d="M 72 108 Q 100 118, 128 108 L 130 120 Q 100 130, 70 120 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 110 118 L 118 152 L 134 148 L 126 115 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <line x1="120" y1="152" x2="120" y2="158" stroke-width="3"/>
    <line x1="127" y1="150" x2="128" y2="156" stroke-width="3"/>
    <!-- Buttons -->
    <circle cx="96" cy="138" r="4" fill="#000000"/>
    <circle cx="96" cy="154" r="4" fill="#000000"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-tree",
    label: "Holiday Tree",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <rect x="86" y="152" width="28" height="28" rx="4" fill="#FFFFFF" stroke-width="5"/>
    <path d="M 100 42 C 84 68, 66 86, 52 96 C 64 98, 72 96, 78 94 C 60 116, 42 128, 34 134 C 50 136, 62 134, 68 130 C 48 150, 30 160, 26 164 C 68 168, 132 168, 174 164 C 170 160, 152 150, 132 130 C 138 134, 150 136, 166 134 C 158 128, 140 116, 122 94 C 128 96, 136 98, 148 96 C 134 86, 116 68, 100 42 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Garland Swags -->
    <path d="M 74 96 Q 100 108, 126 96" fill="none" stroke-width="3"/>
    <path d="M 54 132 Q 100 148, 146 132" fill="none" stroke-width="3"/>
    <!-- Star Topper -->
    <polygon points="100,14 106,27 120,28 109,37 112,50 100,43 88,50 91,37 80,28 94,27" fill="#FFFFFF" stroke-width="4.2"/>
    <!-- Ornaments -->
    <circle cx="92" cy="80" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="114" cy="112" r="7" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="76" cy="122" r="6.5" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="104" cy="148" r="7.5" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="62" cy="152" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="136" cy="152" r="6" fill="#FFFFFF" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-gingerbread",
    label: "Gingerbread",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 26 C 122 26, 134 42, 132 62 C 130 74, 122 82, 118 84 L 154 84 C 168 84, 174 104, 158 110 L 126 114 L 138 164 C 142 178, 120 184, 112 168 L 100 140 L 88 168 C 80 184, 58 178, 62 164 L 74 114 L 42 110 C 26 104, 32 84, 46 84 L 82 84 C 78 82, 70 74, 68 62 C 66 42, 78 26, 100 26 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Eyes & Smile -->
    <circle cx="88" cy="52" r="4.5" fill="#000000"/>
    <circle cx="112" cy="52" r="4.5" fill="#000000"/>
    <circle cx="86.5" cy="50.5" r="1.5" fill="#FFFFFF" stroke="none"/>
    <circle cx="110.5" cy="50.5" r="1.5" fill="#FFFFFF" stroke="none"/>
    <path d="M 88 66 Q 100 76, 112 66" fill="none" stroke-width="3.5"/>
    <!-- Bowtie & Icing -->
    <polygon points="100,90 84,82 84,98" fill="#FFFFFF" stroke-width="3.2"/>
    <polygon points="100,90 116,82 116,98" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="100" cy="90" r="4" fill="#FFFFFF" stroke-width="3"/>
    <circle cx="100" cy="112" r="5" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="100" cy="128" r="5" fill="#FFFFFF" stroke-width="3.2"/>
    <path d="M 48 86 Q 54 96, 48 108 M 152 86 Q 146 96, 152 108" fill="none" stroke-width="3"/>
    <path d="M 66 154 Q 76 148, 86 156 M 114 156 Q 124 148, 134 154" fill="none" stroke-width="3"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-bells",
    label: "Jingle Bells",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Bell -->
    <g transform="rotate(-18 76 116)">
      <path d="M 52 138 C 52 104, 58 84, 76 84 C 94 84, 100 104, 100 138 L 110 150 L 42 150 Z" fill="#FFFFFF" stroke-width="5.2"/>
      <circle cx="76" cy="156" r="8" fill="#FFFFFF" stroke-width="4.2"/>
    </g>
    <!-- Right Bell -->
    <g transform="rotate(18 124 116)">
      <path d="M 100 138 C 100 104, 106 84, 124 84 C 142 84, 148 104, 148 138 L 158 150 L 90 150 Z" fill="#FFFFFF" stroke-width="5.2"/>
      <circle cx="124" cy="156" r="8" fill="#FFFFFF" stroke-width="4.2"/>
    </g>
    <!-- Holly Leaves -->
    <path d="M 88 64 C 66 44, 48 52, 42 70 C 56 76, 68 82, 88 72 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 112 64 C 134 44, 152 52, 158 70 C 144 76, 132 82, 112 72 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Festive Bow -->
    <path d="M 100 58 C 78 30, 58 40, 68 62 C 74 70, 92 66, 100 58 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 100 58 C 122 30, 142 40, 132 62 C 126 70, 108 66, 100 58 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <circle cx="92" cy="64" r="6" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="108" cy="64" r="6" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="100" cy="56" r="7" fill="#FFFFFF" stroke-width="4.2"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-candy-cane",
    label: "Candy Cane",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-14 100 100)">
    <path d="M 64 92 C 62 56, 86 30, 116 32 C 144 34, 158 60, 154 96 L 146 168 C 144 178, 124 176, 126 166 L 134 94 C 136 72, 126 54, 112 52 C 98 50, 86 64, 86 90 C 86 102, 64 104, 64 92 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Stripes -->
    <path d="M 70 64 L 90 74 M 90 38 L 106 54 M 122 34 L 128 56 M 136 68 L 154 80 M 134 100 L 152 112 M 130 132 L 148 144" fill="none" stroke-width="4.2"/>
    <!-- Ribbon Bow -->
    <path d="M 134 108 C 106 94, 96 112, 114 122 Z" fill="#FFFFFF" stroke-width="4.2"/>
    <path d="M 146 110 C 174 96, 182 114, 162 124 Z" fill="#FFFFFF" stroke-width="4.2"/>
    <path d="M 136 118 L 124 146 M 146 118 L 158 146" fill="none" stroke-width="4"/>
    <circle cx="140" cy="112" r="7" fill="#FFFFFF" stroke-width="4"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-gift-box",
    label: "Holiday Gift",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <rect x="40" y="88" width="120" height="84" rx="10" fill="#FFFFFF" stroke-width="5.5"/>
    <rect x="32" y="66" width="136" height="26" rx="8" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Ribbon Strip -->
    <rect x="88" y="66" width="24" height="106" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Big Top Bow -->
    <path d="M 100 64 C 72 28, 42 42, 62 66 Z" fill="#FFFFFF" stroke-width="5"/>
    <path d="M 100 64 C 128 28, 158 42, 138 66 Z" fill="#FFFFFF" stroke-width="5"/>
    <circle cx="100" cy="60" r="10" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Gift Tag -->
    <path d="M 114 82 L 146 106 L 136 124 L 110 100 Z" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="117" cy="91" r="2.5" fill="#000000"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-reindeer",
    label: "Cute Reindeer",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 23,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Antlers -->
    <path d="M 74 68 C 66 44, 54 30, 42 22 M 64 46 L 44 48 M 68 38 L 72 20" fill="none" stroke-width="5.5"/>
    <path d="M 126 68 C 134 44, 146 30, 158 22 M 136 46 L 156 48 M 132 38 L 128 20" fill="none" stroke-width="5.5"/>
    <!-- Ears -->
    <path d="M 56 80 C 32 70, 26 90, 44 100 C 52 102, 58 96, 60 88 Z" fill="#FFFFFF" stroke-width="5"/>
    <path d="M 144 80 C 168 70, 174 90, 156 100 C 148 102, 142 96, 140 88 Z" fill="#FFFFFF" stroke-width="5"/>
    <!-- Head -->
    <path d="M 60 86 C 58 58, 142 58, 140 86 C 144 114, 128 144, 100 144 C 72 144, 56 114, 60 86 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Snout -->
    <ellipse cx="100" cy="120" rx="28" ry="19" fill="#FFFFFF" stroke-width="4.2"/>
    <circle cx="100" cy="112" r="10" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="96.5" cy="109" r="2.5" fill="#000000"/>
    <!-- Eyes & Smile -->
    <circle cx="80" cy="92" r="5" fill="#000000"/>
    <circle cx="120" cy="92" r="5" fill="#000000"/>
    <circle cx="78.5" cy="90" r="1.8" fill="#FFFFFF" stroke="none"/>
    <circle cx="118.5" cy="90" r="1.8" fill="#FFFFFF" stroke="none"/>
    <path d="M 90 128 Q 100 135, 110 128" fill="none" stroke-width="3.2"/>
    <!-- Festive Collar Bell -->
    <path d="M 68 144 Q 100 158, 132 144 L 130 158 Q 100 172, 70 158 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="100" cy="166" r="10" fill="#FFFFFF" stroke-width="4.2"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-stocking",
    label: "Stocking",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 68 60 L 68 122 C 68 136, 54 140, 46 150 C 36 164, 52 182, 74 176 L 120 162 C 134 156, 136 142, 132 126 L 122 60 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Fluffy Cuff -->
    <path d="M 58 38 C 66 32, 78 36, 86 34 C 96 32, 106 36, 114 34 C 124 32, 134 38, 132 52 C 134 64, 122 68, 112 66 C 102 68, 92 64, 82 66 C 70 68, 56 64, 58 50 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 68 122 Q 86 132, 82 154 M 50 152 Q 66 160, 74 174" fill="none" stroke-width="3.2" stroke-dasharray="4 4"/>
    <path d="M 96 86 L 100 94 L 108 98 L 100 102 L 96 110 L 92 102 L 84 98 L 92 94 Z" fill="#FFFFFF" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-wreath",
    label: "Holly Wreath",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 23,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="104" r="64" fill="#FFFFFF" stroke-width="5.5"/>
    <circle cx="100" cy="104" r="32" fill="#FFFFFF" stroke-width="5"/>
    <!-- Leaf Scallops -->
    <path d="M 100 40 Q 118 30, 134 46 M 148 64 Q 168 72, 162 96 M 158 124 Q 162 148, 138 158 M 114 166 Q 94 176, 76 164 M 54 150 Q 34 136, 40 112 M 42 84 Q 38 62, 62 48" fill="none" stroke-width="4.2"/>
    <!-- Ribbon Bow at Bottom -->
    <path d="M 100 152 C 74 134, 58 154, 78 168 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 100 152 C 126 134, 142 154, 122 168 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 92 162 L 80 186 L 94 182 M 108 162 L 120 186 L 106 182" fill="none" stroke-width="4"/>
    <circle cx="100" cy="154" r="8" fill="#FFFFFF" stroke-width="4.2"/>
    <!-- Berries -->
    <circle cx="62" cy="74" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="138" cy="74" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="58" cy="126" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="142" cy="126" r="6" fill="#FFFFFF" stroke-width="3.5"/>
  </g>
</svg>`,
  },
  {
    id: "xmas-snowflake",
    label: "Snowflake",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(100 100)">
      <path d="M 0 -76 L 0 76 M -66 -38 L 66 38 M -66 38 L 66 -38" stroke-width="5"/>
      <path d="M -14 -56 L 0 -42 L 14 -56 M -14 56 L 0 42 L 14 56" stroke-width="4.5"/>
      <path d="M -54 -14 L -36 -21 L -42 -40 M 54 14 L 36 21 L 42 40" stroke-width="4.5"/>
      <path d="M -42 40 L -36 21 L -54 14 M 42 -40 L 36 -21 L 54 -14" stroke-width="4.5"/>
      <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="#FFFFFF" stroke-width="4.5"/>
      <circle cx="0" cy="-78" r="5" fill="#FFFFFF" stroke-width="3.5"/>
      <circle cx="0" cy="78" r="5" fill="#FFFFFF" stroke-width="3.5"/>
      <circle cx="-68" cy="-39" r="5" fill="#FFFFFF" stroke-width="3.5"/>
      <circle cx="68" cy="39" r="5" fill="#FFFFFF" stroke-width="3.5"/>
      <circle cx="-68" cy="39" r="5" fill="#FFFFFF" stroke-width="3.5"/>
      <circle cx="68" cy="-39" r="5" fill="#FFFFFF" stroke-width="3.5"/>
    </g>
  </g>
</svg>`,
  },
  {
    id: "xmas-ornament",
    label: "Bauble Ball",
    mode: "sticker",
    category: "christmas",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="32" r="10" fill="none" stroke-width="4.5"/>
    <rect x="82" y="40" width="36" height="18" rx="4" fill="#FFFFFF" stroke-width="5"/>
    <circle cx="100" cy="116" r="58" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 46 96 Q 100 116, 154 96" fill="none" stroke-width="3.8"/>
    <path d="M 46 134 Q 100 154, 154 134" fill="none" stroke-width="3.8"/>
    <path d="M 70 115 L 80 126 L 90 115 L 100 126 L 110 115 L 120 126 L 130 115" fill="none" stroke-width="3.5"/>
    <polygon points="100,72 104,80 112,81 106,87 107,95 100,91 93,95 94,87 88,81 96,80" fill="#FFFFFF" stroke-width="3"/>
  </g>
</svg>`,
  },
];

// ---------- New Year B&W Coloring Stickers ----------
export const NEW_YEAR_STICKERS: StickerAsset[] = [
  {
    id: "ny-fireworks",
    label: "Fireworks Burst",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 100 L 100 38 M 100 100 L 146 54 M 100 100 L 164 100 M 100 100 L 146 146 M 100 100 L 100 164 M 100 100 L 54 146 M 100 100 L 36 100 M 100 100 L 54 54" fill="none" stroke-width="4.5" stroke-dasharray="10 7"/>
    <polygon points="100,74 107,91 125,92 111,103 116,120 100,110 84,120 89,103 75,92 93,91" fill="#FFFFFF" stroke-width="4.5"/>
    <polygon points="44,34 48,44 58,46 50,53 52,63 44,57 36,63 38,53 30,46 40,44" fill="#FFFFFF" stroke-width="3.5"/>
    <polygon points="158,36 161,44 170,45 163,51 165,60 158,55 151,60 153,51 146,45 155,44" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="164" cy="146" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="38" cy="150" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="100" cy="24" r="5" fill="#FFFFFF" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "ny-midnight-clock",
    label: "Midnight Clock",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="108" r="66" fill="#FFFFFF" stroke-width="5.5"/>
    <circle cx="100" cy="108" r="54" fill="#FFFFFF" stroke-width="3.5"/>
    <!-- Bells on Top -->
    <path d="M 46 62 C 34 46, 52 28, 68 42 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 154 62 C 166 46, 148 28, 132 42 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 100 42 L 100 24 M 88 26 L 112 26" fill="none" stroke-width="4.5"/>
    <!-- Ticks & 12:00 Hands -->
    <line x1="100" y1="60" x2="100" y2="68" stroke-width="4"/>
    <line x1="100" y1="148" x2="100" y2="156" stroke-width="4"/>
    <line x1="52" y1="108" x2="60" y2="108" stroke-width="4"/>
    <line x1="140" y1="108" x2="148" y2="108" stroke-width="4"/>
    <line x1="100" y1="108" x2="100" y2="70" stroke-width="5"/>
    <line x1="100" y1="108" x2="94" y2="74" stroke-width="4"/>
    <circle cx="100" cy="108" r="6" fill="#FFFFFF" stroke-width="3.8"/>
    <path d="M 28 38 L 32 46 L 40 48 L 32 50 L 28 58 L 24 50 L 16 48 L 24 46 Z" fill="#FFFFFF" stroke-width="2.8"/>
  </g>
</svg>`,
  },
  {
    id: "ny-party-popper",
    label: "Confetti Popper",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 38 164 L 74 88 L 116 130 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <ellipse cx="95" cy="109" rx="10" ry="30" transform="rotate(-45 95 109)" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 54 134 L 74 150 M 64 114 L 94 140" fill="none" stroke-width="3.8"/>
    <!-- Streamers & Stars -->
    <path d="M 102 88 C 106 62, 126 56, 122 32" fill="none" stroke-width="4"/>
    <path d="M 118 98 C 142 94, 152 72, 174 74" fill="none" stroke-width="4"/>
    <path d="M 122 114 C 146 122, 160 112, 176 124" fill="none" stroke-width="4"/>
    <polygon points="150,28 154,37 164,38 156,44 158,54 150,48 142,54 144,44 136,38 146,37" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="94" cy="46" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <rect x="148" y="88" width="10" height="10" transform="rotate(24 153 93)" fill="#FFFFFF" stroke-width="3"/>
  </g>
</svg>`,
  },
  {
    id: "ny-party-hat",
    label: "Party Hat",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 44 L 46 164 Q 100 182, 154 164 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 76 100 L 100 118 L 124 100" fill="none" stroke-width="4"/>
    <path d="M 60 138 L 82 156 L 100 138 L 118 156 L 140 138" fill="none" stroke-width="4"/>
    <circle cx="100" cy="34" r="16" fill="#FFFFFF" stroke-width="5"/>
    <circle cx="100" cy="76" r="5" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="82" cy="126" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="118" cy="126" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <path d="M 46 164 C 42 174, 52 178, 60 172 C 70 180, 82 180, 90 174 C 100 182, 110 180, 118 174 C 128 180, 140 178, 148 172 C 154 176, 160 170, 154 164" fill="#FFFFFF" stroke-width="4.2"/>
  </g>
</svg>`,
  },
  {
    id: "ny-balloons",
    label: "Party Balloons",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 23,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Strings -->
    <path d="M 66 116 C 58 140, 82 156, 76 182" fill="none" stroke-width="3.2"/>
    <path d="M 134 116 C 142 140, 118 156, 124 182" fill="none" stroke-width="3.2"/>
    <path d="M 100 106 C 94 134, 108 156, 100 184" fill="none" stroke-width="3.5"/>
    <!-- Side Balloons -->
    <ellipse cx="64" cy="76" rx="28" ry="36" transform="rotate(-12 64 76)" fill="#FFFFFF" stroke-width="5"/>
    <ellipse cx="136" cy="76" rx="28" ry="36" transform="rotate(12 136 76)" fill="#FFFFFF" stroke-width="5"/>
    <!-- Center Balloon -->
    <ellipse cx="100" cy="64" rx="32" ry="40" fill="#FFFFFF" stroke-width="5.5"/>
    <polygon points="100,104 94,112 106,112" fill="#FFFFFF" stroke-width="3.5"/>
    <path d="M 82 44 Q 88 34, 98 34" fill="none" stroke-width="3"/>
    <polygon points="100,48 104,56 112,57 106,62 108,70 100,66 92,70 94,62 88,57 96,56" fill="#FFFFFF" stroke-width="3"/>
  </g>
</svg>`,
  },
  {
    id: "ny-2026-banner",
    label: "2026 Banner",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1.35,
    defaultWidthPct: 28,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 190" width="260" height="190">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Ribbon Tails -->
    <path d="M 42 74 L 16 74 L 30 96 L 16 118 L 48 118 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 218 74 L 244 74 L 230 96 L 244 118 L 212 118 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Main Banner -->
    <path d="M 40 58 Q 130 42, 220 58 L 220 128 Q 130 112, 40 128 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Bold Hollow 2026 Vector Digits -->
    <g fill="none" stroke="#000000" stroke-width="6.5">
      <!-- 2 -->
      <path d="M 60 80 C 60 70, 78 70, 78 82 C 78 92, 62 96, 58 106 L 80 106"/>
      <!-- 0 -->
      <ellipse cx="106" cy="90" rx="11" ry="16"/>
      <!-- 2 -->
      <path d="M 134 80 C 134 70, 152 70, 152 82 C 152 92, 136 96, 132 106 L 154 106"/>
      <!-- 6 -->
      <path d="M 190 78 C 180 70, 170 78, 170 92 C 170 104, 180 108, 188 104 C 194 100, 192 90, 182 88 C 174 88, 170 94, 170 96"/>
    </g>
    <!-- Stars -->
    <polygon points="130,18 134,27 144,28 136,34 138,44 130,39 122,44 124,34 116,28 126,27" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="88" cy="34" r="4" fill="#FFFFFF" stroke-width="2.8"/>
    <circle cx="172" cy="34" r="4" fill="#FFFFFF" stroke-width="2.8"/>
  </g>
</svg>`,
  },
  {
    id: "ny-crown",
    label: "Party Crown",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 32 146 L 26 70 L 66 106 L 100 50 L 134 106 L 174 70 L 168 146 Q 100 158, 32 146 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 36 132 Q 100 144, 164 132" fill="none" stroke-width="3.8"/>
    <circle cx="26" cy="62" r="8" fill="#FFFFFF" stroke-width="4.2"/>
    <circle cx="100" cy="42" r="9" fill="#FFFFFF" stroke-width="4.2"/>
    <circle cx="174" cy="62" r="8" fill="#FFFFFF" stroke-width="4.2"/>
    <polygon points="100,88 110,104 100,120 90,104" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="64" cy="118" r="6" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="136" cy="118" r="6" fill="#FFFFFF" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "ny-lantern",
    label: "Festival Lantern",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <line x1="100" y1="16" x2="100" y2="38" stroke-width="4.5"/>
    <rect x="76" y="38" width="48" height="14" rx="4" fill="#FFFFFF" stroke-width="4.8"/>
    <ellipse cx="100" cy="96" rx="54" ry="46" fill="#FFFFFF" stroke-width="5.5"/>
    <ellipse cx="100" cy="96" rx="30" ry="46" fill="none" stroke-width="3.5"/>
    <line x1="100" y1="50" x2="100" y2="142" stroke-width="3.5"/>
    <path d="M 48 96 Q 100 106, 152 96" fill="none" stroke-width="3"/>
    <rect x="78" y="142" width="44" height="12" rx="4" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Tassel -->
    <line x1="100" y1="154" x2="100" y2="184" stroke-width="4"/>
    <line x1="92" y1="158" x2="88" y2="180" stroke-width="3.2"/>
    <line x1="108" y1="158" x2="112" y2="180" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "ny-shooting-star",
    label: "Comet Star",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 106 86 C 72 104, 42 132, 24 166" fill="none" stroke-width="4.5"/>
    <path d="M 118 106 C 84 126, 62 150, 48 176" fill="none" stroke-width="4.5"/>
    <path d="M 94 74 C 66 90, 42 110, 26 134" fill="none" stroke-width="3.5" stroke-dasharray="6 7"/>
    <polygon points="134,32 146,58 174,62 154,82 159,110 134,96 109,110 114,82 94,62 122,58" fill="#FFFFFF" stroke-width="5.5"/>
    <circle cx="126" cy="72" r="3.5" fill="#000000"/>
    <circle cx="142" cy="72" r="3.5" fill="#000000"/>
    <path d="M 129 82 Q 134 86, 139 82" fill="none" stroke-width="2.8"/>
    <path d="M 60 44 L 64 52 L 72 54 L 64 56 L 60 64 L 56 56 L 48 54 L 56 52 Z" fill="#FFFFFF" stroke-width="2.8"/>
  </g>
</svg>`,
  },
  {
    id: "ny-celebration-cupcake",
    label: "Party Cupcake",
    mode: "sticker",
    category: "new-year",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Star Topper Pick -->
    <line x1="100" y1="36" x2="100" y2="62" stroke-width="4"/>
    <polygon points="100,14 105,24 116,25 108,32 110,43 100,37 90,43 92,32 84,25 95,24" fill="#FFFFFF" stroke-width="3.8"/>
    <!-- Swirl Frosting -->
    <path d="M 46 112 C 34 94, 52 74, 72 78 C 76 58, 124 58, 128 78 C 148 74, 166 94, 154 112 C 138 122, 62 122, 46 112 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 64 96 Q 100 106, 136 96" fill="none" stroke-width="3"/>
    <!-- Wrapper Base -->
    <path d="M 52 116 L 66 174 Q 100 182, 134 174 L 148 116 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <line x1="76" y1="120" x2="82" y2="174" stroke-width="3.2"/>
    <line x1="100" y1="122" x2="100" y2="176" stroke-width="3.2"/>
    <line x1="124" y1="120" x2="118" y2="174" stroke-width="3.2"/>
    <!-- Kawaii Face on Wrapper -->
    <circle cx="86" cy="144" r="3.5" fill="#000000"/>
    <circle cx="114" cy="144" r="3.5" fill="#000000"/>
    <path d="M 94 152 Q 100 158, 106 152" fill="none" stroke-width="2.8"/>
  </g>
</svg>`,
  },
];

// ---------- Popular Coloring Book Stickers (Kawaii & Cozy B&W) ----------
export const POPULAR_STICKERS: StickerAsset[] = [
  {
    id: "pop-rainbow-cloud",
    label: "Kawaii Rainbow",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1.2,
    defaultWidthPct: 26,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="240" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 46 130 C 46 66, 194 66, 194 130" fill="none" stroke-width="28"/>
    <path d="M 46 130 C 46 66, 194 66, 194 130" fill="none" stroke="#FFFFFF" stroke-width="20"/>
    <path d="M 64 130 C 64 84, 176 84, 176 130" fill="none" stroke-width="4"/>
    <path d="M 80 130 C 80 100, 160 100, 160 130" fill="none" stroke-width="4"/>
    <!-- Left Cloud -->
    <path d="M 28 158 C 16 158, 12 142, 22 134 C 24 120, 42 114, 54 122 C 66 116, 82 126, 80 140 C 88 144, 86 158, 72 158 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Right Cloud -->
    <path d="M 164 158 C 152 158, 150 144, 158 138 C 158 122, 176 116, 188 122 C 200 114, 218 122, 218 136 C 228 142, 224 158, 210 158 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Cute Face on Center Rainbow -->
    <circle cx="110" cy="86" r="3" fill="#000000"/>
    <circle cx="130" cy="86" r="3" fill="#000000"/>
    <path d="M 116 92 Q 120 96, 124 92" fill="none" stroke-width="2.5"/>
    <path d="M 120 26 L 123 34 L 131 36 L 123 38 L 120 46 L 117 38 L 109 36 L 117 34 Z" fill="#FFFFFF" stroke-width="2.8"/>
  </g>
</svg>`,
  },
  {
    id: "pop-boba-tea",
    label: "Kawaii Boba Tea",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 110 64 L 126 24 L 138 28 L 124 64 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 56 76 L 68 170 Q 100 180, 132 170 L 144 76 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 52 76 C 52 54, 148 54, 148 76 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <ellipse cx="100" cy="76" rx="48" ry="8" fill="#FFFFFF" stroke-width="4.2"/>
    <!-- Cute Face -->
    <circle cx="84" cy="112" r="4.5" fill="#000000"/>
    <circle cx="116" cy="112" r="4.5" fill="#000000"/>
    <circle cx="82.5" cy="110.5" r="1.6" fill="#FFFFFF" stroke="none"/>
    <circle cx="114.5" cy="110.5" r="1.6" fill="#FFFFFF" stroke="none"/>
    <path d="M 94 118 Q 100 124, 106 118" fill="none" stroke-width="3.2"/>
    <!-- Boba Pearls -->
    <circle cx="78" cy="156" r="7" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="96" cy="160" r="7" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="114" cy="156" r="7" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="88" cy="144" r="6" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="108" cy="144" r="6" fill="#FFFFFF" stroke-width="3.5"/>
  </g>
</svg>`,
  },
  {
    id: "pop-mushroom-house",
    label: "Mushroom Toadstool",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 72 104 L 66 168 Q 100 176, 134 168 L 128 104 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 30 106 C 30 48, 170 48, 170 106 Q 100 116, 30 106 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Spots on Cap -->
    <circle cx="72" cy="76" r="12" fill="#FFFFFF" stroke-width="4"/>
    <circle cx="118" cy="68" r="10" fill="#FFFFFF" stroke-width="4"/>
    <circle cx="138" cy="92" r="8" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="52" cy="94" r="7" fill="#FFFFFF" stroke-width="3.5"/>
    <!-- Arched Fairy Door -->
    <path d="M 86 169 L 86 136 C 86 120, 114 120, 114 136 L 114 169 Z" fill="#FFFFFF" stroke-width="4.2"/>
    <circle cx="107" cy="148" r="2.8" fill="#000000"/>
    <!-- Little Grass Tufts -->
    <path d="M 48 172 L 54 156 L 62 172 M 136 172 L 144 156 L 152 172" fill="none" stroke-width="3.8"/>
  </g>
</svg>`,
  },
  {
    id: "pop-kawaii-donut",
    label: "Sprinkle Donut",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="66" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Glaze Drip -->
    <path d="M 38 112 C 44 126, 60 124, 68 110 C 78 126, 94 124, 100 116 C 110 128, 128 124, 134 110 C 142 124, 158 122, 162 108 C 166 64, 136 34, 100 34 C 64 34, 34 64, 38 112 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="100" cy="96" r="22" fill="#FFFFFF" stroke-width="5"/>
    <!-- Cute Face -->
    <circle cx="72" cy="86" r="4" fill="#000000"/>
    <circle cx="128" cy="86" r="4" fill="#000000"/>
    <!-- Sprinkles -->
    <rect x="86" y="48" width="12" height="5" rx="2.5" transform="rotate(-20 92 50)" fill="#FFFFFF" stroke-width="2.6"/>
    <rect x="114" y="54" width="12" height="5" rx="2.5" transform="rotate(28 120 56)" fill="#FFFFFF" stroke-width="2.6"/>
    <rect x="52" y="64" width="11" height="5" rx="2.5" transform="rotate(40 57 66)" fill="#FFFFFF" stroke-width="2.6"/>
    <rect x="136" y="66" width="11" height="5" rx="2.5" transform="rotate(-32 141 68)" fill="#FFFFFF" stroke-width="2.6"/>
  </g>
</svg>`,
  },
  {
    id: "pop-unicorn",
    label: "Unicorn Head",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 23,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Horn -->
    <path d="M 90 66 L 104 20 L 116 66 Z" fill="#FFFFFF" stroke-width="5"/>
    <line x1="96" y1="48" x2="112" y2="54" stroke-width="3.2"/>
    <line x1="99" y1="36" x2="110" y2="41" stroke-width="3.2"/>
    <!-- Ears -->
    <path d="M 68 74 L 54 44 L 84 62 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 134 74 L 148 44 L 118 62 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Mane Curls -->
    <path d="M 60 80 C 40 84, 38 112, 54 120 C 44 134, 52 156, 70 154" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 140 80 C 160 84, 162 112, 146 120 C 156 134, 148 156, 130 154" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Head & Muzzle -->
    <path d="M 64 92 C 62 60, 138 60, 136 92 C 142 126, 128 164, 100 164 C 72 164, 58 126, 64 92 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <ellipse cx="100" cy="142" rx="30" ry="18" fill="#FFFFFF" stroke-width="4.2"/>
    <!-- Happy Lashes & Smile -->
    <path d="M 74 104 Q 82 96, 90 104 M 110 104 Q 118 96, 126 104" fill="none" stroke-width="4"/>
    <circle cx="88" cy="138" r="2.5" fill="#000000"/>
    <circle cx="112" cy="138" r="2.5" fill="#000000"/>
    <path d="M 92 148 Q 100 155, 108 148" fill="none" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "pop-rocket",
    label: "Space Rocket",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="rotate(28 100 100)">
    <!-- Fins -->
    <path d="M 70 116 L 44 148 L 70 144 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 130 116 L 156 148 L 130 144 Z" fill="#FFFFFF" stroke-width="4.8"/>
    <!-- Exhaust Flame -->
    <path d="M 84 148 C 78 170, 94 186, 100 190 C 106 186, 122 170, 116 148 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Main Fuselage -->
    <path d="M 100 24 C 128 54, 134 100, 126 148 L 74 148 C 66 100, 72 54, 100 24 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 80 56 Q 100 62, 120 56" fill="none" stroke-width="3.8"/>
    <!-- Porthole Window -->
    <circle cx="100" cy="96" r="18" fill="#FFFFFF" stroke-width="4.8"/>
    <circle cx="100" cy="96" r="11" fill="#FFFFFF" stroke-width="3"/>
    <!-- Stars -->
    <circle cx="42" cy="48" r="4" fill="#FFFFFF" stroke-width="2.8"/>
    <circle cx="158" cy="54" r="4" fill="#FFFFFF" stroke-width="2.8"/>
  </g>
</svg>`,
  },
  {
    id: "pop-daisy-bloom",
    label: "Blooming Daisy",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 21,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 120 L 100 182" fill="none" stroke-width="5.5"/>
    <path d="M 100 160 C 126 144, 146 150, 140 168 C 126 174, 112 170, 100 160 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 100 164 C 74 148, 54 154, 60 172 C 74 178, 88 174, 100 164 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Petals -->
    <g transform="translate(100 78)">
      <ellipse cx="0" cy="-34" rx="14" ry="26" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(45)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(90)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(135)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(180)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(225)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(270)" fill="#FFFFFF" stroke-width="4.5"/>
      <ellipse cx="0" cy="-34" rx="14" ry="26" transform="rotate(315)" fill="#FFFFFF" stroke-width="4.5"/>
      <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke-width="5"/>
      <circle cx="-7" cy="-3" r="3" fill="#000000"/>
      <circle cx="7" cy="-3" r="3" fill="#000000"/>
      <path d="M -5 6 Q 0 11, 5 6" fill="none" stroke-width="2.8"/>
    </g>
  </g>
</svg>`,
  },
  {
    id: "pop-strawberry",
    label: "Cute Strawberry",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 32 C 102 42, 100 50, 100 56" fill="none" stroke-width="5"/>
    <path d="M 52 76 C 44 128, 74 172, 100 174 C 126 172, 156 128, 148 76 C 140 58, 60 58, 52 76 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <!-- Leaf Crown -->
    <path d="M 100 54 L 78 44 L 74 64 L 52 60 L 66 78 L 86 68 L 100 84 L 114 68 L 134 78 L 148 60 L 126 64 L 122 44 Z" fill="#FFFFFF" stroke-width="4.5"/>
    <!-- Kawaii Face & Seeds -->
    <circle cx="84" cy="110" r="4" fill="#000000"/>
    <circle cx="116" cy="110" r="4" fill="#000000"/>
    <path d="M 94 118 Q 100 124, 106 118" fill="none" stroke-width="3"/>
    <circle cx="68" cy="96" r="2.2" fill="#000000"/>
    <circle cx="132" cy="96" r="2.2" fill="#000000"/>
    <circle cx="74" cy="138" r="2.2" fill="#000000"/>
    <circle cx="126" cy="138" r="2.2" fill="#000000"/>
    <circle cx="100" cy="152" r="2.2" fill="#000000"/>
  </g>
</svg>`,
  },
  {
    id: "pop-cozy-book-mug",
    label: "Book & Cozy Mug",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1.15,
    defaultWidthPct: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 190" width="220" height="190">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Open Book -->
    <path d="M 24 146 L 40 100 Q 75 94, 110 108 Q 145 94, 180 100 L 196 146 Q 152 140, 110 156 Q 68 140, 24 146 Z" fill="#FFFFFF" stroke-width="5"/>
    <line x1="110" y1="108" x2="110" y2="156" stroke-width="4.5"/>
    <path d="M 48 118 Q 74 114, 96 122 M 44 132 Q 72 128, 96 136" fill="none" stroke-width="2.8"/>
    <path d="M 124 122 Q 146 114, 172 118 M 124 136 Q 148 128, 176 132" fill="none" stroke-width="2.8"/>
    <!-- Mug on Top -->
    <path d="M 128 84 C 146 84, 146 112, 128 112" fill="none" stroke-width="4.5"/>
    <path d="M 74 74 L 130 74 L 126 118 Q 102 124, 78 118 Z" fill="#FFFFFF" stroke-width="5"/>
    <path d="M 88 58 Q 82 44, 94 34 M 112 58 Q 106 44, 118 34" fill="none" stroke-width="3.2"/>
    <path d="M 102 104 C 90 94, 92 84, 102 90 C 112 84, 114 94, 102 104 Z" fill="#FFFFFF" stroke-width="3.2"/>
  </g>
</svg>`,
  },
  {
    id: "pop-sleepy-moon",
    label: "Moon & Cloud",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 22,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 126 36 C 84 36, 52 72, 58 114 C 64 156, 106 176, 146 156 C 110 156, 90 128, 94 94 C 96 68, 110 48, 126 36 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 72 98 Q 80 104, 88 98" fill="none" stroke-width="3.5"/>
    <path d="M 80 116 Q 86 122, 94 118" fill="none" stroke-width="3"/>
    <!-- Hanging Star -->
    <line x1="140" y1="68" x2="140" y2="92" stroke-width="3"/>
    <polygon points="140,92 145,103 157,104 148,112 151,124 140,118 129,124 132,112 123,104 135,103" fill="#FFFFFF" stroke-width="3.8"/>
    <!-- Fluffy Cloud Base -->
    <path d="M 52 168 C 36 168, 32 148, 46 140 C 48 122, 72 114, 88 126 C 102 116, 126 124, 128 142 C 142 146, 138 168, 120 168 Z" fill="#FFFFFF" stroke-width="5"/>
  </g>
</svg>`,
  },
  {
    id: "pop-kawaii-avocado",
    label: "Happy Avocado",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1,
    defaultWidthPct: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 100 32 C 122 32, 136 62, 144 92 C 156 130, 142 172, 100 172 C 58 172, 44 130, 56 92 C 64 62, 78 32, 100 32 Z" fill="#FFFFFF" stroke-width="5.5"/>
    <path d="M 100 44 C 116 44, 128 68, 134 94 C 144 126, 134 160, 100 160 C 66 160, 56 126, 66 94 C 72 68, 84 44, 100 44 Z" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="100" cy="126" r="24" fill="#FFFFFF" stroke-width="4.8"/>
    <path d="M 100 32 C 104 20, 122 18, 126 28 C 118 36, 108 36, 100 32 Z" fill="#FFFFFF" stroke-width="3.8"/>
    <circle cx="88" cy="78" r="4" fill="#000000"/>
    <circle cx="112" cy="78" r="4" fill="#000000"/>
    <path d="M 94 88 Q 100 94, 106 88" fill="none" stroke-width="3"/>
  </g>
</svg>`,
  },
  {
    id: "pop-lace-butterfly",
    label: "Lace Butterfly",
    mode: "sticker",
    category: "popular",
    aspectRatio: 1.15,
    defaultWidthPct: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 190" width="220" height="190">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Upper Wings -->
    <path d="M 104 92 C 74 36, 20 34, 24 82 C 26 106, 64 114, 102 104 Z" fill="#FFFFFF" stroke-width="5.2"/>
    <path d="M 116 92 C 146 36, 200 34, 196 82 C 194 106, 156 114, 118 104 Z" fill="#FFFFFF" stroke-width="5.2"/>
    <!-- Lower Wings -->
    <path d="M 102 108 C 68 114, 40 144, 56 164 C 72 180, 100 152, 104 120 Z" fill="#FFFFFF" stroke-width="5.2"/>
    <path d="M 118 108 C 152 114, 180 144, 164 164 C 148 180, 120 152, 116 120 Z" fill="#FFFFFF" stroke-width="5.2"/>
    <!-- Wing Details -->
    <circle cx="62" cy="78" r="14" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="158" cy="78" r="14" fill="#FFFFFF" stroke-width="3.5"/>
    <circle cx="72" cy="144" r="9" fill="#FFFFFF" stroke-width="3.2"/>
    <circle cx="148" cy="144" r="9" fill="#FFFFFF" stroke-width="3.2"/>
    <!-- Body & Antennae -->
    <ellipse cx="110" cy="108" rx="8" ry="34" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="110" cy="68" r="9" fill="#FFFFFF" stroke-width="4.5"/>
    <path d="M 106 60 C 96 36, 82 32, 78 40 M 114 60 C 124 36, 138 32, 142 40" fill="none" stroke-width="3.5"/>
  </g>
</svg>`,
  },
];

// ---------- 230+ Expanded Pure B&W Die-Cut Coloring Stickers ----------
export const EXPANDED_STICKER_ASSETS: StickerAsset[] =
  buildExpandedStickerPack() as StickerAsset[];

// ---------- 545 Natural-Looking Pure B&W Storybook Cartoons ----------
export const CARTOON_ASSETS: StickerAsset[] =
  buildCartoonStudioPack() as StickerAsset[];

export const CARTOON_CATEGORIES: { id: "all" | CartoonThemeId; label: string }[] = [
  { id: "all", label: "All Cartoons" },
  { id: "animals", label: "Animals" },
  { id: "kids-play", label: "Kids & Play" },
  { id: "ocean", label: "Ocean" },
  { id: "fantasy", label: "Fantasy" },
  { id: "dinosaurs", label: "Dinosaurs" },
  { id: "vehicles-space", label: "Vehicles & Space" },
  { id: "homes-places", label: "Homes & Places" },
  { id: "garden-critters", label: "Garden Critters" },
  { id: "nature-botanical", label: "Nature" },
  { id: "holiday-seasons", label: "Holiday" },
];

export const STICKER_CATEGORIES: { id: "all" | StickerSubCategory; label: string }[] = [
  { id: "all", label: "All Stickers" },
  { id: "alphabet", label: "A–Z" },
  { id: "numbers", label: "0–10" },
  { id: "symbols", label: "Symbols" },
  { id: "food", label: "Cute Food" },
  { id: "school", label: "School" },
  { id: "weather", label: "Weather" },
  { id: "badges", label: "Badges & Frames" },
  { id: "magic", label: "Magic & Hearts" },
  { id: "travel", label: "Travel" },
  { id: "hobbies", label: "Hobbies" },
  { id: "holiday-extra", label: "Party & Seasons" },
  { id: "christmas", label: "Christmas" },
  { id: "new-year", label: "New Year" },
  { id: "popular", label: "Popular" },
];

