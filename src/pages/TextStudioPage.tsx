import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Download,
  Eraser,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  EraseFillMode,
  ImageRegionEraserModal,
} from "../components/ImageRegionEraserModal";
import { StepperControl } from "../components/StepperControl";
import { TextBoundRibbon } from "../components/TextBoundRibbon";
import { TextBoundSvg } from "../components/TextBoundSvg";
import {
  PhotoItem,
  TextCanvasAspect,
  TextImageFrameStyle,
  TextLayer,
  TextStudioImageLayer,
  TextStylePreset,
} from "../types/studio";
import { FONT_OPTIONS, renderTextStudioComposite } from "../utils/imageEditor";
import {
  buildColoringBookSvg,
  buildProceduralSvg,
  rasterizeSvgToPng,
} from "../utils/proceduralArt";
import {
  buildBookPromoPosterTemplate,
  getTextCanvasDimensions,
  SCENIC_BACKDROPS,
} from "../utils/promoStudio";
import { readFileAsDataUrl, triggerDownload } from "../utils/storage";

interface TextStudioPageProps {
  photos: PhotoItem[];
  initialPhoto: PhotoItem | null;
  onSaveToPhotoHall: (photo: PhotoItem) => Promise<void>;
  onBackHome: () => void;
}

const STYLE_PRESETS: { id: TextStylePreset; label: string }[] = [
  { id: "comic-3d", label: "Comic 3D" },
  { id: "banner-pill", label: "Banner Pill" },
  { id: "ribbon-scroll", label: "Ribbon" },
  { id: "clean", label: "Clean" },
  { id: "shadow", label: "Drop Shadow" },
  { id: "neon", label: "Neon Glow" },
  { id: "outline", label: "Outline" },
  { id: "pill-box", label: "Caption Box" },
  { id: "block-3d", label: "3D Block" },
  { id: "gradient", label: "Gradient" },
  { id: "quote-bar", label: "Quote Bar" },
];

const ASPECT_OPTIONS: { id: TextCanvasAspect; label: string }[] = [
  { id: "2:3", label: "2:3 Poster" },
  { id: "4:5", label: "4:5 Social" },
  { id: "1:1", label: "1:1 Square" },
  { id: "4:3", label: "4:3 Wide" },
  { id: "16:9", label: "16:9 Banner" },
  { id: "auto", label: "Auto Bg" },
];

const FRAME_STYLES: { id: TextImageFrameStyle; label: string }[] = [
  { id: "book-cover", label: "3D Book Cover" },
  { id: "tilt-card", label: "Coloring Card" },
  { id: "plain", label: "Plain Image" },
  { id: "circle-badge", label: "Circle Seal" },
];

const COLOR_SWATCHES = [
  "#FFFFFF",
  "#111113",
  "#FBBF24",
  "#22D3EE",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#10B981",
  "#451A03",
];

const STUDIO_BACKDROPS: { id: string; label: string; colors: [string, string] }[] = [
  { id: "obsidian", label: "Obsidian Dark", colors: ["#09090B", "#27272A"] },
  { id: "travertine", label: "Warm Paper", colors: ["#F5F5F0", "#E7E5E4"] },
  { id: "sunset", label: "Sunset Amber", colors: ["#7C2D12", "#F59E0B"] },
  { id: "cobalt", label: "Deep Cobalt", colors: ["#0F172A", "#2563EB"] },
];

function createDefaultLayer(index = 1): TextLayer {
  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: index === 1 ? "မင်္ဂလာပါ · GBTK STUDIO" : "New Caption",
    x: 50,
    y: index === 1 ? 50 : 72,
    fontSize: 64,
    fontFamily: FONT_OPTIONS[0].family,
    fontWeight: "700",
    color: "#FFFFFF",
    accentColor: "#F59E0B",
    bgColor: "#111113",
    strokeColor: "#111113",
    strokeWidth: 8,
    curve: 0,
    boundStyle: "none",
    boundPadX: 36,
    boundPadY: 18,
    boundThickness: 4,
    boundRadius: 14,
    boundColor: "#FFFFFF",
    boundFillColor: "#111113",
    boundFillOpacity: 0.25,
    stylePreset: "shadow",
    align: "center",
    rotation: 0,
    letterSpacing: 0,
    opacity: 1,
  };
}

