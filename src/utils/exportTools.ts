import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { BookPageSize, PhotoItem, PrintDpi } from "../types/studio";

// Standard CRC32 table for PNG chunk checksum
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Injects a valid PNG pHYs chunk right after IHDR so print tools read the exact DPI (>= 300).
 */
export function setPngDpi(pngBytes: Uint8Array, dpi: number): Uint8Array {
  const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (pngBytes[i] !== PNG_SIG[i]) return pngBytes;
  }

  const pxPerMeter = Math.round(dpi / 0.0254);

  // Build 21-byte pHYs chunk: length(4) + "pHYs"(4) + data(9) + crc(4)
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9, false); // data length = 9
  chunk[4] = 112; // 'p'
  chunk[5] = 72;  // 'H'
  chunk[6] = 89;  // 'Y'
  chunk[7] = 115; // 's'
  view.setUint32(8, pxPerMeter, false);
  view.setUint32(12, pxPerMeter, false);
  chunk[16] = 1; // unit = meter

  const crc = crc32(chunk.subarray(4, 17));
  view.setUint32(17, crc, false);

  // Find end of IHDR (always 8-byte sig + 25-byte IHDR = byte 33)
  const insertPos = 33;
  const out = new Uint8Array(pngBytes.length + chunk.length);
  out.set(pngBytes.subarray(0, insertPos), 0);
  out.set(chunk, insertPos);
  out.set(pngBytes.subarray(insertPos), insertPos + chunk.length);
  return out;
}

export async function dataUrlToBytes(dataUrl: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();
  return { bytes: new Uint8Array(buf), mime: blob.type || "image/png" };
}

export function bytesToDataUrl(bytes: Uint8Array, mime = "image/png"): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

export async function applyDpiToPngDataUrl(dataUrl: string, dpi: PrintDpi): Promise<string> {
  const { bytes, mime } = await dataUrlToBytes(dataUrl);
  if (!mime.includes("png")) return dataUrl;
  const stamped = setPngDpi(bytes, dpi);
  return bytesToDataUrl(stamped, "image/png");
}

