import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Eye,
  FileArchive,
  FileText,
  Grid2x2,
  Printer,
  Ruler,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BookPageSize, PhotoItem } from "../types/studio";

interface BookPrintPreviewModalProps {
  open: boolean;
  pages: PhotoItem[];
  pageSize: BookPageSize;
  bookTitle: string;
  bookSubtitle: string;
  includeCover: boolean;
  coverImage?: string | null;
  coverLayout?: "full-image" | "framed-title";
  canExportBook: boolean;
  exportingType: "pdf" | "zip" | null;
  exportProgress: number;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDownloadZip: () => void;
}

type PreviewViewMode = "single" | "spread" | "grid";

interface SheetPlacement {
  drawWPct: number;
  drawHPct: number;
  offsetXPct: number;
  offsetYPct: number;
  effectiveDpi: number;
  isGrayscaleOutput: boolean;
}

function getPaperSpec(pageSize: BookPageSize) {
  if (pageSize === "a4") {
    return {
      label: "A4 (210 × 297 mm)",
      shortLabel: "A4",
      widthIn: 210 / 25.4,
      heightIn: 297 / 25.4,
      aspectCss: "210 / 297",
      ratio: 210 / 297,
    };
  }
  return {
    label: "US Letter (8.5 × 11 in)",
    shortLabel: "US Letter",
    widthIn: 8.5,
    heightIn: 11,
    aspectCss: "8.5 / 11",
    ratio: 8.5 / 11,
  };
}

/**
 * Mirrors exact placement & grayscale logic of addResolvedImageToDoc / resolvePdfReadyImage in exportTools.ts
 */
function computeSheetPlacement(
  photo: PhotoItem,
  paperRatio: number,
  paperWidthIn: number
): SheetPlacement {
  const pw = Math.max(1, photo.width || 1200);
  const ph = Math.max(1, photo.height || 1600);
  const imgRatio = Math.max(0.05, pw / ph);

  let drawWPct = 100;
  let drawHPct = 100;
  let offsetXPct = 0;
  let offsetYPct = 0;

  if (Math.abs(imgRatio - paperRatio) > 0.02) {
    if (imgRatio > paperRatio) {
      drawWPct = 100;
      drawHPct = (paperRatio / imgRatio) * 100;
      offsetYPct = (100 - drawHPct) / 2;
    } else {
      drawHPct = 100;
      drawWPct = (imgRatio / paperRatio) * 100;
      offsetXPct = (100 - drawWPct) / 2;
    }
  }

  const drawnWidthIn = paperWidthIn * (drawWPct / 100);
  const effectiveDpi = Math.round(pw / Math.max(0.5, drawnWidthIn));
  const isGrayscaleOutput = Boolean(
    photo.isColoringPage ||
      photo.kind === "coloring" ||
      photo.colorMode === "bw" ||
      photo.colorMode === "grayscale"
  );

  return {
    drawWPct,
    drawHPct,
    offsetXPct,
    offsetYPct,
    effectiveDpi,
    isGrayscaleOutput,
  };
}

interface SheetCanvasProps {
  sheetIndex: number;
  isCover: boolean;
  photo?: PhotoItem;
  bookTitle: string;
  bookSubtitle: string;
  coverImage?: string | null;
  coverLayout?: "full-image" | "framed-title";
  totalInteriorPages: number;
  paper: ReturnType<typeof getPaperSpec>;
  showGuides: boolean;
  spineSide?: "left" | "right" | "none";
}

