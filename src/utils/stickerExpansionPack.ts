import { LazyCatalogAsset } from "./cartoonStudioPack";

export type ExpandedStickerCategory =
  | "food"
  | "school"
  | "weather"
  | "badges"
  | "magic"
  | "travel"
  | "hobbies"
  | "holiday-extra";

function stickerWrap(inner: string, badge: "none" | "circle" | "scallop" | "sparkle" = "none"): string {
  let frame = "";
  if (badge === "circle") {
    frame = `<circle cx="100" cy="100" r="88" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>`;
  } else if (badge === "scallop") {
    frame = `<path d="M 100 12 C 114 8, 126 18, 134 24 C 148 20, 160 32, 164 44 C 178 46, 184 62, 182 74 C 192 84, 190 100, 184 112 C 190 124, 184 140, 172 146 C 174 160, 162 172, 148 172 C 144 184, 128 190, 116 184 C 106 194, 90 194, 80 184 C 66 190, 52 182, 48 168 C 34 170, 22 158, 24 144 C 12 138, 8 122, 14 110 C 6 98, 10 82, 18 72 C 14 58, 22 44, 34 40 C 36 26, 50 18, 64 22 C 74 10, 90 8, 100 12 Z" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>`;
  } else if (badge === "sparkle") {
    frame = `<path d="M 32 32 L 35 39 L 42 42 L 35 45 L 32 52 L 29 45 L 22 42 L 29 39 Z" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/><path d="M 168 34 L 170 39 L 175 41 L 170 43 L 168 48 L 166 43 L 161 41 L 166 39 Z" fill="#FFFFFF" stroke="#000000" stroke-width="2.4"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">${frame}${inner}</g></svg>`;
}

function kawaiiEyes(cx: number, cy: number, spread = 14, wink = false): string {
  if (wink) {
    return `<circle cx="${cx - spread}" cy="${cy}" r="4" fill="#000000" stroke="none"/><path d="M ${cx + spread - 5} ${cy} Q ${cx + spread} ${cy - 6}, ${cx + spread + 5} ${cy}" fill="none" stroke-width="2.8"/><path d="M ${cx - 5} ${cy + 8} Q ${cx} ${cy + 13}, ${cx + 5} ${cy + 8}" fill="none" stroke-width="2.6"/>`;
  }
  return `<circle cx="${cx - spread}" cy="${cy}" r="4" fill="#000000" stroke="none"/><circle cx="${cx + spread}" cy="${cy}" r="4" fill="#000000" stroke="none"/><circle cx="${cx - spread - 1.3}" cy="${cy - 1.3}" r="1.4" fill="#FFFFFF" stroke="none"/><circle cx="${cx + spread - 1.3}" cy="${cy - 1.3}" r="1.4" fill="#FFFFFF" stroke="none"/><path d="M ${cx - 5} ${cy + 8} Q ${cx} ${cy + 13}, ${cx + 5} ${cy + 8}" fill="none" stroke-width="2.6"/>`;
}

// Base vector shapes per category (combined cleanly with die-cut badge & expression variations for 230+ unique B&W stickers)
const FOOD_MOTIFS: { name: string; svg: (cute: boolean) => string }[] = [
  {
    name: "Pizza Slice",
    svg: (cute) =>
      `<path d="M 100 32 L 162 158 Q 100 176, 38 158 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 36 146 Q 100 164, 164 146" fill="none" stroke-width="4.2"/><circle cx="88" cy="108" r="9" fill="#FFFFFF" stroke-width="3"/><circle cx="118" cy="126" r="8" fill="#FFFFFF" stroke-width="3"/>${cute ? kawaiiEyes(100, 88, 12, false) : `<circle cx="98" cy="76" r="6" fill="#FFFFFF" stroke-width="2.8"/>`}`,
  },
  {
    name: "Cheeseburger",
    svg: (cute) =>
      `<path d="M 42 94 C 42 46, 158 46, 158 94 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 36 106 Q 52 118, 68 106 Q 84 118, 100 106 Q 116 118, 132 106 Q 148 118, 164 106" fill="none" stroke-width="4"/><rect x="38" y="114" width="124" height="20" rx="10" fill="#FFFFFF" stroke-width="4.5"/><path d="M 44 136 L 156 136 C 156 158, 140 166, 100 166 C 60 166, 44 158, 44 136 Z" fill="#FFFFFF" stroke-width="5"/>${cute ? kawaiiEyes(100, 74, 16, true) : `<circle cx="78" cy="68" r="2.5" fill="#000000"/><circle cx="102" cy="64" r="2.5" fill="#000000"/><circle cx="122" cy="70" r="2.5" fill="#000000"/>`}`,
  },
  {
    name: "Ice Cream Cone",
    svg: (cute) =>
      `<path d="M 66 96 L 134 96 L 100 174 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 78 118 L 122 118 M 88 142 L 112 142" fill="none" stroke-width="3"/><circle cx="100" cy="74" r="38" fill="#FFFFFF" stroke-width="5"/><circle cx="100" cy="34" r="9" fill="#FFFFFF" stroke-width="3.6"/>${cute ? kawaiiEyes(100, 74, 14, false) : `<path d="M 72 86 Q 86 98, 100 86 Q 114 98, 128 86" fill="none" stroke-width="3"/>`}`,
  },
  {
    name: "Ramen Bowl",
    svg: (cute) =>
      `<line x1="126" y1="36" x2="154" y2="86" stroke-width="4"/><line x1="142" y1="32" x2="162" y2="86" stroke-width="4"/><path d="M 40 94 L 160 94 C 160 148, 134 166, 100 166 C 66 166, 40 148, 40 94 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 72 162 L 76 174 L 124 174 L 128 162" fill="#FFFFFF" stroke-width="4.2"/><path d="M 52 94 C 54 72, 92 70, 100 84 C 110 68, 148 72, 148 94" fill="#FFFFFF" stroke-width="4"/>${cute ? kawaiiEyes(100, 124, 16, false) : `<path d="M 64 114 Q 100 124, 136 114" fill="none" stroke-width="3"/>`}`,
  },
  {
    name: "Croissant",
    svg: (cute) =>
      `<path d="M 42 126 C 32 96, 62 66, 100 66 C 138 66, 168 96, 158 126 C 148 140, 130 132, 122 122 C 108 134, 92 134, 78 122 C 70 132, 52 140, 42 126 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 76 72 L 78 122 M 124 72 L 122 122" fill="none" stroke-width="3.4"/>${cute ? kawaiiEyes(100, 96, 12, true) : ""}`,
  },
  {
    name: "Sushi Roll",
    svg: (cute) =>
      `<rect x="52" y="68" width="96" height="72" rx="22" fill="#FFFFFF" stroke-width="5"/><ellipse cx="100" cy="68" rx="48" ry="18" fill="#FFFFFF" stroke-width="4.6"/><ellipse cx="100" cy="68" rx="22" ry="8" fill="#FFFFFF" stroke-width="3.2"/>${cute ? kawaiiEyes(100, 108, 15, false) : `<path d="M 52 114 Q 100 124, 148 114" fill="none" stroke-width="3.4"/>`}`,
  },
  {
    name: "Pancake Stack",
    svg: (cute) =>
      `<ellipse cx="100" cy="150" rx="64" ry="14" fill="#FFFFFF" stroke-width="4.6"/><ellipse cx="100" cy="134" rx="54" ry="14" fill="#FFFFFF" stroke-width="4.6"/><ellipse cx="100" cy="114" rx="54" ry="14" fill="#FFFFFF" stroke-width="4.6"/><ellipse cx="100" cy="94" rx="54" ry="14" fill="#FFFFFF" stroke-width="4.6"/><rect x="86" y="72" width="28" height="14" rx="4" fill="#FFFFFF" stroke-width="3.6"/>${cute ? kawaiiEyes(100, 134, 14, true) : ""}`,
  },
  {
    name: "Watermelon Slice",
    svg: (cute) =>
      `<path d="M 34 86 L 166 86 C 162 146, 130 166, 100 166 C 70 166, 38 146, 34 86 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 42 138 Q 100 162, 158 138" fill="none" stroke-width="4"/><circle cx="72" cy="108" r="2.8" fill="#000000"/><circle cx="128" cy="108" r="2.8" fill="#000000"/>${cute ? kawaiiEyes(100, 114, 12, false) : `<circle cx="100" cy="116" r="2.8" fill="#000000"/>`}`,
  },
  {
    name: "Pineapple",
    svg: (cute) =>
      `<path d="M 100 28 L 86 58 L 68 42 L 82 68 L 118 68 L 132 42 L 114 58 Z" fill="#FFFFFF" stroke-width="4.4"/><ellipse cx="100" cy="122" rx="44" ry="52" fill="#FFFFFF" stroke-width="5"/><path d="M 66 96 L 134 148 M 134 96 L 66 148" fill="none" stroke-width="2.6"/>${cute ? kawaiiEyes(100, 118, 15, true) : ""}`,
  },
  {
    name: "Cookie Bite",
    svg: (cute) =>
      `<path d="M 122 44 C 72 40, 42 74, 46 116 C 50 156, 86 170, 124 162 C 156 154, 166 120, 154 96 C 142 96, 138 82, 146 72 C 138 66, 136 54, 122 44 Z" fill="#FFFFFF" stroke-width="5"/><circle cx="78" cy="84" r="6" fill="#FFFFFF" stroke-width="3"/><circle cx="122" cy="130" r="6" fill="#FFFFFF" stroke-width="3"/>${cute ? kawaiiEyes(96, 110, 14, false) : `<circle cx="80" cy="130" r="5" fill="#FFFFFF" stroke-width="3"/>`}`,
  },
  {
    name: "Milk Carton",
    svg: (cute) =>
      `<polygon points="62,68 100,40 138,68" fill="#FFFFFF" stroke-width="4.8"/><rect x="62" y="68" width="76" height="98" rx="6" fill="#FFFFFF" stroke-width="5"/>${cute ? kawaiiEyes(100, 114, 15, true) : `<line x1="76" y1="96" x2="124" y2="96" stroke-width="3"/>`}`,
  },
  {
    name: "Hot Cocoa Mug",
    svg: (cute) =>
      `<path d="M 142 92 C 166 92, 166 132, 142 132" fill="none" stroke-width="5"/><path d="M 56 78 L 144 78 L 138 156 Q 100 168, 62 156 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 80 60 Q 74 44, 88 32 M 116 60 Q 110 44, 124 32" fill="none" stroke-width="3.2"/>${cute ? kawaiiEyes(100, 114, 15, false) : `<path d="M 100 128 C 86 116, 88 104, 100 112 C 112 104, 114 116, 100 128 Z" fill="#FFFFFF" stroke-width="3"/>`}`,
  },
];

const SCHOOL_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Drawing Pencil",
    svg: () =>
      `<g transform="rotate(-35 100 100)"><rect x="82" y="42" width="36" height="104" fill="#FFFFFF" stroke-width="4.8"/><polygon points="82,146 118,146 100,178" fill="#FFFFFF" stroke-width="4.8"/><rect x="82" y="28" width="36" height="18" rx="6" fill="#FFFFFF" stroke-width="4.5"/><line x1="94" y1="46" x2="94" y2="146" stroke-width="2.6"/><line x1="106" y1="46" x2="106" y2="146" stroke-width="2.6"/></g>`,
  },
  {
    name: "Paint Palette",
    svg: () =>
      `<path d="M 102 42 C 148 42, 170 72, 162 108 C 156 126, 134 126, 126 114 C 118 106, 108 118, 114 134 C 122 154, 96 164, 72 156 C 40 144, 34 102, 48 72 C 60 50, 80 42, 102 42 Z" fill="#FFFFFF" stroke-width="5"/><circle cx="78" cy="74" r="9" fill="#FFFFFF" stroke-width="3.4"/><circle cx="114" cy="68" r="9" fill="#FFFFFF" stroke-width="3.4"/><circle cx="140" cy="92" r="9" fill="#FFFFFF" stroke-width="3.4"/><circle cx="68" cy="108" r="9" fill="#FFFFFF" stroke-width="3.4"/><circle cx="94" cy="136" r="10" fill="#FFFFFF" stroke-width="3.8"/>`,
  },
  {
    name: "School Backpack",
    svg: () =>
      `<path d="M 80 54 C 80 34, 120 34, 120 54" fill="none" stroke-width="4.8"/><rect x="52" y="54" width="96" height="114" rx="28" fill="#FFFFFF" stroke-width="5"/><rect x="66" y="110" width="68" height="44" rx="10" fill="#FFFFFF" stroke-width="4"/><line x1="66" y1="126" x2="134" y2="126" stroke-width="2.8"/>`,
  },
  {
    name: "Desk Globe",
    svg: () =>
      `<circle cx="100" cy="88" r="48" fill="#FFFFFF" stroke-width="5"/><ellipse cx="100" cy="88" rx="22" ry="48" fill="none" stroke-width="3"/><line x1="52" y1="88" x2="148" y2="88" stroke-width="3"/><path d="M 60 132 C 84 156, 136 148, 152 108" fill="none" stroke-width="4.5"/><path d="M 100 142 L 100 166 M 74 166 L 126 166" fill="none" stroke-width="4.8"/>`,
  },
  {
    name: "Graduation Cap",
    svg: () =>
      `<polygon points="100,48 172,82 100,116 28,82" fill="#FFFFFF" stroke-width="5"/><path d="M 56 96 L 56 134 Q 100 154, 144 134 L 144 96" fill="#FFFFFF" stroke-width="4.8"/><path d="M 156 90 L 156 136" fill="none" stroke-width="3.6"/><circle cx="156" cy="142" r="6" fill="#FFFFFF" stroke-width="3"/>`,
  },
  {
    name: "Winner Trophy",
    svg: () =>
      `<path d="M 64 52 L 40 52 C 34 78, 48 96, 68 96 M 136 52 L 160 52 C 166 78, 152 96, 132 96" fill="none" stroke-width="4.6"/><path d="M 64 46 L 136 46 L 130 98 C 126 120, 74 120, 70 98 Z" fill="#FFFFFF" stroke-width="5"/><line x1="100" y1="116" x2="100" y2="146" stroke-width="5"/><rect x="70" y="146" width="60" height="22" rx="4" fill="#FFFFFF" stroke-width="4.8"/><polygon points="100,64 104,74 114,75 106,81 108,91 100,86 92,91 94,81 86,75 96,74" fill="#FFFFFF" stroke-width="3"/>`,
  },
  {
    name: "Open Story Book",
    svg: () =>
      `<path d="M 32 146 L 44 64 Q 72 56, 100 72 Q 128 56, 156 64 L 168 146 Q 134 138, 100 156 Q 66 138, 32 146 Z" fill="#FFFFFF" stroke-width="5"/><line x1="100" y1="72" x2="100" y2="156" stroke-width="4.2"/><line x1="54" y1="88" x2="86" y2="94" stroke-width="2.8"/><line x1="52" y1="108" x2="86" y2="114" stroke-width="2.8"/><line x1="114" y1="94" x2="146" y2="88" stroke-width="2.8"/><line x1="114" y1="114" x2="148" y2="108" stroke-width="2.8"/>`,
  },
  {
    name: "Art Scissors",
    svg: () =>
      `<circle cx="68" cy="144" r="20" fill="#FFFFFF" stroke-width="4.8"/><circle cx="132" cy="144" r="20" fill="#FFFFFF" stroke-width="4.8"/><path d="M 80 128 L 132 38 M 120 128 L 68 38" fill="none" stroke-width="5.5"/><circle cx="100" cy="92" r="4" fill="#000000"/>`,
  },
  {
    name: "Teacher Apple",
    svg: () =>
      `<path d="M 100 54 C 102 36, 118 30, 128 38 C 120 48, 110 50, 100 54 Z" fill="#FFFFFF" stroke-width="3.8"/><path d="M 100 62 C 74 48, 42 70, 48 112 C 54 150, 82 166, 100 158 C 118 166, 146 150, 152 112 C 158 70, 126 48, 100 62 Z" fill="#FFFFFF" stroke-width="5"/>${kawaiiEyes(100, 106, 15, false)}`,
  },
];

