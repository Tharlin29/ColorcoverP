export type PageBorderId =
  | "none"
  | "classic-double"
  | "scallop-storybook"
  | "stars-sparkles"
  | "botanical-leaves"
  | "dotted-tracing"
  | "kids-name-date"
  | "story-writing-lines"
  | "comic-4-panel"
  | "alphabet-header"
  | "holiday-wreath"
  | "polaroid-caption";

export interface PageBorderPreset {
  id: PageBorderId;
  label: string;
  description: string;
}

export const PAGE_BORDERS: PageBorderPreset[] = [
  { id: "none", label: "No Border", description: "Clean full canvas" },
  { id: "classic-double", label: "Classic Double", description: "Double ink frame" },
  { id: "scallop-storybook", label: "Scallop Frame", description: "Rounded storybook edge" },
  { id: "stars-sparkles", label: "Star Corners", description: "Stars & corner sparkles" },
  { id: "botanical-leaves", label: "Leaf Corners", description: "Botanical vine corners" },
  { id: "dotted-tracing", label: "Dotted Dash", description: "Tracing dotted border" },
  { id: "kids-name-date", label: "Name & Date", description: "Kids worksheet header" },
  { id: "story-writing-lines", label: "Draw & Write", description: "Art box + writing lines" },
  { id: "comic-4-panel", label: "4-Panel Comic", description: "Four coloring panels" },
  { id: "alphabet-header", label: "Title Banner", description: "Top ribbon + clean frame" },
  { id: "holiday-wreath", label: "Festive Corners", description: "Holly & star corners" },
  { id: "polaroid-caption", label: "Caption Frame", description: "Art frame + bottom bar" },
];

function starPath(cx: number, cy: number, rOuter: number, rInner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}

function cornerLeafCluster(x: number, y: number, flipX: number, flipY: number): string {
  return `
    <g transform="translate(${x} ${y}) scale(${flipX} ${flipY})">
      <path d="M 0 0 C 28 2, 54 14, 72 34 C 46 34, 18 22, 0 0 Z" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
      <path d="M 0 0 C 2 28, 14 54, 34 72 C 34 46, 22 18, 0 0 Z" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
      <path d="M 10 10 L 52 28 M 10 10 L 28 52" fill="none" stroke="#000000" stroke-width="2.5"/>
      <circle cx="8" cy="8" r="8" fill="#FFFFFF" stroke="#000000" stroke-width="3.5"/>
    </g>
  `;
}

