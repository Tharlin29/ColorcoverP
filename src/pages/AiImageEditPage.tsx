import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eraser,
  Eye,
  FileText,
  FlipHorizontal2,
  Layers,
  Loader2,
  Move,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Sticker,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageRegionEraserModal } from "../components/ImageRegionEraserModal";
import { StepperControl } from "../components/StepperControl";
import { TextBoundRibbon } from "../components/TextBoundRibbon";
import { TextBoundSvg } from "../components/TextBoundSvg";
import {
  AiEditColoringConfig,
  AiEditPlan,
  BookPageSize,
  ColoringColorMode,
  EditOverlayLayer,
  PhotoItem,
  PrintDpi,
  TextLayer,
  TextStylePreset,
} from "../types/studio";
import { exportSinglePhotoAsPdf } from "../utils/exportTools";
import { GlyphStyle } from "../utils/glyphVectorEngine";
import {
  extractAiOverlayLayers,
  FONT_OPTIONS,
  prepareImageForAiAnalysis,
  renderAiBaseStage,
  renderStageCompositeWithLayers,
} from "../utils/imageEditor";
import { getColoringDimensions } from "../utils/proceduralArt";
import {
  CARTOON_ASSETS,
  CARTOON_CATEGORIES,
  CartoonSubCategory,
  CHRISTMAS_STICKERS,
  EXPANDED_STICKER_ASSETS,
  getAlphabetStickers,
  getNumberStickers,
  getSymbolStickers,
  NEW_YEAR_STICKERS,
  POPULAR_STICKERS,
  resolveAssetDataUrl,
  STICKER_CATEGORIES,
  StickerAsset,
  StickerMode,
  StickerSubCategory,
} from "../utils/stickerLibrary";
import { readFileAsDataUrl, triggerBlobDownload, triggerDownload } from "../utils/storage";

interface AiImageEditPageProps {
  photos: PhotoItem[];
  initialPhoto: PhotoItem | null;
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onBackHome: () => void;
}

const COLORING_EDIT_PRESETS = [
  "Change the shirt to Noah's traditional old Israel robe, tunic, and waist sash in clean coloring book line art",
  "Noah အတွက် အင်္ကျီကို ရှေးခေတ် Israel ဝတ်ရုံ (Old Israel dress & sash) ဖြင့် ပြောင်းလဲပေးပါ",
  "ယုန်တကောင်ထည့်မယ်",
  "baby elephant တကောင်ထည့်မယ်",
  "နောက်ခံရှုခင်းအပင်များထည့်မယ်",
  "လိပ်ပြာတကောင်ထည့်မယ်",
  "တိမ်တွေထည့်မယ်",
  "နေမင်း ထည့်မယ်",
  "ခရုတကောင်ထည့်မယ်",
  "အိမ်တစ်လုံးထည့်မယ်",
  "Change modern clothes into an ancient biblical shepherd tunic and draped mantle",
  "Add a small olive branch in the hand in crisp black ink line art",
  "Add a subtle rainbow arch and dove in the top sky area (line art only)",
  "Add a thin decorative border frame around the coloring page",
];

const TEXT_STYLE_PRESETS: { id: TextStylePreset; label: string }[] = [
  { id: "clean", label: "Clean" },
  { id: "shadow", label: "Drop Shadow" },
  { id: "outline", label: "Outline" },
  { id: "comic-3d", label: "Comic 3D" },
  { id: "banner-pill", label: "Banner Pill" },
  { id: "ribbon-scroll", label: "Ribbon" },
  { id: "pill-box", label: "Caption Box" },
  { id: "neon", label: "Neon Glow" },
  { id: "block-3d", label: "3D Block" },
  { id: "gradient", label: "Gradient" },
  { id: "quote-bar", label: "Quote Bar" },
];

const TEXT_COLOR_SWATCHES = [
  "#111113",
  "#FFFFFF",
  "#FBBF24",
  "#EF4444",
  "#2563EB",
  "#10B981",
  "#EC4899",
  "#F97316",
  "#451A03",
];

const WHITE_CANVAS_PRESET_ID = "ready-made-white-canvas";