function getPdfPageConfig(pageSize: BookPageSize) {
  if (pageSize === "a4") {
    return {
      format: "a4" as const,
      unit: "mm" as const,
      width: 210,
      height: 297,
    };
  }
  return {
    format: "letter" as const,
    unit: "in" as const,
    width: 8.5,
    height: 11,
  };
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/**
 * Encodes an 8-bit grayscale pixel buffer into a valid PNG (colorType 0, no alpha SMask)
 * using zlib stored blocks so jsPDF can parse and Flate-compress it ~7x faster without OOM.
 */
function encodeGrayscalePngBytes(width: number, height: number, grayPixels: Uint8Array): Uint8Array {
  const rowLen = 1 + width;
  const raw = new Uint8Array(rowLen * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // PNG filter type 0 (None)
    raw.set(grayPixels.subarray(y * width, (y + 1) * width), y * rowLen + 1);
  }

  const MAX_BLOCK = 65535;
  const numBlocks = Math.ceil(raw.length / MAX_BLOCK) || 1;
  const idatData = new Uint8Array(2 + raw.length + numBlocks * 5 + 4);
  idatData[0] = 0x78;
  idatData[1] = 0x01;
  let pos = 2;
  for (let i = 0; i < numBlocks; i++) {
    const start = i * MAX_BLOCK;
    const len = Math.min(MAX_BLOCK, raw.length - start);
    idatData[pos++] = i === numBlocks - 1 ? 1 : 0;
    idatData[pos++] = len & 0xff;
    idatData[pos++] = (len >>> 8) & 0xff;
    const nlen = (~len) & 0xffff;
    idatData[pos++] = nlen & 0xff;
    idatData[pos++] = (nlen >>> 8) & 0xff;
    idatData.set(raw.subarray(start, start + len), pos);
    pos += len;
  }
  const adl = adler32(raw);
  idatData[pos++] = (adl >>> 24) & 0xff;
  idatData[pos++] = (adl >>> 16) & 0xff;
  idatData[pos++] = (adl >>> 8) & 0xff;
  idatData[pos++] = adl & 0xff;

  const makeChunk = (type: string, data: Uint8Array) => {
    const c = new Uint8Array(12 + data.length);
    const v = new DataView(c.buffer);
    v.setUint32(0, data.length, false);
    c[4] = type.charCodeAt(0);
    c[5] = type.charCodeAt(1);
    c[6] = type.charCodeAt(2);
    c[7] = type.charCodeAt(3);
    c.set(data, 8);
    v.setUint32(8 + data.length, crc32(c.subarray(4, 8 + data.length)), false);
    return c;
  };

  const ihdr = new Uint8Array(13);
  const iv = new DataView(ihdr.buffer);
  iv.setUint32(0, width, false);
  iv.setUint32(4, height, false);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 0; // Color type 0 = Grayscale (1 channel, zero alpha)

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const c1 = makeChunk("IHDR", ihdr);
  const c2 = makeChunk("IDAT", idatData);
  const c3 = makeChunk("IEND", new Uint8Array(0));

  const out = new Uint8Array(sig.length + c1.length + c2.length + c3.length);
  out.set(sig, 0);
  out.set(c1, sig.length);
  out.set(c2, sig.length + c1.length);
  out.set(c3, sig.length + c1.length + c2.length);
  return out;
}

function loadImageElement(src: string, title: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Unable to load image "${title || "Untitled"}" for PDF export.`));
    img.src = src;
  });
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Resolves any photo source at 100% of its native pixel dimensions in a PDF-safe encoding:
 * - Coloring / monochrome / grayscale images -> Lossless 8-bit Grayscale PNG (no RGBA SMask bloat)
 * - Already-JPEG color photos -> Direct JPEG passthrough
 * - Other color images (RGBA PNG, WebP, SVG, local assets) -> Full-resolution opaque white-flattened JPEG (0.95)
 */
async function resolvePdfReadyImage(photo: PhotoItem): Promise<{
  data: string | Uint8Array;
  format: "PNG" | "JPEG";
  width: number;
  height: number;
  fallbackJpeg: () => Promise<string>;
}> {
  const isJpegDataUrl = /^data:image\/jpe?g/i.test(photo.dataUrl);
  const flaggedColoring = Boolean(
    photo.isColoringPage ||
      photo.kind === "coloring" ||
      photo.colorMode === "bw" ||
      photo.colorMode === "grayscale"
  );

  const renderCanvasFallbackJpeg = async (): Promise<string> => {
    const img = await loadImageElement(photo.dataUrl, photo.title);
    const w = Math.max(1, img.naturalWidth || photo.width || 1200);
    const h = Math.max(1, img.naturalHeight || photo.height || 1600);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable for PDF export.");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  if (isJpegDataUrl && !flaggedColoring && photo.width > 0 && photo.height > 0) {
    return {
      data: photo.dataUrl,
      format: "JPEG",
      width: photo.width,
      height: photo.height,
      fallbackJpeg: renderCanvasFallbackJpeg,
    };
  }

  const img = await loadImageElement(photo.dataUrl, photo.title);
  const w = Math.max(1, img.naturalWidth || photo.width || 1200);
  const h = Math.max(1, img.naturalHeight || photo.height || 1600);

  if (isJpegDataUrl && !flaggedColoring) {
    return {
      data: photo.dataUrl,
      format: "JPEG",
      width: w,
      height: h,
      fallbackJpeg: renderCanvasFallbackJpeg,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unavailable for PDF export.");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  // Detect grayscale images automatically so even uploaded line-art PNGs use compact lossless Grayscale PNG
  let useGrayscalePng = flaggedColoring;
  const imageData = ctx.getImageData(0, 0, w, h);
  const rgba = imageData.data;

  if (!useGrayscalePng) {
    const step = Math.max(1, Math.floor((w * h) / 4000));
    let allGray = true;
    for (let p = 0; p < w * h; p += step) {
      const idx = p * 4;
      if (
        Math.abs(rgba[idx] - rgba[idx + 1]) > 4 ||
        Math.abs(rgba[idx + 1] - rgba[idx + 2]) > 4
      ) {
        allGray = false;
        break;
      }
    }
    useGrayscalePng = allGray;
  }

  if (useGrayscalePng) {
    const gray = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
      gray[p] = Math.round(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
    }
    const pngBytes = encodeGrayscalePngBytes(w, h, gray);
    return {
      data: pngBytes,
      format: "PNG",
      width: w,
      height: h,
      fallbackJpeg: renderCanvasFallbackJpeg,
    };
  }

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
  return {
    data: jpegDataUrl,
    format: "JPEG",
    width: w,
    height: h,
    fallbackJpeg: renderCanvasFallbackJpeg,
  };
}

async function addResolvedImageToDoc(
  doc: jsPDF,
  photo: PhotoItem,
  cfg: ReturnType<typeof getPdfPageConfig>
): Promise<void> {
  const resolved = await resolvePdfReadyImage(photo);
  const imgRatio = Math.max(0.05, resolved.width / Math.max(1, resolved.height));
  const pageRatio = cfg.width / cfg.height;

  let drawW = cfg.width;
  let drawH = cfg.height;
  let offsetX = 0;
  let offsetY = 0;

  if (Math.abs(imgRatio - pageRatio) > 0.02) {
    if (imgRatio > pageRatio) {
      drawW = cfg.width;
      drawH = cfg.width / imgRatio;
      offsetY = (cfg.height - drawH) / 2;
    } else {
      drawH = cfg.height;
      drawW = cfg.height * imgRatio;
      offsetX = (cfg.width - drawW) / 2;
    }
  }

  try {
    doc.addImage(
      resolved.data,
      resolved.format,
      offsetX,
      offsetY,
      drawW,
      drawH,
      undefined,
      resolved.format === "PNG" ? "FAST" : "NONE"
    );
  } catch {
    // Fallback: flatten & re-encode via canvas JPEG if jsPDF rejects an unusual image stream
    const safeJpeg = await resolved.fallbackJpeg();
    doc.addImage(safeJpeg, "JPEG", offsetX, offsetY, drawW, drawH, undefined, "NONE");
  }
}

function renderUnicodeCoverDataUrl(
  bookTitle: string,
  bookSubtitle: string,
  pageCount: number,
  pageSize: BookPageSize
): string | null {
  const w = pageSize === "a4" ? 1654 : 1700;
  const h = pageSize === "a4" ? 2339 : 2200;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  const margin = Math.round(w * 0.088);
  ctx.strokeStyle = "#111113";
  ctx.lineWidth = 6;
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111113";
  ctx.font = '700 76px "Plus Jakarta Sans", "Padauk", "Noto Sans Myanmar", sans-serif';

  const maxTextW = w - margin * 3;
  const words = (bookTitle || "Coloring Book").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxTextW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);

  const lineHeight = 96;
  const startY = h * 0.42 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, w / 2, startY + idx * lineHeight, maxTextW);
  });

  if (bookSubtitle.trim()) {
    ctx.fillStyle = "#505056";
    ctx.font = '500 36px "Plus Jakarta Sans", "Padauk", "Noto Sans Myanmar", sans-serif';
    ctx.fillText(bookSubtitle.trim(), w / 2, h * 0.54, maxTextW);
  }

  ctx.fillStyle = "#78787E";
  ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${pageCount} Print-Ready Pages · ${pageSize === "a4" ? "A4" : "US Letter (8.5 × 11 in)"}`,
    w / 2,
    h - margin * 1.6
  );

  return canvas.toDataURL("image/jpeg", 0.94);
}

