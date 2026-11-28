import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";
import {
  FlyerDecorItem,
  FlyerState,
  FlyerTextElement,
} from "../types/flyer";
import {
  FLYER_DECORATIONS,
  FLYER_HEIGHT,
  FLYER_WIDTH,
  RAINBOW_BORDER_BANDS,
  RAINBOW_LETTER_COLORS,
} from "./flyerDefaults";

function normalizeUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function resolveToDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

async function dataUrlToUint8Array(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

async function loadImageSafe(
  src: string
): Promise<{ img: HTMLImageElement; dataUrl: string }> {
  const dataUrl = await resolveToDataUrl(src);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (!dataUrl.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = dataUrl;
  });

  if (typeof img.decode === "function") {
    try {
      await img.decode();
    } catch {
      // Some browsers throw on already-decoded images; onload already succeeded
    }
  }
  return { img, dataUrl };
}

function drawRoundedRect(
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
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawDecorItem(ctx: CanvasRenderingContext2D, item: FlyerDecorItem) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate((item.rotation * Math.PI) / 180);
  ctx.fillStyle = item.color;

  if (item.kind === "dot") {
    ctx.beginPath();
    ctx.arc(0, 0, item.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === "star") {
    const outer = item.size * 0.55;
    const inner = outer * 0.48;
    const spikes = 5;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.lineJoin = "round";
    ctx.lineWidth = item.size * 0.14;
    ctx.strokeStyle = item.color;
    ctx.stroke();
    ctx.fill();
  } else if (item.kind === "heart") {
    const s = item.size * 0.52;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.72);
    ctx.bezierCurveTo(-s * 1.15, s * 0.08, -s * 0.95, -s * 0.95, 0, -s * 0.28);
    ctx.bezierCurveTo(s * 0.95, -s * 0.95, s * 1.15, s * 0.08, 0, s * 0.72);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function measureSpacedTextWidth(
  ctx: CanvasRenderingContext2D,
  line: string,
  letterSpacing: number
): number {
  if (!line.length) return 0;
  let width = 0;
  for (let i = 0; i < line.length; i++) {
    width += ctx.measureText(line[i]).width;
    if (i < line.length - 1) width += letterSpacing;
  }
  return width;
}

export interface RenderedElementBounds {
  id: string;
  role: "logo" | "qr" | "image" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  linkUrl?: string;
  imageDataUrl?: string;
}

function drawTextElement(
  ctx: CanvasRenderingContext2D,
  el: FlyerTextElement
): RenderedElementBounds {
  const padX = el.roundedPadding ? el.paddingX : 6;
  const padY = el.roundedPadding ? el.paddingY : 4;
  const maxTextWidth = Math.max(40, el.width - padX * 2);

  const baseWeight = el.bold ? "700" : "500";
  const fontStyle = el.italic ? "italic" : "normal";
  ctx.font = `${fontStyle} ${baseWeight} ${el.fontSize}px ${el.fontFamily}`;

  const rawParagraphs = el.text.split("\n");
  const renderedLines: { text: string; isFirst: boolean; fontSize: number }[] = [];

  rawParagraphs.forEach((para, idx) => {
    const isBoldLine = el.bold || (el.firstLineBold && idx === 0);
    const lineFontSize =
      el.firstLineBold && idx === 0 ? Math.round(el.fontSize * 1.12) : el.fontSize;
    ctx.font = `${fontStyle} ${isBoldLine ? "700" : "500"} ${lineFontSize}px ${el.fontFamily}`;
    const wrapped = wrapTextLines(ctx, para, maxTextWidth);
    wrapped.forEach((wLine) => {
      renderedLines.push({ text: wLine, isFirst: idx === 0, fontSize: lineFontSize });
    });
  });

  const lineHeights = renderedLines.map((l) => l.fontSize * el.lineHeight);
  const totalTextHeight = lineHeights.reduce((sum, h) => sum + h, 0);
  const boxHeight = Math.max(el.height, totalTextHeight + padY * 2);
  const boxLeft = el.x - el.width / 2;
  const boxTop = el.y - boxHeight / 2;

  // Background box
  if (el.bgColor && el.bgColor !== "transparent") {
    ctx.save();
    ctx.fillStyle = el.bgColor;
    drawRoundedRect(
      ctx,
      boxLeft,
      boxTop,
      el.width,
      boxHeight,
      el.roundedPadding ? el.borderRadius : 0
    );
    ctx.fill();
    ctx.restore();
  }

  // Render each line
  let cursorY = el.y - totalTextHeight / 2;
  let rainbowColorIdx = 0;

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  for (let i = 0; i < renderedLines.length; i++) {
    const lineObj = renderedLines[i];
    const lh = lineHeights[i];
    const lineCenterY = cursorY + lh / 2;
    const isBoldLine = el.bold || (el.firstLineBold && lineObj.isFirst);
    ctx.font = `${fontStyle} ${isBoldLine ? "700" : "500"} ${lineObj.fontSize}px ${el.fontFamily}`;

    const lineWidth = measureSpacedTextWidth(ctx, lineObj.text, el.letterSpacing);
    let startX = el.x - lineWidth / 2;
    if (el.align === "left") {
      startX = boxLeft + padX;
    } else if (el.align === "right") {
      startX = boxLeft + el.width - padX - lineWidth;
    }

    if (el.rainbowLetters || el.letterSpacing !== 0) {
      let cx = startX;
      ctx.textAlign = "left";
      for (const ch of lineObj.text) {
        const chW = ctx.measureText(ch).width;
        const fill = el.rainbowLetters
          ? ch.trim()
            ? RAINBOW_LETTER_COLORS[rainbowColorIdx++ % RAINBOW_LETTER_COLORS.length]
            : "transparent"
          : el.color;

        if (el.outline && ch.trim()) {
          ctx.strokeStyle = el.outlineColor;
          ctx.lineWidth = el.outlineWidth * 2;
          ctx.strokeText(ch, cx, lineCenterY);
        }
        ctx.fillStyle = fill;
        ctx.fillText(ch, cx, lineCenterY);
        cx += chW + el.letterSpacing;
      }
    } else {
      ctx.textAlign = el.align;
      const drawX =
        el.align === "left"
          ? boxLeft + padX
          : el.align === "right"
          ? boxLeft + el.width - padX
          : el.x;
      if (el.outline) {
        ctx.strokeStyle = el.outlineColor;
        ctx.lineWidth = el.outlineWidth * 2;
        ctx.strokeText(lineObj.text, drawX, lineCenterY);
      }
      ctx.fillStyle = el.color;
      ctx.fillText(lineObj.text, drawX, lineCenterY);
    }

    cursorY += lh;
  }

  ctx.restore();

  return {
    id: el.id,
    role: el.role,
    x: boxLeft,
    y: boxTop,
    width: el.width,
    height: boxHeight,
    linkUrl: el.linkUrl,
  };
}

export async function renderFlyerToCanvas(
  state: FlyerState,
  scale = 2.4
): Promise<{ canvas: HTMLCanvasElement; bounds: RenderedElementBounds[] }> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed even if web fonts report partial load
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(FLYER_WIDTH * scale);
  canvas.height = Math.round(FLYER_HEIGHT * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);

  const pageColor = state.pageBgColor || "#FFFFFF";
  const isPureWhitePage =
    pageColor.toUpperCase() === "#FFFFFF" && !state.customBgImage;

  // 1. Base page background
  ctx.fillStyle = pageColor;
  ctx.fillRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);

  // Optional custom full-page background photo
  if (state.customBgImage) {
    try {
      const { img: bgImg } = await loadImageSafe(state.customBgImage);
      const scaleCover = Math.max(
        FLYER_WIDTH / bgImg.naturalWidth,
        FLYER_HEIGHT / bgImg.naturalHeight
      );
      const dw = bgImg.naturalWidth * scaleCover;
      const dh = bgImg.naturalHeight * scaleCover;
      ctx.drawImage(bgImg, (FLYER_WIDTH - dw) / 2, (FLYER_HEIGHT - dh) / 2, dw, dh);
    } catch {
      // Keep base color if background fails to load
    }
  } else {
    // 2. Border frames
    if (state.borderStyle === "pastel-rainbow") {
      const bandWidth = 8;
      RAINBOW_BORDER_BANDS.forEach((color, idx) => {
        const inset = idx * bandWidth;
        ctx.fillStyle = color;
        ctx.fillRect(
          inset,
          inset,
          FLYER_WIDTH - inset * 2,
          FLYER_HEIGHT - inset * 2
        );
      });
      const innerInset = RAINBOW_BORDER_BANDS.length * bandWidth;
      ctx.fillStyle = pageColor;
      ctx.fillRect(
        innerInset,
        innerInset,
        FLYER_WIDTH - innerInset * 2,
        FLYER_HEIGHT - innerInset * 2
      );
    } else if (state.borderStyle === "pastel-pink") {
      ctx.fillStyle = "#FBCFE8";
      ctx.fillRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);
      ctx.fillStyle = pageColor;
      ctx.fillRect(36, 36, FLYER_WIDTH - 72, FLYER_HEIGHT - 72);
    } else if (state.borderStyle === "pastel-mint") {
      ctx.fillStyle = "#A7F3D0";
      ctx.fillRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);
      ctx.fillStyle = pageColor;
      ctx.fillRect(36, 36, FLYER_WIDTH - 72, FLYER_HEIGHT - 72);
    }
  }

  // 3. Cute stars, hearts, and dots decorations
  if (state.showDecorations && !state.customBgImage) {
    for (const item of FLYER_DECORATIONS) {
      drawDecorItem(ctx, item);
    }
  }

  // 4. Elements (Images, QR codes, Text blocks)
  const bounds: RenderedElementBounds[] = [];

  for (const el of state.elements) {
    if (el.type === "image") {
      const left = el.x - el.width / 2;
      const top = el.y - el.height / 2;
      let resolvedDataUrl: string | undefined;

      try {
        const { img, dataUrl } = await loadImageSafe(el.src);
        resolvedDataUrl = dataUrl;
        ctx.save();
        if (el.borderRadius > 0) {
          drawRoundedRect(ctx, left, top, el.width, el.height, el.borderRadius);
          ctx.clip();
        }
        if (el.blendMultiply && !isPureWhitePage) {
          ctx.globalCompositeOperation = "multiply";
        }
        ctx.drawImage(img, left, top, el.width, el.height);
        ctx.restore();
      } catch {
        ctx.save();
        ctx.strokeStyle = "#D4D4D8";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, el.width, el.height);
        ctx.restore();
      }

      bounds.push({
        id: el.id,
        role: el.role,
        x: left,
        y: top,
        width: el.width,
        height: el.height,
        linkUrl: el.linkUrl,
        imageDataUrl: resolvedDataUrl,
      });
    } else {
      const textBounds = drawTextElement(ctx, el);
      bounds.push(textBounds);
    }
  }

  return { canvas, bounds };
}

