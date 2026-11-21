export type GlyphStyle = "3d" | "handwriting" | "dot" | "sticker";

export interface GlyphStrokeDef {
  strokes: string[];
  startDot?: [number, number];
}

// Clean geometric rounded paths on a 120x120 grid (safe bounds x:24..96, y:22..98)
export const PRINT_GLYPHS: Record<string, GlyphStrokeDef> = {
  A: { strokes: ["M 30 94 L 60 24 L 90 94", "M 41 70 L 79 70"], startDot: [30, 94] },
  B: {
    strokes: [
      "M 34 24 L 34 94",
      "M 34 24 L 64 24 C 82 24, 82 57, 64 57 L 34 57",
      "M 34 57 L 68 57 C 88 57, 88 94, 68 94 L 34 94",
    ],
    startDot: [34, 24],
  },
  C: {
    strokes: ["M 86 38 C 78 22, 42 20, 32 42 C 24 62, 34 96, 62 96 C 76 96, 84 88, 88 78"],
    startDot: [86, 38],
  },
  D: {
    strokes: ["M 34 24 L 58 24 C 88 24, 90 94, 58 94 L 34 94 Z"],
    startDot: [34, 24],
  },
  E: {
    strokes: ["M 84 24 L 36 24 L 36 94 L 84 94", "M 36 58 L 74 58"],
    startDot: [36, 24],
  },
  F: {
    strokes: ["M 84 24 L 36 24 L 36 94", "M 36 58 L 74 58"],
    startDot: [36, 24],
  },
  G: {
    strokes: [
      "M 86 38 C 78 22, 40 20, 32 44 C 24 66, 34 96, 64 96 C 80 96, 88 86, 88 70 L 88 60 L 62 60",
    ],
    startDot: [86, 38],
  },
  H: {
    strokes: ["M 34 24 L 34 94", "M 86 24 L 86 94", "M 34 58 L 86 58"],
    startDot: [34, 24],
  },
  I: {
    strokes: ["M 44 24 L 76 24", "M 60 24 L 60 94", "M 44 94 L 76 94"],
    startDot: [60, 24],
  },
  J: {
    strokes: ["M 46 24 L 80 24", "M 72 24 L 72 74 C 72 94, 42 98, 34 78"],
    startDot: [72, 24],
  },
  K: {
    strokes: ["M 36 24 L 36 94", "M 84 24 L 38 60 L 86 94"],
    startDot: [36, 24],
  },
  L: {
    strokes: ["M 38 24 L 38 94 L 84 94"],
    startDot: [38, 24],
  },
  M: {
    strokes: ["M 28 94 L 32 24 L 60 66 L 88 24 L 92 94"],
    startDot: [28, 94],
  },
  N: {
    strokes: ["M 34 94 L 34 24 L 86 94 L 86 24"],
    startDot: [34, 94],
  },
  O: {
    strokes: ["M 60 24 C 88 24, 90 94, 60 94 C 30 94, 32 24, 60 24 Z"],
    startDot: [60, 24],
  },
  P: {
    strokes: ["M 36 94 L 36 24 L 66 24 C 88 24, 88 62, 66 62 L 36 62"],
    startDot: [36, 94],
  },
  Q: {
    strokes: [
      "M 60 24 C 88 24, 90 92, 60 92 C 30 92, 32 24, 60 24 Z",
      "M 66 74 L 90 96",
    ],
    startDot: [60, 24],
  },
  R: {
    strokes: [
      "M 36 94 L 36 24 L 66 24 C 86 24, 86 59, 66 59 L 36 59",
      "M 62 59 L 86 94",
    ],
    startDot: [36, 94],
  },
  S: {
    strokes: ["M 82 36 C 78 22, 42 20, 36 37 C 31 53, 86 54, 84 76 C 82 96, 42 98, 34 80"],
    startDot: [82, 36],
  },
  T: {
    strokes: ["M 28 24 L 92 24", "M 60 24 L 60 94"],
    startDot: [28, 24],
  },
  U: {
    strokes: ["M 34 24 L 34 70 C 34 98, 86 98, 86 70 L 86 24"],
    startDot: [34, 24],
  },
  V: {
    strokes: ["M 30 24 L 60 94 L 90 24"],
    startDot: [30, 24],
  },
  W: {
    strokes: ["M 24 24 L 40 94 L 60 48 L 80 94 L 96 24"],
    startDot: [24, 24],
  },
  X: {
    strokes: ["M 32 24 L 88 94", "M 88 24 L 32 94"],
    startDot: [32, 24],
  },
  Y: {
    strokes: ["M 30 24 L 60 58 L 90 24", "M 60 58 L 60 94"],
    startDot: [30, 24],
  },
  Z: {
    strokes: ["M 32 24 L 88 24 L 32 94 L 88 94"],
    startDot: [32, 24],
  },

  "0": {
    strokes: ["M 60 24 C 84 24, 84 94, 60 94 C 36 94, 36 24, 60 24 Z"],
    startDot: [60, 24],
  },
  "1": {
    strokes: ["M 44 38 L 62 24 L 62 94", "M 42 94 L 82 94"],
    startDot: [44, 38],
  },
  "2": {
    strokes: ["M 36 40 C 38 22, 82 20, 82 42 C 82 60, 44 72, 34 94 L 86 94"],
    startDot: [36, 40],
  },
  "3": {
    strokes: [
      "M 38 34 C 46 20, 82 22, 80 41 C 79 54, 62 57, 52 57 C 66 57, 84 62, 84 78 C 84 97, 42 97, 36 82",
    ],
    startDot: [38, 34],
  },
  "4": {
    strokes: ["M 74 94 L 74 24 L 32 72 L 88 72"],
    startDot: [74, 24],
  },
  "5": {
    strokes: [
      "M 82 24 L 40 24 L 38 54 C 54 46, 84 52, 84 74 C 84 96, 44 98, 34 82",
    ],
    startDot: [82, 24],
  },
  "6": {
    strokes: [
      "M 78 32 C 66 20, 38 24, 34 58 C 31 86, 46 96, 62 96 C 84 96, 86 72, 76 62 C 66 52, 42 54, 34 68",
    ],
    startDot: [78, 32],
  },
  "7": {
    strokes: ["M 32 24 L 88 24 L 48 94"],
    startDot: [32, 24],
  },
  "8": {
    strokes: [
      "M 60 56 C 82 56, 82 24, 60 24 C 38 24, 38 56, 60 56 C 88 56, 88 95, 60 95 C 32 95, 32 56, 60 56 Z",
    ],
    startDot: [60, 24],
  },
  "9": {
    strokes: [
      "M 84 54 C 76 64, 52 66, 42 56 C 32 46, 36 24, 58 24 C 78 24, 86 38, 84 62 C 82 88, 62 98, 40 88",
    ],
    startDot: [84, 54],
  },
};