function buildPureWhiteDataUrl(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#FFFFFF"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createAiEditTextLayer(index: number, isColoring: boolean): TextLayer {
  return {
    id: `aitext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: index === 1 ? "Title / စာသား" : "New Caption",
    x: 50,
    y: index === 1 ? 14 : 84,
    fontSize: 58,
    fontFamily: FONT_OPTIONS[0].family,
    fontWeight: "700",
    color: isColoring ? "#111113" : "#FFFFFF",
    accentColor: isColoring ? "#111113" : "#F59E0B",
    bgColor: isColoring ? "#FFFFFF" : "#111113",
    strokeColor: isColoring ? "#FFFFFF" : "#111113",
    strokeWidth: 6,
    curve: 0,
    boundStyle: "none",
    boundPadX: 32,
    boundPadY: 16,
    boundThickness: 4,
    boundRadius: 14,
    boundColor: isColoring ? "#111113" : "#FFFFFF",
    boundFillColor: isColoring ? "#FFFFFF" : "#111113",
    boundFillOpacity: isColoring ? 0.9 : 0.25,
    stylePreset: isColoring ? "clean" : "shadow",
    align: "center",
    rotation: 0,
    letterSpacing: 0,
    opacity: 1,
  };
}

export function AiImageEditPage({
  photos,
  initialPhoto,
  onSaveNewPhoto,
  onBackHome,
}: AiImageEditPageProps) {
  const [sourcePhoto, setSourcePhoto] = useState<{
    id?: string;
    title: string;
    dataUrl: string;
    width: number;
    height: number;
    aspectRatio: string;
  } | null>(null);

  const [toolTab, setToolTab] = useState<"ai" | "stickers">("ai");
  const [stickerMode, setStickerMode] = useState<StickerMode>("sticker");
  const [stickerSubTab, setStickerSubTab] = useState<"all" | StickerSubCategory | "ai">("all");
  const [cartoonSubTab, setCartoonSubTab] = useState<"all" | CartoonSubCategory | "ai">("all");
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [glyphStyle, setGlyphStyle] = useState<GlyphStyle>("3d");
  const [aiAssetPrompt, setAiAssetPrompt] = useState("");
  const [generatingAsset, setGeneratingAsset] = useState(false);
  const [customAiAssets, setCustomAiAssets] = useState<StickerAsset[]>(() => {
    try {
      const raw = localStorage.getItem("lumina_ai_bw_stickers_v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [coloringEnabled, setColoringEnabled] = useState(true);
  const [pageSize, setPageSize] = useState<BookPageSize>("us-letter");
  const [dpi, setDpi] = useState<PrintDpi>(300);
  const [colorMode, setColorMode] = useState<ColoringColorMode>("bw");

  const [instruction, setInstruction] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editPlan, setEditPlan] = useState<AiEditPlan | null>(null);

  const [baseStage, setBaseStage] = useState<{
    baseDataUrl: string;
    width: number;
    height: number;
  } | null>(null);

  const [layers, setLayers] = useState<EditOverlayLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [stageDims, setStageDims] = useState<{ width: number; height: number }>({
    width: 440,
    height: 560,
  });

  const [showOriginalOnly, setShowOriginalOnly] = useState(false);
  const [eraserOpen, setEraserOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const coloringDims = getColoringDimensions(pageSize, dpi);
  const coloringConfig: AiEditColoringConfig = {
    enabled: coloringEnabled,
    pageSize,
    dpi,
    colorMode,
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId) || null;
  const activeTextLayer = textLayers.find((t) => t.id === activeTextId) || null;
  const baseScale = Math.min(stageDims.width, stageDims.height) / 1000;

  useEffect(() => {
    try {
      localStorage.setItem("lumina_ai_bw_stickers_v1", JSON.stringify(customAiAssets));
    } catch {
      // Ignore storage quota issues
    }
  }, [customAiAssets]);

  useEffect(() => {
    if (initialPhoto) {
      setSourcePhoto({
        id: initialPhoto.id,
        title: initialPhoto.title,
        dataUrl: initialPhoto.dataUrl,
        width: initialPhoto.width,
        height: initialPhoto.height,
        aspectRatio: initialPhoto.aspectRatio,
      });
      if (initialPhoto.pageSize) setPageSize(initialPhoto.pageSize);
      if (initialPhoto.dpi === 300 || initialPhoto.dpi === 350) setDpi(initialPhoto.dpi);
      if (initialPhoto.colorMode) setColorMode(initialPhoto.colorMode);
      setEditPlan(null);
      setLayers([]);
      setActiveLayerId(null);
      setTextLayers([]);
      setActiveTextId(null);
      setErrorMsg(null);
      setNoticeMsg(null);
    }
  }, [initialPhoto]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        setStageDims({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(el);
    return () => obs.disconnect();
  }, [baseStage, showOriginalOnly]);

  // Render base stage whenever sourcePhoto, editPlan, or print format changes
  useEffect(() => {
    if (!sourcePhoto) {
      setBaseStage(null);
      return;
    }
    let active = true;
    const cfg: AiEditColoringConfig = {
      enabled: coloringEnabled,
      pageSize,
      dpi,
      colorMode,
    };
    renderAiBaseStage(sourcePhoto.dataUrl, editPlan, cfg)
      .then((res) => {
        if (active) {
          setBaseStage({
            baseDataUrl: res.baseDataUrl,
            width: res.width,
            height: res.height,
          });
        }
      })
      .catch(() => {
        // Keep previous base stage if transient error
      });
    return () => {
      active = false;
    };
  }, [sourcePhoto, editPlan, coloringEnabled, pageSize, dpi, colorMode]);

  const handleUploadFile = async (file: File) => {
    setErrorMsg(null);
    setNoticeMsg(null);
    try {
      const { dataUrl, width, height } = await readFileAsDataUrl(file);
      setSourcePhoto({
        title: file.name.replace(/\.[^.]+$/, "") || "Uploaded Photo",
        dataUrl,
        width,
        height,
        aspectRatio: `${width}:${height}`,
      });
      setEditPlan(null);
      setLayers([]);
      setActiveLayerId(null);
      setTextLayers([]);
      setActiveTextId(null);
      setInstruction("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to load selected image.");
    }
  };

  const handleSelectFromHall = (photo: PhotoItem) => {
    setSourcePhoto({
      id: photo.id,
      title: photo.title,
      dataUrl: photo.dataUrl,
      width: photo.width,
      height: photo.height,
      aspectRatio: photo.aspectRatio,
    });
    setEditPlan(null);
    setLayers([]);
    setActiveLayerId(null);
    setTextLayers([]);
    setActiveTextId(null);
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  const whiteCanvasDims = useMemo(
    () =>
      pageSize === "a4"
        ? { width: 1200, height: 1697, aspectRatio: "A4" }
        : { width: 1200, height: 1553, aspectRatio: "US Letter" },
    [pageSize]
  );

  const whiteCanvasDataUrl = useMemo(
    () => buildPureWhiteDataUrl(whiteCanvasDims.width, whiteCanvasDims.height),
    [whiteCanvasDims]
  );

  const handleSelectWhiteCanvas = () => {
    setSourcePhoto({
      id: WHITE_CANVAS_PRESET_ID,
      title: "Pure White Canvas",
      dataUrl: whiteCanvasDataUrl,
      width: whiteCanvasDims.width,
      height: whiteCanvasDims.height,
      aspectRatio: whiteCanvasDims.aspectRatio,
    });
    setEditPlan(null);
    setLayers([]);
    setActiveLayerId(null);
    setTextLayers([]);
    setActiveTextId(null);
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  const handleApplyAiEdit = async () => {
    if (!sourcePhoto) {
      setErrorMsg("Please upload an original image or pick one from Photo Hall first.");
      return;
    }
    if (!instruction.trim()) {
      setErrorMsg("Please enter a specific modification instruction.");
      return;
    }

    setProcessing(true);
    setErrorMsg(null);
    setNoticeMsg(null);
    setSavedToast(null);

    try {
      const analysisImageUrl = await prepareImageForAiAnalysis(sourcePhoto.dataUrl, 1280);
      const res = await fetch("/api/photo/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: analysisImageUrl,
          instruction: instruction.trim(),
          coloringConfig,
        }),
      });

      const data = (await res.json()) as {
        plan?: AiEditPlan;
        notice?: string;
        error?: string;
      };

      if (!res.ok || !data.plan) {
        throw new Error(data.error || "Unable to generate precision edit plan.");
      }

      if (data.notice) {
        setNoticeMsg(data.notice);
      }

      const stage = await renderAiBaseStage(sourcePhoto.dataUrl, data.plan, coloringConfig);
      const extractedLayers = await extractAiOverlayLayers(
        data.plan,
        stage.width,
        stage.height,
        stage.imageRect,
        instruction.trim()
      );

      setEditPlan(data.plan);
      setBaseStage({
        baseDataUrl: stage.baseDataUrl,
        width: stage.width,
        height: stage.height,
      });

      if (extractedLayers.length > 0) {
        setLayers((prev) => [...prev, ...extractedLayers]);
        setActiveLayerId(extractedLayers[extractedLayers.length - 1].id);
      }
      setShowOriginalOnly(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "AI image edit failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceAsset = (asset: StickerAsset) => {
    if (!sourcePhoto) {
      setErrorMsg("Please upload or select an image first.");
      return;
    }

    const newLayer: EditOverlayLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: asset.label,
      category: asset.mode === "cartoon" ? "cartoon" : "sticker",
      src: resolveAssetDataUrl(asset),
      x: 50 + (Math.random() * 14 - 7),
      y: 28 + (Math.random() * 14 - 7),
      widthPct: asset.defaultWidthPct,
      aspectRatio: asset.aspectRatio,
      scale: 1,
      rotation: 0,
      flipH: false,
      opacity: 1,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setShowOriginalOnly(false);
    setErrorMsg(null);
  };

  const handleGenerateAiAsset = async () => {
    const trimmed = aiAssetPrompt.trim();
    if (!trimmed) {
      setErrorMsg(`Enter a ${stickerMode} idea to generate in pure Black & White.`);
      return;
    }

    setGeneratingAsset(true);
    setErrorMsg(null);
    setNoticeMsg(null);
    try {
      const res = await fetch("/api/sticker/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          kind: stickerMode,
        }),
      });
      const data = (await res.json()) as { asset?: StickerAsset; error?: string };
      if (!res.ok || !data.asset) {
        throw new Error(data.error || "Unable to generate black-and-white illustration.");
      }

      setCustomAiAssets((prev) => [data.asset!, ...prev]);
      setAiAssetPrompt("");
      if (stickerMode === "sticker") {
        setStickerSubTab("ai");
      } else {
        setCartoonSubTab("ai");
      }
      if (sourcePhoto) {
        handlePlaceAsset(data.asset);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setGeneratingAsset(false);
    }
  };

  const handleRemoveCustomAiAsset = (id: string) => {
    setCustomAiAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const updateActiveLayer = (patch: Partial<EditOverlayLayer>) => {
    if (!activeLayerId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayerId ? { ...l, ...patch } : l))
    );
  };

  const handleDuplicateActiveLayer = () => {
    if (!activeLayer) return;
    const copy: EditOverlayLayer = {
      ...activeLayer,
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${activeLayer.label} (Copy)`,
      x: Math.min(92, activeLayer.x + 6),
      y: Math.min(92, activeLayer.y + 6),
    };
    setLayers((prev) => [...prev, copy]);
    setActiveLayerId(copy.id);
  };

  const handleDeleteLayer = (id: string) => {
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(next[next.length - 1]?.id || null);
      }
      return next;
    });
  };

  const handleMoveLayerOrder = (direction: "up" | "down") => {
    if (!activeLayerId) return;
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === activeLayerId);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const handleAddTextLayer = () => {
    if (!sourcePhoto) {
      setErrorMsg("Please upload or select an image first.");
      return;
    }
    const next = createAiEditTextLayer(textLayers.length + 1, coloringEnabled);
    setTextLayers((prev) => [...prev, next]);
    setActiveTextId(next.id);
    setActiveLayerId(null);
    setShowOriginalOnly(false);
    setErrorMsg(null);
  };

  const updateActiveTextLayer = (patch: Partial<TextLayer>) => {
    const targetId = activeTextLayer?.id || textLayers[0]?.id;
    if (!targetId) return;
    setTextLayers((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, ...patch } : t))
    );
  };

  const handleDuplicateTextLayer = () => {
    const target = activeTextLayer || textLayers[0];
    if (!target) return;
    const copy: TextLayer = {
      ...target,
      id: `aitext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(92, target.x + 4),
      y: Math.min(92, target.y + 6),
    };
    setTextLayers((prev) => [...prev, copy]);
    setActiveTextId(copy.id);
  };

  const handleDeleteTextLayer = (id: string) => {
    setTextLayers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTextId === id) {
        setActiveTextId(next[next.length - 1]?.id || null);
      }
      return next;
    });
  };

  const handleSelectObject = (layerId: string) => {
    setActiveLayerId(layerId);
    setActiveTextId(null);
  };

  const handleSelectText = (layerId: string) => {
    setActiveTextId(layerId);
    setActiveLayerId(null);
  };

  const renderFinalComposite = async () => {
    if (!sourcePhoto || !baseStage) {
      throw new Error("No active image on stage.");
    }
    return renderStageCompositeWithLayers(
      baseStage.baseDataUrl,
      baseStage.width,
      baseStage.height,
      layers,
      coloringConfig,
      textLayers
    );
  };

  const handleBakeAndContinue = async () => {
    if (!sourcePhoto || !baseStage) return;
    setExporting(true);
    try {
      const baked = await renderFinalComposite();
      setSourcePhoto({
        ...sourcePhoto,
        title: `${sourcePhoto.title} · Step`,
        dataUrl: baked.dataUrl,
        width: baked.width,
        height: baked.height,
        aspectRatio: coloringEnabled ? (pageSize === "a4" ? "A4" : "US Letter") : sourcePhoto.aspectRatio,
      });
      setEditPlan(null);
      setLayers([]);
      setActiveLayerId(null);
      setTextLayers([]);
      setActiveTextId(null);
      setInstruction("");
      setSavedToast("Baked all layers & text into base image — ready for more edits!");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToPhotoHall = async () => {
    if (!sourcePhoto || !baseStage) return;
    setExporting(true);
    try {
      const finalImg = await renderFinalComposite();
      const now = Date.now();
      const item: PhotoItem = {
        id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: `${sourcePhoto.title} (Edited)`,
        prompt:
          instruction.trim() ||
          editPlan?.editSummary ||
          `Manual & Sticker Edit (${layers.length} layers)`,
        dataUrl: finalImg.dataUrl,
        width: finalImg.width,
        height: finalImg.height,
        aspectRatio: coloringEnabled
          ? pageSize === "a4"
            ? "A4"
            : "US Letter"
          : sourcePhoto.aspectRatio,
        mood: coloringEnabled
          ? colorMode === "bw"
            ? "B&W Line Art"
            : "Grayscale Line Art"
          : "AI & Sticker Edit",
        dpi: coloringEnabled ? dpi : undefined,
        pageSize: coloringEnabled ? pageSize : undefined,
        colorMode: coloringEnabled ? colorMode : undefined,
        isColoringPage: coloringEnabled,
        kind: coloringEnabled ? "coloring" : "edited",
        createdAt: now,
        updatedAt: now,
      };
      await onSaveNewPhoto(item);
      setSavedToast("Saved Coloring Book edited page to Photo Hall.");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!sourcePhoto || !baseStage) return;
    setExporting(true);
    try {
      const finalImg = await renderFinalComposite();
      triggerDownload(
        finalImg.dataUrl,
        `${sourcePhoto.title || "lumina"}-${coloringEnabled ? `coloring-${dpi}dpi` : "edited"}.png`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!sourcePhoto || !baseStage) return;
    setExporting(true);
    try {
      const finalImg = await renderFinalComposite();
      const now = Date.now();
      const tempItem: PhotoItem = {
        id: `temp-${now}`,
        title: `${sourcePhoto.title} (Edited)`,
        prompt: instruction.trim(),
        dataUrl: finalImg.dataUrl,
        width: finalImg.width,
        height: finalImg.height,
        aspectRatio: coloringEnabled
          ? pageSize === "a4"
            ? "A4"
            : "US Letter"
          : sourcePhoto.aspectRatio,
        dpi: coloringEnabled ? dpi : undefined,
        pageSize: coloringEnabled ? pageSize : undefined,
        colorMode: coloringEnabled ? colorMode : undefined,
        isColoringPage: coloringEnabled,
        kind: coloringEnabled ? "coloring" : "edited",
        createdAt: now,
        updatedAt: now,
      };
      const blob = await exportSinglePhotoAsPdf(tempItem, pageSize);
      triggerBlobDownload(blob, `${sourcePhoto.title || "ai-coloring-edit"}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const alphabetAssets = useMemo(() => getAlphabetStickers(glyphStyle), [glyphStyle]);
  const numberAssets = useMemo(() => getNumberStickers(glyphStyle), [glyphStyle]);
  const symbolAssets = useMemo(() => getSymbolStickers(), []);

  const aiStickerAssets = useMemo(
    () => customAiAssets.filter((a) => a.mode === "sticker"),
    [customAiAssets]
  );
  const aiCartoonAssets = useMemo(
    () => customAiAssets.filter((a) => a.mode === "cartoon"),
    [customAiAssets]
  );

  const allStickersCatalog = useMemo<StickerAsset[]>(
    () => [
      ...EXPANDED_STICKER_ASSETS,
      ...POPULAR_STICKERS,
      ...CHRISTMAS_STICKERS,
      ...NEW_YEAR_STICKERS,
      ...alphabetAssets,
      ...numberAssets,
      ...symbolAssets,
    ],
    [alphabetAssets, numberAssets, symbolAssets]
  );

  const stickerCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allStickersCatalog.length,
      alphabet: alphabetAssets.length,
      numbers: numberAssets.length,
      symbols: symbolAssets.length,
      christmas: CHRISTMAS_STICKERS.length,
      "new-year": NEW_YEAR_STICKERS.length,
      popular: POPULAR_STICKERS.length,
      ai: aiStickerAssets.length,
    };
    for (const item of EXPANDED_STICKER_ASSETS) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [allStickersCatalog.length, alphabetAssets.length, numberAssets.length, symbolAssets.length, aiStickerAssets.length]);

  const cartoonCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: CARTOON_ASSETS.length,
      ai: aiCartoonAssets.length,
    };
    for (const item of CARTOON_ASSETS) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [aiCartoonAssets.length]);

  const ASSET_PAGE_SIZE = 24;

  const filteredAssets: StickerAsset[] = useMemo(() => {
    const trimmedSearch = assetSearchQuery.trim().toLowerCase();
    const terms = trimmedSearch ? trimmedSearch.split(/\s+/).filter(Boolean) : [];

    if (terms.length > 0) {
      const pool =
        stickerMode === "sticker"
          ? [...aiStickerAssets, ...allStickersCatalog]
          : [...aiCartoonAssets, ...CARTOON_ASSETS];
      return pool.filter((asset) => {
        const haystack = `${asset.label} ${asset.category} ${asset.keywords || ""} ${asset.id}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }

    if (stickerMode === "sticker") {
      switch (stickerSubTab) {
        case "all":
          return allStickersCatalog;
        case "alphabet":
          return alphabetAssets;
        case "numbers":
          return numberAssets;
        case "symbols":
          return symbolAssets;
        case "christmas":
          return CHRISTMAS_STICKERS;
        case "new-year":
          return NEW_YEAR_STICKERS;
        case "popular":
          return POPULAR_STICKERS;
        case "ai":
          return aiStickerAssets;
        default:
          return EXPANDED_STICKER_ASSETS.filter((item) => item.category === stickerSubTab);
      }
    }

    if (cartoonSubTab === "ai") return aiCartoonAssets;
    if (cartoonSubTab === "all") return CARTOON_ASSETS;
    return CARTOON_ASSETS.filter((c) => c.category === cartoonSubTab);
  }, [
    assetSearchQuery,
    stickerMode,
    stickerSubTab,
    cartoonSubTab,
    allStickersCatalog,
    alphabetAssets,
    numberAssets,
    symbolAssets,
    aiStickerAssets,
    aiCartoonAssets,
  ]);

  const totalAssetPages = Math.max(1, Math.ceil(filteredAssets.length / ASSET_PAGE_SIZE));
  const safeAssetPage = Math.min(assetPage, totalAssetPages);
  const paginatedAssets = useMemo(() => {
    const start = (safeAssetPage - 1) * ASSET_PAGE_SIZE;
    return filteredAssets.slice(start, start + ASSET_PAGE_SIZE);
  }, [filteredAssets, safeAssetPage]);

  useEffect(() => {
    setAssetPage(1);
  }, [stickerMode, stickerSubTab, cartoonSubTab, assetSearchQuery]);

  const getTextPreviewStyle = (layer: TextLayer): React.CSSProperties => {
    const pxFont = Math.max(10, layer.fontSize * baseScale);
    const base: React.CSSProperties = {
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
      fontSize: `${pxFont}px`,
      textAlign: layer.align,
      letterSpacing: `${layer.letterSpacing * baseScale}px`,
      opacity: layer.opacity,
      color: layer.color,
      whiteSpace: "pre-wrap",
      lineHeight: 1.2,
    };

    if (layer.stylePreset === "shadow") {
      base.textShadow = `0 ${4 * baseScale}px ${14 * baseScale}px rgba(0,0,0,0.68)`;
    } else if (layer.stylePreset === "neon") {
      base.textShadow = `0 0 ${12 * baseScale}px ${layer.accentColor}, 0 0 ${26 * baseScale}px ${layer.accentColor}`;
    } else if (layer.stylePreset === "outline") {
      base.WebkitTextStroke = `${Math.max(1.5, pxFont * 0.08)}px ${layer.accentColor}`;
      base.paintOrder = "stroke fill";
    } else if (layer.stylePreset === "pill-box") {
      base.backgroundColor = layer.bgColor;
      base.padding = `${pxFont * 0.28}px ${pxFont * 0.55}px`;
      base.borderRadius = `${Math.min(18, pxFont * 0.45)}px`;
    } else if (layer.stylePreset === "banner-pill") {
      base.backgroundColor = layer.bgColor;
      base.padding = `${pxFont * 0.34}px ${pxFont * 0.85}px`;
      base.borderRadius = "9999px";
      base.border = `${Math.max(1.5, (layer.strokeWidth ?? 4) * baseScale)}px solid ${layer.strokeColor || layer.accentColor}`;
      base.boxShadow = `0 ${6 * baseScale}px ${16 * baseScale}px rgba(0,0,0,0.42)`;
    } else if (layer.stylePreset === "ribbon-scroll") {
      base.backgroundColor = layer.bgColor;
      base.padding = `${pxFont * 0.32}px ${pxFont * 0.95}px`;
      base.borderRadius = "9999px";
      base.border = `${Math.max(1.5, (layer.strokeWidth ?? 3) * baseScale)}px solid ${layer.strokeColor || layer.accentColor}`;
      base.boxShadow = `0 ${4 * baseScale}px ${12 * baseScale}px rgba(0,0,0,0.3)`;
    } else if (layer.stylePreset === "block-3d") {
      const off = Math.max(2, pxFont * 0.08);
      base.textShadow = `${off}px ${off}px 0px ${layer.accentColor}`;
    } else if (layer.stylePreset === "gradient") {
      base.backgroundImage = `linear-gradient(135deg, ${layer.color}, ${layer.accentColor})`;
      base.WebkitBackgroundClip = "text";
      base.WebkitTextFillColor = "transparent";
      base.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.35))";
    } else if (layer.stylePreset === "comic-3d") {
      const strokePx = Math.max(2, (layer.strokeWidth ?? 10) * baseScale);
      const sCol = layer.strokeColor || "#111113";
      const drop = Math.max(2, pxFont * 0.085);
      base.WebkitTextStroke = `${strokePx}px ${sCol}`;
      base.paintOrder = "stroke fill";
      base.textShadow = `0 ${drop}px 0 ${sCol}`;
    } else if (layer.stylePreset === "quote-bar") {
      base.borderLeft = layer.align !== "right" ? `4px solid ${layer.accentColor}` : undefined;
      base.borderRight = layer.align === "right" ? `4px solid ${layer.accentColor}` : undefined;
      base.paddingLeft = layer.align !== "right" ? "10px" : undefined;
      base.paddingRight = layer.align === "right" ? "10px" : undefined;
    }

    return base;
  };

  const renderTextPreviewContent = (layer: TextLayer) => {
    const txt = layer.text || "Type text...";
    const curve = layer.curve ?? 0;
    const hasMyanmar = /[\u1000-\u109F]/.test(txt);

    const inner =
      Math.abs(curve) >= 2 && !hasMyanmar && !txt.includes("\n") && txt.length > 2 ? (
        <span className="inline-flex items-center justify-center whitespace-pre">
          {Array.from(txt).map((ch, idx, arr) => {
            const norm = arr.length > 1 ? idx / (arr.length - 1) - 0.5 : 0;
            const angleDeg = norm * (curve * 1.4);
            const dropPx = (norm * norm * 4) * (curve * 0.65) * baseScale * 1.6;
            return (
              <span
                key={idx}
                className="inline-block"
                style={{
                  transform: `translateY(${dropPx}px) rotate(${angleDeg}deg)`,
                  ...(layer.stylePreset === "comic-3d"
                    ? {
                        backgroundImage: `linear-gradient(180deg, ${layer.color}, ${layer.accentColor})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : {}),
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            );
          })}
        </span>
      ) : (
        txt
      );

    if (layer.stylePreset === "comic-3d") {
      const strokePx = Math.max(2, (layer.strokeWidth ?? 10) * baseScale);
      const sCol = layer.strokeColor || "#111113";
      const drop = Math.max(2, layer.fontSize * baseScale * 0.085);
      return (
        <span className="relative inline-block">
          <span
            aria-hidden="true"
            className="block"
            style={{
              WebkitTextStroke: `${strokePx}px ${sCol}`,
              color: sCol,
              textShadow: `0 ${drop}px 0 ${sCol}`,
            }}
          >
            {inner}
          </span>
          <span
            className="absolute inset-0 block"
            style={{
              backgroundImage: `linear-gradient(180deg, ${layer.color}, ${layer.accentColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {inner}
          </span>
        </span>
      );
    }

    if (layer.stylePreset === "ribbon-scroll") {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="text-emerald-700 text-[0.75em]">🌿</span>
          <span>{inner}</span>
          <span className="text-emerald-700 text-[0.75em]">🌿</span>
        </span>
      );
    }

    return inner;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16 space-y-10">
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
            04. AI Coloring Book Editor & Manual Studio
          </h1>
          <p className="text-sm text-zinc-600 max-w-2xl">
            AI ဖြင့်ထည့်သွင်းပေးသော အရာဝတ္ထုများ (ဥပမာ နေမင်း၊ ယုန်) ကို ပုံပေါ်တွင် ကိုယ်တိုင် Drag ဆွဲ၍ ဘယ်/ညာ ရွှေ့ပြောင်းခြင်း၊ Size/Rotate ချိန်ညှိခြင်းနှင့် B&W Coloring Cartoon / Sticker များ ထပ်ပေါင်းထည့်နိုင်ပါသည်။
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUploadFile(file);
            e.target.value = "";
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Original Image</span>
        </button>
      </div>

      {/* Main Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: AI Edit + Pure B&W Sticker/Cartoon Drawer */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          {/* Quick Select from Photo Hall */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">
                Source Image ({sourcePhoto ? `${sourcePhoto.width}×${sourcePhoto.height}` : "None selected"})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Choose File
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {/* Ready-Made Pure White Image */}
              <button
                type="button"
                onClick={handleSelectWhiteCanvas}
                title="Ready-Made Pure White Image (#FFFFFF)"
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center ${
                  sourcePhoto?.id === WHITE_CANVAS_PRESET_ID
                    ? "border-blue-600 ring-2 ring-blue-600/20"
                    : "border-zinc-300 hover:border-zinc-500"
                }`}
              >
                <span className="w-6 h-4 rounded-sm border border-zinc-200 bg-white block mb-0.5" />
                <span className="text-[10px] font-semibold text-zinc-700 leading-none">
                  White
                </span>
              </button>

              {photos.slice(0, 8).map((p) => {
                const selected = sourcePhoto?.dataUrl === p.dataUrl;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectFromHall(p)}
                    title={p.title}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selected ? "border-blue-600 ring-2 ring-blue-600/20" : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={p.dataUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Tool Tabs: AI Edit | Stickers */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setToolTab("ai")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolTab === "ai"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setToolTab("stickers")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolTab === "stickers"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Sticker className="w-3.5 h-3.5" />
              <span>Stickers</span>
            </button>
          </div>

          {toolTab === "ai" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-600 leading-relaxed">
                  AI ဖြင့် ထည့်ပေးသော အရာဝတ္ထုများ (ဥပမာ နေမင်း၊ ယုန်) သည် Movable Layer အဖြစ် ပေါ်လာမည်ဖြစ်၍ ညာဘက်ပုံပေါ်တွင် Drag ဆွဲပြီး နေရာရွှေ့ပြင်နိုင်ပါသည်။
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="ai-edit-instruction" className="text-sm font-semibold text-zinc-950 block">
                  Edit Instruction (English / မြန်မာ)
                </label>
                <textarea
                  id="ai-edit-instruction"
                  rows={3}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="ဥပမာ — နေမင်း ထည့်မယ်... ယုန်တကောင်ထည့်မယ်... Noah အတွက် Old Israel dress ပြောင်းပေးပါ..."
                  className="w-full p-3.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-zinc-500 block">Quick Coloring Edits</span>
                <div className="flex flex-wrap gap-1.5">
                  {COLORING_EDIT_PRESETS.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setInstruction(sample)}
                      className="px-2.5 py-1.5 text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer text-left truncate max-w-full"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={processing || !sourcePhoto}
                onClick={handleApplyAiEdit}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Movable Object...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Apply AI Edit</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* 2-Tab Mode Switcher: Stickers | Cartoons (Pure B&W, Zero Emojis) */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStickerMode("sticker")}
                  className={`min-h-[36px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors tabular-nums ${
                    stickerMode === "sticker"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <span>B&amp;W Stickers ({allStickersCatalog.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStickerMode("cartoon")}
                  className={`min-h-[36px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors tabular-nums ${
                    stickerMode === "cartoon"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <span>B&amp;W Cartoons ({CARTOON_ASSETS.length})</span>
                </button>
              </div>

              {/* Live AI B&W Sticker / Cartoon Generator */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      AI {stickerMode === "sticker" ? "Coloring Sticker" : "Coloring Cartoon"} Generator
                    </span>
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500">Pure B&amp;W</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={aiAssetPrompt}
                    onChange={(e) => setAiAssetPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !generatingAsset) {
                        e.preventDefault();
                        handleGenerateAiAsset();
                      }
                    }}
                    placeholder={
                      stickerMode === "sticker"
                        ? "e.g., Cute panda with star, Christmas bell..."
                        : "e.g., Baby lion in jungle, cozy treehouse..."
                    }
                    className="flex-1 min-w-0 px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    disabled={generatingAsset}
                    onClick={handleGenerateAiAsset}
                    className="shrink-0 min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {generatingAsset ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Drawing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  placeholder={
                    stickerMode === "sticker"
                      ? `Search ${allStickersCatalog.length} stickers (pizza, sun, rocket, A–Z)...`
                      : `Search ${CARTOON_ASSETS.length} cartoons (bunny, dragon, castle, train)...`
                  }
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {assetSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAssetSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sub-category Filters (hidden only while actively searching across all items) */}
              {assetSearchQuery.trim() ? (
                <div className="flex items-center justify-between text-[11px] text-zinc-600 px-1">
                  <span className="tabular-nums">
                    Found <strong>{filteredAssets.length}</strong>{" "}
                    {stickerMode === "sticker" ? "stickers" : "cartoons"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAssetSearchQuery("")}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Back to categories
                  </button>
                </div>
              ) : stickerMode === "sticker" ? (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                    {STICKER_CATEGORIES.map((cat) => {
                      const active = stickerSubTab === cat.id;
                      const count = stickerCategoryCounts[cat.id] ?? 0;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setStickerSubTab(cat.id)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                            active
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          {cat.label} ({count})
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setStickerSubTab("ai")}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        stickerSubTab === "ai"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      AI ({aiStickerAssets.length})
                    </button>
                  </div>

                  {/* 4-Style Switcher for English Alphabets (A–Z) and Numbers (0–10) */}
                  {(stickerSubTab === "alphabet" || stickerSubTab === "numbers") && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-zinc-500 block">
                        Letter &amp; Number Style
                      </span>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-lg">
                        {(
                          [
                            { id: "3d", label: "3D" },
                            { id: "handwriting", label: "Handwriting" },
                            { id: "dot", label: "Dot" },
                            { id: "sticker", label: "Sticker" },
                          ] as const
                        ).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setGlyphStyle(st.id)}
                            className={`min-h-[30px] px-1.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                              glyphStyle === st.id
                                ? "bg-white text-zinc-950 shadow-sm"
                                : "text-zinc-600 hover:text-zinc-950"
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                  {CARTOON_CATEGORIES.map((cat) => {
                    const active = cartoonSubTab === cat.id;
                    const count = cartoonCategoryCounts[cat.id] ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCartoonSubTab(cat.id)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                          active
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {cat.label} ({count})
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCartoonSubTab("ai")}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      cartoonSubTab === "ai"
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    AI ({aiCartoonAssets.length})
                  </button>
                </div>
              )}

              {/* Asset Grid (Paginated 24 items/page for instant B&W SVG preview) */}
              {paginatedAssets.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 space-y-2">
                  <p className="text-xs font-semibold text-zinc-800">
                    {assetSearchQuery.trim()
                      ? `No ${stickerMode === "sticker" ? "stickers" : "cartoons"} match "${assetSearchQuery.trim()}"`
                      : `No AI ${stickerMode === "sticker" ? "stickers" : "cartoons"} generated yet`}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {assetSearchQuery.trim()
                      ? "Try another keyword or clear search to browse all categories."
                      : `Type any idea above and click Generate to create a pure black-and-white coloring ${stickerMode}.`}
                  </p>
                  {assetSearchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setAssetSearchQuery("")}
                      className="px-3 py-1.5 text-[11px] font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div
                    className={`grid gap-2 max-h-80 overflow-y-auto pr-1 ${
                      stickerMode === "sticker" &&
                      !assetSearchQuery.trim() &&
                      (stickerSubTab === "alphabet" ||
                        stickerSubTab === "numbers" ||
                        stickerSubTab === "symbols")
                        ? "grid-cols-4"
                        : "grid-cols-3"
                    }`}
                  >
                    {paginatedAssets.map((asset) => {
                      const isAiSaved = asset.id.startsWith("ai-");
                      return (
                        <div key={asset.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => handlePlaceAsset(asset)}
                            title={asset.label}
                            className="w-full p-2 rounded-xl border border-zinc-200 bg-white hover:border-zinc-950 hover:shadow-sm transition-all cursor-pointer flex flex-col items-center gap-1"
                          >
                            <img
                              src={resolveAssetDataUrl(asset)}
                              alt={asset.label}
                              className="w-12 h-12 object-contain"
                            />
                            <span className="text-[10px] font-medium text-zinc-700 text-center leading-tight line-clamp-1 w-full">
                              {asset.label}
                            </span>
                          </button>
                          {isAiSaved && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomAiAsset(asset.id);
                              }}
                              title={`Delete ${asset.label}`}
                              aria-label={`Delete ${asset.label}`}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-1 right-1 p-1 rounded-md bg-white/95 border border-zinc-200 text-zinc-500 hover:text-red-600 cursor-pointer transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  {filteredAssets.length > ASSET_PAGE_SIZE && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100">
                      <button
                        type="button"
                        disabled={safeAssetPage <= 1}
                        onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="text-[11px] font-medium text-zinc-500 tabular-nums text-center">
                        {(safeAssetPage - 1) * ASSET_PAGE_SIZE + 1}–
                        {Math.min(safeAssetPage * ASSET_PAGE_SIZE, filteredAssets.length)} of{" "}
                        {filteredAssets.length} · Pg {safeAssetPage}/{totalAssetPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeAssetPage >= totalAssetPages}
                        onClick={() => setAssetPage((p) => Math.min(totalAssetPages, p + 1))}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-zinc-500">
                All {allStickersCatalog.length} stickers &amp; {CARTOON_ASSETS.length} cartoons are pure black-and-white coloring line art. Tap any item to place it onto the canvas.
              </p>
            </div>
          )}

          {/* Coloring Book Print Settings */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800">Coloring Book Output</span>
              <div className="flex gap-1 p-0.5 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setColoringEnabled(true)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                    coloringEnabled ? "bg-zinc-950 text-white" : "text-zinc-600"
                  }`}
                >
                  300+ DPI ON
                </button>
                <button
                  type="button"
                  onClick={() => setColoringEnabled(false)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                    !coloringEnabled ? "bg-zinc-950 text-white" : "text-zinc-600"
                  }`}
                >
                  Photo Mode
                </button>
              </div>
            </div>

            {coloringEnabled && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-1.5">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as BookPageSize)}
                    aria-label="Page size"
                    className="px-2 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
                  >
                    <option value="us-letter">US Letter</option>
                    <option value="a4">A4 Size</option>
                  </select>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value) as PrintDpi)}
                    aria-label="Print resolution"
                    className="px-2 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
                  >
                    <option value={300}>300 DPI</option>
                    <option value={350}>350 DPI</option>
                  </select>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as ColoringColorMode)}
                    aria-label="Color mode"
                    className="px-2 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
                  >
                    <option value="bw">Black & White</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>
                <div className="text-[11px] text-zinc-500 tabular-nums">
                  Print Canvas: {coloringDims.width} × {coloringDims.height} px · {coloringDims.physicalLabel}
                </div>
              </div>
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

          {savedToast && (
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{savedToast}</span>
            </p>
          )}
        </div>

        {/* Right Panel: Word-Style Text & Bound Ribbon Banner + Interactive Stage */}
        <div className="lg:col-span-8 space-y-4">
          <TextBoundRibbon
            layers={textLayers}
            activeLayerId={activeTextId}
            onSelectLayer={handleSelectText}
            onAddLayer={handleAddTextLayer}
            onDuplicateLayer={handleDuplicateTextLayer}
            onDeleteLayer={handleDeleteTextLayer}
            onUpdateLayer={updateActiveTextLayer}
            stylePresets={TEXT_STYLE_PRESETS}
            colorSwatches={TEXT_COLOR_SWATCHES}
            disabled={!sourcePhoto}
            defaultBoundColor={coloringEnabled ? "#111113" : "#FFFFFF"}
            defaultBoundFillColor={coloringEnabled ? "#FFFFFF" : "#111113"}
            defaultBoundFillOpacity={coloringEnabled ? 0.9 : 0.25}
          />

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-zinc-950">
                  Interactive Edit Stage
                </span>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {layers.length} {layers.length === 1 ? "object" : "objects"} · {textLayers.length} {textLayers.length === 1 ? "text" : "texts"} · Tap to select
                </span>
              </div>

              {sourcePhoto && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEraserOpen(true)}
                    className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Select & Erase</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOriginalOnly((v) => !v)}
                    className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                      showOriginalOnly
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showOriginalOnly ? "Viewing Original" : "Compare Original"}</span>
                  </button>
                  {(layers.length > 0 || textLayers.length > 0 || editPlan) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditPlan(null);
                        setLayers([]);
                        setActiveLayerId(null);
                        setTextLayers([]);
                        setActiveTextId(null);
                      }}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 rounded-lg border border-zinc-200 hover:border-zinc-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Edits</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Stage Surface */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  handleUploadFile(file);
                }
              }}
              className="min-h-[380px] bg-[#141416] rounded-xl flex items-center justify-center p-4 overflow-hidden"
            >
              {processing ? (
                <div className="text-center space-y-3 text-zinc-300">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                  <p className="text-sm font-medium">
                    Analyzing image & generating movable coloring object...
                  </p>
                </div>
              ) : !sourcePhoto || !baseStage ? (
                <div className="text-center space-y-3 max-w-sm text-zinc-400 px-4">
                  <Upload className="w-8 h-8 mx-auto opacity-60" />
                  <p className="text-sm font-medium text-zinc-200">
                    Upload an Original Image
                  </p>
                  <p className="text-xs leading-relaxed">
                    Drag and drop a photo here, click Upload Original Image, or pick one from the top strip. Add AI objects, B&amp;W cartoons, or coloring stickers and drag them anywhere.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[40px] px-4 py-2 text-xs font-semibold text-zinc-950 bg-white rounded-lg hover:bg-zinc-200 cursor-pointer"
                    >
                      Select Photo from Device
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectWhiteCanvas}
                      className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 cursor-pointer"
                    >
                      Use Pure White Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  ref={stageRef}
                  onClick={() => {
                    setActiveLayerId(null);
                    setActiveTextId(null);
                  }}
                  className="relative max-h-[480px] w-full max-w-[440px] mx-auto bg-white rounded shadow-xl overflow-hidden select-none touch-none"
                  style={{
                    aspectRatio: `${baseStage.width} / ${baseStage.height}`,
                  }}
                >
                  <img
                    src={showOriginalOnly ? sourcePhoto.dataUrl : baseStage.baseDataUrl}
                    alt={sourcePhoto.title}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                    style={{
                      filter:
                        !showOriginalOnly && coloringEnabled
                          ? colorMode === "bw"
                            ? "grayscale(100%) contrast(165%)"
                            : "grayscale(100%)"
                          : undefined,
                    }}
                  />

                  {/* Center Snap Guide */}
                  {!showOriginalOnly &&
                    ((activeLayer && Math.abs(activeLayer.x - 50) < 0.5) ||
                      (activeTextLayer && Math.abs(activeTextLayer.x - 50) < 0.5)) && (
                      <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-blue-400/70 z-30" />
                    )}

                  {/* Interactive Object & Sticker Layers */}
                  {!showOriginalOnly &&
                    layers.map((layer) => {
                      const isSelected = layer.id === activeLayerId;
                      return (
                        <div
                          key={layer.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectObject(layer.id);
                          }}
                          style={{
                            left: `${layer.x}%`,
                            top: `${layer.y}%`,
                            width: `${layer.widthPct * layer.scale}%`,
                            aspectRatio: `${layer.aspectRatio}`,
                            opacity: layer.opacity,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scaleX(${
                              layer.flipH ? -1 : 1
                            })`,
                          }}
                          className={`absolute cursor-pointer transition-shadow z-10 ${
                            isSelected
                              ? "ring-2 ring-blue-600 ring-offset-2 rounded bg-blue-500/5"
                              : "hover:ring-1 hover:ring-blue-400/70 rounded"
                          }`}
                        >
                          <img
                            src={layer.src}
                            alt={layer.label}
                            draggable={false}
                            className="w-full h-full object-contain pointer-events-none"
                            style={{
                              filter:
                                coloringEnabled && colorMode === "bw"
                                  ? "grayscale(100%) contrast(150%)"
                                  : coloringEnabled
                                  ? "grayscale(100%)"
                                  : undefined,
                            }}
                          />
                        </div>
                      );
                    })}

                  {/* Interactive Text Layers */}
                  {!showOriginalOnly &&
                    textLayers.map((tl) => {
                      const isSelected = tl.id === activeTextId;
                      const hasBound = Boolean(tl.boundStyle && tl.boundStyle !== "none");
                      const bPadX = (tl.boundPadX ?? 32) * baseScale;
                      const bPadY = (tl.boundPadY ?? 16) * baseScale;
                      return (
                        <div
                          key={tl.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectText(tl.id);
                          }}
                          style={{
                            left: `${tl.x}%`,
                            top: `${tl.y}%`,
                            transform: `translate(-50%, -50%) rotate(${tl.rotation}deg)`,
                          }}
                          className={`absolute cursor-pointer rounded z-20 max-w-[94%] ${
                            hasBound ? "" : "px-1.5 py-0.5"
                          } ${isSelected ? "ring-2 ring-blue-600 ring-offset-1" : "hover:ring-1 hover:ring-blue-400/70"}`}
                        >
                          <div
                            className="relative"
                            style={
                              hasBound
                                ? {
                                    padding: `${bPadY}px ${bPadX}px`,
                                  }
                                : undefined
                            }
                          >
                            {hasBound && (
                              <TextBoundSvg
                                styleType={tl.boundStyle!}
                                thickness={tl.boundThickness ?? 4}
                                radius={tl.boundRadius ?? 14}
                                strokeColor={tl.boundColor || "#111113"}
                                fillColor={tl.boundFillColor || "#FFFFFF"}
                                fillOpacity={tl.boundFillOpacity ?? 0}
                                scale={baseScale}
                              />
                            )}
                            <div className="relative z-10" style={getTextPreviewStyle(tl)}>
                              {renderTextPreviewContent(tl)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Added Objects Layer Strip */}
            {layers.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700">
                    Added Objects & Stickers (Tap to Select & Move)
                  </span>
                  <span className="text-zinc-500">
                    {activeLayer ? `Selected: ${activeLayer.label}` : "Tap an item on stage"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layers.map((l) => {
                    const selected = l.id === activeLayerId;
                    return (
                      <div
                        key={l.id}
                        className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          selected
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveLayerId(l.id)}
                          className="cursor-pointer truncate max-w-[140px]"
                        >
                          {l.label}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLayer(l.id)}
                          aria-label={`Remove ${l.label}`}
                          className={`p-0.5 rounded cursor-pointer ${
                            selected ? "hover:bg-white/20 text-zinc-300" : "hover:bg-zinc-200 text-zinc-500"
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Layer Manual Controls */}
            {activeLayer && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                    <Move className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manual Edit: {activeLayer.label}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ x: 18 })}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 cursor-pointer"
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ x: 50 })}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 cursor-pointer"
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ x: 82 })}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 cursor-pointer"
                    >
                      Right
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ flipH: !activeLayer.flipH })}
                      title="Flip Horizontal"
                      className={`p-1.5 rounded border cursor-pointer ${
                        activeLayer.flipH
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <FlipHorizontal2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateActiveLayer}
                      title="Duplicate"
                      className="p-1.5 rounded bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLayerOrder("up")}
                      title="Bring Forward"
                      className="p-1.5 rounded bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLayerOrder("down")}
                      title="Send Backward"
                      className="p-1.5 rounded bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLayer(activeLayer.id)}
                      title="Delete Object"
                      className="p-1.5 rounded bg-white text-red-600 border border-zinc-200 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StepperControl
                    compact
                    label="Horizontal (Left ↔ Right)"
                    value={Math.round(activeLayer.x)}
                    min={4}
                    max={96}
                    step={2}
                    unit="%"
                    onChange={(val) => updateActiveLayer({ x: val })}
                  />
                  <StepperControl
                    compact
                    label="Vertical (Top ↕ Bottom)"
                    value={Math.round(activeLayer.y)}
                    min={4}
                    max={96}
                    step={2}
                    unit="%"
                    onChange={(val) => updateActiveLayer({ y: val })}
                  />
                  <StepperControl
                    compact
                    label="Size / Scale"
                    value={Math.round(activeLayer.scale * 100)}
                    min={25}
                    max={250}
                    step={5}
                    unit="%"
                    onChange={(val) => updateActiveLayer({ scale: val / 100 })}
                  />
                  <StepperControl
                    compact
                    label="Rotation"
                    value={activeLayer.rotation}
                    min={-180}
                    max={180}
                    step={5}
                    unit="°"
                    onChange={(val) => updateActiveLayer({ rotation: val })}
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            {sourcePhoto && baseStage && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={exporting}
                  onClick={handleBakeAndContinue}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Bake & Continue Editing</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={handleSaveToPhotoHall}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Save to Photo Hall</span>
                  </button>
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={handleDownloadPdf}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exporting ? "Exporting..." : "Download PDF"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={handleDownloadPng}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Workflow Audit Trail */}
          {editPlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Step 1 · Image Analysis
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">{editPlan.analysis}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Step 2 · Object Added
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">{editPlan.editSummary}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Step 3 · Integrity Preserved
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed">
                  {editPlan.preservedIntegrityNote}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <ImageRegionEraserModal
        open={eraserOpen}
        imageSrc={baseStage?.baseDataUrl || sourcePhoto?.dataUrl || null}
        title={`Select & Erase · ${sourcePhoto?.title || "Image"}`}
        defaultFillMode={coloringEnabled ? "white" : "smart-fill"}
        onClose={() => setEraserOpen(false)}
        onApply={(newDataUrl, width, height) => {
          if (!sourcePhoto) return;
          setSourcePhoto({
            ...sourcePhoto,
            dataUrl: newDataUrl,
            width,
            height,
            aspectRatio: `${width}:${height}`,
          });
          setEditPlan(null);
          setSavedToast("Erased selected area from image.");
          setTimeout(() => setSavedToast(null), 3000);
        }}
      />
    </div>
  );
}