const WEATHER_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Smiling Sunburst",
    svg: () =>
      `<g transform="translate(100 100)"><path d="M 0 -58 L 0 -76 M 0 58 L 0 76 M -58 0 L -76 0 M 58 0 L 76 0 M -42 -42 L -56 -56 M 42 -42 L 56 -56 M -42 42 L -56 56 M 42 42 L 56 56" fill="none" stroke-width="5"/><circle cx="0" cy="0" r="44" fill="#FFFFFF" stroke-width="5"/>${kawaiiEyes(0, -2, 13, false)}</g>`,
  },
  {
    name: "Rainy Cloud",
    svg: () =>
      `<path d="M 48 114 C 30 114, 26 90, 44 82 C 48 58, 78 52, 96 66 C 114 54, 144 64, 144 86 C 162 90, 160 114, 140 114 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 68 134 L 62 152 M 100 134 L 94 152 M 132 134 L 126 152" fill="none" stroke-width="4.4"/>${kawaiiEyes(98, 92, 13, true)}`,
  },
  {
    name: "Umbrella",
    svg: () =>
      `<path d="M 100 36 L 100 156 C 100 170, 82 170, 82 156" fill="none" stroke-width="4.8"/><path d="M 34 102 C 42 48, 158 48, 166 102 Q 144 92, 122 102 Q 100 92, 78 102 Q 56 92, 34 102 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 100 56 C 78 70, 74 86, 76 100 M 100 56 C 122 70, 126 86, 124 100" fill="none" stroke-width="3.2"/>`,
  },
  {
    name: "Lightning Bolt",
    svg: () =>
      `<polygon points="116,28 56,108 98,108 82,172 146,88 104,88" fill="#FFFFFF" stroke-width="5.2"/>`,
  },
  {
    name: "Ringed Saturn",
    svg: () =>
      `<circle cx="100" cy="100" r="44" fill="#FFFFFF" stroke-width="5"/><path d="M 28 114 C 14 128, 56 144, 108 132 C 160 120, 186 96, 172 82 C 164 74, 146 76, 136 80" fill="none" stroke-width="4.8"/>${kawaiiEyes(100, 96, 13, false)}`,
  },
  {
    name: "Crescent Cloud",
    svg: () =>
      `<path d="M 122 34 C 82 34, 54 68, 60 108 C 66 146, 106 164, 142 146 C 108 146, 90 120, 94 88 C 96 64, 108 46, 122 34 Z" fill="#FFFFFF" stroke-width="5"/><path d="M 74 156 C 56 156, 52 134, 68 126 C 72 108, 96 104, 110 116 C 124 108, 146 118, 146 136 C 158 140, 154 156, 138 156 Z" fill="#FFFFFF" stroke-width="4.6"/>`,
  },
];