// Flowing calligraphic / script handwriting paths on 120x120 grid
export const HANDWRITING_GLYPHS: Record<string, GlyphStrokeDef> = {
  A: {
    strokes: [
      "M 24 88 C 34 94, 42 62, 62 24 C 66 44, 72 86, 88 94 C 94 94, 98 88, 100 84",
      "M 34 66 C 50 62, 68 62, 86 64",
    ],
  },
  B: {
    strokes: [
      "M 38 28 C 34 52, 30 76, 30 94",
      "M 26 32 C 42 18, 84 22, 80 42 C 77 54, 56 58, 42 58 C 66 56, 90 66, 84 84 C 78 98, 42 98, 28 86",
    ],
  },
  C: {
    strokes: [
      "M 86 36 C 78 20, 42 22, 32 48 C 24 72, 38 96, 66 94 C 80 93, 92 84, 96 74",
    ],
  },
  D: {
    strokes: [
      "M 40 28 C 36 52, 34 74, 34 94",
      "M 26 32 C 56 18, 92 32, 88 64 C 84 90, 50 98, 28 86",
    ],
  },
  E: {
    strokes: [
      "M 86 32 C 74 20, 40 24, 42 44 C 44 56, 62 58, 72 58 C 50 58, 34 66, 34 82 C 34 96, 70 98, 92 82",
    ],
  },
  F: {
    strokes: [
      "M 92 26 C 72 22, 46 24, 48 36 C 48 58, 44 76, 36 94 C 32 96, 26 92, 28 86",
      "M 32 58 C 52 54, 70 54, 84 56",
    ],
  },
  G: {
    strokes: [
      "M 86 34 C 74 18, 38 24, 32 50 C 26 76, 46 92, 70 84 C 80 80, 84 68, 82 58 L 80 92 C 78 104, 56 106, 48 96",
    ],
  },
  H: {
    strokes: [
      "M 36 26 C 34 50, 30 74, 28 94",
      "M 86 26 C 82 50, 78 76, 84 92 C 88 96, 96 90, 98 84",
      "M 28 60 C 48 54, 68 54, 88 58",
    ],
  },
  I: {
    strokes: [
      "M 46 30 C 58 22, 74 24, 70 36 C 64 56, 56 78, 48 92 C 42 96, 34 92, 38 84",
      "M 42 94 C 58 92, 74 92, 86 88",
    ],
  },
  J: {
    strokes: [
      "M 42 30 C 60 22, 82 24, 78 36 L 68 82 C 62 102, 34 102, 30 84 C 28 76, 38 72, 46 76",
    ],
  },
  K: {
    strokes: [
      "M 36 24 C 34 50, 32 74, 30 94",
      "M 88 26 C 68 42, 50 54, 36 60 C 56 64, 74 86, 94 92",
    ],
  },
  L: {
    strokes: [
      "M 66 26 C 52 24, 40 36, 42 52 C 44 68, 34 86, 28 92 C 34 98, 48 86, 56 88 C 70 92, 84 94, 96 84",
    ],
  },
  M: {
    strokes: [
      "M 22 88 C 28 66, 34 42, 40 26 C 46 46, 50 66, 54 80 C 64 58, 74 38, 82 26 C 84 52, 86 78, 92 92 C 96 94, 100 88, 102 84",
    ],
  },
  N: {
    strokes: [
      "M 28 90 C 32 66, 36 42, 40 26 C 54 50, 68 74, 80 92 C 84 68, 88 42, 92 26",
    ],
  },
  O: {
    strokes: [
      "M 64 24 C 90 24, 92 92, 58 94 C 28 96, 28 32, 58 24 C 66 22, 74 28, 72 38",
    ],
  },
  P: {
    strokes: [
      "M 38 28 C 36 52, 32 74, 30 94",
      "M 26 36 C 46 18, 90 22, 86 46 C 82 66, 48 68, 34 60",
    ],
  },
  Q: {
    strokes: [
      "M 62 24 C 88 24, 90 92, 56 94 C 28 96, 30 30, 62 24 Z",
      "M 64 78 C 74 86, 86 96, 98 90",
    ],
  },
  R: {
    strokes: [
      "M 38 28 C 36 52, 32 74, 30 94",
      "M 26 36 C 46 18, 88 22, 84 44 C 80 60, 50 62, 36 58 C 56 64, 72 86, 94 92",
    ],
  },
  S: {
    strokes: [
      "M 84 34 C 76 20, 44 22, 40 38 C 36 54, 84 56, 82 76 C 80 96, 36 98, 28 80 C 26 72, 36 68, 44 74",
    ],
  },
  T: {
    strokes: [
      "M 24 34 C 46 22, 74 24, 96 28",
      "M 62 26 C 58 50, 54 74, 48 94 C 44 96, 36 92, 38 86",
    ],
  },
  U: {
    strokes: [
      "M 34 28 C 32 52, 30 78, 46 92 C 62 98, 78 80, 84 30 C 80 58, 78 82, 86 92 C 92 94, 98 88, 100 84",
    ],
  },
  V: {
    strokes: [
      "M 28 28 C 40 54, 48 80, 56 94 C 68 74, 80 46, 94 26",
    ],
  },
  W: {
    strokes: [
      "M 22 28 C 28 54, 34 80, 40 94 C 48 76, 56 54, 62 42 C 68 60, 74 80, 78 94 C 86 72, 92 48, 98 26",
    ],
  },
  X: {
    strokes: [
      "M 30 28 C 48 50, 68 76, 92 92",
      "M 90 26 C 70 48, 50 74, 28 94",
    ],
  },
  Y: {
    strokes: [
      "M 28 28 C 32 50, 42 66, 56 64 C 70 62, 80 46, 86 26 C 80 56, 74 82, 64 96 C 52 106, 34 98, 42 84 C 50 72, 68 70, 82 72",
    ],
  },
  Z: {
    strokes: [
      "M 32 30 C 52 24, 74 24, 88 28 C 68 50, 46 72, 30 92 C 52 88, 74 90, 94 94",
      "M 46 60 L 74 60",
    ],
  },

  "0": {
    strokes: ["M 64 24 C 88 26, 86 92, 56 94 C 30 96, 32 28, 64 24 Z"],
  },
  "1": {
    strokes: ["M 40 42 C 48 34, 58 26, 66 24 C 62 50, 58 72, 56 94", "M 38 94 C 54 92, 70 92, 84 94"],
  },
  "2": {
    strokes: [
      "M 34 40 C 38 22, 82 22, 80 44 C 78 62, 44 76, 32 94 C 52 88, 72 90, 92 94",
    ],
  },
  "3": {
    strokes: [
      "M 36 34 C 50 20, 84 24, 78 42 C 74 54, 56 56, 48 56 C 68 56, 86 64, 80 82 C 74 98, 38 96, 32 82",
    ],
  },
  "4": {
    strokes: [
      "M 66 26 C 52 44, 38 60, 30 70 C 50 68, 70 68, 92 70",
      "M 76 24 C 72 48, 68 72, 66 94",
    ],
  },
  "5": {
    strokes: [
      "M 86 26 C 68 24, 52 24, 44 26 L 38 54 C 58 46, 86 54, 82 76 C 78 96, 40 98, 32 82",
    ],
  },
  "6": {
    strokes: [
      "M 78 28 C 60 20, 36 32, 34 62 C 32 88, 48 96, 64 94 C 82 92, 86 70, 74 60 C 60 50, 38 56, 34 72",
    ],
  },
  "7": {
    strokes: [
      "M 30 30 C 52 24, 74 24, 90 26 C 74 48, 60 72, 48 94",
      "M 46 60 L 76 58",
    ],
  },
  "8": {
    strokes: [
      "M 62 56 C 84 52, 82 24, 60 24 C 38 24, 38 52, 60 56 C 86 60, 86 94, 58 94 C 30 94, 32 60, 62 56 Z",
    ],
  },
  "9": {
    strokes: [
      "M 84 48 C 76 64, 48 66, 38 52 C 30 38, 42 22, 64 24 C 84 26, 86 48, 78 72 C 70 94, 46 98, 34 86",
    ],
  },
};

