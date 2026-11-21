import { TextBoundStyle } from "../types/studio";

export const TEXT_BOUND_STYLES: { id: TextBoundStyle; label: string }[] = [
  { id: "none", label: "No Bound" },
  { id: "solid", label: "01. Solid Box" },
  { id: "rounded", label: "02. Pill Frame" },
  { id: "dashed", label: "03. Dashed" },
  { id: "dotted", label: "04. Dotted" },
  { id: "double", label: "05. Double Line" },
  { id: "neon-glow", label: "06. Neon Glow" },
  { id: "ribbon", label: "07. Ribbon" },
  { id: "ticket", label: "08. Ticket Stub" },
  { id: "bracket", label: "09. Brackets" },
  { id: "top-bottom-rule", label: "10. Top/Bot Bar" },
  { id: "speech-bubble", label: "11. Speech" },
  { id: "scallop-seal", label: "12. Scallop" },
  { id: "gold-ornate", label: "13. Ornate" },
  { id: "shadow-card", label: "14. 3D Shadow" },
  { id: "sketch-double", label: "15. Sketch" },
  { id: "leaf-crest", label: "16. Leaf Crest" },
  { id: "circle", label: "17. Circle" },
  { id: "leaf", label: "18. Leaf" },
  { id: "heart", label: "19. Heart" },
  { id: "seal", label: "20. Seal" },
  { id: "book", label: "21. Book" },
];

export interface BoundRenderOptions {
  style: TextBoundStyle;
  thickness: number;
  radius: number;
  strokeColor: string;
  fillColor: string;
  fillOpacity: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return hex;
}

function traceTicketPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  notch: number
) {
  const n = Math.min(notch, w * 0.2, h * 0.35);
  ctx.beginPath();
  ctx.moveTo(x + n, y);
  ctx.lineTo(x + w - n, y);
  ctx.arc(x + w, y, n, Math.PI, Math.PI * 0.5, true);
  ctx.lineTo(x + w, y + h - n);
  ctx.arc(x + w, y + h, n, -Math.PI * 0.5, Math.PI, true);
  ctx.lineTo(x + n, y + h);
  ctx.arc(x, y + h, n, 0, -Math.PI * 0.5, true);
  ctx.lineTo(x, y + n);
  ctx.arc(x, y, n, Math.PI * 0.5, 0, true);
  ctx.closePath();
}

function traceRibbonPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const tail = Math.min(28, w * 0.14, h * 0.48);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - tail, y + h / 2);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + tail, y + h / 2);
  ctx.closePath();
}

function traceSpeechPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  const tailH = Math.max(10, h * 0.22);
  const tailW = Math.max(12, Math.min(26, w * 0.14));
  const midX = x + w * 0.5;

  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(midX + tailW * 0.6, y + h);
  ctx.lineTo(midX - tailW * 0.2, y + h + tailH);
  ctx.lineTo(midX - tailW * 0.5, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function traceScallopPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  const step = Math.max(12 * scale, 10);
  const nx = Math.max(4, Math.round(w / step));
  const ny = Math.max(2, Math.round(h / step));
  const sx = w / nx;
  const sy = h / ny;
  const amp = Math.min(sx, sy) * 0.28;

  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < nx; i++) {
    ctx.quadraticCurveTo(x + (i + 0.5) * sx, y - amp, x + (i + 1) * sx, y);
  }
  for (let i = 0; i < ny; i++) {
    ctx.quadraticCurveTo(x + w + amp, y + (i + 0.5) * sy, x + w, y + (i + 1) * sy);
  }
  for (let i = nx; i > 0; i--) {
    ctx.quadraticCurveTo(x + (i - 0.5) * sx, y + h + amp, x + (i - 1) * sx, y + h);
  }
  for (let i = ny; i > 0; i--) {
    ctx.quadraticCurveTo(x - amp, y + (i - 0.5) * sy, x, y + (i - 1) * sy);
  }
  ctx.closePath();
}

function traceLeafPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  const cy = y + h / 2;
  const tip = Math.max(18 * scale, h * 0.36);
  const vCtrl = Math.max(14 * scale, h * 0.36);
  const lx = x - tip;
  const rx = x + w + tip;

  ctx.beginPath();
  ctx.moveTo(lx, cy);
  ctx.bezierCurveTo(
    x + w * 0.16,
    y - vCtrl,
    x + w * 0.84,
    y - vCtrl,
    rx,
    cy
  );
  ctx.bezierCurveTo(
    x + w * 0.84,
    y + h + vCtrl,
    x + w * 0.16,
    y + h + vCtrl,
    lx,
    cy
  );
  ctx.closePath();
}

function traceHeartPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const hw = Math.max(w * 0.76, h * 0.92);
  const hh = Math.max(h * 1.15, w * 0.56);

  ctx.beginPath();
  ctx.moveTo(cx, cy - hh * 0.42);
  ctx.bezierCurveTo(
    cx + hw * 0.15,
    cy - hh * 1.15,
    cx + hw * 1.15,
    cy - hh * 0.85,
    cx + hw * 0.96,
    cy - hh * 0.12
  );
  ctx.bezierCurveTo(
    cx + hw * 0.85,
    cy + hh * 0.38,
    cx + hw * 0.28,
    cy + hh * 0.72,
    cx,
    cy + hh * 0.98
  );
  ctx.bezierCurveTo(
    cx - hw * 0.28,
    cy + hh * 0.72,
    cx - hw * 0.85,
    cy + hh * 0.38,
    cx - hw * 0.96,
    cy - hh * 0.12
  );
  ctx.bezierCurveTo(
    cx - hw * 1.15,
    cy - hh * 0.85,
    cx - hw * 0.15,
    cy - hh * 1.15,
    cx,
    cy - hh * 0.42
  );
  ctx.closePath();
}

function traceSealPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth = 24
) {
  const ctrlR = outerR + (outerR - innerR) * 0.45;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const aMid = ((i + 0.5) / teeth) * Math.PI * 2;
    const a1 = ((i + 1) / teeth) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * innerR;
    const y0 = cy + Math.sin(a0) * innerR;
    const xc = cx + Math.cos(aMid) * ctrlR;
    const yc = cy + Math.sin(aMid) * ctrlR;
    const x1 = cx + Math.cos(a1) * innerR;
    const y1 = cy + Math.sin(a1) * innerR;
    if (i === 0) ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(xc, yc, x1, y1);
  }
  ctx.closePath();
}

function traceBookPagesPath(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  arch: number
) {
  const cx = bx + bw / 2;
  ctx.beginPath();
  ctx.moveTo(bx, by + arch * 0.45);
  ctx.quadraticCurveTo(bx + bw * 0.25, by - arch * 0.7, cx, by + arch * 0.7);
  ctx.quadraticCurveTo(bx + bw * 0.75, by - arch * 0.7, bx + bw, by + arch * 0.45);
  ctx.lineTo(bx + bw, by + bh - arch * 0.25);
  ctx.quadraticCurveTo(bx + bw * 0.75, by + bh - arch * 1.05, cx, by + bh + arch * 0.3);
  ctx.quadraticCurveTo(bx + bw * 0.25, by + bh - arch * 1.05, bx, by + bh - arch * 0.25);
  ctx.closePath();
}