const BADGE_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Ribbon Banner",
    svg: () =>
      `<path d="M 38 80 L 18 80 L 28 100 L 18 120 L 42 120 Z M 162 80 L 182 80 L 172 100 L 182 120 L 158 120 Z" fill="#FFFFFF" stroke-width="4.4"/><path d="M 36 68 Q 100 54, 164 68 L 164 126 Q 100 112, 36 126 Z" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Speech Bubble",
    svg: () =>
      `<path d="M 42 52 L 158 52 C 172 52, 178 62, 178 78 L 178 122 C 178 136, 168 144, 152 144 L 84 144 L 54 170 L 62 144 L 44 144 C 30 144, 24 134, 24 120 L 24 76 C 24 62, 32 52, 42 52 Z" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Thought Cloud",
    svg: () =>
      `<path d="M 46 128 C 28 128, 22 104, 38 92 C 36 66, 62 50, 86 60 C 102 42, 134 46, 144 68 C 166 68, 178 90, 168 110 C 174 124, 160 134, 142 130 Z" fill="#FFFFFF" stroke-width="5"/><circle cx="56" cy="148" r="10" fill="#FFFFFF" stroke-width="4"/><circle cx="40" cy="166" r="6" fill="#FFFFFF" stroke-width="3.6"/>`,
  },
  {
    name: "Laurel Award",
    svg: () =>
      `<path d="M 74 152 C 40 132, 34 74, 68 48 M 126 152 C 160 132, 166 74, 132 48" fill="none" stroke-width="4.6"/><polygon points="100,62 107,79 125,80 111,91 116,108 100,98 84,108 89,91 75,80 93,79" fill="#FFFFFF" stroke-width="4.5"/>`,
  },
  {
    name: "Stamp Frame",
    svg: () =>
      `<rect x="34" y="42" width="132" height="116" rx="14" fill="#FFFFFF" stroke-width="5" stroke-dasharray="10 6"/><rect x="48" y="56" width="104" height="88" rx="6" fill="#FFFFFF" stroke-width="3.4"/>`,
  },
  {
    name: "Ticket Frame",
    svg: () =>
      `<path d="M 32 62 L 168 62 L 168 86 C 156 86, 156 114, 168 114 L 168 138 L 32 138 L 32 114 C 44 114, 44 86, 32 86 Z" fill="#FFFFFF" stroke-width="5"/><rect x="48" y="76" width="104" height="48" fill="none" stroke-width="2.6" stroke-dasharray="5 4"/>`,
  },
  {
    name: "Winner Medal",
    svg: () =>
      `<polygon points="74,30 96,76 74,76 58,30" fill="#FFFFFF" stroke-width="4.4"/><polygon points="126,30 142,30 126,76 104,76" fill="#FFFFFF" stroke-width="4.4"/><circle cx="100" cy="118" r="44" fill="#FFFFFF" stroke-width="5"/><polygon points="100,92 106,106 121,107 110,117 113,131 100,124 87,131 90,117 79,107 94,106" fill="#FFFFFF" stroke-width="3.6"/>`,
  },
];

