export type CartoonThemeId =
  | "animals"
  | "kids-play"
  | "ocean"
  | "fantasy"
  | "dinosaurs"
  | "vehicles-space"
  | "homes-places"
  | "garden-critters"
  | "nature-botanical"
  | "holiday-seasons";

export interface LazyCatalogAsset {
  id: string;
  label: string;
  mode: "cartoon" | "sticker";
  category: string;
  keywords: string;
  aspectRatio: number;
  defaultWidthPct: number;
  getSvg: () => string;
}

function wrapSvg(inner: string, vb = "0 0 240 240"): string {
  const [, , w, h] = vb.split(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
}

// Expressive facial feature variations (pure #000000 & #FFFFFF)
type FaceStyle = "glossy" | "happy-wink" | "sweet-smile" | "sleepy" | "cool-shades" | "giggle";

function drawFaceFeatures(cx: number, cy: number, style: FaceStyle, wide = 16): string {
  const lx = cx - wide;
  const rx = cx + wide;
  switch (style) {
    case "happy-wink":
      return `
        <circle cx="${lx}" cy="${cy}" r="5.2" fill="#000000" stroke="none"/>
        <circle cx="${lx - 1.8}" cy="${cy - 1.8}" r="1.8" fill="#FFFFFF" stroke="none"/>
        <path d="M ${rx - 6} ${cy + 1} Q ${rx} ${cy - 7}, ${rx + 6} ${cy + 1}" fill="none" stroke-width="3.2"/>
        <path d="M ${lx - 5} ${cy - 10} Q ${lx} ${cy - 14}, ${lx + 5} ${cy - 10}" fill="none" stroke-width="2.2"/>`;
    case "sleepy":
      return `
        <path d="M ${lx - 6} ${cy} Q ${lx} ${cy + 6}, ${lx + 6} ${cy}" fill="none" stroke-width="3"/>
        <path d="M ${rx - 6} ${cy} Q ${rx} ${cy + 6}, ${rx + 6} ${cy}" fill="none" stroke-width="3"/>
        <path d="M ${lx - 7} ${cy + 3} L ${lx - 9} ${cy + 6} M ${rx + 7} ${cy + 3} L ${rx + 9} ${cy + 6}" fill="none" stroke-width="2"/>`;
    case "cool-shades":
      return `
        <path d="M ${lx - 12} ${cy - 7} L ${lx + 11} ${cy - 7} L ${lx + 9} ${cy + 7} Q ${lx} ${cy + 10}, ${lx - 10} ${cy + 6} Z" fill="#FFFFFF" stroke-width="3.5"/>
        <path d="M ${rx - 11} ${cy - 7} L ${rx + 12} ${cy - 7} L ${rx + 10} ${cy + 6} Q ${rx} ${cy + 10}, ${rx - 9} ${cy + 7} Z" fill="#FFFFFF" stroke-width="3.5"/>
        <line x1="${lx + 11}" y1="${cy - 4}" x2="${rx - 11}" y2="${cy - 4}" stroke-width="3.5"/>
        <line x1="${lx - 6}" y1="${cy - 2}" x2="${lx + 2}" y2="${cy + 3}" stroke-width="2"/>
        <line x1="${rx - 6}" y1="${cy - 2}" x2="${rx + 2}" y2="${cy + 3}" stroke-width="2"/>`;
    case "giggle":
      return `
        <path d="M ${lx - 6} ${cy + 2} Q ${lx} ${cy - 7}, ${lx + 6} ${cy + 2}" fill="none" stroke-width="3.4"/>
        <path d="M ${rx - 6} ${cy + 2} Q ${rx} ${cy - 7}, ${rx + 6} ${cy + 2}" fill="none" stroke-width="3.4"/>
        <ellipse cx="${lx - 6}" cy="${cy + 9}" rx="4.5" ry="2.5" fill="none" stroke-width="1.8"/>
        <ellipse cx="${rx + 6}" cy="${cy + 9}" rx="4.5" ry="2.5" fill="none" stroke-width="1.8"/>`;
    case "sweet-smile":
      return `
        <circle cx="${lx}" cy="${cy}" r="4.8" fill="#000000" stroke="none"/>
        <circle cx="${rx}" cy="${cy}" r="4.8" fill="#000000" stroke="none"/>
        <circle cx="${lx - 1.6}" cy="${cy - 1.6}" r="1.6" fill="#FFFFFF" stroke="none"/>
        <circle cx="${rx - 1.6}" cy="${cy - 1.6}" r="1.6" fill="#FFFFFF" stroke="none"/>
        <path d="M ${lx - 4} ${cy - 9} Q ${lx} ${cy - 12}, ${lx + 4} ${cy - 9}" fill="none" stroke-width="2.2"/>
        <path d="M ${rx - 4} ${cy - 9} Q ${rx} ${cy - 12}, ${rx + 4} ${cy - 9}" fill="none" stroke-width="2.2"/>
        <path d="M ${lx - 9} ${cy + 9} L ${lx - 5} ${cy + 6} M ${lx - 5} ${cy + 10} L ${lx - 1} ${cy + 7}" fill="none" stroke-width="1.8"/>
        <path d="M ${rx + 5} ${cy + 6} L ${rx + 9} ${cy + 9} M ${rx + 1} ${cy + 7} L ${rx + 5} ${cy + 10}" fill="none" stroke-width="1.8"/>`;
    default:
      return `
        <circle cx="${lx}" cy="${cy}" r="5.5" fill="#000000" stroke="none"/>
        <circle cx="${rx}" cy="${cy}" r="5.5" fill="#000000" stroke="none"/>
        <circle cx="${lx - 2}" cy="${cy - 2}" r="2" fill="#FFFFFF" stroke="none"/>
        <circle cx="${rx - 2}" cy="${cy - 2}" r="2" fill="#FFFFFF" stroke="none"/>
        <circle cx="${lx + 1.5}" cy="${cy + 1.8}" r="1" fill="#FFFFFF" stroke="none"/>
        <circle cx="${rx + 1.5}" cy="${cy + 1.8}" r="1" fill="#FFFFFF" stroke="none"/>`;
  }
}

// Headgear & Scarf variations
type HeadGear = "none" | "beanie" | "crown" | "bow" | "flower-crown" | "explorer-hat" | "chef-hat" | "party-hat";

function drawHeadGear(cx: number, topY: number, gear: HeadGear): string {
  switch (gear) {
    case "beanie":
      return `
        <path d="M ${cx - 26} ${topY + 6} C ${cx - 24} ${topY - 22}, ${cx + 24} ${topY - 22}, ${cx + 26} ${topY + 6} Z" fill="#FFFFFF" stroke-width="4.2"/>
        <rect x="${cx - 28}" y="${topY + 2}" width="56" height="12" rx="6" fill="#FFFFFF" stroke-width="4"/>
        <line x1="${cx - 12}" y1="${topY + 3}" x2="${cx - 12}" y2="${topY + 13}" stroke-width="2.2"/>
        <line x1="${cx}" y1="${topY + 3}" x2="${cx}" y2="${topY + 13}" stroke-width="2.2"/>
        <line x1="${cx + 12}" y1="${topY + 3}" x2="${cx + 12}" y2="${topY + 13}" stroke-width="2.2"/>
        <circle cx="${cx}" cy="${topY - 18}" r="8" fill="#FFFFFF" stroke-width="3.8"/>`;
    case "crown":
      return `
        <path d="M ${cx - 20} ${topY + 6} L ${cx - 24} ${topY - 14} L ${cx - 10} ${topY - 4} L ${cx} ${topY - 20} L ${cx + 10} ${topY - 4} L ${cx + 24} ${topY - 14} L ${cx + 20} ${topY + 6} Z" fill="#FFFFFF" stroke-width="4"/>
        <circle cx="${cx - 24}" cy="${topY - 16}" r="3.5" fill="#FFFFFF" stroke-width="2.6"/>
        <circle cx="${cx}" cy="${topY - 22}" r="4" fill="#FFFFFF" stroke-width="2.6"/>
        <circle cx="${cx + 24}" cy="${topY - 16}" r="3.5" fill="#FFFFFF" stroke-width="2.6"/>`;
    case "bow":
      return `
        <path d="M ${cx} ${topY + 2} C ${cx - 22} ${topY - 16}, ${cx - 28} ${topY + 10}, ${cx} ${topY + 6} Z" fill="#FFFFFF" stroke-width="3.8"/>
        <path d="M ${cx} ${topY + 2} C ${cx + 22} ${topY - 16}, ${cx + 28} ${topY + 10}, ${cx} ${topY + 6} Z" fill="#FFFFFF" stroke-width="3.8"/>
        <circle cx="${cx}" cy="${topY + 4}" r="5.5" fill="#FFFFFF" stroke-width="3.5"/>`;
    case "flower-crown":
      return `
        <circle cx="${cx - 18}" cy="${topY + 4}" r="7" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${cx}" cy="${topY}" r="8.5" fill="#FFFFFF" stroke-width="3.2"/>
        <circle cx="${cx + 18}" cy="${topY + 4}" r="7" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${cx - 18}" cy="${topY + 4}" r="2.5" fill="#FFFFFF" stroke-width="2"/>
        <circle cx="${cx}" cy="${topY}" r="3" fill="#FFFFFF" stroke-width="2"/>
        <circle cx="${cx + 18}" cy="${topY + 4}" r="2.5" fill="#FFFFFF" stroke-width="2"/>`;
    case "explorer-hat":
      return `
        <ellipse cx="${cx}" cy="${topY + 5}" rx="34" ry="8" fill="#FFFFFF" stroke-width="4"/>
        <path d="M ${cx - 20} ${topY + 4} C ${cx - 18} ${topY - 18}, ${cx + 18} ${topY - 18}, ${cx + 20} ${topY + 4} Z" fill="#FFFFFF" stroke-width="4"/>
        <path d="M ${cx - 19} ${topY - 1} Q ${cx} ${topY + 3}, ${cx + 19} ${topY - 1}" fill="none" stroke-width="2.6"/>`;
    case "chef-hat":
      return `
        <path d="M ${cx - 20} ${topY + 6} L ${cx - 22} ${topY - 6} C ${cx - 34} ${topY - 12}, ${cx - 24} ${topY - 30}, ${cx - 8} ${topY - 24} C ${cx - 4} ${topY - 34}, ${cx + 14} ${topY - 34}, ${cx + 14} ${topY - 22} C ${cx + 30} ${topY - 26}, ${cx + 32} ${topY - 8}, ${cx + 20} ${topY - 4} L ${cx + 20} ${topY + 6} Z" fill="#FFFFFF" stroke-width="4"/>`;
    case "party-hat":
      return `
        <path d="M ${cx} ${topY - 26} L ${cx - 18} ${topY + 6} Q ${cx} ${topY + 12}, ${cx + 18} ${topY + 6} Z" fill="#FFFFFF" stroke-width="4"/>
        <path d="M ${cx - 9} ${topY - 8} L ${cx} ${topY - 2} L ${cx + 9} ${topY - 8}" fill="none" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${topY - 28}" r="5.5" fill="#FFFFFF" stroke-width="3.5"/>`;
    default:
      return "";
  }
}

// Companion / held props & scene details (adds true visual variety per cartoon!)
type PropKind =
  | "none"
  | "balloon"
  | "book"
  | "flower"
  | "cup"
  | "heart"
  | "star"
  | "music"
  | "umbrella"
  | "gift"
  | "butterfly"
  | "paint"
  | "scarf";

function drawPropAccent(prop: PropKind, px: number, py: number): string {
  switch (prop) {
    case "balloon":
      return `
        <path d="M ${px} ${py + 12} C ${px - 6} ${py + 30}, ${px + 6} ${py + 44}, ${px - 2} ${py + 62}" fill="none" stroke-width="2.6"/>
        <ellipse cx="${px}" cy="${py - 12}" rx="17" ry="22" fill="#FFFFFF" stroke-width="4"/>
        <polygon points="${px},${py + 10} ${px - 4},${py + 15} ${px + 4},${py + 15}" fill="#FFFFFF" stroke-width="2.5"/>
        <path d="M ${px - 9} ${py - 22} Q ${px - 5} ${py - 28}, ${px + 2} ${py - 28}" fill="none" stroke-width="2.2"/>`;
    case "book":
      return `
        <g transform="translate(${px} ${py + 8})">
          <path d="M -22 14 L -18 -8 Q -8 -12, 0 -6 Q 8 -12, 18 -8 L 22 14 Q 10 10, 0 16 Q -10 10, -22 14 Z" fill="#FFFFFF" stroke-width="3.8"/>
          <line x1="0" y1="-6" x2="0" y2="16" stroke-width="2.8"/>
          <line x1="-14" y1="-1" x2="-5" y2="-1" stroke-width="2"/>
          <line x1="5" y1="-1" x2="14" y2="-1" stroke-width="2"/>
        </g>`;
    case "flower":
      return `
        <path d="M ${px} ${py + 4} L ${px} ${py + 38}" fill="none" stroke-width="3.5"/>
        <path d="M ${px} ${py + 24} C ${px + 14} ${py + 16}, ${px + 18} ${py + 26}, ${px} ${py + 30}" fill="#FFFFFF" stroke-width="2.8"/>
        <circle cx="${px}" cy="${py - 8}" r="6" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${px}" cy="${py + 4}" r="6" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${px - 6}" cy="${py - 2}" r="6" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${px + 6}" cy="${py - 2}" r="6" fill="#FFFFFF" stroke-width="3"/>
        <circle cx="${px}" cy="${py - 2}" r="5" fill="#FFFFFF" stroke-width="3"/>`;
    case "cup":
      return `
        <g transform="translate(${px} ${py + 6})">
          <path d="M 10 -4 C 19 -4, 19 10, 10 10" fill="none" stroke-width="3"/>
          <path d="M -11 -8 L 11 -8 L 9 14 Q 0 18, -9 14 Z" fill="#FFFFFF" stroke-width="3.6"/>
          <path d="M -4 -14 Q -7 -22, 0 -26 M 4 -14 Q 1 -22, 8 -26" fill="none" stroke-width="2.2"/>
        </g>`;
    case "heart":
      return `
        <path d="M ${px} ${py + 12} C ${px - 18} ${py - 2}, ${px - 14} ${py - 20}, ${px} ${py - 8} C ${px + 14} ${py - 20}, ${px + 18} ${py - 2}, ${px} ${py + 12} Z" fill="#FFFFFF" stroke-width="3.6"/>`;
    case "star":
      return `
        <polygon points="${px},${py - 16} ${px + 5},${py - 5} ${px + 17},${py - 4} ${px + 8},${py + 4} ${px + 10},${py + 16} ${px},${py + 10} ${px - 10},${py + 16} ${px - 8},${py + 4} ${px - 17},${py - 4} ${px - 5},${py - 5}" fill="#FFFFFF" stroke-width="3.4"/>`;
    case "music":
      return `
        <g transform="translate(${px} ${py - 4})">
          <path d="M -4 14 L -4 -10 L 14 -14 L 14 10" fill="none" stroke-width="3.2"/>
          <circle cx="-8" cy="14" r="5" fill="#FFFFFF" stroke-width="3.2"/>
          <circle cx="10" cy="10" r="5" fill="#FFFFFF" stroke-width="3.2"/>
        </g>`;
    case "umbrella":
      return `
        <g transform="translate(${px} ${py - 6})">
          <path d="M 0 -22 L 0 22 C 0 28, -8 28, -8 22" fill="none" stroke-width="3.2"/>
          <path d="M -24 0 C -20 -20, 20 -20, 24 0 Q 12 -4, 0 0 Q -12 -4, -24 0 Z" fill="#FFFFFF" stroke-width="3.8"/>
          <path d="M 0 -16 C -8 -10, -8 -4, -8 0 M 0 -16 C 8 -10, 8 -4, 8 0" fill="none" stroke-width="2.2"/>
        </g>`;
    case "gift":
      return `
        <g transform="translate(${px} ${py + 6})">
          <rect x="-14" y="-8" width="28" height="22" rx="3" fill="#FFFFFF" stroke-width="3.6"/>
          <rect x="-16" y="-14" width="32" height="8" rx="2" fill="#FFFFFF" stroke-width="3.6"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke-width="2.8"/>
          <path d="M 0 -14 C -10 -24, -14 -16, 0 -14 C 14 -16, 10 -24, 0 -14 Z" fill="#FFFFFF" stroke-width="2.8"/>
        </g>`;
    case "butterfly":
      return `
        <g transform="translate(${px} ${py - 10}) rotate(-14)">
          <path d="M -2 0 C -14 -14, -22 -4, -10 4 C -18 10, -10 18, -2 8" fill="#FFFFFF" stroke-width="2.8"/>
          <path d="M 2 0 C 14 -14, 22 -4, 10 4 C 18 10, 10 18, 2 8" fill="#FFFFFF" stroke-width="2.8"/>
          <line x1="0" y1="-4" x2="0" y2="10" stroke-width="2.8"/>
        </g>`;
    case "paint":
      return `
        <g transform="translate(${px} ${py + 4})">
          <ellipse cx="0" cy="0" rx="18" ry="13" fill="#FFFFFF" stroke-width="3.6"/>
          <circle cx="-7" cy="-4" r="3" fill="#FFFFFF" stroke-width="2.2"/>
          <circle cx="4" cy="-5" r="3" fill="#FFFFFF" stroke-width="2.2"/>
          <circle cx="9" cy="3" r="3" fill="#FFFFFF" stroke-width="2.2"/>
          <circle cx="-5" cy="5" r="3.5" fill="#000000"/>
          <path d="M -14 14 L 14 -16" fill="none" stroke-width="3.2"/>
        </g>`;
    default:
      return "";
  }
}

type SceneGround = "none" | "meadow" | "clouds" | "sparkles" | "waves";

function drawSceneGround(ground: SceneGround): string {
  switch (ground) {
    case "meadow":
      return `
        <path d="M 32 214 Q 120 206, 208 214" fill="none" stroke-width="3.2"/>
        <path d="M 48 212 L 42 198 M 52 212 L 56 196 M 188 212 L 184 198 M 192 212 L 198 198" fill="none" stroke-width="2.6"/>`;
    case "clouds":
      return `
        <path d="M 24 62 C 16 62, 16 50, 24 46 C 26 36, 40 34, 46 42 C 54 38, 64 46, 62 54 C 68 56, 66 62, 58 62 Z" fill="#FFFFFF" stroke-width="3"/>
        <path d="M 176 54 C 168 54, 168 42, 176 38 C 178 28, 192 26, 198 34 C 206 30, 216 38, 214 46 C 220 48, 218 54, 210 54 Z" fill="#FFFFFF" stroke-width="3"/>`;
    case "sparkles":
      return `
        <path d="M 34 42 L 37 49 L 44 52 L 37 55 L 34 62 L 31 55 L 24 52 L 31 49 Z" fill="#FFFFFF" stroke-width="2.6"/>
        <path d="M 204 48 L 206 54 L 212 56 L 206 58 L 204 64 L 202 58 L 196 56 L 202 54 Z" fill="#FFFFFF" stroke-width="2.4"/>
        <circle cx="44" cy="184" r="3.5" fill="#FFFFFF" stroke-width="2.4"/>`;
    case "waves":
      return `
        <path d="M 24 206 Q 48 196, 72 206 Q 96 216, 120 206 Q 144 196, 168 206 Q 192 216, 216 206" fill="none" stroke-width="3.2"/>`;
    default:
      return "";
  }
}

// ---------- 16 Organic Animal Anatomies -> 80 Distinct Storybook Animal Cartoons ----------
type AnimalSpecies =
  | "bunny"
  | "bear"
  | "fox"
  | "panda"
  | "kitten"
  | "puppy"
  | "elephant"
  | "giraffe"
  | "koala"
  | "lion"
  | "penguin"
  | "hedgehog"
  | "owl"
  | "duckling"
  | "squirrel"
  | "deer";

function drawAnimalBody(
  species: AnimalSpecies,
  face: FaceStyle,
  gear: HeadGear,
  prop: PropKind,
  ground: SceneGround,
  hasScarf: boolean
): string {
  const scarfSvg = hasScarf
    ? `<path d="M 86 126 Q 120 138, 154 126 L 156 140 Q 120 152, 84 140 Z" fill="#FFFFFF" stroke-width="4"/>
       <path d="M 134 138 L 142 170 L 158 166 L 148 134 Z" fill="#FFFFFF" stroke-width="3.8"/>
       <line x1="145" y1="169" x2="146" y2="175" stroke-width="2.5"/><line x1="152" y1="167" x2="154" y2="173" stroke-width="2.5"/>`
    : "";

  let core = "";
  let headTop = 50;

  switch (species) {
    case "bunny":
      headTop = 52;
      core = `
        <path d="M 94 64 C 82 22, 62 20, 62 46 C 62 66, 78 80, 90 76" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 84 62 C 76 38, 70 34, 70 48" fill="none" stroke-width="2.4"/>
        <path d="M 146 64 C 158 22, 178 20, 178 46 C 178 66, 162 80, 150 76" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 156 62 C 164 38, 170 34, 170 48" fill="none" stroke-width="2.4"/>
        <circle cx="70" cy="186" r="14" fill="#FFFFFF" stroke-width="4.5"/>
        <path d="M 86 132 C 66 156, 70 202, 98 206 L 144 206 C 170 202, 172 156, 152 132 Z" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="120" cy="172" rx="22" ry="24" fill="#FFFFFF" stroke-width="2.6"/>
        <path d="M 80 94 C 78 58, 162 58, 160 94 C 164 120, 146 136, 120 136 C 94 136, 76 120, 80 94 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 96, face, 16)}
        <ellipse cx="120" cy="109" rx="5.5" ry="3.8" fill="#FFFFFF" stroke-width="3"/>
        <path d="M 112 118 Q 120 124, 128 118" fill="none" stroke-width="2.8"/>
        <path d="M 86 108 L 68 104 M 86 114 L 68 118 M 154 108 L 172 104 M 154 114 L 172 118" fill="none" stroke-width="2.2"/>
        <ellipse cx="98" cy="208" rx="18" ry="9" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="142" cy="208" rx="18" ry="9" fill="#FFFFFF" stroke-width="4.5"/>`;
      break;
    case "bear":
      headTop = 48;
      core = `
        <circle cx="82" cy="62" r="16" fill="#FFFFFF" stroke-width="4.8"/>
        <circle cx="82" cy="62" r="8" fill="#FFFFFF" stroke-width="2.8"/>
        <circle cx="158" cy="62" r="16" fill="#FFFFFF" stroke-width="4.8"/>
        <circle cx="158" cy="62" r="8" fill="#FFFFFF" stroke-width="2.8"/>
        <path d="M 80 130 C 62 154, 66 204, 98 206 L 144 206 C 174 204, 178 154, 158 130 Z" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="120" cy="172" rx="26" ry="26" fill="#FFFFFF" stroke-width="2.8"/>
        <ellipse cx="120" cy="94" rx="46" ry="40" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="120" cy="108" rx="20" ry="15" fill="#FFFFFF" stroke-width="3.2"/>
        ${drawFaceFeatures(120, 86, face, 18)}
        <ellipse cx="120" cy="103" rx="6.5" ry="4.5" fill="#000000"/>
        <path d="M 112 113 Q 120 120, 128 113" fill="none" stroke-width="2.8"/>
        <ellipse cx="94" cy="204" rx="16" ry="11" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="146" cy="204" rx="16" ry="11" fill="#FFFFFF" stroke-width="4.5"/>`;
      break;
    case "fox":
      headTop = 54;
      core = `
        <path d="M 148 188 C 194 188, 212 146, 188 128 C 174 120, 162 144, 146 164 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 180 136 Q 186 146, 198 144" fill="none" stroke-width="3"/>
        <path d="M 78 72 L 68 34 L 106 54 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 162 72 L 172 34 L 134 54 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 88 134 C 72 158, 76 204, 102 206 L 140 206 C 164 204, 164 158, 150 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 74 96 C 72 62, 168 62, 166 96 C 168 120, 142 138, 120 138 C 98 138, 72 120, 74 96 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 76 106 Q 100 100, 120 120 Q 140 100, 164 106" fill="none" stroke-width="2.8"/>
        ${drawFaceFeatures(120, 92, face, 17)}
        <circle cx="120" cy="116" r="5" fill="#000000"/>
        <path d="M 112 124 Q 120 129, 128 124" fill="none" stroke-width="2.6"/>`;
      break;
    case "panda":
      headTop = 50;
      core = `
        <circle cx="80" cy="60" r="15" fill="#FFFFFF" stroke-width="5.5"/>
        <circle cx="160" cy="60" r="15" fill="#FFFFFF" stroke-width="5.5"/>
        <path d="M 80 130 C 62 154, 66 204, 96 206 L 144 206 C 174 204, 178 154, 160 130 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 76 140 Q 120 156, 164 140" fill="none" stroke-width="3.6"/>
        <ellipse cx="120" cy="96" rx="46" ry="39" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="101" cy="92" rx="12" ry="15" transform="rotate(-18 101 92)" fill="#FFFFFF" stroke-width="3.8"/>
        <ellipse cx="139" cy="92" rx="12" ry="15" transform="rotate(18 139 92)" fill="#FFFFFF" stroke-width="3.8"/>
        ${drawFaceFeatures(120, 92, face, 19)}
        <ellipse cx="120" cy="108" rx="6" ry="4" fill="#000000"/>
        <path d="M 112 117 Q 120 123, 128 117" fill="none" stroke-width="2.8"/>
        <ellipse cx="94" cy="204" rx="16" ry="11" fill="#FFFFFF" stroke-width="4.8"/>
        <ellipse cx="146" cy="204" rx="16" ry="11" fill="#FFFFFF" stroke-width="4.8"/>`;
      break;
    case "kitten":
      headTop = 54;
      core = `
        <path d="M 150 184 C 186 184, 198 156, 184 140 C 174 132, 164 144, 172 152" fill="none" stroke-width="5.5"/>
        <path d="M 80 74 L 68 38 L 106 58 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 160 74 L 172 38 L 134 58 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 88 134 C 74 158, 76 202, 102 206 L 138 206 C 162 202, 164 158, 150 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="120" cy="94" rx="44" ry="36" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 120 58 L 120 68 M 112 60 L 114 68 M 128 60 L 126 68" fill="none" stroke-width="2.6"/>
        ${drawFaceFeatures(120, 92, face, 17)}
        <polygon points="120,104 115,98 125,98" fill="#FFFFFF" stroke-width="2.8"/>
        <path d="M 112 110 Q 120 116, 128 110" fill="none" stroke-width="2.6"/>
        <path d="M 82 96 L 62 92 M 82 104 L 62 108 M 158 96 L 178 92 M 158 104 L 178 108" fill="none" stroke-width="2.2"/>`;
      break;
    case "puppy":
      headTop = 50;
      core = `
        <path d="M 152 172 C 180 166, 192 144, 180 134 C 170 128, 162 146, 154 162" fill="#FFFFFF" stroke-width="4.5"/>
        <path d="M 86 134 C 72 158, 74 202, 98 206 L 142 206 C 164 202, 164 158, 152 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 78 68 C 52 72, 44 108, 60 120 C 70 126, 78 108, 80 92" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 162 68 C 188 72, 196 108, 180 120 C 170 126, 162 108, 160 92" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 76 86 C 76 50, 164 50, 164 86 C 166 116, 148 136, 120 136 C 92 136, 74 116, 76 86 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 88, face, 17)}
        <ellipse cx="120" cy="102" rx="7.5" ry="5.5" fill="#000000"/>
        <path d="M 120 108 L 120 115 M 109 115 Q 120 122, 131 115" fill="none" stroke-width="2.8"/>
        <ellipse cx="100" cy="204" rx="14" ry="9" fill="#FFFFFF" stroke-width="4.2"/>
        <ellipse cx="140" cy="204" rx="14" ry="9" fill="#FFFFFF" stroke-width="4.2"/>`;
      break;
    case "elephant":
      headTop = 52;
      core = `
        <path d="M 60 156 C 46 162, 44 176, 52 184" fill="none" stroke-width="4"/>
        <path d="M 64 156 C 60 120, 114 106, 150 126 L 152 198 L 126 198 L 126 174 L 96 174 L 96 198 L 70 198 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 158 70 C 188 60, 206 88, 192 118 C 182 134, 160 130, 152 116" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 112 92 C 114 54, 174 54, 180 92 C 182 110, 178 122, 192 126 C 206 130, 214 118, 208 106 C 204 100, 196 104, 200 110 C 216 112, 222 134, 204 142 C 184 150, 164 134, 156 122 C 142 134, 110 126, 112 92 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 124 80 C 90 70, 78 104, 94 130 C 106 144, 128 134, 132 116" fill="#FFFFFF" stroke-width="4.8"/>
        ${drawFaceFeatures(152, 88, face, 11)}
        <path d="M 76 198 Q 82 190, 88 198 M 132 198 Q 138 190, 144 198" fill="none" stroke-width="2.6"/>`;
      break;
    case "giraffe":
      headTop = 36;
      core = `
        <path d="M 102 104 L 96 154 C 84 166, 86 198, 96 206 L 114 206 L 116 184 L 136 184 L 138 206 L 154 206 C 162 194, 160 156, 144 144 L 128 102 Z" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="114" cy="144" r="6" fill="#FFFFFF" stroke-width="2.6"/>
        <circle cx="136" cy="160" r="8" fill="#FFFFFF" stroke-width="2.6"/>
        <line x1="106" y1="54" x2="100" y2="36" stroke-width="4"/>
        <circle cx="100" cy="34" r="5" fill="#FFFFFF" stroke-width="3.2"/>
        <line x1="130" y1="54" x2="136" y2="36" stroke-width="4"/>
        <circle cx="136" cy="34" r="5" fill="#FFFFFF" stroke-width="3.2"/>
        <path d="M 94 68 L 76 62 C 74 74, 82 80, 92 78" fill="#FFFFFF" stroke-width="4"/>
        <path d="M 142 68 L 160 62 C 162 74, 154 80, 144 78" fill="#FFFFFF" stroke-width="4"/>
        <ellipse cx="118" cy="80" rx="28" ry="30" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="118" cy="96" rx="18" ry="12" fill="#FFFFFF" stroke-width="3.2"/>
        ${drawFaceFeatures(118, 72, face, 12)}
        <path d="M 110 100 Q 118 106, 126 100" fill="none" stroke-width="2.6"/>`;
      break;
    case "koala":
      headTop = 52;
      core = `
        <circle cx="72" cy="82" r="24" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="72" cy="82" r="12" fill="#FFFFFF" stroke-width="2.6"/>
        <circle cx="168" cy="82" r="24" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="168" cy="82" r="12" fill="#FFFFFF" stroke-width="2.6"/>
        <path d="M 88 134 C 72 158, 76 202, 102 206 L 138 206 C 164 202, 168 158, 152 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <ellipse cx="120" cy="174" rx="22" ry="22" fill="#FFFFFF" stroke-width="2.6"/>
        <ellipse cx="120" cy="94" rx="44" ry="38" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 88, face, 19)}
        <ellipse cx="120" cy="100" rx="10" ry="14" fill="#000000"/>
        <ellipse cx="117" cy="96" rx="2.5" ry="3.5" fill="#FFFFFF" stroke="none"/>
        <path d="M 112 118 Q 120 123, 128 118" fill="none" stroke-width="2.8"/>`;
      break;
    case "lion":
      headTop = 44;
      core = `
        <path d="M 148 182 C 178 180, 188 158, 180 144" fill="none" stroke-width="4.5"/>
        <path d="M 180 144 C 172 132, 186 124, 190 136 C 192 144, 184 148, 180 144 Z" fill="#FFFFFF" stroke-width="3.6"/>
        <path d="M 88 134 C 74 158, 76 202, 102 206 L 138 206 C 164 202, 164 158, 150 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <!-- Scalloped Fluffy Mane -->
        <path d="M 120 40 C 134 32, 150 42, 154 56 C 170 58, 178 74, 168 90 C 178 104, 168 122, 152 126 C 144 140, 128 144, 120 138 C 112 144, 96 140, 88 126 C 72 122, 62 104, 72 90 C 62 74, 70 58, 86 56 C 90 42, 106 32, 120 40 Z" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="90" cy="60" r="10" fill="#FFFFFF" stroke-width="3.8"/>
        <circle cx="150" cy="60" r="10" fill="#FFFFFF" stroke-width="3.8"/>
        <circle cx="120" cy="92" r="34" fill="#FFFFFF" stroke-width="4.2"/>
        ${drawFaceFeatures(120, 88, face, 14)}
        <polygon points="120,104 114,98 126,98" fill="#000000"/>
        <path d="M 110 110 Q 120 116, 130 110" fill="none" stroke-width="2.6"/>`;
      break;
    case "penguin":
      headTop = 48;
      core = `
        <path d="M 74 126 C 54 144, 52 172, 68 176 L 78 158" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 166 126 C 186 144, 188 172, 172 176 L 162 158" fill="#FFFFFF" stroke-width="4.8"/>
        <ellipse cx="120" cy="128" rx="48" ry="72" fill="#FFFFFF" stroke-width="5.2"/>
        <path d="M 84 118 C 80 156, 92 192, 120 192 C 148 192, 160 156, 156 118 C 142 108, 98 108, 84 118 Z" fill="#FFFFFF" stroke-width="3.4"/>
        ${drawFaceFeatures(120, 86, face, 17)}
        <polygon points="120,106 110,94 130,94" fill="#FFFFFF" stroke-width="3.6"/>
        <path d="M 88 198 L 76 208 L 104 208 Z M 152 198 L 164 208 L 136 208 Z" fill="#FFFFFF" stroke-width="4"/>`;
      break;
    case "hedgehog":
      headTop = 58;
      core = `
        <path d="M 60 154 L 46 140 L 58 124 L 44 106 L 60 92 L 56 72 L 76 68 L 84 48 L 104 54 L 120 40 L 136 54 L 156 48 L 164 68 L 184 72 L 180 92 L 196 106 L 182 124 L 194 140 L 180 154 C 174 188, 150 202, 120 202 C 90 202, 66 188, 60 154 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 78 134 C 76 92, 164 92, 162 134 C 162 172, 144 196, 120 196 C 96 196, 78 172, 78 134 Z" fill="#FFFFFF" stroke-width="4.4"/>
        ${drawFaceFeatures(120, 126, face, 16)}
        <circle cx="120" cy="140" r="5.5" fill="#000000"/>
        <path d="M 112 148 Q 120 154, 128 148" fill="none" stroke-width="2.6"/>`;
      break;
    case "owl":
      headTop = 50;
      core = `
        <path d="M 80 68 L 72 42 L 96 58 Q 120 52, 144 58 L 168 42 L 160 68 C 176 96, 174 162, 146 182 L 94 182 C 66 162, 64 96, 80 68 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 74 108 C 54 126, 56 158, 76 168" fill="#FFFFFF" stroke-width="4.6"/>
        <path d="M 166 108 C 186 126, 184 158, 164 168" fill="#FFFFFF" stroke-width="4.6"/>
        <circle cx="101" cy="92" r="19" fill="#FFFFFF" stroke-width="4.2"/>
        <circle cx="139" cy="92" r="19" fill="#FFFFFF" stroke-width="4.2"/>
        ${drawFaceFeatures(120, 92, face, 19)}
        <polygon points="120,100 113,112 127,112" fill="#FFFFFF" stroke-width="3.6"/>
        <path d="M 96 134 Q 108 142, 120 134 Q 132 142, 144 134 M 96 152 Q 108 160, 120 152 Q 132 160, 144 152" fill="none" stroke-width="2.8"/>
        <path d="M 102 182 L 96 196 M 108 182 L 106 196 M 138 182 L 144 196 M 132 182 L 134 196" fill="none" stroke-width="3.8"/>`;
      break;
    case "duckling":
      headTop = 50;
      core = `
        <path d="M 116 56 C 110 42, 122 36, 126 48 C 132 40, 138 48, 130 56" fill="#FFFFFF" stroke-width="3.6"/>
        <path d="M 80 128 C 60 144, 62 192, 102 196 L 144 196 C 178 192, 184 152, 166 132 C 156 124, 146 132, 146 132" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 104 148 C 122 144, 134 158, 124 174 C 114 182, 98 174, 104 148 Z" fill="#FFFFFF" stroke-width="3.6"/>
        <circle cx="112" cy="94" r="38" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(112, 88, face, 14)}
        <ellipse cx="144" cy="102" rx="18" ry="8" fill="#FFFFFF" stroke-width="4"/>
        <path d="M 104 196 L 96 208 L 114 208 M 136 196 L 128 208 L 148 208" fill="none" stroke-width="3.8"/>`;
      break;
    case "squirrel":
      headTop = 52;
      core = `
        <path d="M 142 182 C 194 182, 214 128, 188 86 C 172 62, 142 82, 152 114 C 158 134, 146 156, 136 168 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 176 98 C 188 122, 182 148, 164 166" fill="none" stroke-width="2.8"/>
        <path d="M 88 74 L 80 42 L 108 62 Z" fill="#FFFFFF" stroke-width="4.5"/>
        <path d="M 136 74 L 144 42 L 118 62 Z" fill="#FFFFFF" stroke-width="4.5"/>
        <path d="M 84 134 C 68 158, 72 202, 98 206 L 134 206 C 154 202, 156 158, 140 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="112" cy="94" r="38" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(112, 90, face, 15)}
        <ellipse cx="112" cy="102" rx="5" ry="3.5" fill="#000000"/>
        <path d="M 104 110 Q 112 116, 120 110" fill="none" stroke-width="2.6"/>`;
      break;
    case "deer":
      headTop = 48;
      core = `
        <path d="M 94 62 C 88 42, 76 32, 68 24 M 84 44 L 68 46" fill="none" stroke-width="4.2"/>
        <path d="M 146 62 C 152 42, 164 32, 172 24 M 156 44 L 172 46" fill="none" stroke-width="4.2"/>
        <path d="M 76 74 C 54 66, 48 84, 64 94 C 72 98, 80 90, 82 82 Z" fill="#FFFFFF" stroke-width="4.4"/>
        <path d="M 164 74 C 186 66, 192 84, 176 94 C 168 98, 160 90, 158 82 Z" fill="#FFFFFF" stroke-width="4.4"/>
        <path d="M 88 134 C 72 158, 76 202, 102 206 L 138 206 C 164 202, 164 158, 150 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <circle cx="102" cy="166" r="5.5" fill="#FFFFFF" stroke-width="2.4"/>
        <circle cx="136" cy="176" r="5" fill="#FFFFFF" stroke-width="2.4"/>
        <path d="M 80 88 C 78 56, 162 56, 160 88 C 162 116, 144 136, 120 136 C 96 136, 78 116, 80 88 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 88, face, 16)}
        <ellipse cx="120" cy="112" rx="18" ry="12" fill="#FFFFFF" stroke-width="3.2"/>
        <circle cx="120" cy="107" r="4.5" fill="#000000"/>
        <path d="M 112 118 Q 120 123, 128 118" fill="none" stroke-width="2.6"/>`;
      break;
  }

  return wrapSvg(
    drawSceneGround(ground) +
      core +
      scarfSvg +
      drawHeadGear(120, headTop, gear) +
      drawPropAccent(prop, 186, 134)
  );
}

// ---------- Kids & Play Organic Characters ----------
type KidRole =
  | "Explorer"
  | "Astronaut"
  | "Chef"
  | "Artist"
  | "Gardener"
  | "Soccer Star"
  | "Ballerina"
  | "Wizard"
  | "Fairy"
  | "Music Kid"
  | "Bookworm"
  | "Baker";

function drawKidCartoon(
  role: KidRole,
  face: FaceStyle,
  prop: PropKind,
  ground: SceneGround,
  hairMode: number
): string {
  const hairPaths = [
    `<path d="M 78 72 C 74 34, 166 34, 162 72 C 146 52, 94 52, 78 72 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
    `<circle cx="72" cy="64" r="14" fill="#FFFFFF" stroke-width="4"/><circle cx="168" cy="64" r="14" fill="#FFFFFF" stroke-width="4"/><path d="M 80 72 C 80 38, 160 38, 160 72 C 142 54, 98 54, 80 72 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
    `<path d="M 76 78 C 72 36, 168 36, 164 78 C 166 100, 158 112, 152 112 L 148 82 C 132 58, 108 58, 92 82 L 88 112 C 82 112, 74 100, 76 78 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
  ][hairMode % 3];

  let roleOutfit = "";
  let gear: HeadGear = "none";
  if (role === "Chef" || role === "Baker") gear = "chef-hat";
  else if (role === "Explorer" || role === "Gardener") gear = "explorer-hat";
  else if (role === "Fairy") gear = "flower-crown";
  else if (role === "Ballerina") gear = "bow";
  else if (role === "Wizard") gear = "party-hat";

  if (role === "Astronaut") {
    roleOutfit = `<circle cx="120" cy="76" r="46" fill="none" stroke-width="4.8"/><rect x="94" y="132" width="52" height="32" rx="6" fill="#FFFFFF" stroke-width="3.4"/>`;
  } else if (role === "Fairy") {
    roleOutfit = `
      <path d="M 88 124 C 44 96, 40 144, 78 156 Z" fill="#FFFFFF" stroke-width="4"/>
      <path d="M 152 124 C 196 96, 200 144, 162 156 Z" fill="#FFFFFF" stroke-width="4"/>`;
  } else if (role === "Soccer Star") {
    roleOutfit = `<circle cx="168" cy="196" r="16" fill="#FFFFFF" stroke-width="4"/><polygon points="168,188 174,193 171,200 165,200 162,193" fill="#000000"/>`;
  }

  return wrapSvg(
    drawSceneGround(ground) +
      roleOutfit +
      `<path d="M 86 124 L 54 104 C 46 98, 54 88, 62 94 L 90 116" fill="#FFFFFF" stroke-width="4.5"/>
       <path d="M 154 124 L 182 148 C 188 154, 178 164, 170 156 L 148 134" fill="#FFFFFF" stroke-width="4.5"/>
       <rect x="92" y="176" width="22" height="34" rx="8" fill="#FFFFFF" stroke-width="4.5"/>
       <rect x="126" y="176" width="22" height="34" rx="8" fill="#FFFFFF" stroke-width="4.5"/>
       <ellipse cx="100" cy="212" rx="15" ry="8" fill="#FFFFFF" stroke-width="4.5"/>
       <ellipse cx="140" cy="212" rx="15" ry="8" fill="#FFFFFF" stroke-width="4.5"/>
       <path d="M 86 116 L 154 116 L 160 180 L 80 180 Z" fill="#FFFFFF" stroke-width="4.8"/>
       <rect x="102" y="138" width="36" height="24" rx="5" fill="#FFFFFF" stroke-width="3.2"/>
       <circle cx="120" cy="78" r="38" fill="#FFFFFF" stroke-width="4.8"/>
       ${hairPaths}
       ${drawFaceFeatures(120, 80, face, 14)}
       <path d="M 110 96 Q 120 105, 130 96" fill="none" stroke-width="3.2"/>` +
      drawHeadGear(120, 42, gear) +
      drawPropAccent(prop, 50, 140)
  );
}

// ---------- Ocean & Sea Life ----------
type SeaCreature = "whale" | "dolphin" | "octopus" | "turtle" | "narwhal" | "crab" | "seahorse" | "jellyfish" | "mermaid" | "submarine";

function drawOceanCartoon(creature: SeaCreature, face: FaceStyle, gear: HeadGear, prop: PropKind): string {
  let body = "";
  let gearY = 58;
  switch (creature) {
    case "whale":
      gearY = 76;
      body = `
        <path d="M 118 76 C 114 54, 98 46, 92 54 M 126 76 C 132 54, 148 46, 154 54" fill="none" stroke-width="3.6"/>
        <path d="M 44 134 C 42 86, 174 82, 178 134 C 180 156, 198 164, 212 150 C 214 166, 200 176, 186 174 C 194 186, 184 198, 170 186 C 154 184, 52 184, 44 134 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 50 154 Q 106 168, 166 154" fill="none" stroke-width="3.4"/>
        ${drawFaceFeatures(94, 124, face, 14)}
        <path d="M 82 140 Q 94 148, 106 140" fill="none" stroke-width="3"/>`;
      break;
    case "dolphin":
      gearY = 52;
      body = `
        <path d="M 52 154 C 44 96, 118 50, 172 90 C 188 102, 204 106, 212 114 C 196 122, 182 124, 168 122 C 152 156, 112 178, 74 176 C 64 190, 52 198, 40 190 C 48 180, 50 170, 52 154 Z" fill="#FFFFFF" stroke-width="5"/>
        <path d="M 102 74 L 116 46 L 128 74" fill="#FFFFFF" stroke-width="4.4"/>
        ${drawFaceFeatures(152, 102, face, 10)}
        <path d="M 152 114 Q 162 120, 172 114" fill="none" stroke-width="2.6"/>`;
      break;
    case "octopus":
      gearY = 52;
      body = `
        <path d="M 74 138 C 52 156, 40 186, 56 196 C 68 200, 74 182, 82 168 C 86 188, 92 206, 106 202 C 114 196, 114 176, 120 166 C 126 176, 126 196, 134 202 C 148 206, 154 188, 158 168 C 166 182, 172 200, 184 196 C 200 186, 188 156, 166 138 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <circle cx="120" cy="100" r="46" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 100, face, 16)}
        <path d="M 110 116 Q 120 124, 130 116" fill="none" stroke-width="3"/>`;
      break;
    case "turtle":
      gearY = 66;
      body = `
        <ellipse cx="64" cy="106" rx="22" ry="12" transform="rotate(-30 64 106)" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="176" cy="106" rx="22" ry="12" transform="rotate(30 176 106)" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="74" cy="176" rx="18" ry="11" transform="rotate(30 74 176)" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="166" cy="176" rx="18" ry="11" transform="rotate(-30 166 176)" fill="#FFFFFF" stroke-width="4.5"/>
        <ellipse cx="120" cy="142" rx="50" ry="44" fill="#FFFFFF" stroke-width="5.2"/>
        <polygon points="120,114 140,128 134,154 106,154 100,128" fill="#FFFFFF" stroke-width="3.2"/>
        <circle cx="120" cy="78" r="24" fill="#FFFFFF" stroke-width="4.8"/>
        ${drawFaceFeatures(120, 76, face, 10)}
        <path d="M 114 88 Q 120 93, 126 88" fill="none" stroke-width="2.6"/>`;
      break;
    case "narwhal":
      gearY = 72;
      body = `
        <polygon points="172,116 218,86 182,130" fill="#FFFFFF" stroke-width="4.5"/>
        <line x1="186" y1="108" x2="192" y2="116" stroke-width="2.4"/><line x1="198" y1="100" x2="203" y2="107" stroke-width="2.4"/>
        <path d="M 46 138 C 46 86, 178 86, 178 138 C 178 174, 62 184, 46 138 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(136, 124, face, 14)}
        <path d="M 128 138 Q 136 144, 144 138" fill="none" stroke-width="2.8"/>`;
      break;
    case "crab":
      gearY = 66;
      body = `
        <path d="M 52 98 C 36 82, 40 60, 56 64 C 58 76, 66 80, 68 68 C 82 76, 76 100, 60 106" fill="#FFFFFF" stroke-width="4.6"/>
        <path d="M 188 98 C 204 82, 200 60, 184 64 C 182 76, 174 80, 172 68 C 158 76, 164 100, 180 106" fill="#FFFFFF" stroke-width="4.6"/>
        <path d="M 64 144 L 38 156 M 66 158 L 42 174 M 176 144 L 202 156 M 174 158 L 198 174" fill="none" stroke-width="4.5"/>
        <ellipse cx="120" cy="140" rx="58" ry="38" fill="#FFFFFF" stroke-width="5.2"/>
        ${drawFaceFeatures(120, 134, face, 18)}
        <path d="M 108 150 Q 120 158, 132 150" fill="none" stroke-width="3"/>`;
      break;
    case "seahorse":
      gearY = 44;
      body = `
        <path d="M 96 106 C 72 102, 74 138, 96 140" fill="#FFFFFF" stroke-width="4.2"/>
        <path d="M 124 60 C 148 60, 152 94, 134 106 C 154 128, 144 168, 120 184 C 102 194, 96 176, 108 168 C 118 162, 124 172, 118 178 C 102 162, 104 126, 116 108 L 116 98 L 154 96 L 154 84 L 118 84 C 116 68, 116 60, 124 60 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(126, 80, face, 6)}`;
      break;
    case "jellyfish":
      gearY = 50;
      body = `
        <path d="M 76 122 C 68 150, 82 176, 72 198 M 102 124 C 98 154, 110 180, 102 204 M 138 124 C 142 154, 130 180, 138 204 M 164 122 C 172 150, 158 176, 168 198" fill="none" stroke-width="4"/>
        <path d="M 60 116 C 60 54, 180 54, 180 116 Q 160 128, 140 118 Q 120 128, 100 118 Q 80 128, 60 116 Z" fill="#FFFFFF" stroke-width="5"/>
        ${drawFaceFeatures(120, 94, face, 16)}
        <path d="M 112 106 Q 120 112, 128 106" fill="none" stroke-width="2.8"/>`;
      break;
    case "mermaid":
      gearY = 44;
      body = `
        <path d="M 96 140 C 84 166, 98 192, 124 202 L 152 214 L 144 192 L 166 184 C 142 178, 136 156, 142 140 Z" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 98 110 L 142 110 L 142 140 L 98 140 Z" fill="#FFFFFF" stroke-width="4.6"/>
        <circle cx="120" cy="76" r="32" fill="#FFFFFF" stroke-width="4.8"/>
        <path d="M 86 76 C 80 42, 160 42, 154 76 C 166 100, 160 124, 148 128 C 146 102, 142 74, 120 64 C 98 74, 94 102, 92 128 C 80 124, 74 100, 86 76 Z" fill="#FFFFFF" stroke-width="4.4"/>
        ${drawFaceFeatures(120, 80, face, 12)}
        <path d="M 112 94 Q 120 100, 128 94" fill="none" stroke-width="2.8"/>`;
      break;
    case "submarine":
      gearY = 58;
      body = `
        <path d="M 120 76 L 120 50 L 138 50" fill="none" stroke-width="5"/>
        <rect x="92" y="76" width="56" height="28" rx="6" fill="#FFFFFF" stroke-width="4.8"/>
        <ellipse cx="120" cy="140" rx="76" ry="42" fill="#FFFFFF" stroke-width="5.2"/>
        <path d="M 30 126 L 44 140 L 30 154 Z" fill="#FFFFFF" stroke-width="4.4"/>
        <circle cx="88" cy="140" r="14" fill="#FFFFFF" stroke-width="4"/>
        <circle cx="124" cy="140" r="14" fill="#FFFFFF" stroke-width="4"/>
        <circle cx="160" cy="140" r="14" fill="#FFFFFF" stroke-width="4"/>`;
      break;
  }
  return wrapSvg(
    drawSceneGround("waves") +
      `<circle cx="48" cy="64" r="7" fill="#FFFFFF" stroke-width="2.8"/><circle cx="192" cy="72" r="5" fill="#FFFFFF" stroke-width="2.6"/>` +
      body +
      drawHeadGear(120, gearY, gear) +
      drawPropAccent(prop, 48, 124)
  );
}

// ---------- Fantasy, Dinosaurs, Vehicles, Homes, Garden, Botanical, Holiday Generators ----------
function drawFantasyCartoon(kind: number, face: FaceStyle, prop: PropKind): string {
  const shapes = [
    // 0: Baby Dragon
    `<path d="M 78 112 C 42 84, 38 134, 74 144 Z" fill="#FFFFFF" stroke-width="4.5"/>
     <path d="M 162 112 C 198 84, 202 134, 166 144 Z" fill="#FFFFFF" stroke-width="4.5"/>
     <path d="M 86 130 C 72 158, 76 198, 104 202 L 146 202 C 170 198, 174 156, 154 130 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 156 178 C 188 180, 204 162, 196 146 L 204 138 L 188 136" fill="none" stroke-width="4.6"/>
     <path d="M 96 60 L 88 38 L 108 52 M 144 60 L 152 38 L 132 52" fill="#FFFFFF" stroke-width="4"/>
     <ellipse cx="120" cy="90" rx="42" ry="36" fill="#FFFFFF" stroke-width="5"/>
     ${drawFaceFeatures(120, 88, face, 16)}
     <path d="M 110 104 Q 120 111, 130 104" fill="none" stroke-width="2.8"/>`,
    // 1: Unicorn
    `<path d="M 108 62 L 120 20 L 132 62 Z" fill="#FFFFFF" stroke-width="4.6"/>
     <line x1="114" y1="44" x2="126" y2="48" stroke-width="2.4"/>
     <path d="M 88 70 L 76 42 L 102 60 Z M 152 70 L 164 42 L 138 60 Z" fill="#FFFFFF" stroke-width="4.4"/>
     <path d="M 86 134 C 72 160, 76 202, 104 204 L 144 204 C 166 202, 168 158, 152 134 Z" fill="#FFFFFF" stroke-width="5"/>
     <ellipse cx="120" cy="96" rx="40" ry="36" fill="#FFFFFF" stroke-width="5"/>
     <ellipse cx="120" cy="112" rx="22" ry="14" fill="#FFFFFF" stroke-width="3.2"/>
     ${drawFaceFeatures(120, 88, face, 16)}
     <path d="M 112 114 Q 120 120, 128 114" fill="none" stroke-width="2.6"/>`,
    // 2: Friendly Monster
    `<path d="M 76 110 C 66 56, 174 56, 164 110 C 178 148, 166 198, 138 202 L 136 184 L 104 184 L 102 202 C 74 198, 62 148, 76 110 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 92 64 L 82 36 L 104 56 Z M 148 64 L 158 36 L 136 56 Z" fill="#FFFFFF" stroke-width="4.4"/>
     ${drawFaceFeatures(120, 106, face, 18)}
     <path d="M 102 128 Q 120 144, 138 128 Z" fill="#FFFFFF" stroke-width="3.6"/>
     <polygon points="110,130 115,137 120,130" fill="#FFFFFF" stroke-width="2.4"/>`,
    // 3: Magic Potion & Sparkles
    `<rect x="104" y="42" width="32" height="22" rx="5" fill="#FFFFFF" stroke-width="4.5"/>
     <rect x="96" y="64" width="48" height="16" rx="6" fill="#FFFFFF" stroke-width="4.6"/>
     <circle cx="120" cy="138" r="56" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 72 138 Q 96 126, 120 138 Q 144 150, 168 138" fill="none" stroke-width="3.6"/>
     ${drawFaceFeatures(120, 122, face, 16)}
     <polygon points="120,148 124,156 132,157 126,162 128,170 120,166 112,170 114,162 108,157 116,156" fill="#FFFFFF" stroke-width="2.8"/>`,
    // 4: Gnome by Toadstool
    `<path d="M 120 26 L 82 96 Q 120 106, 158 96 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 86 106 C 74 140, 88 186, 120 192 C 152 186, 166 140, 154 106 Z" fill="#FFFFFF" stroke-width="4.8"/>
     <circle cx="120" cy="108" r="10" fill="#FFFFFF" stroke-width="3.8"/>
     ${drawFaceFeatures(120, 96, face, 14)}
     <ellipse cx="96" cy="196" rx="16" ry="9" fill="#FFFFFF" stroke-width="4.2"/>
     <ellipse cx="144" cy="196" rx="16" ry="9" fill="#FFFFFF" stroke-width="4.2"/>`,
  ];
  return wrapSvg(drawSceneGround("sparkles") + shapes[kind % shapes.length] + drawPropAccent(prop, 188, 122));
}

function drawDinoCartoon(kind: number, face: FaceStyle, gear: HeadGear, prop: PropKind): string {
  const shapes = [
    // 0: Long-neck Brachiosaurus
    `<path d="M 118 56 C 118 30, 168 30, 174 58 C 178 78, 160 92, 146 92 C 152 122, 154 158, 138 190 L 112 190 L 112 168 L 88 168 L 88 190 L 62 190 C 46 174, 24 166, 18 152 C 38 152, 54 142, 62 118 C 72 90, 114 84, 118 56 Z" fill="#FFFFFF" stroke-width="5"/>
     <circle cx="90" cy="132" r="8" fill="#FFFFFF" stroke-width="2.8"/>
     ${drawFaceFeatures(148, 54, face, 9)}
     <path d="M 142 72 Q 154 78, 164 70" fill="none" stroke-width="2.8"/>`,
    // 1: Stegosaurus
    `<path d="M 68 96 L 78 72 L 94 90 L 114 66 L 130 90 L 148 74 L 154 98" fill="#FFFFFF" stroke-width="4.2"/>
     <path d="M 42 144 C 52 98, 168 94, 184 134 C 194 156, 176 172, 156 170 L 154 196 L 130 196 L 128 172 L 96 172 L 94 196 L 70 196 L 68 168 C 48 168, 32 160, 42 144 Z" fill="#FFFFFF" stroke-width="5"/>
     ${drawFaceFeatures(168, 130, face, 8)}
     <path d="M 164 146 Q 174 152, 182 144" fill="none" stroke-width="2.6"/>`,
    // 2: Triceratops
    `<path d="M 134 86 C 148 58, 182 64, 176 98 L 194 92 L 184 106 L 198 112" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 46 144 C 54 102, 136 96, 176 124 C 192 138, 186 168, 158 170 L 156 196 L 132 196 L 130 172 L 96 172 L 94 196 L 70 196 L 68 166 C 48 168, 36 158, 46 144 Z" fill="#FFFFFF" stroke-width="5"/>
     ${drawFaceFeatures(158, 126, face, 8)}
     <path d="M 156 142 Q 166 148, 174 140" fill="none" stroke-width="2.6"/>`,
    // 3: T-Rex Cub
    `<path d="M 88 120 L 76 104 L 96 106 L 94 86 L 114 96" fill="#FFFFFF" stroke-width="4"/>
     <path d="M 102 68 C 102 38, 174 38, 178 72 C 180 96, 156 108, 138 108 L 146 166 L 140 196 L 114 196 L 114 174 L 92 174 L 92 196 L 68 196 C 46 178, 28 166, 24 150 C 48 152, 66 142, 74 120 C 82 96, 102 92, 102 68 Z" fill="#FFFFFF" stroke-width="5"/>
     ${drawFaceFeatures(146, 66, face, 10)}
     <path d="M 142 86 Q 158 92, 172 84" fill="none" stroke-width="2.8"/>`,
    // 4: Egg Hatchling Dino
    `<path d="M 78 66 C 88 30, 152 30, 162 66 L 146 56 L 132 70 L 120 54 L 108 70 L 94 56 Z" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 76 118 C 76 70, 164 70, 164 118 Z" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(120, 96, face, 14)}
     <path d="M 64 118 L 82 134 L 100 116 L 120 136 L 140 116 L 158 134 L 176 118 C 178 168, 154 202, 120 202 C 86 202, 62 168, 64 118 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <circle cx="96" cy="162" r="9" fill="#FFFFFF" stroke-width="3"/>
     <circle cx="142" cy="170" r="10" fill="#FFFFFF" stroke-width="3"/>`,
  ];
  return wrapSvg(drawSceneGround("meadow") + shapes[kind % shapes.length] + drawHeadGear(144, 34, gear) + drawPropAccent(prop, 46, 114));
}

function drawVehicleCartoon(kind: number, ground: SceneGround): string {
  const shapes = [
    // 0: Steam Train
    `<path d="M 176 74 C 164 70, 162 52, 176 48 C 180 32, 208 30, 214 46 C 228 50, 224 74, 206 74 Z" fill="#FFFFFF" stroke-width="4"/>
     <path d="M 164 106 L 158 80 L 188 80 L 182 106 Z" fill="#FFFFFF" stroke-width="4.5"/>
     <rect x="88" y="106" width="112" height="58" rx="8" fill="#FFFFFF" stroke-width="5"/>
     <rect x="34" y="68" width="60" height="96" rx="5" fill="#FFFFFF" stroke-width="5"/>
     <rect x="46" y="80" width="34" height="28" rx="3" fill="#FFFFFF" stroke-width="3.6"/>
     <circle cx="64" cy="172" r="22" fill="#FFFFFF" stroke-width="5"/><circle cx="128" cy="176" r="16" fill="#FFFFFF" stroke-width="4.8"/><circle cx="174" cy="176" r="16" fill="#FFFFFF" stroke-width="4.8"/>`,
    // 1: Hot Air Balloon
    `<line x1="88" y1="154" x2="94" y2="182" stroke-width="3.2"/><line x1="152" y1="154" x2="146" y2="182" stroke-width="3.2"/>
     <path d="M 120 26 C 166 26, 190 66, 176 106 C 166 132, 146 144, 140 154 L 100 154 C 94 144, 74 132, 64 106 C 50 66, 74 26, 120 26 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 120 26 L 120 154 M 120 26 C 90 48, 86 110, 106 154 M 120 26 C 150 48, 154 110, 134 154" fill="none" stroke-width="3.2"/>
     <rect x="96" y="182" width="48" height="30" rx="5" fill="#FFFFFF" stroke-width="4.8"/>`,
    // 2: Space Rocket
    `<g transform="rotate(22 120 120)">
       <path d="M 88 130 L 62 162 L 88 158 Z M 152 130 L 178 162 L 152 158 Z" fill="#FFFFFF" stroke-width="4.6"/>
       <path d="M 102 162 C 98 184, 114 198, 120 204 C 126 198, 142 184, 138 162 Z" fill="#FFFFFF" stroke-width="4.2"/>
       <path d="M 120 30 C 150 60, 156 108, 148 162 L 92 162 C 84 108, 90 60, 120 30 Z" fill="#FFFFFF" stroke-width="5.2"/>
       <circle cx="120" cy="102" r="18" fill="#FFFFFF" stroke-width="4.5"/>
     </g>`,
    // 3: School Bus / Camper Van
    `<rect x="36" y="78" width="168" height="86" rx="18" fill="#FFFFFF" stroke-width="5.2"/>
     <rect x="52" y="94" width="36" height="32" rx="4" fill="#FFFFFF" stroke-width="3.6"/>
     <rect x="98" y="94" width="36" height="32" rx="4" fill="#FFFFFF" stroke-width="3.6"/>
     <rect x="144" y="94" width="44" height="32" rx="4" fill="#FFFFFF" stroke-width="3.6"/>
     <circle cx="76" cy="170" r="20" fill="#FFFFFF" stroke-width="5"/><circle cx="76" cy="170" r="7" fill="#FFFFFF" stroke-width="3"/>
     <circle cx="164" cy="170" r="20" fill="#FFFFFF" stroke-width="5"/><circle cx="164" cy="170" r="7" fill="#FFFFFF" stroke-width="3"/>`,
    // 4: Cute UFO & Alien
    `<path d="M 88 106 C 88 64, 152 64, 152 106 Z" fill="#FFFFFF" stroke-width="4.8"/>
     <circle cx="120" cy="86" r="14" fill="#FFFFFF" stroke-width="3.4"/>
     <circle cx="115" cy="84" r="2.5" fill="#000000"/><circle cx="125" cy="84" r="2.5" fill="#000000"/>
     <ellipse cx="120" cy="118" rx="76" ry="24" fill="#FFFFFF" stroke-width="5.2"/>
     <circle cx="74" cy="118" r="6" fill="#FFFFFF" stroke-width="3"/><circle cx="120" cy="124" r="6" fill="#FFFFFF" stroke-width="3"/><circle cx="166" cy="118" r="6" fill="#FFFFFF" stroke-width="3"/>
     <path d="M 96 142 L 74 196 M 144 142 L 166 196" fill="none" stroke-width="2.8" stroke-dasharray="5 5"/>`,
    // 5: Sailboat
    `<line x1="120" y1="36" x2="120" y2="146" stroke-width="4.5"/>
     <polygon points="120,40 120,134 52,134" fill="#FFFFFF" stroke-width="4.6"/>
     <polygon points="126,52 178,134 126,134" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 42 146 L 198 146 L 176 184 L 64 184 Z" fill="#FFFFFF" stroke-width="5.2"/>`,
  ];
  return wrapSvg(drawSceneGround(ground) + shapes[kind % shapes.length]);
}

function drawHomeCartoon(kind: number, ground: SceneGround): string {
  const shapes = [
    // 0: Storybook Cottage
    `<rect x="156" y="44" width="22" height="42" fill="#FFFFFF" stroke-width="4.6"/>
     <rect x="52" y="106" width="136" height="92" rx="6" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 32 112 C 66 76, 94 50, 120 38 C 146 50, 174 76, 208 112 Q 120 96, 32 112 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 102 198 L 102 152 C 102 134, 138 134, 138 152 L 138 198 Z" fill="#FFFFFF" stroke-width="4.6"/>
     <circle cx="76" cy="144" r="15" fill="#FFFFFF" stroke-width="3.8"/><circle cx="164" cy="144" r="15" fill="#FFFFFF" stroke-width="3.8"/>`,
    // 1: Mushroom House
    `<path d="M 80 116 L 72 194 Q 120 204, 168 194 L 160 116 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 32 120 C 32 48, 208 48, 208 120 Q 120 132, 32 120 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <circle cx="78" cy="84" r="14" fill="#FFFFFF" stroke-width="3.8"/><circle cx="144" cy="74" r="12" fill="#FFFFFF" stroke-width="3.8"/><circle cx="168" cy="102" r="9" fill="#FFFFFF" stroke-width="3.5"/>
     <path d="M 102 196 L 102 152 C 102 134, 138 134, 138 152 L 138 196 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
    // 2: Fairytale Castle
    `<rect x="94" y="84" width="52" height="114" fill="#FFFFFF" stroke-width="4.8"/><polygon points="88,84 120,38 152,84" fill="#FFFFFF" stroke-width="4.8"/>
     <rect x="42" y="108" width="38" height="90" fill="#FFFFFF" stroke-width="4.8"/><polygon points="36,108 61,60 86,108" fill="#FFFFFF" stroke-width="4.8"/>
     <rect x="160" y="108" width="38" height="90" fill="#FFFFFF" stroke-width="4.8"/><polygon points="154,108 179,60 204,108" fill="#FFFFFF" stroke-width="4.8"/>
     <path d="M 102 198 L 102 162 C 102 146, 138 146, 138 162 L 138 198 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
    // 3: Coastal Lighthouse
    `<path d="M 90 198 L 100 84 L 140 84 L 150 198 Z" fill="#FFFFFF" stroke-width="5"/>
     <line x1="96" y1="120" x2="144" y2="120" stroke-width="3.6"/><line x1="93" y1="158" x2="147" y2="158" stroke-width="3.6"/>
     <rect x="94" y="60" width="52" height="24" rx="4" fill="#FFFFFF" stroke-width="4.6"/>
     <polygon points="88,60 120,34 152,60" fill="#FFFFFF" stroke-width="4.8"/>
     <path d="M 156 68 L 204 52 M 156 76 L 204 92 M 84 68 L 36 52 M 84 76 L 36 92" fill="none" stroke-width="3"/>`,
    // 4: Treehouse Canopy
    `<path d="M 96 200 L 104 128 L 136 128 L 144 200" fill="#FFFFFF" stroke-width="5"/>
     <circle cx="80" cy="84" r="40" fill="#FFFFFF" stroke-width="4.8"/><circle cx="160" cy="84" r="40" fill="#FFFFFF" stroke-width="4.8"/><circle cx="120" cy="64" r="44" fill="#FFFFFF" stroke-width="4.8"/>
     <rect x="92" y="82" width="56" height="46" rx="4" fill="#FFFFFF" stroke-width="4.6"/>
     <polygon points="86,82 120,56 154,82" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 110 128 L 110 106 L 130 106 L 130 128" fill="#FFFFFF" stroke-width="3.4"/>`,
  ];
  return wrapSvg(drawSceneGround(ground) + shapes[kind % shapes.length]);
}

function drawGardenNatureCartoon(kind: number, face: FaceStyle, ground: SceneGround): string {
  const shapes = [
    // 0: Lacewing Butterfly
    `<path d="M 114 102 C 80 42, 26 42, 30 92 C 32 118, 74 126, 112 114 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 126 102 C 160 42, 214 42, 210 92 C 208 118, 166 126, 128 114 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 112 118 C 76 126, 46 156, 64 176 C 80 192, 110 164, 114 130 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 128 118 C 164 126, 194 156, 176 176 C 160 192, 130 164, 126 130 Z" fill="#FFFFFF" stroke-width="5"/>
     <circle cx="72" cy="86" r="14" fill="#FFFFFF" stroke-width="3.2"/><circle cx="168" cy="86" r="14" fill="#FFFFFF" stroke-width="3.2"/>
     <ellipse cx="120" cy="118" rx="9" ry="34" fill="#FFFFFF" stroke-width="4.6"/>
     <circle cx="120" cy="78" r="10" fill="#FFFFFF" stroke-width="4.6"/>`,
    // 1: Happy Garden Snail
    `<path d="M 32 174 C 58 152, 116 152, 156 148 C 170 122, 188 114, 202 122 C 214 130, 214 152, 198 164 C 176 182, 88 184, 32 174 Z" fill="#FFFFFF" stroke-width="5"/>
     <circle cx="104" cy="120" r="50" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 104 120 C 104 106, 120 106, 120 120 C 120 140, 88 142, 84 120 C 80 90, 124 82, 136 110" fill="none" stroke-width="4"/>
     <path d="M 190 120 L 184 86 M 202 124 L 208 90" fill="none" stroke-width="3.6"/>
     ${drawFaceFeatures(196, 86, face, 12)}`,
    // 2: Smiling Sunflower
    `<path d="M 120 122 Q 118 166, 120 206" fill="none" stroke-width="5.5"/>
     <path d="M 120 166 C 84 148, 66 164, 82 182 C 94 190, 108 180, 120 166 Z" fill="#FFFFFF" stroke-width="4.4"/>
     <path d="M 120 156 C 156 138, 174 154, 158 172 C 146 180, 132 170, 120 156 Z" fill="#FFFFFF" stroke-width="4.4"/>
     <g transform="translate(120 88)">
       ${[0, 36, 72, 108, 144, 180, 216, 252, 288, 324]
         .map((a) => `<ellipse cx="0" cy="-42" rx="11" ry="22" transform="rotate(${a})" fill="#FFFFFF" stroke-width="4"/>`)
         .join("")}
       <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke-width="5"/>
       ${drawFaceFeatures(0, -4, face, 10)}
       <path d="M -8 10 Q 0 16, 8 10" fill="none" stroke-width="2.8"/>
     </g>`,
    // 3: Pond Frog on Lilypad
    `<ellipse cx="120" cy="184" rx="74" ry="18" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 80 128 C 64 150, 72 180, 120 180 C 168 180, 176 150, 160 128 Z" fill="#FFFFFF" stroke-width="5"/>
     <circle cx="94" cy="84" r="18" fill="#FFFFFF" stroke-width="4.6"/><circle cx="146" cy="84" r="18" fill="#FFFFFF" stroke-width="4.6"/>
     <ellipse cx="120" cy="112" rx="44" ry="26" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(120, 84, face, 26)}
     <path d="M 104 114 Q 120 124, 136 114" fill="none" stroke-width="3"/>`,
    // 4: Spotted Ladybug
    `<path d="M 102 62 L 94 42 M 138 62 L 146 42" fill="none" stroke-width="3.6"/>
     <ellipse cx="120" cy="134" rx="58" ry="52" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 86 92 C 88 58, 152 58, 154 92 Z" fill="#FFFFFF" stroke-width="4.8"/>
     <line x1="120" y1="92" x2="120" y2="186" stroke-width="4"/>
     <circle cx="94" cy="126" r="9" fill="#FFFFFF" stroke-width="3.4"/><circle cx="146" cy="126" r="9" fill="#FFFFFF" stroke-width="3.4"/>
     <circle cx="100" cy="156" r="7" fill="#FFFFFF" stroke-width="3.2"/><circle cx="140" cy="156" r="7" fill="#FFFFFF" stroke-width="3.2"/>
     ${drawFaceFeatures(120, 76, face, 12)}`,
    // 5: Cozy Cactus in Pot
    `<path d="M 120 42 C 142 42, 146 92, 142 132 L 98 132 C 94 92, 98 42, 120 42 Z" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 98 92 C 74 92, 70 72, 82 64 C 90 64, 92 78, 98 82" fill="#FFFFFF" stroke-width="4.4"/>
     <path d="M 142 98 C 166 98, 170 78, 158 70 C 150 70, 148 84, 142 88" fill="#FFFFFF" stroke-width="4.4"/>
     <path d="M 76 132 L 164 132 L 154 198 L 86 198 Z" fill="#FFFFFF" stroke-width="5"/>
     <rect x="70" y="122" width="100" height="16" rx="4" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(120, 88, face, 10)}`,
  ];
  return wrapSvg(drawSceneGround(ground) + shapes[kind % shapes.length]);
}

function drawHolidayCartoon(kind: number, face: FaceStyle, prop: PropKind): string {
  const shapes = [
    // 0: Jolly Snowman
    `<circle cx="120" cy="152" r="46" fill="#FFFFFF" stroke-width="5.2"/>
     <circle cx="120" cy="92" r="34" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 86 64 L 154 64 M 96 64 L 100 32 L 140 32 L 144 64 Z" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(120, 88, face, 13)}
     <polygon points="120,96 144,101 120,106" fill="#FFFFFF" stroke-width="3.2"/>
     <path d="M 90 116 Q 120 128, 150 116 L 152 130 Q 120 142, 88 130 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
    // 1: Gingerbread House
    `<rect x="52" y="106" width="136" height="92" rx="6" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 32 114 L 120 42 L 208 114 C 194 126, 178 122, 166 110 C 152 126, 134 122, 120 110 C 106 122, 88 126, 74 110 C 62 122, 46 126, 32 114 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 102 198 L 102 152 C 102 134, 138 134, 138 152 L 138 198 Z" fill="#FFFFFF" stroke-width="4.5"/>
     <circle cx="120" cy="82" r="11" fill="#FFFFFF" stroke-width="3.8"/>`,
    // 2: Easter Bunny & Egg
    `<ellipse cx="152" cy="164" rx="34" ry="42" fill="#FFFFFF" stroke-width="5"/>
     <path d="M 122 154 L 136 164 L 152 154 L 166 164 L 182 154" fill="none" stroke-width="3.2"/>
     <path d="M 78 68 C 68 28, 52 28, 52 52 C 52 70, 68 82, 76 76" fill="#FFFFFF" stroke-width="4.6"/>
     <path d="M 110 68 C 120 28, 136 28, 136 52 C 136 70, 120 82, 112 76" fill="#FFFFFF" stroke-width="4.6"/>
     <circle cx="94" cy="96" r="34" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(94, 94, face, 13)}
     <path d="M 68 130 C 56 154, 60 198, 88 202 L 118 202 C 128 190, 124 152, 114 130 Z" fill="#FFFFFF" stroke-width="4.8"/>`,
    // 3: Happy Birthday Cake
    `<path d="M 120 34 C 110 46, 116 56, 120 56 C 124 56, 130 46, 120 34 Z" fill="#FFFFFF" stroke-width="3.6"/>
     <rect x="114" y="58" width="12" height="28" rx="3" fill="#FFFFFF" stroke-width="4"/>
     <path d="M 56 130 L 184 130 L 184 196 Q 120 206, 56 196 Z" fill="#FFFFFF" stroke-width="5.2"/>
     <path d="M 56 130 C 56 100, 184 100, 184 130 Q 168 144, 152 132 Q 136 146, 120 132 Q 104 146, 88 132 Q 72 144, 56 130 Z" fill="#FFFFFF" stroke-width="4.8"/>
     ${drawFaceFeatures(120, 166, face, 18)}
     <path d="M 110 180 Q 120 188, 130 180" fill="none" stroke-width="3"/>`,
    // 4: Friendly Ghost & Pumpkin
    `<path d="M 120 42 C 156 42, 166 78, 166 130 L 176 176 L 154 164 L 138 180 L 120 164 L 102 180 L 86 164 L 64 176 L 74 130 C 74 78, 84 42, 120 42 Z" fill="#FFFFFF" stroke-width="5"/>
     ${drawFaceFeatures(120, 96, face, 15)}
     <path d="M 112 114 Q 120 122, 128 114" fill="none" stroke-width="3"/>
     <ellipse cx="176" cy="176" rx="30" ry="22" fill="#FFFFFF" stroke-width="4.5"/>
     <path d="M 176 154 L 176 144" fill="none" stroke-width="4"/>`,
  ];
  return wrapSvg(drawSceneGround("sparkles") + shapes[kind % shapes.length] + drawPropAccent(prop, 46, 118));
}

// ---------- Build 545 Distinct, Richly Named Storybook Cartoons ----------
export function buildCartoonStudioPack(): LazyCatalogAsset[] {
  const list: LazyCatalogAsset[] = [];

  // 1. Cute Baby & Woodland Animals (16 species x 5 curated combinations = 80 cartoons)
  const animalList: { species: AnimalSpecies; name: string }[] = [
    { species: "bunny", name: "Bunny" },
    { species: "bear", name: "Bear Cub" },
    { species: "fox", name: "Red Fox" },
    { species: "panda", name: "Panda" },
    { species: "kitten", name: "Kitten" },
    { species: "puppy", name: "Puppy" },
    { species: "elephant", name: "Baby Elephant" },
    { species: "giraffe", name: "Baby Giraffe" },
    { species: "koala", name: "Koala" },
    { species: "lion", name: "Lion Cub" },
    { species: "penguin", name: "Penguin" },
    { species: "hedgehog", name: "Hedgehog" },
    { species: "owl", name: "Little Owl" },
    { species: "duckling", name: "Duckling" },
    { species: "squirrel", name: "Squirrel" },
    { species: "deer", name: "Forest Fawn" },
  ];
  const animalScenarios: {
    suffix: string;
    face: FaceStyle;
    gear: HeadGear;
    prop: PropKind;
    ground: SceneGround;
    scarf: boolean;
  }[] = [
    { suffix: "with Balloon", face: "glossy", gear: "none", prop: "balloon", ground: "meadow", scarf: false },
    { suffix: "Reading Book", face: "sweet-smile", gear: "beanie", prop: "book", ground: "none", scarf: true },
    { suffix: "Flower Crown", face: "happy-wink", gear: "flower-crown", prop: "flower", ground: "meadow", scarf: false },
    { suffix: "Cozy Cocoa", face: "sleepy", gear: "none", prop: "cup", ground: "sparkles", scarf: true },
    { suffix: "Party Star", face: "giggle", gear: "party-hat", prop: "gift", ground: "sparkles", scarf: false },
  ];
  for (const a of animalList) {
    animalScenarios.forEach((sc, idx) => {
      list.push({
        id: `c-animal-${a.species}-${idx}`,
        label: `${a.name} ${sc.suffix}`,
        mode: "cartoon",
        category: "animals",
        keywords: `animal ${a.name.toLowerCase()} ${sc.suffix.toLowerCase()} cute woodland`,
        aspectRatio: 1,
        defaultWidthPct: 26,
        getSvg: () => drawAnimalBody(a.species, sc.face, sc.gear, sc.prop, sc.ground, sc.scarf),
      });
    });
  }

  // 2. Kids, Professions & Play (12 roles x 5 scenes = 60 cartoons)
  const kidRoles: KidRole[] = [
    "Explorer", "Astronaut", "Chef", "Artist", "Gardener", "Soccer Star",
    "Ballerina", "Wizard", "Fairy", "Music Kid", "Bookworm", "Baker",
  ];
  const kidScenes: { labelSuffix: string; face: FaceStyle; prop: PropKind; ground: SceneGround }[] = [
    { labelSuffix: "Smiling", face: "glossy", prop: "none", ground: "meadow" },
    { labelSuffix: "with Star", face: "happy-wink", prop: "star", ground: "sparkles" },
    { labelSuffix: "Creative Play", face: "sweet-smile", prop: "paint", ground: "clouds" },
    { labelSuffix: "Music Joy", face: "giggle", prop: "music", ground: "sparkles" },
    { labelSuffix: "Story Time", face: "cool-shades", prop: "book", ground: "meadow" },
  ];
  kidRoles.forEach((role, rIdx) => {
    kidScenes.forEach((sc, sIdx) => {
      list.push({
        id: `c-kid-${rIdx}-${sIdx}`,
        label: `${role} (${sc.labelSuffix})`,
        mode: "cartoon",
        category: "kids-play",
        keywords: `kid child people ${role.toLowerCase()} ${sc.labelSuffix.toLowerCase()}`,
        aspectRatio: 1,
        defaultWidthPct: 25,
        getSvg: () => drawKidCartoon(role, sc.face, sc.prop, sc.ground, rIdx + sIdx),
      });
    });
  });

  // 3. Ocean & Sea Life (10 creatures x 5 variations = 50 cartoons)
  const seaList: { creature: SeaCreature; name: string }[] = [
    { creature: "whale", name: "Happy Whale" },
    { creature: "dolphin", name: "Leaping Dolphin" },
    { creature: "octopus", name: "Cute Octopus" },
    { creature: "turtle", name: "Sea Turtle" },
    { creature: "narwhal", name: "Baby Narwhal" },
    { creature: "crab", name: "Smiling Crab" },
    { creature: "seahorse", name: "Seahorse" },
    { creature: "jellyfish", name: "Jellyfish" },
    { creature: "mermaid", name: "Little Mermaid" },
    { creature: "submarine", name: "Ocean Explorer Sub" },
  ];
  const seaMods: { suffix: string; face: FaceStyle; gear: HeadGear; prop: PropKind }[] = [
    { suffix: "on Waves", face: "glossy", gear: "none", prop: "none" },
    { suffix: "Sea Crown", face: "sweet-smile", gear: "crown", prop: "star" },
    { suffix: "Bubble Play", face: "happy-wink", gear: "bow", prop: "heart" },
    { suffix: "Cool Shades", face: "cool-shades", gear: "none", prop: "music" },
    { suffix: "Party Reef", face: "giggle", gear: "party-hat", prop: "balloon" },
  ];
  for (const s of seaList) {
    seaMods.forEach((m, idx) => {
      list.push({
        id: `c-ocean-${s.creature}-${idx}`,
        label: `${s.name} ${m.suffix}`,
        mode: "cartoon",
        category: "ocean",
        keywords: `ocean sea water ${s.name.toLowerCase()} ${m.suffix.toLowerCase()}`,
        aspectRatio: 1,
        defaultWidthPct: 26,
        getSvg: () => drawOceanCartoon(s.creature, m.face, m.gear, m.prop),
      });
    });
  }

  // 4. Fantasy & Fairy Tales (55 cartoons)
  const fantasyNames = [
    "Baby Winged Dragon", "Magical Unicorn", "Fluffy Friendly Monster", "Enchanted Potion", "Toadstool Gnome",
  ];
  const fantasyMods: { suffix: string; face: FaceStyle; prop: PropKind }[] = [
    { suffix: "Starry Magic", face: "glossy", prop: "star" },
    { suffix: "Spellbook", face: "sweet-smile", prop: "book" },
    { suffix: "Heart Charm", face: "happy-wink", prop: "heart" },
    { suffix: "Butterfly Friend", face: "giggle", prop: "butterfly" },
    { suffix: "Sparkle Dream", face: "sleepy", prop: "flower" },
    { suffix: "Party Quest", face: "glossy", prop: "balloon" },
    { suffix: "Rainbow Song", face: "happy-wink", prop: "music" },
    { suffix: "Cozy Tea", face: "sweet-smile", prop: "cup" },
    { suffix: "Paint Magic", face: "giggle", prop: "paint" },
    { suffix: "Gift Surprise", face: "glossy", prop: "gift" },
    { suffix: "Rainy Magic", face: "cool-shades", prop: "umbrella" },
  ];
  fantasyNames.forEach((fname, fIdx) => {
    fantasyMods.forEach((fm, mIdx) => {
      list.push({
        id: `c-fantasy-${fIdx}-${mIdx}`,
        label: `${fname} · ${fm.suffix}`,
        mode: "cartoon",
        category: "fantasy",
        keywords: `fantasy fairy magic ${fname.toLowerCase()} ${fm.suffix.toLowerCase()}`,
        aspectRatio: 1,
        defaultWidthPct: 26,
        getSvg: () => drawFantasyCartoon(fIdx, fm.face, fm.prop),
      });
    });
  });

  // 5. Dinosaurs & Prehistoric (45 cartoons)
  const dinoNames = ["Brachiosaurus", "Stegosaurus", "Triceratops", "T-Rex Cub", "Dino Hatchling"];
  const dinoGears: HeadGear[] = ["none", "party-hat", "flower-crown", "crown", "beanie", "explorer-hat", "bow", "chef-hat", "none"];
  const dinoProps: PropKind[] = ["none", "balloon", "flower", "star", "book", "heart", "music", "cup", "gift"];
  const dinoFaces: FaceStyle[] = ["glossy", "happy-wink", "sweet-smile", "giggle", "cool-shades", "sleepy", "glossy", "happy-wink", "sweet-smile"];
  dinoNames.forEach((dname, dIdx) => {
    for (let i = 0; i < 9; i++) {
      list.push({
        id: `c-dino-${dIdx}-${i}`,
        label: `${dname} #${i + 1}`,
        mode: "cartoon",
        category: "dinosaurs",
        keywords: `dino dinosaur prehistoric ${dname.toLowerCase()}`,
        aspectRatio: 1,
        defaultWidthPct: 26,
        getSvg: () => drawDinoCartoon(dIdx, dinoFaces[i], dinoGears[i], dinoProps[i]),
      });
    }
  });

  // 6. Vehicles & Space (55 cartoons)
  const vehicleNames = [
    "Choo-Choo Train", "Hot Air Balloon", "Space Rocket", "Adventure Van", "Alien UFO", "Ocean Sailboat",
  ];
  const vehicleGrounds: SceneGround[] = ["clouds", "meadow", "sparkles", "waves", "none"];
  for (let i = 0; i < 55; i++) {
    const vIdx = i % vehicleNames.length;
    const gIdx = Math.floor(i / vehicleNames.length) % vehicleGrounds.length;
    const sceneLabel = ["Sky", "Meadow", "Starlight", "Sea", "Classic"][gIdx];
    const edition = Math.floor(i / 30) + 1;
    list.push({
      id: `c-vehicle-${i}`,
      label: `${vehicleNames[vIdx]} (${sceneLabel}${edition > 1 ? ` ${edition}` : ""})`,
      mode: "cartoon",
      category: "vehicles-space",
      keywords: `vehicle transport space ${vehicleNames[vIdx].toLowerCase()} ${sceneLabel.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 26,
      getSvg: () => drawVehicleCartoon(vIdx, vehicleGrounds[gIdx]),
    });
  }

  // 7. Cozy Homes, Castles & Places (50 cartoons)
  const homeNames = [
    "Storybook Cottage", "Fairy Mushroom House", "Fairytale Castle", "Coastal Lighthouse", "Canopy Treehouse",
  ];
  const homeGrounds: SceneGround[] = ["meadow", "clouds", "sparkles", "waves", "none"];
  for (let i = 0; i < 50; i++) {
    const hIdx = i % homeNames.length;
    const gIdx = Math.floor(i / homeNames.length) % homeGrounds.length;
    const edition = Math.floor(i / 25) + 1;
    list.push({
      id: `c-home-${i}`,
      label: `${homeNames[hIdx]} ${["Garden", "Clouds", "Starry", "Breeze", "Classic"][gIdx]}${edition > 1 ? ` ${edition}` : ""}`,
      mode: "cartoon",
      category: "homes-places",
      keywords: `home house building castle ${homeNames[hIdx].toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 27,
      getSvg: () => drawHomeCartoon(hIdx, homeGrounds[gIdx]),
    });
  }

  // 8. Garden Critters, Birds & Bugs (55 cartoons)
  const gardenNames = [
    "Lacewing Butterfly", "Garden Snail", "Smiling Sunflower", "Pond Frog", "Spotted Ladybug", "Potted Cactus",
  ];
  const gardenFaces: FaceStyle[] = ["glossy", "happy-wink", "sweet-smile", "sleepy", "giggle", "cool-shades"];
  const gardenGrounds: SceneGround[] = ["meadow", "sparkles", "clouds", "waves", "none"];
  for (let i = 0; i < 55; i++) {
    const kIdx = i % gardenNames.length;
    const fIdx = Math.floor(i / gardenNames.length) % gardenFaces.length;
    const gIdx = (i * 2) % gardenGrounds.length;
    list.push({
      id: `c-garden-${i}`,
      label: `${gardenNames[kIdx]} (${["Sweet", "Wink", "Sunny", "Sleepy", "Giggle", "Cool"][fIdx]})`,
      mode: "cartoon",
      category: "garden-critters",
      keywords: `garden bug bird flower ${gardenNames[kIdx].toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 25,
      getSvg: () => drawGardenNatureCartoon(kIdx, gardenFaces[fIdx], gardenGrounds[gIdx]),
    });
  }

  // 9. Botanical, Flowers & Cozy Nature (45 cartoons)
  const natureLabels = [
    "Blooming Sunflower", "Meadow Butterfly", "Cozy Cactus", "Lotus Pond Frog", "Spring Garden",
  ];
  for (let i = 0; i < 45; i++) {
    const kind = [2, 0, 5, 3, 1][i % 5];
    const fIdx = Math.floor(i / 5) % gardenFaces.length;
    const gIdx = Math.floor(i / 9) % gardenGrounds.length;
    list.push({
      id: `c-nature-${i}`,
      label: `${natureLabels[i % 5]} #${Math.floor(i / 5) + 1}`,
      mode: "cartoon",
      category: "nature-botanical",
      keywords: `nature botanical plant flower tree ${natureLabels[i % 5].toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 25,
      getSvg: () => drawGardenNatureCartoon(kind, gardenFaces[fIdx], gardenGrounds[gIdx]),
    });
  }

  // 10. Seasonal & Holiday Cartoons (50 cartoons)
  const holidayNames = [
    "Jolly Snowman", "Gingerbread House", "Easter Bunny & Egg", "Celebration Cake", "Friendly Pumpkin Ghost",
  ];
  const holidayFaces: FaceStyle[] = ["glossy", "happy-wink", "sweet-smile", "giggle", "cool-shades"];
  const holidayProps: PropKind[] = ["gift", "star", "balloon", "heart", "cup", "flower", "music", "book", "butterfly", "none"];
  for (let i = 0; i < 50; i++) {
    const hIdx = i % holidayNames.length;
    const fIdx = Math.floor(i / holidayNames.length) % holidayFaces.length;
    const pIdx = i % holidayProps.length;
    list.push({
      id: `c-holiday-${i}`,
      label: `${holidayNames[hIdx]} · ${["Joy", "Festive", "Sweet", "Party", "Cheer"][fIdx]} #${Math.floor(i / 25) + 1}`,
      mode: "cartoon",
      category: "holiday-seasons",
      keywords: `holiday season christmas easter birthday halloween ${holidayNames[hIdx].toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 25,
      getSvg: () => drawHolidayCartoon(hIdx, holidayFaces[fIdx], holidayProps[pIdx]),
    });
  }

  return list; // 80 + 60 + 50 + 55 + 45 + 55 + 50 + 55 + 45 + 50 = 545 cartoons!
}