function SheetCanvas({
  sheetIndex,
  isCover,
  photo,
  bookTitle,
  bookSubtitle,
  coverImage,
  coverLayout = "framed-title",
  totalInteriorPages,
  paper,
  showGuides,
  spineSide = "none",
}: SheetCanvasProps) {
  const placement = useMemo(
    () => (photo ? computeSheetPlacement(photo, paper.ratio, paper.widthIn) : null),
    [photo, paper.ratio, paper.widthIn]
  );

  return (
    <div
      className="relative bg-white overflow-hidden select-none shadow-[0_14px_40px_rgba(0,0,0,0.45)] border border-zinc-300/80"
      style={{ aspectRatio: paper.aspectCss }}
    >
      {isCover ? (
        coverImage && coverLayout === "full-image" ? (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <img
              src={coverImage}
              alt={bookTitle || "Book Cover"}
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-full object-contain"
            />
          </div>
        ) : coverImage ? (
          <div className="w-full h-full relative bg-white flex flex-col items-center justify-center p-[8.8%]">
            <div className="w-full h-full border-[2px] border-[#111113] flex flex-col items-center justify-between px-[7%] py-[7%] text-center overflow-hidden">
              <h3 className="text-[clamp(12px,2.1vw,22px)] font-bold text-[#111113] leading-tight break-words max-w-full shrink-0">
                {bookTitle || "Coloring Book"}
              </h3>
              <div className="flex-1 min-h-0 w-full flex items-center justify-center my-2 overflow-hidden">
                <img
                  src={coverImage}
                  alt={bookTitle || "Book Cover"}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="space-y-1 shrink-0 max-w-full">
                {bookSubtitle.trim() && (
                  <p className="text-[clamp(8px,1.2vw,13px)] font-normal text-[#505056] break-words">
                    {bookSubtitle.trim()}
                  </p>
                )}
                <p className="text-[clamp(7px,0.95vw,10px)] text-[#78787E] tabular-nums">
                  {totalInteriorPages} Print-Ready Pages · {paper.label}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative bg-white flex flex-col items-center justify-center p-[8.8%]">
            {/* Exact border frame matching exportBookAsPdf */}
            <div className="w-full h-full border-[2px] border-[#111113] flex flex-col items-center justify-between px-[8%] py-[9%] text-center">
              <div />
              <div className="space-y-2.5 max-w-full">
                <h3 className="text-[clamp(14px,2.6vw,28px)] font-bold text-[#111113] leading-tight break-words">
                  {bookTitle || "Coloring Book"}
                </h3>
                {bookSubtitle.trim() && (
                  <p className="text-[clamp(9px,1.35vw,14px)] font-normal text-[#505056] break-words">
                    {bookSubtitle.trim()}
                  </p>
                )}
              </div>
              <p className="text-[clamp(8px,1.05vw,11px)] text-[#78787E] tabular-nums">
                {totalInteriorPages} Print-Ready Pages · {paper.label}
              </p>
            </div>
          </div>
        )
      ) : photo && placement ? (
        <div className="w-full h-full relative bg-white">
          <img
            src={photo.dataUrl}
            alt={photo.title}
            referrerPolicy="no-referrer"
            draggable={false}
            style={{
              position: "absolute",
              left: `${placement.offsetXPct}%`,
              top: `${placement.offsetYPct}%`,
              width: `${placement.drawWPct}%`,
              height: `${placement.drawHPct}%`,
              objectFit: "fill",
              filter: placement.isGrayscaleOutput ? "grayscale(100%)" : undefined,
            }}
          />
        </div>
      ) : null}

      {/* Subtle realistic open-book spine shadow when viewing 2-page spread */}
      {spineSide === "left" && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[6%]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 100%)",
          }}
        />
      )}
      {spineSide === "right" && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[6%]"
          style={{
            background: "linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.12) 100%)",
          }}
        />
      )}

      {/* Optional Safe Print Margin & Trim Guides */}
      {showGuides && (
        <>
          {/* 0.5-inch safe print zone (~5.9% of US Letter width) */}
          <div
            className="pointer-events-none absolute border border-dashed border-blue-500/75"
            style={{
              left: "5.8%",
              right: "5.8%",
              top: "4.5%",
              bottom: "4.5%",
            }}
          >
            <span className="absolute top-1 left-1.5 text-[9px] font-mono font-semibold text-blue-600 bg-white/85 px-1 rounded">
              Safe Print Margin (0.5 in)
            </span>
          </div>
          <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] font-mono text-zinc-400 bg-white/85 px-1 rounded">
            PDF Sheet #{sheetIndex + 1}
          </span>
        </>
      )}
    </div>
  );
}