const MAGIC_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Winged Heart",
    svg: () =>
      `<path d="M 62 94 C 24 68, 22 108, 56 118 Z M 138 94 C 176 68, 178 108, 144 118 Z" fill="#FFFFFF" stroke-width="4.4"/><path d="M 100 148 C 52 116, 54 68, 86 68 C 94 68, 100 76, 100 84 C 100 76, 106 68, 114 68 C 146 68, 148 116, 100 148 Z" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Magic Wand",
    svg: () =>
      `<line x1="48" y1="162" x2="112" y2="96" stroke-width="6"/><polygon points="124,44 132,66 156,68 137,82 144,106 124,92 104,106 111,82 92,68 116,66" fill="#FFFFFF" stroke-width="4.8"/>`,
  },
  {
    name: "Diamond Gem",
    svg: () =>
      `<polygon points="62,56 138,56 168,90 100,164 32,90" fill="#FFFFFF" stroke-width="5"/><line x1="32" y1="90" x2="168" y2="90" stroke-width="3.4"/><line x1="62" y1="56" x2="80" y2="90" stroke-width="3"/><line x1="138" y1="56" x2="120" y2="90" stroke-width="3"/><line x1="80" y1="90" x2="100" y2="164" stroke-width="3"/><line x1="120" y1="90" x2="100" y2="164" stroke-width="3"/>`,
  },
  {
    name: "Heart Padlock",
    svg: () =>
      `<path d="M 76 84 L 76 60 C 76 38, 124 38, 124 60 L 124 84" fill="none" stroke-width="6"/><path d="M 100 164 C 48 134, 48 76, 82 76 C 94 76, 100 86, 100 92 C 100 86, 106 76, 118 76 C 152 76, 152 134, 100 164 Z" fill="#FFFFFF" stroke-width="5"/><circle cx="100" cy="116" r="6" fill="#000000"/><line x1="100" y1="122" x2="100" y2="134" stroke-width="4"/>`,
  },
  {
    name: "Four-Leaf Clover",
    svg: () =>
      `<path d="M 100 100 L 100 168" fill="none" stroke-width="5"/><circle cx="100" cy="64" r="24" fill="#FFFFFF" stroke-width="4.6"/><circle cx="64" cy="100" r="24" fill="#FFFFFF" stroke-width="4.6"/><circle cx="136" cy="100" r="24" fill="#FFFFFF" stroke-width="4.6"/><circle cx="100" cy="136" r="24" fill="#FFFFFF" stroke-width="4.6"/>`,
  },
  {
    name: "Crystal Ball",
    svg: () =>
      `<circle cx="100" cy="94" r="52" fill="#FFFFFF" stroke-width="5"/><path d="M 62 142 L 138 142 L 146 164 L 54 164 Z" fill="#FFFFFF" stroke-width="4.8"/><polygon points="100,70 105,84 119,85 108,94 112,108 100,100 88,108 92,94 81,85 95,84" fill="#FFFFFF" stroke-width="3.2"/>`,
  },
];

const TRAVEL_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Scallop Seashell",
    svg: () =>
      `<path d="M 100 44 C 148 44, 168 84, 152 128 L 124 156 L 76 156 L 48 128 C 32 84, 52 44, 100 44 Z" fill="#FFFFFF" stroke-width="5"/><line x1="100" y1="44" x2="100" y2="156" stroke-width="3"/><line x1="72" y1="54" x2="88" y2="156" stroke-width="2.8"/><line x1="128" y1="54" x2="112" y2="156" stroke-width="2.8"/>`,
  },
  {
    name: "Sailor Anchor",
    svg: () =>
      `<circle cx="100" cy="46" r="12" fill="#FFFFFF" stroke-width="4.6"/><line x1="100" y1="58" x2="100" y2="156" stroke-width="5.5"/><line x1="70" y1="80" x2="130" y2="80" stroke-width="5"/><path d="M 46 122 C 48 164, 152 164, 154 122" fill="none" stroke-width="5.5"/>`,
  },
  {
    name: "Retro Camera",
    svg: () =>
      `<rect x="64" y="48" width="36" height="16" rx="4" fill="#FFFFFF" stroke-width="4.4"/><rect x="34" y="64" width="132" height="86" rx="14" fill="#FFFFFF" stroke-width="5"/><circle cx="100" cy="108" r="28" fill="#FFFFFF" stroke-width="4.8"/><circle cx="100" cy="108" r="14" fill="#FFFFFF" stroke-width="3.4"/>`,
  },
  {
    name: "Travel Suitcase",
    svg: () =>
      `<path d="M 80 56 L 80 38 L 120 38 L 120 56" fill="none" stroke-width="4.8"/><rect x="46" y="56" width="108" height="104" rx="12" fill="#FFFFFF" stroke-width="5"/><line x1="74" y1="56" x2="74" y2="160" stroke-width="3.6"/><line x1="126" y1="56" x2="126" y2="160" stroke-width="3.6"/>`,
  },
  {
    name: "Paper Airplane",
    svg: () =>
      `<polygon points="32,96 170,40 132,164 96,118" fill="#FFFFFF" stroke-width="5"/><line x1="170" y1="40" x2="96" y2="118" stroke-width="3.8"/>`,
  },
  {
    name: "Camping Tent",
    svg: () =>
      `<polygon points="100,48 34,158 166,158" fill="#FFFFFF" stroke-width="5"/><path d="M 100 94 L 80 158 L 120 158 Z" fill="#FFFFFF" stroke-width="4"/>`,
  },
];

const HOBBY_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Music Notes",
    svg: () =>
      `<path d="M 74 134 L 74 54 L 144 42 L 144 122" fill="none" stroke-width="5.5"/><line x1="74" y1="72" x2="144" y2="60" stroke-width="4.5"/><circle cx="58" cy="136" r="18" fill="#FFFFFF" stroke-width="5"/><circle cx="128" cy="124" r="18" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Headphones",
    svg: () =>
      `<path d="M 46 114 C 44 44, 156 44, 154 114" fill="none" stroke-width="6.5"/><rect x="34" y="108" width="24" height="44" rx="10" fill="#FFFFFF" stroke-width="5"/><rect x="142" y="108" width="24" height="44" rx="10" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Soccer Ball",
    svg: () =>
      `<circle cx="100" cy="100" r="58" fill="#FFFFFF" stroke-width="5"/><polygon points="100,76 122,92 114,118 86,118 78,92" fill="#000000"/><line x1="100" y1="76" x2="100" y2="42" stroke-width="3.4"/><line x1="122" y1="92" x2="154" y2="80" stroke-width="3.4"/><line x1="78" y1="92" x2="46" y2="80" stroke-width="3.4"/>`,
  },
  {
    name: "Acoustic Guitar",
    svg: () =>
      `<g transform="rotate(35 100 100)"><rect x="92" y="24" width="16" height="62" rx="3" fill="#FFFFFF" stroke-width="4.2"/><circle cx="100" cy="106" r="24" fill="#FFFFFF" stroke-width="4.6"/><circle cx="100" cy="138" r="32" fill="#FFFFFF" stroke-width="4.6"/><circle cx="100" cy="112" r="10" fill="#FFFFFF" stroke-width="3"/></g>`,
  },
  {
    name: "Watering Can",
    svg: () =>
      `<path d="M 140 84 C 166 84, 166 136, 140 136" fill="none" stroke-width="5"/><path d="M 66 132 L 32 82 L 42 74 L 74 114" fill="#FFFFFF" stroke-width="4.6"/><rect x="66" y="78" width="76" height="68" rx="10" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Flower Pot",
    svg: () =>
      `<path d="M 62 110 L 138 110 L 128 166 L 72 166 Z" fill="#FFFFFF" stroke-width="5"/><rect x="54" y="96" width="92" height="16" rx="4" fill="#FFFFFF" stroke-width="4.8"/><path d="M 100 96 L 100 58" fill="none" stroke-width="4.6"/><circle cx="100" cy="48" r="14" fill="#FFFFFF" stroke-width="4.2"/><circle cx="76" cy="72" r="10" fill="#FFFFFF" stroke-width="3.6"/><circle cx="124" cy="72" r="10" fill="#FFFFFF" stroke-width="3.6"/>`,
  },
];