export interface SymbolGlyphDef {
  id: string;
  char: string;
  label: string;
  strokes: string[];
}

export const SYMBOL_GLYPHS: SymbolGlyphDef[] = [
  { id: "sym-plus", char: "+", label: "Plus (+)", strokes: ["M 60 28 L 60 92", "M 28 60 L 92 60"] },
  { id: "sym-minus", char: "-", label: "Minus (−)", strokes: ["M 26 60 L 94 60"] },
  { id: "sym-multiply", char: "×", label: "Multiply (×)", strokes: ["M 32 32 L 88 88", "M 88 32 L 32 88"] },
  {
    id: "sym-divide",
    char: "÷",
    label: "Divide (÷)",
    strokes: [
      "M 26 60 L 94 60",
      "M 60 28 L 60 28.1",
      "M 60 92 L 60 92.1",
    ],
  },
  { id: "sym-equals", char: "=", label: "Equals (=)", strokes: ["M 26 46 L 94 46", "M 26 74 L 94 74"] },
  {
    id: "sym-question",
    char: "?",
    label: "Question (?)",
    strokes: [
      "M 40 40 C 40 20, 82 20, 82 40 C 82 54, 60 56, 60 68",
      "M 60 94 L 60 94.1",
    ],
  },
  {
    id: "sym-exclaim",
    char: "!",
    label: "Exclamation (!)",
    strokes: ["M 60 22 L 60 68", "M 60 94 L 60 94.1"],
  },
  {
    id: "sym-percent",
    char: "%",
    label: "Percent (%)",
    strokes: [
      "M 32 90 L 88 30",
      "M 40 28 C 52 28, 52 50, 40 50 C 28 50, 28 28, 40 28 Z",
      "M 80 70 C 92 70, 92 92, 80 92 C 68 92, 68 70, 80 70 Z",
    ],
  },
  {
    id: "sym-hash",
    char: "#",
    label: "Hashtag (#)",
    strokes: ["M 46 24 L 38 96", "M 82 24 L 74 96", "M 26 46 L 94 46", "M 24 74 L 92 74"],
  },
  {
    id: "sym-amp",
    char: "&",
    label: "Ampersand (&)",
    strokes: [
      "M 86 90 C 66 72, 38 52, 40 34 C 42 22, 68 20, 70 36 C 72 52, 32 62, 32 80 C 32 96, 64 98, 86 72",
    ],
  },
  { id: "sym-lt", char: "<", label: "Less Than (<)", strokes: ["M 84 30 L 34 60 L 84 90"] },
  { id: "sym-gt", char: ">", label: "Greater Than (>)", strokes: ["M 36 30 L 86 60 L 36 90"] },
  { id: "sym-lparen", char: "(", label: "Open Paren (()", strokes: ["M 74 22 C 46 38, 46 82, 74 98"] },
  { id: "sym-rparen", char: ")", label: "Close Paren ())", strokes: ["M 46 22 C 74 38, 74 82, 46 98"] },
  {
    id: "sym-star",
    char: "*",
    label: "Asterisk (*)",
    strokes: ["M 60 24 L 60 96", "M 28 42 L 92 78", "M 92 42 L 28 78"],
  },
  {
    id: "sym-at",
    char: "@",
    label: "At Symbol (@)",
    strokes: [
      "M 76 48 C 72 36, 46 36, 44 58 C 42 78, 72 80, 76 58 L 76 40",
      "M 76 68 C 88 68, 94 54, 90 38 C 84 20, 38 18, 28 48 C 18 82, 46 98, 82 90",
    ],
  },
];