async function renderFramedImageCoverDataUrl(
  bookTitle: string,
  bookSubtitle: string,
  pageCount: number,
  pageSize: BookPageSize,
  coverImage: string
): Promise<string | null> {
  const w = pageSize === "a4" ? 1654 : 1700;
  const h = pageSize === "a4" ? 2339 : 2200;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  const margin = Math.round(w * 0.088);
  ctx.strokeStyle = "#111113";
  ctx.lineWidth = 6;
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111113";
  ctx.font = '700 66px "Plus Jakarta Sans", "Padauk", "Noto Sans Myanmar", sans-serif';

  const maxTextW = w - margin * 3;
  const words = (bookTitle || "Coloring Book").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxTextW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  const titleLines = lines.slice(0, 2);

  const lineHeight = 82;
  const titleStartY = margin + 150;
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, w / 2, titleStartY + idx * lineHeight, maxTextW);
  });

  // Draw cover artwork centered in middle box
  try {
    const img = await loadImageElement(coverImage, "Book Cover");
    const iw = Math.max(1, img.naturalWidth || 1000);
    const ih = Math.max(1, img.naturalHeight || 1000);
    const boxX = margin + 90;
    const boxY = titleStartY + titleLines.length * lineHeight + 28;
    const boxW = w - (margin + 90) * 2;
    const boxH = h - margin - 240 - boxY;
    const scale = Math.min(boxW / iw, boxH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = boxX + (boxW - dw) / 2;
    const dy = boxY + (boxH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } catch {
    // Keep clean framed title if cover image failed to load
  }

  if (bookSubtitle.trim()) {
    ctx.fillStyle = "#505056";
    ctx.font = '500 34px "Plus Jakarta Sans", "Padauk", "Noto Sans Myanmar", sans-serif';
    ctx.fillText(bookSubtitle.trim(), w / 2, h - margin - 145, maxTextW);
  }

  ctx.fillStyle = "#78787E";
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${pageCount} Print-Ready Pages · ${pageSize === "a4" ? "A4" : "US Letter (8.5 × 11 in)"}`,
    w / 2,
    h - margin * 1.45
  );

  return canvas.toDataURL("image/jpeg", 0.94);
}

export async function exportSinglePhotoAsPdf(
  photo: PhotoItem,
  pageSize: BookPageSize = photo.pageSize || "us-letter"
): Promise<Blob> {
  const cfg = getPdfPageConfig(pageSize);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: cfg.unit,
    format: cfg.format,
    compress: true,
  });

  await addResolvedImageToDoc(doc, photo, cfg);
  return doc.output("blob");
}

export async function exportBookAsPdf(options: {
  pages: PhotoItem[];
  pageSize: BookPageSize;
  bookTitle: string;
  bookSubtitle: string;
  includeCover: boolean;
  coverImage?: string | null;
  coverLayout?: "full-image" | "framed-title";
  onProgress?: (pct: number) => void;
}): Promise<Blob> {
  const {
    pages,
    pageSize,
    bookTitle,
    bookSubtitle,
    includeCover,
    coverImage,
    coverLayout = "framed-title",
    onProgress,
  } = options;
  if (pages.length === 0) {
    throw new Error("No pages selected for PDF export.");
  }

  const cfg = getPdfPageConfig(pageSize);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: cfg.unit,
    format: cfg.format,
    compress: true,
  });

  let isFirstPdfPage = true;

  if (includeCover) {
    isFirstPdfPage = false;
    if (coverImage && coverLayout === "full-image") {
      const img = await loadImageElement(coverImage, "Book Cover");
      const cw = Math.max(1, img.naturalWidth || 1700);
      const ch = Math.max(1, img.naturalHeight || 2200);
      await addResolvedImageToDoc(
        doc,
        {
          id: "cover-image",
          title: bookTitle || "Book Cover",
          prompt: "",
          dataUrl: coverImage,
          width: cw,
          height: ch,
          aspectRatio: `${cw}:${ch}`,
          isColoringPage: false,
          kind: "edited",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        cfg
      );
    } else if (coverImage) {
      const framedUrl = await renderFramedImageCoverDataUrl(
        bookTitle,
        bookSubtitle,
        pages.length,
        pageSize,
        coverImage
      );
      if (framedUrl) {
        doc.addImage(framedUrl, "JPEG", 0, 0, cfg.width, cfg.height, undefined, "NONE");
      }
    } else {
      const hasNonLatin1 = /[^\x00-\xFF]/.test(`${bookTitle} ${bookSubtitle}`);
      const unicodeCoverUrl = hasNonLatin1
        ? renderUnicodeCoverDataUrl(bookTitle, bookSubtitle, pages.length, pageSize)
        : null;

      if (unicodeCoverUrl) {
        doc.addImage(unicodeCoverUrl, "JPEG", 0, 0, cfg.width, cfg.height, undefined, "NONE");
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, cfg.width, cfg.height, "F");

        const margin = cfg.unit === "in" ? 0.75 : 19;
        doc.setDrawColor(17, 17, 19);
        doc.setLineWidth(cfg.unit === "in" ? 0.03 : 0.8);
        doc.rect(margin, margin, cfg.width - margin * 2, cfg.height - margin * 2);

        doc.setTextColor(17, 17, 19);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text(bookTitle || "Coloring Book", cfg.width / 2, cfg.height * 0.42, {
          align: "center",
          maxWidth: cfg.width - margin * 3,
        });

        if (bookSubtitle.trim()) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(13);
          doc.setTextColor(80, 80, 86);
          doc.text(bookSubtitle.trim(), cfg.width / 2, cfg.height * 0.5, {
            align: "center",
            maxWidth: cfg.width - margin * 3,
          });
        }

        doc.setFontSize(10);
        doc.setTextColor(120, 120, 126);
        doc.text(
          `${pages.length} Print-Ready Pages · ${pageSize === "a4" ? "A4" : "US Letter (8.5 × 11 in)"}`,
          cfg.width / 2,
          cfg.height - margin * 1.6,
          { align: "center" }
        );
      }
    }
  }

  for (let i = 0; i < pages.length; i++) {
    if (!isFirstPdfPage) {
      doc.addPage(cfg.format, "portrait");
    }
    isFirstPdfPage = false;

    await addResolvedImageToDoc(doc, pages[i], cfg);
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
    await yieldToMainThread();
  }

  return doc.output("blob");
}

export async function exportBookAsZip(options: {
  pages: PhotoItem[];
  bookTitle: string;
  coverImage?: string | null;
  onProgress?: (pct: number) => void;
}): Promise<Blob> {
  const { pages, bookTitle, coverImage, onProgress } = options;
  const zip = new JSZip();
  const safeFolder = (bookTitle || "coloring-book")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-|-$/g, "") || "coloring-book";

  const folder = zip.folder(safeFolder) ?? zip;
  const manifestLines: string[] = [
    `Book Title: ${bookTitle || "Coloring Book"}`,
    `Total Pages: ${pages.length}${coverImage ? " (+ Cover Image)" : ""}`,
    `Resolution Policy: 100% Original Full Resolution (No Downscaling)`,
    "",
  ];

  if (coverImage) {
    try {
      const { bytes, mime } = await dataUrlToBytes(coverImage);
      const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
      folder.file(`00_cover.${ext}`, bytes, { compression: "STORE" });
      manifestLines.push(`00_cover.${ext} | Book Cover Image`);
    } catch {
      // Skip invalid cover image
    }
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const num = String(i + 1).padStart(2, "0");
    const slug = (page.title || `page-${num}`)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || `page-${num}`;

    const { bytes, mime } = await dataUrlToBytes(page.dataUrl);
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
    const finalBytes = ext === "png" && page.dpi ? setPngDpi(bytes, page.dpi) : bytes;
    const filename = `${num}_${slug}.${ext}`;

    // STORE / lossless binary write — zero pixel/resolution reduction
    folder.file(filename, finalBytes, { compression: "STORE" });
    manifestLines.push(
      `${filename} | ${page.width}x${page.height} px | ${page.dpi ? `${page.dpi} DPI` : "Original DPI"} | ${
        page.colorMode === "bw"
          ? "Black & White Line Art"
          : page.colorMode === "grayscale"
          ? "Grayscale"
          : "Full Image"
      }`
    );

    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  folder.file("manifest.txt", manifestLines.join("\n"));

  return zip.generateAsync({ type: "blob" });
}