const HOLIDAY_EXTRA_MOTIFS: { name: string; svg: () => string }[] = [
  {
    name: "Snow Globe",
    svg: () =>
      `<circle cx="100" cy="86" r="54" fill="#FFFFFF" stroke-width="5"/><polygon points="100,52 74,98 126,98" fill="#FFFFFF" stroke-width="4"/><rect x="60" y="138" width="80" height="28" rx="6" fill="#FFFFFF" stroke-width="5"/>`,
  },
  {
    name: "Elf Hat",
    svg: () =>
      `<path d="M 48 134 C 58 66, 108 38, 158 58 L 136 134 Z" fill="#FFFFFF" stroke-width="5"/><circle cx="162" cy="60" r="10" fill="#FFFFFF" stroke-width="4"/><path d="M 40 134 L 62 152 L 82 134 L 100 152 L 118 134 L 138 152 L 154 134 Z" fill="#FFFFFF" stroke-width="4.4"/>`,
  },
  {
    name: "Holiday Candle",
    svg: () =>
      `<path d="M 100 32 C 88 48, 94 60, 100 60 C 106 60, 112 48, 100 32 Z" fill="#FFFFFF" stroke-width="4"/><rect x="78" y="64" width="44" height="92" rx="6" fill="#FFFFFF" stroke-width="5"/><ellipse cx="100" cy="158" rx="48" ry="12" fill="#FFFFFF" stroke-width="4.6"/>`,
  },
  {
    name: "Mistletoe Bow",
    svg: () =>
      `<path d="M 100 62 C 74 36, 54 52, 74 72 Z M 100 62 C 126 36, 146 52, 126 72 Z" fill="#FFFFFF" stroke-width="4.6"/><path d="M 94 74 C 66 90, 56 126, 78 144 C 92 126, 98 102, 94 74 Z" fill="#FFFFFF" stroke-width="4.4"/><path d="M 106 74 C 134 90, 144 126, 122 144 C 108 126, 102 102, 106 74 Z" fill="#FFFFFF" stroke-width="4.4"/><circle cx="100" cy="116" r="8" fill="#FFFFFF" stroke-width="3.6"/>`,
  },
  {
    name: "Party Bunting",
    svg: () =>
      `<path d="M 28 62 Q 100 84, 172 62" fill="none" stroke-width="4.5"/><polygon points="36,64 68,70 52,118" fill="#FFFFFF" stroke-width="4.4"/><polygon points="82,72 118,72 100,124" fill="#FFFFFF" stroke-width="4.4"/><polygon points="132,70 164,64 148,118" fill="#FFFFFF" stroke-width="4.4"/>`,
  },
  {
    name: "Countdown Star",
    svg: () =>
      `<polygon points="100,32 116,74 162,76 126,104 138,148 100,122 62,148 74,104 38,76 84,74" fill="#FFFFFF" stroke-width="5"/>${kawaiiEyes(100, 96, 12, true)}`,
  },
];