function renderSingleGlyphLayer(
  def: GlyphStrokeDef,
  style: GlyphStyle,
  offsetX = 0
): string {
  const combined = def.strokes.join(" ");
  const tx = offsetX ? ` transform="translate(${offsetX}, 0)"` : "";

  if (style === "3d") {
    return `<g${tx} fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${combined}" transform="translate(7, 7)" stroke="#000000" stroke-width="22"/>
      <path d="${combined}" transform="translate(4.5, 4.5)" stroke="#000000" stroke-width="22"/>
      <path d="${combined}" transform="translate(2, 2)" stroke="#000000" stroke-width="22"/>
      <path d="${combined}" stroke="#000000" stroke-width="22"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="14"/>
    </g>`;
  }

  if (style === "sticker") {
    return `<g${tx} fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${combined}" stroke="#000000" stroke-width="38"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="30"/>
      <path d="${combined}" stroke="#000000" stroke-width="20"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="12"/>
    </g>`;
  }

  if (style === "handwriting") {
    return `<g${tx} fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${combined}" stroke="#000000" stroke-width="14"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="7.5"/>
    </g>`;
  }

  // Dot / Tracing style
  const dotPaths = def.strokes
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="#000000" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0.1 11.5"/>`
    )
    .join("");
  const startMarker = def.startDot
    ? `<circle cx="${def.startDot[0]}" cy="${def.startDot[1]}" r="5.5" fill="#FFFFFF" stroke="#000000" stroke-width="2.6"/>`
    : "";

  return `<g${tx}>${dotPaths}${startMarker}</g>`;
}