export function TextStudioPage({
  photos,
  initialPhoto,
  onSaveToPhotoHall,
  onBackHome,
}: TextStudioPageProps) {
  const [bgMode, setBgMode] = useState<"image" | "gradient">("image");
  const [canvasAspect, setCanvasAspect] = useState<TextCanvasAspect>(
    initialPhoto ? "auto" : "2:3"
  );
  const [selectedSrc, setSelectedSrc] = useState<string>(
    initialPhoto?.dataUrl || SCENIC_BACKDROPS[0].dataUrl
  );
  const [selectedTitle, setSelectedTitle] = useState<string>(
    initialPhoto?.title || "Book Promo Poster"
  );
  const [selectedBackdrop, setSelectedBackdrop] = useState(STUDIO_BACKDROPS[0]);

  const [imageLayers, setImageLayers] = useState<TextStudioImageLayer[]>(() =>
    initialPhoto ? [] : buildBookPromoPosterTemplate(photos).imageLayers
  );
  const [layers, setLayers] = useState<TextLayer[]>(() =>
    initialPhoto
      ? [createDefaultLayer(1)]
      : buildBookPromoPosterTemplate(photos).textLayers
  );

  const [inspectorTab, setInspectorTab] = useState<"images" | "create">("images");
  const [selectedKind, setSelectedKind] = useState<"text" | "image">("text");
  const [activeLayerId, setActiveLayerId] = useState<string>(() => "");
  const [activeImageId, setActiveImageId] = useState<string>(() => "");

  // In-page AI/Studio Image Creation state
  const [genPrompt, setGenPrompt] = useState("");
  const [genTarget, setGenTarget] = useState<"background" | "cover" | "coloring-card">("cover");
  const [generatingImg, setGeneratingImg] = useState(false);
  const [genNotice, setGenNotice] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const [showHallPickerFor, setShowHallPickerFor] = useState<"add" | "replace" | null>(null);
  const [eraserTarget, setEraserTarget] = useState<{
    kind: "bg" | "overlay";
    src: string;
    title: string;
    defaultFillMode: EraseFillMode;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [stageDims, setStageDims] = useState<{ width: number; height: number }>({
    width: 440,
    height: 660,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);

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
  }, [bgMode, canvasAspect, selectedSrc]);

  useEffect(() => {
    if (!activeLayerId && layers.length > 0) {
      setActiveLayerId(layers[0].id);
    }
  }, [layers, activeLayerId]);

  useEffect(() => {
    if (!activeImageId && imageLayers.length > 0) {
      setActiveImageId(imageLayers[0].id);
    }
  }, [imageLayers, activeImageId]);

  useEffect(() => {
    if (initialPhoto) {
      setBgMode("image");
      setCanvasAspect("auto");
      setSelectedSrc(initialPhoto.dataUrl);
      setSelectedTitle(initialPhoto.title);
      setImageLayers([]);
      const first = createDefaultLayer(1);
      setLayers([first]);
      setActiveLayerId(first.id);
      setSelectedKind("text");
    }
  }, [initialPhoto]);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0] || null;
  const activeImageLayer =
    imageLayers.find((img) => img.id === activeImageId) || imageLayers[0] || null;

  const baseScale = Math.min(stageDims.width, stageDims.height) / 1000;

  const applyBookPromoTemplate = () => {
    const tpl = buildBookPromoPosterTemplate(photos);
    setBgMode("image");
    setCanvasAspect(tpl.aspectRatio);
    setSelectedSrc(tpl.backdropDataUrl);
    setSelectedTitle("Book Promo Poster");
    setImageLayers(tpl.imageLayers);
    setLayers(tpl.textLayers);
    setActiveImageId(tpl.imageLayers[0]?.id || "");
    setActiveLayerId(tpl.textLayers[0]?.id || "");
    setSavedNotice(false);
  };

  const resetBlankStudio = () => {
    setBgMode("image");
    setCanvasAspect("4:3");
    setSelectedSrc(photos[0]?.dataUrl || SCENIC_BACKDROPS[0].dataUrl);
    setSelectedTitle(photos[0]?.title || "Text Artwork");
    setImageLayers([]);
    const def = createDefaultLayer(1);
    setLayers([def]);
    setActiveLayerId(def.id);
    setActiveImageId("");
    setSelectedKind("text");
    setSavedNotice(false);
  };

  const updateActiveLayer = (patch: Partial<TextLayer>) => {
    if (!activeLayer) return;
    setSavedNotice(false);
    setLayers((prev) => prev.map((l) => (l.id === activeLayer.id ? { ...l, ...patch } : l)));
  };

  const updateActiveImageLayer = (patch: Partial<TextStudioImageLayer>) => {
    if (!activeImageLayer) return;
    setSavedNotice(false);
    setImageLayers((prev) =>
      prev.map((img) => (img.id === activeImageLayer.id ? { ...img, ...patch } : img))
    );
  };

  const handleAddLayer = () => {
    const next = createDefaultLayer(layers.length + 1);
    setLayers((prev) => [...prev, next]);
    setActiveLayerId(next.id);
    setSelectedKind("text");
    setSavedNotice(false);
  };

  const handleDuplicateLayer = () => {
    if (!activeLayer) return;
    const copy: TextLayer = {
      ...activeLayer,
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(90, activeLayer.x + 4),
      y: Math.min(90, activeLayer.y + 6),
    };
    setLayers((prev) => [...prev, copy]);
    setActiveLayerId(copy.id);
    setSavedNotice(false);
  };

  const handleDeleteLayer = (id: string) => {
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(next[0]?.id || "");
      }
      return next;
    });
    setSavedNotice(false);
  };

  const addNewImageOverlay = (
    src: string,
    label: string,
    width: number,
    height: number,
    frameStyle: TextImageFrameStyle = "tilt-card"
  ) => {
    const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const next: TextStudioImageLayer = {
      id,
      label: label.slice(0, 28) || "Overlay Image",
      src,
      x: 50,
      y: frameStyle === "book-cover" ? 40 : 58,
      widthPct: frameStyle === "book-cover" ? 54 : 32,
      aspectRatio: height > 0 ? width / height : 1,
      rotation: 0,
      opacity: 1,
      frameStyle,
      caption: frameStyle === "tilt-card" ? label.slice(0, 28) : undefined,
      badgeText: frameStyle === "book-cover" ? "40\nDESIGNS" : undefined,
    };
    setImageLayers((prev) => [...prev, next]);
    setActiveImageId(id);
    setInspectorTab("images");
    setSavedNotice(false);
  };

  const moveImageOrder = (id: string, dir: -1 | 1) => {
    setImageLayers((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = tmp;
      return copy;
    });
    setSavedNotice(false);
  };

  const handleDeleteImageLayer = (id: string) => {
    setImageLayers((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (activeImageId === id) {
        setActiveImageId(next[0]?.id || "");
      }
      return next;
    });
    setSavedNotice(false);
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { dataUrl } = await readFileAsDataUrl(file);
    setBgMode("image");
    setSelectedSrc(dataUrl);
    setSelectedTitle(file.name.replace(/\.[^.]+$/, "") || "Text Design");
    setSavedNotice(false);
    e.target.value = "";
  };

  const handleUploadOverlayImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "add" | "replace"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { dataUrl, width, height } = await readFileAsDataUrl(file);
    const label = file.name.replace(/\.[^.]+$/, "") || "Uploaded Card";
    if (mode === "replace" && activeImageLayer) {
      updateActiveImageLayer({
        src: dataUrl,
        label,
        aspectRatio: height > 0 ? width / height : 1,
      });
    } else {
      addNewImageOverlay(dataUrl, label, width, height, "tilt-card");
    }
    e.target.value = "";
  };

  const handleGenerateInStudio = async () => {
    if (!genPrompt.trim()) {
      setGenError("ဖန်တီးလိုသော ပုံအကြောင်းအရာ Prompt ရေးထည့်ပါ။");
      return;
    }
    setGeneratingImg(true);
    setGenError(null);
    setGenNotice(null);

    const isColoring = genTarget === "coloring-card";
    const aspect = genTarget === "background" ? (canvasAspect === "auto" ? "4:3" : canvasAspect === "2:3" || canvasAspect === "4:5" ? "3:4" : canvasAspect) : "1:1";
    const width = isColoring ? 1200 : aspect === "3:4" ? 900 : aspect === "16:9" ? 1280 : 1024;
    const height = isColoring ? 1200 : aspect === "3:4" ? 1200 : aspect === "16:9" ? 720 : 1024;

    try {
      const res = await fetch("/api/photo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: genPrompt.trim(),
          aspectRatio: aspect,
          mood: "Golden Hour",
          creationMode: isColoring ? "coloring-book" : "standard",
          pageSize: "us-letter",
          dpi: 300,
          colorMode: "bw",
        }),
      });
      const data = (await res.json()) as {
        title?: string;
        svgMarkup?: string | null;
        notice?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Unable to create image.");
      if (data.notice) setGenNotice(data.notice);

      const fallbackSvg = isColoring
        ? buildColoringBookSvg(genPrompt.trim(), width, height, "bw")
        : buildProceduralSvg(genPrompt.trim(), width, height, "Golden Hour");

      const rasterOpts = isColoring ? { colorMode: "bw" as const, dpi: 300 as const } : undefined;
      let pngDataUrl: string;
      if (data.svgMarkup) {
        try {
          pngDataUrl = await rasterizeSvgToPng(data.svgMarkup, width, height, rasterOpts);
        } catch {
          pngDataUrl = await rasterizeSvgToPng(fallbackSvg, width, height, rasterOpts);
        }
      } else {
        pngDataUrl = await rasterizeSvgToPng(fallbackSvg, width, height, rasterOpts);
      }

      const now = Date.now();
      const title = data.title || genPrompt.trim().slice(0, 36);
      await onSaveToPhotoHall({
        id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        prompt: genPrompt.trim(),
        dataUrl: pngDataUrl,
        width,
        height,
        aspectRatio: aspect,
        mood: isColoring ? "B&W Line Art" : "Golden Hour",
        isColoringPage: isColoring,
        kind: isColoring ? "coloring" : "generated",
        createdAt: now,
        updatedAt: now,
      });

      if (genTarget === "background") {
        setBgMode("image");
        setSelectedSrc(pngDataUrl);
        setSelectedTitle(title);
      } else if (genTarget === "cover") {
        addNewImageOverlay(pngDataUrl, title, width, height, "book-cover");
      } else {
        addNewImageOverlay(pngDataUrl, title, width, height, "tilt-card");
      }
      setSavedNotice(false);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Image creation failed.");
    } finally {
      setGeneratingImg(false);
    }
  };

  const handleSelectStageLayer = (kind: "text" | "image", id: string) => {
    setSelectedKind(kind);
    if (kind === "text") {
      setActiveLayerId(id);
    } else {
      setActiveImageId(id);
      setInspectorTab("images");
    }
  };

  const exportComposite = async (saveToHall: boolean) => {
    setSaving(true);
    try {
      const bgSource =
        bgMode === "image" && selectedSrc
          ? ({ type: "image", src: selectedSrc } as const)
          : ({
              type: "gradient",
              css: "",
              colors: selectedBackdrop.colors,
            } as const);

      const targetDims = getTextCanvasDimensions(canvasAspect);
      const rendered = await renderTextStudioComposite(
        bgSource,
        layers,
        targetDims.width,
        targetDims.height,
        imageLayers,
        canvasAspect
      );

      if (saveToHall) {
        const now = Date.now();
        await onSaveToPhotoHall({
          id: `photo-${now}-${Math.random().toString(36).slice(2, 6)}`,
          title: `${selectedTitle} · Poster`,
          prompt: layers.map((l) => l.text).join(" / ").slice(0, 120),
          dataUrl: rendered.dataUrl,
          width: rendered.width,
          height: rendered.height,
          aspectRatio: canvasAspect === "auto" ? `${rendered.width}:${rendered.height}` : canvasAspect,
          kind: "text-art",
          createdAt: now,
          updatedAt: now,
        });
        setSavedNotice(true);
      } else {
        triggerDownload(rendered.dataUrl, `${selectedTitle || "gbtk-poster"}.png`);
      }
    } finally {
      setSaving(false);
    }
  };

  const getLayerPreviewStyle = (layer: TextLayer): React.CSSProperties => {
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

  const renderPreviewTextContent = (layer: TextLayer) => {
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
          {/* Stroke + 3D extrusion backplate */}
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
          {/* Gradient fill face */}
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

  const activeAspectCss =
    canvasAspect === "2:3"
      ? "2 / 3"
      : canvasAspect === "4:5"
      ? "4 / 5"
      : canvasAspect === "1:1"
      ? "1 / 1"
      : canvasAspect === "16:9"
      ? "16 / 9"
      : canvasAspect === "4:3"
      ? "4 / 3"
      : bgMode === "gradient"
      ? "4 / 3"
      : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16 space-y-6">
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
            03. Text Studio & Promo Poster Creator
          </h1>
          <p className="text-sm text-zinc-600">
            စာအုပ် Promo Poster များ၊ 3D Book Cover Mockup၊ Coloring Card များနှင့် စိတ်ကြိုက် Image များကို ဤနေရာတွင် တိုက်ရိုက် Create လုပ်နိုင်ပါသည်။
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadBg}
            className="hidden"
          />
          <button
            type="button"
            onClick={applyBookPromoTemplate}
            className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Book Promo Template</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Bg</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => exportComposite(true)}
            className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saved in Hall</span>
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
            disabled={saving}
            onClick={() => exportComposite(false)}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Word-Style Text & Bound Ribbon + Interactive Canvas + Background Selector */}
        <div className="lg:col-span-8 space-y-4">
          <TextBoundRibbon
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={(id) => {
              setActiveLayerId(id);
              setSelectedKind("text");
            }}
            onAddLayer={handleAddLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onUpdateLayer={updateActiveLayer}
            stylePresets={STYLE_PRESETS}
            colorSwatches={COLOR_SWATCHES}
            minLayers={1}
          />

          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3">
            {/* Aspect Ratio Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {ASPECT_OPTIONS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => {
                      setCanvasAspect(ar.id);
                      setSavedNotice(false);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border cursor-pointer whitespace-nowrap ${
                      canvasAspect === ar.id
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {imageLayers.length} image(s) · {layers.length} text(s)
              </span>
            </div>

            {/* Interactive Canvas Stage */}
            <div className="bg-[#141416] rounded-xl p-3 sm:p-4 flex items-center justify-center">
              <div
                ref={stageRef}
                className="relative overflow-hidden rounded-lg select-none touch-none shadow-2xl"
                style={{
                  width: activeAspectCss
                    ? canvasAspect === "2:3" || canvasAspect === "4:5"
                      ? "min(100%, 440px)"
                      : "100%"
                    : undefined,
                  aspectRatio: activeAspectCss,
                  background:
                    bgMode === "gradient"
                      ? `linear-gradient(135deg, ${selectedBackdrop.colors[0]}, ${selectedBackdrop.colors[1]})`
                      : "#18181B",
                }}
              >
                {bgMode === "image" && selectedSrc ? (
                  <img
                    src={selectedSrc}
                    alt={selectedTitle}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className={
                      activeAspectCss
                        ? "w-full h-full block object-cover pointer-events-none"
                        : "max-h-[560px] w-auto max-w-full block object-contain pointer-events-none"
                    }
                  />
                ) : bgMode === "image" ? (
                  <div className="w-full h-72 flex flex-col items-center justify-center text-zinc-400 gap-2 px-10">
                    <ImageIcon className="w-8 h-8 opacity-60" />
                    <span className="text-xs">Choose a scenic backdrop or photo below</span>
                  </div>
                ) : null}

                {/* Center Snap Guides */}
                {((selectedKind === "text" && activeLayer && Math.abs(activeLayer.x - 50) < 0.5) ||
                  (selectedKind === "image" &&
                    activeImageLayer &&
                    Math.abs(activeImageLayer.x - 50) < 0.5)) && (
                  <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-blue-400/70 z-30" />
                )}

                {/* Click-to-Select Image / Book Cover / Coloring Card Layers */}
                {imageLayers.map((imgLayer) => {
                  const isActive =
                    selectedKind === "image" && activeImageLayer?.id === imgLayer.id;
                  const isBook = imgLayer.frameStyle === "book-cover";
                  const isTilt = imgLayer.frameStyle === "tilt-card";
                  const isCircle = imgLayer.frameStyle === "circle-badge";

                  return (
                    <div
                      key={imgLayer.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStageLayer("image", imgLayer.id);
                      }}
                      style={{
                        left: `${imgLayer.x}%`,
                        top: `${imgLayer.y}%`,
                        width: `${imgLayer.widthPct}%`,
                        opacity: imgLayer.opacity,
                        transform: `translate(-50%, -50%) rotate(${imgLayer.rotation}deg)`,
                      }}
                      className={`absolute cursor-pointer z-10 ${
                        isActive ? "ring-2 ring-blue-500 ring-offset-2 rounded" : ""
                      }`}
                    >
                      {isBook ? (
                        <div className="relative">
                          {/* Simulated 3D white book page edges */}
                          <div
                            className="relative rounded-md overflow-hidden border border-white/80"
                            style={{
                              aspectRatio: String(imgLayer.aspectRatio || 1),
                              boxShadow:
                                "6px 5px 0 0 #f8fafc, 8px 6px 0 1px #cbd5e1, 0 14px 28px rgba(0,0,0,0.45)",
                            }}
                          >
                            <img
                              src={imgLayer.src}
                              alt={imgLayer.label}
                              draggable={false}
                              className="w-full h-full object-cover block pointer-events-none"
                            />
                            {/* Spine highlight crease */}
                            <div
                              className="absolute inset-y-0 left-0 w-[7%] pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.26) 35%, transparent 100%)",
                              }}
                            />
                          </div>
                          {imgLayer.badgeText?.trim() && (
                            <div
                              className="absolute right-[-6%] top-[46%] w-[26%] aspect-square rounded-full bg-cyan-800 border-2 border-yellow-300 shadow-lg flex flex-col items-center justify-center text-center leading-none pointer-events-none"
                              style={{ padding: "2%" }}
                            >
                              {imgLayer.badgeText
                                .trim()
                                .split("\n")
                                .slice(0, 2)
                                .map((line, i) => (
                                  <span
                                    key={i}
                                    className={
                                      i === 0
                                        ? "font-bold text-yellow-300 text-[0.75em] sm:text-[0.85em]"
                                        : "font-bold text-white text-[0.42em] tracking-wider mt-0.5"
                                    }
                                    style={{
                                      fontSize:
                                        i === 0
                                          ? `${Math.max(11, stageDims.width * (imgLayer.widthPct / 100) * 0.13)}px`
                                          : `${Math.max(6, stageDims.width * (imgLayer.widthPct / 100) * 0.055)}px`,
                                    }}
                                  >
                                    {line}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : isTilt ? (
                        <div className="bg-white rounded-md p-1.5 sm:p-2 shadow-xl border border-zinc-200">
                          <div
                            className="w-full bg-white overflow-hidden rounded-[2px] border border-zinc-200"
                            style={{ aspectRatio: String(imgLayer.aspectRatio || 1) }}
                          >
                            <img
                              src={imgLayer.src}
                              alt={imgLayer.label}
                              draggable={false}
                              className="w-full h-full object-cover block pointer-events-none"
                            />
                          </div>
                          {imgLayer.caption?.trim() && (
                            <div
                              className="mt-1 text-center font-semibold text-zinc-900 leading-tight whitespace-pre-line truncate"
                              style={{
                                fontSize: `${Math.max(7, stageDims.width * (imgLayer.widthPct / 100) * 0.068)}px`,
                              }}
                            >
                              {imgLayer.caption}
                            </div>
                          )}
                        </div>
                      ) : isCircle ? (
                        <div
                          className="w-full rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-white"
                          style={{ aspectRatio: "1 / 1" }}
                        >
                          <img
                            src={imgLayer.src}
                            alt={imgLayer.label}
                            draggable={false}
                            className="w-full h-full object-cover block pointer-events-none"
                          />
                        </div>
                      ) : (
                        <img
                          src={imgLayer.src}
                          alt={imgLayer.label}
                          draggable={false}
                          className="w-full h-auto block drop-shadow-lg pointer-events-none"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Click-to-Select Text Layers */}
                {layers.map((layer) => {
                  const isActive = selectedKind === "text" && activeLayer?.id === layer.id;
                  const hasBound = Boolean(layer.boundStyle && layer.boundStyle !== "none");
                  const bPadX = (layer.boundPadX ?? 36) * baseScale;
                  const bPadY = (layer.boundPadY ?? 18) * baseScale;
                  return (
                    <div
                      key={layer.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStageLayer("text", layer.id);
                      }}
                      style={{
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      }}
                      className={`absolute cursor-pointer rounded z-20 max-w-[94%] ${
                        hasBound ? "" : "px-1.5 py-0.5"
                      } ${isActive ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
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
                            styleType={layer.boundStyle!}
                            thickness={layer.boundThickness ?? 4}
                            radius={layer.boundRadius ?? 14}
                            strokeColor={layer.boundColor || "#FFFFFF"}
                            fillColor={layer.boundFillColor || "#111113"}
                            fillOpacity={layer.boundFillOpacity ?? 0}
                            scale={baseScale}
                          />
                        )}
                        <div className="relative z-10" style={getLayerPreviewStyle(layer)}>
                          {renderPreviewTextContent(layer)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Selector: Scenic Illustrated + Photo Hall + Gradients */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-700">
                Background Scene, Photo Hall or Gradient
              </span>
              <div className="flex items-center gap-3">
                {bgMode === "image" && selectedSrc && (
                  <button
                    type="button"
                    onClick={() =>
                      setEraserTarget({
                        kind: "bg",
                        src: selectedSrc,
                        title: `Select & Erase · ${selectedTitle}`,
                        defaultFillMode: "smart-fill",
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Select & Erase Bg</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetBlankStudio}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-950 cursor-pointer"
                >
                  Reset to Simple Text
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SCENIC_BACKDROPS.map((sc) => {
                const isSelected = bgMode === "image" && selectedSrc === sc.dataUrl;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setBgMode("image");
                      setSelectedSrc(sc.dataUrl);
                      setSelectedTitle(sc.label);
                      setSavedNotice(false);
                    }}
                    title={sc.label}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer relative ${
                      isSelected ? "border-blue-600" : "border-zinc-200"
                    }`}
                  >
                    <img src={sc.dataUrl} alt={sc.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/55 text-[9px] text-white px-1 py-0.5 truncate">
                      {sc.label}
                    </span>
                  </button>
                );
              })}

              {photos.map((photo) => {
                const isSelected = bgMode === "image" && selectedSrc === photo.dataUrl;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setBgMode("image");
                      setSelectedSrc(photo.dataUrl);
                      setSelectedTitle(photo.title);
                      setSavedNotice(false);
                    }}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      isSelected ? "border-blue-600" : "border-zinc-200"
                    }`}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}

              {STUDIO_BACKDROPS.map((bd) => {
                const isSelected = bgMode === "gradient" && selectedBackdrop.id === bd.id;
                return (
                  <button
                    key={bd.id}
                    type="button"
                    onClick={() => {
                      setBgMode("gradient");
                      setSelectedBackdrop(bd);
                      setSelectedTitle(bd.label);
                      setSavedNotice(false);
                    }}
                    title={bd.label}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 cursor-pointer ${
                      isSelected ? "border-blue-600" : "border-zinc-200"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${bd.colors[0]}, ${bd.colors[1]})`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Image Overlays & Create Image Inspector */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          {/* Primary Inspector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setInspectorTab("images")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                inspectorTab === "images"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Images ({imageLayers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab("create")}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                inspectorTab === "create"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Create Image</span>
            </button>
          </div>

          {/* TAB 1: IMAGE & CARD LAYERS INSPECTOR */}
          {inspectorTab === "images" && (
            <div className="space-y-4">
              <input
                ref={addImageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUploadOverlayImage(e, "add")}
                className="hidden"
              />
              <input
                ref={replaceImageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUploadOverlayImage(e, "replace")}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addImageInputRef.current?.click()}
                  className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Card / Cover</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShowHallPickerFor((prev) => (prev === "add" ? null : "add"))
                  }
                  className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Add from Photo Hall</span>
                </button>
              </div>

              {showHallPickerFor && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">
                      {showHallPickerFor === "replace"
                        ? "Pick Photo to Replace Selected Layer"
                        : "Pick Photo to Add as Layer"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHallPickerFor(null)}
                      className="text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {photos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (showHallPickerFor === "replace" && activeImageLayer) {
                            updateActiveImageLayer({
                              src: p.dataUrl,
                              label: p.title,
                              aspectRatio: p.height > 0 ? p.width / p.height : 1,
                            });
                          } else {
                            addNewImageOverlay(
                              p.dataUrl,
                              p.title,
                              p.width,
                              p.height,
                              p.isColoringPage ? "tilt-card" : "book-cover"
                            );
                          }
                          setShowHallPickerFor(null);
                        }}
                        className="aspect-square rounded-lg border border-zinc-200 overflow-hidden bg-white hover:border-blue-600 cursor-pointer"
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.title}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Layer Selector List */}
              {imageLayers.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-zinc-200 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-zinc-700">No overlay image layers yet</p>
                  <p className="text-[11px] text-zinc-500 px-4">
                    Upload a cover/card, pick from Photo Hall, or click “Book Promo Template” above.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {imageLayers.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageId(img.id)}
                        className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          activeImageLayer?.id === img.id
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <span>
                          {idx + 1}. {img.label.slice(0, 14)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {activeImageLayer && (
                    <div className="space-y-4 pt-1 border-t border-zinc-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => replaceImageInputRef.current?.click()}
                            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                          >
                            Replace Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowHallPickerFor("replace")}
                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                          >
                            Swap from Hall
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEraserTarget({
                                kind: "overlay",
                                src: activeImageLayer.src,
                                title: `Select & Erase · ${activeImageLayer.label}`,
                                defaultFillMode:
                                  activeImageLayer.frameStyle === "tilt-card"
                                    ? "white"
                                    : "smart-fill",
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Select & Erase</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImageOrder(activeImageLayer.id, -1)}
                            title="Send backward"
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImageOrder(activeImageLayer.id, 1)}
                            title="Bring forward"
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImageLayer(activeImageLayer.id)}
                            title="Remove image layer"
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Frame Style */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-zinc-700 block">
                          Card / Mockup Style
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {FRAME_STYLES.map((fs) => (
                            <button
                              key={fs.id}
                              type="button"
                              onClick={() => updateActiveImageLayer({ frameStyle: fs.id })}
                              className={`min-h-[36px] px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                                activeImageLayer.frameStyle === fs.id
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                              }`}
                            >
                              {fs.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeImageLayer.frameStyle === "tilt-card" && (
                        <label className="block space-y-1">
                          <span className="text-xs font-semibold text-zinc-700">
                            Card Caption (Optional)
                          </span>
                          <input
                            type="text"
                            value={activeImageLayer.caption || ""}
                            onChange={(e) => updateActiveImageLayer({ caption: e.target.value })}
                            placeholder="e.g. David looked after his flock."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </label>
                      )}

                      {activeImageLayer.frameStyle === "book-cover" && (
                        <label className="block space-y-1">
                          <span className="text-xs font-semibold text-zinc-700">
                            Corner Seal Badge (e.g. 40\nDESIGNS)
                          </span>
                          <textarea
                            rows={2}
                            value={activeImageLayer.badgeText || ""}
                            onChange={(e) => updateActiveImageLayer({ badgeText: e.target.value })}
                            placeholder={"40\nDESIGNS"}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                          />
                        </label>
                      )}

                      {/* + / - Steppers for image layer */}
                      <div className="grid grid-cols-2 gap-3">
                        <StepperControl
                          compact
                          label="Position X"
                          value={Math.round(activeImageLayer.x)}
                          min={4}
                          max={96}
                          step={2}
                          unit="%"
                          onChange={(val) => updateActiveImageLayer({ x: val })}
                        />
                        <StepperControl
                          compact
                          label="Position Y"
                          value={Math.round(activeImageLayer.y)}
                          min={4}
                          max={96}
                          step={2}
                          unit="%"
                          onChange={(val) => updateActiveImageLayer({ y: val })}
                        />
                        <StepperControl
                          compact
                          label="Size (%)"
                          value={Math.round(activeImageLayer.widthPct)}
                          min={10}
                          max={90}
                          step={2}
                          unit="%"
                          onChange={(val) => updateActiveImageLayer({ widthPct: val })}
                        />
                        <StepperControl
                          compact
                          label="Tilt / Rotate"
                          value={activeImageLayer.rotation}
                          min={-35}
                          max={35}
                          step={2}
                          unit="°"
                          onChange={(val) => updateActiveImageLayer({ rotation: val })}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: CREATE IMAGE DIRECTLY IN TEXT STUDIO */}
          {inspectorTab === "create" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <p className="text-xs font-semibold text-blue-950">
                  Create Image Directly on Text Page
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Prompt ရေးထည့်ပြီး Background ရှုခင်း၊ 3D Book Cover ပုံ သို့မဟုတ် Coloring Page Card များကို ဤစာမျက်နှာပေါ်တွင် တိုက်ရိုက် Create လုပ်နိုင်ပါသည်။
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-700 block">
                  Where to Add Created Image
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "cover", label: "3D Book Cover" },
                      { id: "coloring-card", label: "Coloring Card" },
                      { id: "background", label: "Bg Scene" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setGenTarget(t.id)}
                      className={`min-h-[38px] px-2 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        genTarget === t.id
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="text-studio-gen-prompt" className="text-xs font-semibold text-zinc-700">
                  Image Prompt (မြန်မာ / English)
                </label>
                <textarea
                  id="text-studio-gen-prompt"
                  rows={3}
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  placeholder={
                    genTarget === "coloring-card"
                      ? "ဥပမာ — Shepherd boy with sheep by a stream, clean black line art..."
                      : "ဥပမာ — Sunny green meadow with golden sunset hills and olive trees..."
                  }
                  className="w-full p-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Sunny meadow hills with golden morning light",
                  "Cute shepherd boy with fluffy sheep under olive tree",
                  "Noah's ark with rainbow and dove coloring line art",
                  "Bagan golden temples sunset sky",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setGenPrompt(sample)}
                    className="px-2.5 py-1 text-[11px] text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer text-left"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {genError && (
                <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {genError}
                </p>
              )}
              {genNotice && (
                <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  {genNotice}
                </p>
              )}

              <button
                type="button"
                disabled={generatingImg}
                onClick={handleGenerateInStudio}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60 cursor-pointer"
              >
                {generatingImg ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating & Adding to Poster...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Add Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <ImageRegionEraserModal
        open={Boolean(eraserTarget)}
        imageSrc={eraserTarget?.src || null}
        title={eraserTarget?.title}
        defaultFillMode={eraserTarget?.defaultFillMode || "smart-fill"}
        onClose={() => setEraserTarget(null)}
        onApply={(newDataUrl, width, height) => {
          if (!eraserTarget) return;
          if (eraserTarget.kind === "bg") {
            setBgMode("image");
            setSelectedSrc(newDataUrl);
            setSavedNotice(false);
          } else if (activeImageLayer) {
            updateActiveImageLayer({
              src: newDataUrl,
              aspectRatio: height > 0 ? width / height : activeImageLayer.aspectRatio,
            });
          }
        }}
      />
    </div>
  );
}