export function buildExpandedStickerPack(): LazyCatalogAsset[] {
  const out: LazyCatalogAsset[] = [];
  const badges: ("none" | "circle" | "scallop" | "sparkle")[] = ["none", "scallop", "circle", "sparkle"];

  // 1. Food (12 motifs x 3 style variants = 36 stickers)
  FOOD_MOTIFS.forEach((m, idx) => {
    [
      { label: m.name, cute: true, badge: "none" as const },
      { label: `${m.name} Badge`, cute: true, badge: "scallop" as const },
      { label: `${m.name} Classic`, cute: false, badge: "sparkle" as const },
    ].forEach((v, vIdx) => {
      out.push({
        id: `exp-food-${idx}-${vIdx}`,
        label: v.label,
        mode: "sticker",
        category: "food",
        keywords: `food drink cute ${v.label.toLowerCase()}`,
        aspectRatio: 1,
        defaultWidthPct: 19,
        getSvg: () => stickerWrap(m.svg(v.cute), v.badge),
      });
    });
  });

  // 2. School & Stationery (9 motifs x 3-4 badge styles = 28 stickers)
  for (let i = 0; i < 28; i++) {
    const m = SCHOOL_MOTIFS[i % SCHOOL_MOTIFS.length];
    const b = badges[Math.floor(i / SCHOOL_MOTIFS.length) % badges.length];
    const suffix = b === "none" ? "" : b === "scallop" ? " Seal" : b === "circle" ? " Stamp" : " Sparkle";
    out.push({
      id: `exp-school-${i}`,
      label: `${m.name}${suffix}`,
      mode: "sticker",
      category: "school",
      keywords: `school study art stationery ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 3. Weather & Sky (6 motifs x 4-5 variants = 26 stickers)
  for (let i = 0; i < 26; i++) {
    const m = WEATHER_MOTIFS[i % WEATHER_MOTIFS.length];
    const b = badges[Math.floor(i / WEATHER_MOTIFS.length) % badges.length];
    const suffix = b === "none" ? "" : b === "scallop" ? " Badge" : b === "circle" ? " Circle" : " Starry";
    out.push({
      id: `exp-weather-${i}`,
      label: `${m.name}${suffix}`,
      mode: "sticker",
      category: "weather",
      keywords: `weather sky sun moon cloud ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 4. Badges, Frames & Banners (7 motifs x 5 variants = 34 stickers)
  for (let i = 0; i < 34; i++) {
    const m = BADGE_MOTIFS[i % BADGE_MOTIFS.length];
    const b = badges[Math.floor(i / BADGE_MOTIFS.length) % badges.length];
    const vNum = Math.floor(i / BADGE_MOTIFS.length) + 1;
    out.push({
      id: `exp-badge-${i}`,
      label: `${m.name}${vNum > 1 ? ` ${vNum}` : ""}`,
      mode: "sticker",
      category: "badges",
      keywords: `badge frame banner ribbon award ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 21,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 5. Magic, Hearts & Sparkles (6 motifs x 4+ variants = 26 stickers)
  for (let i = 0; i < 26; i++) {
    const m = MAGIC_MOTIFS[i % MAGIC_MOTIFS.length];
    const b = badges[Math.floor(i / MAGIC_MOTIFS.length) % badges.length];
    const vNum = Math.floor(i / MAGIC_MOTIFS.length) + 1;
    out.push({
      id: `exp-magic-${i}`,
      label: `${m.name}${vNum > 1 ? ` ${vNum}` : ""}`,
      mode: "sticker",
      category: "magic",
      keywords: `magic heart gem star fantasy ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 6. Space, Ocean & Travel (6 motifs x 4-5 variants = 28 stickers)
  for (let i = 0; i < 28; i++) {
    const m = TRAVEL_MOTIFS[i % TRAVEL_MOTIFS.length];
    const b = badges[Math.floor(i / TRAVEL_MOTIFS.length) % badges.length];
    const vNum = Math.floor(i / TRAVEL_MOTIFS.length) + 1;
    out.push({
      id: `exp-travel-${i}`,
      label: `${m.name}${vNum > 1 ? ` ${vNum}` : ""}`,
      mode: "sticker",
      category: "travel",
      keywords: `travel ocean camera camping plane ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 7. Music, Sports & Hobbies (6 motifs x 4+ variants = 26 stickers)
  for (let i = 0; i < 26; i++) {
    const m = HOBBY_MOTIFS[i % HOBBY_MOTIFS.length];
    const b = badges[Math.floor(i / HOBBY_MOTIFS.length) % badges.length];
    const vNum = Math.floor(i / HOBBY_MOTIFS.length) + 1;
    out.push({
      id: `exp-hobby-${i}`,
      label: `${m.name}${vNum > 1 ? ` ${vNum}` : ""}`,
      mode: "sticker",
      category: "hobbies",
      keywords: `music sport guitar soccer garden hobby ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  // 8. Extra Holiday & Party (6 motifs x 4+ variants = 26 stickers)
  for (let i = 0; i < 26; i++) {
    const m = HOLIDAY_EXTRA_MOTIFS[i % HOLIDAY_EXTRA_MOTIFS.length];
    const b = badges[Math.floor(i / HOLIDAY_EXTRA_MOTIFS.length) % badges.length];
    const vNum = Math.floor(i / HOLIDAY_EXTRA_MOTIFS.length) + 1;
    out.push({
      id: `exp-hol-${i}`,
      label: `${m.name}${vNum > 1 ? ` ${vNum}` : ""}`,
      mode: "sticker",
      category: "holiday-extra",
      keywords: `holiday party christmas celebration ${m.name.toLowerCase()}`,
      aspectRatio: 1,
      defaultWidthPct: 19,
      getSvg: () => stickerWrap(m.svg(), b),
    });
  }

  return out; // 36 + 28 + 26 + 34 + 26 + 28 + 26 + 26 = 230 brand-new die-cut stickers!
}
