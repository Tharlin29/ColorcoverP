import {
  ShowcaseAspectId,
  ShowcaseBackdropId,
  ShowcaseCardPaper,
  ShowcaseCardSlot,
  ShowcaseDesignConfig,
  ShowcaseHeroTextStyle,
} from "../types/studio";
import {
  ALL_PHOTO_BACKDROP_URLS,
  BOOK_MOCKUP_SLOT_GEOMETRY,
  FLAT_LAY_BOOK_SPREAD_GEOMETRY,
  isBookMockupBackdrop,
  isFlatLayBackdrop,
  isPhotoShowcaseBackdrop,
} from "./flatLayAssets";
import { drawTextLayerOnCanvas } from "./imageEditor";

export function getShowcaseCanvasSize(aspect: ShowcaseAspectId): {
  width: number;
  height: number;
} {
  switch (aspect) {
    case "2:3":
      return { width: 1200, height: 1800 };
    case "4:5":
      return { width: 1080, height: 1350 };
    case "1:1":
      return { width: 1200, height: 1200 };
    case "9:16":
    default:
      return { width: 1080, height: 1920 };
  }
}

const imageCache = new Map<string, HTMLImageElement>();

function loadImageCached(src: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(src);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size;
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.65, -s * 0.15, -s * 0.55, -s * 0.85, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.55, -s * 0.85, s * 0.65, -s * 0.15, 0, s * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  lineWidth = 3
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(-dx, -dy);
    ctx.lineTo(dx, dy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPineBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  needleColor = "#14532D",
  tipColor = "#166534"
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = "#451A03";
  ctx.lineWidth = Math.max(4, length * 0.035);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();

  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = t * length;
    const nLen = length * (0.28 - 0.12 * t);
    ctx.strokeStyle = i % 2 === 0 ? needleColor : tipColor;
    ctx.lineWidth = Math.max(2.5, length * 0.018);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px + nLen * 0.55, -nLen);
    ctx.moveTo(px, 0);
    ctx.lineTo(px + nLen * 0.55, nLen);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHollyCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const drawLeaf = (rot: number, fill: string) => {
    ctx.save();
    ctx.rotate(rot);
    ctx.fillStyle = fill;
    ctx.strokeStyle = "#052E16";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -18, -42, -8);
    ctx.quadraticCurveTo(-30, -28, -56, -24);
    ctx.quadraticCurveTo(-32, -46, 0, -52);
    ctx.quadraticCurveTo(32, -46, 56, -24);
    ctx.quadraticCurveTo(30, -28, 42, -8);
    ctx.quadraticCurveTo(18, -18, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawLeaf(-0.7, "#166534");
  drawLeaf(-1.5, "#15803D");
  drawLeaf(0.15, "#14532D");
  // Red Berries
  const berries = [
    [-8, 2],
    [8, 5],
    [0, -10],
  ];
  for (const [bx, by] of berries) {
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#DC2626";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx - 3, by - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#FCA5A5";
    ctx.fill();
  }
  ctx.restore();
}

function drawWoodTabletop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: { base: string; alt: string; grain: string; glow: string }
) {
  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, w, h);

  const plankCount = 7;
  const plankH = h / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const py = i * plankH;
    if (i % 2 === 1) {
      ctx.fillStyle = palette.alt;
      ctx.fillRect(0, py, w, plankH);
    }
    // Plank seam shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, py, w, Math.max(2, h * 0.002));
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, py + 2, w, Math.max(1.5, h * 0.0015));

    // Organic wood grain lines
    ctx.strokeStyle = palette.grain;
    ctx.lineWidth = 1.6;
    for (let g = 0; g < 11; g++) {
      const gy = py + ((g + 0.5) / 11) * plankH;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 0; x <= w; x += w / 10) {
        const wave = Math.sin((x / w) * Math.PI * 3 + i * 1.7 + g) * 5;
        ctx.lineTo(x, gy + wave);
      }
      ctx.stroke();
    }
  }

  // Warm Overhead Radial Glow + Soft Vignette
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.05, w * 0.5, h * 0.45, w * 0.9);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(0.65, "rgba(0,0,0,0)");
  glow.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function drawBokehLights(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  points: [number, number, number][],
  colorRgb = "253, 224, 71"
) {
  for (const [px, py, rad] of points) {
    const cx = px * w;
    const cy = py * h;
    const r = rad * w;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255, 251, 235, 0.95)`);
    g.addColorStop(0.28, `rgba(${colorRgb}, 0.62)`);
    g.addColorStop(1, `rgba(${colorRgb}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCandyCane(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineWidth = 22;
  ctx.strokeStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(0, 20);
  ctx.arc(28, 20, 28, Math.PI, 0, false);
  ctx.stroke();

  ctx.strokeStyle = "#DC2626";
  ctx.setLineDash([14, 14]);
  ctx.stroke();
  ctx.restore();
}

function drawCrayonProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rot: number,
  color: string,
  len: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  const thick = len * 0.14;
  ctx.fillStyle = color;
  drawRoundedRectPath(ctx, -len * 0.4, -thick / 2, len * 0.78, thick, 4);
  ctx.fill();
  // Tip
  ctx.beginPath();
  ctx.moveTo(len * 0.38, -thick / 2);
  ctx.lineTo(len * 0.54, 0);
  ctx.lineTo(len * 0.38, thick / 2);
  ctx.closePath();
  ctx.fill();
  // Wrapper bands
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(17,17,19,0.75)";
  ctx.fillRect(-len * 0.28, -thick / 2, len * 0.06, thick);
  ctx.fillRect(len * 0.22, -thick / 2, len * 0.06, thick);
  ctx.restore();
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  const inner = r * 0.26;
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * rad;
    const py = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBlossomCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  petalColor: string,
  centerColor: string,
  leafColor = "#65A30D"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // Leaves
  for (const ang of [-0.7, 0.55, 2.2]) {
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.ellipse(28, 0, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 5-petal blossom
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 16, Math.sin(a) * 16, 13, 10, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.fill();
  ctx.restore();
}

async function drawSceneBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  backdrop: ShowcaseBackdropId,
  customBackdropSrc?: string
) {
  if (backdrop === "custom" && customBackdropSrc) {
    try {
      const img = await loadImageCached(customBackdropSrc);
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      return;
    } catch {
      // Fallback to wood desk
    }
  }

  if (isPhotoShowcaseBackdrop(backdrop)) {
    const photoSrc = ALL_PHOTO_BACKDROP_URLS[backdrop];
    try {
      const img = await loadImageCached(photoSrc);
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      return;
    } catch {
      // Fallback to warm wooden tabletop if image fails to load
    }
  }

  switch (backdrop) {
    case "craft-table-lights": {
      drawWoodTabletop(ctx, w, h, {
        base: "#6B4226",
        alt: "#5C371E",
        grain: "rgba(38, 20, 8, 0.25)",
        glow: "rgba(254, 240, 138, 0.22)",
      });
      // Pine Branches around edges
      drawPineBranch(ctx, -20, h * 0.04, 0.45, w * 0.32);
      drawPineBranch(ctx, w + 10, h * 0.05, Math.PI - 0.35, w * 0.34);
      drawPineBranch(ctx, -10, h * 0.42, 0.25, w * 0.26);
      drawPineBranch(ctx, w + 15, h * 0.46, Math.PI - 0.25, w * 0.28);
      drawPineBranch(ctx, -20, h * 0.94, -0.38, w * 0.35);
      drawPineBranch(ctx, w + 20, h * 0.96, Math.PI + 0.35, w * 0.32);
      // Warm Fairy Light Bokeh
      drawBokehLights(ctx, w, h, [
        [0.08, 0.03, 0.045],
        [0.24, 0.02, 0.03],
        [0.72, 0.03, 0.05],
        [0.91, 0.05, 0.042],
        [0.05, 0.46, 0.035],
        [0.95, 0.48, 0.04],
        [0.1, 0.96, 0.04],
        [0.88, 0.95, 0.045],
      ]);
      // Holly Clusters & Ornaments
      drawHollyCluster(ctx, w * 0.08, h * 0.48, w / 900);
      drawHollyCluster(ctx, w * 0.92, h * 0.49, w / 950);
      break;
    }

    case "festive-pine-desk": {
      drawWoodTabletop(ctx, w, h, {
        base: "#704728",
        alt: "#613C20",
        grain: "rgba(36, 18, 6, 0.26)",
        glow: "rgba(253, 224, 71, 0.16)",
      });
      // Top & Bottom Pine Garlands
      drawPineBranch(ctx, -20, h * 0.02, 0.2, w * 0.42, "#0F4C24", "#15803D");
      drawPineBranch(ctx, w + 20, h * 0.02, Math.PI - 0.2, w * 0.42, "#0F4C24", "#15803D");
      drawPineBranch(ctx, -10, h * 0.98, -0.22, w * 0.4, "#0F4C24", "#15803D");
      drawPineBranch(ctx, w + 10, h * 0.98, Math.PI + 0.22, w * 0.4, "#0F4C24", "#15803D");
      drawBokehLights(ctx, w, h, [
        [0.08, 0.02, 0.045],
        [0.22, 0.04, 0.03],
        [0.78, 0.03, 0.04],
        [0.93, 0.02, 0.048],
        [0.06, 0.95, 0.04],
        [0.92, 0.96, 0.04],
      ]);
      // Candy Canes & Colored Crayons
      drawCandyCane(ctx, w * 0.06, h * 0.28, w / 1100, -0.28);
      drawCrayonProp(ctx, w * 0.07, h * 0.56, 0.45, "#EF4444", w * 0.16);
      drawCrayonProp(ctx, w * 0.93, h * 0.52, -0.35, "#22C55E", w * 0.16);
      drawCrayonProp(ctx, w * 0.91, h * 0.87, 0.55, "#FACC15", w * 0.15);
      // Red Ornament Balls
      for (const [ox, oy] of [
        [0.95, 0.19],
        [0.04, 0.21],
      ]) {
        const rg = ctx.createRadialGradient(ox * w - 8, oy * h - 8, 2, ox * w, oy * h, w * 0.042);
        rg.addColorStop(0, "#FCA5A5");
        rg.addColorStop(0.45, "#DC2626");
        rg.addColorStop(1, "#7F1D1D");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(ox * w, oy * h, w * 0.042, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "spring-botanical-oak": {
      drawWoodTabletop(ctx, w, h, {
        base: "#D2AE82",
        alt: "#C69F71",
        grain: "rgba(110, 72, 34, 0.18)",
        glow: "rgba(255, 255, 255, 0.28)",
      });
      // Olive/Botanical Sprigs in Corners
      drawPineBranch(ctx, -10, h * 0.03, 0.35, w * 0.34, "#4D7C0F", "#65A30D");
      drawPineBranch(ctx, w + 10, h * 0.03, Math.PI - 0.35, w * 0.34, "#4D7C0F", "#65A30D");
      drawPineBranch(ctx, -10, h * 0.97, -0.35, w * 0.34, "#4D7C0F", "#65A30D");
      drawPineBranch(ctx, w + 10, h * 0.97, Math.PI + 0.35, w * 0.34, "#4D7C0F", "#65A30D");
      drawCrayonProp(ctx, w * 0.06, h * 0.5, 0.3, "#0EA5E9", w * 0.15);
      drawCrayonProp(ctx, w * 0.94, h * 0.54, -0.4, "#F59E0B", w * 0.15);
      break;
    }

    case "pastel-kids-desk": {
      drawWoodTabletop(ctx, w, h, {
        base: "#E7CFAF",
        alt: "#DFC39E",
        grain: "rgba(130, 90, 48, 0.14)",
        glow: "rgba(255, 251, 235, 0.35)",
      });
      drawCrayonProp(ctx, w * 0.07, h * 0.08, 0.6, "#EC4899", w * 0.16);
      drawCrayonProp(ctx, w * 0.92, h * 0.09, -0.5, "#3B82F6", w * 0.16);
      drawCrayonProp(ctx, w * 0.08, h * 0.92, -0.45, "#22C55E", w * 0.16);
      drawCrayonProp(ctx, w * 0.92, h * 0.91, 0.4, "#FACC15", w * 0.16);
      break;
    }

    case "terrazzo-cream-studio": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#FCF8F2");
      grad.addColorStop(0.55, "#F7EFE3");
      grad.addColorStop(1, "#EFE5D5");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Organic terrazzo speckles
      const terrazzoColors = ["#D97706", "#3F6212", "#DC2626", "#0F766E", "#A8A29E", "#F59E0B"];
      for (let i = 0; i < 68; i++) {
        const tx = ((i * 197 + 41) % 100) / 100 * w;
        const ty = ((i * 313 + 73) % 100) / 100 * h;
        const size = (0.007 + ((i % 5) * 0.003)) * w;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate((i * 1.1) % Math.PI);
        ctx.globalAlpha = 0.22 + (i % 3) * 0.08;
        ctx.fillStyle = terrazzoColors[i % terrazzoColors.length];
        ctx.beginPath();
        ctx.moveTo(-size, -size * 0.4);
        ctx.lineTo(size * 0.8, -size * 0.7);
        ctx.lineTo(size, size * 0.6);
        ctx.lineTo(-size * 0.5, size * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = "rgba(180, 142, 92, 0.28)";
      ctx.lineWidth = Math.max(2, w * 0.003);
      ctx.strokeRect(w * 0.035, h * 0.025, w * 0.93, h * 0.95);
      break;
    }

    case "blush-floral-linen": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#FFF1F5");
      grad.addColorStop(0.5, "#FCE7F3");
      grad.addColorStop(1, "#FBCFE8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle woven linen texture
      ctx.strokeStyle = "rgba(190, 24, 93, 0.045)";
      ctx.lineWidth = 1.5;
      const step = Math.max(14, Math.round(w * 0.015));
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Soft sunbeam highlight
      const beam = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.75);
      beam.addColorStop(0, "rgba(255,255,255,0.68)");
      beam.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, w, h);

      // Corner botanical blossoms
      const s = w / 720;
      drawBlossomCluster(ctx, w * 0.08, h * 0.06, s * 1.15, "#F472B6", "#FDE047", "#4D7C0F");
      drawBlossomCluster(ctx, w * 0.92, h * 0.07, s * 1.05, "#FB7185", "#FEF08A", "#65A30D");
      drawBlossomCluster(ctx, w * 0.09, h * 0.94, s * 1.1, "#FB7185", "#FDE047", "#4D7C0F");
      drawBlossomCluster(ctx, w * 0.91, h * 0.93, s * 1.15, "#F472B6", "#FEF08A", "#65A30D");
      break;
    }

    case "galaxy-nebula-desk": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(0.45, "#1E1B4B");
      grad.addColorStop(1, "#311042");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Nebula clouds
      drawBokehLights(
        ctx,
        w,
        h,
        [
          [0.2, 0.25, 0.34],
          [0.82, 0.68, 0.38],
        ],
        "139, 92, 246"
      );
      drawBokehLights(
        ctx,
        w,
        h,
        [
          [0.78, 0.22, 0.26],
          [0.22, 0.78, 0.28],
        ],
        "56, 189, 248"
      );

      // Crescent Moon & Crisp Stars
      ctx.save();
      ctx.fillStyle = "#FDE047";
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.08, w * 0.036, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1E1B4B";
      ctx.beginPath();
      ctx.arc(w * 0.895, h * 0.074, w * 0.031, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 42; i++) {
        const sx = ((i * 173 + 29) % 100) / 100 * w;
        const sy = ((i * 269 + 53) % 100) / 100 * h;
        if (i % 5 === 0) {
          drawFourPointStar(ctx, sx, sy, w * 0.015, "#FEF08A");
        } else {
          ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.72)" : "rgba(186,230,253,0.65)";
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(1.5, (i % 3) * (w * 0.0022)), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "ocean-mint-atelier": {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#E0F2FE");
      grad.addColorStop(0.5, "#CCFBF1");
      grad.addColorStop(1, "#99F6E4");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gentle coastal scallop wave lines
      ctx.strokeStyle = "rgba(13, 148, 136, 0.12)";
      ctx.lineWidth = Math.max(2, w * 0.0028);
      const rWave = w * 0.14;
      for (let row = 0; row < 14; row++) {
        const wy = row * (h / 12);
        const offsetX = row % 2 === 0 ? 0 : rWave;
        for (let wx = -rWave + offsetX; wx <= w + rWave; wx += rWave * 2) {
          ctx.beginPath();
          ctx.arc(wx, wy, rWave, 0, Math.PI, false);
          ctx.stroke();
        }
      }

      // Sunlit center highlight + sea crayons
      const sun = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.72);
      sun.addColorStop(0, "rgba(255,255,255,0.7)");
      sun.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      drawCrayonProp(ctx, w * 0.06, h * 0.92, -0.4, "#0284C7", w * 0.14);
      drawCrayonProp(ctx, w * 0.93, h * 0.9, 0.45, "#F97316", w * 0.14);
      break;
    }

    case "editorial-sage-marble": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#F3F6F3");
      grad.addColorStop(0.5, "#E7EFEA");
      grad.addColorStop(1, "#DCE7E0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle marble veining
      ctx.strokeStyle = "rgba(6, 78, 59, 0.08)";
      ctx.lineWidth = 2.5;
      for (let v = 0; v < 8; v++) {
        ctx.beginPath();
        let vx = (v / 7) * w;
        ctx.moveTo(vx, 0);
        for (let y = 0; y <= h; y += h / 12) {
          vx += Math.sin(y * 0.008 + v * 1.9) * (w * 0.035);
          ctx.lineTo(vx, y);
        }
        ctx.stroke();
      }

      // Crisp champagne gold double inset border
      ctx.strokeStyle = "rgba(180, 134, 46, 0.45)";
      ctx.lineWidth = Math.max(2, w * 0.003);
      ctx.strokeRect(w * 0.032, h * 0.024, w * 0.936, h * 0.952);
      ctx.strokeStyle = "rgba(180, 134, 46, 0.22)";
      ctx.lineWidth = Math.max(1, w * 0.0015);
      ctx.strokeRect(w * 0.044, h * 0.033, w * 0.912, h * 0.934);
      break;
    }

    case "candy-pastel-confetti": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#FDF4FF");
      grad.addColorStop(0.5, "#FFFDF4");
      grad.addColorStop(1, "#EFF6FF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const palette = ["#F43F5E", "#FACC15", "#38BDF8", "#10B981", "#A855F7", "#FB923C"];
      for (let i = 0; i < 56; i++) {
        const cx = ((i * 151 + 37) % 100) / 100 * w;
        const cy = ((i * 283 + 19) % 100) / 100 * h;
        const col = palette[i % palette.length];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((i * 0.7) % Math.PI);
        ctx.globalAlpha = 0.42;
        if (i % 3 === 0) {
          ctx.fillStyle = col;
          drawRoundedRectPath(ctx, -w * 0.014, -w * 0.005, w * 0.028, w * 0.01, w * 0.005);
          ctx.fill();
        } else if (i % 3 === 1) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.0085, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawFourPointStar(ctx, 0, 0, w * 0.013, col);
        }
        ctx.restore();
      }
      break;
    }

    case "midnight-studio-gold":
    default: {
      drawWoodTabletop(ctx, w, h, {
        base: "#29201B",
        alt: "#211915",
        grain: "rgba(0, 0, 0, 0.35)",
        glow: "rgba(251, 191, 36, 0.14)",
      });
      drawBokehLights(
        ctx,
        w,
        h,
        [
          [0.09, 0.04, 0.045],
          [0.89, 0.05, 0.048],
          [0.07, 0.95, 0.042],
          [0.91, 0.94, 0.045],
        ],
        "251, 191, 36"
      );
      break;
    }
  }
}

interface CardPlacement {
  cx: number;
  cy: number;
  cardW: number;
  cardH: number;
  angleRad: number;
}

function getCardPlacements(
  layout: ShowcaseDesignConfig["layout"],
  w: number,
  h: number
): CardPlacement[] {
  const deg = (d: number) => (d * Math.PI) / 180;
  const isCompactH = h / w < 1.35; // 1:1 or 4:5

  if (layout === "center-plaque-6") {
    const cardW = w * (isCompactH ? 0.28 : 0.32);
    const cardH = Math.min(cardW * 1.32, h * (isCompactH ? 0.28 : 0.245));
    const topY = h * (isCompactH ? 0.19 : 0.2);
    const botY = h * (isCompactH ? 0.81 : 0.795);
    return [
      { cx: w * 0.19, cy: topY + h * 0.015, cardW, cardH, angleRad: deg(-6) },
      { cx: w * 0.5, cy: topY - h * 0.015, cardW, cardH, angleRad: deg(1.5) },
      { cx: w * 0.81, cy: topY + h * 0.025, cardW, cardH, angleRad: deg(6.5) },
      { cx: w * 0.18, cy: botY + h * 0.01, cardW, cardH, angleRad: deg(-5) },
      { cx: w * 0.5, cy: botY - h * 0.01, cardW, cardH, angleRad: deg(-1) },
      { cx: w * 0.82, cy: botY + h * 0.02, cardW, cardH, angleRad: deg(6) },
    ];
  }

  if (layout === "top-banner-5") {
    const midCardW = w * (isCompactH ? 0.34 : 0.39);
    const midCardH = Math.min(midCardW * 1.24, h * 0.25);
    const botCardW = w * (isCompactH ? 0.27 : 0.31);
    const botCardH = Math.min(botCardW * 1.26, h * 0.22);
    return [
      { cx: w * 0.3, cy: h * (isCompactH ? 0.45 : 0.46), cardW: midCardW, cardH: midCardH, angleRad: deg(-4.5) },
      { cx: w * 0.7, cy: h * (isCompactH ? 0.46 : 0.475), cardW: midCardW, cardH: midCardH, angleRad: deg(4.5) },
      { cx: w * 0.2, cy: h * (isCompactH ? 0.74 : 0.73), cardW: botCardW, cardH: botCardH, angleRad: deg(-6) },
      { cx: w * 0.5, cy: h * (isCompactH ? 0.745 : 0.74), cardW: botCardW, cardH: botCardH, angleRad: deg(0.8) },
      { cx: w * 0.8, cy: h * (isCompactH ? 0.74 : 0.735), cardW: botCardW, cardH: botCardH, angleRad: deg(6) },
    ];
  }

  if (layout === "hero-plus-4") {
    const heroW = w * (isCompactH ? 0.42 : 0.52);
    const heroH = Math.min(heroW * 1.15, h * 0.31);
    const smW = w * (isCompactH ? 0.22 : 0.245);
    const smH = Math.min(smW * 1.28, h * 0.19);
    return [
      { cx: w * 0.5, cy: h * (isCompactH ? 0.46 : 0.455), cardW: heroW, cardH: heroH, angleRad: deg(-1.2) },
      { cx: w * 0.16, cy: h * (isCompactH ? 0.76 : 0.755), cardW: smW, cardH: smH, angleRad: deg(-6) },
      { cx: w * 0.385, cy: h * (isCompactH ? 0.75 : 0.745), cardW: smW, cardH: smH, angleRad: deg(-2) },
      { cx: w * 0.615, cy: h * (isCompactH ? 0.75 : 0.745), cardW: smW, cardH: smH, angleRad: deg(2) },
      { cx: w * 0.84, cy: h * (isCompactH ? 0.76 : 0.755), cardW: smW, cardH: smH, angleRad: deg(6) },
    ];
  }

  if (layout === "diagonal-cascade-5") {
    const heroW = w * (isCompactH ? 0.36 : 0.42);
    const heroH = Math.min(heroW * 1.24, h * 0.27);
    const sideW = w * (isCompactH ? 0.28 : 0.32);
    const sideH = Math.min(sideW * 1.25, h * 0.22);
    return [
      { cx: w * 0.22, cy: h * (isCompactH ? 0.44 : 0.43), cardW: sideW, cardH: sideH, angleRad: deg(-8) },
      { cx: w * 0.78, cy: h * (isCompactH ? 0.47 : 0.46), cardW: sideW, cardH: sideH, angleRad: deg(7.5) },
      { cx: w * 0.25, cy: h * (isCompactH ? 0.76 : 0.75), cardW: sideW, cardH: sideH, angleRad: deg(-4.5) },
      { cx: w * 0.75, cy: h * (isCompactH ? 0.75 : 0.74), cardW: sideW, cardH: sideH, angleRad: deg(5.5) },
      { cx: w * 0.5, cy: h * (isCompactH ? 0.6 : 0.595), cardW: heroW, cardH: heroH, angleRad: deg(-1.2) },
    ];
  }

  if (layout === "spotlight-trio-3") {
    const heroW = w * (isCompactH ? 0.48 : 0.56);
    const heroH = Math.min(heroW * 1.2, h * 0.33);
    const wingW = w * (isCompactH ? 0.31 : 0.35);
    const wingH = Math.min(wingW * 1.24, h * 0.23);
    return [
      { cx: w * 0.24, cy: h * (isCompactH ? 0.72 : 0.715), cardW: wingW, cardH: wingH, angleRad: deg(-7) },
      { cx: w * 0.76, cy: h * (isCompactH ? 0.72 : 0.715), cardW: wingW, cardH: wingH, angleRad: deg(7) },
      { cx: w * 0.5, cy: h * (isCompactH ? 0.48 : 0.475), cardW: heroW, cardH: heroH, angleRad: deg(-1) },
    ];
  }

  // clean-grid-4
  const cardW = w * (isCompactH ? 0.36 : 0.4);
  const cardH = Math.min(cardW * 1.24, h * 0.26);
  return [
    { cx: w * 0.28, cy: h * 0.44, cardW, cardH, angleRad: deg(-3.5) },
    { cx: w * 0.72, cy: h * 0.44, cardW, cardH, angleRad: deg(3.5) },
    { cx: w * 0.28, cy: h * 0.73, cardW, cardH, angleRad: deg(-2.5) },
    { cx: w * 0.72, cy: h * 0.73, cardW, cardH, angleRad: deg(2.5) },
  ];
}

function getPaperColor(paper: ShowcaseCardPaper): string {
  switch (paper) {
    case "kraft":
      return "#CFA982";
    case "pastel-blue":
      return "#88ABD0";
    case "pastel-cream":
      return "#FAF4E4";
    case "white":
    default:
      return "#FFFFFF";
  }
}

async function drawSingleCard(
  ctx: CanvasRenderingContext2D,
  slot: ShowcaseCardSlot,
  placement: CardPlacement,
  showCaption: boolean,
  fontFamily: string
) {
  const { cx, cy, cardW, cardH, angleRad } = placement;
  let loadedImg: HTMLImageElement | null = null;
  try {
    loadedImg = await loadImageCached(slot.src);
  } catch {
    loadedImg = null;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);

  // Realistic soft multi-layer drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.44)";
  ctx.shadowBlur = cardW * 0.085;
  ctx.shadowOffsetX = cardW * 0.018;
  ctx.shadowOffsetY = cardW * 0.042;

  ctx.fillStyle = getPaperColor(slot.paper);
  drawRoundedRectPath(ctx, -cardW / 2, -cardH / 2, cardW, cardH, cardW * 0.025);
  ctx.fill();

  // Subtle card edge highlight
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = cardW * 0.04;
  const captionH = showCaption && (slot.caption || slot.label) ? cardH * 0.12 : 0;
  const innerX = -cardW / 2 + pad;
  const innerY = -cardH / 2 + pad;
  const innerW = cardW - pad * 2;
  const innerH = cardH - pad * 2 - captionH;

  if (loadedImg) {
    ctx.save();
    drawRoundedRectPath(ctx, innerX, innerY, innerW, innerH, cardW * 0.015);
    ctx.clip();

    const iw = Math.max(1, loadedImg.naturalWidth);
    const ih = Math.max(1, loadedImg.naturalHeight);
    // Use cover so cards look richly filled, with fallback to contain if ratio differs wildly
    const ratioDiff = Math.max(iw / ih / (innerW / innerH), innerW / innerH / (iw / ih));
    const scale =
      ratioDiff < 1.45
        ? Math.max(innerW / iw, innerH / ih)
        : Math.min(innerW / iw, innerH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(loadedImg, innerX + (innerW - dw) / 2, innerY + (innerH - dh) / 2, dw, dh);

    // Optional User-Editable Text Directly on Card Image
    const overlayText = slot.overlayText?.trim();
    if (overlayText) {
      const style = slot.overlayStyle || "pill-box";
      const textCol = slot.overlayColor || "#FFFFFF";
      const bgCol = slot.overlayBgColor || "#111113";
      const pos = slot.overlayPosition || "bottom";
      const sizeScale = Math.max(0.5, Math.min(2, (slot.overlayFontSize ?? 100) / 100));
      const fSize = Math.max(14, Math.round(cardW * 0.095 * sizeScale));
      const defaultY = pos === "top" ? 16 : pos === "center" ? 50 : 84;
      const xPct = Math.max(0, Math.min(100, slot.overlayX ?? 50));
      const yPct = Math.max(0, Math.min(100, slot.overlayY ?? defaultY));
      const ox = -innerW / 2 + (xPct / 100) * innerW;
      const oy = innerY + (yPct / 100) * innerH;

      ctx.font = `700 ${fSize}px ${fontFamily || "'Fredoka', 'Padauk', sans-serif"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textW = Math.min(innerW * 0.86, ctx.measureText(overlayText).width);

      if (style === "pill-box" || style === "banner-ribbon") {
        const bw = Math.min(innerW * 0.94, textW + fSize * 1.15);
        const bh = fSize * 1.65;
        ctx.save();
        ctx.fillStyle = bgCol === "transparent" ? "rgba(17,17,19,0.78)" : bgCol;
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        drawRoundedRectPath(
          ctx,
          ox - bw / 2,
          oy - bh / 2,
          bw,
          bh,
          style === "banner-ribbon" ? bh * 0.25 : bh / 2
        );
        ctx.fill();
        if (style === "banner-ribbon") {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(255,255,255,0.65)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = textCol;
        ctx.fillText(overlayText, ox, oy + 1, bw * 0.88);
      } else if (style === "outline-3d") {
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(3, fSize * 0.22);
        ctx.strokeStyle = bgCol === "transparent" ? "#FFFFFF" : bgCol;
        ctx.strokeText(overlayText, ox, oy, innerW * 0.88);
        ctx.fillStyle = textCol;
        ctx.fillText(overlayText, ox, oy, innerW * 0.88);
      } else if (style === "shadow") {
        ctx.save();
        ctx.shadowColor = bgCol === "transparent" ? "rgba(0,0,0,0.85)" : bgCol;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = textCol;
        ctx.fillText(overlayText, ox, oy, innerW * 0.88);
        ctx.restore();
      } else {
        ctx.fillStyle = textCol;
        ctx.fillText(overlayText, ox, oy, innerW * 0.88);
      }
    }

    ctx.restore();
  }

  if (captionH > 0) {
    ctx.fillStyle = "#18181B";
    ctx.font = `600 ${Math.round(cardW * 0.068)}px "Plus Jakarta Sans", "Padauk", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(slot.caption || slot.label, 0, cardH / 2 - captionH * 0.52, innerW);
  }

  ctx.restore();
}

function drawSwallowtailRibbon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rw: number,
  rh: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  const hw = rw / 2;
  const hh = rh / 2;
  const notch = rw * 0.055;

  // Darker tail fold underneath
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.moveTo(-hw + notch, hh);
  ctx.lineTo(-hw - notch * 0.6, hh + rh * 0.14);
  ctx.lineTo(-hw * 0.72, hh);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(hw - notch, hh);
  ctx.lineTo(hw + notch * 0.6, hh + rh * 0.14);
  ctx.lineTo(hw * 0.72, hh);
  ctx.closePath();
  ctx.fill();

  // Main curved swallowtail ribbon
  ctx.shadowColor = "rgba(0,0,0,0.24)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-hw - notch, -hh * 0.85);
  ctx.quadraticCurveTo(0, -hh * 1.12, hw + notch, -hh * 0.85);
  ctx.lineTo(hw, 0);
  ctx.lineTo(hw + notch, hh * 0.85);
  ctx.quadraticCurveTo(0, hh * 1.12, -hw - notch, hh * 0.85);
  ctx.lineTo(-hw, 0);
  ctx.closePath();
  ctx.fill();

  // Dashed light inner highlight border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawStyledBannerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  fontFam: string,
  color: string,
  style: ShowcaseHeroTextStyle = "outline-3d",
  bgColor?: string,
  align: CanvasTextAlign = "center"
) {
  ctx.save();
  ctx.font = `700 ${fontSize}px ${fontFam}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  const measuredW = Math.min(maxW, ctx.measureText(text).width);
  const pillColor = bgColor && bgColor !== "transparent" ? bgColor : undefined;

  if (style === "pill-box" || pillColor) {
    const padX = fontSize * 0.42;
    const padY = fontSize * 0.22;
    const bw = measuredW + padX * 2;
    const bh = fontSize + padY * 2;
    let bx = x - bw / 2;
    if (align === "left") bx = x - padX;
    if (align === "right") bx = x - measuredW - padX;
    ctx.save();
    ctx.fillStyle = pillColor || "#111113";
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    drawRoundedRectPath(ctx, bx, y - bh / 2, bw, bh, bh / 2);
    ctx.fill();
    ctx.restore();
  }

  if (style === "outline-3d") {
    ctx.lineWidth = Math.max(7, fontSize * 0.15);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeText(text, x, y, maxW);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, maxW);
  } else if (style === "shadow") {
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = Math.max(6, fontSize * 0.16);
    ctx.shadowOffsetY = Math.max(3, fontSize * 0.06);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, maxW);
  } else if (style === "block-3d") {
    const off = Math.max(3, fontSize * 0.075);
    ctx.fillStyle = "rgba(17,17,19,0.88)";
    ctx.fillText(text, x + off, y + off, maxW);
    ctx.lineWidth = Math.max(3, fontSize * 0.06);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeText(text, x, y, maxW);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, maxW);
  } else if (style === "neon") {
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(12, fontSize * 0.3);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, maxW);
    ctx.shadowBlur = Math.max(6, fontSize * 0.14);
    ctx.fillText(text, x, y, maxW);
  } else {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y, maxW);
  }

  ctx.restore();
}

function drawHeroBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ShowcaseDesignConfig
) {
  const isCenter = config.layout === "center-plaque-6";
  const isCompact = h / w < 1.35;
  const bannerXOff = ((config.bannerOffsetX ?? 0) / 100) * w;
  const bannerYOff = ((config.bannerOffsetY ?? 0) / 100) * h;
  const bannerCX = w / 2 + bannerXOff;
  const bannerY = (isCenter ? h * 0.495 : h * (isCompact ? 0.175 : 0.165)) + bannerYOff;
  const scaleXRatio = Math.max(0.7, Math.min(1.0, (config.bannerBoundScaleX ?? (isCenter ? 88 : 90)) / 100));
  const scaleYRatio = Math.max(0.75, Math.min(1.25, (config.bannerBoundScaleY ?? 100) / 100));
  const bannerW = w * scaleXRatio;
  const bannerH = (isCenter ? h * (isCompact ? 0.34 : 0.31) : h * (isCompact ? 0.28 : 0.255)) * scaleYRatio;

  const left = bannerCX - bannerW / 2;
  const top = bannerY - bannerH / 2;
  const customPlaqueBg =
    config.plaqueBgColor && config.plaqueBgColor !== "transparent" ? config.plaqueBgColor : null;
  const transparentPlaque = config.plaqueBgColor === "transparent";
  const bgOpacity = transparentPlaque
    ? 0
    : Math.max(0, Math.min(1, (config.bannerBoundBgOpacity ?? 100) / 100));
  const hasExplicitBound =
    config.bannerBoundColor !== undefined ||
    config.bannerBoundWidth !== undefined ||
    config.bannerBoundDash !== undefined ||
    config.bannerBoundBgOpacity !== undefined;
  const strokeCol = config.bannerBoundColor || config.primaryColor || "#18181B";
  const strokePx =
    config.bannerBoundWidth !== undefined
      ? config.bannerBoundWidth * (w / 1000)
      : Math.max(3.8, w * 0.0045);
  const boundDash = config.bannerBoundDash || "solid";
  const customRad =
    config.bannerBoundRadius !== undefined
      ? Math.min(bannerH * 0.48, config.bannerBoundRadius * (w / 620))
      : null;
  const useShadow = config.bannerBoundShadow !== false;

  const applyDash = (lw: number) => {
    if (boundDash === "dashed") {
      ctx.setLineDash([Math.max(8, lw * 2.8), Math.max(6, lw * 1.9)]);
    } else if (boundDash === "dotted") {
      ctx.lineCap = "round";
      ctx.setLineDash([1, Math.max(6, lw * 2.1)]);
    } else {
      ctx.setLineDash([]);
    }
  };

  const applySoftShadow = () => {
    if (useShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = w * 0.032;
      ctx.shadowOffsetY = h * 0.01;
    } else {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
  };

  const clearShadow = () => {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const fillCurrentPath = (colorHex: string, overrideAlpha?: number) => {
    const a = overrideAlpha !== undefined ? overrideAlpha : bgOpacity;
    if (a <= 0.005) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.restore();
  };

  const strokeCurrentPath = (colorHex: string, lw: number) => {
    if (lw <= 0.2) return;
    ctx.save();
    clearShadow();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    applyDash(lw);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  };

  ctx.save();
  // Plaque / Banner Bound Backing & Frame
  if (!transparentPlaque || hasExplicitBound) {
    applySoftShadow();

    if (config.plaqueStyle === "cloud-sticker") {
      const lobes = 12;
      const traceCloud = () => {
        ctx.beginPath();
        for (let i = 0; i < lobes; i++) {
          const t = (i / lobes) * Math.PI * 2;
          const lx = bannerCX + Math.cos(t) * (bannerW * 0.43);
          const ly = bannerY + Math.sin(t) * (bannerH * 0.38);
          ctx.moveTo(lx + bannerW * 0.14, ly);
          ctx.arc(lx, ly, bannerW * 0.135, 0, Math.PI * 2);
        }
        drawRoundedRectPath(
          ctx,
          left + bannerW * 0.04,
          top + bannerH * 0.05,
          bannerW * 0.92,
          bannerH * 0.88,
          bannerH * 0.25
        );
      };
      traceCloud();
      fillCurrentPath(customPlaqueBg || "#FFFFFF");
      if (config.bannerBoundWidth !== undefined || config.bannerBoundColor || config.bannerBoundDash) {
        clearShadow();
        const pLeft = left + bannerW * 0.06;
        const pTop = top + bannerH * 0.08;
        const pW = bannerW * 0.88;
        const pH = bannerH * 0.84;
        drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, customRad ?? bannerH * 0.22);
        strokeCurrentPath(strokeCol, strokePx);
        if (boundDash === "double" && strokePx > 0.2) {
          const ins = Math.max(8, strokePx * 2.1);
          drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(4, (customRad ?? bannerH * 0.22) - ins));
          strokeCurrentPath(strokeCol, Math.max(1.5, strokePx * 0.55));
        }
      }
    } else if (config.plaqueStyle === "wood-plaque") {
      const r = customRad ?? bannerH * 0.18;
      drawRoundedRectPath(ctx, left, top, bannerW, bannerH, r);
      fillCurrentPath(customPlaqueBg || "#FAF5EB");
      clearShadow();
      if (bgOpacity > 0.05) {
        ctx.save();
        ctx.globalAlpha = bgOpacity;
        drawRoundedRectPath(ctx, left + 10, top + 10, bannerW - 20, bannerH - 20, Math.max(4, r - 4));
        ctx.clip();
        ctx.fillStyle = customPlaqueBg || "#F5ECDC";
        ctx.fillRect(left, top, bannerW, bannerH);
        ctx.strokeStyle = "rgba(146, 107, 68, 0.14)";
        ctx.lineWidth = 2.5;
        for (let i = 1; i <= 5; i++) {
          const ly = top + (i / 6) * bannerH;
          ctx.beginPath();
          ctx.moveTo(left, ly);
          ctx.lineTo(left + bannerW, ly);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (config.bannerBoundWidth !== undefined || config.bannerBoundColor || config.bannerBoundDash) {
        drawRoundedRectPath(ctx, left, top, bannerW, bannerH, r);
        strokeCurrentPath(strokeCol, strokePx);
        if (boundDash === "double" && strokePx > 0.2) {
          const ins = Math.max(9, strokePx * 2.2);
          drawRoundedRectPath(ctx, left + ins, top + ins, bannerW - ins * 2, bannerH - ins * 2, Math.max(2, r - ins));
          strokeCurrentPath(strokeCol, Math.max(1.5, strokePx * 0.55));
        }
      }
    } else if (config.plaqueStyle === "scallop-frame") {
      const pLeft = left + bannerW * 0.025;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.95;
      const pH = bannerH * 0.92;
      const r = customRad ?? bannerH * 0.16;
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFDF8");
      // Scalloped perimeter beads
      const beadR = Math.max(10, w * 0.017);
      const cols = Math.max(8, Math.round(pW / (beadR * 1.85)));
      const rows = Math.max(4, Math.round(pH / (beadR * 1.85)));
      ctx.beginPath();
      for (let i = 1; i < cols; i++) {
        const bx = pLeft + (i / cols) * pW;
        ctx.moveTo(bx + beadR, pTop);
        ctx.arc(bx, pTop, beadR, 0, Math.PI * 2);
        ctx.moveTo(bx + beadR, pTop + pH);
        ctx.arc(bx, pTop + pH, beadR, 0, Math.PI * 2);
      }
      for (let j = 1; j < rows; j++) {
        const by = pTop + (j / rows) * pH;
        ctx.moveTo(pLeft + beadR, by);
        ctx.arc(pLeft, by, beadR, 0, Math.PI * 2);
        ctx.moveTo(pLeft + pW + beadR, by);
        ctx.arc(pLeft + pW, by, beadR, 0, Math.PI * 2);
      }
      fillCurrentPath(customPlaqueBg || "#FFFDF8");
      clearShadow();
      ctx.save();
      if (config.bannerBoundDash) {
        applyDash(strokePx);
      } else {
        ctx.setLineDash([8, 6]);
      }
      ctx.strokeStyle = config.bannerBoundColor || config.secondaryColor || config.primaryColor;
      ctx.lineWidth = config.bannerBoundWidth !== undefined ? strokePx : Math.max(2.5, w * 0.003);
      if (ctx.lineWidth > 0.2) {
        drawRoundedRectPath(ctx, pLeft + 14, pTop + 14, pW - 28, pH - 28, Math.max(4, r - 8));
        ctx.stroke();
      }
      ctx.restore();
    } else if (config.plaqueStyle === "polaroid-strip") {
      const pLeft = left + bannerW * 0.02;
      const pTop = top + bannerH * 0.03;
      const pW = bannerW * 0.96;
      const pH = bannerH * 0.94;
      const r = customRad ?? bannerH * 0.08;
      clearShadow();
      if (useShadow) {
        ctx.fillStyle = config.bannerBoundColor || config.secondaryColor || "#18181B";
        drawRoundedRectPath(ctx, pLeft + w * 0.012, pTop + w * 0.012, pW, pH, r);
        ctx.fill();
      }
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFFFF");
      strokeCurrentPath(strokeCol, strokePx);
      // Diagonal striped Washi tape accents
      for (const [tx, rot] of [
        [pLeft + pW * 0.06, -0.45],
        [pLeft + pW * 0.94, 0.45],
      ] as const) {
        ctx.save();
        ctx.translate(tx, pTop + bannerH * 0.02);
        ctx.rotate(rot);
        ctx.fillStyle = config.ribbonColor || strokeCol;
        ctx.globalAlpha = 0.78;
        const tw = w * 0.096;
        const th = w * 0.028;
        ctx.fillRect(-tw / 2, -th / 2, tw, th);
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = Math.max(1.5, w * 0.002);
        for (let s = -2; s <= 2; s++) {
          ctx.beginPath();
          ctx.moveTo(s * (tw * 0.18) - 4, th / 2);
          ctx.lineTo(s * (tw * 0.18) + 4, -th / 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else if (config.plaqueStyle === "neo-brutal") {
      // Trending Neo-Brutalist Pop Banner: bold solid hard offset + thick crisp ink border + top color bar
      const pLeft = left + bannerW * 0.02;
      const pTop = top + bannerH * 0.03;
      const pW = bannerW * 0.96;
      const pH = bannerH * 0.94;
      const r = customRad ?? Math.min(18, bannerH * 0.08);
      const hardOff = Math.max(8, w * 0.014);
      const borderCol = config.bannerBoundColor || "#111113";
      const lw = Math.max(strokePx, w * 0.0055);
      clearShadow();
      if (useShadow) {
        ctx.fillStyle = borderCol;
        drawRoundedRectPath(ctx, pLeft + hardOff, pTop + hardOff, pW, pH, r);
        ctx.fill();
      }
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFBEB");
      strokeCurrentPath(borderCol, lw);
      if (boundDash === "double" && lw > 0.2) {
        const ins = Math.max(10, lw * 2.1);
        drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(2, r - ins));
        strokeCurrentPath(config.primaryColor || borderCol, Math.max(2, lw * 0.5));
      }
      // Corner window dots (Neo-Brutal UI motif)
      const dotR = Math.max(4, w * 0.006);
      for (let d = 0; d < 3; d++) {
        ctx.beginPath();
        ctx.arc(pLeft + w * 0.026 + d * dotR * 2.7, pTop + w * 0.022, dotR, 0, Math.PI * 2);
        ctx.fillStyle = d === 0 ? config.primaryColor : d === 1 ? config.secondaryColor : config.ribbonColor;
        ctx.fill();
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = Math.max(1.5, lw * 0.35);
        ctx.stroke();
      }
    } else if (config.plaqueStyle === "glass-frost") {
      // Trending Frosted Glassmorphism Card: translucent luminous veil + crisp glass rim + specular sheen
      const pLeft = left + bannerW * 0.02;
      const pTop = top + bannerH * 0.03;
      const pW = bannerW * 0.96;
      const pH = bannerH * 0.94;
      const r = customRad ?? bannerH * 0.16;
      const glassAlpha = config.bannerBoundBgOpacity !== undefined ? bgOpacity : 0.72;
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFFFF", glassAlpha);
      clearShadow();
      // Subtle diagonal glass highlight sheen
      if (glassAlpha > 0.05) {
        ctx.save();
        drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
        ctx.clip();
        const sheen = ctx.createLinearGradient(pLeft, pTop, pLeft + pW, pTop + pH);
        sheen.addColorStop(0, "rgba(255,255,255,0.48)");
        sheen.addColorStop(0.45, "rgba(255,255,255,0.06)");
        sheen.addColorStop(1, "rgba(255,255,255,0.22)");
        ctx.fillStyle = sheen;
        ctx.fillRect(pLeft, pTop, pW, pH);
        ctx.restore();
      }
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      strokeCurrentPath(config.bannerBoundColor || "#FFFFFF", Math.max(strokePx, 2.5));
      if (boundDash === "double") {
        const ins = Math.max(8, strokePx * 2);
        drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(4, r - ins));
        strokeCurrentPath(config.bannerBoundColor || "#FFFFFF", Math.max(1.4, strokePx * 0.45));
      }
    } else if (config.plaqueStyle === "y2k-spark") {
      // Trending Y2K Chrome / Sparkle Pill Frame
      const pLeft = left + bannerW * 0.025;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.95;
      const pH = bannerH * 0.92;
      const r = customRad ?? bannerH * 0.34;
      const rimCol = config.bannerBoundColor || config.primaryColor || "#7C3AED";
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFFFF");
      strokeCurrentPath(rimCol, strokePx);
      // Inner secondary neon/chrome hairline
      const ins = Math.max(9, strokePx * 2.1);
      drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(4, r - ins));
      strokeCurrentPath(config.secondaryColor || rimCol, Math.max(1.8, strokePx * 0.5));
      // Bold Y2K 4-point sparkles at opposite corners
      drawFourPointStar(ctx, pLeft + r * 0.25, pTop + r * 0.2, Math.max(18, w * 0.032), rimCol);
      drawFourPointStar(ctx, pLeft + pW - r * 0.25, pTop + pH - r * 0.2, Math.max(18, w * 0.032), rimCol);
      drawFourPointStar(ctx, pLeft + pW - r * 0.22, pTop + r * 0.22, Math.max(11, w * 0.019), config.secondaryColor || rimCol);
      drawFourPointStar(ctx, pLeft + r * 0.22, pTop + pH - r * 0.22, Math.max(11, w * 0.019), config.secondaryColor || rimCol);
    } else if (config.plaqueStyle === "luxe-deco") {
      // Trending Editorial Art Deco Gold Luxury Plaque
      const pLeft = left + bannerW * 0.025;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.95;
      const pH = bannerH * 0.92;
      const cut = Math.min(28, bannerH * 0.14);
      const decoCol = config.bannerBoundColor || "#D97706";
      const traceStepped = (x: number, y: number, bw: number, bh: number, c: number) => {
        ctx.beginPath();
        ctx.moveTo(x + c, y);
        ctx.lineTo(x + bw - c, y);
        ctx.lineTo(x + bw - c, y + c);
        ctx.lineTo(x + bw, y + c);
        ctx.lineTo(x + bw, y + bh - c);
        ctx.lineTo(x + bw - c, y + bh - c);
        ctx.lineTo(x + bw - c, y + bh);
        ctx.lineTo(x + c, y + bh);
        ctx.lineTo(x + c, y + bh - c);
        ctx.lineTo(x, y + bh - c);
        ctx.lineTo(x, y + c);
        ctx.lineTo(x + c, y + c);
        ctx.closePath();
      };
      traceStepped(pLeft, pTop, pW, pH, cut);
      fillCurrentPath(customPlaqueBg || "#FFFDF7");
      strokeCurrentPath(decoCol, strokePx);
      const ins = Math.max(10, strokePx * 2.2);
      traceStepped(pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(8, cut * 0.72));
      strokeCurrentPath(decoCol, Math.max(1.8, strokePx * 0.5));
      // Diamond finials on left & right midpoints
      clearShadow();
      const dm = Math.max(7, w * 0.01);
      ctx.fillStyle = decoCol;
      for (const sx of [pLeft, pLeft + pW]) {
        const sy = pTop + pH / 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy - dm);
        ctx.lineTo(sx + dm, sy);
        ctx.lineTo(sx, sy + dm);
        ctx.lineTo(sx - dm, sy);
        ctx.closePath();
        ctx.fill();
      }
    } else if (config.plaqueStyle === "postage-stamp") {
      // Trending Craft Postage Stamp Frame
      const pad = Math.max(12, w * 0.016);
      const ox = left + bannerW * 0.015;
      const oy = top + bannerH * 0.025;
      const ow = bannerW * 0.97;
      const oh = bannerH * 0.95;
      const step = Math.max(26, w * 0.034);
      const nx = Math.max(8, Math.round(ow / step));
      const ny = Math.max(4, Math.round(oh / step));
      const sx = ow / nx;
      const sy = oh / ny;
      const notch = Math.min(sx, sy) * 0.3;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      for (let i = 0; i < nx; i++) {
        const x0 = ox + i * sx;
        ctx.lineTo(x0 + sx * 0.24, oy);
        ctx.quadraticCurveTo(x0 + sx * 0.5, oy + notch * 1.15, x0 + sx * 0.76, oy);
        ctx.lineTo(x0 + sx, oy);
      }
      for (let i = 0; i < ny; i++) {
        const y0 = oy + i * sy;
        ctx.lineTo(ox + ow, y0 + sy * 0.24);
        ctx.quadraticCurveTo(ox + ow - notch * 1.15, y0 + sy * 0.5, ox + ow, y0 + sy * 0.76);
        ctx.lineTo(ox + ow, y0 + sy);
      }
      for (let i = nx; i > 0; i--) {
        const x0 = ox + i * sx;
        ctx.lineTo(x0 - sx * 0.24, oy + oh);
        ctx.quadraticCurveTo(x0 - sx * 0.5, oy + oh - notch * 1.15, x0 - sx * 0.76, oy + oh);
        ctx.lineTo(x0 - sx, oy + oh);
      }
      for (let i = ny; i > 0; i--) {
        const y0 = oy + i * sy;
        ctx.lineTo(ox, y0 - sy * 0.24);
        ctx.quadraticCurveTo(ox + notch * 1.15, y0 - sy * 0.5, ox, y0 - sy * 0.76);
        ctx.lineTo(ox, y0 - sy);
      }
      ctx.closePath();
      fillCurrentPath(customPlaqueBg || "#FFFDF8");
      strokeCurrentPath(strokeCol, strokePx);
      // Inner stamp window rule
      ctx.beginPath();
      ctx.rect(ox + pad, oy + pad, ow - pad * 2, oh - pad * 2);
      strokeCurrentPath(strokeCol, Math.max(1.8, strokePx * 0.55));
    } else if (config.plaqueStyle === "retro-ticket") {
      // Trending Retro Cinema / Event Ticket Stub
      const pLeft = left + bannerW * 0.02;
      const pTop = top + bannerH * 0.03;
      const pW = bannerW * 0.96;
      const pH = bannerH * 0.94;
      const c = Math.min(28, bannerH * 0.14);
      const traceTicket = (x: number, y: number, bw: number, bh: number, cr: number) => {
        ctx.beginPath();
        ctx.moveTo(x + cr, y);
        ctx.lineTo(x + bw - cr, y);
        ctx.quadraticCurveTo(x + bw - cr, y + cr, x + bw, y + cr);
        ctx.lineTo(x + bw, y + bh * 0.42);
        ctx.arc(x + bw, y + bh * 0.5, bh * 0.08, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(x + bw, y + bh - cr);
        ctx.quadraticCurveTo(x + bw - cr, y + bh - cr, x + bw - cr, y + bh);
        ctx.lineTo(x + cr, y + bh);
        ctx.quadraticCurveTo(x + cr, y + bh - cr, x, y + bh - cr);
        ctx.lineTo(x, y + bh * 0.58);
        ctx.arc(x, y + bh * 0.5, bh * 0.08, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(x, y + cr);
        ctx.quadraticCurveTo(x + cr, y + cr, x + cr, y);
        ctx.closePath();
      };
      traceTicket(pLeft, pTop, pW, pH, c);
      fillCurrentPath(customPlaqueBg || "#FEF9C3");
      strokeCurrentPath(strokeCol, strokePx);
      // Inner dashed ticket stub rule
      ctx.save();
      clearShadow();
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = Math.max(1.8, strokePx * 0.5);
      ctx.setLineDash([8, 6]);
      const ins = Math.max(14, w * 0.018);
      drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, 8);
      ctx.stroke();
      ctx.restore();
    } else if (config.plaqueStyle === "royal-crown") {
      // Trending Storybook Royal Crown Crest
      const pLeft = left + bannerW * 0.03;
      const pTop = top + bannerH * 0.05;
      const pW = bannerW * 0.94;
      const pH = bannerH * 0.91;
      const r = customRad ?? bannerH * 0.16;
      const crownCol = config.bannerBoundColor || "#D97706";
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFDF8");
      strokeCurrentPath(crownCol, strokePx);
      const ins = Math.max(10, strokePx * 2.2);
      drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(4, r - ins));
      strokeCurrentPath(crownCol, Math.max(1.6, strokePx * 0.5));
      // Crown emblem perched atop center top edge
      clearShadow();
      const cw = Math.max(64, w * 0.095);
      const ch = cw * 0.52;
      const cy = pTop + strokePx * 0.5;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bannerCX - cw * 0.42, cy);
      ctx.lineTo(bannerCX - cw * 0.5, cy - ch * 0.78);
      ctx.lineTo(bannerCX - cw * 0.2, cy - ch * 0.4);
      ctx.lineTo(bannerCX, cy - ch);
      ctx.lineTo(bannerCX + cw * 0.2, cy - ch * 0.4);
      ctx.lineTo(bannerCX + cw * 0.5, cy - ch * 0.78);
      ctx.lineTo(bannerCX + cw * 0.42, cy);
      ctx.closePath();
      ctx.fillStyle = customPlaqueBg || "#FFFDF8";
      ctx.fill();
      ctx.strokeStyle = crownCol;
      ctx.lineWidth = Math.max(3, strokePx);
      ctx.lineJoin = "round";
      ctx.stroke();
      const jR = Math.max(3.5, strokePx * 0.9);
      ctx.fillStyle = crownCol;
      for (const [jx, jy] of [
        [bannerCX - cw * 0.5, cy - ch * 0.86],
        [bannerCX, cy - ch * 1.08],
        [bannerCX + cw * 0.5, cy - ch * 0.86],
      ]) {
        ctx.beginPath();
        ctx.arc(jx, jy, jR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (config.plaqueStyle === "comic-burst") {
      // High-CTR Pop-Art Comic Starburst Banner
      const spikes = 22;
      const rx = bannerW * 0.51;
      const ry = bannerH * 0.53;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const isOuter = i % 2 === 0;
        const mult = isOuter ? (i % 4 === 0 ? 1.15 : 1.07) : 0.92;
        const px = bannerCX + Math.cos(ang) * rx * mult;
        const py = bannerY + Math.sin(ang) * ry * mult;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      fillCurrentPath(customPlaqueBg || "#FEF08A");
      strokeCurrentPath(config.bannerBoundColor || "#111113", Math.max(strokePx, w * 0.005));
    } else if (config.plaqueStyle === "floral-arch") {
      // Trending Cottagecore Botanical Floral Frame
      const pLeft = left + bannerW * 0.025;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.95;
      const pH = bannerH * 0.92;
      const r = customRad ?? bannerH * 0.24;
      const botCol = config.bannerBoundColor || config.primaryColor || "#15803D";
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFDF9");
      strokeCurrentPath(botCol, strokePx);
      const ins = Math.max(9, strokePx * 2);
      drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(4, r - ins));
      strokeCurrentPath(botCol, Math.max(1.5, strokePx * 0.45));
      // Twin corner 5-petal blossoms + leaves
      clearShadow();
      const drawBlossom = (bx: number, by: number, flip: number) => {
        const pr = Math.max(11, w * 0.015);
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = customPlaqueBg || "#FFFFFF";
        ctx.strokeStyle = botCol;
        ctx.lineWidth = Math.max(2, strokePx * 0.65);
        for (const [lx, ly, rot] of [
          [flip * pr * 1.9, -pr * 0.45, flip * -0.45],
          [-flip * pr * 0.4, flip * pr * 1.85, flip * 1.15],
        ]) {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, pr * 1.35, pr * 0.56, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * pr * 0.88, Math.sin(a) * pr * 0.88, pr * 0.62, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, pr * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = config.secondaryColor || botCol;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
      drawBlossom(pLeft + r * 0.25, pTop + r * 0.22, 1);
      drawBlossom(pLeft + pW - r * 0.25, pTop + pH - r * 0.22, -1);
    } else if (config.plaqueStyle === "neon-cyber") {
      // Trending Luminous Neon Glow Frame
      const pLeft = left + bannerW * 0.025;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.95;
      const pH = bannerH * 0.92;
      const r = customRad ?? bannerH * 0.16;
      const neonCol = config.bannerBoundColor || "#38BDF8";
      const fillAlpha = config.bannerBoundBgOpacity !== undefined ? bgOpacity : 0.84;
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#0F172A", fillAlpha);
      ctx.save();
      ctx.strokeStyle = neonCol;
      ctx.lineWidth = Math.max(strokePx, 3.5);
      ctx.shadowColor = neonCol;
      ctx.shadowBlur = Math.max(18, w * 0.026);
      applyDash(ctx.lineWidth);
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      ctx.stroke();
      ctx.shadowBlur = Math.max(8, w * 0.012);
      ctx.stroke();
      // Inner crisp white core line
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(1.2, strokePx * 0.32);
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      ctx.stroke();
      ctx.restore();
    } else {
      // Clean Badge ("ribbon-badge")
      const pLeft = left + bannerW * 0.03;
      const pTop = top + bannerH * 0.04;
      const pW = bannerW * 0.94;
      const pH = bannerH * 0.92;
      const r = customRad ?? bannerH * 0.14;
      drawRoundedRectPath(ctx, pLeft, pTop, pW, pH, r);
      fillCurrentPath(customPlaqueBg || "#FFFFFF");
      strokeCurrentPath(strokeCol, strokePx);
      if (boundDash === "double" && strokePx > 0.2) {
        const ins = Math.max(9, strokePx * 2.2);
        drawRoundedRectPath(ctx, pLeft + ins, pTop + ins, pW - ins * 2, pH - ins * 2, Math.max(2, r - ins));
        strokeCurrentPath(strokeCol, Math.max(1.5, strokePx * 0.55));
      }
    }
  }
  ctx.restore();

  // Theme Corner Decorations on Plaque
  if (config.decorTheme === "christmas") {
    drawHollyCluster(ctx, left + bannerW * 0.04, top + bannerH * 0.34, w / 860);
    if (config.plaqueStyle === "cloud-sticker") {
      ctx.save();
      ctx.translate(left + bannerW * 0.12, top + bannerH * 0.08);
      ctx.rotate(-0.35);
      ctx.fillStyle = "#DC2626";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-w * 0.048, w * 0.015);
      ctx.quadraticCurveTo(-w * 0.01, -w * 0.075, w * 0.055, -w * 0.032);
      ctx.lineTo(w * 0.042, w * 0.02);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRectPath(ctx, -w * 0.055, w * 0.005, w * 0.105, w * 0.026, w * 0.013);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.058, -w * 0.032, w * 0.015, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (config.decorTheme === "botanical") {
    drawPineBranch(ctx, left + bannerW * 0.02, top + bannerH * 0.4, -0.5, w * 0.12, "#15803D", "#22C55E");
    drawPineBranch(ctx, left + bannerW * 0.98, top + bannerH * 0.4, Math.PI + 0.5, w * 0.12, "#15803D", "#22C55E");
  } else if (config.decorTheme === "sparkle" || config.decorTheme === "stars") {
    drawFourPointStar(ctx, left + bannerW * 0.065, top + bannerH * 0.14, w * 0.022, config.primaryColor);
    drawFourPointStar(ctx, left + bannerW * 0.935, top + bannerH * 0.14, w * 0.022, config.secondaryColor);
    drawFourPointStar(ctx, left + bannerW * 0.08, top + bannerH * 0.84, w * 0.016, config.ribbonColor);
    drawFourPointStar(ctx, left + bannerW * 0.92, top + bannerH * 0.84, w * 0.016, config.primaryColor);
  } else if (config.decorTheme === "hearts") {
    drawHeart(ctx, left + bannerW * 0.065, top + bannerH * 0.16, w * 0.028, config.primaryColor, -0.22);
    drawHeart(ctx, left + bannerW * 0.935, top + bannerH * 0.16, w * 0.028, config.primaryColor, 0.22);
  }

  // Multi-Line Hero Typography inside Plaque
  const fontFam = config.fontFamily || "'Fredoka', 'Padauk', sans-serif";
  const userScale = Math.max(0.6, Math.min(1.5, (config.titleFontScale ?? 100) / 100));
  const scaleFactor = (Math.min(w, bannerH * 2.2) / 1000) * userScale;

  // Line 1: Optional Accent Badge + Title Line 1
  const l1CX = bannerCX + (config.title1OffsetX ?? 0) * (w / 1000);
  const line1Y = top + bannerH * 0.21 + (config.title1OffsetY ?? 0) * (h / 1000);
  const line1Size = Math.round(92 * scaleFactor);
  const badgeSize = Math.round(112 * scaleFactor);
  const line1Style = config.title1Style || "outline-3d";
  const line1Color = config.title1Color || config.primaryColor;
  const line1SecondaryColor = config.title1Color || config.secondaryColor;

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  const hasBadge = Boolean(config.accentBadge.trim());
  const line1Text = config.titleLine1.trim();
  const badgeText = config.accentBadge.trim();

  if (hasBadge && line1Text) {
    ctx.font = `700 ${badgeSize}px ${fontFam}`;
    const bw = ctx.measureText(badgeText).width;
    ctx.font = `700 ${line1Size}px ${fontFam}`;
    const lw = ctx.measureText(line1Text).width;
    const gap = w * 0.02;
    const totalW = bw + gap + lw;
    const startX = l1CX - totalW / 2;

    if (config.title1BgColor && config.title1BgColor !== "transparent") {
      const boxW = Math.min(bannerW * 0.9, totalW + line1Size * 0.9);
      const boxH = Math.max(badgeSize, line1Size) * 1.24;
      ctx.fillStyle = config.title1BgColor;
      drawRoundedRectPath(ctx, l1CX - boxW / 2, line1Y - boxH / 2, boxW, boxH, boxH / 2);
      ctx.fill();
    }

    drawStyledBannerText(
      ctx,
      badgeText,
      startX,
      line1Y,
      bw + 16,
      badgeSize,
      fontFam,
      config.primaryColor,
      line1Style,
      undefined,
      "left"
    );
    drawStyledBannerText(
      ctx,
      line1Text,
      startX + bw + gap,
      line1Y,
      bannerW * 0.72,
      line1Size,
      fontFam,
      line1SecondaryColor,
      line1Style,
      undefined,
      "left"
    );
  } else if (hasBadge || line1Text) {
    const txt = hasBadge ? badgeText : line1Text;
    drawStyledBannerText(
      ctx,
      txt,
      l1CX,
      line1Y,
      bannerW * 0.84,
      Math.round(line1Size * 1.12),
      fontFam,
      line1Color,
      line1Style,
      config.title1BgColor
    );
  }

  // Line 2: Ribbon Highlight Banner or Custom Styled Headline
  const l2CX = bannerCX + (config.title2OffsetX ?? 0) * (w / 1000);
  const line2Y = top + bannerH * 0.455 + (config.title2OffsetY ?? 0) * (h / 1000);
  const line2Text = config.titleLine2Ribbon.trim();
  const line2Size = Math.round(74 * scaleFactor);
  const effectiveLine2Style =
    config.title2Style ||
    (config.plaqueStyle === "wood-plaque" || config.plaqueStyle === "ribbon-badge"
      ? "ribbon"
      : "outline-3d");

  if (line2Text) {
    if (effectiveLine2Style === "ribbon") {
      drawSwallowtailRibbon(ctx, l2CX, line2Y, bannerW * 0.96, bannerH * 0.22, config.ribbonColor);
      ctx.textAlign = "center";
      ctx.font = `700 ${line2Size}px ${fontFam}`;
      ctx.fillStyle = config.title2TextColor || "#FFFFFF";
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 4;
      ctx.fillText(line2Text, l2CX, line2Y + 2, bannerW * 0.86);
      ctx.shadowBlur = 0;
    } else {
      drawStyledBannerText(
        ctx,
        line2Text,
        l2CX,
        line2Y,
        bannerW * 0.88,
        Math.round(line2Size * 1.06),
        fontFam,
        config.title2TextColor || (effectiveLine2Style === "pill-box" ? "#FFFFFF" : config.secondaryColor),
        effectiveLine2Style,
        effectiveLine2Style === "pill-box" ? config.ribbonColor : undefined
      );
    }
  }

  // Line 3: Bold Sub-Headline + Side Decorations
  const l3CX = bannerCX + (config.title3OffsetX ?? 0) * (w / 1000);
  const line3Y = top + bannerH * 0.67 + (config.title3OffsetY ?? 0) * (h / 1000);
  const line3Text = config.titleLine3.trim();
  const line3Size = Math.round(66 * scaleFactor);
  const line3Style = config.title3Style || "outline-3d";
  const line3Color =
    config.title3Color ||
    (config.plaqueStyle === "cloud-sticker" ? config.primaryColor : config.secondaryColor);

  if (line3Text) {
    ctx.font = `700 ${line3Size}px ${fontFam}`;
    const l3W = Math.min(bannerW * 0.68, ctx.measureText(line3Text).width);
    drawStyledBannerText(
      ctx,
      line3Text,
      l3CX,
      line3Y,
      bannerW * 0.76,
      line3Size,
      fontFam,
      line3Color,
      line3Style,
      config.title3BgColor
    );

    if (config.decorTheme === "christmas") {
      drawSnowflake(ctx, l3CX - l3W / 2 - w * 0.055, line3Y, w * 0.02, "#15803D", 3.5);
      drawSnowflake(ctx, l3CX + l3W / 2 + w * 0.055, line3Y, w * 0.02, "#DC2626", 3.5);
    } else {
      drawHeart(ctx, l3CX - l3W / 2 - w * 0.05, line3Y + 4, w * 0.025, config.primaryColor, -0.2);
      drawHeart(ctx, l3CX + l3W / 2 + w * 0.05, line3Y + 4, w * 0.025, config.primaryColor, 0.2);
    }
  }

  // Subtitle Pill / Custom Text Style at Bottom of Plaque
  if (config.subtitleText.trim()) {
    const subCX = bannerCX + (config.subtitleOffsetX ?? 0) * (w / 1000);
    const subY = top + bannerH * 0.875 + (config.subtitleOffsetY ?? 0) * (h / 1000);
    const subText = config.subtitleText.trim();
    const subSize = Math.round(38 * scaleFactor);
    const subStyle = config.subtitleStyle || "pill";

    if (subStyle === "pill") {
      ctx.font = `700 ${subSize}px ${fontFam}`;
      const subTextW = Math.min(bannerW * 0.72, ctx.measureText(subText).width);
      const pillW = Math.max(bannerW * 0.56, subTextW + w * 0.1);
      const pillH = bannerH * 0.175;

      if (config.subtitleBgColor !== "transparent") {
        ctx.fillStyle = config.subtitleBgColor;
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        drawRoundedRectPath(ctx, subCX - pillW / 2, subY - pillH / 2, pillW, pillH, pillH / 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.fillStyle = config.subtitleTextColor;
      ctx.textAlign = "center";
      ctx.fillText(subText, subCX, subY + 1, pillW * 0.88);

      drawHeart(ctx, subCX - pillW / 2 - w * 0.035, subY + 3, w * 0.024, config.primaryColor, -0.22);
      drawHeart(ctx, subCX + pillW / 2 + w * 0.035, subY + 3, w * 0.024, config.primaryColor, 0.22);
    } else {
      drawStyledBannerText(
        ctx,
        subText,
        subCX,
        subY,
        bannerW * 0.84,
        subSize,
        fontFam,
        config.subtitleTextColor,
        subStyle,
        config.subtitleBgColor
      );
    }
  }

  ctx.restore();
}

function drawFooterBrand(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ShowcaseDesignConfig
) {
  const text = config.footerBrandText.trim();
  if (!text) return;

  const fx = w / 2 + ((config.footerOffsetX ?? 0) / 100) * w;
  const fy = h * 0.94 + ((config.footerOffsetY ?? 0) / 100) * h;
  const fontFam = config.fontFamily || "'Fredoka', 'Padauk', sans-serif";
  const fontSize = Math.round(w * 0.046);
  const fStyle = config.footerStyle || "pill";
  const fTextCol = config.footerTextColor || "#FFFFFF";

  ctx.save();
  ctx.font = `700 ${fontSize}px ${fontFam}`;
  const tw = Math.min(w * 0.65, ctx.measureText(text).width);
  const pw = Math.max(w * 0.44, tw + w * 0.12);
  const ph = Math.max(54, h * 0.048);

  if (fStyle === "pill") {
    if (config.footerBgColor !== "transparent") {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = config.footerBgColor || "#DC2626";
      drawRoundedRectPath(ctx, fx - pw / 2, fy - ph / 2, pw, ph, ph * 0.36);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (const dir of [-1, 1]) {
      const bx = fx + dir * (pw / 2 + w * 0.018);
      ctx.beginPath();
      ctx.moveTo(bx, fy - ph * 0.28);
      ctx.lineTo(bx + dir * w * 0.025, fy - ph * 0.45);
      ctx.moveTo(bx + dir * w * 0.005, fy);
      ctx.lineTo(bx + dir * w * 0.032, fy);
      ctx.moveTo(bx, fy + ph * 0.28);
      ctx.lineTo(bx + dir * w * 0.025, fy + ph * 0.45);
      ctx.stroke();
    }

    ctx.fillStyle = fTextCol;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, fx, fy + 2, pw * 0.86);
  } else {
    drawStyledBannerText(
      ctx,
      text,
      fx,
      fy,
      w * 0.82,
      fontSize,
      fontFam,
      fTextCol,
      fStyle,
      config.footerBgColor
    );
  }
  ctx.restore();
}

async function drawFlatLayOpenBookSpread(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ShowcaseDesignConfig
) {
  const geom = isFlatLayBackdrop(config.backdrop)
    ? FLAT_LAY_BOOK_SPREAD_GEOMETRY[config.backdrop]
    : {
        cx: 0.5,
        cy: 0.56,
        spreadW: 0.78,
        spreadH: 0.34,
        angleDeg: 0,
        paperTint: "#FCF9F2",
      };

  // Compute cover-fit transform so book coordinates align cleanly across aspect ratios
  const baseAspect = 2 / 3;
  const currentAspect = w / h;
  let refW = w;
  let refH = h;
  let offX = 0;
  let offY = 0;
  if (currentAspect > baseAspect) {
    refW = w;
    refH = w / baseAspect;
    offY = (h - refH) / 2;
  } else {
    refH = h;
    refW = h * baseAspect;
    offX = (w - refW) / 2;
  }

  const cx = offX + geom.cx * refW;
  const cy = offY + geom.cy * refH;
  const spreadW = geom.spreadW * refW;
  const spreadH = geom.spreadH * refH;
  const pageW = spreadW / 2;
  const angleRad = (geom.angleDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);

  // Subtle drop shadow under spread when used on non-flatlay backdrops
  if (!isFlatLayBackdrop(config.backdrop)) {
    ctx.shadowColor = "rgba(0,0,0,0.34)";
    ctx.shadowBlur = w * 0.035;
    ctx.shadowOffsetY = h * 0.012;
  }

  // Natural paper backing for open spread
  ctx.fillStyle = geom.paperTint;
  drawRoundedRectPath(ctx, -spreadW / 2, -spreadH / 2, spreadW, spreadH, Math.max(4, w * 0.004));
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const leftSlot = config.cards[0];
  const rightSlot = config.cards[1] || config.cards[0];
  const pageInsetX = pageW * 0.06;
  const pageInsetY = spreadH * 0.055;
  const gutterPad = pageW * 0.045;

  const drawBookPageArt = async (
    slot: ShowcaseCardSlot | undefined,
    px: number,
    py: number,
    pw: number,
    ph: number
  ) => {
    if (!slot?.src) return;
    try {
      const img = await loadImageCached(slot.src);
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();

      const scale = Math.min(pw / img.naturalWidth, ph / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      ctx.restore();
    } catch {
      // ignore failed image decode
    }
  };

  // Left Page (index 0)
  await drawBookPageArt(
    leftSlot,
    -spreadW / 2 + pageInsetX,
    -spreadH / 2 + pageInsetY,
    pageW - pageInsetX - gutterPad,
    spreadH - pageInsetY * 2
  );

  // Right Page (index 1)
  await drawBookPageArt(
    rightSlot,
    gutterPad,
    -spreadH / 2 + pageInsetY,
    pageW - pageInsetX - gutterPad,
    spreadH - pageInsetY * 2
  );

  // Realistic center spine gutter gradient shadow
  const spineGrad = ctx.createLinearGradient(-pageW * 0.14, 0, pageW * 0.14, 0);
  spineGrad.addColorStop(0, "rgba(0,0,0,0)");
  spineGrad.addColorStop(0.38, "rgba(38,24,14,0.09)");
  spineGrad.addColorStop(0.5, "rgba(24,15,8,0.28)");
  spineGrad.addColorStop(0.62, "rgba(38,24,14,0.09)");
  spineGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spineGrad;
  ctx.fillRect(-pageW * 0.14, -spreadH / 2, pageW * 0.28, spreadH);

  // Spiral wire binding rings for spiral-bound book scenes
  if (geom.isSpiral) {
    const ringCount = 15;
    const ringSpan = spreadH * 0.88;
    const startY = -ringSpan / 2;
    const step = ringSpan / (ringCount - 1);
    const ringW = pageW * 0.068;
    ctx.strokeStyle = "#27272A";
    ctx.lineWidth = Math.max(2.4, w * 0.003);
    ctx.lineCap = "round";
    for (let i = 0; i < ringCount; i++) {
      const ry = startY + i * step;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.arc(-ringW * 0.58, ry, Math.max(2.2, w * 0.0028), 0, Math.PI * 2);
      ctx.arc(ringW * 0.58, ry, Math.max(2.2, w * 0.0028), 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-ringW * 0.58, ry - 1.5);
      ctx.quadraticCurveTo(0, ry - 4.5, ringW * 0.58, ry - 1.5);
      ctx.stroke();
    }
  }

  // Subtle paper page edges
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = Math.max(1.2, w * 0.0014);
  drawRoundedRectPath(ctx, -spreadW / 2, -spreadH / 2, spreadW, spreadH, Math.max(4, w * 0.004));
  ctx.stroke();

  ctx.restore();
}

async function drawBookMockupSlots(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ShowcaseDesignConfig
) {
  const slots = isBookMockupBackdrop(config.backdrop)
    ? BOOK_MOCKUP_SLOT_GEOMETRY[config.backdrop]
    : [
        {
          label: "Book Cover",
          cx: 0.5,
          cy: 0.54,
          w: 0.44,
          h: 0.4,
          angleDeg: 0,
          fit: "cover" as const,
          paperBg: "#FFFFFF",
          insetPct: 0,
          spineEdge: "left" as const,
        },
      ];

  const baseAspect = 2 / 3;
  const currentAspect = w / h;
  let refW = w;
  let refH = h;
  let offX = 0;
  let offY = 0;
  if (currentAspect > baseAspect) {
    refW = w;
    refH = w / baseAspect;
    offY = (h - refH) / 2;
  } else {
    refH = h;
    refW = h * baseAspect;
    offX = (w - refW) / 2;
  }

  for (let i = 0; i < slots.length; i++) {
    const geom = slots[i];
    const card = config.cards[i % config.cards.length];
    if (!card?.src) continue;

    const cx = offX + geom.cx * refW;
    const cy = offY + geom.cy * refH;
    const sw = geom.w * refW;
    const sh = geom.h * refH;
    const angleRad = (geom.angleDeg * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);

    // Subtle grounded shadow
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = w * 0.024;
    ctx.shadowOffsetY = h * 0.008;
    ctx.fillStyle = geom.paperBg;
    drawRoundedRectPath(ctx, -sw / 2, -sh / 2, sw, sh, Math.max(3, w * 0.003));
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    try {
      const img = await loadImageCached(card.src);
      const insetX = sw * (geom.insetPct ?? 0);
      const insetY = sh * (geom.insetPct ?? 0);
      const innerW = sw - insetX * 2;
      const innerH = sh - insetY * 2;

      ctx.save();
      drawRoundedRectPath(
        ctx,
        -sw / 2 + insetX,
        -sh / 2 + insetY,
        innerW,
        innerH,
        Math.max(2, w * 0.002)
      );
      ctx.clip();

      const scale =
        geom.fit === "cover"
          ? Math.max(innerW / img.naturalWidth, innerH / img.naturalHeight)
          : Math.min(innerW / img.naturalWidth, innerH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } catch {
      // ignore failed decode
    }

    // Subtle paperback spine crease highlight along left edge for book covers
    if (geom.spineEdge === "left") {
      const creaseW = sw * 0.055;
      const grad = ctx.createLinearGradient(-sw / 2, 0, -sw / 2 + creaseW, 0);
      grad.addColorStop(0, "rgba(0,0,0,0.18)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.22)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.09)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(-sw / 2, -sh / 2, creaseW, sh);
    }

    // Fine edge border for realistic print depth
    ctx.strokeStyle = "rgba(0,0,0,0.14)";
    ctx.lineWidth = Math.max(1.2, w * 0.0014);
    drawRoundedRectPath(ctx, -sw / 2, -sh / 2, sw, sh, Math.max(3, w * 0.003));
    ctx.stroke();

    ctx.restore();
  }
}

export async function renderShowcaseDesignToCanvas(
  canvas: HTMLCanvasElement,
  config: ShowcaseDesignConfig
): Promise<void> {
  const { width, height } = getShowcaseCanvasSize(config.aspect);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Ensure Google Fonts are settled before drawing text
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }

  // 1. Atmospheric Tabletop / Photorealistic Flat-Lay & Book Mockup Backdrop
  await drawSceneBackdrop(ctx, width, height, config.backdrop, config.customBackdropSrc);

  // 2. Showcase Artwork Cards OR Calibrated Flat-Lay / Book Mockup Overlays
  if (config.layout === "flat-lay-book") {
    if (config.overlayFlatLayPages) {
      await drawFlatLayOpenBookSpread(ctx, width, height, config);
    }
  } else if (config.layout === "book-mockup") {
    if (config.overlayFlatLayPages) {
      await drawBookMockupSlots(ctx, width, height, config);
    }
  } else {
    const placements = getCardPlacements(config.layout, width, height);
    for (let i = 0; i < placements.length; i++) {
      const slot = config.cards[i % config.cards.length];
      if (slot) {
        await drawSingleCard(
          ctx,
          slot,
          placements[i],
          config.showCardCaptions,
          config.fontFamily
        );
      }
    }
  }

  // 3. Hero Die-Cut Sticker / Plaque Banner (can be toggled off cleanly)
  if (!config.hideHeroBanner) {
    drawHeroBanner(ctx, width, height, config);
  }

  // 4. Footer Brand / URL Ribbon
  drawFooterBrand(ctx, width, height, config);

  // 5. Optional Free Custom Text Overlays on Top of Entire Design
  if (config.customTextLayers && config.customTextLayers.length > 0) {
    for (const layer of config.customTextLayers) {
      drawTextLayerOnCanvas(ctx, layer, width, height);
    }
  }
}

export async function exportShowcaseDesignDataUrl(
  config: ShowcaseDesignConfig
): Promise<{ dataUrl: string; width: number; height: number }> {
  const { width, height } = getShowcaseCanvasSize(config.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  await renderShowcaseDesignToCanvas(canvas, config);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width,
    height,
  };
}
