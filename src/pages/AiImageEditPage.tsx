import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eraser,
  Eye,
  EyeOff,
  FilePlus2,
  FileText,
  FlipHorizontal2,
  Frame,
  Grid,
  Layers,
  LayoutTemplate,
  Loader2,
  Lock,
  MousePointer2,
  Move,
  PenTool,
  Redo2,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sticker,
  Trash2,
  Undo2,
  Unlock,
  Upload,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageRegionEraserModal } from "../components/ImageRegionEraserModal";
import { StepperControl } from "../components/StepperControl";
import { TextBoundRibbon } from "../components/TextBoundRibbon";
import { TextBoundSvg } from "../components/TextBoundSvg";
import {
  AiEditColoringConfig,
  AiEditPlan,
  BookPageSize,
  CanvasDrawStroke,
  ColoringColorMode,
  EditOverlayLayer,
  PageId,
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
import {
  buildPageBorderDataUrl,
  PAGE_BORDERS,
  PageBorderId,
} from "../utils/pageBorderLibrary";
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
  onSavePhotos?: (items: PhotoItem[]) => Promise<void>;
  onSendToPage?: (page: PageId, photo: PhotoItem) => void;
  onBackHome: () => void;
}

interface EditorSnapshot {
  layers: EditOverlayLayer[];
  textLayers: TextLayer[];
  pageBorderId: PageBorderId;
  drawStrokes: CanvasDrawStroke[];
}

function buildStrokePathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + 0.1).toFixed(1)} ${(p.y + 0.1).toFixed(1)}`;
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const mx = (curr.x + next.x) / 2;
    const my = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
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

function generatePureWhitePngDataUrl(width: number, height: number): string {
  const maxDim = 4096;
  let targetW = Math.max(1, Math.round(width));
  let targetH = Math.max(1, Math.round(height));
  if (targetW > maxDim || targetH > maxDim) {
    const scale = maxDim / Math.max(targetW, targetH);
    targetW = Math.max(1, Math.round(targetW * scale));
    targetH = Math.max(1, Math.round(targetH * scale));
  }
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetW, targetH);
  }
  return canvas.toDataURL("image/png");
}

function buildPureWhitePhotoItem(
  source: Pick<PhotoItem, "title" | "width" | "height" | "aspectRatio" | "dpi" | "pageSize"> | null,
  fallbackPageSize: BookPageSize,
  fallbackDpi: PrintDpi,
  timestamp: number
): PhotoItem {
  const fallbackDims = getColoringDimensions(fallbackPageSize, fallbackDpi);
  const width = source?.width && source.width > 0 ? source.width : fallbackDims.width;
  const height = source?.height && source.height > 0 ? source.height : fallbackDims.height;
  const dataUrl = generatePureWhitePngDataUrl(width, height);
  return {
    id: `photo-white-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    title: source?.title ? `Pure White Canvas (${source.title})` : "Pure White Canvas",
    prompt: "Pure white blank canvas page (#FFFFFF) paired from AI Edit",
    dataUrl,
    width,
    height,
    aspectRatio: source?.aspectRatio || (fallbackPageSize === "a4" ? "A4" : "US Letter"),
    mood: "Pure White Canvas",
    dpi: source?.dpi ?? fallbackDpi,
    pageSize: source?.pageSize ?? fallbackPageSize,
    colorMode: "bw",
    isColoringPage: true,
    kind: "coloring",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
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
  onSavePhotos,
  onSendToPage,
  onBackHome,
}: AiImageEditPageProps) {
  const [autoSaveWhiteCanvas, setAutoSaveWhiteCanvas] = useState(true);
  const [sourcePhoto, setSourcePhoto] = useState<{
    id?: string;
    title: string;
    dataUrl: string;
    width: number;
    height: number;
    aspectRatio: string;
  } | null>(null);

  const [toolTab, setToolTab] = useState<"ai" | "stickers" | "frames">("ai");
  const [stickerMode, setStickerMode] = useState<StickerMode>("sticker");
  const [stickerSubTab, setStickerSubTab] = useState<"all" | "favorites" | "recent" | StickerSubCategory | "ai">("all");
  const [cartoonSubTab, setCartoonSubTab] = useState<"all" | "favorites" | "recent" | CartoonSubCategory | "ai">("all");
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
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("lumina_fav_assets_v1");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("lumina_recent_assets_v1");
      const parsed = raw ? JSON.parse(raw) : [];
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
  const [pageBorderId, setPageBorderId] = useState<PageBorderId>("none");
  const [drawStrokes, setDrawStrokes] = useState<CanvasDrawStroke[]>([]);
  const [activeDrawStroke, setActiveDrawStroke] = useState<CanvasDrawStroke | null>(null);
  const [canvasTool, setCanvasTool] = useState<"select" | "ink" | "whiteout">("select");
  const [brushSize, setBrushSize] = useState<number>(7);
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [showMarginGrid, setShowMarginGrid] = useState<boolean>(false);

  const [historyPast, setHistoryPast] = useState<EditorSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorSnapshot[]>([]);

  const [snapGuides, setSnapGuides] = useState({
    vCenter: false,
    hCenter: false,
    leftMargin: false,
    rightMargin: false,
    topMargin: false,
    bottomMargin: false,
  });

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
  const interactionRef = useRef<{
    kind: "move-layer" | "resize-layer" | "rotate-layer" | "move-text" | "draw";
    targetId?: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
    origScale: number;
    origRotation: number;
    startDist: number;
    startAngle: number;
    centerClientX: number;
    centerClientY: number;
    stageRect: DOMRect;
    preSnapshot: EditorSnapshot;
    moved: boolean;
  } | null>(null);

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

  const currentSnapshot = useCallback(
    (): EditorSnapshot => ({
      layers,
      textLayers,
      pageBorderId,
      drawStrokes,
    }),
    [layers, textLayers, pageBorderId, drawStrokes]
  );

  const pushHistory = useCallback((snapshot: EditorSnapshot) => {
    setHistoryPast((prev) => [...prev.slice(-39), snapshot]);
    setHistoryFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setHistoryFuture((fut) => [currentSnapshot(), ...fut.slice(0, 39)]);
      setLayers(previous.layers);
      setTextLayers(previous.textLayers);
      setPageBorderId(previous.pageBorderId);
      setDrawStrokes(previous.drawStrokes);
      return prev.slice(0, -1);
    });
  }, [currentSnapshot]);

  const handleRedo = useCallback(() => {
    setHistoryFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setHistoryPast((past) => [...past.slice(-39), currentSnapshot()]);
      setLayers(next.layers);
      setTextLayers(next.textLayers);
      setPageBorderId(next.pageBorderId);
      setDrawStrokes(next.drawStrokes);
      return prev.slice(1);
    });
  }, [currentSnapshot]);

  const clearCanvasEdits = () => {
    setEditPlan(null);
    setLayers([]);
    setActiveLayerId(null);
    setTextLayers([]);
    setActiveTextId(null);
    setPageBorderId("none");
    setDrawStrokes([]);
    setActiveDrawStroke(null);
    setHistoryPast([]);
    setHistoryFuture([]);
  };

  useEffect(() => {
    try {
      localStorage.setItem("lumina_ai_bw_stickers_v1", JSON.stringify(customAiAssets));
    } catch {
      // Ignore storage quota issues
    }
  }, [customAiAssets]);

  useEffect(() => {
    try {
      localStorage.setItem("lumina_fav_assets_v1", JSON.stringify(favoriteIds));
    } catch {
      // Ignore storage quota issues
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem("lumina_recent_assets_v1", JSON.stringify(recentIds));
    } catch {
      // Ignore storage quota issues
    }
  }, [recentIds]);

  const toggleFavoriteAsset = (assetId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [assetId, ...prev]
    );
  };

  const recordRecentAsset = (assetId: string) => {
    setRecentIds((prev) => [assetId, ...prev.filter((id) => id !== assetId)].slice(0, 12));
  };

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
      clearCanvasEdits();
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
      clearCanvasEdits();
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
    clearCanvasEdits();
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
    clearCanvasEdits();
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

    pushHistory(currentSnapshot());
    recordRecentAsset(asset.id);

    const newLayer: EditOverlayLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: asset.label,
      category: asset.mode === "cartoon" ? "cartoon" : "sticker",
      src: resolveAssetDataUrl(asset),
      x: 50 + (Math.random() * 12 - 6),
      y: 34 + (Math.random() * 12 - 6),
      widthPct: asset.defaultWidthPct,
      aspectRatio: asset.aspectRatio,
      scale: 1,
      rotation: 0,
      flipH: false,
      opacity: 1,
      locked: false,
      hidden: false,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setActiveTextId(null);
    setCanvasTool("select");
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

  const updateActiveLayer = (patch: Partial<EditOverlayLayer>, recordUndo = false) => {
    if (!activeLayerId) return;
    if (recordUndo) pushHistory(currentSnapshot());
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayerId ? { ...l, ...patch } : l))
    );
  };

  const toggleLayerLock = (id: string) => {
    pushHistory(currentSnapshot());
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  };

  const toggleLayerVisibility = (id: string) => {
    pushHistory(currentSnapshot());
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)));
  };

  const handleDuplicateActiveLayer = useCallback(() => {
    if (!activeLayer) return;
    pushHistory(currentSnapshot());
    const copy: EditOverlayLayer = {
      ...activeLayer,
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${activeLayer.label} (Copy)`,
      x: Math.min(92, activeLayer.x + 5),
      y: Math.min(92, activeLayer.y + 5),
      locked: false,
    };
    setLayers((prev) => [...prev, copy]);
    setActiveLayerId(copy.id);
  }, [activeLayer, currentSnapshot, pushHistory]);

  const handleDeleteLayer = useCallback(
    (id: string) => {
      pushHistory(currentSnapshot());
      setLayers((prev) => {
        const next = prev.filter((l) => l.id !== id);
        if (activeLayerId === id) {
          setActiveLayerId(next[next.length - 1]?.id || null);
        }
        return next;
      });
    },
    [activeLayerId, currentSnapshot, pushHistory]
  );

  const handleMoveLayerOrder = (direction: "up" | "down") => {
    if (!activeLayerId) return;
    pushHistory(currentSnapshot());
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
    pushHistory(currentSnapshot());
    const next = createAiEditTextLayer(textLayers.length + 1, coloringEnabled);
    setTextLayers((prev) => [...prev, next]);
    setActiveTextId(next.id);
    setActiveLayerId(null);
    setCanvasTool("select");
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

  const handleDuplicateTextLayer = useCallback(() => {
    const target = activeTextLayer || textLayers[0];
    if (!target) return;
    pushHistory(currentSnapshot());
    const copy: TextLayer = {
      ...target,
      id: `aitext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(92, target.x + 4),
      y: Math.min(92, target.y + 6),
    };
    setTextLayers((prev) => [...prev, copy]);
    setActiveTextId(copy.id);
  }, [activeTextLayer, textLayers, currentSnapshot, pushHistory]);

  const handleDeleteTextLayer = useCallback(
    (id: string) => {
      pushHistory(currentSnapshot());
      setTextLayers((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (activeTextId === id) {
          setActiveTextId(next[next.length - 1]?.id || null);
        }
        return next;
      });
    },
    [activeTextId, currentSnapshot, pushHistory]
  );

  const handleSelectObject = (layerId: string) => {
    setActiveLayerId(layerId);
    setActiveTextId(null);
  };

  const handleSelectText = (layerId: string) => {
    setActiveTextId(layerId);
    setActiveLayerId(null);
  };

  const handleSelectPageBorder = (borderId: PageBorderId) => {
    if (borderId === pageBorderId) return;
    pushHistory(currentSnapshot());
    setPageBorderId(borderId);
    setShowOriginalOnly(false);
  };

  const handleClearDrawStrokes = () => {
    if (drawStrokes.length === 0) return;
    pushHistory(currentSnapshot());
    setDrawStrokes([]);
  };

  const handleUndoLastStroke = () => {
    if (drawStrokes.length === 0) return;
    pushHistory(currentSnapshot());
    setDrawStrokes((prev) => prev.slice(0, -1));
  };

  // Global keyboard shortcuts (Undo/Redo, Duplicate, Delete, Arrow Nudge, Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        if (activeLayer) {
          e.preventDefault();
          handleDuplicateActiveLayer();
        } else if (activeTextLayer) {
          e.preventDefault();
          handleDuplicateTextLayer();
        }
        return;
      }
      if (e.key === "Escape") {
        setActiveLayerId(null);
        setActiveTextId(null);
        setCanvasTool("select");
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (activeLayer && !activeLayer.locked) {
          e.preventDefault();
          handleDeleteLayer(activeLayer.id);
        } else if (activeTextLayer) {
          e.preventDefault();
          handleDeleteTextLayer(activeTextLayer.id);
        }
        return;
      }
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        const step = e.shiftKey ? 5 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        if (activeLayer && !activeLayer.locked) {
          e.preventDefault();
          setLayers((prev) =>
            prev.map((l) =>
              l.id === activeLayer.id
                ? {
                    ...l,
                    x: Math.max(2, Math.min(98, l.x + dx)),
                    y: Math.max(2, Math.min(98, l.y + dy)),
                  }
                : l
            )
          );
        } else if (activeTextLayer) {
          e.preventDefault();
          setTextLayers((prev) =>
            prev.map((t) =>
              t.id === activeTextLayer.id
                ? {
                    ...t,
                    x: Math.max(2, Math.min(98, t.x + dx)),
                    y: Math.max(2, Math.min(98, t.y + dy)),
                  }
                : t
            )
          );
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeLayer,
    activeTextLayer,
    handleUndo,
    handleRedo,
    handleDuplicateActiveLayer,
    handleDuplicateTextLayer,
    handleDeleteLayer,
    handleDeleteTextLayer,
  ]);

  // Direct Canvas Pointer Engine (Move, Corner Resize, Top Rotate, Freehand Ink/Whiteout)
  const applySnap = (val: number) => {
    const threshold = 1.25;
    if (Math.abs(val - 50) <= threshold) return { snapped: 50, hit: "center" as const };
    if (Math.abs(val - 8) <= threshold) return { snapped: 8, hit: "min" as const };
    if (Math.abs(val - 92) <= threshold) return { snapped: 92, hit: "max" as const };
    return { snapped: val, hit: null };
  };

  const beginLayerDrag = (e: React.PointerEvent, layer: EditOverlayLayer) => {
    if (canvasTool !== "select" || showOriginalOnly) return;
    e.stopPropagation();
    handleSelectObject(layer.id);
    if (layer.locked) return;
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    stageEl.setPointerCapture(e.pointerId);
    interactionRef.current = {
      kind: "move-layer",
      targetId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: layer.x,
      origY: layer.y,
      origScale: layer.scale,
      origRotation: layer.rotation,
      startDist: 1,
      startAngle: 0,
      centerClientX: rect.left + (layer.x / 100) * rect.width,
      centerClientY: rect.top + (layer.y / 100) * rect.height,
      stageRect: rect,
      preSnapshot: currentSnapshot(),
      moved: false,
    };
  };

  const beginLayerResize = (e: React.PointerEvent, layer: EditOverlayLayer) => {
    if (canvasTool !== "select" || showOriginalOnly || layer.locked) return;
    e.stopPropagation();
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const cx = rect.left + (layer.x / 100) * rect.width;
    const cy = rect.top + (layer.y / 100) * rect.height;
    const startDist = Math.max(12, Math.hypot(e.clientX - cx, e.clientY - cy));
    stageEl.setPointerCapture(e.pointerId);
    interactionRef.current = {
      kind: "resize-layer",
      targetId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: layer.x,
      origY: layer.y,
      origScale: layer.scale,
      origRotation: layer.rotation,
      startDist,
      startAngle: 0,
      centerClientX: cx,
      centerClientY: cy,
      stageRect: rect,
      preSnapshot: currentSnapshot(),
      moved: false,
    };
  };

  const beginLayerRotate = (e: React.PointerEvent, layer: EditOverlayLayer) => {
    if (canvasTool !== "select" || showOriginalOnly || layer.locked) return;
    e.stopPropagation();
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const cx = rect.left + (layer.x / 100) * rect.width;
    const cy = rect.top + (layer.y / 100) * rect.height;
    const startAngle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    stageEl.setPointerCapture(e.pointerId);
    interactionRef.current = {
      kind: "rotate-layer",
      targetId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: layer.x,
      origY: layer.y,
      origScale: layer.scale,
      origRotation: layer.rotation,
      startDist: 1,
      startAngle,
      centerClientX: cx,
      centerClientY: cy,
      stageRect: rect,
      preSnapshot: currentSnapshot(),
      moved: false,
    };
  };

  const beginTextDrag = (e: React.PointerEvent, tl: TextLayer) => {
    if (canvasTool !== "select" || showOriginalOnly) return;
    e.stopPropagation();
    handleSelectText(tl.id);
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    stageEl.setPointerCapture(e.pointerId);
    interactionRef.current = {
      kind: "move-text",
      targetId: tl.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: tl.x,
      origY: tl.y,
      origScale: 1,
      origRotation: tl.rotation,
      startDist: 1,
      startAngle: 0,
      centerClientX: rect.left + (tl.x / 100) * rect.width,
      centerClientY: rect.top + (tl.y / 100) * rect.height,
      stageRect: rect,
      preSnapshot: currentSnapshot(),
      moved: false,
    };
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (showOriginalOnly) return;
    const stageEl = stageRef.current;
    if (!stageEl) return;

    if (canvasTool === "ink" || canvasTool === "whiteout") {
      e.preventDefault();
      const rect = stageEl.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1000, ((e.clientX - rect.left) / rect.width) * 1000));
      const ny = Math.max(0, Math.min(1000, ((e.clientY - rect.top) / rect.height) * 1000));
      stageEl.setPointerCapture(e.pointerId);
      const newStroke: CanvasDrawStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tool: canvasTool,
        width: brushSize,
        points: [{ x: nx, y: ny }],
      };
      setActiveDrawStroke(newStroke);
      interactionRef.current = {
        kind: "draw",
        startClientX: e.clientX,
        startClientY: e.clientY,
        origX: 0,
        origY: 0,
        origScale: 1,
        origRotation: 0,
        startDist: 1,
        startAngle: 0,
        centerClientX: 0,
        centerClientY: 0,
        stageRect: rect,
        preSnapshot: currentSnapshot(),
        moved: true,
      };
      return;
    }

    setActiveLayerId(null);
    setActiveTextId(null);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const inter = interactionRef.current;
    if (!inter) return;

    if (inter.kind === "draw") {
      const rect = inter.stageRect;
      const nx = Math.max(0, Math.min(1000, ((e.clientX - rect.left) / rect.width) * 1000));
      const ny = Math.max(0, Math.min(1000, ((e.clientY - rect.top) / rect.height) * 1000));
      setActiveDrawStroke((prev) => {
        if (!prev) return prev;
        const last = prev.points[prev.points.length - 1];
        if (last && Math.hypot(nx - last.x, ny - last.y) < 3.5) return prev;
        return { ...prev, points: [...prev.points, { x: nx, y: ny }] };
      });
      return;
    }

    const dxPct = ((e.clientX - inter.startClientX) / inter.stageRect.width) * 100;
    const dyPct = ((e.clientY - inter.startClientY) / inter.stageRect.height) * 100;

    if (inter.kind === "move-layer" && inter.targetId) {
      if (Math.abs(dxPct) > 0.2 || Math.abs(dyPct) > 0.2) inter.moved = true;
      const rawX = Math.max(2, Math.min(98, inter.origX + dxPct));
      const rawY = Math.max(2, Math.min(98, inter.origY + dyPct));
      const sx = applySnap(rawX);
      const sy = applySnap(rawY);
      setSnapGuides({
        vCenter: sx.hit === "center",
        hCenter: sy.hit === "center",
        leftMargin: sx.hit === "min",
        rightMargin: sx.hit === "max",
        topMargin: sy.hit === "min",
        bottomMargin: sy.hit === "max",
      });
      setLayers((prev) =>
        prev.map((l) => (l.id === inter.targetId ? { ...l, x: sx.snapped, y: sy.snapped } : l))
      );
    } else if (inter.kind === "move-text" && inter.targetId) {
      if (Math.abs(dxPct) > 0.2 || Math.abs(dyPct) > 0.2) inter.moved = true;
      const rawX = Math.max(2, Math.min(98, inter.origX + dxPct));
      const rawY = Math.max(2, Math.min(98, inter.origY + dyPct));
      const sx = applySnap(rawX);
      const sy = applySnap(rawY);
      setSnapGuides({
        vCenter: sx.hit === "center",
        hCenter: sy.hit === "center",
        leftMargin: sx.hit === "min",
        rightMargin: sx.hit === "max",
        topMargin: sy.hit === "min",
        bottomMargin: sy.hit === "max",
      });
      setTextLayers((prev) =>
        prev.map((t) => (t.id === inter.targetId ? { ...t, x: sx.snapped, y: sy.snapped } : t))
      );
    } else if (inter.kind === "resize-layer" && inter.targetId) {
      inter.moved = true;
      const dist = Math.max(10, Math.hypot(e.clientX - inter.centerClientX, e.clientY - inter.centerClientY));
      const nextScale = Math.max(0.25, Math.min(2.5, inter.origScale * (dist / inter.startDist)));
      setLayers((prev) =>
        prev.map((l) => (l.id === inter.targetId ? { ...l, scale: Number(nextScale.toFixed(2)) } : l))
      );
    } else if (inter.kind === "rotate-layer" && inter.targetId) {
      inter.moved = true;
      const angle = (Math.atan2(e.clientY - inter.centerClientY, e.clientX - inter.centerClientX) * 180) / Math.PI;
      let nextRot = Math.round(inter.origRotation + (angle - inter.startAngle));
      while (nextRot > 180) nextRot -= 360;
      while (nextRot < -180) nextRot += 360;
      // Gentle snap to 0°, ±45°, ±90°, ±180°
      for (const snapDeg of [-180, -90, -45, 0, 45, 90, 180]) {
        if (Math.abs(nextRot - snapDeg) <= 4) {
          nextRot = snapDeg;
          break;
        }
      }
      setLayers((prev) =>
        prev.map((l) => (l.id === inter.targetId ? { ...l, rotation: nextRot } : l))
      );
    }
  };

  const finishStagePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const inter = interactionRef.current;
    if (!inter) return;
    interactionRef.current = null;
    if (stageRef.current?.hasPointerCapture(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId);
    }
    setSnapGuides({
      vCenter: false,
      hCenter: false,
      leftMargin: false,
      rightMargin: false,
      topMargin: false,
      bottomMargin: false,
    });

    if (inter.kind === "draw") {
      setActiveDrawStroke((stroke) => {
        if (stroke && stroke.points.length > 0) {
          pushHistory(inter.preSnapshot);
          setDrawStrokes((prev) => [...prev, stroke]);
        }
        return null;
      });
      return;
    }

    if (inter.moved) {
      pushHistory(inter.preSnapshot);
    }
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
      textLayers,
      {
        borderId: pageBorderId,
        drawStrokes,
      }
    );
  };

  const buildSavedPhotoItem = (finalImg: { dataUrl: string; width: number; height: number }): PhotoItem => {
    const now = Date.now();
    return {
      id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${sourcePhoto?.title || "Coloring Page"} (Edited)`,
      prompt:
        instruction.trim() ||
        editPlan?.editSummary ||
        `Coloring Page Edit (${layers.length} layers)`,
      dataUrl: finalImg.dataUrl,
      width: finalImg.width,
      height: finalImg.height,
      aspectRatio: coloringEnabled
        ? pageSize === "a4"
          ? "A4"
          : "US Letter"
        : sourcePhoto?.aspectRatio || "4:3",
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
      clearCanvasEdits();
      setInstruction("");
      setSavedToast("Baked all layers, borders & strokes into base image!");
      setTimeout(() => setSavedToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const saveEditedPhotoToHall = async (item: PhotoItem) => {
    if (!autoSaveWhiteCanvas) {
      await onSaveNewPhoto(item);
      return;
    }
    const whiteCanvas = buildPureWhitePhotoItem(item, pageSize, dpi, item.updatedAt - 1);
    if (onSavePhotos) {
      await onSavePhotos([item, whiteCanvas]);
    } else {
      await onSaveNewPhoto(item);
      await onSaveNewPhoto(whiteCanvas);
    }
  };

  const handleSaveStandaloneWhiteCanvas = async () => {
    setExporting(true);
    try {
      const now = Date.now();
      const targetWidth = coloringEnabled
        ? coloringDims.width
        : baseStage?.width || sourcePhoto?.width || coloringDims.width;
      const targetHeight = coloringEnabled
        ? coloringDims.height
        : baseStage?.height || sourcePhoto?.height || coloringDims.height;
      const targetAspect = coloringEnabled
        ? pageSize === "a4"
          ? "A4"
          : "US Letter"
        : sourcePhoto?.aspectRatio || (pageSize === "a4" ? "A4" : "US Letter");

      const whiteCanvas = buildPureWhitePhotoItem(
        {
          title: "",
          width: targetWidth,
          height: targetHeight,
          aspectRatio: targetAspect,
          dpi: coloringEnabled ? dpi : 300,
          pageSize,
        },
        pageSize,
        dpi,
        now
      );
      await onSaveNewPhoto(whiteCanvas);
      setSavedToast("Pure White Canvas (#FFFFFF) တစ်ပုံကို Photo Hall ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။");
      setTimeout(() => setSavedToast(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToPhotoHall = async () => {
    if (!sourcePhoto || !baseStage) return;
    setExporting(true);
    try {
      const finalImg = await renderFinalComposite();
      const item = buildSavedPhotoItem(finalImg);
      await saveEditedPhotoToHall(item);
      setSavedToast(
        autoSaveWhiteCanvas
          ? "Photo Hall ထဲသို့ ပုံ + Pure White Canvas (#FFFFFF) တစ်ပုံ တွဲဖက်သိမ်းဆည်းပြီးပါပြီ။"
          : "Saved edited page to Photo Hall."
      );
      setTimeout(() => setSavedToast(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveAndSend = async (target: "book" | "design") => {
    if (!sourcePhoto || !baseStage || !onSendToPage) return;
    setExporting(true);
    try {
      const finalImg = await renderFinalComposite();
      const item = buildSavedPhotoItem(finalImg);
      await saveEditedPhotoToHall(item);
      onSendToPage(target, item);
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
        `${sourcePhoto.title || "gbtk-studio"}-${coloringEnabled ? `coloring-${dpi}dpi` : "edited"}.png`
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

  const stickerLookupMap = useMemo(() => {
    const map = new Map<string, StickerAsset>();
    for (const item of [...aiStickerAssets, ...allStickersCatalog]) {
      map.set(item.id, item);
    }
    return map;
  }, [aiStickerAssets, allStickersCatalog]);

  const cartoonLookupMap = useMemo(() => {
    const map = new Map<string, StickerAsset>();
    for (const item of [...aiCartoonAssets, ...CARTOON_ASSETS]) {
      map.set(item.id, item);
    }
    return map;
  }, [aiCartoonAssets]);

  const favoriteStickerAssets = useMemo(
    () => favoriteIds.map((id) => stickerLookupMap.get(id)).filter((a): a is StickerAsset => Boolean(a)),
    [favoriteIds, stickerLookupMap]
  );
  const recentStickerAssets = useMemo(
    () => recentIds.map((id) => stickerLookupMap.get(id)).filter((a): a is StickerAsset => Boolean(a)),
    [recentIds, stickerLookupMap]
  );
  const favoriteCartoonAssets = useMemo(
    () => favoriteIds.map((id) => cartoonLookupMap.get(id)).filter((a): a is StickerAsset => Boolean(a)),
    [favoriteIds, cartoonLookupMap]
  );
  const recentCartoonAssets = useMemo(
    () => recentIds.map((id) => cartoonLookupMap.get(id)).filter((a): a is StickerAsset => Boolean(a)),
    [recentIds, cartoonLookupMap]
  );

  const borderThumbnails = useMemo(() => {
    const thumbs: Record<PageBorderId, string> = {} as Record<PageBorderId, string>;
    for (const b of PAGE_BORDERS) {
      thumbs[b.id] = b.id === "none" ? "" : buildPageBorderDataUrl(b.id, 220, 285);
    }
    return thumbs;
  }, []);

  const activeBorderDataUrl = useMemo(() => {
    if (pageBorderId === "none") return "";
    const aspectH = baseStage
      ? Math.round((1000 * baseStage.height) / Math.max(1, baseStage.width))
      : 1294;
    return buildPageBorderDataUrl(pageBorderId, 1000, aspectH);
  }, [pageBorderId, baseStage]);

  const stickerCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allStickersCatalog.length,
      favorites: favoriteStickerAssets.length,
      recent: recentStickerAssets.length,
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
  }, [
    allStickersCatalog.length,
    favoriteStickerAssets.length,
    recentStickerAssets.length,
    alphabetAssets.length,
    numberAssets.length,
    symbolAssets.length,
    aiStickerAssets.length,
  ]);

  const cartoonCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: CARTOON_ASSETS.length,
      favorites: favoriteCartoonAssets.length,
      recent: recentCartoonAssets.length,
      ai: aiCartoonAssets.length,
    };
    for (const item of CARTOON_ASSETS) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [aiCartoonAssets.length, favoriteCartoonAssets.length, recentCartoonAssets.length]);

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
        case "favorites":
          return favoriteStickerAssets;
        case "recent":
          return recentStickerAssets;
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

    if (cartoonSubTab === "favorites") return favoriteCartoonAssets;
    if (cartoonSubTab === "recent") return recentCartoonAssets;
    if (cartoonSubTab === "ai") return aiCartoonAssets;
    if (cartoonSubTab === "all") return CARTOON_ASSETS;
    return CARTOON_ASSETS.filter((c) => c.category === cartoonSubTab);
  }, [
    assetSearchQuery,
    stickerMode,
    stickerSubTab,
    cartoonSubTab,
    allStickersCatalog,
    favoriteStickerAssets,
    recentStickerAssets,
    favoriteCartoonAssets,
    recentCartoonAssets,
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

        <div className="flex flex-wrap items-center gap-2">
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
            disabled={exporting}
            onClick={handleSaveStandaloneWhiteCanvas}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>+ Pure White Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Original Image</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            aria-label="Dismiss notification"
            className="p-1 text-emerald-700 hover:text-emerald-950 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

          {/* Primary Tool Tabs: AI Edit | Stickers | Frames & Draw */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setToolTab("ai")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolTab === "ai"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 shrink-0" />
              <span>AI Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setToolTab("stickers")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolTab === "stickers"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Sticker className="w-3.5 h-3.5 shrink-0" />
              <span>Stickers</span>
            </button>
            <button
              type="button"
              onClick={() => setToolTab("frames")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                toolTab === "frames"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Frame className="w-3.5 h-3.5 shrink-0" />
              <span>Frames</span>
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
          ) : toolTab === "stickers" ? (
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

              {/* Sub-category Filters (with Favorites & Recent) */}
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
                    <button
                      type="button"
                      onClick={() => setStickerSubTab("favorites")}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        stickerSubTab === "favorites"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>Favorites ({stickerCategoryCounts.favorites ?? 0})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStickerSubTab("recent")}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        stickerSubTab === "recent"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Recent ({stickerCategoryCounts.recent ?? 0})</span>
                    </button>
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
                  <button
                    type="button"
                    onClick={() => setCartoonSubTab("favorites")}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      cartoonSubTab === "favorites"
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>Favorites ({cartoonCategoryCounts.favorites ?? 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartoonSubTab("recent")}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      cartoonSubTab === "recent"
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Recent ({cartoonCategoryCounts.recent ?? 0})</span>
                  </button>
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
                      : (stickerMode === "sticker" ? stickerSubTab : cartoonSubTab) === "favorites"
                      ? `No favorite ${stickerMode === "sticker" ? "stickers" : "cartoons"} saved yet`
                      : (stickerMode === "sticker" ? stickerSubTab : cartoonSubTab) === "recent"
                      ? `No recently used ${stickerMode === "sticker" ? "stickers" : "cartoons"} yet`
                      : `No AI ${stickerMode === "sticker" ? "stickers" : "cartoons"} generated yet`}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {assetSearchQuery.trim()
                      ? "Try another keyword or clear search to browse all categories."
                      : (stickerMode === "sticker" ? stickerSubTab : cartoonSubTab) === "favorites"
                      ? "Tap the star icon on any sticker or cartoon to pin it here."
                      : (stickerMode === "sticker" ? stickerSubTab : cartoonSubTab) === "recent"
                      ? "Items you place onto the stage automatically appear here."
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
                      const isFav = favoriteIds.includes(asset.id);
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteAsset(asset.id);
                            }}
                            title={isFav ? `Remove ${asset.label} from Favorites` : `Star ${asset.label}`}
                            aria-label={isFav ? `Unfavorite ${asset.label}` : `Favorite ${asset.label}`}
                            className={`absolute top-1 left-1 p-1 rounded-md bg-white/95 border border-zinc-200 cursor-pointer transition-opacity ${
                              isFav
                                ? "opacity-100 text-amber-500 border-amber-300"
                                : "opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-400 hover:text-amber-500"
                            }`}
                          >
                            <Star className={`w-3 h-3 ${isFav ? "fill-amber-400" : ""}`} />
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
                All {allStickersCatalog.length} stickers &amp; {CARTOON_ASSETS.length} cartoons are pure black-and-white coloring line art. Tap to place, star to pin favorites.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Freehand B&W Ink Pen & Whiteout Brush Controls */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-900">
                    Canvas Brush &amp; Touch-Up
                  </span>
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {drawStrokes.length} {drawStrokes.length === 1 ? "stroke" : "strokes"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-200/70 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setCanvasTool("select")}
                    className={`min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                      canvasTool === "select"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    <MousePointer2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Select</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanvasTool("ink");
                      setActiveLayerId(null);
                      setActiveTextId(null);
                      setShowOriginalOnly(false);
                    }}
                    className={`min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                      canvasTool === "ink"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 shrink-0" />
                    <span>Ink Pen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanvasTool("whiteout");
                      setActiveLayerId(null);
                      setActiveTextId(null);
                      setShowOriginalOnly(false);
                    }}
                    className={`min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                      canvasTool === "whiteout"
                        ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-300"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5 shrink-0" />
                    <span>Whiteout</span>
                  </button>
                </div>

                <StepperControl
                  compact
                  label="Stroke Width"
                  value={brushSize}
                  min={2}
                  max={28}
                  step={1}
                  unit="px"
                  onChange={setBrushSize}
                />

                {drawStrokes.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleUndoLastStroke}
                      className="flex-1 min-h-[34px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo Stroke</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDrawStrokes}
                      className="flex-1 min-h-[34px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Strokes</span>
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Use <strong>Ink Pen</strong> (#000000) to close coloring gaps or sketch details, and <strong>Whiteout</strong> (#FFFFFF) to erase stray black dots directly on stage.
                </p>
              </div>

              {/* 12 Pure B&W Coloring Book Page Borders & Worksheet Layouts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900">
                    Page Borders &amp; Worksheets ({PAGE_BORDERS.length - 1})
                  </span>
                  {pageBorderId !== "none" && (
                    <button
                      type="button"
                      onClick={() => handleSelectPageBorder("none")}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Remove Frame
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                  {PAGE_BORDERS.map((border) => {
                    const active = pageBorderId === border.id;
                    const thumb = borderThumbnails[border.id];
                    return (
                      <button
                        key={border.id}
                        type="button"
                        onClick={() => handleSelectPageBorder(border.id)}
                        title={border.description}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 bg-white ${
                          active
                            ? "border-blue-600 ring-2 ring-blue-600/20"
                            : "border-zinc-200 hover:border-zinc-500"
                        }`}
                      >
                        <div className="w-12 h-14 rounded bg-white border border-zinc-200 flex items-center justify-center overflow-hidden">
                          {border.id === "none" ? (
                            <span className="text-[10px] font-medium text-zinc-400">None</span>
                          ) : (
                            <img
                              src={thumb}
                              alt={border.label}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-800 text-center leading-tight line-clamp-1 w-full">
                          {border.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
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

            <label className="flex items-start gap-2.5 pt-2.5 border-t border-zinc-100 text-xs font-medium text-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveWhiteCanvas}
                onChange={(e) => setAutoSaveWhiteCanvas(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-blue-600 rounded cursor-pointer shrink-0"
              />
              <span className="leading-snug">
                Auto-save Pure White Canvas to Photo Hall
                <span className="block text-[11px] font-normal text-zinc-500 mt-0.5">
                  AI Edit မှ Photo Hall သို့ ပုံ Save လုပ်တိုင်း အရွယ်အစားတူ Pure White Canvas (#FFFFFF) တစ်ပုံ အလိုအလျောက် တွဲသိမ်းပေးမည်။
                </span>
              </span>
            </label>
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

        {/* Right Panel: Sticky Pro Stage + Text Ribbon */}
        <div className="lg:col-span-8 space-y-4 lg:sticky lg:top-20">
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
            {/* Stage Header & Utility Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-zinc-950">
                  Interactive Edit Stage
                </span>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {layers.length} {layers.length === 1 ? "object" : "objects"} · {textLayers.length}{" "}
                  {textLayers.length === 1 ? "text" : "texts"}
                  {pageBorderId !== "none" ? " · Frame" : ""}
                  {drawStrokes.length > 0 ? ` · ${drawStrokes.length} ink` : ""}
                </span>
              </div>

              {sourcePhoto && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Undo / Redo */}
                  <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      disabled={historyPast.length === 0}
                      onClick={handleUndo}
                      title="Undo (Ctrl+Z)"
                      aria-label="Undo"
                      className="min-h-[34px] px-2.5 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={historyFuture.length === 0}
                      onClick={handleRedo}
                      title="Redo (Ctrl+Shift+Z)"
                      aria-label="Redo"
                      className="min-h-[34px] px-2.5 text-zinc-700 hover:bg-zinc-100 border-l border-zinc-200 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      disabled={canvasZoom <= 0.75}
                      onClick={() => setCanvasZoom((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                      title="Zoom Out"
                      aria-label="Zoom Out"
                      className="min-h-[34px] px-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasZoom(1)}
                      title="Reset Zoom to 100%"
                      className="min-h-[34px] px-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 border-x border-zinc-200 tabular-nums cursor-pointer whitespace-nowrap"
                    >
                      {Math.round(canvasZoom * 100)}%
                    </button>
                    <button
                      type="button"
                      disabled={canvasZoom >= 1.5}
                      onClick={() => setCanvasZoom((z) => Math.min(1.5, Number((z + 0.25).toFixed(2))))}
                      title="Zoom In"
                      aria-label="Zoom In"
                      className="min-h-[34px] px-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Printable Margin Guide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowMarginGrid((v) => !v)}
                    title="Toggle Safe Print Margin Guide"
                    className={`min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                      showMarginGrid
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Guides</span>
                  </button>

                  {/* Quick exit if drawing with Ink or Whiteout */}
                  {canvasTool !== "select" && (
                    <button
                      type="button"
                      onClick={() => setCanvasTool("select")}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <MousePointer2 className="w-3.5 h-3.5" />
                      <span>Done {canvasTool === "ink" ? "Ink" : "Whiteout"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setEraserOpen(true)}
                    className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer whitespace-nowrap"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Select &amp; Erase</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOriginalOnly((v) => !v)}
                    className={`min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                      showOriginalOnly
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showOriginalOnly ? "Viewing Original" : "Compare"}</span>
                  </button>
                  {(layers.length > 0 ||
                    textLayers.length > 0 ||
                    editPlan ||
                    pageBorderId !== "none" ||
                    drawStrokes.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        pushHistory(currentSnapshot());
                        setEditPlan(null);
                        setLayers([]);
                        setActiveLayerId(null);
                        setTextLayers([]);
                        setActiveTextId(null);
                        setPageBorderId("none");
                        setDrawStrokes([]);
                      }}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 rounded-lg border border-zinc-200 hover:border-zinc-400 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
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
              className="min-h-[420px] max-h-[620px] bg-[#141416] rounded-xl flex items-center justify-center p-5 overflow-auto"
            >
              {processing ? (
                <div className="text-center space-y-3 text-zinc-300">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                  <p className="text-sm font-medium">
                    Analyzing image &amp; generating movable coloring object...
                  </p>
                </div>
              ) : !sourcePhoto || !baseStage ? (
                <div className="text-center space-y-3 max-w-sm text-zinc-400 px-4">
                  <Upload className="w-8 h-8 mx-auto opacity-60" />
                  <p className="text-sm font-medium text-zinc-200">
                    Upload an Original Image
                  </p>
                  <p className="text-xs leading-relaxed">
                    Drag and drop a photo here, click Upload Original Image, or pick one from the top strip. Add AI objects, B&amp;W cartoons, borders, or coloring stickers and drag them directly on stage.
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
                  onPointerDown={handleStagePointerDown}
                  onPointerMove={handleStagePointerMove}
                  onPointerUp={finishStagePointer}
                  onPointerCancel={finishStagePointer}
                  className={`relative w-full mx-auto bg-white rounded shadow-xl overflow-hidden select-none touch-none shrink-0 ${
                    canvasTool !== "select" && !showOriginalOnly ? "cursor-crosshair" : ""
                  }`}
                  style={{
                    maxWidth: `${Math.round(440 * canvasZoom)}px`,
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

                  {/* Pure B&W Page Border / Worksheet Overlay */}
                  {!showOriginalOnly && activeBorderDataUrl && (
                    <img
                      src={activeBorderDataUrl}
                      alt="Page border"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                    />
                  )}

                  {/* Safe Printable Margin Guide */}
                  {!showOriginalOnly && showMarginGrid && (
                    <div className="pointer-events-none absolute inset-[6%] border border-dashed border-blue-500/70 z-30">
                      <span className="absolute top-1 left-1.5 text-[9px] font-semibold text-blue-600 bg-white/85 px-1 rounded">
                        Safe Print Margin
                      </span>
                    </div>
                  )}

                  {/* Smart Alignment & Margin Snap Guides */}
                  {!showOriginalOnly && (
                    <>
                      {(snapGuides.vCenter ||
                        (activeLayer && Math.abs(activeLayer.x - 50) < 0.4) ||
                        (activeTextLayer && Math.abs(activeTextLayer.x - 50) < 0.4)) && (
                        <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-blue-500/80 z-30" />
                      )}
                      {snapGuides.hCenter && (
                        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-blue-500/80 z-30" />
                      )}
                      {snapGuides.leftMargin && (
                        <div className="pointer-events-none absolute top-0 bottom-0 left-[8%] w-px bg-emerald-500/80 z-30" />
                      )}
                      {snapGuides.rightMargin && (
                        <div className="pointer-events-none absolute top-0 bottom-0 left-[92%] w-px bg-emerald-500/80 z-30" />
                      )}
                      {snapGuides.topMargin && (
                        <div className="pointer-events-none absolute left-0 right-0 top-[8%] h-px bg-emerald-500/80 z-30" />
                      )}
                      {snapGuides.bottomMargin && (
                        <div className="pointer-events-none absolute left-0 right-0 top-[92%] h-px bg-emerald-500/80 z-30" />
                      )}
                    </>
                  )}

                  {/* Interactive Object & Sticker Layers (Drag, Resize, Rotate) */}
                  {!showOriginalOnly &&
                    layers
                      .filter((l) => !l.hidden)
                      .map((layer) => {
                        const isSelected = layer.id === activeLayerId;
                        const canManipulate = isSelected && !layer.locked && canvasTool === "select";
                        return (
                          <div
                            key={layer.id}
                            onPointerDown={(e) => beginLayerDrag(e, layer)}
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
                            className={`absolute transition-shadow z-10 ${
                              canvasTool !== "select"
                                ? "pointer-events-none"
                                : layer.locked
                                ? "cursor-not-allowed"
                                : "cursor-grab active:cursor-grabbing"
                            } ${
                              isSelected
                                ? layer.locked
                                  ? "ring-2 ring-amber-500 ring-offset-1 rounded"
                                  : "ring-2 ring-blue-600 ring-offset-2 rounded bg-blue-500/5"
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

                            {/* Locked Indicator */}
                            {isSelected && layer.locked && (
                              <span
                                style={{
                                  transform: layer.flipH ? "scaleX(-1)" : undefined,
                                }}
                                className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow"
                              >
                                <Lock className="w-3 h-3" />
                              </span>
                            )}

                            {/* Direct Rotate & Resize Handles */}
                            {canManipulate && (
                              <>
                                <button
                                  type="button"
                                  onPointerDown={(e) => beginLayerRotate(e, layer)}
                                  title="Drag to rotate"
                                  aria-label={`Rotate ${layer.label}`}
                                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-blue-600 text-blue-600 shadow flex items-center justify-center cursor-grab active:cursor-grabbing z-30"
                                >
                                  <RotateCw className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => beginLayerResize(e, layer)}
                                  title="Drag to resize"
                                  aria-label={`Resize ${layer.label}`}
                                  className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow cursor-nwse-resize z-30"
                                />
                              </>
                            )}
                          </div>
                        );
                      })}

                  {/* Interactive Text Layers (Drag to Move) */}
                  {!showOriginalOnly &&
                    textLayers.map((tl) => {
                      const isSelected = tl.id === activeTextId;
                      const hasBound = Boolean(tl.boundStyle && tl.boundStyle !== "none");
                      const bPadX = (tl.boundPadX ?? 32) * baseScale;
                      const bPadY = (tl.boundPadY ?? 16) * baseScale;
                      return (
                        <div
                          key={tl.id}
                          onPointerDown={(e) => beginTextDrag(e, tl)}
                          style={{
                            left: `${tl.x}%`,
                            top: `${tl.y}%`,
                            transform: `translate(-50%, -50%) rotate(${tl.rotation}deg)`,
                          }}
                          className={`absolute rounded z-20 max-w-[94%] ${
                            canvasTool !== "select"
                              ? "pointer-events-none"
                              : "cursor-grab active:cursor-grabbing"
                          } ${hasBound ? "" : "px-1.5 py-0.5"} ${
                            isSelected ? "ring-2 ring-blue-600 ring-offset-1" : "hover:ring-1 hover:ring-blue-400/70"
                          }`}
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
                            <div className="relative z-10 pointer-events-none" style={getTextPreviewStyle(tl)}>
                              {renderTextPreviewContent(tl)}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Freehand Ink Pen (#000000) & Whiteout (#FFFFFF) Live Stroke Overlay */}
                  {!showOriginalOnly && (drawStrokes.length > 0 || activeDrawStroke) && (
                    <svg
                      viewBox="0 0 1000 1000"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none z-25"
                    >
                      {[...drawStrokes, ...(activeDrawStroke ? [activeDrawStroke] : [])].map((st) => {
                        const strokeColor = st.tool === "whiteout" ? "#FFFFFF" : "#000000";
                        const strokePx = Math.max(1.5, st.width * baseScale);
                        if (st.points.length === 1) {
                          return (
                            <circle
                              key={st.id}
                              cx={st.points[0].x}
                              cy={st.points[0].y}
                              r={Math.max(1.5, st.width * 0.5)}
                              fill={strokeColor}
                            />
                          );
                        }
                        return (
                          <path
                            key={st.id}
                            d={buildStrokePathD(st.points)}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokePx}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              )}
            </div>

            {/* Added Objects Layer Strip (with Lock & Visibility Toggles) */}
            {layers.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700">
                    Added Objects &amp; Stickers (Drag directly on stage · Arrow keys nudge)
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
                        className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          selected
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400"
                        } ${l.hidden ? "opacity-55" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectObject(l.id)}
                          className="cursor-pointer truncate max-w-[130px]"
                        >
                          {l.label}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLayerVisibility(l.id)}
                          title={l.hidden ? `Show ${l.label}` : `Hide ${l.label}`}
                          aria-label={l.hidden ? `Show ${l.label}` : `Hide ${l.label}`}
                          className={`p-0.5 rounded cursor-pointer ${
                            selected ? "hover:bg-white/20 text-zinc-300" : "hover:bg-zinc-200 text-zinc-500"
                          }`}
                        >
                          {l.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLayerLock(l.id)}
                          title={l.locked ? `Unlock ${l.label}` : `Lock ${l.label}`}
                          aria-label={l.locked ? `Unlock ${l.label}` : `Lock ${l.label}`}
                          className={`p-0.5 rounded cursor-pointer ${
                            l.locked
                              ? "text-amber-400 hover:bg-white/20"
                              : selected
                              ? "hover:bg-white/20 text-zinc-300"
                              : "hover:bg-zinc-200 text-zinc-500"
                          }`}
                        >
                          {l.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
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
                    {activeLayer.locked && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activeLayer.locked}
                      onClick={() => updateActiveLayer({ x: 18 }, true)}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 disabled:opacity-40 cursor-pointer"
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      disabled={activeLayer.locked}
                      onClick={() => updateActiveLayer({ x: 50 }, true)}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 disabled:opacity-40 cursor-pointer"
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      disabled={activeLayer.locked}
                      onClick={() => updateActiveLayer({ x: 82 }, true)}
                      className="px-2 py-1 text-[11px] font-medium bg-white border border-zinc-200 rounded hover:border-zinc-400 disabled:opacity-40 cursor-pointer"
                    >
                      Right
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayerLock(activeLayer.id)}
                      title={activeLayer.locked ? "Unlock Layer" : "Lock Layer"}
                      className={`p-1.5 rounded border cursor-pointer ${
                        activeLayer.locked
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {activeLayer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayerVisibility(activeLayer.id)}
                      title={activeLayer.hidden ? "Show Layer" : "Hide Layer"}
                      className={`p-1.5 rounded border cursor-pointer ${
                        activeLayer.hidden
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {activeLayer.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={activeLayer.locked}
                      onClick={() => updateActiveLayer({ flipH: !activeLayer.flipH }, true)}
                      title="Flip Horizontal"
                      className={`p-1.5 rounded border disabled:opacity-40 cursor-pointer ${
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
                      title="Duplicate (Ctrl+D)"
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
                      title="Delete Object (Del)"
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
                    onChange={(val) => !activeLayer.locked && updateActiveLayer({ x: val })}
                  />
                  <StepperControl
                    compact
                    label="Vertical (Top ↕ Bottom)"
                    value={Math.round(activeLayer.y)}
                    min={4}
                    max={96}
                    step={2}
                    unit="%"
                    onChange={(val) => !activeLayer.locked && updateActiveLayer({ y: val })}
                  />
                  <StepperControl
                    compact
                    label="Size / Scale"
                    value={Math.round(activeLayer.scale * 100)}
                    min={25}
                    max={250}
                    step={5}
                    unit="%"
                    onChange={(val) => !activeLayer.locked && updateActiveLayer({ scale: val / 100 })}
                  />
                  <StepperControl
                    compact
                    label="Rotation"
                    value={activeLayer.rotation}
                    min={-180}
                    max={180}
                    step={5}
                    unit="°"
                    onChange={(val) => !activeLayer.locked && updateActiveLayer({ rotation: val })}
                  />
                </div>
              </div>
            )}

            {/* Action Bar (Export + Direct Cross-Page Handoffs) */}
            {sourcePhoto && baseStage && (
              <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={handleBakeAndContinue}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bake &amp; Continue Editing</span>
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

                {onSendToPage && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-zinc-100/80">
                    <span className="text-[11px] text-zinc-500 mr-auto">
                      Save &amp; continue workflow:
                    </span>
                    <button
                      type="button"
                      disabled={exporting}
                      onClick={() => handleSaveAndSend("book")}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send to Book</span>
                    </button>
                    <button
                      type="button"
                      disabled={exporting}
                      onClick={() => handleSaveAndSend("design")}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send to Design</span>
                    </button>
                  </div>
                )}
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
