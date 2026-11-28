import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFPage,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { BookPageSize } from "../types/studio";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfSourceDoc {
  id: string;
  fileName: string;
  bytes: Uint8Array;
  pageCount: number;
}

export interface EditablePdfOriginalPage {
  id: string;
  kind: "pdf-page";
  sourceId: string;
  sourceFileName: string;
  pageIndex: number; // 0-based index in source PDF
  widthPt: number;
  heightPt: number;
  thumbnailUrl: string;
  title: string;
}

export interface EditablePdfImagePage {
  id: string;
  kind: "image-page";
  title: string;
  dataUrl: string;
  width: number;
  height: number;
  sourceLabel: string;
}

export type EditablePdfPage = EditablePdfOriginalPage | EditablePdfImagePage;

export type AddedImagePageSizeMode = "match-pdf" | BookPageSize;

export type PdfCompressionPreset = "compact" | "ultra-small" | "original";

const COMPRESSION_SETTINGS: Record<
  PdfCompressionPreset,
  { maxLongSide: number; jpegQuality: number; recompressPdfOverBytesPerPage: number }
> = {
  "ultra-small": {
    maxLongSide: 1280,
    jpegQuality: 0.65,
    recompressPdfOverBytesPerPage: 160 * 1024, // Recompress PDFs heavier than ~160 KB/page
  },
  compact: {
    maxLongSide: 1650,
    jpegQuality: 0.78,
    recompressPdfOverBytesPerPage: 340 * 1024, // Recompress PDFs heavier than ~340 KB/page
  },
  original: {
    maxLongSide: 2550,
    jpegQuality: 0.9,
    recompressPdfOverBytesPerPage: Number.POSITIVE_INFINITY, // Keep uploaded PDF pages untouched
  },
};

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatPtDimensions(widthPt: number, heightPt: number): string {
  const wIn = (widthPt / 72).toFixed(1);
  const hIn = (heightPt / 72).toFixed(1);
  return `${wIn}×${hIn} in`;
}

/**
 * Loads an uploaded PDF file, keeps an intact copy of its raw bytes for pdf-lib
 * merging/re-export, and renders visual thumbnails for every page via pdfjs-dist.
 */
