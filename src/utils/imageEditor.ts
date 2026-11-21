import {
  AiEditColoringConfig,
  AiEditPlan,
  EditOverlayLayer,
  FontOption,
  PhotoAdjustments,
  TextCanvasAspect,
  TextLayer,
  TextStudioImageLayer,
} from "../types/studio";
import { applyDpiToPngDataUrl } from "./exportTools";
import { getColoringDimensions } from "./proceduralArt";
import { getTextCanvasDimensions } from "./promoStudio";
import { drawTextBoundOnCanvas } from "./textBoundRenderer";

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  vignette: 0,
  filter: "original",
  rotation: 0,
  flipH: false,
};

export const FONT_OPTIONS: FontOption[] = [
  { id: "fredoka", label: "Fredoka Storybook", family: "'Fredoka', 'Padauk', sans-serif", sample: "A BIG STORY", tag: "Storybook" },
  { id: "baloo", label: "Baloo Comic", family: "'Baloo 2', 'Padauk', sans-serif", sample: "BOLD TITLE", tag: "Comic" },
  { id: "padauk", label: "Padauk (Myanmar)", family: "'Padauk', sans-serif", sample: "မင်္ဂလာပါ · Studio", tag: "MM Sans" },
  { id: "noto-mm", label: "Noto Sans Myanmar", family: "'Noto Sans Myanmar', sans-serif", sample: "ခေတ်မီဒီဇိုင်း · Modern", tag: "MM Clean" },
  { id: "noto-serif-mm", label: "Noto Serif Myanmar", family: "'Noto Serif Myanmar', serif", sample: "မြန်မာစာပေ · Classic", tag: "MM Serif" },
  { id: "outfit", label: "Outfit Display", family: "'Outfit', 'Padauk', sans-serif", sample: "Bold Editorial", tag: "Display" },
  { id: "playfair", label: "Playfair Display", family: "'Playfair Display', 'Noto Serif Myanmar', serif", sample: "Luxury Monograph", tag: "Serif" },
  { id: "oswald", label: "Oswald Poster", family: "'Oswald', 'Padauk', sans-serif", sample: "CINEMA POSTER", tag: "Condensed" },
  { id: "caveat", label: "Caveat Script", family: "'Caveat', 'Padauk', cursive", sample: "Handwritten Note", tag: "Script" },
  { id: "bricolage", label: "Bricolage Grotesque", family: "'Bricolage Grotesque', 'Padauk', sans-serif", sample: "Art Direction", tag: "Modern" },
  { id: "jetbrains", label: "JetBrains Mono", family: "'JetBrains Mono', monospace", sample: "FRAME 024 · RAW", tag: "Mono" },
];

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

export function buildFilterString(adj: PhotoAdjustments): string {
  let b = adj.brightness;
  let c = adj.contrast;
  let s = adj.saturation;
  let sepia = 0;
  let hue = 0;

  if (adj.filter === "warm-film") {
    sepia = 22;
    c += 8;
    s += 10;
  } else if (adj.filter === "mono") {
    s = 0;
    c += 18;
  } else if (adj.filter === "vivid") {
    s += 35;
    c += 12;
  } else if (adj.filter === "noir") {
    s = 10;
    c += 32;
    b -= 8;
  } else if (adj.filter === "sunset") {
    sepia = 18;
    hue = -8;
    s += 25;
  }

  if (adj.warmth > 0) {
    sepia += adj.warmth * 0.5;
  } else if (adj.warmth < 0) {
    hue += adj.warmth * 0.4;
  }

  return `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
}

export async function renderEditedPhoto(
  src: string,
  adj: PhotoAdjustments
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);
  const swap = adj.rotation === 90 || adj.rotation === 270;
  const width = swap ? img.naturalHeight || 900 : img.naturalWidth || 1200;
  const height = swap ? img.naturalWidth || 1200 : img.naturalHeight || 900;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.save();
  ctx.filter = buildFilterString(adj);
  ctx.translate(width / 2, height / 2);
  ctx.rotate((adj.rotation * Math.PI) / 180);
  ctx.scale(adj.flipH ? -1 : 1, 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  if (adj.vignette > 0) {
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.28,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(0,0,0,${(adj.vignette / 100) * 0.75})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const iw = img.naturalWidth || dw;
  const ih = img.naturalHeight || dh;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawBadgeSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  badgeText: string
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = radius * 0.35;
  ctx.shadowOffsetY = radius * 0.12;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0E7490";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.strokeStyle = "#FDE047";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.84, 0, Math.PI * 2);
  ctx.setLineDash([radius * 0.14, radius * 0.1]);
  ctx.lineWidth = Math.max(1.5, radius * 0.04);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.stroke();
  ctx.setLineDash([]);

  const lines = badgeText.split("\n").slice(0, 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (lines.length === 1) {
    ctx.font = `700 ${Math.round(radius * 0.42)}px 'Fredoka', 'Outfit', sans-serif`;
    ctx.fillText(lines[0], cx, cy, radius * 1.6);
  } else {
    ctx.font = `700 ${Math.round(radius * 0.62)}px 'Fredoka', 'Outfit', sans-serif`;
    ctx.fillStyle = "#FDE047";
    ctx.fillText(lines[0], cx, cy - radius * 0.18, radius * 1.5);
    ctx.font = `700 ${Math.round(radius * 0.25)}px 'Outfit', sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(lines[1], cx, cy + radius * 0.34, radius * 1.6);
  }
  ctx.restore();
}

