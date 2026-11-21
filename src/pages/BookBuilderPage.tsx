import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  Eye,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BookPrintPreviewModal } from "../components/BookPrintPreviewModal";
import { BookPageSize, ColoringColorMode, PhotoItem, PrintDpi } from "../types/studio";
import { exportBookAsPdf, exportBookAsZip } from "../utils/exportTools";
import {
  buildColoringBookSvg,
  getColoringDimensions,
  rasterizeSvgToPng,
} from "../utils/proceduralArt";
import { readFileAsDataUrl, triggerBlobDownload } from "../utils/storage";

interface BookBuilderPageProps {
  photos: PhotoItem[];
  initialPhoto: PhotoItem | null;
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onBackHome: () => void;
}

const MIN_BOOK_PAGES = 20;
const MAX_BOOK_PAGES = 35;

const BATCH_THEMES = [
  { title: "Botanical Lotus Mandala", prompt: "Intricate botanical lotus mandala coloring page" },
  { title: "Bagan Golden Pagoda", prompt: "Ancient Bagan pagoda with clouds and lotus line art" },
  { title: "Ocean Sailboat Waves", prompt: "Ocean sailboat with rolling waves line art" },
  { title: "Blooming Garden Roses", prompt: "Floral rose bouquet and garden leaves line art" },
  { title: "Mountain Pine Valley", prompt: "Mountain pine forest and winding river landscape" },
  { title: "Sacred Geometric Mandala", prompt: "Symmetrical geometric mandala pattern coloring page" },
  { title: "Butterfly Meadow", prompt: "Butterflies fluttering over wildflower garden" },
  { title: "Seaside Lighthouse", prompt: "Coastal lighthouse and ocean waves line art" },
];

