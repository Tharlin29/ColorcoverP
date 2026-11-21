import {
  BookOpen,
  Check,
  Download,
  Eraser,
  Image as ImageIcon,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  Palette,
  Save,
  Sparkles,
  Type,
  Upload,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StepperControl } from "../components/StepperControl";
import { TextBoundRibbon } from "../components/TextBoundRibbon";
import {
  CardOverlayTextStyle,
  PageId,
  PhotoItem,
  ShowcaseAspectId,
  ShowcaseBackdropId,
  ShowcaseCardPaper,
  ShowcaseCardSlot,
  ShowcaseDesignConfig,
  ShowcaseHeroTextStyle,
  ShowcaseLayoutId,
  ShowcasePlaqueStyle,
  TextLayer,
  TextStylePreset,
} from "../types/studio";
import { FONT_OPTIONS as STUDIO_FONT_OPTIONS } from "../utils/imageEditor";
import { ART_CARD_PACKS, SHOWCASE_DESIGN_PRESETS, ShowcaseDesignPreset, ShowcasePresetCategory } from "../utils/showcaseArtLibrary";
import {
  exportShowcaseDesignDataUrl,
  renderShowcaseDesignToCanvas,
} from "../utils/showcaseRenderer";
import { readFileAsDataUrl, triggerDownload } from "../utils/storage";
import { svgToDataUrl } from "../utils/stickerLibrary";

interface DesignCreatePageProps {
  photos: PhotoItem[];
  initialPhoto?: PhotoItem | null;
  onNavigate: (page: PageId) => void;
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onSendToPage: (page: PageId, photo: PhotoItem) => void;
}

const ASPECT_OPTIONS: { id: ShowcaseAspectId; label: string }[] = [
  { id: "9:16", label: "9:16 Pin" },
  { id: "2:3", label: "2:3 Poster" },
  { id: "4:5", label: "4:5 Social" },
  { id: "1:1", label: "1:1 Square" },
];

const LAYOUT_OPTIONS: { id: ShowcaseLayoutId; label: string; desc: string }[] = [
  { id: "center-plaque-6", label: "6 Cards + Center Plaque", desc: "3 top · Title center · 3 bottom" },
  { id: "top-banner-5", label: "Top Banner + 5 Fan", desc: "Header · 5 tilted pages" },
  { id: "hero-plus-4", label: "Hero Sheet + 4 Cards", desc: "1 large center · 4 previews" },
  { id: "diagonal-cascade-5", label: "Diagonal Cascade 5", desc: "Dynamic 5-card sweep" },
  { id: "spotlight-trio-3", label: "Spotlight Trio 3", desc: "1 big hero · 2 wings" },
  { id: "clean-grid-4", label: "4-Card Editorial Grid", desc: "Top banner · 2×2 showcase" },
];

const BACKDROP_OPTIONS: { id: ShowcaseBackdropId; label: string; swatch: string }[] = [
  { id: "craft-table-lights", label: "Craft Wood & Holly", swatch: "linear-gradient(135deg, #6B4226, #14532D)" },
  { id: "festive-pine-desk", label: "Festive Pine & Crayons", swatch: "linear-gradient(135deg, #704728, #DC2626)" },
  { id: "spring-botanical-oak", label: "Sunlit Botanical Oak", swatch: "linear-gradient(135deg, #D2AE82, #65A30D)" },
  { id: "pastel-kids-desk", label: "Warm Kids Studio", swatch: "linear-gradient(135deg, #E7CFAF, #3B82F6)" },
  { id: "midnight-studio-gold", label: "Dark Walnut & Gold", swatch: "linear-gradient(135deg, #29201B, #FBBF24)" },
  { id: "galaxy-nebula-desk", label: "Galaxy Night & Stars", swatch: "linear-gradient(135deg, #0F172A, #7C3AED)" },
  { id: "ocean-mint-atelier", label: "Coastal Mint & Sky", swatch: "linear-gradient(135deg, #E0F2FE, #14B8A6)" },
  { id: "candy-pastel-confetti", label: "Pastel Confetti Studio", swatch: "linear-gradient(135deg, #FDF4FF, #F43F5E)" },
  { id: "blush-floral-linen", label: "Blush Floral Linen", swatch: "linear-gradient(135deg, #FFF1F5, #F472B6)" },
  { id: "terrazzo-cream-studio", label: "Terrazzo Craft Cream", swatch: "linear-gradient(135deg, #FCF8F2, #D97706)" },
  { id: "editorial-sage-marble", label: "Editorial Sage Marble", swatch: "linear-gradient(135deg, #F3F6F3, #065F46)" },
];

const BACKDROP_SWATCH_MAP: Record<string, string> = Object.fromEntries(
  BACKDROP_OPTIONS.map((b) => [b.id, b.swatch])
);

const PRESET_CATEGORY_TABS: { id: "all" | ShowcasePresetCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "kids", label: "Kids" },
  { id: "myanmar", label: "Myanmar" },
  { id: "seasonal", label: "Seasonal" },
  { id: "learning", label: "Learning" },
  { id: "aesthetic", label: "Aesthetic" },
];

const PLAQUE_OPTIONS: { id: ShowcasePlaqueStyle; label: string }[] = [
  { id: "wood-plaque", label: "Wood Plaque + Ribbon" },
  { id: "cloud-sticker", label: "Cloud Sticker" },
  { id: "ribbon-badge", label: "Clean Badge" },
  { id: "scallop-frame", label: "Scallop Frame" },
  { id: "polaroid-strip", label: "Editorial Tape Card" },
];

