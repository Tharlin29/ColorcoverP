import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckSquare,
  Copy,
  Download,
  FilePlus2,
  FileUp,
  ImagePlus,
  Images,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { PhotoItem } from "../types/studio";
import {
  AddedImagePageSizeMode,
  EditablePdfImagePage,
  EditablePdfOriginalPage,
  EditablePdfPage,
  exportEditedPdfDocument,
  formatFileSize,
  formatPtDimensions,
  parseUploadedPdfFile,
  PdfCompressionPreset,
  PdfSourceDoc,
  renderPdfPageToHighResPng,
} from "../utils/pdfEditorTools";
import { readFileAsDataUrl, triggerBlobDownload } from "../utils/storage";

interface PdfUploadEditorPanelProps {
  photos: PhotoItem[];
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
}

export function PdfUploadEditorPanel({
  photos,
  onSaveNewPhoto,
}: PdfUploadEditorPanelProps) {
  const [sources, setSources] = useState<Record<string, PdfSourceDoc>>({});
  const [pages, setPages] = useState<EditablePdfPage[]>([]);
  const [outputName, setOutputName] = useState("edited-book");
  const [imagePageSize, setImagePageSize] =
    useState<AddedImagePageSizeMode>("match-pdf");
  const [compression, setCompression] = useState<PdfCompressionPreset>("compact");

  const [parsingStatus, setParsingStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [savingPageId, setSavingPageId] = useState<string | null>(null);

  // Multi-select delete state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Undo buffer for deletions
  const [lastDeleted, setLastDeleted] = useState<{
    items: EditablePdfPage[];
    previousPages: EditablePdfPage[];
  } | null>(null);

  // Photo Hall picker drawer + optional insertion index
  const [hallPickerOpen, setHallPickerOpen] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "info" | "error";
    text: string;
  } | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const pdfPageCount = useMemo(
    () => pages.filter((p) => p.kind === "pdf-page").length,
    [pages]
  );
  const addedImageCount = useMemo(
    () => pages.filter((p) => p.kind === "image-page").length,
    [pages]
  );

  const insertPagesAtTarget = (newItems: EditablePdfPage[]) => {
    setPages((prev) => {
      if (
        insertAfterIndex !== null &&
        insertAfterIndex >= 0 &&
        insertAfterIndex < prev.length
      ) {
        const next = [...prev];
        next.splice(insertAfterIndex + 1, 0, ...newItems);
        return next;
      }
      return [...prev, ...newItems];
    });
    setInsertAfterIndex(null);
  };

  const handleUploadPdfs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setFeedback(null);
    const addedSources: Record<string, PdfSourceDoc> = {};
    const addedPages: EditablePdfOriginalPage[] = [];

    try {
      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        setParsingStatus(`Reading ${file.name}...`);
        const { sourceDoc, pages: parsedPages } = await parseUploadedPdfFile(
          file,
          (done, total) => {
            setParsingStatus(`Loading ${file.name} (${done}/${total} pages)...`);
          }
        );
        addedSources[sourceDoc.id] = sourceDoc;
        addedPages.push(...parsedPages);
      }

      if (pages.length === 0 && files[0]?.name) {
        const base = files[0].name.replace(/\.pdf$/i, "").trim();
        if (base) setOutputName(`${base}-edited`);
      }

      setSources((prev) => ({ ...prev, ...addedSources }));
      insertPagesAtTarget(addedPages);
      setLastDeleted(null);
      setFeedback({
        type: "info",
        text: `Added ${addedPages.length} page${addedPages.length === 1 ? "" : "s"} from ${
          files.length
        } PDF file${files.length === 1 ? "" : "s"}.`,
      });
    } catch (err) {
      console.error("PDF upload error:", err);
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? `Unable to read PDF: ${err.message}`
            : "Unable to read the uploaded PDF file.",
      });
    } finally {
      setParsingStatus(null);
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setFeedback(null);
    const newImgPages: EditablePdfImagePage[] = [];

    for (const file of files) {
      try {
        const { dataUrl, width, height } = await readFileAsDataUrl(file);
        newImgPages.push({
          id: `pdfimg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: "image-page",
          title: file.name.replace(/\.[^.]+$/, "") || "Uploaded Image",
          dataUrl,
          width,
          height,
          sourceLabel: "Uploaded Image",
        });
      } catch {
        // Skip unreadable image
      }
    }

    if (newImgPages.length > 0) {
      insertPagesAtTarget(newImgPages);
      setLastDeleted(null);
      setFeedback({
        type: "info",
        text: `Inserted ${newImgPages.length} image page${
          newImgPages.length === 1 ? "" : "s"
        } into the PDF.`,
      });
    }
  };

  const handleAddFromPhotoHall = (photo: PhotoItem) => {
    const newPage: EditablePdfImagePage = {
      id: `pdfhall-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: "image-page",
      title: photo.title || "Photo Hall Image",
      dataUrl: photo.dataUrl,
      width: photo.width,
      height: photo.height,
      sourceLabel: "Photo Hall",
    };
    insertPagesAtTarget([newPage]);
    setLastDeleted(null);
    setFeedback({
      type: "info",
      text: `Added "${photo.title}" from Photo Hall.`,
    });
  };

  const handleMovePage = (index: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= pages.length || index === targetIndex) {
      return;
    }
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleDuplicatePage = (index: number) => {
    const target = pages[index];
    if (!target) return;
    const copy: EditablePdfPage = {
      ...target,
      id: `${target.kind}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${target.title} (Copy)`,
    };
    setPages((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleDeleteSingle = (id: string) => {
    const removed = pages.find((p) => p.id === id);
    if (!removed) return;
    setLastDeleted({ items: [removed], previousPages: pages });
    setPages((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const removed = pages.filter((p) => selectedIds.has(p.id));
    if (removed.length === 0) return;
    setLastDeleted({ items: removed, previousPages: pages });
    setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
    setFeedback({
      type: "info",
      text: `Deleted ${removed.length} page${removed.length === 1 ? "" : "s"}.`,
    });
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    setPages(lastDeleted.previousPages);
    setLastDeleted(null);
    setFeedback({ type: "info", text: "Restored deleted page(s)." });
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSavePdfPageToPhotoHall = async (page: EditablePdfOriginalPage) => {
    const src = sources[page.sourceId];
    if (!src) return;
    setSavingPageId(page.id);
    setFeedback(null);
    try {
      const { dataUrl, width, height } = await renderPdfPageToHighResPng(
        src.bytes,
        page.pageIndex
      );
      const now = Date.now();
      await onSaveNewPhoto({
        id: `photo-pdf-${now}-${Math.random().toString(36).slice(2, 6)}`,
        title: page.title,
        prompt: `Extracted from ${page.sourceFileName}`,
        dataUrl,
        width,
        height,
        aspectRatio: `${width}:${height}`,
        dpi: 300,
        kind: "uploaded",
        createdAt: now,
        updatedAt: now,
      });
      setFeedback({
        type: "info",
        text: `Saved "${page.title}" to Photo Hall.`,
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Could not extract this PDF page to Photo Hall.",
      });
    } finally {
      setSavingPageId(null);
    }
  };

  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    setExporting(true);
    setExportProgress(0);
    setFeedback(null);

    try {
      const blob = await exportEditedPdfDocument({
        pages,
        sources,
        imagePageSize,
        compression,
        onProgress: setExportProgress,
      });
      const safeName =
        (outputName || "edited-book")
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-|-$/g, "") || "edited-book";
      triggerBlobDownload(blob, `${safeName}-${pages.length}pages.pdf`);
      setFeedback({
        type: "info",
        text: `Exported ${pages.length}-page PDF (${formatFileSize(blob.size)}) — optimized & links preserved.`,
      });
    } catch (err) {
      console.error("Edited PDF export failed:", err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to export edited PDF.",
      });
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={handleUploadPdfs}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUploadImages}
        className="hidden"
      />

      {/* Top Action & Export Strip */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              PDF Upload &amp; Page Editor
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
              {pages.length === 0
                ? "Upload any PDF file to delete pages, reorder, or add images from Photo Hall / Device — then re-export cleanly."
                : `${pages.length} Total Pages · ${pdfPageCount} Original PDF · ${addedImageCount} Added Images`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={parsingStatus !== null}
              onClick={() => {
                setInsertAfterIndex(null);
                pdfInputRef.current?.click();
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-lg cursor-pointer whitespace-nowrap"
            >
              {parsingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4" />
              )}
              <span>
                {pages.length === 0 ? "Upload PDF File" : "+ Add / Merge PDF"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInsertAfterIndex(null);
                imageInputRef.current?.click();
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <ImagePlus className="w-4 h-4" />
              <span>+ Upload Images</span>
            </button>

            <button
              type="button"
              disabled={photos.length === 0}
              onClick={() => {
                setInsertAfterIndex(null);
                setHallPickerOpen((v) => !v);
              }}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                hallPickerOpen
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-zinc-900 border-zinc-300 hover:border-zinc-500"
              }`}
            >
              <Images className="w-4 h-4" />
              <span>+ From Photo Hall ({photos.length})</span>
            </button>
          </div>
        </div>

        {/* Parsing Progress */}
        {parsingStatus && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{parsingStatus}</span>
          </div>
        )}

        {/* Export Controls Row (visible once at least 1 page exists) */}
        {pages.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <label className="lg:col-span-3 block">
              <span className="text-xs font-medium text-zinc-700">
                Output PDF Filename
              </span>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="edited-book"
                className="mt-1 w-full min-h-[42px] px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>

            <label className="lg:col-span-3 block">
              <span className="text-xs font-medium text-zinc-700">
                PDF File Size Quality
              </span>
              <select
                value={compression}
                onChange={(e) =>
                  setCompression(e.target.value as PdfCompressionPreset)
                }
                className="mt-1 w-full min-h-[42px] px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="compact">Compact (Small Size · Crisp)</option>
                <option value="ultra-small">Ultra Small (Smallest · Share)</option>
                <option value="original">High Quality (Original PDF)</option>
              </select>
            </label>

            <label className="lg:col-span-3 block">
              <span className="text-xs font-medium text-zinc-700">
                Added Image Page Size
              </span>
              <select
                value={imagePageSize}
                onChange={(e) =>
                  setImagePageSize(e.target.value as AddedImagePageSizeMode)
                }
                className="mt-1 w-full min-h-[42px] px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="match-pdf">Match Uploaded PDF Size</option>
                <option value="us-letter">US Letter (8.5×11 in)</option>
                <option value="a4">A4 (210×297 mm)</option>
              </select>
            </label>

            <div className="lg:col-span-3 flex items-center gap-2">
              <button
                type="button"
                disabled={exporting || pages.length === 0}
                onClick={handleExportPdf}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl cursor-pointer whitespace-nowrap"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">
                      Exporting ({exportProgress}%)...
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="tabular-nums">
                      Export PDF ({pages.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback / Undo Banner */}
        {(feedback || lastDeleted) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {feedback && (
              <p
                className={`text-xs font-medium px-3 py-2 rounded-lg ${
                  feedback.type === "error"
                    ? "text-red-700 bg-red-50"
                    : "text-emerald-800 bg-emerald-50"
                }`}
              >
                {feedback.text}
              </p>
            )}
            {lastDeleted && (
              <button
                type="button"
                onClick={handleUndoDelete}
                className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-amber-100 hover:bg-amber-200 rounded-lg cursor-pointer whitespace-nowrap ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Delete ({lastDeleted.items.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline Photo Hall Picker Drawer */}
      {hallPickerOpen && (
        <div className="bg-white border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Add Images from Photo Hall
                {insertAfterIndex !== null && (
                  <span className="text-blue-600 ml-1.5">
                    (Inserting after Page {insertAfterIndex + 1})
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500">
                Tap any Photo Hall image below to insert it into your PDF immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHallPickerOpen(false);
                setInsertAfterIndex(null);
              }}
              className="min-h-[34px] inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>

          {photos.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Photo Hall is currently empty. Upload images from your device instead.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {photos.map((photo) => (
                <button
                  key={`pdf-hall-pick-${photo.id}`}
                  type="button"
                  onClick={() => handleAddFromPhotoHall(photo)}
                  className="group text-left rounded-xl border border-zinc-200 hover:border-blue-600 bg-zinc-50 overflow-hidden cursor-pointer transition-all"
                >
                  <div className="aspect-[3/4] bg-white relative">
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                    <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center opacity-90 group-hover:scale-105 transition-transform">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-zinc-800 truncate px-2 py-1.5">
                    {photo.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty Dropzone State OR Interactive Page Manager Grid */}
      {pages.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-300 rounded-2xl p-10 sm:p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-700 mx-auto flex items-center justify-center">
            <FilePlus2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-zinc-950">
              Upload a PDF to Add, Delete, or Reorder Pages
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              PDF ဖိုင်တစ်ခု (သို့မဟုတ် အများအပြား) ကို Upload တင်ပြီး မလိုအပ်တဲ့စာမျက်နှာတွေ ဖျက်ခြင်း၊ Photo Hall နှင့် စက်ထဲမှ ပုံအသစ်များ ထပ်ထည့်ခြင်း၊ စာမျက်နှာအစီအစဉ်ပြင်ခြင်းတို့ လုပ်ပြီး မူလအရည်အသွေးနှင့် Clickable Link များမပျက် PDF ပြန်ထုတ်နိုင်ပါသည်။
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Choose PDF File(s)</span>
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer whitespace-nowrap"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Or Start with Images</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          {/* Grid Toolbar: Multi-Select Delete & Clear All */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectMode((v) => !v);
                  setSelectedIds(new Set());
                }}
                className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap ${
                  selectMode
                    ? "bg-zinc-950 text-white border-zinc-950"
                    : "bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500"
                }`}
              >
                {selectMode ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>{selectMode ? "Done Selecting" : "Select to Delete"}</span>
              </button>

              {selectMode && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds(
                        selectedIds.size === pages.length
                          ? new Set()
                          : new Set(pages.map((p) => p.id))
                      )
                    }
                    className="min-h-[36px] px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    {selectedIds.size === pages.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    type="button"
                    disabled={selectedIds.size === 0}
                    onClick={handleDeleteSelected}
                    className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedIds.size})</span>
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setLastDeleted({ items: pages, previousPages: pages });
                setPages([]);
                setSelectedIds(new Set());
                setSelectMode(false);
              }}
              className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Clear All Pages
            </button>
          </div>

          {/* Visual Page Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pages.map((page, idx) => {
              const isChecked = selectedIds.has(page.id);
              const thumbSrc =
                page.kind === "pdf-page" ? page.thumbnailUrl : page.dataUrl;

              return (
                <div
                  key={page.id}
                  onClick={() => {
                    if (selectMode) toggleSelectId(page.id);
                  }}
                  className={`rounded-xl border-2 overflow-hidden bg-white flex flex-col transition-all ${
                    selectMode ? "cursor-pointer" : ""
                  } ${
                    isChecked
                      ? "border-red-500 ring-2 ring-red-500/15"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {/* Thumbnail Area */}
                  <div className="aspect-[3/4] bg-zinc-50 relative flex items-center justify-center overflow-hidden border-b border-zinc-100">
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={page.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">Preview unavailable</span>
                    )}

                    {/* Page Number */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold tabular-nums bg-zinc-950/85 text-white rounded-md">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Multi-select checkbox or Quick Delete */}
                    {selectMode ? (
                      <div
                        className={`absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center border-2 ${
                          isChecked
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-white/95 border-zinc-400 text-transparent"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingle(page.id);
                        }}
                        title="Delete this page"
                        aria-label={`Delete page ${idx + 1}`}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/95 border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-300 flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Metadata & Controls */}
                  <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-950 truncate">
                        {page.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums truncate">
                        {page.kind === "pdf-page"
                          ? `PDF · ${formatPtDimensions(page.widthPt, page.heightPt)}`
                          : `${page.sourceLabel} · ${page.width}×${page.height}`}
                      </p>
                    </div>

                    {!selectMode && (
                      <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMovePage(idx, idx - 1)}
                              title="Move earlier"
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 hidden sm:block" />
                              <ArrowUp className="w-3.5 h-3.5 sm:hidden" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === pages.length - 1}
                              onClick={() => handleMovePage(idx, idx + 1)}
                              title="Move later"
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />
                              <ArrowDown className="w-3.5 h-3.5 sm:hidden" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicatePage(idx)}
                              title="Duplicate page"
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setInsertAfterIndex(idx);
                                setHallPickerOpen(true);
                              }}
                              title="Insert Photo Hall image right after this page"
                              className="min-h-[32px] px-2 inline-flex items-center gap-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Insert After</span>
                            </button>
                          </div>
                        </div>

                        {page.kind === "pdf-page" && (
                          <button
                            type="button"
                            disabled={savingPageId === page.id}
                            onClick={() => handleSavePdfPageToPhotoHall(page)}
                            className="w-full min-h-[32px] inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md cursor-pointer disabled:opacity-50"
                          >
                            {savingPageId === page.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>
                              {savingPageId === page.id
                                ? "Extracting..."
                                : "Save Page to Photo Hall"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
