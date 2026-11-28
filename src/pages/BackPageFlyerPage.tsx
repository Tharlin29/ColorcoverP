import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Layers,
  Link2,
  Maximize2,
  Minus,
  Plus,
  QrCode,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import {
  FlyerBorderStyle,
  FlyerDecorItem,
  FlyerElement,
  FlyerImageElement,
  FlyerReadyMadePhoto,
  FlyerState,
  FlyerTextElement,
} from "../types/flyer";
import { PhotoItem } from "../types/studio";
import {
  createDefaultFlyerState,
  DEFAULT_FLYER_ASSETS,
  DEFAULT_STORE_URL,
  FLYER_DECORATIONS,
  FLYER_FONT_OPTIONS,
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PASTEL_BG_PRESETS,
  PASTEL_TEXT_PRESETS,
  RAINBOW_BORDER_BANDS,
  RAINBOW_LETTER_COLORS,
  READY_MADE_FLYER_PHOTOS,
} from "../utils/flyerDefaults";
import {
  exportFlyerAsClickablePdf,
  exportFlyerAsPngDataUrl,
} from "../utils/flyerExport";

interface BackPageFlyerPageProps {
  photos: PhotoItem[];
  initialPhoto?: PhotoItem | null;
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onBackHome: () => void;
}

type InspectorTab = "edit" | "photos" | "layers";
type ResizeHandle = "nw" | "ne" | "sw" | "se";

