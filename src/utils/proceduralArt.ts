import { AspectRatio, BookPageSize, ColoringColorMode, MoodPreset, PrintDpi } from "../types/studio";
import { applyDpiToPngDataUrl } from "./exportTools";

const MOOD_PALETTES: Record<MoodPreset, [string, string, string, string, string]> = {
  "Editorial Film": ["#18181B", "#3F3F46", "#D97706", "#F59E0B", "#FEF3C7"],
  "Golden Hour": ["#1E1B4B", "#9A3412", "#EA580C", "#FBBF24", "#FEF9C3"],
  "Cyber Noir": ["#09090B", "#1E1B4B", "#0284C7", "#EC4899", "#E0F2FE"],
  "Watercolor Mist": ["#1E293B", "#475569", "#0D9488", "#99F6E4", "#F8FAFC"],
  "Minimalist Arch": ["#27272A", "#52525B", "#A8A29E", "#E7E5E4", "#FAFAF9"],
};

function hashPrompt(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getDimensionsForAspect(aspect: AspectRatio): { width: number; height: number } {
  switch (aspect) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "16:9":
      return { width: 1280, height: 720 };
    case "3:4":
      return { width: 900, height: 1200 };
    case "9:16":
      return { width: 720, height: 1280 };
    case "4:3":
    default:
      return { width: 1200, height: 900 };
  }
}

export function getColoringDimensions(
  pageSize: BookPageSize,
  dpi: PrintDpi
): { width: number; height: number; physicalLabel: string } {
  if (pageSize === "a4") {
    return dpi === 350
      ? { width: 2894, height: 4091, physicalLabel: "A4 · 210×297 mm · 350 DPI" }
      : { width: 2480, height: 3508, physicalLabel: "A4 · 210×297 mm · 300 DPI" };
  }
  return dpi === 350
    ? { width: 2975, height: 3850, physicalLabel: "US Letter · 8.5×11 in · 350 DPI" }
    : { width: 2550, height: 3300, physicalLabel: "US Letter · 8.5×11 in · 300 DPI" };
}