export function drawTextBoundOnCanvas(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  baseScale: number,
  opts: BoundRenderOptions
) {
  if (!opts.style || opts.style === "none") return;

  const lw = Math.max(1.5, opts.thickness * baseScale);
  const rad = Math.min(opts.radius * baseScale, boxW / 2, boxH / 2);
  const fillRgba = opts.fillOpacity > 0 ? hexToRgba(opts.fillColor, opts.fillOpacity) : null;

  ctx.save();
  ctx.strokeStyle = opts.strokeColor;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const drawFillAndStroke = (trace: () => void, skipStroke = false) => {
    if (fillRgba) {
      trace();
      ctx.fillStyle = fillRgba;
      ctx.fill();
    }
    if (!skipStroke) {
      trace();
      ctx.stroke();
    }
  };

  switch (opts.style) {
    case "solid": {
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, Math.min(rad, 8 * baseScale));
      });
      break;
    }
    case "rounded": {
      const pillR = Math.min(Math.max(rad, boxH / 2), boxH / 2);
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, pillR);
      });
      break;
    }
    case "dashed": {
      if (fillRgba) {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, rad);
        ctx.fillStyle = fillRgba;
        ctx.fill();
      }
      ctx.setLineDash([lw * 3, lw * 2]);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, rad);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case "dotted": {
      if (fillRgba) {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, rad);
        ctx.fillStyle = fillRgba;
        ctx.fill();
      }
      ctx.setLineDash([0.5, lw * 2.3]);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, rad);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case "double": {
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, rad);
      });
      const inset = Math.max(4 * baseScale, lw * 1.6);
      if (boxW > inset * 3 && boxH > inset * 3) {
        ctx.lineWidth = Math.max(1, lw * 0.55);
        ctx.beginPath();
        ctx.roundRect(
          boxX + inset,
          boxY + inset,
          boxW - inset * 2,
          boxH - inset * 2,
          Math.max(0, rad - inset)
        );
        ctx.stroke();
      }
      break;
    }
    case "neon-glow": {
      if (fillRgba) {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, rad);
        ctx.fillStyle = fillRgba;
        ctx.fill();
      }
      ctx.shadowColor = opts.strokeColor;
      ctx.shadowBlur = 18 * baseScale;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, rad);
      ctx.stroke();
      ctx.shadowBlur = 6 * baseScale;
      ctx.stroke();
      break;
    }
    case "ribbon": {
      drawFillAndStroke(() => traceRibbonPath(ctx, boxX, boxY, boxW, boxH));
      break;
    }
    case "ticket": {
      drawFillAndStroke(() => traceTicketPath(ctx, boxX, boxY, boxW, boxH, 14 * baseScale));
      break;
    }
    case "bracket": {
      if (fillRgba) {
        ctx.fillStyle = fillRgba;
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }
      const arm = Math.min(24 * baseScale, boxW * 0.25, boxH * 0.45);
      ctx.beginPath();
      // Top-left
      ctx.moveTo(boxX, boxY + arm);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + arm, boxY);
      // Top-right
      ctx.moveTo(boxX + boxW - arm, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + arm);
      // Bottom-right
      ctx.moveTo(boxX + boxW, boxY + boxH - arm);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW - arm, boxY + boxH);
      // Bottom-left
      ctx.moveTo(boxX + arm, boxY + boxH);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX, boxY + boxH - arm);
      ctx.stroke();
      break;
    }
    case "top-bottom-rule": {
      if (fillRgba) {
        ctx.fillStyle = fillRgba;
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }
      ctx.beginPath();
      ctx.moveTo(boxX, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.moveTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.stroke();
      break;
    }
    case "speech-bubble": {
      drawFillAndStroke(() => traceSpeechPath(ctx, boxX, boxY, boxW, boxH, Math.max(rad, 14 * baseScale)));
      break;
    }
    case "scallop-seal": {
      drawFillAndStroke(() => traceScallopPath(ctx, boxX, boxY, boxW, boxH, baseScale));
      break;
    }
    case "gold-ornate": {
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, Math.min(rad, 10 * baseScale));
      });
      const inset = Math.max(5 * baseScale, lw * 1.5);
      if (boxW > inset * 3 && boxH > inset * 3) {
        ctx.lineWidth = Math.max(1, lw * 0.55);
        ctx.strokeRect(boxX + inset, boxY + inset, boxW - inset * 2, boxH - inset * 2);
      }
      // Corner diamonds
      const d = Math.max(4 * baseScale, lw * 1.3);
      ctx.fillStyle = opts.strokeColor;
      for (const [cx, cy] of [
        [boxX, boxY],
        [boxX + boxW, boxY],
        [boxX + boxW, boxY + boxH],
        [boxX, boxY + boxH],
      ]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - d);
        ctx.lineTo(cx + d, cy);
        ctx.lineTo(cx, cy + d);
        ctx.lineTo(cx - d, cy);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "shadow-card": {
      const off = Math.max(5 * baseScale, lw * 1.6);
      ctx.fillStyle = opts.strokeColor;
      ctx.beginPath();
      ctx.roundRect(boxX + off, boxY + off, boxW, boxH, rad);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, rad);
      ctx.fillStyle = fillRgba || "#FFFFFF";
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "sketch-double": {
      if (fillRgba) {
        ctx.fillStyle = fillRgba;
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }
      const off = Math.max(3 * baseScale, lw * 0.9);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.save();
      ctx.translate(boxX + boxW / 2, boxY + boxH / 2);
      ctx.rotate(0.018);
      ctx.strokeRect(-boxW / 2 + off, -boxH / 2 - off * 0.6, boxW, boxH);
      ctx.restore();
      break;
    }
    case "leaf-crest": {
      const pillR = Math.min(Math.max(rad, boxH * 0.45), boxH / 2);
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, pillR);
      });
      for (const side of [-1, 1]) {
        const lx = side === -1 ? boxX : boxX + boxW;
        const ly = boxY + boxH / 2;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.fillStyle = "#65A30D";
        ctx.strokeStyle = opts.strokeColor;
        ctx.lineWidth = Math.max(1.2, lw * 0.55);
        ctx.beginPath();
        ctx.ellipse(0, -6 * baseScale, 11 * baseScale, 5 * baseScale, side * -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 6 * baseScale, 11 * baseScale, 5 * baseScale, side * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      break;
    }
    case "circle": {
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;
      const r = Math.max(boxW, boxH) * 0.52;
      drawFillAndStroke(() => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      });
      break;
    }
    case "leaf": {
      const cy = boxY + boxH / 2;
      const tip = Math.max(18 * baseScale, boxH * 0.36);
      const lx = boxX - tip;
      drawFillAndStroke(() => traceLeafPath(ctx, boxX, boxY, boxW, boxH, baseScale));
      // Stem on left tip + subtle vein accent at right tip
      ctx.beginPath();
      ctx.moveTo(lx, cy);
      ctx.quadraticCurveTo(lx - 8 * baseScale, cy + 2 * baseScale, lx - 14 * baseScale, cy + 7 * baseScale);
      ctx.stroke();
      ctx.lineWidth = Math.max(1, lw * 0.55);
      ctx.beginPath();
      ctx.moveTo(lx + 4 * baseScale, cy);
      ctx.lineTo(lx + 16 * baseScale, cy);
      ctx.moveTo(boxX + boxW + tip - 16 * baseScale, cy);
      ctx.lineTo(boxX + boxW + tip - 4 * baseScale, cy);
      ctx.stroke();
      break;
    }
    case "heart": {
      drawFillAndStroke(() => traceHeartPath(ctx, boxX, boxY, boxW, boxH));
      break;
    }
    case "seal": {
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;
      const outerR = Math.max(boxW, boxH) * 0.56;
      const innerR = outerR * 0.87;
      drawFillAndStroke(() => traceSealPath(ctx, cx, cy, outerR, innerR, 24));
      // Concentric inner seal rings
      ctx.lineWidth = Math.max(1, lw * 0.6);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([lw * 1.2, lw * 1.5]);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR * 0.71, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case "book": {
      const px = Math.max(14 * baseScale, boxW * 0.08);
      const py = Math.max(10 * baseScale, boxH * 0.16);
      const bx = boxX - px;
      const by = boxY - py;
      const bw = boxW + px * 2;
      const bh = boxH + py * 2;
      const cx = bx + bw / 2;
      const arch = Math.min(18 * baseScale, bh * 0.22);
      const covPad = Math.max(5 * baseScale, lw * 1.3);

      // Outer book cover backing rim
      ctx.beginPath();
      ctx.roundRect(
        bx - covPad,
        by + arch * 0.3,
        bw + covPad * 2,
        bh + covPad * 0.9,
        Math.min(8 * baseScale, rad + 4 * baseScale)
      );
      if (fillRgba) {
        ctx.fillStyle = hexToRgba(opts.strokeColor, 0.18);
        ctx.fill();
      }
      ctx.stroke();

      // Open double pages
      if (fillRgba) {
        traceBookPagesPath(ctx, bx, by, bw, bh, arch);
        ctx.fillStyle = fillRgba;
        ctx.fill();
      }
      traceBookPagesPath(ctx, bx, by, bw, bh, arch);
      ctx.stroke();

      // Center spine fold marks (top & bottom)
      ctx.lineWidth = Math.max(1.2, lw * 0.65);
      ctx.beginPath();
      ctx.moveTo(cx, by + arch * 0.7);
      ctx.lineTo(cx, by + arch * 1.45);
      ctx.moveTo(cx, by + bh + arch * 0.3);
      ctx.lineTo(cx, by + bh - arch * 0.55);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