interface DragSession {
  mode: "move" | "resize";
  elementId: string;
  handle?: ResizeHandle;
  startClientX: number;
  startClientY: number;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  origFontSize?: number;
  aspect: number;
  isText: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function DecorSvg({ item }: { item: FlyerDecorItem }) {
  if (item.kind === "dot") {
    return (
      <circle
        cx={item.x}
        cy={item.y}
        r={item.size * 0.5}
        fill={item.color}
      />
    );
  }
  if (item.kind === "star") {
    const outer = item.size * 0.55;
    const inner = outer * 0.48;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`);
    }
    return (
      <g transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}>
        <polygon
          points={pts.join(" ")}
          fill={item.color}
          stroke={item.color}
          strokeWidth={item.size * 0.14}
          strokeLinejoin="round"
        />
      </g>
    );
  }
  const s = item.size * 0.52;
  const d = `M 0 ${(s * 0.72).toFixed(2)} C ${(-s * 1.15).toFixed(2)} ${(s * 0.08).toFixed(2)}, ${(-s * 0.95).toFixed(2)} ${(-s * 0.95).toFixed(2)}, 0 ${(-s * 0.28).toFixed(2)} C ${(s * 0.95).toFixed(2)} ${(-s * 0.95).toFixed(2)}, ${(s * 1.15).toFixed(2)} ${(s * 0.08).toFixed(2)}, 0 ${(s * 0.72).toFixed(2)} Z`;
  return (
    <g transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}>
      <path d={d} fill={item.color} />
    </g>
  );
}

function readImageFileAsDataUrl(file: File): Promise<{ dataUrl: string; aspect: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1;
        resolve({ dataUrl, aspect });
      };
      img.onerror = () => resolve({ dataUrl, aspect: 1 });
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

function buildOutlineTextShadow(color: string, width: number): string {
  const w = Math.max(0.8, width);
  const d = +(w * 0.72).toFixed(2);
  const s = +w.toFixed(2);
  return [
    `${-s}px 0 0 ${color}`,
    `${s}px 0 0 ${color}`,
    `0 ${-s}px 0 ${color}`,
    `0 ${s}px 0 ${color}`,
    `${-d}px ${-d}px 0 ${color}`,
    `${d}px ${-d}px 0 ${color}`,
    `${-d}px ${d}px 0 ${color}`,
    `${d}px ${d}px 0 ${color}`,
  ].join(", ");
}

export function BackPageFlyerPage({
  photos,
  initialPhoto,
  onSaveNewPhoto,
}: BackPageFlyerPageProps) {
  const [flyer, setFlyer] = useState<FlyerState>(() => createDefaultFlyerState());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("edit");
  const [canvasScale, setCanvasScale] = useState(0.55);
  const [busyAction, setBusyAction] = useState<"pdf" | "png" | "save" | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const consumedInitialRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  // If navigated from Photo Hall with a handoff photo, add it onto canvas once
  useEffect(() => {
    if (!initialPhoto || consumedInitialRef.current === initialPhoto.id) return;
    consumedInitialRef.current = initialPhoto.id;
    const aspect =
      initialPhoto.width > 0 && initialPhoto.height > 0
        ? initialPhoto.width / initialPhoto.height
        : 1;
    const width = 220;
    const height = Math.round(width / aspect);
    const newId = `flyer-img-${Date.now()}`;
    const newEl: FlyerImageElement = {
      id: newId,
      type: "image",
      role: "image",
      label: initialPhoto.title || "Photo Hall Image",
      src: initialPhoto.dataUrl,
      x: 425,
      y: 540,
      width,
      height,
      naturalAspect: aspect,
      blendMultiply: false,
      borderRadius: 12,
    };
    setFlyer((prev) => ({ ...prev, elements: [...prev.elements, newEl] }));
    setSelectedId(newId);
    setInspectorTab("edit");
    showToast(`Added "${initialPhoto.title}" to flyer`);
  }, [initialPhoto, showToast]);

  // Keep the 850x1100 flyer stage perfectly scaled inside any viewport (mobile or desktop)
  useEffect(() => {
    const container = stageContainerRef.current;
    if (!container) return;

    const updateScale = () => {
      const availWidth = Math.max(260, container.clientWidth - 16);
      const maxHeight = window.innerWidth >= 1024 ? window.innerHeight - 230 : 760;
      const scaleW = availWidth / FLYER_WIDTH;
      const scaleH = Math.max(380, maxHeight) / FLYER_HEIGHT;
      const next = Math.min(0.76, scaleW, scaleH);
      setCanvasScale(Math.max(0.28, Number(next.toFixed(4))));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const selectedElement = useMemo(
    () => flyer.elements.find((el) => el.id === selectedId) ?? null,
    [flyer.elements, selectedId]
  );

  const linkedElements = useMemo(
    () => flyer.elements.filter((el) => Boolean(el.linkUrl?.trim())),
    [flyer.elements]
  );

  const updateElement = useCallback(
    (id: string, updater: (el: FlyerElement) => FlyerElement) => {
      setFlyer((prev) => ({
        ...prev,
        elements: prev.elements.map((el) => (el.id === id ? updater(el) : el)),
      }));
    },
    []
  );

  const updateTextElement = useCallback(
    (id: string, patch: Partial<FlyerTextElement>) => {
      updateElement(id, (el) => (el.type === "text" ? { ...el, ...patch } : el));
    },
    [updateElement]
  );

  const updateImageElement = useCallback(
    (id: string, patch: Partial<FlyerImageElement>) => {
      updateElement(id, (el) => (el.type === "image" ? { ...el, ...patch } : el));
    },
    [updateElement]
  );

  const handleResizeStep = useCallback(
    (direction: 1 | -1) => {
      if (!selectedId) return;
      updateElement(selectedId, (el) => {
        if (el.type === "text") {
          const nextFont = clamp(el.fontSize + direction * 2, 11, 96);
          return { ...el, fontSize: nextFont };
        }
        const deltaW = direction * 16;
        const nextW = clamp(el.width + deltaW, 48, 780);
        const ratio = el.height > 0 ? el.width / el.height : el.naturalAspect || 1;
        const nextH = clamp(Math.round(nextW / ratio), 48, 920);
        return { ...el, width: nextW, height: nextH };
      });
    },
    [selectedId, updateElement]
  );

  const handleNudge = useCallback(
    (dx: number, dy: number) => {
      if (!selectedId) return;
      updateElement(selectedId, (el) => ({
        ...el,
        x: clamp(Math.round(el.x + dx), 20, FLYER_WIDTH - 20),
        y: clamp(Math.round(el.y + dy), 20, FLYER_HEIGHT - 20),
      }));
    },
    [selectedId, updateElement]
  );

  const handleCenterHorizontal = useCallback(() => {
    if (!selectedId) return;
    updateElement(selectedId, (el) => ({ ...el, x: FLYER_WIDTH / 2 }));
  }, [selectedId, updateElement]);

  const handleDeleteSelected = useCallback(
    (targetId?: string) => {
      const idToRemove = targetId ?? selectedId;
      if (!idToRemove) return;
      setFlyer((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => el.id !== idToRemove),
      }));
      if (selectedId === idToRemove) {
        setSelectedId(null);
      }
      if (inlineEditId === idToRemove) {
        setInlineEditId(null);
      }
      showToast("Element removed");
    },
    [selectedId, inlineEditId, showToast]
  );

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const copyId = `flyer-copy-${Date.now()}`;
    const copy: FlyerElement = {
      ...selectedElement,
      id: copyId,
      label: `${selectedElement.label} (Copy)`,
      x: clamp(selectedElement.x + 24, 40, FLYER_WIDTH - 40),
      y: clamp(selectedElement.y + 24, 40, FLYER_HEIGHT - 40),
    };
    setFlyer((prev) => ({ ...prev, elements: [...prev.elements, copy] }));
    setSelectedId(copyId);
    showToast("Duplicated element");
  }, [selectedElement, showToast]);

  const handleReorderLayer = useCallback((id: string, delta: 1 | -1) => {
    setFlyer((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const nextIdx = idx + delta;
      if (nextIdx < 0 || nextIdx >= prev.elements.length) return prev;
      const next = [...prev.elements];
      const [moved] = next.splice(idx, 1);
      next.splice(nextIdx, 0, moved);
      return { ...prev, elements: next };
    });
  }, []);

  const handleAddTextBlock = useCallback(() => {
    const id = `flyer-text-${Date.now()}`;
    const newText: FlyerTextElement = {
      id,
      type: "text",
      role: "text",
      label: "Custom Text",
      text: "New Flyer Text",
      x: FLYER_WIDTH / 2,
      y: 520,
      width: 520,
      height: 60,
      fontSize: 28,
      fontFamily: "'Fredoka', sans-serif",
      color: "#111113",
      rainbowLetters: false,
      bold: true,
      italic: false,
      outline: false,
      outlineColor: "#18181B",
      outlineWidth: 1.5,
      bgColor: "#FCE7F3",
      roundedPadding: true,
      borderRadius: 16,
      paddingX: 20,
      paddingY: 12,
      align: "center",
      lineHeight: 1.3,
      letterSpacing: 0,
    };
    setFlyer((prev) => ({ ...prev, elements: [...prev.elements, newText] }));
    setSelectedId(id);
    setInspectorTab("edit");
    showToast("Added new text block");
  }, [showToast]);

  const handleInsertImage = useCallback(
    (
      src: string,
      label: string,
      role: "logo" | "qr" | "image",
      aspect = 1,
      linkUrl?: string
    ) => {
      const id = `flyer-${role}-${Date.now()}`;
      const width = role === "logo" ? 260 : role === "qr" ? 230 : 260;
      const height = Math.round(width / (aspect || 1));
      const newImg: FlyerImageElement = {
        id,
        type: "image",
        role,
        label,
        src,
        x: FLYER_WIDTH / 2,
        y: role === "logo" ? 190 : role === "qr" ? 850 : 540,
        width,
        height,
        naturalAspect: aspect || 1,
        blendMultiply: role === "logo" || role === "qr",
        borderRadius: role === "image" ? 12 : 6,
        linkUrl,
      };
      setFlyer((prev) => ({ ...prev, elements: [...prev.elements, newImg] }));
      setSelectedId(id);
      setInspectorTab("edit");
      showToast(`Added ${label}`);
    },
    [showToast]
  );

  const handleApplyReadyMadePhoto = useCallback(
    (item: FlyerReadyMadePhoto, mode: "insert" | "replace" | "background") => {
      if (mode === "background") {
        setFlyer((prev) => ({ ...prev, customBgImage: item.src }));
        showToast("Applied full flyer image as page background");
        return;
      }
      if (mode === "replace" && selectedElement?.type === "image") {
        updateImageElement(selectedElement.id, {
          src: item.src,
          naturalAspect: item.aspect,
          height: Math.round(selectedElement.width / (item.aspect || 1)),
          blendMultiply: item.role === "logo" || item.role === "qr",
        });
        showToast(`Replaced image with ${item.title}`);
        return;
      }
      handleInsertImage(
        item.src,
        item.title,
        item.role === "reference" ? "image" : item.role,
        item.aspect,
        item.role === "qr" ? DEFAULT_STORE_URL : undefined
      );
    },
    [selectedElement, updateImageElement, handleInsertImage, showToast]
  );

  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl, aspect } = await readImageFileAsDataUrl(file);
      const name = file.name.replace(/\.[^.]+$/, "") || "Uploaded Image";
      handleInsertImage(dataUrl, name, "image", aspect);
    } catch {
      showToast("Failed to load selected image");
    }
  };

  const handleReplaceSelectedImageFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedElement || selectedElement.type !== "image") return;
    try {
      const { dataUrl, aspect } = await readImageFileAsDataUrl(file);
      updateImageElement(selectedElement.id, {
        src: dataUrl,
        naturalAspect: aspect,
        height: Math.round(selectedElement.width / aspect),
      });
      showToast("Replaced selected image");
    } catch {
      showToast("Failed to replace image");
    }
  };

  // Pointer drag & corner resize handlers (works smoothly for both touch & mouse)
  const startMove = (e: React.PointerEvent, el: FlyerElement) => {
    if (inlineEditId === el.id) return;
    e.stopPropagation();
    setSelectedId(el.id);
    if (inlineEditId && inlineEditId !== el.id) setInlineEditId(null);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode: "move",
      elementId: el.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: el.x,
      origY: el.y,
      origWidth: el.width,
      origHeight: el.height,
      origFontSize: el.type === "text" ? el.fontSize : undefined,
      aspect: el.type === "image" ? el.width / Math.max(1, el.height) : 1,
      isText: el.type === "text",
    };
  };

  const startResize = (
    e: React.PointerEvent,
    el: FlyerElement,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setInlineEditId(null);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode: "resize",
      elementId: el.id,
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: el.x,
      origY: el.y,
      origWidth: el.width,
      origHeight: el.height,
      origFontSize: el.type === "text" ? el.fontSize : undefined,
      aspect: el.type === "image" ? el.width / Math.max(1, el.height) : 1,
      isText: el.type === "text",
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const session = dragRef.current;
    if (!session) return;

    const dx = (e.clientX - session.startClientX) / canvasScale;
    const dy = (e.clientY - session.startClientY) / canvasScale;

    if (session.mode === "move") {
      const nextX = clamp(Math.round(session.origX + dx), 20, FLYER_WIDTH - 20);
      const nextY = clamp(Math.round(session.origY + dy), 20, FLYER_HEIGHT - 20);
      updateElement(session.elementId, (el) => ({ ...el, x: nextX, y: nextY }));
      return;
    }

    // Corner resize
    const signX = session.handle === "ne" || session.handle === "se" ? 1 : -1;
    const signY = session.handle === "sw" || session.handle === "se" ? 1 : -1;

    if (session.isText) {
      const nextW = clamp(Math.round(session.origWidth + signX * dx * 2), 120, 790);
      const scaleFactor = nextW / Math.max(120, session.origWidth);
      const nextFont = session.origFontSize
        ? clamp(Math.round(session.origFontSize * (0.45 + 0.55 * scaleFactor)), 11, 96)
        : 24;
      updateElement(session.elementId, (el) =>
        el.type === "text" ? { ...el, width: nextW, fontSize: nextFont } : el
      );
    } else {
      const dominantDelta =
        Math.abs(dx) >= Math.abs(dy) ? signX * dx * 2 : signY * dy * 2 * session.aspect;
      const nextW = clamp(Math.round(session.origWidth + dominantDelta), 48, 780);
      const nextH = clamp(Math.round(nextW / Math.max(0.1, session.aspect)), 48, 940);
      updateElement(session.elementId, (el) =>
        el.type === "image" ? { ...el, width: nextW, height: nextH } : el
      );
    }
  };

  const endPointerSession = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore if capture already released
    }
    dragRef.current = null;
  };

  // Keyboard arrow nudging & delete support on desktop
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
      if (!selectedId) return;
      const step = e.shiftKey ? 12 : 4;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNudge(-step, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNudge(step, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleNudge(0, -step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNudge(0, step);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, handleNudge, handleDeleteSelected]);

  const handleExportPdf = async () => {
    setBusyAction("pdf");
    try {
      const { linkCount } = await exportFlyerAsClickablePdf(
        flyer,
        "gbtk-back-page-flyer.pdf"
      );
      showToast(
        linkCount > 0
          ? `Exported PDF with ${linkCount} clickable link${linkCount > 1 ? "s" : ""}`
          : "Exported 300 DPI PDF"
      );
    } catch (err) {
      console.error(err);
      showToast("PDF export failed — please try again");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadPng = async () => {
    setBusyAction("png");
    try {
      const dataUrl = await exportFlyerAsPngDataUrl(flyer);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "gbtk-back-page-flyer.png";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
      showToast("Downloaded high-res PNG");
    } catch (err) {
      console.error(err);
      showToast("PNG download failed");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveToPhotoHall = async () => {
    setBusyAction("save");
    try {
      const dataUrl = await exportFlyerAsPngDataUrl(flyer);
      const now = Date.now();
      const item: PhotoItem = {
        id: `flyer-${now}`,
        title: "GBTK Back Page Flyer",
        prompt: "Interactive Back Page Flyer with clickable store link & QR code",
        dataUrl,
        width: FLYER_WIDTH * 3,
        height: FLYER_HEIGHT * 3,
        aspectRatio: "8.5:11",
        dpi: 300,
        pageSize: "us-letter",
        kind: "edited",
        createdAt: now,
        updatedAt: now,
      };
      await onSaveNewPhoto(item);
      showToast("Saved Back Page Flyer to Photo Hall");
    } catch (err) {
      console.error(err);
      showToast("Could not save to Photo Hall");
    } finally {
      setBusyAction(null);
    }
  };

  const handleResetTemplate = () => {
    setFlyer(createDefaultFlyerState());
    setSelectedId("flyer-offer-box");
    setInlineEditId(null);
    showToast("Restored default GBTK flyer template");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12">
      {/* Hidden File Inputs */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadNewImage}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceSelectedImageFile}
        className="hidden"
      />

      {/* Top Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-zinc-200/90">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            Back Page Flyer &amp; Clickable PDF Editor
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            US Letter · 300 DPI Print · {linkedElements.length} Clickable PDF Link
            {linkedElements.length === 1 ? "" : "s"} Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{busyAction === "pdf" ? "Exporting PDF..." : "Export as PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{busyAction === "png" ? "Rendering..." : "Download PNG"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToPhotoHall}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{busyAction === "save" ? "Saving..." : "Save to Hall"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetTemplate}
            title="Reset to default template"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[42px] text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Interactive Canvas + Mobile-Friendly Floating Action Bar */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          {/* Quick Element Add Row */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddTextBlock}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ Add Text</span>
              </button>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>+ Upload Image</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInsertImage(
                    DEFAULT_FLYER_ASSETS.qr,
                    "Store QR Code",
                    "qr",
                    1,
                    DEFAULT_STORE_URL
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>+ Default QR</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInsertImage(
                    DEFAULT_FLYER_ASSETS.logo,
                    "GBTK Studio Logo",
                    "logo",
                    1
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Default Logo</span>
              </button>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Drag to move · Double-click text to edit
            </span>
          </div>

          {/* Scaled Interactive Flyer Canvas */}
          <div
            ref={stageContainerRef}
            className="w-full flex justify-center items-center py-4 px-2 bg-[#ECECE8] border border-zinc-200 rounded-2xl"
          >
            <div
              style={{
                width: Math.round(FLYER_WIDTH * canvasScale),
                height: Math.round(FLYER_HEIGHT * canvasScale),
              }}
              className="relative shadow-xl rounded-sm bg-white shrink-0"
            >
              <div
                onPointerDown={() => {
                  setSelectedId(null);
                  setInlineEditId(null);
                }}
                style={{
                  width: FLYER_WIDTH,
                  height: FLYER_HEIGHT,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: "top left",
                  backgroundColor: flyer.pageBgColor,
                }}
                className="relative overflow-hidden select-none"
              >
                {/* Background Mode: Either Reference Photo OR Vector Rainbow Border */}
                {flyer.customBgImage ? (
                  <img
                    src={flyer.customBgImage}
                    alt="Flyer page background"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <>
                    {flyer.borderStyle === "pastel-rainbow" &&
                      RAINBOW_BORDER_BANDS.map((color, idx) => {
                        const inset = idx * 8;
                        return (
                          <div
                            key={color}
                            style={{
                              top: inset,
                              left: inset,
                              right: inset,
                              bottom: inset,
                              backgroundColor: color,
                            }}
                            className="absolute pointer-events-none"
                          />
                        );
                      })}
                    {flyer.borderStyle === "pastel-rainbow" && (
                      <div
                        style={{
                          top: RAINBOW_BORDER_BANDS.length * 8,
                          left: RAINBOW_BORDER_BANDS.length * 8,
                          right: RAINBOW_BORDER_BANDS.length * 8,
                          bottom: RAINBOW_BORDER_BANDS.length * 8,
                          backgroundColor: flyer.pageBgColor,
                        }}
                        className="absolute pointer-events-none"
                      />
                    )}
                    {flyer.borderStyle === "pastel-pink" && (
                      <div
                        style={{
                          inset: 0,
                          border: "36px solid #FBCFE8",
                          backgroundColor: flyer.pageBgColor,
                        }}
                        className="absolute pointer-events-none"
                      />
                    )}
                    {flyer.borderStyle === "pastel-mint" && (
                      <div
                        style={{
                          inset: 0,
                          border: "36px solid #A7F3D0",
                          backgroundColor: flyer.pageBgColor,
                        }}
                        className="absolute pointer-events-none"
                      />
                    )}

                    {/* Cute Pastel Stars, Hearts & Polka Dots */}
                    {flyer.showDecorations && (
                      <svg
                        viewBox={`0 0 ${FLYER_WIDTH} ${FLYER_HEIGHT}`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        aria-hidden="true"
                      >
                        {FLYER_DECORATIONS.map((item) => (
                          <DecorSvg key={item.id} item={item} />
                        ))}
                      </svg>
                    )}
                  </>
                )}

                {/* Draggable / Resizable Elements */}
                {flyer.elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  const isEditingInline = el.id === inlineEditId;

                  if (el.type === "image") {
                    return (
                      <div
                        key={el.id}
                        onPointerDown={(e) => startMove(e, el)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={endPointerSession}
                        onPointerCancel={endPointerSession}
                        style={{
                          left: el.x,
                          top: el.y,
                          width: el.width,
                          height: el.height,
                          transform: "translate(-50%, -50%)",
                          touchAction: "none",
                        }}
                        className={`absolute cursor-move group ${
                          isSelected
                            ? "ring-[3px] ring-blue-600 ring-offset-2 z-20"
                            : "hover:ring-2 hover:ring-blue-400/70 z-10"
                        }`}
                      >
                        <img
                          src={el.src}
                          alt={el.label}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          decoding="async"
                          style={{
                            borderRadius: el.borderRadius,
                          }}
                          className="w-full h-full object-fill pointer-events-none block"
                        />

                        {isSelected && el.linkUrl?.trim() && (
                          <span
                            title={`Clickable PDF Link: ${el.linkUrl}`}
                            className="absolute -bottom-3.5 right-2 bg-blue-600 text-white text-[13px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none flex items-center gap-1"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>PDF Link</span>
                          </span>
                        )}

                        {isSelected &&
                          (["nw", "ne", "sw", "se"] as ResizeHandle[]).map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              aria-label={`Resize ${handle}`}
                              onPointerDown={(e) => startResize(e, el, handle)}
                              onPointerMove={handlePointerMove}
                              onPointerUp={endPointerSession}
                              onPointerCancel={endPointerSession}
                              style={{ touchAction: "none" }}
                              className={`absolute w-7 h-7 rounded-full bg-white border-[3px] border-blue-600 shadow-md flex items-center justify-center ${
                                handle === "nw"
                                  ? "-top-3.5 -left-3.5 cursor-nwse-resize"
                                  : handle === "ne"
                                  ? "-top-3.5 -right-3.5 cursor-nesw-resize"
                                  : handle === "sw"
                                  ? "-bottom-3.5 -left-3.5 cursor-nesw-resize"
                                  : "-bottom-3.5 -right-3.5 cursor-nwse-resize"
                              }`}
                            />
                          ))}
                      </div>
                    );
                  }

                  // Text element
                  const lines = el.text.split("\n");
                  let rainbowCounter = 0;

                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => startMove(e, el)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={endPointerSession}
                      onPointerCancel={endPointerSession}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(el.id);
                        setInlineEditId(el.id);
                      }}
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        minHeight: el.height,
                        transform: "translate(-50%, -50%)",
                        backgroundColor:
                          el.bgColor && el.bgColor !== "transparent"
                            ? el.bgColor
                            : "transparent",
                        borderRadius: el.roundedPadding ? el.borderRadius : 0,
                        paddingLeft: el.roundedPadding ? el.paddingX : 6,
                        paddingRight: el.roundedPadding ? el.paddingX : 6,
                        paddingTop: el.roundedPadding ? el.paddingY : 4,
                        paddingBottom: el.roundedPadding ? el.paddingY : 4,
                        textAlign: el.align,
                        fontFamily: el.fontFamily,
                        fontStyle: el.italic ? "italic" : "normal",
                        lineHeight: el.lineHeight,
                        letterSpacing: `${el.letterSpacing}px`,
                        touchAction: isEditingInline ? "auto" : "none",
                      }}
                      className={`absolute flex flex-col justify-center cursor-move ${
                        isSelected
                          ? "ring-[3px] ring-blue-600 ring-offset-2 z-20"
                          : "hover:ring-2 hover:ring-blue-400/70 z-10"
                      }`}
                    >
                      {isEditingInline ? (
                        <textarea
                          autoFocus
                          value={el.text}
                          onChange={(e) =>
                            updateTextElement(el.id, { text: e.target.value })
                          }
                          onBlur={() => setInlineEditId(null)}
                          onPointerDown={(e) => e.stopPropagation()}
                          rows={Math.max(1, lines.length)}
                          style={{
                            fontSize: el.fontSize,
                            fontWeight: el.bold ? 700 : 500,
                            color: el.color,
                            textAlign: el.align,
                          }}
                          className="w-full bg-white/85 rounded p-1 outline-none resize-none border border-blue-500"
                        />
                      ) : (
                        <div className="pointer-events-none whitespace-pre-wrap break-words">
                          {lines.map((line, lineIdx) => {
                            const isBoldLine =
                              el.bold || (el.firstLineBold && lineIdx === 0);
                            const lineFontSize =
                              el.firstLineBold && lineIdx === 0
                                ? Math.round(el.fontSize * 1.12)
                                : el.fontSize;
                            const outlineShadow = el.outline
                              ? buildOutlineTextShadow(el.outlineColor, el.outlineWidth)
                              : undefined;

                            return (
                              <div
                                key={`${el.id}-l-${lineIdx}`}
                                style={{
                                  fontSize: lineFontSize,
                                  fontWeight: isBoldLine ? 700 : 500,
                                  color: el.color,
                                  textShadow: outlineShadow,
                                }}
                              >
                                {el.rainbowLetters
                                  ? Array.from(line).map((ch, cIdx) => {
                                      if (!ch.trim()) {
                                        return <span key={cIdx}>{ch}</span>;
                                      }
                                      const fill =
                                        RAINBOW_LETTER_COLORS[
                                          rainbowCounter++ % RAINBOW_LETTER_COLORS.length
                                        ];
                                      return (
                                        <span key={cIdx} style={{ color: fill }}>
                                          {ch}
                                        </span>
                                      );
                                    })
                                  : line || "\u00A0"}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isSelected && el.linkUrl?.trim() && (
                        <span
                          title={`Clickable PDF Link: ${el.linkUrl}`}
                          className="absolute -top-3.5 right-2 bg-blue-600 text-white text-[13px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none flex items-center gap-1"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Clickable PDF Link</span>
                        </span>
                      )}

                      {isSelected &&
                        !isEditingInline &&
                        (["nw", "ne", "sw", "se"] as ResizeHandle[]).map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            aria-label={`Resize ${handle}`}
                            onPointerDown={(e) => startResize(e, el, handle)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={endPointerSession}
                            onPointerCancel={endPointerSession}
                            style={{ touchAction: "none" }}
                            className={`absolute w-7 h-7 rounded-full bg-white border-[3px] border-blue-600 shadow-md ${
                              handle === "nw"
                                ? "-top-3.5 -left-3.5 cursor-nwse-resize"
                                : handle === "ne"
                                ? "-top-3.5 -right-3.5 cursor-nesw-resize"
                                : handle === "sw"
                                ? "-bottom-3.5 -left-3.5 cursor-nesw-resize"
                                : "-bottom-3.5 -right-3.5 cursor-nwse-resize"
                            }`}
                          />
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floating / Bottom Quick Resize & Position Toolbar (Mobile + Touch Friendly) */}
          <div className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-3 flex flex-wrap items-center justify-between gap-2.5">
            {selectedElement ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-zinc-900 truncate max-w-[160px]">
                    {selectedElement.label}
                  </span>
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {selectedElement.type === "text"
                      ? `${selectedElement.fontSize}px`
                      : `${Math.round(selectedElement.width)}×${Math.round(
                          selectedElement.height
                        )}`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Dedicated - / + Fine Resize Controls */}
                  <div className="inline-flex items-center bg-zinc-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => handleResizeStep(-1)}
                      aria-label="Decrease size"
                      title="Make smaller"
                      className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-800 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-2 text-[11px] font-semibold text-zinc-600 select-none">
                      Size
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResizeStep(1)}
                      aria-label="Increase size"
                      title="Make larger"
                      className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-800 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nudge Arrows */}
                  <div className="inline-flex items-center bg-zinc-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => handleNudge(-6, 0)}
                      aria-label="Move left"
                      className="min-w-[36px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, -6)}
                      aria-label="Move up"
                      className="min-w-[36px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, 6)}
                      aria-label="Move down"
                      className="min-w-[36px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(6, 0)}
                      aria-label="Move right"
                      className="min-w-[36px] min-h-[40px] inline-flex items-center justify-center rounded-md text-zinc-700 hover:bg-white cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCenterHorizontal}
                    title="Center horizontally"
                    className="min-h-[40px] px-2.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Center
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateSelected}
                    title="Duplicate element"
                    className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSelected()}
                    title="Delete element"
                    className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>Tap any text, logo, or QR code on the flyer to drag, resize, or customize.</span>
                <button
                  type="button"
                  onClick={() => setSelectedId("flyer-offer-box")}
                  className="text-zinc-900 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Select Offer Box
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Inspector & Ready-Made Default Photos */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-2xl overflow-hidden">
          {/* Segmented Tabs */}
          <div className="p-2 bg-zinc-50 border-b border-zinc-200/80 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setInspectorTab("edit")}
              className={`min-h-[40px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                inspectorTab === "edit"
                  ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Customize
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab("photos")}
              className={`min-h-[40px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                inspectorTab === "photos"
                  ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Default Photos (3)
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab("layers")}
              className={`min-h-[40px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                inspectorTab === "layers"
                  ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Page &amp; Layers
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-5 max-h-[760px] overflow-y-auto">
            {/* TAB 1: CONTEXTUAL CUSTOMIZE TOOLBAR */}
            {inspectorTab === "edit" && (
              <>
                {!selectedElement && (
                  <div className="py-6 text-center space-y-4">
                    <p className="text-sm text-zinc-600">
                      Select any element on the canvas to edit its text, colors, size, or clickable PDF URL.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {flyer.elements.slice(0, 5).map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          onClick={() => setSelectedId(el.id)}
                          className="px-3 py-2 min-h-[38px] text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg cursor-pointer"
                        >
                          {el.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEXT CUSTOMIZATION TOOLBAR */}
                {selectedElement?.type === "text" && (
                  <div className="space-y-5">
                    {/* Text Content */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 block">
                        Text Content
                      </label>
                      <textarea
                        value={selectedElement.text}
                        onChange={(e) =>
                          updateTextElement(selectedElement.id, { text: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 focus:bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter flyer text..."
                      />
                    </div>

                    {/* Font Size (- / + buttons and slider) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">Font Size</span>
                        <span className="text-xs font-mono tabular-nums text-zinc-600">
                          {selectedElement.fontSize}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResizeStep(-1)}
                          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer"
                          aria-label="Decrease font size"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="range"
                          min={11}
                          max={96}
                          value={selectedElement.fontSize}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              fontSize: Number(e.target.value),
                            })
                          }
                          className="flex-1 accent-zinc-950"
                        />
                        <button
                          type="button"
                          onClick={() => handleResizeStep(1)}
                          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer"
                          aria-label="Increase font size"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Box Width Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">Text Box Width</span>
                        <span className="text-xs font-mono tabular-nums text-zinc-600">
                          {Math.round(selectedElement.width)}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={160}
                        max={780}
                        value={Math.round(selectedElement.width)}
                        onChange={(e) =>
                          updateTextElement(selectedElement.id, {
                            width: Number(e.target.value),
                          })
                        }
                        className="w-full accent-zinc-950"
                      />
                    </div>

                    {/* Font Family & Style Toggles */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                      <label className="text-xs font-semibold text-zinc-700 block">
                        Font Family &amp; Style
                      </label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) =>
                          updateTextElement(selectedElement.id, {
                            fontFamily: e.target.value,
                          })
                        }
                        className="w-full min-h-[40px] rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {FLYER_FONT_OPTIONS.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateTextElement(selectedElement.id, {
                              bold: !selectedElement.bold,
                            })
                          }
                          className={`min-h-[40px] inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedElement.bold
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" />
                          <span>Bold</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateTextElement(selectedElement.id, {
                              italic: !selectedElement.italic,
                            })
                          }
                          className={`min-h-[40px] inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedElement.italic
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" />
                          <span>Italic</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateTextElement(selectedElement.id, {
                              outline: !selectedElement.outline,
                            })
                          }
                          className={`min-h-[40px] inline-flex items-center justify-center rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedElement.outline
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                          }`}
                        >
                          Outline
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateTextElement(selectedElement.id, {
                              rainbowLetters: !selectedElement.rainbowLetters,
                            })
                          }
                          className={`min-h-[40px] inline-flex items-center justify-center rounded-lg border text-xs font-semibold cursor-pointer ${
                            selectedElement.rainbowLetters
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                          }`}
                        >
                          Rainbow
                        </button>
                      </div>

                      {selectedElement.outline && (
                        <div className="flex items-center gap-3 pt-1">
                          <label className="text-[11px] font-medium text-zinc-600 shrink-0">
                            Outline Color
                          </label>
                          <input
                            type="color"
                            value={selectedElement.outlineColor}
                            onChange={(e) =>
                              updateTextElement(selectedElement.id, {
                                outlineColor: e.target.value,
                              })
                            }
                            className="w-8 h-8 rounded border border-zinc-300 cursor-pointer"
                          />
                          <input
                            type="range"
                            min={1}
                            max={5}
                            step={0.2}
                            value={selectedElement.outlineWidth}
                            onChange={(e) =>
                              updateTextElement(selectedElement.id, {
                                outlineWidth: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-zinc-950"
                          />
                        </div>
                      )}
                    </div>

                    {/* Text Color + Pastel Presets */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">Text Color</span>
                        <input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              color: e.target.value,
                              rainbowLetters: false,
                            })
                          }
                          className="w-8 h-7 rounded border border-zinc-300 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PASTEL_TEXT_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            title={preset.label}
                            onClick={() =>
                              updateTextElement(selectedElement.id, {
                                color: preset.value,
                                rainbowLetters: false,
                              })
                            }
                            style={{ backgroundColor: preset.value }}
                            className={`w-7 h-7 rounded-full border cursor-pointer transition-transform hover:scale-110 ${
                              !selectedElement.rainbowLetters &&
                              selectedElement.color.toLowerCase() ===
                                preset.value.toLowerCase()
                                ? "ring-2 ring-blue-600 ring-offset-1 border-zinc-400"
                                : "border-zinc-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Background Box + Rounded Padding */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">
                          Background Fill
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateTextElement(selectedElement.id, {
                                bgColor: "transparent",
                              })
                            }
                            className={`px-2 py-1 text-[11px] font-semibold rounded border cursor-pointer ${
                              selectedElement.bgColor === "transparent"
                                ? "bg-zinc-950 text-white border-zinc-950"
                                : "bg-white text-zinc-700 border-zinc-300"
                            }`}
                          >
                            Transparent
                          </button>
                          <input
                            type="color"
                            value={
                              selectedElement.bgColor === "transparent"
                                ? "#FEF0A6"
                                : selectedElement.bgColor
                            }
                            onChange={(e) =>
                              updateTextElement(selectedElement.id, {
                                bgColor: e.target.value,
                                roundedPadding: true,
                              })
                            }
                            className="w-8 h-7 rounded border border-zinc-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {PASTEL_BG_PRESETS.filter((p) => p.value !== "transparent").map(
                          (preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              title={preset.label}
                              onClick={() =>
                                updateTextElement(selectedElement.id, {
                                  bgColor: preset.value,
                                  roundedPadding: true,
                                })
                              }
                              style={{ backgroundColor: preset.value }}
                              className={`w-7 h-7 rounded-lg border cursor-pointer transition-transform hover:scale-110 ${
                                selectedElement.bgColor.toLowerCase() ===
                                preset.value.toLowerCase()
                                  ? "ring-2 ring-blue-600 ring-offset-1 border-zinc-400"
                                  : "border-zinc-300"
                              }`}
                            />
                          )
                        )}
                      </div>

                      <label className="flex items-center justify-between pt-1 cursor-pointer">
                        <span className="text-xs text-zinc-700">Rounded Box Padding</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.roundedPadding}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              roundedPadding: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-zinc-950"
                        />
                      </label>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <span className="text-xs font-semibold text-zinc-700 block">
                        Text Alignment
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["left", "center", "right"] as const).map((align) => {
                          const Icon =
                            align === "left"
                              ? AlignLeft
                              : align === "center"
                              ? AlignCenter
                              : AlignRight;
                          return (
                            <button
                              key={align}
                              type="button"
                              onClick={() =>
                                updateTextElement(selectedElement.id, { align })
                              }
                              className={`min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg border text-xs font-medium capitalize cursor-pointer ${
                                selectedElement.align === align
                                  ? "bg-zinc-950 text-white border-zinc-950"
                                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{align}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clickable PDF Link URL */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 inline-flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Clickable PDF Link URL</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateTextElement(selectedElement.id, {
                              linkUrl: DEFAULT_STORE_URL,
                            })
                          }
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Use Store URL
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          value={selectedElement.linkUrl || ""}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              linkUrl: e.target.value,
                            })
                          }
                          placeholder="https://coloringbooks-ten.vercel.app"
                          className="flex-1 min-h-[40px] rounded-lg border border-zinc-300 bg-zinc-50 focus:bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {selectedElement.linkUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              updateTextElement(selectedElement.id, { linkUrl: "" })
                            }
                            className="min-h-[40px] px-2.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Embedded as a working tappable link box when exported as PDF.
                      </p>
                    </div>
                  </div>
                )}

                {/* IMAGE / LOGO / QR CODE CONTROLS */}
                {selectedElement?.type === "image" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                      <img
                        src={selectedElement.src}
                        alt={selectedElement.label}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-contain bg-white border border-zinc-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={selectedElement.label}
                          onChange={(e) =>
                            updateImageElement(selectedElement.id, {
                              label: e.target.value,
                            })
                          }
                          className="w-full text-xs font-semibold text-zinc-950 bg-white border border-zinc-200 rounded px-2 py-1"
                        />
                        <p className="text-[11px] text-zinc-500 tabular-nums">
                          {Math.round(selectedElement.width)} ×{" "}
                          {Math.round(selectedElement.height)} px
                        </p>
                      </div>
                    </div>

                    {/* Size Controls (+ / - & Slider) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">
                          Scale Size
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateImageElement(selectedElement.id, {
                              height: Math.round(
                                selectedElement.width /
                                  (selectedElement.naturalAspect || 1)
                              ),
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Reset Aspect Ratio</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResizeStep(-1)}
                          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer"
                          aria-label="Shrink image"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="range"
                          min={60}
                          max={760}
                          value={Math.round(selectedElement.width)}
                          onChange={(e) => {
                            const nextW = Number(e.target.value);
                            const ratio =
                              selectedElement.height > 0
                                ? selectedElement.width / selectedElement.height
                                : selectedElement.naturalAspect || 1;
                            updateImageElement(selectedElement.id, {
                              width: nextW,
                              height: Math.round(nextW / ratio),
                            });
                          }}
                          className="flex-1 accent-zinc-950"
                        />
                        <button
                          type="button"
                          onClick={() => handleResizeStep(1)}
                          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer"
                          aria-label="Enlarge image"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Replace Image Buttons */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <span className="text-xs font-semibold text-zinc-700 block">
                        Replace Image
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => replaceInputRef.current?.click()}
                          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectorTab("photos")}
                          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Default Photos</span>
                        </button>
                      </div>
                    </div>

                    {/* Blending & Rounded Corners */}
                    <div className="space-y-3 pt-2 border-t border-zinc-100">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-zinc-700">
                          Blend White Background (Multiply)
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedElement.blendMultiply)}
                          onChange={(e) =>
                            updateImageElement(selectedElement.id, {
                              blendMultiply: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-zinc-950"
                        />
                      </label>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-zinc-700">
                          <span>Corner Radius</span>
                          <span className="font-mono tabular-nums text-zinc-500">
                            {selectedElement.borderRadius}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={64}
                          value={selectedElement.borderRadius}
                          onChange={(e) =>
                            updateImageElement(selectedElement.id, {
                              borderRadius: Number(e.target.value),
                            })
                          }
                          className="w-full accent-zinc-950"
                        />
                      </div>
                    </div>

                    {/* Clickable PDF Link URL for QR / Logo */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 inline-flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Clickable PDF Link URL</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateImageElement(selectedElement.id, {
                              linkUrl: DEFAULT_STORE_URL,
                            })
                          }
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Use Store URL
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          value={selectedElement.linkUrl || ""}
                          onChange={(e) =>
                            updateImageElement(selectedElement.id, {
                              linkUrl: e.target.value,
                            })
                          }
                          placeholder="https://coloringbooks-ten.vercel.app"
                          className="flex-1 min-h-[40px] rounded-lg border border-zinc-300 bg-zinc-50 focus:bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {selectedElement.linkUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              updateImageElement(selectedElement.id, { linkUrl: "" })
                            }
                            className="min-h-[40px] px-2.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSelected()}
                      className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected Image</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: READY-MADE DEFAULT PHOTOS (THE 3 UPLOADED IMAGES) + PHOTO HALL */}
            {inspectorTab === "photos" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-zinc-950">
                    Ready-Made Default Photos
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Your 3 default GBTK STUDIO assets are ready to insert, replace, or apply as a full flyer background.
                  </p>
                </div>

                <div className="space-y-3">
                  {READY_MADE_FLYER_PHOTOS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/70"
                    >
                      <img
                        src={item.src}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-lg object-contain bg-white border border-zinc-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-zinc-950 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-zinc-500">{item.subtitle}</div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplyReadyMadePhoto(item, "insert")}
                            className="px-2.5 py-1.5 min-h-[34px] text-[11px] font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-md cursor-pointer"
                          >
                            + Add to Flyer
                          </button>
                          {selectedElement?.type === "image" && (
                            <button
                              type="button"
                              onClick={() => handleApplyReadyMadePhoto(item, "replace")}
                              className="px-2.5 py-1.5 min-h-[34px] text-[11px] font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md cursor-pointer"
                            >
                              Replace Selected
                            </button>
                          )}
                          {item.role === "reference" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApplyReadyMadePhoto(item, "background")
                              }
                              className="px-2.5 py-1.5 min-h-[34px] text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer"
                            >
                              Use as Background
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Custom Photo */}
                <div className="pt-3 border-t border-zinc-200 space-y-2">
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Custom Logo, QR, or Image</span>
                  </button>
                </div>

                {/* Photo Hall Quick Picker */}
                {photos.length > 0 && (
                  <div className="pt-3 border-t border-zinc-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-800">
                        From Photo Hall ({photos.length})
                      </span>
                      <span className="text-[11px] text-zinc-500">Tap to add</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.slice(0, 12).map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            const aspect =
                              photo.width > 0 && photo.height > 0
                                ? photo.width / photo.height
                                : 1;
                            handleInsertImage(
                              photo.dataUrl,
                              photo.title || "Photo Hall Item",
                              "image",
                              aspect
                            );
                          }}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-blue-600 bg-zinc-100 cursor-pointer"
                          title={`Add ${photo.title}`}
                        >
                          <img
                            src={photo.dataUrl}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAGE BORDER, DECORATIONS & LAYERS */}
            {inspectorTab === "layers" && (
              <div className="space-y-5">
                {/* Page Border Style */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 block">
                    Page Border Style
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "pastel-rainbow", label: "Pastel Rainbow" },
                        { id: "pastel-pink", label: "Pastel Pink" },
                        { id: "pastel-mint", label: "Pastel Mint" },
                        { id: "clean-white", label: "Clean White" },
                      ] as { id: FlyerBorderStyle; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFlyer((prev) => ({
                            ...prev,
                            borderStyle: opt.id,
                            customBgImage: undefined,
                          }))
                        }
                        className={`min-h-[40px] px-3 text-xs font-semibold rounded-lg border cursor-pointer ${
                          flyer.borderStyle === opt.id && !flyer.customBgImage
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decorations & Custom Background Toggle */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-zinc-700">
                      Show Pastel Stars &amp; Hearts
                    </span>
                    <input
                      type="checkbox"
                      checked={flyer.showDecorations}
                      onChange={(e) =>
                        setFlyer((prev) => ({
                          ...prev,
                          showDecorations: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-zinc-950"
                    />
                  </label>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-700">
                      Page Background Color
                    </span>
                    <input
                      type="color"
                      value={flyer.pageBgColor}
                      onChange={(e) =>
                        setFlyer((prev) => ({
                          ...prev,
                          pageBgColor: e.target.value,
                        }))
                      }
                      className="w-8 h-7 rounded border border-zinc-300 cursor-pointer"
                    />
                  </div>

                  {flyer.customBgImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setFlyer((prev) => ({ ...prev, customBgImage: undefined }))
                      }
                      className="w-full min-h-[38px] text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                    >
                      Clear Background Photo &amp; Restore Vector Border
                    </button>
                  )}
                </div>

                {/* Active Clickable PDF Links Summary */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Clickable PDF Links ({linkedElements.length})</span>
                  </div>
                  {linkedElements.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No links attached yet. Select any box or QR code to add a URL.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {linkedElements.map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(el.id);
                            setInspectorTab("edit");
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200/80 hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-zinc-900 truncate">
                            {el.label}
                          </div>
                          <div className="text-[11px] text-blue-700 truncate">
                            {el.linkUrl}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Layers Stack */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Canvas Layers ({flyer.elements.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {[...flyer.elements].reverse().map((el) => {
                      const active = el.id === selectedId;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedId(el.id)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                            active
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50"
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            {el.type === "image" ? (
                              <ImageIcon className="w-3.5 h-3.5 shrink-0 opacity-75" />
                            ) : (
                              <Type className="w-3.5 h-3.5 shrink-0 opacity-75" />
                            )}
                            <span className="text-xs font-medium truncate">
                              {el.label}
                            </span>
                          </div>
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 shrink-0"
                          >
                            <button
                              type="button"
                              onClick={() => handleReorderLayer(el.id, 1)}
                              title="Bring forward"
                              className={`p-1 rounded cursor-pointer ${
                                active ? "hover:bg-white/15" : "hover:bg-zinc-200"
                              }`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorderLayer(el.id, -1)}
                              title="Send backward"
                              className={`p-1 rounded cursor-pointer ${
                                active ? "hover:bg-white/15" : "hover:bg-zinc-200"
                              }`}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSelected(el.id)}
                              title="Delete layer"
                              className={`p-1 rounded cursor-pointer ${
                                active
                                  ? "text-red-300 hover:bg-white/15"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Toast Confirmation */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-zinc-950 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