export function buildColoringBookSvg(
  prompt: string,
  width: number,
  height: number,
  colorMode: ColoringColorMode
): string {
  const rand = seededRand(hashPrompt(prompt + colorMode));
  const lower = prompt.toLowerCase();
  const margin = Math.round(Math.min(width, height) * 0.065);
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;
  const cx = width / 2;
  const cy = height / 2;
  const sw = Math.max(4, Math.round(width * 0.0024));
  const thinSw = Math.max(2.5, Math.round(sw * 0.65));

  const shadeFill = colorMode === "grayscale" ? "#ECECEC" : "#FFFFFF";
  const midShadeFill = colorMode === "grayscale" ? "#D9D9D9" : "#FFFFFF";

  const isMandala =
    lower.includes("mandala") ||
    lower.includes("geometric") ||
    lower.includes("pattern") ||
    lower.includes("မန္တလာ");
  const isPagoda =
    lower.includes("bagan") ||
    lower.includes("pagoda") ||
    lower.includes("temple") ||
    lower.includes("lotus") ||
    lower.includes("ပုဂံ") ||
    lower.includes("ဘုရား") ||
    lower.includes("ကြာပန်း");
  const isArk =
    lower.includes("ark") ||
    lower.includes("noah") ||
    lower.includes("ship") ||
    lower.includes("boat") ||
    lower.includes("သင်္ဘော");
  const isOcean =
    lower.includes("ocean") ||
    lower.includes("sea") ||
    lower.includes("fish") ||
    lower.includes("whale") ||
    lower.includes("wave") ||
    lower.includes("ပင်လယ်");
  const isButterfly =
    lower.includes("butterfly") ||
    lower.includes("လိပ်ပြာ");
  const isAnimal =
    lower.includes("cat") ||
    lower.includes("kitten") ||
    lower.includes("ကြောင်");
  const isFloral =
    lower.includes("flower") ||
    lower.includes("floral") ||
    lower.includes("garden") ||
    lower.includes("rose") ||
    lower.includes("ပန်း");

  let art = "";

  // Clean outer coloring frame with corner ornaments
  art += `<rect x="${margin}" y="${margin}" width="${innerW}" height="${innerH}" rx="28" fill="#FFFFFF" stroke="#000000" stroke-width="${sw * 1.2}" />`;
  art += `<rect x="${margin + 22}" y="${margin + 22}" width="${innerW - 44}" height="${innerH - 44}" rx="18" fill="none" stroke="#000000" stroke-width="${thinSw}" />`;

  if (isArk) {
    // Noah's Ark Line Art: Rainbow arch, sun, clouds, wooden ark hull & cabin, waves, dove
    const waterY = margin + innerH * 0.7;
    // Rainbow arcs
    for (let r = 0; r < 5; r++) {
      const rad = innerW * (0.42 - r * 0.032);
      art += `<path d="M ${(cx - rad).toFixed(1)} ${(waterY - 40).toFixed(1)} A ${rad.toFixed(
        1
      )} ${rad.toFixed(1)} 0 0 1 ${(cx + rad).toFixed(1)} ${(waterY - 40).toFixed(
        1
      )}" fill="none" stroke="#000000" stroke-width="${thinSw}" />`;
    }
    // Ark Wooden Cabin & Roof
    const cabinW = innerW * 0.44;
    const cabinH = innerH * 0.14;
    const deckY = waterY - innerH * 0.12;
    art += `<rect x="${(cx - cabinW / 2).toFixed(1)}" y="${(deckY - cabinH).toFixed(
      1
    )}" width="${cabinW.toFixed(1)}" height="${cabinH.toFixed(
      1
    )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<polygon points="${(cx - cabinW * 0.58).toFixed(1)},${(deckY - cabinH).toFixed(
      1
    )} ${cx},${(deckY - cabinH * 1.65).toFixed(1)} ${(cx + cabinW * 0.58).toFixed(1)},${(
      deckY - cabinH
    ).toFixed(1)}" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" stroke-linejoin="round" />`;
    // Porthole windows
    for (let w = -1; w <= 1; w++) {
      art += `<circle cx="${(cx + w * cabinW * 0.28).toFixed(1)}" cy="${(
        deckY -
        cabinH * 0.5
      ).toFixed(1)}" r="${(cabinW * 0.07).toFixed(
        1
      )}" fill="${shadeFill}" stroke="#000000" stroke-width="${thinSw}" />`;
    }
    // Ark Curved Hull
    const hullW = innerW * 0.72;
    art += `<path d="M ${(cx - hullW / 2).toFixed(1)} ${deckY.toFixed(1)} L ${(
      cx +
      hullW / 2
    ).toFixed(1)} ${deckY.toFixed(1)} C ${(cx + hullW * 0.46).toFixed(1)} ${(
      waterY + 120
    ).toFixed(1)}, ${(cx + hullW * 0.28).toFixed(1)} ${(waterY + 145).toFixed(
      1
    )}, ${cx} ${(waterY + 145).toFixed(1)} C ${(cx - hullW * 0.28).toFixed(1)} ${(
      waterY + 145
    ).toFixed(1)}, ${(cx - hullW * 0.46).toFixed(1)} ${(waterY + 120).toFixed(1)}, ${(
      cx -
      hullW / 2
    ).toFixed(1)} ${deckY.toFixed(1)} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw * 1.1}" />`;
    // Hull plank lines
    art += `<line x1="${(cx - hullW * 0.43).toFixed(1)}" y1="${(deckY + 75).toFixed(1)}" x2="${(
      cx +
      hullW * 0.43
    ).toFixed(1)}" y2="${(deckY + 75).toFixed(1)}" stroke="#000000" stroke-width="${thinSw}" />`;
    // Dove silhouette in sky
    const dx = cx + innerW * 0.22;
    const dy = margin + innerH * 0.22;
    art += `<path d="M ${dx - 55} ${dy} Q ${dx - 15} ${dy - 55} ${dx} ${dy - 10} Q ${
      dx + 25
    } ${dy - 55} ${dx + 60} ${dy} Q ${dx} ${dy + 25} ${dx - 55} ${dy} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    // Ocean waves at bottom
    for (let row = 0; row < 4; row++) {
      const wy = waterY + 60 + row * (innerH * 0.065);
      let d = `M ${margin + 22} ${wy}`;
      const segs = 6;
      const segW = (innerW - 44) / segs;
      for (let s = 0; s < segs; s++) {
        const sx = margin + 22 + s * segW;
        d += ` Q ${(sx + segW * 0.5).toFixed(1)} ${(wy - 48).toFixed(1)} ${(sx + segW).toFixed(
          1
        )} ${wy.toFixed(1)}`;
      }
      d += ` L ${margin + innerW - 22} ${margin + innerH - 22} L ${margin + 22} ${
        margin + innerH - 22
      } Z`;
      art += `<path d="${d}" fill="${row % 2 === 0 ? "#FFFFFF" : shadeFill}" stroke="#000000" stroke-width="${sw}" />`;
    }
  } else if (isMandala) {
    const maxR = Math.min(innerW, innerH) * 0.42;
    const rings = 6;
    for (let r = rings; r >= 1; r--) {
      const radius = (maxR / rings) * r;
      const petals = 8 + r * 4;
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        const petalR = (maxR / rings) * (0.48 + (r % 2) * 0.14);
        art += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${petalR.toFixed(
          1
        )}" fill="${r % 2 === 0 ? shadeFill : "#FFFFFF"}" stroke="#000000" stroke-width="${sw}" />`;
      }
      art += `<circle cx="${cx}" cy="${cy}" r="${radius.toFixed(
        1
      )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x1 = cx + Math.cos(a) * (maxR * 0.18);
      const y1 = cy + Math.sin(a) * (maxR * 0.18);
      art += `<line x1="${cx}" y1="${cy}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(
        1
      )}" stroke="#000000" stroke-width="${thinSw}" />`;
    }
    art += `<circle cx="${cx}" cy="${cy}" r="${(maxR * 0.07).toFixed(
      1
    )}" fill="${midShadeFill}" stroke="#000000" stroke-width="${sw}" />`;
  } else if (isButterfly) {
    const wingW = innerW * 0.36;
    const wingH = innerH * 0.24;
    // Upper & lower symmetrical patterned wings
    for (const dir of [-1, 1]) {
      art += `<path d="M ${cx} ${cy - 60} C ${cx + dir * wingW * 0.9} ${
        cy - wingH * 1.4
      }, ${cx + dir * wingW * 1.1} ${cy - wingH * 0.1}, ${cx + dir * wingW * 0.6} ${
        cy + 40
      } Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw * 1.1}" />`;
      art += `<path d="M ${cx} ${cy + 20} C ${cx + dir * wingW * 0.85} ${
        cy + 50
      }, ${cx + dir * wingW * 0.75} ${cy + wingH * 1.25}, ${cx} ${
        cy + wingH * 0.65
      } Z" fill="${shadeFill}" stroke="#000000" stroke-width="${sw * 1.1}" />`;
      // Decorative wing circles
      art += `<circle cx="${(cx + dir * wingW * 0.55).toFixed(1)}" cy="${(
        cy -
        wingH * 0.45
      ).toFixed(1)}" r="${(wingW * 0.16).toFixed(
        1
      )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      art += `<circle cx="${(cx + dir * wingW * 0.38).toFixed(1)}" cy="${(
        cy +
        wingH * 0.42
      ).toFixed(1)}" r="${(wingW * 0.11).toFixed(
        1
      )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }
    // Body & antennae
    art += `<ellipse cx="${cx}" cy="${cy + 10}" rx="34" ry="185" fill="${midShadeFill}" stroke="#000000" stroke-width="${sw}" />`;
    art += `<circle cx="${cx}" cy="${cy - 195}" r="42" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<path d="M ${cx - 12} ${cy - 230} Q ${cx - 75} ${cy - 340} ${cx - 120} ${
      cy - 310
    }" fill="none" stroke="#000000" stroke-width="${sw}" stroke-linecap="round" />`;
    art += `<path d="M ${cx + 12} ${cy - 230} Q ${cx + 75} ${cy - 340} ${cx + 120} ${
      cy - 310
    }" fill="none" stroke="#000000" stroke-width="${sw}" stroke-linecap="round" />`;
    // Surrounding corner blossoms
    for (const [fx, fy] of [
      [margin + innerW * 0.18, margin + innerH * 0.18],
      [margin + innerW * 0.82, margin + innerH * 0.18],
      [margin + innerW * 0.18, margin + innerH * 0.82],
      [margin + innerW * 0.82, margin + innerH * 0.82],
    ]) {
      for (let p = 0; p < 8; p++) {
        art += `<ellipse cx="${fx}" cy="${fy - 75}" rx="28" ry="52" transform="rotate(${
          p * 45
        } ${fx} ${fy})" fill="#FFFFFF" stroke="#000000" stroke-width="${thinSw}" />`;
      }
      art += `<circle cx="${fx}" cy="${fy}" r="32" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;
    }
  } else if (isAnimal) {
    // Storybook Friendly Cat / Woodland Owl Coloring Page
    const headY = cy - innerH * 0.1;
    const headR = innerW * 0.18;
    // Ears
    art += `<polygon points="${cx - headR * 0.85},${headY - headR * 0.45} ${
      cx - headR * 0.95
    },${headY - headR * 1.45} ${cx - headR * 0.18},${
      headY - headR * 0.85
    }" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" stroke-linejoin="round" />`;
    art += `<polygon points="${cx + headR * 0.85},${headY - headR * 0.45} ${
      cx + headR * 0.95
    },${headY - headR * 1.45} ${cx + headR * 0.18},${
      headY - headR * 0.85
    }" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" stroke-linejoin="round" />`;
    // Body
    art += `<ellipse cx="${cx}" cy="${cy + innerH * 0.18}" rx="${(headR * 1.05).toFixed(
      1
    )}" ry="${(headR * 1.35).toFixed(
      1
    )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<ellipse cx="${cx}" cy="${cy + innerH * 0.21}" rx="${(headR * 0.6).toFixed(
      1
    )}" ry="${(headR * 0.85).toFixed(
      1
    )}" fill="${shadeFill}" stroke="#000000" stroke-width="${thinSw}" />`;
    // Tail
    art += `<path d="M ${cx + headR * 0.9} ${cy + innerH * 0.25} C ${cx + headR * 1.9} ${
      cy + innerH * 0.25
    }, ${cx + headR * 1.95} ${cy + innerH * 0.02}, ${cx + headR * 1.45} ${
      cy + innerH * 0.05
    }" fill="none" stroke="#000000" stroke-width="${sw * 3.5}" stroke-linecap="round" />`;
    art += `<path d="M ${cx + headR * 0.9} ${cy + innerH * 0.25} C ${cx + headR * 1.9} ${
      cy + innerH * 0.25
    }, ${cx + headR * 1.95} ${cy + innerH * 0.02}, ${cx + headR * 1.45} ${
      cy + innerH * 0.05
    }" fill="none" stroke="#FFFFFF" stroke-width="${sw * 2.1}" stroke-linecap="round" />`;
    // Head
    art += `<circle cx="${cx}" cy="${headY.toFixed(1)}" r="${headR.toFixed(
      1
    )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    // Eyes, nose, whiskers
    art += `<circle cx="${cx - headR * 0.38}" cy="${
      headY - headR * 0.1
    }" r="36" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<circle cx="${cx + headR * 0.38}" cy="${
      headY - headR * 0.1
    }" r="36" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<circle cx="${cx - headR * 0.38}" cy="${headY - headR * 0.1}" r="14" fill="#000000" />`;
    art += `<circle cx="${cx + headR * 0.38}" cy="${headY - headR * 0.1}" r="14" fill="#000000" />`;
    art += `<polygon points="${cx - 24},${headY + 35} ${cx + 24},${headY + 35} ${cx},${
      headY + 62
    }" fill="${midShadeFill}" stroke="#000000" stroke-width="${thinSw}" />`;
    // Ground grass & flowers
    const gy = cy + innerH * 0.32;
    art += `<line x1="${margin + 22}" y1="${gy}" x2="${
      margin + innerW - 22
    }" y2="${gy}" stroke="#000000" stroke-width="${sw}" />`;
  } else if (isPagoda) {
    // Sun rays & clouds in upper sky
    const sunY = margin + innerH * 0.22;
    const sunR = innerW * 0.1;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      art += `<line x1="${(cx + Math.cos(a) * sunR * 1.15).toFixed(1)}" y1="${(
        sunY +
        Math.sin(a) * sunR * 1.15
      ).toFixed(1)}" x2="${(cx + Math.cos(a) * sunR * 1.55).toFixed(1)}" y2="${(
        sunY +
        Math.sin(a) * sunR * 1.55
      ).toFixed(1)}" stroke="#000000" stroke-width="${thinSw}" stroke-linecap="round" />`;
    }
    art += `<circle cx="${cx}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(
      1
    )}" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Stylized clouds
    for (let c = 0; c < 3; c++) {
      const clx = margin + innerW * (0.2 + c * 0.3);
      const cly = margin + innerH * (0.14 + (c % 2) * 0.12);
      art += `<path d="M ${clx - 130} ${cly} C ${clx - 130} ${cly - 65}, ${clx - 30} ${
        cly - 85
      }, ${clx} ${cly - 50} C ${clx + 40} ${cly - 90}, ${clx + 140} ${cly - 55}, ${
        clx + 130
      } ${cly} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }

    // Rolling hills
    const hillY = margin + innerH * 0.68;
    art += `<path d="M ${margin + 22} ${hillY} Q ${cx - innerW * 0.22} ${
      hillY - 140
    } ${cx} ${hillY - 20} T ${margin + innerW - 22} ${hillY} L ${margin + innerW - 22} ${
      margin + innerH - 22
    } L ${margin + 22} ${margin + innerH - 22} Z" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Tiered Pagoda centerpiece
    const baseY = margin + innerH * 0.72;
    const baseW = innerW * 0.42;
    const tiers = [
      { w: baseW, h: innerH * 0.08 },
      { w: baseW * 0.78, h: innerH * 0.075 },
      { w: baseW * 0.56, h: innerH * 0.07 },
      { w: baseW * 0.36, h: innerH * 0.08 },
    ];
    let curY = baseY;
    for (const tier of tiers) {
      art += `<rect x="${(cx - tier.w / 2).toFixed(1)}" y="${(curY - tier.h).toFixed(
        1
      )}" width="${tier.w.toFixed(1)}" height="${tier.h.toFixed(
        1
      )}" rx="10" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      // Decorative arch door on base tier
      if (tier === tiers[0]) {
        const archW = tier.w * 0.24;
        const archH = tier.h * 0.68;
        art += `<path d="M ${(cx - archW / 2).toFixed(1)} ${curY.toFixed(1)} L ${(
          cx - archW / 2
        ).toFixed(1)} ${(curY - archH * 0.55).toFixed(1)} A ${(archW / 2).toFixed(1)} ${(
          archW / 2
        ).toFixed(1)} 0 0 1 ${(cx + archW / 2).toFixed(1)} ${(curY - archH * 0.55).toFixed(
          1
        )} L ${(cx + archW / 2).toFixed(1)} ${curY.toFixed(
          1
        )} Z" fill="${midShadeFill}" stroke="#000000" stroke-width="${thinSw}" />`;
      }
      curY -= tier.h;
    }
    // Bell & Spire
    art += `<path d="M ${(cx - baseW * 0.16).toFixed(1)} ${curY.toFixed(1)} Q ${(
      cx -
      baseW * 0.08
    ).toFixed(1)} ${(curY - innerH * 0.12).toFixed(1)} ${cx} ${(
      curY -
      innerH * 0.22
    ).toFixed(1)} Q ${(cx + baseW * 0.08).toFixed(1)} ${(curY - innerH * 0.12).toFixed(
      1
    )} ${(cx + baseW * 0.16).toFixed(1)} ${curY.toFixed(
      1
    )} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;

    // Foreground Lotus Petals
    for (let i = -3; i <= 3; i++) {
      const lx = cx + i * (innerW * 0.12);
      const ly = margin + innerH * 0.87;
      art += `<path d="M ${lx} ${ly - 70} Q ${lx + 45} ${ly - 20} ${lx} ${
        ly + 45
      } Q ${lx - 45} ${ly - 20} ${lx} ${ly - 70} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }
  } else if (isOcean) {
    // Ocean waves + sun + sailing boat line art
    const horizonY = margin + innerH * 0.45;
    art += `<circle cx="${cx + innerW * 0.18}" cy="${(horizonY - innerH * 0.16).toFixed(
      1
    )}" r="${(innerW * 0.11).toFixed(1)}" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Sailboat
    const bx = cx - innerW * 0.08;
    art += `<path d="M ${bx - 160} ${horizonY} L ${bx + 160} ${horizonY} L ${bx + 115} ${
      horizonY + 75
    } L ${bx - 115} ${horizonY + 75} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<path d="M ${bx} ${horizonY - 280} L ${bx + 145} ${horizonY - 20} L ${bx} ${
      horizonY - 20
    } Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    art += `<path d="M ${bx - 18} ${horizonY - 230} L ${bx - 130} ${horizonY - 20} L ${
      bx - 18
    } ${horizonY - 20} Z" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Layered wave bands
    for (let row = 0; row < 6; row++) {
      const wy = horizonY + 85 + row * (innerH * 0.075);
      let d = `M ${margin + 22} ${wy}`;
      const segs = 6;
      const segW = (innerW - 44) / segs;
      for (let s = 0; s < segs; s++) {
        const sx = margin + 22 + s * segW;
        d += ` Q ${(sx + segW * 0.5).toFixed(1)} ${(wy - 55).toFixed(1)} ${(sx + segW).toFixed(
          1
        )} ${wy.toFixed(1)}`;
      }
      d += ` L ${margin + innerW - 22} ${margin + innerH - 22} L ${margin + 22} ${
        margin + innerH - 22
      } Z`;
      art += `<path d="${d}" fill="${row % 2 === 0 ? "#FFFFFF" : shadeFill}" stroke="#000000" stroke-width="${sw}" />`;
    }
  } else if (isFloral) {
    // Botanical Bouquet & Leaves line art
    const flowerCount = 5;
    for (let f = 0; f < flowerCount; f++) {
      const fx = cx + (f - 2) * (innerW * 0.14) + (rand() - 0.5) * 60;
      const fy = cy - innerH * 0.1 + ((f % 2) * 140 - 70);
      const r = innerW * (0.095 + (f === 2 ? 0.03 : 0));
      // Stem
      art += `<path d="M ${fx} ${fy} Q ${cx + (fx - cx) * 0.4} ${cy + innerH * 0.2} ${cx} ${
        margin + innerH - 80
      }" fill="none" stroke="#000000" stroke-width="${sw * 1.1}" />`;
      // Leaves on stem
      art += `<ellipse cx="${(fx + (cx - fx) * 0.35 - 55).toFixed(1)}" cy="${(
        fy + 220
      ).toFixed(1)}" rx="68" ry="28" transform="rotate(-28 ${(
        fx +
        (cx - fx) * 0.35 -
        55
      ).toFixed(1)} ${(fy + 220).toFixed(
        1
      )})" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      // Petals
      const petals = 10;
      for (let p = 0; p < petals; p++) {
        const ang = (p / petals) * 360;
        art += `<ellipse cx="${fx.toFixed(1)}" cy="${(fy - r * 0.85).toFixed(
          1
        )}" rx="${(r * 0.34).toFixed(1)}" ry="${(r * 0.72).toFixed(
          1
        )}" transform="rotate(${ang} ${fx.toFixed(1)} ${fy.toFixed(
          1
        )})" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      }
      art += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(r * 0.35).toFixed(
        1
      )}" fill="${midShadeFill}" stroke="#000000" stroke-width="${sw}" />`;
    }
  } else {
    // Storybook Landscape: Sun, Clouds, Layered Mountains, Winding Path & Pine Trees
    const sunX = cx + (rand() - 0.5) * innerW * 0.35;
    const sunY = margin + innerH * 0.22;
    const sunR = innerW * 0.095;
    art += `<circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(
      1
    )}" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Clouds
    for (let c = 0; c < 3; c++) {
      const clx = margin + innerW * (0.22 + c * 0.28);
      const cly = margin + innerH * (0.14 + (c % 2) * 0.1);
      art += `<path d="M ${clx - 120} ${cly} C ${clx - 115} ${cly - 60}, ${clx - 35} ${
        cly - 80
      }, ${clx} ${cly - 45} C ${clx + 40} ${cly - 85}, ${clx + 125} ${cly - 50}, ${
        clx + 120
      } ${cly} Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }

    // Layered Mountains
    const mY1 = margin + innerH * 0.52;
    art += `<path d="M ${margin + 22} ${mY1} L ${margin + innerW * 0.25} ${
      mY1 - 260
    } L ${margin + innerW * 0.48} ${mY1 - 60} L ${margin + innerW * 0.72} ${
      mY1 - 310
    } L ${margin + innerW - 22} ${mY1 - 40} L ${margin + innerW - 22} ${
      margin + innerH - 22
    } L ${margin + 22} ${margin + innerH - 22} Z" fill="${shadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Rolling foreground hills + winding path
    const hY = margin + innerH * 0.68;
    art += `<path d="M ${margin + 22} ${hY} Q ${cx} ${hY - 120} ${margin + innerW - 22} ${
      hY + 20
    } L ${margin + innerW - 22} ${margin + innerH - 22} L ${margin + 22} ${
      margin + innerH - 22
    } Z" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;

    // Winding road
    art += `<path d="M ${cx - 30} ${hY - 50} Q ${cx - 180} ${hY + 180} ${cx - 60} ${
      margin + innerH - 22
    } L ${cx + 150} ${margin + innerH - 22} Q ${cx - 40} ${hY + 180} ${cx + 25} ${
      hY - 50
    } Z" fill="${midShadeFill}" stroke="#000000" stroke-width="${sw}" />`;

    // Pine Trees
    const treePositions = [
      { x: margin + innerW * 0.16, y: hY + 260, s: 1.1 },
      { x: margin + innerW * 0.28, y: hY + 150, s: 0.8 },
      { x: margin + innerW * 0.78, y: hY + 280, s: 1.15 },
      { x: margin + innerW * 0.87, y: hY + 160, s: 0.85 },
    ];
    for (const tr of treePositions) {
      const tw = 150 * tr.s;
      const th = 260 * tr.s;
      art += `<rect x="${(tr.x - 16 * tr.s).toFixed(1)}" y="${tr.y.toFixed(1)}" width="${(
        32 * tr.s
      ).toFixed(1)}" height="${(65 * tr.s).toFixed(
        1
      )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      art += `<polygon points="${tr.x},${(tr.y - th).toFixed(1)} ${(tr.x - tw * 0.55).toFixed(
        1
      )},${tr.y.toFixed(1)} ${(tr.x + tw * 0.55).toFixed(1)},${tr.y.toFixed(
        1
      )}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
      art += `<polygon points="${tr.x},${(tr.y - th * 1.15).toFixed(1)} ${(
        tr.x -
        tw * 0.42
      ).toFixed(1)},${(tr.y - th * 0.42).toFixed(1)} ${(tr.x + tw * 0.42).toFixed(1)},${(
        tr.y -
        th * 0.42
      ).toFixed(1)}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#FFFFFF" />
    ${art}
  </svg>`;
}