function PresetMiniPreview({ preset }: { preset: ShowcaseDesignPreset }) {
  const bg = BACKDROP_SWATCH_MAP[preset.config.backdrop] || "linear-gradient(135deg, #F4F4F5, #E4E4E7)";
  const layout = preset.config.layout;
  const isCenter = layout === "center-plaque-6";
  const isTrio = layout === "spotlight-trio-3";

  return (
    <div
      className="w-11 h-14 rounded-lg border border-black/15 shrink-0 relative overflow-hidden shadow-xs"
      style={{ background: bg }}
      aria-hidden="true"
    >
      {/* Miniature card shapes */}
      {isCenter ? (
        <>
          <span className="absolute top-1 left-1 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs -rotate-6" />
          <span className="absolute top-0.5 left-4 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs" />
          <span className="absolute top-1 right-1 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs rotate-6" />
          <span className="absolute bottom-1 left-1 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs -rotate-6" />
          <span className="absolute bottom-0.5 left-4 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs" />
          <span className="absolute bottom-1 right-1 w-2.5 h-3 rounded-[2px] bg-white/95 shadow-xs rotate-6" />
        </>
      ) : isTrio ? (
        <>
          <span className="absolute bottom-1.5 left-1 w-3.5 h-4 rounded-[2px] bg-white/85 shadow-xs -rotate-6" />
          <span className="absolute bottom-1.5 right-1 w-3.5 h-4 rounded-[2px] bg-white/85 shadow-xs rotate-6" />
          <span className="absolute bottom-2 left-3 w-5 h-6 rounded-[2px] bg-white shadow-sm" />
        </>
      ) : (
        <>
          <span className="absolute bottom-3 left-1.5 w-3.5 h-4 rounded-[2px] bg-white/90 shadow-xs -rotate-6" />
          <span className="absolute bottom-3 right-1.5 w-3.5 h-4 rounded-[2px] bg-white/90 shadow-xs rotate-6" />
          <span className="absolute bottom-1 left-3.5 w-4 h-4.5 rounded-[2px] bg-white shadow-sm" />
        </>
      )}

      {/* Miniature banner accent strip */}
      <div
        className={`absolute left-1 right-1 h-3 rounded-[3px] flex items-center justify-center px-0.5 shadow-xs ${
          isCenter ? "top-1/2 -translate-y-1/2" : "top-1"
        }`}
        style={{ backgroundColor: preset.config.plaqueBgColor || "#FFFFFF" }}
      >
        <span
          className="w-full h-1.5 rounded-full"
          style={{ backgroundColor: preset.config.ribbonColor || preset.config.primaryColor }}
        />
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  { label: "Fredoka Rounded", value: "'Fredoka', 'Padauk', sans-serif" },
  { label: "Bricolage Editorial", value: "'Bricolage Grotesque', 'Padauk', sans-serif" },
  { label: "Caveat Hand-Drawn", value: "'Caveat', 'Padauk', cursive" },
  { label: "Padauk Myanmar", value: "'Padauk', 'Noto Sans Myanmar', sans-serif" },
];

const QUICK_PROMPT_IDEAS = [
  "25 Cutest Christmas Handprint Crafts for Kids",
  "Christmas Coloring Pages for Kids",
  "30 Adorable Dinosaur Coloring Pages",
  "Easter Bunny Craft & Coloring Pack",
  "ကလေးများအတွက် တိရစ္ဆာန် Coloring Book",
];

const COLOR_SWATCHES = [
  "#DC2626",
  "#15803D",
  "#14532D",
  "#2563EB",
  "#0F766E",
  "#E11D48",
  "#F59E0B",
  "#FDE047",
  "#1C1917",
  "#FFFFFF",
];

const HERO_TEXT_STYLES: { id: ShowcaseHeroTextStyle; label: string }[] = [
  { id: "outline-3d", label: "Outline 3D" },
  { id: "pill-box", label: "Bg Pill" },
  { id: "shadow", label: "Drop Shadow" },
  { id: "block-3d", label: "3D Block" },
  { id: "neon", label: "Neon Glow" },
  { id: "clean", label: "Clean" },
];

const CARD_OVERLAY_STYLES: { id: CardOverlayTextStyle; label: string }[] = [
  { id: "pill-box", label: "Pill Box" },
  { id: "banner-ribbon", label: "Banner Ribbon" },
  { id: "outline-3d", label: "Outline 3D" },
  { id: "shadow", label: "Shadow" },
  { id: "clean", label: "Clean" },
];

const CUSTOM_TEXT_STYLE_PRESETS: { id: TextStylePreset; label: string }[] = [
  { id: "comic-3d", label: "Comic 3D" },
  { id: "banner-pill", label: "Banner Pill" },
  { id: "ribbon-scroll", label: "Ribbon" },
  { id: "pill-box", label: "Bg Box" },
  { id: "outline", label: "Outline" },
  { id: "shadow", label: "Shadow" },
  { id: "block-3d", label: "3D Block" },
  { id: "neon", label: "Neon" },
  { id: "gradient", label: "Gradient" },
  { id: "clean", label: "Clean" },
];

function createDesignCustomTextLayer(index: number, fontFamily: string): TextLayer {
  return {
    id: `dtext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: index === 1 ? "NEW TEXT" : `Text ${index}`,
    x: 50,
    y: index === 1 ? 14 : Math.min(86, 22 + index * 12),
    fontSize: 64,
    fontFamily: fontFamily || STUDIO_FONT_OPTIONS[0].family,
    fontWeight: "700",
    color: "#FFFFFF",
    accentColor: "#F59E0B",
    bgColor: "#DC2626",
    strokeColor: "#111113",
    strokeWidth: 8,
    curve: 0,
    boundStyle: "none",
    boundPadX: 32,
    boundPadY: 14,
    boundThickness: 4,
    boundRadius: 16,
    boundColor: "#FFFFFF",
    boundFillColor: "#111113",
    boundFillOpacity: 0.75,
    stylePreset: "banner-pill",
    align: "center",
    rotation: 0,
    letterSpacing: 0,
    opacity: 1,
  };
}

export function DesignCreatePage({
  photos,
  initialPhoto,
  onNavigate,
  onSaveNewPhoto,
  onSendToPage,
}: DesignCreatePageProps) {
  const [config, setConfig] = useState<ShowcaseDesignConfig>(
    () => SHOWCASE_DESIGN_PRESETS[0].config
  );
  const [activePresetId, setActivePresetId] = useState<string>(SHOWCASE_DESIGN_PRESETS[0].id);
  const [presetCategory, setPresetCategory] = useState<"all" | ShowcasePresetCategory>("all");
  const [inspectorTab, setInspectorTab] = useState<"layout" | "typography" | "cards">(
    "layout"
  );
  const [activeCustomTextId, setActiveCustomTextId] = useState<string>("");
  const [expandedCardTextIdx, setExpandedCardTextIdx] = useState<number | null>(0);

  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [hallPickerSlotIdx, setHallPickerSlotIdx] = useState<number | null>(null);
  const [uploadTargetSlotIdx, setUploadTargetSlotIdx] = useState<number>(0);
  const [savingHall, setSavingHall] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialPhoto) return;
    setConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c, idx) =>
        idx === 0
          ? {
              ...c,
              imageUrl: initialPhoto.dataUrl,
              title: initialPhoto.title.slice(0, 32),
              paper: "white",
            }
          : c
      ),
    }));
    setInspectorTab("cards");
    setAiNotice(`Loaded "${initialPhoto.title}" into Showcase Card #1.`);
  }, [initialPhoto]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    renderShowcaseDesignToCanvas(canvas, config).catch(() => {
      if (!cancelled) {
        // Ignore transient image decode error
      }
    });
    return () => {
      cancelled = true;
    };
  }, [config]);

  const updateConfig = (patch: Partial<ShowcaseDesignConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const customLayers = config.customTextLayers || [];
  const activeCustomLayer =
    customLayers.find((l) => l.id === activeCustomTextId) || customLayers[0] || null;

  const updateCardSlot = (idx: number, patch: Partial<ShowcaseCardSlot>) => {
    setConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const handleAddCustomText = () => {
    const next = createDesignCustomTextLayer(customLayers.length + 1, config.fontFamily);
    updateConfig({ customTextLayers: [...customLayers, next] });
    setActiveCustomTextId(next.id);
  };

  const updateActiveCustomText = (patch: Partial<TextLayer>) => {
    if (!activeCustomLayer) return;
    updateConfig({
      customTextLayers: customLayers.map((l) =>
        l.id === activeCustomLayer.id ? { ...l, ...patch } : l
      ),
    });
  };

  const handleDeleteCustomText = (id: string) => {
    const remaining = customLayers.filter((l) => l.id !== id);
    updateConfig({ customTextLayers: remaining });
    if (activeCustomTextId === id) {
      setActiveCustomTextId(remaining[0]?.id || "");
    }
  };

  const handleDuplicateCustomText = () => {
    if (!activeCustomLayer) return;
    const copy: TextLayer = {
      ...activeCustomLayer,
      id: `dtext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      y: Math.min(92, activeCustomLayer.y + 8),
    };
    updateConfig({ customTextLayers: [...customLayers, copy] });
    setActiveCustomTextId(copy.id);
  };

  const applyPreset = (presetId: string) => {
    const found = SHOWCASE_DESIGN_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setActivePresetId(found.id);
    setConfig({
      ...found.config,
      cards: found.config.cards.map((c) => ({ ...c })),
    });
    setActiveCustomTextId("");
    setAiNotice(null);
    setAiError(null);
  };

  const handleAiCompose = async (customPrompt?: string) => {
    const query = (customPrompt ?? aiPrompt).trim();
    if (!query || generatingAi) return;
    setGeneratingAi(true);
    setAiError(null);
    setAiNotice(null);

    try {
      const res = await fetch("/api/design/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          preferredLayout: config.layout,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to compose design.");
      }

      const d = data.design as Omit<Partial<ShowcaseDesignConfig>, "cards"> & {
        cards?: Array<{ label: string; paper: ShowcaseCardPaper; svg: string }>;
      };

      let nextCards: ShowcaseCardSlot[] = config.cards;
      if (Array.isArray(d.cards) && d.cards.length > 0) {
        nextCards = d.cards.map((c, idx) => ({
          id: `ai-card-${Date.now()}-${idx}`,
          label: c.label || `Card ${idx + 1}`,
          paper: c.paper || "white",
          src: svgToDataUrl(c.svg),
        }));
      }

      setConfig((prev) => ({
        ...prev,
        accentBadge: typeof d.accentBadge === "string" ? d.accentBadge : prev.accentBadge,
        titleLine1: d.titleLine1 || prev.titleLine1,
        titleLine2Ribbon: d.titleLine2Ribbon || prev.titleLine2Ribbon,
        titleLine3: d.titleLine3 || prev.titleLine3,
        subtitleText: typeof d.subtitleText === "string" ? d.subtitleText : prev.subtitleText,
        footerBrandText:
          typeof d.footerBrandText === "string" ? d.footerBrandText : prev.footerBrandText,
        layout: (d.layout as ShowcaseLayoutId) || prev.layout,
        backdrop: (d.backdrop as ShowcaseBackdropId) || prev.backdrop,
        plaqueStyle: (d.plaqueStyle as ShowcasePlaqueStyle) || prev.plaqueStyle,
        decorTheme: d.decorTheme || prev.decorTheme,
        primaryColor: d.primaryColor || prev.primaryColor,
        secondaryColor: d.secondaryColor || prev.secondaryColor,
        ribbonColor: d.ribbonColor || prev.ribbonColor,
        subtitleBgColor: d.subtitleBgColor || prev.subtitleBgColor,
        subtitleTextColor: d.subtitleTextColor || prev.subtitleTextColor,
        footerBgColor: d.footerBgColor || prev.footerBgColor,
        cards: nextCards,
      }));
      setActivePresetId("");

      if (data.notice) {
        setAiNotice(data.notice);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to compose design.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleFillCardsFromPhotoHall = () => {
    if (photos.length === 0) return;
    setConfig((prev) => {
      const updated = prev.cards.map((slot, idx) => {
        const picked = photos[idx % photos.length];
        return {
          ...slot,
          label: picked.title || `Photo ${idx + 1}`,
          src: picked.dataUrl,
          paper: "white" as ShowcaseCardPaper,
        };
      });
      return { ...prev, cards: updated };
    });
  };

  const handleUploadCardSlot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await readFileAsDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, "") || "Uploaded Card";
      setConfig((prev) => ({
        ...prev,
        cards: prev.cards.map((c, idx) =>
          idx === uploadTargetSlotIdx ? { ...c, src: dataUrl, label: cleanName } : c
        ),
      }));
    } catch {
      setAiError("Unable to read selected image file.");
    }
    e.target.value = "";
  };

  const handleUploadCustomBackdrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await readFileAsDataUrl(file);
      updateConfig({ backdrop: "custom", customBackdropSrc: dataUrl });
    } catch {
      setAiError("Unable to read background image.");
    }
    e.target.value = "";
  };

  const buildPhotoItemFromDesign = async (): Promise<PhotoItem> => {
    const { dataUrl, width, height } = await exportShowcaseDesignDataUrl(config);
    const now = Date.now();
    const title = [
      config.accentBadge,
      config.titleLine1,
      config.titleLine2Ribbon,
      config.titleLine3,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 64);

    return {
      id: `design-${now}-${Math.random().toString(36).slice(2, 6)}`,
      title: title || "Showcase Poster Design",
      prompt: aiPrompt || title || "Showcase Poster Design",
      dataUrl,
      width,
      height,
      aspectRatio: config.aspect,
      mood: config.backdrop,
      kind: "curated",
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleDownloadPng = async () => {
    setExportingPng(true);
    try {
      const { dataUrl } = await exportShowcaseDesignDataUrl(config);
      const slug =
        `${config.titleLine1}-${config.titleLine2Ribbon}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-|-$/g, "") || "showcase-design";
      triggerDownload(dataUrl, `${slug}.png`);
    } finally {
      setExportingPng(false);
    }
  };

  const handleSaveToPhotoHall = async () => {
    setSavingHall(true);
    try {
      const item = await buildPhotoItemFromDesign();
      await onSaveNewPhoto(item);
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2200);
    } finally {
      setSavingHall(false);
    }
  };

  const handleSendDesignTo = async (target: "erase" | "ai-edit" | "text" | "book") => {
    setSavingHall(true);
    try {
      const item = await buildPhotoItemFromDesign();
      await onSaveNewPhoto(item);
      onSendToPage(target, item);
    } finally {
      setSavingHall(false);
    }
  };

  const visibleCardCount =
    config.layout === "center-plaque-6"
      ? 6
      : config.layout === "top-banner-5" ||
          config.layout === "hero-plus-4" ||
          config.layout === "diagonal-cascade-5"
        ? 5
        : config.layout === "spotlight-trio-3"
          ? 3
          : 4;

  const filteredPresets =
    presetCategory === "all"
      ? SHOWCASE_DESIGN_PRESETS
      : SHOWCASE_DESIGN_PRESETS.filter((p) => p.category === presetCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16 space-y-6">
      {/* Studio Header & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
              <Sparkles className="w-3 h-3" />
              <span>Showcase Poster & Pin Designer</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            New Image Design Studio
          </h1>
          <p className="text-sm text-zinc-600">
            Upload ပုံများလို လှပသော Die-Cut Sticker ခေါင်းစဉ်၊ Showcase Card များနှင့် Festive Tabletop Design အသစ်များ ဖန်တီးပါ။
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={savingHall}
            onClick={handleSaveToPhotoHall}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {savedFlag ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Saved to Photo Hall</span>
              </>
            ) : savingHall ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to Photo Hall</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={exportingPng}
            onClick={handleDownloadPng}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {exportingPng ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Full-Res PNG</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Word-Style Text & Bound Ribbon Banner + Live Crisp Canvas Preview */}
        <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-20">
          <TextBoundRibbon
            layers={customLayers}
            activeLayerId={activeCustomLayer?.id ?? null}
            onSelectLayer={(id) => setActiveCustomTextId(id)}
            onAddLayer={handleAddCustomText}
            onDuplicateLayer={handleDuplicateCustomText}
            onDeleteLayer={handleDeleteCustomText}
            onUpdateLayer={updateActiveCustomText}
            stylePresets={CUSTOM_TEXT_STYLE_PRESETS}
            defaultBoundColor="#FFFFFF"
            defaultBoundFillColor="#111113"
            defaultBoundFillOpacity={0.75}
          />

          <div className="bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-800 shadow-xl flex flex-col items-center gap-3">
            {/* Aspect Ratio Selector */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-400">Live Design Preview</span>
              <div className="flex items-center gap-1 bg-zinc-800/90 p-1 rounded-lg">
                {ASPECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateConfig({ aspect: opt.id })}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${
                      config.aspect === opt.id
                        ? "bg-white text-zinc-950"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="w-full flex justify-center overflow-hidden rounded-xl bg-zinc-950/50">
              <canvas
                ref={canvasRef}
                className="max-h-[58vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
              />
            </div>

            {/* Send Design Directly to Other Tools */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/90">
              <span className="text-[11px] text-zinc-400">Open finished design in:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={savingHall}
                  onClick={() => handleSendDesignTo("erase")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Select &amp; Erase</span>
                </button>
                <button
                  type="button"
                  disabled={savingHall}
                  onClick={() => handleSendDesignTo("ai-edit")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI Edit</span>
                </button>
                <button
                  type="button"
                  disabled={savingHall}
                  onClick={() => handleSendDesignTo("text")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  <Type className="w-3 h-3" />
                  <span>Text Studio</span>
                </button>
                <button
                  type="button"
                  disabled={savingHall}
                  onClick={() => handleSendDesignTo("book")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Book Cover</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Generator + Style & Content Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Topic Composer Box */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-zinc-950">
                  AI Design Generator (စိတ်ကြိုက် Theme ဖြင့် ပုံဒီဇိုင်းအသစ် ဖန်တီးရန်)
                </h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAiCompose();
                }}
                placeholder="ဥပမာ - 25 Cute Dinosaur Coloring Pages for Kids / Easter Crafts..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                disabled={!aiPrompt.trim() || generatingAi}
                onClick={() => handleAiCompose()}
                className="min-h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-45 cursor-pointer whitespace-nowrap"
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Design...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create New Design</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Idea Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-500 mr-1">Ideas:</span>
              {QUICK_PROMPT_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setAiPrompt(idea);
                    handleAiCompose(idea);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>

            {aiNotice && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                {aiNotice}
              </p>
            )}
            {aiError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {aiError}
              </p>
            )}
          </div>

          {/* 1-Click Showcase Templates Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-950">
                Ready-Made Showcase Style Presets (ပုံစံနမူနာများ)
              </h2>
              <span className="text-xs font-medium text-zinc-500 tabular-nums">
                {filteredPresets.length} / {SHOWCASE_DESIGN_PRESETS.length} designs
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div
              role="tablist"
              aria-label="Preset categories"
              className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-xl"
            >
              {PRESET_CATEGORY_TABS.map((tab) => {
                const isSelected = presetCategory === tab.id;
                const count =
                  tab.id === "all"
                    ? SHOWCASE_DESIGN_PRESETS.length
                    : SHOWCASE_DESIGN_PRESETS.filter((p) => p.category === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setPresetCategory(tab.id)}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {tab.label}{" "}
                    <span className="text-zinc-400 font-normal tabular-nums">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Preset Grid with Mini Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const active = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      active
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-zinc-50/70 text-zinc-900 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <PresetMiniPreview preset={preset} />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-semibold truncate">{preset.label}</p>
                      <p
                        className={`text-[11px] truncate ${
                          active ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {preset.config.titleLine1 || preset.config.titleLine2Ribbon}
                      </p>
                      <p
                        className={`text-[10px] truncate tabular-nums ${
                          active ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {preset.badge} · {preset.config.aspect}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabbed Detail Customizer */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50">
              <button
                type="button"
                onClick={() => setInspectorTab("layout")}
                className={`py-3 px-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                  inspectorTab === "layout"
                    ? "border-zinc-950 text-zinc-950 bg-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Layout & Scene</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab("typography")}
                className={`py-3 px-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                  inspectorTab === "typography"
                    ? "border-zinc-950 text-zinc-950 bg-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Banner Text & Style</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab("cards")}
                className={`py-3 px-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                  inspectorTab === "cards"
                    ? "border-zinc-950 text-zinc-950 bg-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Cards ({visibleCardCount})</span>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {inspectorTab === "layout" && (
                <>
                  {/* Card Arrangement Layout */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-zinc-800 block">
                      Poster Card Arrangement
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {LAYOUT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateConfig({ layout: opt.id })}
                          className={`text-left p-3 rounded-xl border cursor-pointer transition-all ${
                            config.layout === opt.id
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "border-zinc-200 bg-zinc-50/70 text-zinc-900 hover:border-zinc-400"
                          }`}
                        >
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              config.layout === opt.id ? "text-zinc-300" : "text-zinc-500"
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scene Backdrop */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-800">
                        Tabletop Scene Backdrop
                      </span>
                      <div>
                        <input
                          ref={customBgInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCustomBackdrop}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => customBgInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Custom Bg</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BACKDROP_OPTIONS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => updateConfig({ backdrop: bg.id })}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                            config.backdrop === bg.id
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-lg shrink-0 border border-black/15"
                            style={{ background: bg.swatch }}
                          />
                          <span className="text-[11px] font-semibold leading-tight">
                            {bg.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plaque Style + Captions Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-zinc-100">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-800 block">
                        Title Sticker Backing
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PLAQUE_OPTIONS.map((pq) => (
                          <button
                            key={pq.id}
                            type="button"
                            onClick={() => updateConfig({ plaqueStyle: pq.id })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border cursor-pointer ${
                              config.plaqueStyle === pq.id
                                ? "bg-zinc-950 text-white border-zinc-950"
                                : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            {pq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-800 block">
                        Theme Accents
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(["christmas", "hearts", "stars", "botanical", "sparkle"] as const).map((dec) => (
                          <button
                            key={dec}
                            type="button"
                            onClick={() => updateConfig({ decorTheme: dec })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border capitalize cursor-pointer ${
                              config.decorTheme === dec
                                ? "bg-zinc-950 text-white border-zinc-950"
                                : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            {dec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {inspectorTab === "typography" && (
                <div className="space-y-5">
                  {/* Text Content Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">
                        Accent Number / Badge (optional)
                      </span>
                      <input
                        type="text"
                        value={config.accentBadge}
                        onChange={(e) => updateConfig({ accentBadge: e.target.value })}
                        placeholder="e.g. 25 or leave empty"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Title Line 1</span>
                      <input
                        type="text"
                        value={config.titleLine1}
                        onChange={(e) => updateConfig({ titleLine1: e.target.value })}
                        placeholder="Leave blank to hide"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">
                        Line 2 (Ribbon / Main Bold)
                      </span>
                      <input
                        type="text"
                        value={config.titleLine2Ribbon}
                        onChange={(e) => updateConfig({ titleLine2Ribbon: e.target.value })}
                        placeholder="Leave blank to hide"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Title Line 3</span>
                      <input
                        type="text"
                        value={config.titleLine3}
                        onChange={(e) => updateConfig({ titleLine3: e.target.value })}
                        placeholder="Leave blank to hide"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Subtitle Pill</span>
                      <input
                        type="text"
                        value={config.subtitleText}
                        onChange={(e) => updateConfig({ subtitleText: e.target.value })}
                        placeholder="Leave blank to hide"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">
                        Bottom Website / Brand Ribbon
                      </span>
                      <input
                        type="text"
                        value={config.footerBrandText}
                        onChange={(e) => updateConfig({ footerBrandText: e.target.value })}
                        placeholder="e.g. LuminaStudio.com (blank to hide)"
                        className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </label>
                  </div>

                  {/* Display Font, Banner Scale & Banner Position (+ / -) */}
                  <div className="space-y-3 pt-2 border-t border-zinc-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className="sm:col-span-8 space-y-2">
                        <span className="text-xs font-semibold text-zinc-800 block">Display Font</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {FONT_OPTIONS.map((f) => (
                            <button
                              key={f.value}
                              type="button"
                              onClick={() => updateConfig({ fontFamily: f.value })}
                              className={`px-2.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer truncate ${
                                config.fontFamily === f.value
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400"
                              }`}
                              style={{ fontFamily: f.value }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <StepperControl
                          label="Title Scale"
                          value={config.titleFontScale ?? 100}
                          min={60}
                          max={150}
                          step={5}
                          unit="%"
                          onChange={(val) => updateConfig({ titleFontScale: val })}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-800">
                          Whole Banner Position (စာသားဘောင်တစ်ခုလုံး အပေါ်/အောက်/ဘယ်/ညာ ရွှေ့ရန်)
                        </span>
                        {((config.bannerOffsetX ?? 0) !== 0 || (config.bannerOffsetY ?? 0) !== 0) && (
                          <button
                            type="button"
                            onClick={() => updateConfig({ bannerOffsetX: 0, bannerOffsetY: 0 })}
                            className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                          >
                            Reset Center
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <StepperControl
                          compact
                          label="Left (-) ↔ Right (+)"
                          value={config.bannerOffsetX ?? 0}
                          min={-35}
                          max={35}
                          step={2}
                          unit="%"
                          onChange={(val) => updateConfig({ bannerOffsetX: val })}
                        />
                        <StepperControl
                          compact
                          label="Up (-) ↕ Down (+)"
                          value={config.bannerOffsetY ?? 0}
                          min={-35}
                          max={35}
                          step={2}
                          unit="%"
                          onChange={(val) => updateConfig({ bannerOffsetY: val })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plaque Background Color + Apply All Text Style */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-900">
                        Banner Card Background Color &amp; Text Style Presets
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] font-medium cursor-pointer">
                          <span>Plaque Bg</span>
                          <input
                            type="color"
                            value={
                              config.plaqueBgColor && config.plaqueBgColor !== "transparent"
                                ? config.plaqueBgColor
                                : "#FAF5EB"
                            }
                            onChange={(e) => updateConfig({ plaqueBgColor: e.target.value })}
                            className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateConfig({
                              plaqueBgColor:
                                config.plaqueBgColor === "transparent" ? undefined : "transparent",
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            config.plaqueBgColor === "transparent"
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          {config.plaqueBgColor === "transparent"
                            ? "Transparent Plaque"
                            : "Hide Plaque Bg"}
                        </button>
                      </div>
                    </div>

                    {/* Per-Line Style, Text Color & Text Background Color */}
                    <div className="space-y-2.5">
                      {/* Line 1 Controls */}
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-zinc-900">
                            Line 1 ({config.titleLine1 || "Badge / Heading"})
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Text</span>
                              <input
                                type="color"
                                value={config.title1Color || config.primaryColor}
                                onChange={(e) => updateConfig({ title1Color: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Text Bg</span>
                              <input
                                type="color"
                                value={
                                  config.title1BgColor && config.title1BgColor !== "transparent"
                                    ? config.title1BgColor
                                    : "#FDE047"
                                }
                                onChange={(e) => updateConfig({ title1BgColor: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                            {config.title1BgColor && config.title1BgColor !== "transparent" && (
                              <button
                                type="button"
                                onClick={() => updateConfig({ title1BgColor: "transparent" })}
                                className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-900 bg-zinc-100 rounded cursor-pointer"
                              >
                                Clear Bg
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {HERO_TEXT_STYLES.map((st) => (
                            <button
                              key={`l1-${st.id}`}
                              type="button"
                              onClick={() => updateConfig({ title1Style: st.id })}
                              className={`px-2 py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                                (config.title1Style || "outline-3d") === st.id
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <StepperControl
                            compact
                            label="Left (-) ↔ Right (+)"
                            value={config.title1OffsetX ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title1OffsetX: val })}
                          />
                          <StepperControl
                            compact
                            label="Up (-) ↕ Down (+)"
                            value={config.title1OffsetY ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title1OffsetY: val })}
                          />
                        </div>
                      </div>

                      {/* Line 2 Ribbon Controls */}
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-zinc-900">
                            Line 2 ({config.titleLine2Ribbon || "Main Ribbon"})
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Text</span>
                              <input
                                type="color"
                                value={config.title2TextColor || "#FFFFFF"}
                                onChange={(e) => updateConfig({ title2TextColor: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Ribbon / Bg</span>
                              <input
                                type="color"
                                value={config.ribbonColor}
                                onChange={(e) => updateConfig({ ribbonColor: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => updateConfig({ title2Style: "ribbon" })}
                            className={`px-2 py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                              (config.title2Style ||
                                (config.plaqueStyle === "cloud-sticker" ? "outline-3d" : "ribbon")) ===
                              "ribbon"
                                ? "bg-zinc-950 text-white border-zinc-950"
                                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            Ribbon
                          </button>
                          {HERO_TEXT_STYLES.map((st) => (
                            <button
                              key={`l2-${st.id}`}
                              type="button"
                              onClick={() => updateConfig({ title2Style: st.id })}
                              className={`px-2 py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                                (config.title2Style ||
                                  (config.plaqueStyle === "cloud-sticker"
                                    ? "outline-3d"
                                    : "ribbon")) === st.id
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <StepperControl
                            compact
                            label="Left (-) ↔ Right (+)"
                            value={config.title2OffsetX ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title2OffsetX: val })}
                          />
                          <StepperControl
                            compact
                            label="Up (-) ↕ Down (+)"
                            value={config.title2OffsetY ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title2OffsetY: val })}
                          />
                        </div>
                      </div>

                      {/* Line 3 Controls */}
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-zinc-900">
                            Line 3 ({config.titleLine3 || "Sub-Heading"})
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Text</span>
                              <input
                                type="color"
                                value={config.title3Color || config.secondaryColor}
                                onChange={(e) => updateConfig({ title3Color: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                              <span>Text Bg</span>
                              <input
                                type="color"
                                value={
                                  config.title3BgColor && config.title3BgColor !== "transparent"
                                    ? config.title3BgColor
                                    : "#FFFFFF"
                                }
                                onChange={(e) => updateConfig({ title3BgColor: e.target.value })}
                                className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                              />
                            </label>
                            {config.title3BgColor && config.title3BgColor !== "transparent" && (
                              <button
                                type="button"
                                onClick={() => updateConfig({ title3BgColor: "transparent" })}
                                className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-900 bg-zinc-100 rounded cursor-pointer"
                              >
                                Clear Bg
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {HERO_TEXT_STYLES.map((st) => (
                            <button
                              key={`l3-${st.id}`}
                              type="button"
                              onClick={() => updateConfig({ title3Style: st.id })}
                              className={`px-2 py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                                (config.title3Style || "outline-3d") === st.id
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <StepperControl
                            compact
                            label="Left (-) ↔ Right (+)"
                            value={config.title3OffsetX ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title3OffsetX: val })}
                          />
                          <StepperControl
                            compact
                            label="Up (-) ↕ Down (+)"
                            value={config.title3OffsetY ?? 0}
                            min={-250}
                            max={250}
                            step={10}
                            unit="px"
                            onChange={(val) => updateConfig({ title3OffsetY: val })}
                          />
                        </div>
                      </div>

                      {/* Subtitle & Footer Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-zinc-900">Subtitle</span>
                            <div className="flex items-center gap-1">
                              <label className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                                <span>Text</span>
                                <input
                                  type="color"
                                  value={config.subtitleTextColor}
                                  onChange={(e) =>
                                    updateConfig({ subtitleTextColor: e.target.value })
                                  }
                                  className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                                />
                              </label>
                              <label className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                                <span>Bg</span>
                                <input
                                  type="color"
                                  value={
                                    config.subtitleBgColor === "transparent"
                                      ? "#14532D"
                                      : config.subtitleBgColor
                                  }
                                  onChange={(e) =>
                                    updateConfig({ subtitleBgColor: e.target.value })
                                  }
                                  className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(["pill", "outline-3d", "shadow", "clean"] as const).map((st) => (
                              <button
                                key={`sub-${st}`}
                                type="button"
                                onClick={() => updateConfig({ subtitleStyle: st })}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded border capitalize cursor-pointer ${
                                  (config.subtitleStyle || "pill") === st
                                    ? "bg-zinc-950 text-white border-zinc-950"
                                    : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <StepperControl
                              compact
                              label="Left ↔ Right"
                              value={config.subtitleOffsetX ?? 0}
                              min={-250}
                              max={250}
                              step={10}
                              unit="px"
                              onChange={(val) => updateConfig({ subtitleOffsetX: val })}
                            />
                            <StepperControl
                              compact
                              label="Up ↕ Down"
                              value={config.subtitleOffsetY ?? 0}
                              min={-250}
                              max={250}
                              step={10}
                              unit="px"
                              onChange={(val) => updateConfig({ subtitleOffsetY: val })}
                            />
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-zinc-900">Footer Brand</span>
                            <div className="flex items-center gap-1">
                              <label className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                                <span>Text</span>
                                <input
                                  type="color"
                                  value={config.footerTextColor || "#FFFFFF"}
                                  onChange={(e) =>
                                    updateConfig({ footerTextColor: e.target.value })
                                  }
                                  className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                                />
                              </label>
                              <label className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] cursor-pointer">
                                <span>Bg</span>
                                <input
                                  type="color"
                                  value={
                                    config.footerBgColor === "transparent"
                                      ? "#DC2626"
                                      : config.footerBgColor
                                  }
                                  onChange={(e) => updateConfig({ footerBgColor: e.target.value })}
                                  className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(["pill", "outline-3d", "shadow", "clean"] as const).map((st) => (
                              <button
                                key={`ftr-${st}`}
                                type="button"
                                onClick={() => updateConfig({ footerStyle: st })}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded border capitalize cursor-pointer ${
                                  (config.footerStyle || "pill") === st
                                    ? "bg-zinc-950 text-white border-zinc-950"
                                    : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <StepperControl
                              compact
                              label="Left ↔ Right"
                              value={config.footerOffsetX ?? 0}
                              min={-35}
                              max={35}
                              step={2}
                              unit="%"
                              onChange={(val) => updateConfig({ footerOffsetX: val })}
                            />
                            <StepperControl
                              compact
                              label="Up ↕ Down"
                              value={config.footerOffsetY ?? 0}
                              min={-85}
                              max={4}
                              step={2}
                              unit="%"
                              onChange={(val) => updateConfig({ footerOffsetY: val })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-700 block">
                        Quick Theme Primary Accent
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_SWATCHES.slice(0, 8).map((c) => (
                          <button
                            key={`pri-${c}`}
                            type="button"
                            aria-label={`Primary color ${c}`}
                            onClick={() =>
                              updateConfig({
                                primaryColor: c,
                                ribbonColor: c,
                                footerBgColor: c,
                                title1Color: c,
                              })
                            }
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                              config.primaryColor === c ? "border-zinc-950 scale-110" : "border-white shadow"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-700 block">
                        Quick Theme Secondary Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_SWATCHES.slice(0, 8).map((c) => (
                          <button
                            key={`sec-${c}`}
                            type="button"
                            aria-label={`Secondary color ${c}`}
                            onClick={() =>
                              updateConfig({ secondaryColor: c, title3Color: c })
                            }
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                              config.secondaryColor === c ? "border-zinc-950 scale-110" : "border-white shadow"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === "cards" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={photos.length === 0}
                        onClick={handleFillCardsFromPhotoHall}
                        className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg disabled:opacity-45 cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Fill All Cards from Photo Hall ({photos.length})</span>
                      </button>
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={config.showCardCaptions}
                          onChange={(e) => updateConfig({ showCardCaptions: e.target.checked })}
                          className="accent-zinc-950 cursor-pointer"
                        />
                        <span>Show Captions</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {ART_CARD_PACKS.map((pack) => (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => updateConfig({ cards: pack.cards.map((c) => ({ ...c })) })}
                          className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                        >
                          {pack.label.split("(")[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    ref={slotFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCardSlot}
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 gap-3">
                    {config.cards.slice(0, visibleCardCount).map((card, idx) => {
                      const isExpanded = expandedCardTextIdx === idx;
                      return (
                        <div
                          key={card.id}
                          className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={card.src}
                              alt={card.label}
                              referrerPolicy="no-referrer"
                              className="w-12 h-16 object-cover bg-white rounded-lg border border-zinc-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-zinc-900 truncate">
                                  #{idx + 1} · {card.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCardTextIdx((prev) => (prev === idx ? null : idx))
                                  }
                                  className={`px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer shrink-0 ${
                                    isExpanded || card.overlayText?.trim()
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                                  }`}
                                >
                                  {isExpanded ? "Hide Image Text" : "Edit Text on Card"}
                                </button>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadTargetSlotIdx(idx);
                                    slotFileInputRef.current?.click();
                                  }}
                                  className="px-2 py-1 text-[10px] font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded cursor-pointer"
                                >
                                  Upload
                                </button>
                                <button
                                  type="button"
                                  disabled={photos.length === 0}
                                  onClick={() =>
                                    setHallPickerSlotIdx((prev) => (prev === idx ? null : idx))
                                  }
                                  className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded disabled:opacity-45 cursor-pointer"
                                >
                                  Photo Hall
                                </button>
                                <select
                                  value={card.paper}
                                  onChange={(e) => {
                                    const paper = e.target.value as ShowcaseCardPaper;
                                    updateCardSlot(idx, { paper });
                                  }}
                                  aria-label={`Paper finish for card ${idx + 1}`}
                                  className="px-1.5 py-1 text-[10px] font-medium bg-white border border-zinc-200 rounded cursor-pointer"
                                >
                                  <option value="white">White</option>
                                  <option value="kraft">Kraft</option>
                                  <option value="pastel-blue">Blue</option>
                                  <option value="pastel-cream">Cream</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Per-Card On-Image Text Editor */}
                          {isExpanded && (
                            <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <label className="block">
                                  <span className="text-[10px] font-semibold text-zinc-700">
                                    Text on Card #{idx + 1} Image
                                  </span>
                                  <input
                                    type="text"
                                    value={card.overlayText || ""}
                                    onChange={(e) =>
                                      updateCardSlot(idx, { overlayText: e.target.value })
                                    }
                                    placeholder="ပုံပေါ်တင်မည့် စာသား (e.g. Page 01)"
                                    className="mt-1 w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  />
                                </label>
                                <label className="block">
                                  <span className="text-[10px] font-semibold text-zinc-700">
                                    Bottom Paper Caption
                                  </span>
                                  <input
                                    type="text"
                                    value={card.caption ?? ""}
                                    onChange={(e) =>
                                      updateCardSlot(idx, {
                                        caption: e.target.value,
                                        label: e.target.value || card.label,
                                      })
                                    }
                                    placeholder="Card caption label..."
                                    className="mt-1 w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  />
                                </label>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1">
                                  {CARD_OVERLAY_STYLES.map((st) => (
                                    <button
                                      key={`cstyle-${idx}-${st.id}`}
                                      type="button"
                                      onClick={() => updateCardSlot(idx, { overlayStyle: st.id })}
                                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer ${
                                        (card.overlayStyle || "pill-box") === st.id
                                          ? "bg-zinc-950 text-white border-zinc-950"
                                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                      }`}
                                    >
                                      {st.label}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex items-center gap-1">
                                  {(["top", "center", "bottom"] as const).map((pos) => (
                                    <button
                                      key={`cpos-${idx}-${pos}`}
                                      type="button"
                                      onClick={() =>
                                        updateCardSlot(idx, {
                                          overlayPosition: pos,
                                          overlayY: pos === "top" ? 16 : pos === "center" ? 50 : 84,
                                        })
                                      }
                                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border capitalize cursor-pointer ${
                                        (card.overlayPosition || "bottom") === pos
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                      }`}
                                    >
                                      {pos}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <StepperControl
                                  compact
                                  label="Left (-) ↔ Right (+)"
                                  value={card.overlayX ?? 50}
                                  min={0}
                                  max={100}
                                  step={5}
                                  unit="%"
                                  onChange={(val) => updateCardSlot(idx, { overlayX: val })}
                                />
                                <StepperControl
                                  compact
                                  label="Up (-) ↕ Down (+)"
                                  value={
                                    card.overlayY ??
                                    (card.overlayPosition === "top"
                                      ? 16
                                      : card.overlayPosition === "center"
                                      ? 50
                                      : 84)
                                  }
                                  min={0}
                                  max={100}
                                  step={5}
                                  unit="%"
                                  onChange={(val) => updateCardSlot(idx, { overlayY: val })}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] cursor-pointer min-h-[36px]">
                                  <span className="font-medium text-zinc-700">Text Color</span>
                                  <input
                                    type="color"
                                    value={card.overlayColor || "#FFFFFF"}
                                    onChange={(e) =>
                                      updateCardSlot(idx, { overlayColor: e.target.value })
                                    }
                                    className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] cursor-pointer min-h-[36px]">
                                  <span className="font-medium text-zinc-700">Text Bg Color</span>
                                  <input
                                    type="color"
                                    value={
                                      card.overlayBgColor && card.overlayBgColor !== "transparent"
                                        ? card.overlayBgColor
                                        : "#111113"
                                    }
                                    onChange={(e) =>
                                      updateCardSlot(idx, { overlayBgColor: e.target.value })
                                    }
                                    className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                                  />
                                </label>
                                <StepperControl
                                  compact
                                  label="Text Size"
                                  value={card.overlayFontSize ?? 100}
                                  min={60}
                                  max={180}
                                  step={10}
                                  unit="%"
                                  onChange={(val) => updateCardSlot(idx, { overlayFontSize: val })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Photo Hall Picker for Selected Card Slot */}
                  {hallPickerSlotIdx !== null && photos.length > 0 && (
                    <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900">
                          Pick image from Photo Hall for Card #{hallPickerSlotIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setHallPickerSlotIdx(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                        {photos.map((photo) => (
                          <button
                            key={`slot-pick-${photo.id}`}
                            type="button"
                            onClick={() => {
                              updateCardSlot(hallPickerSlotIdx, {
                                src: photo.dataUrl,
                                label: photo.title,
                              });
                              setHallPickerSlotIdx(null);
                            }}
                            className="aspect-[3/4] rounded-lg border border-zinc-200 hover:border-blue-600 bg-white overflow-hidden cursor-pointer"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain p-0.5"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Jump Links to Other Studio Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate("erase")}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-left space-y-0.5 cursor-pointer"
            >
              <div className="text-xs font-semibold text-zinc-950">Select &amp; Erase</div>
              <div className="text-[11px] text-zinc-500">Brush, Lasso &amp; Wand</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("create")}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-left space-y-0.5 cursor-pointer"
            >
              <div className="text-xs font-semibold text-zinc-950">Photo Create</div>
              <div className="text-[11px] text-zinc-500">300+ DPI Coloring</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("ai-edit")}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-left space-y-0.5 cursor-pointer"
            >
              <div className="text-xs font-semibold text-zinc-950">AI Image Edit</div>
              <div className="text-[11px] text-zinc-500">Edit &amp; Style Images</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("book")}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-left space-y-0.5 cursor-pointer"
            >
              <div className="text-xs font-semibold text-zinc-950">Book Builder</div>
              <div className="text-[11px] text-zinc-500">20–35 Pages PDF/ZIP</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("text")}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-left space-y-0.5 cursor-pointer"
            >
              <div className="text-xs font-semibold text-zinc-950">Text Studio</div>
              <div className="text-[11px] text-zinc-500">Custom Text Bounds</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