export async function renderTextStudioComposite(
  bgSource:
    | { type: "image"; src: string }
    | { type: "gradient"; css: string; colors: [string, string] },
  layers: TextLayer[],
  targetWidth = 1200,
  targetHeight = 900,
  imageLayers: TextStudioImageLayer[] = [],
  aspectRatio: TextCanvasAspect = "auto"
): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  let w = targetWidth;
  let h = targetHeight;

  let loadedImg: HTMLImageElement | null = null;
  if (bgSource.type === "image" && bgSource.src) {
    loadedImg = await loadImage(bgSource.src);
    if (aspectRatio === "auto") {
      w = loadedImg.naturalWidth || targetWidth;
      h = loadedImg.naturalHeight || targetHeight;
      const maxDim = 1920;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
    } else {
      const dims = getTextCanvasDimensions(aspectRatio);
      w = dims.width;
      h = dims.height;
    }
  } else if (aspectRatio !== "auto") {
    const dims = getTextCanvasDimensions(aspectRatio);
    w = dims.width;
    h = dims.height;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  if (loadedImg) {
    drawCoverImage(ctx, loadedImg, 0, 0, w, h);
  } else if (bgSource.type === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, bgSource.colors[0]);
    grad.addColorStop(1, bgSource.colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "#18181B";
    ctx.fillRect(0, 0, w, h);
  }

  const baseScale = Math.min(w, h) / 1000;

  // Render Overlay Image / Card / Book Cover Layers
  for (const imgLayer of imageLayers) {
    if (!imgLayer.src) continue;
    let overlayImg: HTMLImageElement;
    try {
      overlayImg = await loadImage(imgLayer.src);
    } catch {
      continue;
    }

    const cx = (imgLayer.x / 100) * w;
    const cy = (imgLayer.y / 100) * h;
    const drawW = (imgLayer.widthPct / 100) * w;
    const drawH = drawW / Math.max(0.25, imgLayer.aspectRatio || 1);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((imgLayer.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0.05, Math.min(1, imgLayer.opacity ?? 1));

    if (imgLayer.frameStyle === "book-cover") {
      const pageThickness = Math.max(10, drawW * 0.036);
      const radius = Math.max(6, drawW * 0.02);

      // Soft Drop Shadow under book
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.48)";
      ctx.shadowBlur = drawW * 0.09;
      ctx.shadowOffsetX = drawW * 0.02;
      ctx.shadowOffsetY = drawW * 0.04;
      ctx.fillStyle = "#E5E7EB";
      ctx.beginPath();
      ctx.roundRect(
        -drawW / 2,
        -drawH / 2,
        drawW + pageThickness,
        drawH + pageThickness * 0.45,
        radius
      );
      ctx.fill();
      ctx.restore();

      // White page edge block on right
      ctx.fillStyle = "#F8FAFC";
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-drawW / 2 + pageThickness * 0.5, -drawH / 2 + 4, drawW, drawH, radius);
      ctx.fill();
      ctx.stroke();

      // Subtle page lines on right edge
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const px = drawW / 2 + (pageThickness * i) / 6;
        ctx.beginPath();
        ctx.moveTo(px, -drawH / 2 + 8);
        ctx.lineTo(px, drawH / 2 - 4);
        ctx.stroke();
      }

      // Main front cover image clipped
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, radius);
      ctx.clip();
      drawCoverImage(ctx, overlayImg, -drawW / 2, -drawH / 2, drawW, drawH);

      // Realistic spine crease highlight on left edge
      const spineGrad = ctx.createLinearGradient(-drawW / 2, 0, -drawW / 2 + drawW * 0.08, 0);
      spineGrad.addColorStop(0, "rgba(0,0,0,0.32)");
      spineGrad.addColorStop(0.3, "rgba(255,255,255,0.28)");
      spineGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = spineGrad;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW * 0.08, drawH);
      ctx.restore();

      // Crisp border
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = Math.max(2, drawW * 0.006);
      ctx.beginPath();
      ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, radius);
      ctx.stroke();

      if (imgLayer.badgeText?.trim()) {
        drawBadgeSeal(
          ctx,
          drawW * 0.34,
          drawH * 0.14,
          drawW * 0.13,
          imgLayer.badgeText.trim()
        );
      }
    } else if (imgLayer.frameStyle === "tilt-card") {
      const pad = Math.max(8, drawW * 0.045);
      const captionH = imgLayer.caption?.trim() ? Math.max(26, drawW * 0.17) : 0;
      const cardW = drawW + pad * 2;
      const cardH = drawH + pad * 2 + captionH;
      const cardR = Math.max(6, drawW * 0.03);

      // Card paper shadow & white matte background
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.34)";
      ctx.shadowBlur = drawW * 0.08;
      ctx.shadowOffsetY = drawW * 0.03;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cardR);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "#E4E4E7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cardR);
      ctx.stroke();

      // Inner artwork
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-drawW / 2, -cardH / 2 + pad, drawW, drawH, Math.max(3, cardR * 0.5));
      ctx.clip();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-drawW / 2, -cardH / 2 + pad, drawW, drawH);
      drawCoverImage(ctx, overlayImg, -drawW / 2, -cardH / 2 + pad, drawW, drawH);
      ctx.restore();

      // Inner subtle border
      ctx.strokeStyle = "#E4E4E7";
      ctx.lineWidth = 1;
      ctx.strokeRect(-drawW / 2, -cardH / 2 + pad, drawW, drawH);

      if (imgLayer.caption?.trim()) {
        const capLines = imgLayer.caption.trim().split("\n").slice(0, 2);
        ctx.fillStyle = "#18181B";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const capY = cardH / 2 - captionH / 2 - pad * 0.15;
        if (capLines.length === 1) {
          ctx.font = `700 ${Math.max(10, Math.round(drawW * 0.068))}px 'Outfit', 'Padauk', sans-serif`;
          ctx.fillText(capLines[0], 0, capY, drawW * 0.96);
        } else {
          ctx.font = `700 ${Math.max(10, Math.round(drawW * 0.062))}px 'Outfit', 'Padauk', sans-serif`;
          ctx.fillText(capLines[0], 0, capY - drawW * 0.036, drawW * 0.96);
          ctx.fillStyle = "#52525B";
          ctx.font = `500 ${Math.max(9, Math.round(drawW * 0.05))}px 'Outfit', 'Padauk', sans-serif`;
          ctx.fillText(capLines[1], 0, capY + drawW * 0.04, drawW * 0.96);
        }
      }
    } else if (imgLayer.frameStyle === "circle-badge") {
      const r = Math.min(drawW, drawH) / 2;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = r * 0.25;
      ctx.shadowOffsetY = r * 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.clip();
      drawCoverImage(ctx, overlayImg, -r, -r, r * 2, r * 2);
      ctx.restore();

      ctx.strokeStyle = "#FBBF24";
      ctx.lineWidth = Math.max(3, r * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = drawW * 0.06;
      ctx.shadowOffsetY = drawW * 0.02;
      ctx.drawImage(overlayImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    ctx.restore();
  }

  // Render Text & Promotional Banner Layers
  for (const layer of layers) {
    drawTextLayerOnCanvas(ctx, layer, w, h);
  }

  return { dataUrl: canvas.toDataURL("image/png"), width: w, height: h };
}

export function drawTextLayerOnCanvas(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  w: number,
  h: number
) {
  if (!layer.text.trim()) return;
  const baseScale = Math.min(w, h) / 1000;
  ctx.save();
  const px = (layer.x / 100) * w;
  const py = (layer.y / 100) * h;
  ctx.translate(px, py);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;

    const scaledSize = Math.max(16, Math.round(layer.fontSize * baseScale));
    ctx.font = `${layer.fontWeight} ${scaledSize}px ${layer.fontFamily}`;
    ctx.textAlign = layer.align;
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${
        layer.letterSpacing * baseScale
      }px`;
    }

    const lines = layer.text.split("\n");
    const lineHeight = scaledSize * 1.22;
    const totalHeight = lines.length * lineHeight;

    let maxLineWidth = 0;
    for (const ln of lines) {
      const m = ctx.measureText(ln);
      if (m.width > maxLineWidth) maxLineWidth = m.width;
    }

    const padX = scaledSize * (layer.stylePreset === "banner-pill" || layer.stylePreset === "ribbon-scroll" ? 0.85 : 0.55);
    const padY = scaledSize * (layer.stylePreset === "banner-pill" || layer.stylePreset === "ribbon-scroll" ? 0.42 : 0.35);
    let boxX = -maxLineWidth / 2 - padX;
    if (layer.align === "left") boxX = -padX;
    if (layer.align === "right") boxX = -maxLineWidth - padX;
    const boxY = -totalHeight / 2 - padY;
    const boxW = maxLineWidth + padX * 2;
    const boxH = totalHeight + padY * 2;

    if (layer.boundStyle && layer.boundStyle !== "none") {
      const hasInnerBox =
        layer.stylePreset === "pill-box" ||
        layer.stylePreset === "banner-pill" ||
        layer.stylePreset === "ribbon-scroll";
      const bPadX = (layer.boundPadX ?? 36) * baseScale;
      const bPadY = (layer.boundPadY ?? 18) * baseScale;
      const innerW = hasInnerBox ? boxW : maxLineWidth;
      const innerH = hasInnerBox ? boxH : totalHeight;
      const bBoxW = innerW + bPadX * 2;
      const bBoxH = innerH + bPadY * 2;
      let bBoxX = -bBoxW / 2;
      if (layer.align === "left") {
        bBoxX = (hasInnerBox ? -padX : 0) - bPadX;
      } else if (layer.align === "right") {
        bBoxX = -maxLineWidth - (hasInnerBox ? padX : 0) - bPadX;
      }
      const bBoxY = -bBoxH / 2;

      drawTextBoundOnCanvas(ctx, bBoxX, bBoxY, bBoxW, bBoxH, baseScale, {
        style: layer.boundStyle,
        thickness: layer.boundThickness ?? 4,
        radius: layer.boundRadius ?? 14,
        strokeColor: layer.boundColor || "#FFFFFF",
        fillColor: layer.boundFillColor || "#111113",
        fillOpacity: layer.boundFillOpacity ?? 0,
      });
    }

    if (layer.stylePreset === "pill-box") {
      ctx.fillStyle = layer.bgColor;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, Math.min(24 * baseScale, boxH / 2));
      ctx.fill();
    } else if (layer.stylePreset === "banner-pill") {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = 16 * baseScale;
      ctx.shadowOffsetY = 6 * baseScale;
      ctx.fillStyle = layer.bgColor;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH / 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = layer.strokeColor || layer.accentColor;
      ctx.lineWidth = Math.max(2.5, (layer.strokeWidth ?? 4) * baseScale);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH / 2);
      ctx.stroke();

      // Subtle starburst ticks at edges
      ctx.strokeStyle = layer.strokeColor || layer.accentColor;
      ctx.lineWidth = Math.max(2, 3 * baseScale);
      ctx.lineCap = "round";
      const rx1 = boxX - 10 * baseScale;
      const rx2 = boxX + boxW + 10 * baseScale;
      for (const dy of [-10, 0, 10]) {
        ctx.beginPath();
        ctx.moveTo(rx1, dy * baseScale);
        ctx.lineTo(rx1 - 12 * baseScale, dy * 1.4 * baseScale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx2, dy * baseScale);
        ctx.lineTo(rx2 + 12 * baseScale, dy * 1.4 * baseScale);
        ctx.stroke();
      }
    } else if (layer.stylePreset === "ribbon-scroll") {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 12 * baseScale;
      ctx.shadowOffsetY = 4 * baseScale;
      ctx.fillStyle = layer.bgColor;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH * 0.45);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = layer.strokeColor || layer.accentColor;
      ctx.lineWidth = Math.max(2, (layer.strokeWidth ?? 3) * baseScale);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH * 0.45);
      ctx.stroke();

      // Small decorative green leaves on both ribbon sides
      for (const side of [-1, 1]) {
        const lx = side === -1 ? boxX + 18 * baseScale : boxX + boxW - 18 * baseScale;
        ctx.save();
        ctx.translate(lx, 0);
        ctx.fillStyle = "#65A30D";
        ctx.strokeStyle = "#14532D";
        ctx.lineWidth = Math.max(1.5, 2 * baseScale);
        ctx.beginPath();
        ctx.ellipse(0, -6 * baseScale, 10 * baseScale, 4.5 * baseScale, side * -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 6 * baseScale, 10 * baseScale, 4.5 * baseScale, side * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (layer.stylePreset === "quote-bar") {
      ctx.fillStyle = layer.accentColor;
      const barX = layer.align === "right" ? boxX + boxW - 6 * baseScale : boxX;
      ctx.fillRect(barX, boxY + 6 * baseScale, 6 * baseScale, boxH - 12 * baseScale);
    }

    const curveAmount = layer.curve ?? 0;

    const drawStyledTextSegment = (txt: string, xPos: number, yPos: number) => {
      if (layer.stylePreset === "comic-3d") {
        const sw = Math.max(4, (layer.strokeWidth ?? 10) * baseScale);
        const sColor = layer.strokeColor || "#111113";
        const dropOffset = Math.max(3, scaledSize * 0.085);

        // 3D extruded shadow
        ctx.save();
        ctx.fillStyle = sColor;
        ctx.strokeStyle = sColor;
        ctx.lineWidth = sw;
        ctx.lineJoin = "round";
        ctx.strokeText(txt, xPos, yPos + dropOffset);
        ctx.fillText(txt, xPos, yPos + dropOffset);
        ctx.restore();

        // Thick outline
        ctx.lineWidth = sw;
        ctx.strokeStyle = sColor;
        ctx.lineJoin = "round";
        ctx.strokeText(txt, xPos, yPos);

        // Vibrant vertical gradient fill
        const grad = ctx.createLinearGradient(0, yPos - scaledSize * 0.5, 0, yPos + scaledSize * 0.5);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, layer.accentColor);
        ctx.fillStyle = grad;
        ctx.fillText(txt, xPos, yPos);
      } else if (layer.stylePreset === "shadow") {
        ctx.shadowColor = "rgba(0,0,0,0.65)";
        ctx.shadowBlur = 18 * baseScale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6 * baseScale;
        ctx.fillStyle = layer.color;
        ctx.fillText(txt, xPos, yPos);
      } else if (layer.stylePreset === "neon") {
        ctx.shadowColor = layer.accentColor;
        ctx.shadowBlur = 28 * baseScale;
        ctx.fillStyle = layer.color;
        ctx.fillText(txt, xPos, yPos);
        ctx.shadowBlur = 12 * baseScale;
        ctx.fillText(txt, xPos, yPos);
      } else if (layer.stylePreset === "outline") {
        ctx.lineWidth = Math.max(3, scaledSize * 0.11);
        ctx.strokeStyle = layer.accentColor;
        ctx.lineJoin = "round";
        ctx.strokeText(txt, xPos, yPos);
        ctx.fillStyle = layer.color;
        ctx.fillText(txt, xPos, yPos);
      } else if (layer.stylePreset === "block-3d") {
        const offset = Math.max(3, scaledSize * 0.08);
        ctx.fillStyle = layer.accentColor;
        ctx.fillText(txt, xPos + offset, yPos + offset);
        ctx.fillStyle = layer.color;
        ctx.fillText(txt, xPos, yPos);
      } else if (layer.stylePreset === "gradient") {
        const grad = ctx.createLinearGradient(
          -maxLineWidth / 2,
          yPos - scaledSize / 2,
          maxLineWidth / 2,
          yPos + scaledSize / 2
        );
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, layer.accentColor);
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 10 * baseScale;
        ctx.fillStyle = grad;
        ctx.fillText(txt, xPos, yPos);
      } else {
        ctx.fillStyle = layer.color;
        ctx.fillText(txt, xPos, yPos);
      }
    };

    lines.forEach((line, idx) => {
      const ly = -totalHeight / 2 + lineHeight * (idx + 0.5);
      // Use curved path only when curve is non-zero and text has no Burmese combining glyphs splitting issue — or render char-by-char when Latin
      const hasCombiningMarks = /[\u1000-\u109F]/.test(line);
      if (Math.abs(curveAmount) >= 2 && !hasCombiningMarks && line.length > 2) {
        const chars = Array.from(line);
        const charWidths = chars.map((ch) => ctx.measureText(ch).width);
        const totalLineW = charWidths.reduce((a, b) => a + b, 0);
        const maxArcAngle = (curveAmount / 30) * 0.42; // radians across full line
        const radius = totalLineW / Math.max(0.05, Math.abs(maxArcAngle));
        const sign = curveAmount > 0 ? 1 : -1;

        ctx.save();
        ctx.textAlign = "center";
        let cursor = -totalLineW / 2;
        for (let c = 0; c < chars.length; c++) {
          const cw = charWidths[c];
          const mid = cursor + cw / 2;
          const theta = (mid / totalLineW) * maxArcAngle;
          const cxChar = Math.sin(theta) * radius * sign;
          const cyChar = ly + (1 - Math.cos(theta)) * radius * sign;
          ctx.save();
          ctx.translate(cxChar, cyChar);
          ctx.rotate(theta);
          drawStyledTextSegment(chars[c], 0, 0);
          ctx.restore();
          cursor += cw;
        }
        ctx.restore();
      } else {
        drawStyledTextSegment(line, 0, ly);
      }
    });

  ctx.restore();
}

export async function prepareImageForAiAnalysis(
  src: string,
  maxDim = 1280
): Promise<string> {
  const img = await loadImage(src);
  let w = img.naturalWidth || 1024;
  let h = img.naturalHeight || 768;
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.max(1, Math.round(w * ratio));
    h = Math.max(1, Math.round(h * ratio));
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function loadSvgImage(svgMarkup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export async function renderOriginalOnColoringPage(
  originalSrc: string,
  coloringConfig: AiEditColoringConfig
): Promise<string> {
  const img = await loadImage(originalSrc);
  const iw = img.naturalWidth || 1200;
  const ih = img.naturalHeight || 900;
  const dims = getColoringDimensions(coloringConfig.pageSize, coloringConfig.dpi);
  const outW = dims.width;
  const outH = dims.height;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, outW, outH);

  const margin = Math.round(Math.min(outW, outH) * 0.035);
  const availW = outW - margin * 2;
  const availH = outH - margin * 2;
  const scale = Math.min(availW / iw, availH / ih);
  const drawW = Math.round(iw * scale);
  const drawH = Math.round(ih * scale);
  const dx = Math.round((outW - drawW) / 2);
  const dy = Math.round((outH - drawH) / 2);

  ctx.drawImage(img, dx, dy, drawW, drawH);
  return canvas.toDataURL("image/png");
}

export async function renderAiEditedPhoto(
  originalSrc: string,
  plan: AiEditPlan,
  intensity = 1,
  coloringConfig?: AiEditColoringConfig
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(originalSrc);
  const w = img.naturalWidth || 1200;
  const h = img.naturalHeight || 900;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  const t = Math.max(0, Math.min(1, intensity));
  const isColoring = Boolean(coloringConfig?.enabled);
  const cg = plan.colorGrading || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    vignette: 0,
  };

  const brightness = isColoring ? 100 : 100 + ((cg.brightness ?? 100) - 100) * t;
  const contrast = isColoring
    ? 100 + ((cg.contrast ?? 105) - 100) * t
    : 100 + ((cg.contrast ?? 100) - 100) * t;
  const saturation = isColoring ? 0 : 100 + ((cg.saturation ?? 100) - 100) * t;
  const warmth = isColoring ? 0 : (cg.warmth ?? 0) * t;
  const sepia = warmth > 0 ? warmth * 0.55 : 0;
  const hue = warmth < 0 ? warmth * 0.45 : 0;

  ctx.save();
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();

  if (!isColoring && cg.tintColor && (cg.tintOpacity ?? 0) > 0 && t > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = Math.min(0.45, (cg.tintOpacity ?? 0) * t);
    ctx.fillStyle = cg.tintColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Selective feathered recolor regions (used when not in coloring mode or for grayscale shading)
  for (const region of plan.recolorRegions || []) {
    const regionAlpha = Math.max(0, Math.min(1, (region.opacity ?? 0.75) * t));
    if (regionAlpha <= 0 || !region.targetColor) continue;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mCtx = maskCanvas.getContext("2d");

    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = w;
    colorCanvas.height = h;
    const cCtx = colorCanvas.getContext("2d");

    if (!mCtx || !cCtx) continue;

    const featherPx = Math.max(
      0,
      ((region.feather ?? 24) / 1000) * Math.min(w, h)
    );

    mCtx.save();
    if (featherPx > 0) {
      mCtx.filter = `blur(${featherPx}px)`;
    }
    mCtx.fillStyle = "#ffffff";
    mCtx.scale(w / 1000, h / 1000);
    mCtx.beginPath();

    if (region.shape === "ellipse") {
      mCtx.ellipse(
        region.cx ?? 500,
        region.cy ?? 500,
        Math.max(4, region.rx ?? 120),
        Math.max(4, region.ry ?? 120),
        0,
        0,
        Math.PI * 2
      );
    } else if (region.shape === "rect") {
      mCtx.rect(
        region.x ?? 350,
        region.y ?? 350,
        Math.max(4, region.width ?? 300),
        Math.max(4, region.height ?? 300)
      );
    } else if (region.shape === "polygon" && region.points && region.points.length >= 3) {
      mCtx.moveTo(region.points[0].x, region.points[0].y);
      for (let i = 1; i < region.points.length; i++) {
        mCtx.lineTo(region.points[i].x, region.points[i].y);
      }
      mCtx.closePath();
    }
    mCtx.fill();
    mCtx.restore();

    cCtx.fillStyle = region.targetColor;
    cCtx.fillRect(0, 0, w, h);
    cCtx.globalCompositeOperation = "destination-in";
    cCtx.drawImage(maskCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = region.blendMode || "color";
    ctx.globalAlpha = regionAlpha;
    ctx.drawImage(colorCanvas, 0, 0);
    ctx.restore();
  }

  // Cleanly mask out old garment area before drawing replacement attire
  for (const erase of plan.eraseRegions || []) {
    if (t <= 0) continue;
    const featherPx = Math.max(
      0,
      ((erase.feather ?? 12) / 1000) * Math.min(w, h)
    );
    ctx.save();
    ctx.globalAlpha = t;
    if (featherPx > 0) {
      ctx.filter = `blur(${featherPx}px)`;
    }
    ctx.fillStyle = erase.fillColor || "#FFFFFF";
    ctx.scale(w / 1000, h / 1000);
    ctx.beginPath();
    if (erase.shape === "ellipse") {
      ctx.ellipse(
        erase.cx ?? 500,
        erase.cy ?? 640,
        Math.max(4, erase.rx ?? 180),
        Math.max(4, erase.ry ?? 200),
        0,
        0,
        Math.PI * 2
      );
    } else if (erase.shape === "rect") {
      ctx.rect(
        erase.x ?? 320,
        erase.y ?? 440,
        Math.max(4, erase.width ?? 360),
        Math.max(4, erase.height ?? 400)
      );
    } else if (erase.shape === "polygon" && erase.points && erase.points.length >= 3) {
      ctx.moveTo(erase.points[0].x, erase.points[0].y);
      for (let i = 1; i < erase.points.length; i++) {
        ctx.lineTo(erase.points[i].x, erase.points[i].y);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }

  // Draw fitting replacement garment SVG aligned in 0..1000 image space
  if (plan.clothingSvg && t > 0) {
    try {
      const clothImg = await loadSvgImage(plan.clothingSvg);
      ctx.save();
      ctx.globalAlpha = t;
      ctx.drawImage(clothImg, 0, 0, w, h);
      ctx.restore();
    } catch {
      // Skip malformed SVG gracefully
    }
  }

  // Crisp vector details (dots, single lines, accessories, subtle graphics) in 0..1000 space
  for (const el of plan.svgElements || []) {
    const elAlpha = Math.max(0, Math.min(1, (el.opacity ?? 1) * t));
    if (elAlpha <= 0) continue;

    ctx.save();
    ctx.scale(w / 1000, h / 1000);
    ctx.globalCompositeOperation = el.blendMode || "source-over";
    ctx.globalAlpha = elAlpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const hasFill = Boolean(el.fill && el.fill !== "none" && el.fill !== "transparent");
    const hasStroke = Boolean(el.stroke && el.stroke !== "none" && el.stroke !== "transparent");

    if (hasFill) ctx.fillStyle = el.fill!;
    if (hasStroke) {
      ctx.strokeStyle = el.stroke!;
      ctx.lineWidth = el.strokeWidth ?? 4;
    }

    if (el.type === "path" && el.d) {
      const path2d = new Path2D(el.d);
      if (hasFill) ctx.fill(path2d);
      if (hasStroke) ctx.stroke(path2d);
    } else {
      ctx.beginPath();
      if (el.type === "circle") {
        ctx.arc(el.cx ?? 500, el.cy ?? 500, Math.max(1, el.r ?? 12), 0, Math.PI * 2);
      } else if (el.type === "ellipse") {
        ctx.ellipse(
          el.cx ?? 500,
          el.cy ?? 500,
          Math.max(1, el.rx ?? 20),
          Math.max(1, el.ry ?? 14),
          0,
          0,
          Math.PI * 2
        );
      } else if (el.type === "rect") {
        ctx.rect(el.x ?? 450, el.y ?? 450, el.width ?? 100, el.height ?? 100);
      } else if (el.type === "line") {
        ctx.moveTo(el.x1 ?? 100, el.y1 ?? 500);
        ctx.lineTo(el.x2 ?? 900, el.y2 ?? 500);
        if (!hasStroke && hasFill) {
          ctx.strokeStyle = el.fill!;
          ctx.lineWidth = el.strokeWidth ?? 5;
        } else if (!hasStroke) {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = el.strokeWidth ?? 5;
        }
        ctx.stroke();
        ctx.restore();
        continue;
      } else if (el.type === "polygon" && el.points) {
        const nums = el.points
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        if (nums.length >= 4) {
          ctx.moveTo(nums[0], nums[1]);
          for (let i = 2; i < nums.length - 1; i += 2) {
            ctx.lineTo(nums[i], nums[i + 1]);
          }
          ctx.closePath();
        }
      }
      if (hasFill) ctx.fill();
      if (hasStroke) ctx.stroke();
    }

    ctx.restore();
  }

  if (!isColoring) {
    const vignetteVal = (cg.vignette ?? 0) * t;
    if (vignetteVal > 0) {
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.28,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.72
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.8, (vignetteVal / 100) * 0.75)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    return { dataUrl: canvas.toDataURL("image/png"), width: w, height: h };
  }

  // Coloring Book Print Output (US Letter / A4 · 300+ DPI · Black & White / Grayscale)
  const dims = getColoringDimensions(coloringConfig!.pageSize, coloringConfig!.dpi);
  const outW = dims.width;
  const outH = dims.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Output canvas context unavailable");

  outCtx.fillStyle = "#FFFFFF";
  outCtx.fillRect(0, 0, outW, outH);

  const margin = Math.round(Math.min(outW, outH) * 0.035);
  const availW = outW - margin * 2;
  const availH = outH - margin * 2;
  const scale = Math.min(availW / w, availH / h);
  const drawW = Math.round(w * scale);
  const drawH = Math.round(h * scale);
  const dx = Math.round((outW - drawW) / 2);
  const dy = Math.round((outH - drawH) / 2);

  outCtx.drawImage(canvas, dx, dy, drawW, drawH);

  const imageData = outCtx.getImageData(0, 0, outW, outH);
  const data = imageData.data;

  if (coloringConfig!.colorMode === "bw") {
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = lum < 175 ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  } else {
    for (let i = 0; i < data.length; i += 4) {
      const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = lum;
      data[i + 1] = lum;
      data[i + 2] = lum;
      data[i + 3] = 255;
    }
  }
  outCtx.putImageData(imageData, 0, 0);

  const rawPng = outCanvas.toDataURL("image/png");
  const dpiPng = await applyDpiToPngDataUrl(rawPng, coloringConfig!.dpi);
  return { dataUrl: dpiPng, width: outW, height: outH };
}

export interface StageImageRect {
  dx: number;
  dy: number;
  drawW: number;
  drawH: number;
}

export async function renderAiBaseStage(
  originalSrc: string,
  plan: AiEditPlan | null,
  coloringConfig: AiEditColoringConfig
): Promise<{
  baseDataUrl: string;
  width: number;
  height: number;
  imageRect: StageImageRect;
}> {
  const img = await loadImage(originalSrc);
  const w = img.naturalWidth || 1200;
  const h = img.naturalHeight || 900;

  // Step 1: Render base photo + colorGrading + recolorRegions + eraseRegions on w x h
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  const isColoring = coloringConfig.enabled;
  const cg = plan?.colorGrading || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    vignette: 0,
  };

  const brightness = isColoring ? 100 : cg.brightness ?? 100;
  const contrast = isColoring ? cg.contrast ?? 105 : cg.contrast ?? 100;
  const saturation = isColoring ? 0 : cg.saturation ?? 100;
  const warmth = isColoring ? 0 : cg.warmth ?? 0;
  const sepia = warmth > 0 ? warmth * 0.55 : 0;
  const hue = warmth < 0 ? warmth * 0.45 : 0;

  ctx.save();
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();

  if (plan && !isColoring && cg.tintColor && (cg.tintOpacity ?? 0) > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = Math.min(0.45, cg.tintOpacity ?? 0);
    ctx.fillStyle = cg.tintColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  for (const region of plan?.recolorRegions || []) {
    const regionAlpha = Math.max(0, Math.min(1, region.opacity ?? 0.75));
    if (regionAlpha <= 0 || !region.targetColor) continue;
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mCtx = maskCanvas.getContext("2d");
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = w;
    colorCanvas.height = h;
    const cCtx = colorCanvas.getContext("2d");
    if (!mCtx || !cCtx) continue;

    const featherPx = Math.max(0, ((region.feather ?? 24) / 1000) * Math.min(w, h));
    mCtx.save();
    if (featherPx > 0) mCtx.filter = `blur(${featherPx}px)`;
    mCtx.fillStyle = "#ffffff";
    mCtx.scale(w / 1000, h / 1000);
    mCtx.beginPath();
    if (region.shape === "ellipse") {
      mCtx.ellipse(region.cx ?? 500, region.cy ?? 500, Math.max(4, region.rx ?? 120), Math.max(4, region.ry ?? 120), 0, 0, Math.PI * 2);
    } else if (region.shape === "rect") {
      mCtx.rect(region.x ?? 350, region.y ?? 350, Math.max(4, region.width ?? 300), Math.max(4, region.height ?? 300));
    } else if (region.shape === "polygon" && region.points && region.points.length >= 3) {
      mCtx.moveTo(region.points[0].x, region.points[0].y);
      for (let i = 1; i < region.points.length; i++) mCtx.lineTo(region.points[i].x, region.points[i].y);
      mCtx.closePath();
    }
    mCtx.fill();
    mCtx.restore();

    cCtx.fillStyle = region.targetColor;
    cCtx.fillRect(0, 0, w, h);
    cCtx.globalCompositeOperation = "destination-in";
    cCtx.drawImage(maskCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = region.blendMode || "color";
    ctx.globalAlpha = regionAlpha;
    ctx.drawImage(colorCanvas, 0, 0);
    ctx.restore();
  }

  for (const erase of plan?.eraseRegions || []) {
    const featherPx = Math.max(0, ((erase.feather ?? 12) / 1000) * Math.min(w, h));
    ctx.save();
    if (featherPx > 0) ctx.filter = `blur(${featherPx}px)`;
    ctx.fillStyle = erase.fillColor || "#FFFFFF";
    ctx.scale(w / 1000, h / 1000);
    ctx.beginPath();
    if (erase.shape === "ellipse") {
      ctx.ellipse(erase.cx ?? 500, erase.cy ?? 640, Math.max(4, erase.rx ?? 180), Math.max(4, erase.ry ?? 200), 0, 0, Math.PI * 2);
    } else if (erase.shape === "rect") {
      ctx.rect(erase.x ?? 320, erase.y ?? 440, Math.max(4, erase.width ?? 360), Math.max(4, erase.height ?? 400));
    } else if (erase.shape === "polygon" && erase.points && erase.points.length >= 3) {
      ctx.moveTo(erase.points[0].x, erase.points[0].y);
      for (let i = 1; i < erase.points.length; i++) ctx.lineTo(erase.points[i].x, erase.points[i].y);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }

  if (!isColoring) {
    return {
      baseDataUrl: canvas.toDataURL("image/png"),
      width: w,
      height: h,
      imageRect: { dx: 0, dy: 0, drawW: w, drawH: h },
    };
  }

  const dims = getColoringDimensions(coloringConfig.pageSize, coloringConfig.dpi);
  const outW = dims.width;
  const outH = dims.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Output canvas unavailable");

  outCtx.fillStyle = "#FFFFFF";
  outCtx.fillRect(0, 0, outW, outH);

  const margin = Math.round(Math.min(outW, outH) * 0.035);
  const availW = outW - margin * 2;
  const availH = outH - margin * 2;
  const scale = Math.min(availW / w, availH / h);
  const drawW = Math.round(w * scale);
  const drawH = Math.round(h * scale);
  const dx = Math.round((outW - drawW) / 2);
  const dy = Math.round((outH - drawH) / 2);

  outCtx.drawImage(canvas, dx, dy, drawW, drawH);

  return {
    baseDataUrl: outCanvas.toDataURL("image/png"),
    width: outW,
    height: outH,
    imageRect: { dx, dy, drawW, drawH },
  };
}

function trimTransparentCanvasBounds(
  srcCanvas: HTMLCanvasElement
): { dataUrl: string; minX: number; minY: number; boxW: number; boxH: number } | null {
  const ctx = srcCanvas.getContext("2d");
  if (!ctx) return null;
  const cw = srcCanvas.width;
  const ch = srcCanvas.height;
  const imgData = ctx.getImageData(0, 0, cw, ch).data;

  let minX = cw;
  let minY = ch;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const alpha = imgData[(y * cw + x) * 4 + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const pad = 6;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const ex = Math.min(cw - 1, maxX + pad);
  const ey = Math.min(ch - 1, maxY + pad);
  const boxW = Math.max(1, ex - sx + 1);
  const boxH = Math.max(1, ey - sy + 1);

  const crop = document.createElement("canvas");
  crop.width = boxW;
  crop.height = boxH;
  const cCtx = crop.getContext("2d");
  if (!cCtx) return null;
  cCtx.drawImage(srcCanvas, sx, sy, boxW, boxH, 0, 0, boxW, boxH);

  return { dataUrl: crop.toDataURL("image/png"), minX: sx, minY: sy, boxW, boxH };
}

export async function extractAiOverlayLayers(
  plan: AiEditPlan,
  outW: number,
  outH: number,
  imageRect: StageImageRect,
  labelHint: string
): Promise<EditOverlayLayer[]> {
  const extracted: EditOverlayLayer[] = [];
  const sampleSize = 1000;

  if (plan.clothingSvg && plan.clothingSvg.trim()) {
    try {
      const svgImg = await loadSvgImage(plan.clothingSvg);
      const canvas = document.createElement("canvas");
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(svgImg, 0, 0, sampleSize, sampleSize);
        const trimmed = trimTransparentCanvasBounds(canvas);
        if (trimmed) {
          const normCx = (trimmed.minX + trimmed.boxW / 2) / sampleSize;
          const normCy = (trimmed.minY + trimmed.boxH / 2) / sampleSize;
          const normW = trimmed.boxW / sampleSize;
          const normH = trimmed.boxH / sampleSize;

          const stageX = ((imageRect.dx + normCx * imageRect.drawW) / outW) * 100;
          const stageY = ((imageRect.dy + normCy * imageRect.drawH) / outH) * 100;
          const widthPct = ((normW * imageRect.drawW) / outW) * 100;
          const realW = normW * imageRect.drawW;
          const realH = Math.max(1, normH * imageRect.drawH);

          extracted.push({
            id: `ai-layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: labelHint.slice(0, 28) || "AI Object",
            category: "ai-object",
            src: trimmed.dataUrl,
            x: Math.max(5, Math.min(95, stageX)),
            y: Math.max(5, Math.min(95, stageY)),
            widthPct: Math.max(5, Math.min(92, widthPct)),
            aspectRatio: realW / realH,
            scale: 1,
            rotation: 0,
            flipH: false,
            opacity: 1,
          });
        }
      }
    } catch {
      // Ignore invalid SVG
    }
  }

  if (plan.svgElements && plan.svgElements.length > 0) {
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      for (const el of plan.svgElements) {
        ctx.save();
        ctx.globalAlpha = el.opacity ?? 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const hasFill = Boolean(el.fill && el.fill !== "none" && el.fill !== "transparent");
        const hasStroke = Boolean(el.stroke && el.stroke !== "none" && el.stroke !== "transparent");
        if (hasFill) ctx.fillStyle = el.fill!;
        if (hasStroke) {
          ctx.strokeStyle = el.stroke!;
          ctx.lineWidth = el.strokeWidth ?? 4;
        }
        if (el.type === "path" && el.d) {
          const path2d = new Path2D(el.d);
          if (hasFill) ctx.fill(path2d);
          if (hasStroke) ctx.stroke(path2d);
        } else {
          ctx.beginPath();
          if (el.type === "circle") {
            ctx.arc(el.cx ?? 500, el.cy ?? 500, Math.max(1, el.r ?? 12), 0, Math.PI * 2);
          } else if (el.type === "ellipse") {
            ctx.ellipse(el.cx ?? 500, el.cy ?? 500, Math.max(1, el.rx ?? 20), Math.max(1, el.ry ?? 14), 0, 0, Math.PI * 2);
          } else if (el.type === "rect") {
            ctx.rect(el.x ?? 450, el.y ?? 450, el.width ?? 100, el.height ?? 100);
          } else if (el.type === "line") {
            ctx.moveTo(el.x1 ?? 100, el.y1 ?? 500);
            ctx.lineTo(el.x2 ?? 900, el.y2 ?? 500);
            ctx.strokeStyle = hasStroke ? el.stroke! : hasFill ? el.fill! : "#000000";
            ctx.lineWidth = el.strokeWidth ?? 5;
            ctx.stroke();
            ctx.restore();
            continue;
          } else if (el.type === "polygon" && el.points) {
            const nums = el.points.trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
            if (nums.length >= 4) {
              ctx.moveTo(nums[0], nums[1]);
              for (let i = 2; i < nums.length - 1; i += 2) ctx.lineTo(nums[i], nums[i + 1]);
              ctx.closePath();
            }
          }
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        }
        ctx.restore();
      }

      const trimmed = trimTransparentCanvasBounds(canvas);
      if (trimmed) {
        const normCx = (trimmed.minX + trimmed.boxW / 2) / sampleSize;
        const normCy = (trimmed.minY + trimmed.boxH / 2) / sampleSize;
        const normW = trimmed.boxW / sampleSize;
        const normH = trimmed.boxH / sampleSize;

        const stageX = ((imageRect.dx + normCx * imageRect.drawW) / outW) * 100;
        const stageY = ((imageRect.dy + normCy * imageRect.drawH) / outH) * 100;
        const widthPct = ((normW * imageRect.drawW) / outW) * 100;
        const realW = normW * imageRect.drawW;
        const realH = Math.max(1, normH * imageRect.drawH);

        extracted.push({
          id: `ai-el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: `${labelHint.slice(0, 22) || "AI Detail"}`,
          category: "ai-object",
          src: trimmed.dataUrl,
          x: Math.max(4, Math.min(96, stageX)),
          y: Math.max(4, Math.min(96, stageY)),
          widthPct: Math.max(3, Math.min(92, widthPct)),
          aspectRatio: realW / realH,
          scale: 1,
          rotation: 0,
          flipH: false,
          opacity: 1,
        });
      }
    }
  }

  return extracted;
}

export async function renderStageCompositeWithLayers(
  baseDataUrl: string,
  width: number,
  height: number,
  layers: EditOverlayLayer[],
  coloringConfig: AiEditColoringConfig,
  textLayers: TextLayer[] = []
): Promise<{ dataUrl: string; width: number; height: number }> {
  const baseImg = await loadImage(baseDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  if (coloringConfig.enabled) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(baseImg, 0, 0, width, height);

  for (const layer of layers) {
    const cx = (layer.x / 100) * width;
    const cy = (layer.y / 100) * height;
    const drawW = (layer.widthPct / 100) * width * layer.scale;
    const drawH = drawW / Math.max(0.1, layer.aspectRatio);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.flipH ? -1 : 1, 1);
    ctx.globalAlpha = Math.max(0.05, Math.min(1, layer.opacity));

    if (layer.src) {
      try {
        const lImg = await loadImage(layer.src);
        ctx.drawImage(lImg, -drawW / 2, -drawH / 2, drawW, drawH);
      } catch {
        // Skip broken layer image
      }
    }
    ctx.restore();
  }

  if (coloringConfig.enabled) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    if (coloringConfig.colorMode === "bw") {
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = lum < 175 ? 0 : 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
    } else {
      for (let i = 0; i < data.length; i += 4) {
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = lum;
        data[i + 1] = lum;
        data[i + 2] = lum;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  for (const tl of textLayers) {
    drawTextLayerOnCanvas(ctx, tl, width, height);
  }

  if (coloringConfig.enabled) {
    const rawPng = canvas.toDataURL("image/png");
    const dpiPng = await applyDpiToPngDataUrl(rawPng, coloringConfig.dpi);
    return { dataUrl: dpiPng, width, height };
  }

  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}