export async function exportFlyerAsPngDataUrl(state: FlyerState): Promise<string> {
  const { canvas } = await renderFlyerToCanvas(state, 2.4);
  return canvas.toDataURL("image/png", 1.0);
}

function triggerBlobFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 15000);
}

/**
 * Exports a gold-standard ISO 32000-1 PDF using pdf-lib with:
 * 1. Crisp 240+ DPI flyer artwork + lossless PNG QR code overlay
 * 2. Proper indirect /Annot /Subtype /Link objects (with /P page ref, /F 4, /H /I, /Type /Action /S /URI, and exact [llx, lly, urx, ury] where lly < ury)
 * 3. Transparent selectable PDF text layer containing the exact URL inside each linked box so ALL mobile & desktop PDF viewers (Google Drive, WPS, Adobe, iOS Files, Chrome, Safari) detect & open the link on tap!
 */
export async function exportFlyerAsClickablePdf(
  state: FlyerState,
  filename = "gbtk-back-page-flyer.pdf"
): Promise<{ linkCount: number }> {
  const { canvas, bounds } = await renderFlyerToCanvas(state, 2.4);
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.96);
  const jpegBytes = await dataUrlToUint8Array(jpegDataUrl);

  // Standard US Letter PDF in points: 612 x 792 pt (8.5 x 11 in, bottom-left origin)
  const pdfWidth = 612;
  const pdfHeight = 792;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("GBTK Studio Back Page Flyer");
  pdfDoc.setCreator("GBTK STUDIO");
  pdfDoc.setProducer("GBTK STUDIO PDF Engine");

  const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 1. Draw full-bleed rendered flyer page
  const bgImage = await pdfDoc.embedJpg(jpegBytes);
  page.drawImage(bgImage, {
    x: 0,
    y: 0,
    width: pdfWidth,
    height: pdfHeight,
  });

  const scaleX = pdfWidth / FLYER_WIDTH;
  const scaleY = pdfHeight / FLYER_HEIGHT;

  // 2. Directly stamp lossless PNG QR code image(s) so QR modules stay razor-sharp & guaranteed present
  for (const b of bounds) {
    if (b.role === "qr" && b.imageDataUrl?.startsWith("data:image/")) {
      try {
        const rawBytes = await dataUrlToUint8Array(b.imageDataUrl);
        const embeddedQr = b.imageDataUrl.startsWith("data:image/png")
          ? await pdfDoc.embedPng(rawBytes)
          : await pdfDoc.embedJpg(rawBytes);

        const llx = b.x * scaleX;
        const wPt = b.width * scaleX;
        const hPt = b.height * scaleY;
        const lly = pdfHeight - (b.y + b.height) * scaleY;

        page.drawImage(embeddedQr, {
          x: llx,
          y: lly,
          width: wPt,
          height: hPt,
        });
      } catch {
        // Already drawn cleanly on the canvas layer
      }
    }
  }

  // 3. Build proper ISO 32000-1 indirect Link annotations + selectable URL text layer
  const annotRefs = [];

  for (const b of bounds) {
    const url = normalizeUrl(b.linkUrl);
    if (!url) continue;

    // Convert canvas top-left box to strict PDF bottom-left [llx, lly, urx, ury]
    const llx = Math.max(0, b.x * scaleX);
    const urx = Math.min(pdfWidth, (b.x + b.width) * scaleX);
    const lly = Math.max(0, pdfHeight - (b.y + b.height) * scaleY);
    const ury = Math.min(pdfHeight, pdfHeight - b.y * scaleY);

    if (urx <= llx || ury <= lly) continue;

    // Draw transparent (opacity: 0) real vector text of the URL across the clickable box
    // so viewers that rely on text-layer auto-linking also open the link on tap
    const fontSize = Math.min(18, Math.max(10, (ury - lly) * 0.28));
    const textW = helvetica.widthOfTextAtSize(url, fontSize);
    const textX = Math.max(llx + 4, llx + (urx - llx - textW) / 2);
    const textY = lly + (ury - lly - fontSize) / 2;
    page.drawText(url, {
      x: textX,
      y: textY,
      size: fontSize,
      font: helvetica,
      color: rgb(0, 0, 0),
      opacity: 0,
    });

    const actionRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        Type: PDFName.of("Action"),
        S: PDFName.of("URI"),
        URI: PDFString.of(url),
      })
    );

    const annotRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Link"),
        Rect: [
          PDFNumber.of(Number(llx.toFixed(2))),
          PDFNumber.of(Number(lly.toFixed(2))),
          PDFNumber.of(Number(urx.toFixed(2))),
          PDFNumber.of(Number(ury.toFixed(2))),
        ],
        Border: [PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)],
        F: PDFNumber.of(4), // Print + interactive flag
        H: PDFName.of("I"), // Visual tap highlight invert
        P: page.ref, // Back-reference to parent Page object
        A: actionRef,
      })
    );

    annotRefs.push(annotRef);
  }

  if (annotRefs.length > 0) {
    page.node.set(PDFName.of("Annots"), pdfDoc.context.obj(annotRefs));
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  triggerBlobFileDownload(pdfBlob, filename);
  return { linkCount: annotRefs.length };
}
