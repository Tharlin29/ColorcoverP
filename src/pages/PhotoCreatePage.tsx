import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  AspectRatio,
  BookPageSize,
  ColoringColorMode,
  CreationMode,
  MoodPreset,
  PageId,
  PhotoItem,
  PrintDpi,
} from "../types/studio";
import { exportSinglePhotoAsPdf } from "../utils/exportTools";
import {
  buildColoringBookSvg,
  buildProceduralSvg,
  getColoringDimensions,
  getDimensionsForAspect,
  rasterizeSvgToPng,
} from "../utils/proceduralArt";
import { readFileAsDataUrl, triggerBlobDownload, triggerDownload } from "../utils/storage";

interface PhotoCreatePageProps {
  photos: PhotoItem[];
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onEditPhoto: (photo: PhotoItem) => void;
  onDeletePhoto: (id: string) => Promise<void>;
  onSendToPage: (page: PageId, photo: PhotoItem) => void;
  onBackHome: () => void;
}

const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: "4:3", label: "4:3" },
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "3:4", label: "3:4" },
  { id: "9:16", label: "9:16" },
];

const MOODS: MoodPreset[] = [
  "Editorial Film",
  "Golden Hour",
  "Cyber Noir",
  "Watercolor Mist",
  "Minimalist Arch",
];

const COLORING_PROMPTS = [
  "Intricate botanical floral mandala with leaves and petals",
  "ပုဂံစေတီပုထိုးများနှင့် ကြာပန်းပုံ Coloring Book",
  "Ocean sailboat with rolling waves and lighthouse",
  "Mountain pine forest and winding river landscape",
  "Enchanted garden butterflies and blooming roses",
];

const STANDARD_PROMPTS = [
  "ပုဂံနေဝင်ချိန် ရွှေရောင်တိမ်တိုက်များနှင့် စေတီပုထိုးများ",
  "Misty ocean cliffs at twilight with glowing lighthouse",
  "Rainy Tokyo neon street reflection at midnight",
  "Golden mountain valley with serene morning fog",
];