export function buildPageBorderSvg(
  borderId: PageBorderId,
  width = 1000,
  height = 1294
): string {
  if (borderId === "none") return "";

  const m = 48; // outer margin
  const w = width;
  const h = height;
  const innerW = w - m * 2;
  const innerH = h - m * 2;

  let body = "";

  switch (borderId) {
    case "classic-double":
      body = `
        <rect x="${m}" y="${m}" width="${innerW}" height="${innerH}" rx="18" fill="none" stroke="#000000" stroke-width="7"/>
        <rect x="${m + 18}" y="${m + 18}" width="${innerW - 36}" height="${innerH - 36}" rx="10" fill="none" stroke="#000000" stroke-width="3.5"/>
      `;
      break;

    case "scallop-storybook": {
      const step = 44;
      const topCount = Math.max(8, Math.round(innerW / step));
      const sideCount = Math.max(10, Math.round(innerH / step));
      const dx = innerW / topCount;
      const dy = innerH / sideCount;
      const arcs: string[] = [];
      for (let i = 0; i < topCount; i++) {
        const x1 = m + i * dx;
        const x2 = x1 + dx;
        arcs.push(`M ${x1.toFixed(1)} ${m + 16} Q ${((x1 + x2) / 2).toFixed(1)} ${m - 12}, ${x2.toFixed(1)} ${m + 16}`);
        arcs.push(`M ${x1.toFixed(1)} ${h - m - 16} Q ${((x1 + x2) / 2).toFixed(1)} ${h - m + 12}, ${x2.toFixed(1)} ${h - m - 16}`);
      }
      for (let j = 0; j < sideCount; j++) {
        const y1 = m + j * dy;
        const y2 = y1 + dy;
        arcs.push(`M ${m + 16} ${y1.toFixed(1)} Q ${m - 12} ${((y1 + y2) / 2).toFixed(1)}, ${m + 16} ${y2.toFixed(1)}`);
        arcs.push(`M ${w - m - 16} ${y1.toFixed(1)} Q ${w - m + 12} ${((y1 + y2) / 2).toFixed(1)}, ${w - m - 16} ${y2.toFixed(1)}`);
      }
      body = `
        <path d="${arcs.join(" ")}" fill="none" stroke="#000000" stroke-width="5.5"/>
        <rect x="${m + 24}" y="${m + 24}" width="${innerW - 48}" height="${innerH - 48}" rx="16" fill="none" stroke="#000000" stroke-width="3.5"/>
      `;
      break;
    }

    case "stars-sparkles":
      body = `
        <rect x="${m + 10}" y="${m + 10}" width="${innerW - 20}" height="${innerH - 20}" rx="22" fill="none" stroke="#000000" stroke-width="6"/>
        <path d="${starPath(m + 16, m + 16, 26, 11)}" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>
        <path d="${starPath(w - m - 16, m + 16, 26, 11)}" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>
        <path d="${starPath(m + 16, h - m - 16, 26, 11)}" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>
        <path d="${starPath(w - m - 16, h - m - 16, 26, 11)}" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>
        <path d="${starPath(w / 2, m + 10, 18, 8)}" fill="#FFFFFF" stroke="#000000" stroke-width="3.5"/>
        <path d="${starPath(w / 2, h - m - 10, 18, 8)}" fill="#FFFFFF" stroke="#000000" stroke-width="3.5"/>
      `;
      break;

    case "botanical-leaves":
      body = `
        <rect x="${m + 14}" y="${m + 14}" width="${innerW - 28}" height="${innerH - 28}" rx="20" fill="none" stroke="#000000" stroke-width="5.5"/>
        <rect x="${m + 28}" y="${m + 28}" width="${innerW - 56}" height="${innerH - 56}" rx="12" fill="none" stroke="#000000" stroke-width="2.5" stroke-dasharray="10 10"/>
        ${cornerLeafCluster(m + 10, m + 10, 1, 1)}
        ${cornerLeafCluster(w - m - 10, m + 10, -1, 1)}
        ${cornerLeafCluster(m + 10, h - m - 10, 1, -1)}
        ${cornerLeafCluster(w - m - 10, h - m - 10, -1, -1)}
      `;
      break;

    case "dotted-tracing":
      body = `
        <rect x="${m}" y="${m}" width="${innerW}" height="${innerH}" rx="26" fill="none" stroke="#000000" stroke-width="6.5" stroke-dasharray="16 14"/>
        <rect x="${m + 22}" y="${m + 22}" width="${innerW - 44}" height="${innerH - 44}" rx="16" fill="none" stroke="#000000" stroke-width="3"/>
      `;
      break;

    case "kids-name-date":
      body = `
        <rect x="${m}" y="${m + 84}" width="${innerW}" height="${innerH - 84}" rx="22" fill="none" stroke="#000000" stroke-width="6"/>
        <text x="${m + 6}" y="${m + 52}" font-family="'Fredoka', 'Outfit', sans-serif" font-size="30" font-weight="700" fill="#000000">Name:</text>
        <line x1="${m + 110}" y1="${m + 56}" x2="${w * 0.62}" y2="${m + 56}" stroke="#000000" stroke-width="3.5" stroke-dasharray="6 6"/>
        <text x="${w * 0.65}" y="${m + 52}" font-family="'Fredoka', 'Outfit', sans-serif" font-size="30" font-weight="700" fill="#000000">Date:</text>
        <line x1="${w * 0.65 + 88}" y1="${m + 56}" x2="${w - m - 6}" y2="${m + 56}" stroke="#000000" stroke-width="3.5" stroke-dasharray="6 6"/>
      `;
      break;

    case "story-writing-lines": {
      const boxH = Math.round(innerH * 0.64);
      const lineStartY = m + boxH + 68;
      const lineGap = Math.round((h - m - lineStartY) / 3.4);
      const lines = [0, 1, 2, 3]
        .map((i) => {
          const y = lineStartY + i * lineGap;
          const midY = y - Math.round(lineGap * 0.45);
          return `
            <line x1="${m + 12}" y1="${midY}" x2="${w - m - 12}" y2="${midY}" stroke="#000000" stroke-width="2" stroke-dasharray="10 10"/>
            <line x1="${m + 12}" y1="${y}" x2="${w - m - 12}" y2="${y}" stroke="#000000" stroke-width="4"/>
          `;
        })
        .join("");
      body = `
        <rect x="${m}" y="${m}" width="${innerW}" height="${boxH}" rx="22" fill="none" stroke="#000000" stroke-width="6.5"/>
        ${lines}
      `;
      break;
    }

    case "comic-4-panel": {
      const gap = 26;
      const cellW = (innerW - gap) / 2;
      const cellH = (innerH - gap) / 2;
      body = `
        <rect x="${m}" y="${m}" width="${cellW}" height="${cellH}" rx="16" fill="none" stroke="#000000" stroke-width="6"/>
        <rect x="${m + cellW + gap}" y="${m}" width="${cellW}" height="${cellH}" rx="16" fill="none" stroke="#000000" stroke-width="6"/>
        <rect x="${m}" y="${m + cellH + gap}" width="${cellW}" height="${cellH}" rx="16" fill="none" stroke="#000000" stroke-width="6"/>
        <rect x="${m + cellW + gap}" y="${m + cellH + gap}" width="${cellW}" height="${cellH}" rx="16" fill="none" stroke="#000000" stroke-width="6"/>
      `;
      break;
    }

    case "alphabet-header":
      body = `
        <rect x="${m}" y="${m + 46}" width="${innerW}" height="${innerH - 46}" rx="24" fill="none" stroke="#000000" stroke-width="6.5"/>
        <path d="M ${w * 0.2} ${m + 46} L ${w * 0.23} ${m + 10} L ${w * 0.77} ${m + 10} L ${w * 0.8} ${m + 46} L ${w * 0.77} ${m + 84} L ${w * 0.23} ${m + 84} Z" fill="#FFFFFF" stroke="#000000" stroke-width="5.5"/>
        <line x1="${w * 0.28}" y1="${m + 64}" x2="${w * 0.72}" y2="${m + 64}" stroke="#000000" stroke-width="2.5" stroke-dasharray="8 8"/>
      `;
      break;

    case "holiday-wreath":
      body = `
        <rect x="${m + 12}" y="${m + 12}" width="${innerW - 24}" height="${innerH - 24}" rx="18" fill="none" stroke="#000000" stroke-width="6"/>
        <rect x="${m + 26}" y="${m + 26}" width="${innerW - 52}" height="${innerH - 52}" rx="12" fill="none" stroke="#000000" stroke-width="3"/>
        <g>
          ${[
            [m + 18, m + 18],
            [w - m - 18, m + 18],
            [m + 18, h - m - 18],
            [w - m - 18, h - m - 18],
          ]
            .map(
              ([cx, cy]) => `
            <circle cx="${cx}" cy="${cy}" r="22" fill="#FFFFFF" stroke="#000000" stroke-width="4.5"/>
            <path d="${starPath(cx, cy, 13, 5.5)}" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
          `
            )
            .join("")}
        </g>
        <path d="${starPath(w / 2, m + 14, 22, 9)}" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
        <path d="${starPath(w / 2, h - m - 14, 22, 9)}" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
      `;
      break;

    case "polaroid-caption": {
      const artH = Math.round(innerH * 0.8);
      body = `
        <rect x="${m}" y="${m}" width="${innerW}" height="${innerH}" rx="18" fill="none" stroke="#000000" stroke-width="6.5"/>
        <rect x="${m + 24}" y="${m + 24}" width="${innerW - 48}" height="${artH - 24}" rx="10" fill="none" stroke="#000000" stroke-width="4.5"/>
        <line x1="${m + 80}" y1="${h - m - 58}" x2="${w - m - 80}" y2="${h - m - 58}" stroke="#000000" stroke-width="3.5" stroke-dasharray="10 10"/>
      `;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

const borderDataUrlCache = new Map<string, string>();

export function buildPageBorderDataUrl(
  borderId: PageBorderId,
  width = 1000,
  height = 1294
): string {
  if (borderId === "none") return "";
  const key = `${borderId}-${width}x${height}`;
  const cached = borderDataUrlCache.get(key);
  if (cached) return cached;
  const svg = buildPageBorderSvg(borderId, width, height);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  borderDataUrlCache.set(key, url);
  return url;
}