export function buildProceduralSvg(
  prompt: string,
  width: number,
  height: number,
  mood: MoodPreset
): string {
  const lower = prompt.toLowerCase();
  const palette = MOOD_PALETTES[mood] || MOOD_PALETTES["Editorial Film"];
  const rand = seededRand(hashPrompt(prompt + mood));

  const isNight =
    lower.includes("night") ||
    lower.includes("moon") ||
    lower.includes("cyber") ||
    lower.includes("neon") ||
    lower.includes("ည") ||
    lower.includes("လ");
  const isPagoda =
    lower.includes("bagan") ||
    lower.includes("pagoda") ||
    lower.includes("temple") ||
    lower.includes("ပုဂံ") ||
    lower.includes("ဘုရား") ||
    lower.includes("စေတီ");
  const isOcean =
    lower.includes("ocean") ||
    lower.includes("sea") ||
    lower.includes("wave") ||
    lower.includes("water") ||
    lower.includes("beach") ||
    lower.includes("ပင်လယ်") ||
    lower.includes("ရေ");
  const isCity =
    lower.includes("city") ||
    lower.includes("street") ||
    lower.includes("tokyo") ||
    lower.includes("building") ||
    lower.includes("မြို့");

  const skyTop = isNight ? "#090B16" : palette[0];
  const skyMid = isNight ? "#1E2246" : palette[1];
  const skyLow = palette[2];
  const glowColor = palette[3];
  const highlight = palette[4];

  const sunX = width * (0.28 + rand() * 0.44);
  const sunY = height * (0.24 + rand() * 0.24);
  const sunR = Math.min(width, height) * (0.09 + rand() * 0.07);

  let layers = "";

  if (isNight) {
    for (let i = 0; i < 48; i++) {
      const sx = rand() * width;
      const sy = rand() * height * 0.62;
      const sr = 0.8 + rand() * 1.8;
      const op = 0.25 + rand() * 0.7;
      layers += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(
        1
      )}" fill="${highlight}" opacity="${op.toFixed(2)}" />`;
    }
  }

  layers += `
    <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR * 2.8).toFixed(
    1
  )}" fill="url(#sunGlow)" opacity="0.65" />
    <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(
    1
  )}" fill="${highlight}" opacity="0.92" />
  `;

  for (let i = 0; i < 5; i++) {
    const cy = height * (0.25 + i * 0.08 + rand() * 0.04);
    const cx = width * (0.15 + rand() * 0.7);
    const rx = width * (0.22 + rand() * 0.28);
    const ry = height * (0.025 + rand() * 0.03);
    layers += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(
      1
    )}" ry="${ry.toFixed(1)}" fill="${highlight}" opacity="0.11" filter="url(#softBlur)" />`;
  }

  const ridgeCount = 3;
  for (let r = 0; r < ridgeCount; r++) {
    const baseY = height * (0.52 + r * 0.1);
    let d = `M 0 ${height} L 0 ${baseY.toFixed(1)}`;
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      const px = (width / steps) * s;
      const py = baseY - rand() * height * (0.14 - r * 0.025) + (rand() - 0.5) * 20;
      d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    d += ` L ${width} ${height} Z`;
    const fillOp = 0.35 + r * 0.22;
    layers += `<path d="${d}" fill="${
      r === ridgeCount - 1 ? palette[0] : palette[1]
    }" opacity="${fillOp.toFixed(2)}" />`;
  }

  if (isPagoda) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const tx = width * (0.18 + i * 0.2 + (rand() - 0.5) * 0.06);
      const ty = height * (0.64 + (i % 2) * 0.06);
      const scale = 0.75 + rand() * 0.55;
      const w = 90 * scale;
      const h = 150 * scale;
      layers += `
        <g fill="${palette[0]}" opacity="0.92">
          <rect x="${tx - w * 0.55}" y="${ty}" width="${w * 1.1}" height="${h * 0.35}" rx="3" />
          <polygon points="${tx - w * 0.42},${ty} ${tx + w * 0.42},${ty} ${tx + w * 0.25},${
        ty - h * 0.35
      } ${tx - w * 0.25},${ty - h * 0.35}" />
          <polygon points="${tx - w * 0.22},${ty - h * 0.35} ${tx + w * 0.22},${ty - h * 0.35} ${tx},${
        ty - h * 0.95
      }" />
          <line x1="${tx}" y1="${ty - h * 0.95}" x2="${tx}" y2="${
        ty - h * 1.12
      }" stroke="${glowColor}" stroke-width="3" />
        </g>
      `;
    }
  } else if (isCity) {
    const buildings = 14;
    const bw = width / buildings;
    for (let i = 0; i < buildings; i++) {
      const bh = height * (0.18 + rand() * 0.34);
      const bx = i * bw;
      const by = height * 0.78 - bh;
      layers += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(bw - 4).toFixed(
        1
      )}" height="${bh.toFixed(1)}" fill="#0D0F18" opacity="0.94" />`;
      for (let wy = by + 14; wy < height * 0.74; wy += 18) {
        if (rand() > 0.45) {
          layers += `<rect x="${(bx + 8).toFixed(1)}" y="${wy.toFixed(1)}" width="${(
            bw * 0.35
          ).toFixed(1)}" height="6" fill="${glowColor}" opacity="${(0.35 + rand() * 0.5).toFixed(
            2
          )}" />`;
        }
      }
    }
  }

  if (isOcean) {
    const waterY = height * 0.66;
    layers += `<rect x="0" y="${waterY}" width="${width}" height="${
      height - waterY
    }" fill="url(#waterGrad)" opacity="0.9" />`;
    for (let i = 0; i < 16; i++) {
      const wy = waterY + 12 + i * ((height - waterY) / 16);
      const ww = width * 0.14 * (1 - i * 0.03);
      const wx = sunX - ww / 2 + (rand() - 0.5) * 40;
      layers += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${Math.max(
        24,
        ww
      ).toFixed(1)}" height="3" rx="1.5" fill="${highlight}" opacity="${(0.55 - i * 0.025).toFixed(
        2
      )}" />`;
    }
  } else {
    layers += `<rect x="0" y="${(height * 0.76).toFixed(1)}" width="${width}" height="${(
      height * 0.24
    ).toFixed(1)}" fill="${palette[0]}" opacity="0.95" />`;
  }

  layers += `<rect x="0" y="${(height * 0.6).toFixed(1)}" width="${width}" height="${(
    height * 0.18
  ).toFixed(1)}" fill="url(#mistGrad)" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}" />
        <stop offset="55%" stop-color="${skyMid}" />
        <stop offset="100%" stop-color="${skyLow}" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${highlight}" stop-opacity="0.95" />
        <stop offset="45%" stop-color="${glowColor}" stop-opacity="0.45" />
        <stop offset="100%" stop-color="${glowColor}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyLow}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${skyTop}" stop-opacity="0.98" />
      </linearGradient>
      <linearGradient id="mistGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${highlight}" stop-opacity="0" />
        <stop offset="50%" stop-color="${highlight}" stop-opacity="0.18" />
        <stop offset="100%" stop-color="${skyTop}" stop-opacity="0" />
      </linearGradient>
      <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#skyGrad)" />
    ${layers}
  </svg>`;
}

export async function rasterizeSvgToPng(
  svgMarkup: string,
  width: number,
  height: number,
  options?: {
    colorMode?: ColoringColorMode;
    dpi?: PrintDpi;
  }
): Promise<string> {
  const rawPng = await new Promise<string>((resolve, reject) => {
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }

      if (options?.colorMode) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      if (options?.colorMode === "bw") {
        // Strict Black & White Monochrome Line Art (0 or 255, zero RGB color)
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const v = lum < 175 ? 0 : 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (options?.colorMode === "grayscale") {
        // Strict Grayscale (R === G === B, zero RGB color)
        for (let i = 0; i < data.length; i += 4) {
          const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          data[i] = lum;
          data[i + 1] = lum;
          data[i + 2] = lum;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      } else {
        // Standard Art Mode: subtle 35mm photographic grain overlay
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 10;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

  if (options?.dpi) {
    return applyDpiToPngDataUrl(rawPng, options.dpi);
  }
  return rawPng;
}