export function BookBuilderPage({
  photos,
  initialPhoto,
  onSaveNewPhoto,
  onBackHome,
}: BookBuilderPageProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const coloring = photos.filter((p) => p.isColoringPage || p.kind === "coloring");
    const pool = coloring.length > 0 ? coloring : photos;
    const initial = pool.slice(0, MAX_BOOK_PAGES).map((p) => p.id);
    if (initialPhoto && !initial.includes(initialPhoto.id)) {
      return [initialPhoto.id, ...initial].slice(0, MAX_BOOK_PAGES);
    }
    return initial;
  });

  const [filterMode, setFilterMode] = useState<"all" | "coloring">("all");
  const [pageSize, setPageSize] = useState<BookPageSize>("us-letter");
  const [bookTitle, setBookTitle] = useState("My Coloring Book");
  const [bookSubtitle, setBookSubtitle] = useState("300 DPI Print-Ready Edition");
  const [includeCover, setIncludeCover] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageTitle, setCoverImageTitle] = useState<string>("");
  const [coverLayout, setCoverLayout] = useState<"full-image" | "framed-title">("framed-title");
  const [showCoverHallPicker, setShowCoverHallPicker] = useState(false);

  const [exportingType, setExportingType] = useState<"pdf" | "zip" | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Sync if initialPhoto changes
  useEffect(() => {
    if (initialPhoto && !selectedIds.includes(initialPhoto.id)) {
      setSelectedIds((prev) => [initialPhoto.id, ...prev].slice(0, MAX_BOOK_PAGES));
    }
  }, [initialPhoto]);

  // Remove deleted photos from selection automatically
  useEffect(() => {
    const validSet = new Set(photos.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => validSet.has(id)));
  }, [photos]);

  const photoMap = new Map(photos.map((p) => [p.id, p]));
  const selectedPhotos = selectedIds
    .map((id) => photoMap.get(id))
    .filter((p): p is PhotoItem => Boolean(p));

  const visiblePool =
    filterMode === "coloring"
      ? photos.filter((p) => p.isColoringPage || p.kind === "coloring")
      : photos;

  const isWithinBookRange =
    selectedPhotos.length >= MIN_BOOK_PAGES && selectedPhotos.length <= MAX_BOOK_PAGES;

  const toggleSelect = (id: string) => {
    setErrorMsg(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_BOOK_PAGES) {
        setErrorMsg(`Maximum ${MAX_BOOK_PAGES} pages allowed per book.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    setSelectedIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleSelectUpTo35 = () => {
    setErrorMsg(null);
    setSelectedIds(visiblePool.slice(0, MAX_BOOK_PAGES).map((p) => p.id));
  };

  const handleImportPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setErrorMsg(null);
    const addedIds: string[] = [];

    for (const file of files) {
      try {
        const { dataUrl, width, height } = await readFileAsDataUrl(file);
        const now = Date.now();
        const id = `photo-${now}-${Math.random().toString(36).slice(2, 7)}`;
        await onSaveNewPhoto({
          id,
          title: file.name.replace(/\.[^.]+$/, "") || "Imported Page",
          prompt: "Imported for Book Builder",
          dataUrl,
          width,
          height,
          aspectRatio: `${width}:${height}`,
          kind: "uploaded",
          createdAt: now,
          updatedAt: now,
        });
        addedIds.push(id);
      } catch {
        // Skip unreadable file
      }
    }

    if (addedIds.length > 0) {
      setSelectedIds((prev) => [...prev, ...addedIds].slice(0, MAX_BOOK_PAGES));
    }
    e.target.value = "";
  };

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const { dataUrl } = await readFileAsDataUrl(file);
      setCoverImage(dataUrl);
      setCoverImageTitle(file.name.replace(/\.[^.]+$/, "") || "Uploaded Cover");
      setIncludeCover(true);
      setShowCoverHallPicker(false);
    } catch {
      setErrorMsg("Unable to read selected cover image.");
    }
    e.target.value = "";
  };

  const handleQuickBatchGenerate = async (count: number) => {
    if (batchGenerating) return;
    setBatchGenerating(true);
    setErrorMsg(null);

    const dpi: PrintDpi = 300;
    const colorMode: ColoringColorMode = "bw";
    const dims = getColoringDimensions(pageSize, dpi);
    const newIds: string[] = [];

    try {
      for (let i = 0; i < count; i++) {
        if (selectedIds.length + newIds.length >= MAX_BOOK_PAGES) break;
        const theme = BATCH_THEMES[(photos.length + i) % BATCH_THEMES.length];
        const variationPrompt = `${theme.prompt} · edition ${photos.length + i + 1}`;
        setBatchStatus(`Generating ${i + 1} of ${count} (300 DPI)...`);

        const svg = buildColoringBookSvg(variationPrompt, dims.width, dims.height, colorMode);
        const pngDataUrl = await rasterizeSvgToPng(svg, dims.width, dims.height, {
          colorMode,
          dpi,
        });

        const now = Date.now();
        const id = `photo-${now}-${Math.random().toString(36).slice(2, 7)}`;
        await onSaveNewPhoto({
          id,
          title: `${theme.title} #${photos.length + i + 1}`,
          prompt: theme.prompt,
          dataUrl: pngDataUrl,
          width: dims.width,
          height: dims.height,
          aspectRatio: pageSize === "a4" ? "A4" : "US Letter",
          mood: "B&W Line Art",
          dpi,
          pageSize,
          colorMode,
          isColoringPage: true,
          kind: "coloring",
          createdAt: now,
          updatedAt: now,
        });
        newIds.push(id);
      }

      if (newIds.length > 0) {
        setSelectedIds((prev) => [...prev, ...newIds].slice(0, MAX_BOOK_PAGES));
      }
    } finally {
      setBatchGenerating(false);
      setBatchStatus(null);
    }
  };

  const handleExportBook = async (format: "pdf" | "zip") => {
    if (!isWithinBookRange) {
      setErrorMsg(
        `Please select between ${MIN_BOOK_PAGES} and ${MAX_BOOK_PAGES} pages to build your book (currently ${selectedPhotos.length}).`
      );
      return;
    }

    setExportingType(format);
    setExportProgress(0);
    setErrorMsg(null);

    try {
      const safeName =
        (bookTitle || "coloring-book")
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-|-$/g, "") || "coloring-book";

      if (format === "pdf") {
        const blob = await exportBookAsPdf({
          pages: selectedPhotos,
          pageSize,
          bookTitle,
          bookSubtitle,
          includeCover,
          coverImage: includeCover ? coverImage : null,
          coverLayout,
          onProgress: setExportProgress,
        });
        triggerBlobDownload(blob, `${safeName}-${selectedPhotos.length}pages.pdf`);
      } else {
        const blob = await exportBookAsZip({
          pages: selectedPhotos,
          bookTitle,
          coverImage: includeCover ? coverImage : null,
          onProgress: setExportProgress,
        });
        triggerBlobDownload(blob, `${safeName}-${selectedPhotos.length}pages-fullres.zip`);
      }
    } catch (err) {
      console.error("Book export failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Book export failed.");
    } finally {
      setExportingType(null);
      setExportProgress(0);
    }
  };

  const neededCount = Math.max(0, MIN_BOOK_PAGES - selectedPhotos.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Grid</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            02. Coloring Book Builder (20–35 Pages)
          </h1>
          <p className="text-sm text-zinc-600">
            Create လုပ်ထားသော ပုံ ၂၀ မှ ၃၅ ပုံအထိ စိတ်ကြိုက်ရွေးချယ်ပြီး Original Resolution အပြည့်အဝဖြင့် PDF သို့မဟုတ် ZIP ထုတ်ယူပါ။
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImportPages}
            className="hidden"
          />
          <button
            type="button"
            disabled={selectedPhotos.length === 0 && !includeCover}
            onClick={() => setPreviewOpen(true)}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-45 cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Print & PDF ({selectedPhotos.length + (includeCover ? 1 : 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Import Extra Pages</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Photo Hall Selection Grid */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                1. Select Pages from Photo Hall
              </h2>
              <p className="text-xs text-zinc-500 tabular-nums">
                Selected: {selectedPhotos.length} / {MIN_BOOK_PAGES}–{MAX_BOOK_PAGES} pages
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    filterMode === "all" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600"
                  }`}
                >
                  All ({photos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("coloring")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    filterMode === "coloring"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600"
                  }`}
                >
                  Coloring Only
                </button>
              </div>

              <button
                type="button"
                onClick={handleSelectUpTo35}
                className="min-h-[34px] px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Select All
              </button>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="min-h-[34px] px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-950 cursor-pointer whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Selection Progress Meter + Quick Batch Fill Helper */}
          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-zinc-900 tabular-nums">
                Book Readiness: {selectedPhotos.length} of {MIN_BOOK_PAGES}–{MAX_BOOK_PAGES} pages
              </span>
              <span
                className={`font-medium tabular-nums ${
                  isWithinBookRange ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {isWithinBookRange
                  ? "Ready for Full-Resolution Export"
                  : neededCount > 0
                  ? `Select ${neededCount} more page${neededCount === 1 ? "" : "s"}`
                  : "Maximum 35 pages exceeded"}
              </span>
            </div>

            <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  isWithinBookRange ? "bg-emerald-600" : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((selectedPhotos.length / MIN_BOOK_PAGES) * 100))}%`,
                }}
              />
            </div>

            {neededCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-zinc-600">
                  Need more 300 DPI coloring pages to reach 20?
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={batchGenerating}
                    onClick={() => handleQuickBatchGenerate(5)}
                    className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-500 rounded-lg cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {batchGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{batchStatus || "Generate +5 Coloring Pages"}</span>
                  </button>
                  {neededCount <= 20 && (
                    <button
                      type="button"
                      disabled={batchGenerating}
                      onClick={() => handleQuickBatchGenerate(neededCount)}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill Remaining {neededCount}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Grid of Available Images */}
          {visiblePool.length === 0 ? (
            <div className="py-14 text-center space-y-2 border border-dashed border-zinc-200 rounded-xl">
              <p className="text-sm font-medium text-zinc-800">No pages available in this filter</p>
              <p className="text-xs text-zinc-500">
                Create coloring pages in Photo Create or click Generate +5 Coloring Pages above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[540px] overflow-y-auto pr-1">
              {visiblePool.map((photo) => {
                const orderIdx = selectedIds.indexOf(photo.id);
                const isSelected = orderIdx !== -1;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => toggleSelect(photo.id)}
                    className={`group text-left rounded-xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-600/15 bg-blue-50/20"
                        : "border-zinc-200 hover:border-zinc-400 bg-white"
                    }`}
                  >
                    <div className="aspect-[3/4] w-full bg-white relative overflow-hidden">
                      <img
                        src={photo.dataUrl}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold tabular-nums ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-black/60 text-white opacity-80 group-hover:opacity-100"
                        }`}
                      >
                        {isSelected ? orderIdx + 1 : <Check className="w-3.5 h-3.5 opacity-60" />}
                      </div>
                    </div>
                    <div className="p-2 border-t border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{photo.title}</p>
                      <p className="text-[11px] text-zinc-500 tabular-nums truncate">
                        {photo.width}×{photo.height}
                        {photo.dpi ? ` · ${photo.dpi} DPI` : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Book Settings, Page Order & Full-Res Export */}
        <div className="lg:col-span-5 space-y-5">
          {/* Book Details */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-zinc-950">2. Book Settings & Export</h2>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Book Title</span>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Subtitle / Author</span>
                <input
                  type="text"
                  value={bookSubtitle}
                  onChange={(e) => setBookSubtitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-700 block">PDF Page Size</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageSize("us-letter")}
                  className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                    pageSize === "us-letter"
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  US Letter (8.5×11 in)
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize("a4")}
                  className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                    pageSize === "a4"
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  A4 (210×297 mm)
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="w-4 h-4 accent-zinc-950 rounded cursor-pointer"
              />
              <span>Include clean Title Cover Page at start of PDF</span>
            </label>

            {/* Cover Image Upload / Photo Hall Picker */}
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/75 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="text-xs font-semibold text-zinc-900">
                    Cover Image (မျက်နှာဖုံးပုံ)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCoverImage}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="min-h-[30px] inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-500 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    disabled={photos.length === 0}
                    onClick={() => setShowCoverHallPicker((v) => !v)}
                    className={`min-h-[30px] inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                      showCoverHallPicker
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>From Photo Hall</span>
                  </button>
                </div>
              </div>

              {coverImage ? (
                <div className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-zinc-200">
                  <img
                    src={coverImage}
                    alt={coverImageTitle || "Book Cover"}
                    referrerPolicy="no-referrer"
                    className="w-14 h-18 object-contain bg-zinc-50 rounded border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 truncate">
                        {coverImageTitle || "Cover Image"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverImageTitle("");
                        }}
                        aria-label="Remove cover image"
                        className="p-1 text-zinc-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCoverLayout("framed-title")}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-md border cursor-pointer ${
                          coverLayout === "framed-title"
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        Framed + Title
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverLayout("full-image")}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-md border cursor-pointer ${
                          coverLayout === "full-image"
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        Full Image Cover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  စိတ်ကြိုက် Cover Image ထည့်ထားပါက PDF ပထမစာမျက်နှာနှင့် ZIP ထဲတွင် မျက်နှာဖုံးအဖြစ် ထည့်သွင်းပေးပါမည်။
                </p>
              )}

              {showCoverHallPicker && photos.length > 0 && (
                <div className="pt-1 border-t border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-600">
                      Photo Hall မှ Cover ပုံ ရွေးပါ
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCoverHallPicker(false)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {photos.map((photo) => (
                      <button
                        key={`cover-pick-${photo.id}`}
                        type="button"
                        onClick={() => {
                          setCoverImage(photo.dataUrl);
                          setCoverImageTitle(photo.title);
                          setIncludeCover(true);
                          setShowCoverHallPicker(false);
                        }}
                        className={`rounded-lg border overflow-hidden bg-white cursor-pointer transition-all ${
                          coverImage === photo.dataUrl
                            ? "border-blue-600 ring-2 ring-blue-600/20"
                            : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <div className="aspect-[3/4] w-full">
                          <img
                            src={photo.dataUrl}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            {/* Export Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={selectedPhotos.length === 0 && !includeCover}
                onClick={() => setPreviewOpen(true)}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4" />
                <span className="tabular-nums">
                  Preview Exact Print & PDF Layout ({selectedPhotos.length + (includeCover ? 1 : 0)} Sheets)
                </span>
              </button>

              <button
                type="button"
                disabled={exportingType !== null || !isWithinBookRange}
                onClick={() => handleExportBook("pdf")}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap"
              >
                {exportingType === "pdf" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">Building Full-Res PDF ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span className="tabular-nums">
                      Download Book PDF ({selectedPhotos.length} Pages)
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={exportingType !== null || !isWithinBookRange}
                onClick={() => handleExportBook("zip")}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-zinc-950 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap"
              >
                {exportingType === "zip" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">Packaging ZIP ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" />
                    <span className="tabular-nums">
                      Download Full-Res ZIP ({selectedPhotos.length} Files)
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Zero resolution loss: Every page is embedded in PDF and archived in ZIP at 100% of its native pixel resolution and DPI metadata.
              </p>
            </div>
          </div>

          {/* Page Sequence List */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-950">
                3. Page Order ({selectedPhotos.length})
              </h3>
              <span className="text-xs text-zinc-500 tabular-nums">20–35 Pages</span>
            </div>

            {selectedPhotos.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-40" />
                Select pages on the left to arrange your book sequence.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {selectedPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-200 bg-zinc-50/70"
                  >
                    <span className="text-xs font-bold text-zinc-500 tabular-nums w-6 text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-11 object-contain bg-white rounded border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-950 truncate">{photo.title}</p>
                      <p className="text-[11px] text-zinc-500 tabular-nums">
                        {photo.width}×{photo.height}
                        {photo.dpi ? ` · ${photo.dpi} DPI` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePage(idx, -1)}
                        aria-label="Move page up"
                        className="min-w-[30px] min-h-[30px] flex items-center justify-center rounded hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedPhotos.length - 1}
                        onClick={() => movePage(idx, 1)}
                        aria-label="Move page down"
                        className="min-w-[30px] min-h-[30px] flex items-center justify-center rounded hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSelect(photo.id)}
                        aria-label="Remove page"
                        className="min-w-[30px] min-h-[30px] flex items-center justify-center rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookPrintPreviewModal
        open={previewOpen}
        pages={selectedPhotos}
        pageSize={pageSize}
        bookTitle={bookTitle}
        bookSubtitle={bookSubtitle}
        includeCover={includeCover}
        coverImage={includeCover ? coverImage : null}
        coverLayout={coverLayout}
        canExportBook={isWithinBookRange}
        exportingType={exportingType}
        exportProgress={exportProgress}
        onClose={() => setPreviewOpen(false)}
        onDownloadPdf={() => handleExportBook("pdf")}
        onDownloadZip={() => handleExportBook("zip")}
      />
    </div>
  );
}