export async function parseUploadedPdfFile(
  file: File,
  onProgress?: (rendered: number, total: number) => void
): Promise<{ sourceDoc: PdfSourceDoc; pages: EditablePdfOriginalPage[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const masterBytes = new Uint8Array(arrayBuffer);
  // Clone bytes for pdf.js worker so masterBytes is never detached
  const workerCopy = masterBytes.slice();

  const loadingTask = pdfjsLib.getDocument({ data: workerCopy });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const sourceId = `pdfsrc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const cleanFileName = file.name || "uploaded.pdf";
  const pages: EditablePdfOriginalPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const thumbScale = Math.min(0.6, 320 / Math.max(1, baseViewport.width));
    const thumbViewport = page.getViewport({ scale: thumbScale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(thumbViewport.width));
    canvas.height = Math.max(1, Math.round(thumbViewport.height));
    const ctx = canvas.getContext("2d");

    let thumbnailUrl = "";
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvasContext: ctx,
        viewport: thumbViewport,
        canvas,
      }).promise;
      thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
    }

    pages.push({
      id: `pdfpg-${sourceId}-${pageNum - 1}-${Math.random().toString(36).slice(2, 6)}`,
      kind: "pdf-page",
      sourceId,
      sourceFileName: cleanFileName,
      pageIndex: pageNum - 1,
      widthPt: baseViewport.width,
      heightPt: baseViewport.height,
      thumbnailUrl,
      title: `${cleanFileName.replace(/\.pdf$/i, "")} — Page ${pageNum}`,
    });

    onProgress?.(pageNum, numPages);
    await yieldFrame();
  }

  await loadingTask.destroy();

  return {
    sourceDoc: {
      id: sourceId,
      fileName: cleanFileName,
      bytes: masterBytes,
      pageCount: numPages,
    },
    pages,
  };
}

/**
 * Renders a single PDF page to a high-resolution PNG data URL for saving into Photo Hall.
 */
export async function renderPdfPageToHighResPng(
  sourceBytes: Uint8Array,
  pageIndex: number,
  targetLongSide = 2200
): Promise<{ dataUrl: string; width: number; height: number }> {
  const loadingTask = pdfjsLib.getDocument({ data: sourceBytes.slice() });
  const pdf = await loadingTask.promise;
  try {
    const page = await pdf.getPage(pageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1 });
    const longSide = Math.max(baseViewport.width, baseViewport.height, 1);
    const scale = Math.min(3.2, Math.max(1.5, targetLongSide / longSide));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    return {
      dataUrl: canvas.toDataURL("image/png", 1.0),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    await loadingTask.destroy();
  }
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Encodes any added image into a clean, compact white-backed JPEG sized to the chosen
 * compression preset (prevents pdf-lib embedPng uncompressed RGBA SMask bloat!).
 */
async function encodeCompactJpegForPdf(
  dataUrl: string,
  maxLongSide: number,
  jpegQuality: number
): Promise<Uint8Array> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    if (!dataUrl.startsWith("data:") && !dataUrl.startsWith("blob:")) {
      el.crossOrigin = "anonymous";
    }
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not decode image for PDF"));
    el.src = dataUrl;
  });

  if (typeof img.decode === "function") {
    try {
      await img.decode();
    } catch {
      // Ignore already-decoded errors
    }
  }

  const natW = Math.max(1, img.naturalWidth || 1200);
  const natH = Math.max(1, img.naturalHeight || 1600);
  const longSide = Math.max(natW, natH);
  const ratio = longSide > maxLongSide ? maxLongSide / longSide : 1;

  const targetW = Math.max(1, Math.round(natW * ratio));
  const targetH = Math.max(1, Math.round(natH * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const jpegUrl = canvas.toDataURL("image/jpeg", jpegQuality);
  return dataUrlToBytes(jpegUrl);
}

/**
 * Re-renders a bloated PDF page as a compact crisp JPEG while preserving any
 * clickable URI link annotations from the original page!
 */
async function renderCompressedPdfPageWithLinks(
  outDoc: PDFDocument,
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  maxLongSide: number,
  jpegQuality: number
): Promise<PDFPage> {
  const jsPage = await pdfJsDoc.getPage(pageIndex + 1);
  const baseViewport = jsPage.getViewport({ scale: 1 });
  const widthPt = baseViewport.width;
  const heightPt = baseViewport.height;

  const longSidePt = Math.max(widthPt, heightPt, 1);
  const renderScale = Math.min(2.6, Math.max(1.2, maxLongSide / longSidePt));
  const renderViewport = jsPage.getViewport({ scale: renderScale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(renderViewport.width));
  canvas.height = Math.max(1, Math.round(renderViewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await jsPage.render({ canvasContext: ctx, viewport: renderViewport, canvas }).promise;

  const jpegBytes = await dataUrlToBytes(canvas.toDataURL("image/jpeg", jpegQuality));
  const embedded = await outDoc.embedJpg(jpegBytes);

  const newPage = outDoc.addPage([widthPt, heightPt]);
  newPage.drawImage(embedded, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
  });

  // Preserve any clickable URL link annotations from the original page!
  try {
    const rawAnnots = await jsPage.getAnnotations();
    const linkAnnots = rawAnnots.filter(
      (a: Record<string, unknown>) =>
        a?.subtype === "Link" && typeof a?.url === "string" && Array.isArray(a?.rect)
    );

    if (linkAnnots.length > 0) {
      const helvetica = await outDoc.embedFont(StandardFonts.Helvetica);
      const annotRefs = [];

      for (const a of linkAnnots) {
        const url = String(a.url);
        const [x1, y1, x2, y2] = a.rect as number[];
        const llx = Math.min(x1, x2);
        const urx = Math.max(x1, x2);
        const lly = Math.min(y1, y2);
        const ury = Math.max(y1, y2);

        const fontSize = Math.min(16, Math.max(9, (ury - lly) * 0.25));
        newPage.drawText(url, {
          x: llx + 4,
          y: lly + (ury - lly - fontSize) / 2,
          size: fontSize,
          font: helvetica,
          color: rgb(0, 0, 0),
          opacity: 0,
        });

        const actionRef = outDoc.context.register(
          outDoc.context.obj({
            Type: PDFName.of("Action"),
            S: PDFName.of("URI"),
            URI: PDFString.of(url),
          })
        );
        const annotRef = outDoc.context.register(
          outDoc.context.obj({
            Type: PDFName.of("Annot"),
            Subtype: PDFName.of("Link"),
            Rect: [
              PDFNumber.of(Number(llx.toFixed(2))),
              PDFNumber.of(Number(lly.toFixed(2))),
              PDFNumber.of(Number(urx.toFixed(2))),
              PDFNumber.of(Number(ury.toFixed(2))),
            ],
            Border: [PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)],
            F: PDFNumber.of(4),
            H: PDFName.of("I"),
            P: newPage.ref,
            A: actionRef,
          })
        );
        annotRefs.push(annotRef);
      }

      if (annotRefs.length > 0) {
        newPage.node.set(PDFName.of("Annots"), outDoc.context.obj(annotRefs));
      }
    }
  } catch {
    // Keep compressed page cleanly if annotation inspection is unavailable
  }

  return newPage;
}

function getTargetImagePageDimensions(
  mode: AddedImagePageSizeMode,
  pages: EditablePdfPage[]
): { widthPt: number; heightPt: number } {
  if (mode === "a4") {
    return { widthPt: 595.28, heightPt: 841.89 };
  }
  if (mode === "us-letter") {
    return { widthPt: 612, heightPt: 792 };
  }
  const firstPdfPage = pages.find(
    (p): p is EditablePdfOriginalPage => p.kind === "pdf-page"
  );
  if (firstPdfPage && firstPdfPage.widthPt > 50 && firstPdfPage.heightPt > 50) {
    return { widthPt: firstPdfPage.widthPt, heightPt: firstPdfPage.heightPt };
  }
  return { widthPt: 612, heightPt: 792 };
}

/**
 * Rebuilds a compact, print-ready PDF:
 * - Batches pdf-lib copyPages per source PDF to avoid duplicating shared fonts/resources
 * - Compresses bloated uploaded PDF pages and added PNG/JPG images cleanly as crisp JPEGs
 * - Preserves clickable PDF link annotations across both copied & compressed pages
 */
export async function exportEditedPdfDocument(options: {
  pages: EditablePdfPage[];
  sources: Record<string, PdfSourceDoc>;
  imagePageSize: AddedImagePageSizeMode;
  compression?: PdfCompressionPreset;
  onProgress?: (pct: number) => void;
}): Promise<Blob> {
  const {
    pages,
    sources,
    imagePageSize,
    compression = "compact",
    onProgress,
  } = options;

  if (pages.length === 0) {
    throw new Error("Please keep or add at least 1 page before exporting PDF.");
  }

  const preset = COMPRESSION_SETTINGS[compression];
  const outDoc = await PDFDocument.create();
  const targetDims = getTargetImagePageDimensions(imagePageSize, pages);

  // Decide per source PDF whether to batch-copy losslessly or re-compress heavy pages
  const shouldRecompressSource = new Map<string, boolean>();
  const batchCopiedMap = new Map<string, Map<number, PDFPage>>();
  const pdfJsDocs = new Map<
    string,
    { task: pdfjsLib.PDFDocumentLoadingTask; doc: pdfjsLib.PDFDocumentProxy }
  >();

  // Group needed page indices per source PDF
  const sourceIndicesNeeded = new Map<string, number[]>();
  for (const p of pages) {
    if (p.kind !== "pdf-page") continue;
    const list = sourceIndicesNeeded.get(p.sourceId) ?? [];
    list.push(p.pageIndex);
    sourceIndicesNeeded.set(p.sourceId, list);
  }

  try {
    // Pre-batch copyPages ONCE per lean source PDF so pdf-lib deduplicates all shared resources!
    for (const [sourceId, indices] of sourceIndicesNeeded.entries()) {
      const srcRecord = sources[sourceId];
      if (!srcRecord) continue;

      const avgBytesPerPage = srcRecord.bytes.length / Math.max(1, srcRecord.pageCount);
      const needsRecompress = avgBytesPerPage > preset.recompressPdfOverBytesPerPage;
      shouldRecompressSource.set(sourceId, needsRecompress);

      if (!needsRecompress) {
        const srcPdf = await PDFDocument.load(srcRecord.bytes, {
          ignoreEncryption: true,
        });
        const uniqueIndices = Array.from(new Set(indices));
        const copiedPages = await outDoc.copyPages(srcPdf, uniqueIndices);
        const pageMap = new Map<number, PDFPage>();
        uniqueIndices.forEach((origIdx, i) => {
          pageMap.set(origIdx, copiedPages[i]);
        });
        batchCopiedMap.set(sourceId, pageMap);
      }
    }

    // Track whether a unique copied page was already inserted (in case user duplicated a page)
    const usedCopiedKey = new Set<string>();

    for (let i = 0; i < pages.length; i++) {
      const item = pages[i];

      if (item.kind === "pdf-page") {
        const srcRecord = sources[item.sourceId];
        if (!srcRecord) {
          throw new Error(`Missing PDF source for "${item.title}"`);
        }

        if (shouldRecompressSource.get(item.sourceId)) {
          let holder = pdfJsDocs.get(item.sourceId);
          if (!holder) {
            const task = pdfjsLib.getDocument({ data: srcRecord.bytes.slice() });
            const doc = await task.promise;
            holder = { task, doc };
            pdfJsDocs.set(item.sourceId, holder);
          }

          await renderCompressedPdfPageWithLinks(
            outDoc,
            holder.doc,
            item.pageIndex,
            preset.maxLongSide,
            preset.jpegQuality
          );
        } else {
          const key = `${item.sourceId}:${item.pageIndex}`;
          if (!usedCopiedKey.has(key)) {
            usedCopiedKey.add(key);
            const preCopied = batchCopiedMap.get(item.sourceId)?.get(item.pageIndex);
            if (preCopied) {
              outDoc.addPage(preCopied);
            }
          } else {
            // User duplicated the same page: copy a fresh instance
            const srcPdf = await PDFDocument.load(srcRecord.bytes, {
              ignoreEncryption: true,
            });
            const [dupPage] = await outDoc.copyPages(srcPdf, [item.pageIndex]);
            outDoc.addPage(dupPage);
          }
        }
      } else {
        const jpegBytes = await encodeCompactJpegForPdf(
          item.dataUrl,
          preset.maxLongSide,
          preset.jpegQuality
        );
        const embedded = await outDoc.embedJpg(jpegBytes);

        const pageW = targetDims.widthPt;
        const pageH = targetDims.heightPt;
        const pdfPage = outDoc.addPage([pageW, pageH]);

        pdfPage.drawRectangle({
          x: 0,
          y: 0,
          width: pageW,
          height: pageH,
          color: rgb(1, 1, 1),
        });

        const imgRatio = embedded.width / Math.max(1, embedded.height);
        const pageRatio = pageW / pageH;

        let drawW = pageW;
        let drawH = pageH;
        let drawX = 0;
        let drawY = 0;

        if (Math.abs(imgRatio - pageRatio) > 0.02) {
          if (imgRatio > pageRatio) {
            drawW = pageW;
            drawH = pageW / imgRatio;
            drawY = (pageH - drawH) / 2;
          } else {
            drawH = pageH;
            drawW = pageH * imgRatio;
            drawX = (pageW - drawW) / 2;
          }
        }

        pdfPage.drawImage(embedded, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      onProgress?.(Math.round(((i + 1) / pages.length) * 100));
      await yieldFrame();
    }
  } finally {
    for (const holder of pdfJsDocs.values()) {
      try {
        await holder.task.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }

  const outBytes = await outDoc.save({ useObjectStreams: false });
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}