export function PhotoCreatePage({
  photos,
  onSaveNewPhoto,
  onEditPhoto,
  onDeletePhoto,
  onSendToPage,
  onBackHome,
}: PhotoCreatePageProps) {
  const [creationMode, setCreationMode] = useState<CreationMode>("coloring-book");
  const [pageSize, setPageSize] = useState<BookPageSize>("us-letter");
  const [dpi, setDpi] = useState<PrintDpi>(300);
  const [colorMode, setColorMode] = useState<ColoringColorMode>("bw");

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("4:3");
  const [mood, setMood] = useState<MoodPreset>("Editorial Film");
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [latestPhoto, setLatestPhoto] = useState<PhotoItem | null>(null);
  const [filterKind, setFilterKind] = useState<"all" | PhotoItem["kind"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const coloringDims = getColoringDimensions(pageSize, dpi);

  const handleRefinePrompt = async () => {
    if (!prompt.trim() || refining) return;
    setRefining(true);
    setErrorMsg(null);
    setNoticeMsg(null);
    try {
      const res = await fetch("/api/photo/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), mood, creationMode }),
      });
      const data = (await res.json()) as { refinedPrompt?: string };
      if (data.refinedPrompt) {
        setPrompt(data.refinedPrompt);
      }
    } catch {
      // Keep original prompt on network error
    } finally {
      setRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Prompt ရေးထည့်ပေးပါ (Please enter a prompt).");
      return;
    }
    setGenerating(true);
    setErrorMsg(null);
    setNoticeMsg(null);

    const isColoring = creationMode === "coloring-book";

    try {
      const res = await fetch("/api/photo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          mood,
          creationMode,
          pageSize,
          dpi,
          colorMode,
        }),
      });

      const data = (await res.json()) as {
        title?: string;
        enhancedPrompt?: string;
        svgMarkup?: string | null;
        width?: number;
        height?: number;
        error?: string;
        notice?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Unable to create image.");
      }

      if (data.notice) {
        setNoticeMsg(data.notice);
      }

      const targetDims = isColoring ? coloringDims : getDimensionsForAspect(aspectRatio);
      const width = data.width || targetDims.width;
      const height = data.height || targetDims.height;

      const fallbackSvg = isColoring
        ? buildColoringBookSvg(prompt.trim(), width, height, colorMode)
        : buildProceduralSvg(prompt.trim(), width, height, mood);

      const rasterOptions = isColoring ? { colorMode, dpi } : undefined;
      let pngDataUrl: string;
      if (data.svgMarkup) {
        try {
          pngDataUrl = await rasterizeSvgToPng(data.svgMarkup, width, height, rasterOptions);
        } catch {
          pngDataUrl = await rasterizeSvgToPng(fallbackSvg, width, height, rasterOptions);
        }
      } else {
        pngDataUrl = await rasterizeSvgToPng(fallbackSvg, width, height, rasterOptions);
      }

      const now = Date.now();
      const newPhoto: PhotoItem = {
        id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: data.title || prompt.trim().slice(0, 40),
        prompt: prompt.trim(),
        dataUrl: pngDataUrl,
        width,
        height,
        aspectRatio: isColoring ? (pageSize === "a4" ? "A4" : "US Letter") : aspectRatio,
        mood: isColoring ? (colorMode === "bw" ? "B&W Line Art" : "Grayscale Line Art") : mood,
        dpi: isColoring ? dpi : undefined,
        pageSize: isColoring ? pageSize : undefined,
        colorMode: isColoring ? colorMode : undefined,
        isColoringPage: isColoring,
        kind: isColoring ? "coloring" : "generated",
        createdAt: now,
        updatedAt: now,
      };

      await onSaveNewPhoto(newPhoto);
      setLatestPhoto(newPhoto);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to generate image.");
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadToHall = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, width, height } = await readFileAsDataUrl(file);
      const now = Date.now();
      const uploaded: PhotoItem = {
        id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: file.name.replace(/\.[^.]+$/, "") || "Uploaded Photo",
        prompt: "Imported from device gallery",
        dataUrl,
        width,
        height,
        aspectRatio: `${width}:${height}`,
        kind: "uploaded",
        createdAt: now,
        updatedAt: now,
      };
      await onSaveNewPhoto(uploaded);
      setLatestPhoto(uploaded);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to import photo.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDownloadPdf = async (photo: PhotoItem) => {
    setExportingPdf(true);
    try {
      const targetSize = photo.pageSize || pageSize;
      const blob = await exportSinglePhotoAsPdf(photo, targetSize);
      triggerBlobDownload(blob, `${photo.title || "coloring-page"}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  };

  const filteredPhotos = photos.filter((p) => {
    const matchesKind = filterKind === "all" || p.kind === filterKind;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q || p.title.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q);
    return matchesKind && matchesQuery;
  });

  const starterPrompts =
    creationMode === "coloring-book" ? COLORING_PROMPTS : STANDARD_PROMPTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16 space-y-12">
      {/* Page Header */}
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
            01. Photo Create & Coloring Book Studio
          </h1>
          <p className="text-sm text-zinc-600">
            Coloring Book (US Letter / A4 · 300+ DPI · Black & White / Grayscale) သို့မဟုတ် Standard Art ထုတ်ပြီး PDF / PNG အဖြစ် Download လုပ်နိုင်ပါသည်။
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadToHall}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Import Gallery Photo</span>
        </button>
      </div>

      {/* Prompt Composer + Output Preview Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Prompt Input & Settings */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-5">
            {/* Mode Switcher */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-700 block">Creation Mode</span>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCreationMode("coloring-book")}
                  className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    creationMode === "coloring-book"
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  Coloring Book (300+ DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("standard")}
                  className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    creationMode === "standard"
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  Standard Color Art
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="photo-prompt" className="text-sm font-semibold text-zinc-950">
                  Prompt (မြန်မာ / English)
                </label>
                <button
                  type="button"
                  disabled={!prompt.trim() || refining}
                  onClick={handleRefinePrompt}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  {refining ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Refine Prompt</span>
                </button>
              </div>
              <textarea
                id="photo-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  creationMode === "coloring-book"
                    ? "ဥပမာ — ကြာပန်းနှင့် လိပ်ပြာများ Coloring Book line art... or Intricate lotus mandala..."
                    : "ဥပမာ — ပုဂံနေဝင်ချိန် ရွှေရောင်တိမ်တိုက်များ..."
                }
                className="w-full p-3.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
              />
            </div>

            {/* Starter Prompts */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-500 block">Quick Ideas</span>
              <div className="flex flex-wrap gap-1.5">
                {starterPrompts.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="px-2.5 py-1.5 text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer text-left truncate max-w-full"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {creationMode === "coloring-book" ? (
              <div className="space-y-4 pt-1 border-t border-zinc-100">
                {/* Page Size */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 block">
                    Page Size (စာရွက်အရွယ်အစား)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPageSize("us-letter")}
                      className={`p-3 text-left rounded-xl border transition-colors cursor-pointer ${
                        pageSize === "us-letter"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="text-xs font-semibold">US Letter</div>
                      <div
                        className={`text-[11px] tabular-nums mt-0.5 ${
                          pageSize === "us-letter" ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        8.5 × 11 inches
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageSize("a4")}
                      className={`p-3 text-left rounded-xl border transition-colors cursor-pointer ${
                        pageSize === "a4"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="text-xs font-semibold">A4 Size</div>
                      <div
                        className={`text-[11px] tabular-nums mt-0.5 ${
                          pageSize === "a4" ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        210 × 297 mm
                      </div>
                    </button>
                  </div>
                </div>

                {/* Resolution (300+ DPI) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700">
                      Print Resolution (300+ DPI)
                    </span>
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                      {coloringDims.width} × {coloringDims.height} px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDpi(300)}
                      className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer tabular-nums ${
                        dpi === 300
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      300 DPI (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpi(350)}
                      className={`min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer tabular-nums ${
                        dpi === 350
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      350 DPI (Ultra High)
                    </button>
                  </div>
                </div>

                {/* Color Mode (Monochrome / Grayscale ONLY) */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 block">
                    Color Mode (Line Art Only · No RGB/CMYK Color)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setColorMode("bw")}
                      className={`p-3 text-left rounded-xl border transition-colors cursor-pointer ${
                        colorMode === "bw"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="text-xs font-semibold">Black & White</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          colorMode === "bw" ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        Pure Monochrome Line Art
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode("grayscale")}
                      className={`p-3 text-left rounded-xl border transition-colors cursor-pointer ${
                        colorMode === "grayscale"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="text-xs font-semibold">Grayscale</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          colorMode === "grayscale" ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        Line Art + Light Gray Tone
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Standard Aspect Ratio */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 block">Aspect Ratio</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id)}
                        className={`min-h-[40px] px-2 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          aspectRatio === ar.id
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Standard Art Mood */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 block">Art Mood</span>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          mood === m
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          {noticeMsg && (
            <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              {noticeMsg}
            </p>
          )}

          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {creationMode === "coloring-book"
                    ? `Rendering ${dpi} DPI Line Art...`
                    : "Creating & Saving to Photo Hall..."}
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                <span>
                  {creationMode === "coloring-book"
                    ? "Generate Coloring Page"
                    : "Generate Photo"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output Stage */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-950">Output Stage</span>
            {latestPhoto ? (
              <span className="text-xs text-zinc-500 tabular-nums">
                Saved to Photo Hall · {latestPhoto.width}×{latestPhoto.height} px
                {latestPhoto.dpi ? ` · ${latestPhoto.dpi} DPI` : ""}
              </span>
            ) : (
              creationMode === "coloring-book" && (
                <span className="text-xs text-zinc-500 tabular-nums">
                  {coloringDims.physicalLabel} · {colorMode === "bw" ? "Monochrome B&W" : "Grayscale"}
                </span>
              )
            )}
          </div>

          <div className="flex-1 min-h-[340px] bg-[#141416] rounded-xl flex items-center justify-center p-4 overflow-hidden">
            {generating ? (
              <div className="text-center space-y-3 text-zinc-300">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                <p className="text-sm font-medium">
                  {creationMode === "coloring-book"
                    ? `Rendering ${coloringDims.width}×${coloringDims.height} px (${dpi} DPI) Line Art...`
                    : "Composing layers & film lighting..."}
                </p>
              </div>
            ) : latestPhoto ? (
              <img
                src={latestPhoto.dataUrl}
                alt={latestPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[440px] w-auto object-contain rounded shadow-lg bg-white"
              />
            ) : (
              <div className="text-center space-y-2 max-w-sm text-zinc-400 px-4">
                <ImagePlus className="w-8 h-8 mx-auto opacity-60" />
                <p className="text-sm font-medium text-zinc-200">
                  {creationMode === "coloring-book"
                    ? "Ready for Print-Grade Line Art"
                    : "Ready to Create"}
                </p>
                <p className="text-xs leading-relaxed">
                  {creationMode === "coloring-book"
                    ? `Outputs ${coloringDims.width}×${coloringDims.height} px (${dpi} DPI) pure Black & White or Grayscale coloring pages ready for PDF or PNG download.`
                    : "Write your prompt on the left and press Generate Photo. Every created image is saved in Photo Hall below."}
                </p>
              </div>
            )}
          </div>

          {latestPhoto && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-950 truncate">{latestPhoto.title}</p>
                <p className="text-xs text-zinc-500 truncate">{latestPhoto.prompt}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditPhoto(latestPhoto)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSendToPage("book", latestPhoto)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Book Builder</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSendToPage("text", latestPhoto)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  disabled={exportingPdf}
                  onClick={() => handleDownloadPdf(latestPhoto)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{exportingPdf ? "Exporting..." : "Download PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(latestPhoto.dataUrl, `${latestPhoto.title || "lumina"}.png`)
                  }
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Photo Hall Gallery */}
      <section id="photo-hall" className="space-y-6 pt-6 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
              Photo Hall ({photos.length})
            </h2>
            <p className="text-sm text-zinc-500">
              ထုတ်ထားသော ပုံများကို ဤနေရာတွင် သိမ်းဆည်းထားပါသည် — PDF/PNG Download, Edit နှင့် Delete လုပ်နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos..."
                className="pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg overflow-x-auto">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "coloring", label: "Coloring" },
                  { id: "generated", label: "Art" },
                  { id: "edited", label: "Edited" },
                  { id: "text-art", label: "Text" },
                  { id: "uploaded", label: "Gallery" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterKind(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filterKind === tab.id
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-2">
            <p className="text-sm font-medium text-zinc-900">No matching photos in Photo Hall</p>
            <p className="text-xs text-zinc-500">
              Generate a coloring page or artwork above, or clear your search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
                  <img
                    src={photo.dataUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-white"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-500 tabular-nums">
                      <span>
                        {photo.width}×{photo.height}
                      </span>
                      {photo.dpi && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span>{photo.dpi} DPI</span>
                        </>
                      )}
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="capitalize">{photo.kind}</span>
                      {photo.mood && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span>{photo.mood}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-950 truncate mt-1">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{photo.prompt}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => onEditPhoto(photo)}
                      className="min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendToPage("book", photo)}
                      className="min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendToPage("text", photo)}
                      className="min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(photo)}
                      title="Download as PDF"
                      className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer ml-auto"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDownload(photo.dataUrl, `${photo.title || "lumina"}.png`)
                      }
                      title="Download PNG"
                      className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === photo.id ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeletePhoto(photo.id);
                          setConfirmDeleteId(null);
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(photo.id)}
                        aria-label="Delete photo"
                        className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