export function buildCharacterStickerSvg(char: string, style: GlyphStyle): string {
  const dict = style === "handwriting" ? HANDWRITING_GLYPHS : PRINT_GLYPHS;

  if (char === "10") {
    const one = dict["1"];
    const zero = dict["0"];
    const body =
      renderSingleGlyphLayer(one, style, -6) +
      renderSingleGlyphLayer(zero, style, 44);
    const stickerSparkles =
      style === "sticker"
        ? `<path d="M 142 18 L 145 26 L 153 29 L 145 32 L 142 40 L 139 32 L 131 29 L 139 26 Z" fill="#FFFFFF" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>`
        : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164 124" width="164" height="124">${body}${stickerSparkles}</svg>`;
  }

  const def = dict[char] || PRINT_GLYPHS[char];
  if (!def) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"></svg>`;
  }

  const sparkle =
    style === "sticker"
      ? `<path d="M 102 14 L 104 20 L 110 22 L 104 24 L 102 30 L 100 24 L 94 22 L 100 20 Z" fill="#FFFFFF" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124" width="124" height="124">${renderSingleGlyphLayer(
    def,
    style,
    2
  )}${sparkle}</svg>`;
}

export function buildSymbolStickerSvg(symbol: SymbolGlyphDef): string {
  const combined = symbol.strokes.join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124" width="124" height="124">
    <g transform="translate(2,2)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${combined}" stroke="#000000" stroke-width="34"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="26"/>
      <path d="${combined}" stroke="#000000" stroke-width="18"/>
      <path d="${combined}" stroke="#FFFFFF" stroke-width="10"/>
    </g>
  </svg>`;
}