export function BookPrintPreviewModal({
  open,
  pages,
  pageSize,
  bookTitle,
  bookSubtitle,
  includeCover,
  coverImage,
  coverLayout = "framed-title",
  canExportBook,
  exportingType,
  exportProgress,
  onClose,
  onDownloadPdf,
  onDownloadZip,
}: BookPrintPreviewModalProps) {
  const [viewMode, setViewMode] = useState<PreviewViewMode>("single");
  const [currentSheetIdx, setCurrentSheetIdx] = useState(0);
  const [zoomPct, setZoomPct] = useState(100);
  const [showGuides, setShowGuides] = useState(true);

  const paper = useMemo(() => getPaperSpec(pageSize), [pageSize]);

  // Construct exact sheet list matching exportBookAsPdf sequence
  const sheets = useMemo(() => {
    const list: { isCover: boolean; photo?: PhotoItem; label: string }[] = [];
    if (includeCover) {
      list.push({ isCover: true, label: "Cover Page" });
    }
    pages.forEach((p, idx) => {
      list.push({
        isCover: false,
        photo: p,
        label: `Page ${idx + 1} · ${p.title}`,
      });
    });
    return list;
  }, [includeCover, pages]);

  // Build 2-page book spreads: [null, sheet0] (cover/page 1 on right), [sheet1, sheet2], ...
  const spreads = useMemo(() => {
    if (sheets.length === 0) return [];
    const result: [number | null, number | null][] = [];
    result.push([null, 0]);
    for (let i = 1; i < sheets.length; i += 2) {
      result.push([i, i + 1 < sheets.length ? i + 1 : null]);
    }
    return result;
  }, [sheets]);

  const currentSpreadIdx = useMemo(() => {
    const idx = spreads.findIndex(
      ([left, right]) => left === currentSheetIdx || right === currentSheetIdx
    );
    return idx >= 0 ? idx : 0;
  }, [spreads, currentSheetIdx]);

  useEffect(() => {
    if (currentSheetIdx >= sheets.length) {
      setCurrentSheetIdx(Math.max(0, sheets.length - 1));
    }
  }, [sheets.length, currentSheetIdx]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setCurrentSheetIdx((i) => Math.min(sheets.length - 1, i + (viewMode === "spread" ? 2 : 1)));
      }
      if (e.key === "ArrowLeft") {
        setCurrentSheetIdx((i) => Math.max(0, i - (viewMode === "spread" ? 2 : 1)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, sheets.length, viewMode]);

  if (!open) return null;

  const activeSheet = sheets[currentSheetIdx];
  const activePlacement =
    activeSheet && !activeSheet.isCover && activeSheet.photo
      ? computeSheetPlacement(activeSheet.photo, paper.ratio, paper.widthIn)
      : null;

  const handleStep = (dir: -1 | 1) => {
    if (viewMode === "spread") {
      const targetSpread = Math.max(0, Math.min(spreads.length - 1, currentSpreadIdx + dir));
      const pair = spreads[targetSpread];
      const nextSheet = pair[0] ?? pair[1] ?? 0;
      setCurrentSheetIdx(nextSheet);
    } else {
      setCurrentSheetIdx((prev) => Math.max(0, Math.min(sheets.length - 1, prev + dir)));
    }
  };

  const modalContent = (
    <>
      {/* Interactive Screen Preview Modal */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 print:hidden">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950">
                  Print & Download Preview · {bookTitle || "Coloring Book"}
                </h2>
                <p className="text-[11px] text-zinc-500 tabular-nums">
                  {sheets.length} Total PDF Sheets ({includeCover ? "Cover + " : ""}
                  {pages.length} Pages) · {paper.label}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("single")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                    viewMode === "single"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1 Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("spread")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                    viewMode === "spread"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>Book Spread</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <Grid2x2 className="w-3.5 h-3.5" />
                  <span>All Pages</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowGuides((g) => !g)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                  showGuides
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Print Guides</span>
              </button>

              {viewMode !== "grid" && (
                <div className="hidden sm:flex items-center gap-1 bg-zinc-100 rounded-lg px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => setZoomPct((z) => Math.max(60, z - 20))}
                    aria-label="Zoom out"
                    className="p-1 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-zinc-700 tabular-nums w-10 text-center">
                    {zoomPct}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomPct((z) => Math.min(160, z + 20))}
                    aria-label="Zoom in"
                    className="p-1 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Canvas Area */}
          <div className="flex-1 overflow-auto bg-[#1D1D21] p-4 sm:p-8 flex flex-col items-center">
            {sheets.length === 0 ? (
              <div className="my-auto text-center space-y-2 text-zinc-400 max-w-sm">
                <BookOpen className="w-10 h-10 mx-auto opacity-50" />
                <p className="text-sm font-semibold text-zinc-200">No Pages Selected Yet</p>
                <p className="text-xs">
                  Select pages from Photo Hall first to preview the print layout.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {sheets.map((s, idx) => (
                  <button
                    key={`${s.label}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCurrentSheetIdx(idx);
                      setViewMode("single");
                    }}
                    className={`group text-left space-y-2 p-2 rounded-xl transition-all cursor-pointer ${
                      idx === currentSheetIdx
                        ? "bg-white/15 ring-2 ring-blue-500"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <SheetCanvas
                      sheetIndex={idx}
                      isCover={s.isCover}
                      photo={s.photo}
                      bookTitle={bookTitle}
                      bookSubtitle={bookSubtitle}
                      coverImage={coverImage}
                      coverLayout={coverLayout}
                      totalInteriorPages={pages.length}
                      paper={paper}
                      showGuides={false}
                    />
                    <div className="flex items-center justify-between gap-2 px-1">
                      <span className="text-[11px] font-medium text-zinc-200 truncate">
                        {idx + 1}. {s.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 tabular-nums shrink-0">
                        {paper.shortLabel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : viewMode === "spread" ? (
              <div className="my-auto w-full flex flex-col items-center gap-4">
                {(() => {
                  const pair = spreads[currentSpreadIdx] || [null, 0];
                  const leftIdx = pair[0];
                  const rightIdx = pair[1];
                  const baseMaxW = Math.round(780 * (zoomPct / 100));
                  return (
                    <div
                      className="w-full grid grid-cols-2 gap-1 sm:gap-1.5 items-start"
                      style={{ maxWidth: `${baseMaxW}px` }}
                    >
                      <div>
                        {leftIdx !== null && sheets[leftIdx] ? (
                          <SheetCanvas
                            sheetIndex={leftIdx}
                            isCover={sheets[leftIdx].isCover}
                            photo={sheets[leftIdx].photo}
                            bookTitle={bookTitle}
                            bookSubtitle={bookSubtitle}
                            coverImage={coverImage}
                            coverLayout={coverLayout}
                            totalInteriorPages={pages.length}
                            paper={paper}
                            showGuides={showGuides}
                            spineSide="left"
                          />
                        ) : (
                          <div
                            className="rounded border border-dashed border-zinc-700/80 bg-zinc-900/40 flex items-center justify-center text-[11px] text-zinc-500"
                            style={{ aspectRatio: paper.aspectCss }}
                          >
                            Front Cover Side
                          </div>
                        )}
                      </div>
                      <div>
                        {rightIdx !== null && sheets[rightIdx] ? (
                          <SheetCanvas
                            sheetIndex={rightIdx}
                            isCover={sheets[rightIdx].isCover}
                            photo={sheets[rightIdx].photo}
                            bookTitle={bookTitle}
                            bookSubtitle={bookSubtitle}
                            coverImage={coverImage}
                            coverLayout={coverLayout}
                            totalInteriorPages={pages.length}
                            paper={paper}
                            showGuides={showGuides}
                            spineSide="right"
                          />
                        ) : (
                          <div
                            className="rounded border border-dashed border-zinc-700/80 bg-zinc-900/40 flex items-center justify-center text-[11px] text-zinc-500"
                            style={{ aspectRatio: paper.aspectCss }}
                          >
                            Back Inside Blank
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="my-auto w-full flex flex-col items-center gap-4">
                <div
                  className="w-full"
                  style={{ maxWidth: `${Math.round(430 * (zoomPct / 100))}px` }}
                >
                  {activeSheet && (
                    <SheetCanvas
                      sheetIndex={currentSheetIdx}
                      isCover={activeSheet.isCover}
                      photo={activeSheet.photo}
                      bookTitle={bookTitle}
                      bookSubtitle={bookSubtitle}
                      coverImage={coverImage}
                      coverLayout={coverLayout}
                      totalInteriorPages={pages.length}
                      paper={paper}
                      showGuides={showGuides}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation & Print/Export Actions */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-3">
            {/* Pager & Active Page Print Quality Info */}
            <div className="flex flex-wrap items-center gap-3">
              {sheets.length > 0 && viewMode !== "grid" && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={viewMode === "spread" ? currentSpreadIdx === 0 : currentSheetIdx === 0}
                    onClick={() => handleStep(-1)}
                    aria-label="Previous page"
                    className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg border border-zinc-200 hover:border-zinc-400 disabled:opacity-35 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-zinc-800 tabular-nums px-2">
                    {viewMode === "spread"
                      ? `Spread ${currentSpreadIdx + 1} / ${spreads.length}`
                      : `Sheet ${currentSheetIdx + 1} / ${sheets.length}`}
                  </span>
                  <button
                    type="button"
                    disabled={
                      viewMode === "spread"
                        ? currentSpreadIdx >= spreads.length - 1
                        : currentSheetIdx >= sheets.length - 1
                    }
                    onClick={() => handleStep(1)}
                    aria-label="Next page"
                    className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg border border-zinc-200 hover:border-zinc-400 disabled:opacity-35 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeSheet && (
                <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-zinc-950 truncate max-w-[200px]">
                    {activeSheet.label}
                  </span>
                  {activePlacement && activeSheet.photo && (
                    <>
                      <span className="text-zinc-300">·</span>
                      <span className="tabular-nums">
                        {activeSheet.photo.width}×{activeSheet.photo.height} px
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                          activePlacement.effectiveDpi >= 250
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        ~{activePlacement.effectiveDpi} Print DPI
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Print / Download Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={sheets.length === 0}
                onClick={() => window.print()}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-45 rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Book</span>
              </button>
              <button
                type="button"
                disabled={!canExportBook || exportingType !== null}
                onClick={onDownloadZip}
                title={!canExportBook ? "Select 20–35 pages to export full book" : undefined}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-45 rounded-lg cursor-pointer"
              >
                <FileArchive className="w-3.5 h-3.5" />
                <span>
                  {exportingType === "zip" ? `ZIP ${exportProgress}%` : "Download ZIP"}
                </span>
              </button>
              <button
                type="button"
                disabled={!canExportBook || exportingType !== null}
                onClick={onDownloadPdf}
                title={!canExportBook ? "Select 20–35 pages to export full book" : undefined}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-45 rounded-lg cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {exportingType === "pdf"
                    ? `Building PDF ${exportProgress}%...`
                    : `Download PDF (${pages.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Clean Print-Only Container (renders ONLY when printing via window.print()) */}
      <div className="hidden print:block bg-white">
        {sheets.map((s, idx) => {
          const pl = s.photo ? computeSheetPlacement(s.photo, paper.ratio, paper.widthIn) : null;
          return (
            <div
              key={`print-${idx}`}
              className="w-full break-after-page bg-white relative overflow-hidden"
              style={{ aspectRatio: paper.aspectCss }}
            >
              {s.isCover ? (
                coverImage && coverLayout === "full-image" ? (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <img
                      src={coverImage}
                      alt={bookTitle || "Book Cover"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : coverImage ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-[8.8%]">
                    <div className="w-full h-full border-2 border-[#111113] flex flex-col items-center justify-between px-[7%] py-[7%] text-center overflow-hidden">
                      <h1 className="text-2xl font-bold text-[#111113] shrink-0">
                        {bookTitle || "Coloring Book"}
                      </h1>
                      <div className="flex-1 min-h-0 w-full flex items-center justify-center my-3 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={bookTitle || "Book Cover"}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 shrink-0">
                        {bookSubtitle.trim() && (
                          <p className="text-sm text-[#505056]">{bookSubtitle.trim()}</p>
                        )}
                        <p className="text-xs text-[#78787E]">
                          {pages.length} Print-Ready Pages · {paper.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-[8.8%]">
                    <div className="w-full h-full border-2 border-[#111113] flex flex-col items-center justify-between px-[8%] py-[9%] text-center">
                      <div />
                      <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-[#111113]">
                          {bookTitle || "Coloring Book"}
                        </h1>
                        {bookSubtitle.trim() && (
                          <p className="text-base text-[#505056]">{bookSubtitle.trim()}</p>
                        )}
                      </div>
                      <p className="text-xs text-[#78787E]">
                        {pages.length} Print-Ready Pages · {paper.label}
                      </p>
                    </div>
                  </div>
                )
              ) : s.photo && pl ? (
                <img
                  src={s.photo.dataUrl}
                  alt={s.photo.title}
                  style={{
                    position: "absolute",
                    left: `${pl.offsetXPct}%`,
                    top: `${pl.offsetYPct}%`,
                    width: `${pl.drawWPct}%`,
                    height: `${pl.drawHPct}%`,
                    objectFit: "fill",
                    filter: pl.isGrayscaleOutput ? "grayscale(100%)" : undefined,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
