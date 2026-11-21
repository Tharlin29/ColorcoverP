import {
  BookOpen,
  Check,
  Circle,
  Download,
  Eraser,
  Eye,
  FlipHorizontal2,
  ImagePlus,
  Lasso,
  Minus,
  Paintbrush,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Shrink,
  Sparkles,
  Square,
  Trash2,
  Type,
  Undo2,
  Upload,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { StepperControl } from "../components/StepperControl";
import { PageId, PhotoItem } from "../types/studio";
import {
  applyMagicWandToMask,
  createSmartFillPatch,
  invertSelectionMask,
  loadCanvasImage,
  morphSelectionMask,
} from "../utils/smartErase";
import { triggerDownload } from "../utils/storage";

type ProSelectionTool = "brush" | "lasso" | "wand" | "rect" | "ellipse";
type ProSelectionOp = "add" | "subtract";
type ProFillMode = "smart-fill" | "white" | "transparent" | "color" | "blur";

interface SelectErasePageProps {
  photos: PhotoItem[];
  initialPhoto?: PhotoItem | null;
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onSendToPage: (page: PageId, photo: PhotoItem) => void;
}

interface Point {
  x: number;
  y: number;
}

const COLOR_QUICK_SWATCHES = [
  "#FFFFFF",
  "#111113",
  "#F4F4F5",
  "#FEF3C7",
  "#DBEAFE",
  "#DCFCE7",
  "#FCE7F3",
  "#EF4444",
];

function checkMaskHasSelection(maskCanvas: HTMLCanvasElement): boolean {
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return false;
  const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] > 12) return true;
  }
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 12) return true;
  }
  return false;
}

export function SelectErasePage({
  photos,
  initialPhoto,
  onSaveNewPhoto,
  onSendToPage,
}: SelectErasePageProps) {
  const [sourcePhoto, setSourcePhoto] = useState<PhotoItem | null>(
    () => initialPhoto || photos[0] || null
  );
  const [artTitle, setArtTitle] = useState<string>(
    () => (initialPhoto ? `${initialPhoto.title} (Erased)` : "Edited Image")
  );
  const [imageSrc, setImageSrc] = useState<string | null>(
    () => initialPhoto?.dataUrl || photos[0]?.dataUrl || null
  );

  const [tool, setTool] = useState<ProSelectionTool>("brush");
  const [selectionOp, setSelectionOp] = useState<ProSelectionOp>("add");
  const [fillMode, setFillMode] = useState<ProFillMode>("smart-fill");
  const [customColor, setCustomColor] = useState<string>("#FFFFFF");
  const [autoEraseOnRelease, setAutoEraseOnRelease] = useState<boolean>(false);

  const [brushSize, setBrushSize] = useState<number>(36);
  const [wandTolerance, setWandTolerance] = useState<number>(28);
  const [feather, setFeather] = useState<number>(4);
  const [blurStrength, setBlurStrength] = useState<number>(14);
  const [zoomPct, setZoomPct] = useState<number>(100);
  const [compareOriginal, setCompareOriginal] = useState<boolean>(false);

  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 800, h: 600 });
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [undoCount, setUndoCount] = useState<number>(0);
  const [redoCount, setRedoCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalSnapshotRef = useRef<ImageData | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  const dragStateRef = useRef<{
    active: boolean;
    start: Point;
    current: Point;
    lassoPoints: Point[];
  } | null>(null);

  useEffect(() => {
    if (initialPhoto) {
      setSourcePhoto(initialPhoto);
      setImageSrc(initialPhoto.dataUrl);
      setArtTitle(`${initialPhoto.title} (Erased)`);
    }
  }, [initialPhoto]);

  useEffect(() => {
    if (!imageSrc && photos.length > 0) {
      setSourcePhoto(photos[0]);
      setImageSrc(photos[0].dataUrl);
      setArtTitle(`${photos[0].title} (Erased)`);
    }
  }, [photos, imageSrc]);

  const redrawDisplay = useCallback(() => {
    const disp = displayCanvasRef.current;
    const work = workCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!disp || !work || !mask) return;

    const ctx = disp.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, disp.width, disp.height);

    if (compareOriginal && originalSnapshotRef.current) {
      ctx.putImageData(originalSnapshotRef.current, 0, 0);
      return;
    }

    ctx.drawImage(work, 0, 0);

    // Overlay finalized selection mask with crisp crimson highlight
    const tintCanvas = document.createElement("canvas");
    tintCanvas.width = disp.width;
    tintCanvas.height = disp.height;
    const tCtx = tintCanvas.getContext("2d");
    if (tCtx) {
      tCtx.drawImage(mask, 0, 0);
      tCtx.globalCompositeOperation = "source-in";
      tCtx.fillStyle = "rgba(239, 68, 68, 0.45)";
      tCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);
      ctx.drawImage(tintCanvas, 0, 0);
    }

    // Active drag marquee preview for rect, ellipse, or lasso
    const drag = dragStateRef.current;
    if (drag?.active) {
      const lw = Math.max(2, Math.round(Math.min(disp.width, disp.height) * 0.0035));
      if (tool === "rect" || tool === "ellipse") {
        const x = Math.min(drag.start.x, drag.current.x);
        const y = Math.min(drag.start.y, drag.current.y);
        const w = Math.abs(drag.current.x - drag.start.x);
        const h = Math.abs(drag.current.y - drag.start.y);

        ctx.save();
        ctx.fillStyle =
          selectionOp === "subtract" ? "rgba(59, 130, 246, 0.25)" : "rgba(239, 68, 68, 0.3)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = lw;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        if (tool === "rect") {
          ctx.rect(x, y, w, h);
        } else {
          ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = selectionOp === "subtract" ? "#2563EB" : "#EF4444";
        ctx.lineDashOffset = 7;
        ctx.stroke();
        ctx.restore();
      } else if (tool === "lasso" && drag.lassoPoints.length > 1) {
        ctx.save();
        ctx.fillStyle =
          selectionOp === "subtract" ? "rgba(59, 130, 246, 0.25)" : "rgba(239, 68, 68, 0.3)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = lw;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(drag.lassoPoints[0].x, drag.lassoPoints[0].y);
        for (let i = 1; i < drag.lassoPoints.length; i++) {
          ctx.lineTo(drag.lassoPoints[i].x, drag.lassoPoints[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = selectionOp === "subtract" ? "#2563EB" : "#EF4444";
        ctx.lineDashOffset = 7;
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [compareOriginal, selectionOp, tool]);

  // Load image into working buffer whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    let mounted = true;
    setLoading(true);
    setHasSelection(false);
    setUndoCount(0);
    setRedoCount(0);
    setCompareOriginal(false);
    undoStackRef.current = [];
    redoStackRef.current = [];

    loadCanvasImage(imageSrc)
      .then((img) => {
        if (!mounted) return;
        const rawW = img.naturalWidth || 1024;
        const rawH = img.naturalHeight || 768;
        const maxSide = 2200;
        const scale = Math.min(1, maxSide / Math.max(rawW, rawH));
        const w = Math.max(1, Math.round(rawW * scale));
        const h = Math.max(1, Math.round(rawH * scale));

        const work = document.createElement("canvas");
        work.width = w;
        work.height = h;
        const wCtx = work.getContext("2d")!;
        wCtx.drawImage(img, 0, 0, w, h);

        const mask = document.createElement("canvas");
        mask.width = w;
        mask.height = h;

        workCanvasRef.current = work;
        maskCanvasRef.current = mask;
        originalSnapshotRef.current = wCtx.getImageData(0, 0, w, h);
        setDims({ w, h });
        setLoading(false);

        requestAnimationFrame(() => {
          if (displayCanvasRef.current) {
            displayCanvasRef.current.width = w;
            displayCanvasRef.current.height = h;
            redrawDisplay();
          }
        });
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [imageSrc, redrawDisplay]);

  useEffect(() => {
    if (!loading && imageSrc) {
      redrawDisplay();
    }
  }, [loading, imageSrc, dims, compareOriginal, redrawDisplay]);

  const clearSelection = useCallback(() => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mCtx = mask.getContext("2d")!;
    mCtx.clearRect(0, 0, mask.width, mask.height);
    setHasSelection(false);
    redrawDisplay();
  }, [redrawDisplay]);

  const eraseSelectedArea = useCallback(() => {
    const work = workCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!work || !mask) return;
    if (!checkMaskHasSelection(mask)) {
      setHasSelection(false);
      return;
    }

    const wCtx = work.getContext("2d")!;
    const mCtx = mask.getContext("2d")!;
    const { width: w, height: h } = work;

    const maskPixels = mCtx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (maskPixels[(y * w + x) * 4 + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return;

    // Push Undo snapshot (max 20) & clear Redo stack
    undoStackRef.current.push(wCtx.getImageData(0, 0, w, h));
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
    redoStackRef.current = [];
    setUndoCount(undoStackRef.current.length);
    setRedoCount(0);

    // Feathered mask
    const featherPx = Math.max(0, Math.round((feather / 1000) * Math.min(w, h) * 1.4));
    const featheredMask = document.createElement("canvas");
    featheredMask.width = w;
    featheredMask.height = h;
    const fMaskCtx = featheredMask.getContext("2d")!;
    if (featherPx > 0) {
      fMaskCtx.filter = `blur(${featherPx}px)`;
    }
    fMaskCtx.drawImage(mask, 0, 0);
    fMaskCtx.filter = "none";

    if (fillMode === "transparent") {
      wCtx.save();
      wCtx.globalCompositeOperation = "destination-out";
      wCtx.drawImage(featheredMask, 0, 0);
      wCtx.restore();
    } else if (fillMode === "white" || fillMode === "color") {
      const patch = document.createElement("canvas");
      patch.width = w;
      patch.height = h;
      const pCtx = patch.getContext("2d")!;
      pCtx.fillStyle = fillMode === "white" ? "#FFFFFF" : customColor;
      pCtx.fillRect(0, 0, w, h);
      pCtx.globalCompositeOperation = "destination-in";
      pCtx.drawImage(featheredMask, 0, 0);
      wCtx.drawImage(patch, 0, 0);
    } else if (fillMode === "blur") {
      const blurPx = Math.max(4, Math.round((blurStrength / 800) * Math.min(w, h)));
      const blurPatch = document.createElement("canvas");
      blurPatch.width = w;
      blurPatch.height = h;
      const bCtx = blurPatch.getContext("2d")!;
      bCtx.filter = `blur(${blurPx}px)`;
      bCtx.drawImage(work, 0, 0);
      bCtx.filter = "none";
      bCtx.globalCompositeOperation = "destination-in";
      bCtx.drawImage(featheredMask, 0, 0);
      wCtx.drawImage(blurPatch, 0, 0);
    } else {
      const margin = Math.max(26, Math.round(Math.min(w, h) * 0.065));
      const bx = Math.max(0, minX - margin);
      const by = Math.max(0, minY - margin);
      const bx2 = Math.min(w, maxX + 1 + margin);
      const by2 = Math.min(h, maxY + 1 + margin);
      const bw = Math.max(4, bx2 - bx);
      const bh = Math.max(4, by2 - by);

      const smartPatch = createSmartFillPatch(work, mask, bx, by, bw, bh);

      const maskedPatch = document.createElement("canvas");
      maskedPatch.width = bw;
      maskedPatch.height = bh;
      const mpCtx = maskedPatch.getContext("2d")!;
      mpCtx.drawImage(smartPatch, 0, 0);
      mpCtx.globalCompositeOperation = "destination-in";
      mpCtx.drawImage(featheredMask, bx, by, bw, bh, 0, 0, bw, bh);

      wCtx.drawImage(maskedPatch, bx, by);
    }

    mCtx.clearRect(0, 0, w, h);
    setHasSelection(false);
    setCompareOriginal(false);
    redrawDisplay();
  }, [blurStrength, customColor, feather, fillMode, redrawDisplay]);

  const handleUndo = useCallback(() => {
    const work = workCanvasRef.current;
    if (!work || undoStackRef.current.length === 0) return;
    const wCtx = work.getContext("2d")!;
    redoStackRef.current.push(wCtx.getImageData(0, 0, work.width, work.height));
    const prev = undoStackRef.current.pop()!;
    wCtx.putImageData(prev, 0, 0);
    setUndoCount(undoStackRef.current.length);
    setRedoCount(redoStackRef.current.length);
    clearSelection();
  }, [clearSelection]);

  const handleRedo = useCallback(() => {
    const work = workCanvasRef.current;
    if (!work || redoStackRef.current.length === 0) return;
    const wCtx = work.getContext("2d")!;
    undoStackRef.current.push(wCtx.getImageData(0, 0, work.width, work.height));
    const next = redoStackRef.current.pop()!;
    wCtx.putImageData(next, 0, 0);
    setUndoCount(undoStackRef.current.length);
    setRedoCount(redoStackRef.current.length);
    clearSelection();
  }, [clearSelection]);

  // Keyboard shortcuts: Delete/Backspace = Erase, Esc = Clear Selection, Ctrl+Z = Undo, Ctrl+Y / Ctrl+Shift+Z = Redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        clearSelection();
      } else if ((e.key === "Delete" || e.key === "Backspace") && hasSelection) {
        e.preventDefault();
        eraseSelectedArea();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection, eraseSelectedArea, handleRedo, handleUndo, hasSelection]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = displayCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
      x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)),
    };
  };

  const getScaledBrushWidth = () => {
    const minDim = Math.min(dims.w, dims.h);
    return Math.max(6, (brushSize / 560) * minDim);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current || !workCanvasRef.current || compareOriginal) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);

    if (tool === "wand") {
      const changed = applyMagicWandToMask(
        workCanvasRef.current,
        maskCanvasRef.current,
        pt.x,
        pt.y,
        wandTolerance,
        selectionOp
      );
      if (changed) {
        const hasAny =
          selectionOp === "add" ? true : checkMaskHasSelection(maskCanvasRef.current);
        setHasSelection(hasAny);
        redrawDisplay();
        if (autoEraseOnRelease && hasAny && selectionOp === "add") {
          eraseSelectedArea();
        }
      }
      return;
    }

    dragStateRef.current = {
      active: true,
      start: pt,
      current: pt,
      lassoPoints: [pt],
    };

    if (tool === "brush") {
      const mCtx = maskCanvasRef.current.getContext("2d")!;
      const bw = getScaledBrushWidth();
      mCtx.save();
      mCtx.globalCompositeOperation =
        selectionOp === "subtract" ? "destination-out" : "source-over";
      mCtx.fillStyle = "#FFFFFF";
      mCtx.beginPath();
      mCtx.arc(pt.x, pt.y, bw / 2, 0, Math.PI * 2);
      mCtx.fill();
      mCtx.restore();
      setHasSelection(
        selectionOp === "add" ? true : checkMaskHasSelection(maskCanvasRef.current)
      );
      redrawDisplay();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (!drag?.active || !maskCanvasRef.current) return;
    const pt = getCanvasPoint(e);

    if (tool === "brush") {
      const mCtx = maskCanvasRef.current.getContext("2d")!;
      mCtx.save();
      mCtx.globalCompositeOperation =
        selectionOp === "subtract" ? "destination-out" : "source-over";
      mCtx.strokeStyle = "#FFFFFF";
      mCtx.lineWidth = getScaledBrushWidth();
      mCtx.lineCap = "round";
      mCtx.lineJoin = "round";
      mCtx.beginPath();
      mCtx.moveTo(drag.current.x, drag.current.y);
      mCtx.lineTo(pt.x, pt.y);
      mCtx.stroke();
      mCtx.restore();
      drag.current = pt;
      setHasSelection(
        selectionOp === "add" ? true : checkMaskHasSelection(maskCanvasRef.current)
      );
      redrawDisplay();
    } else if (tool === "lasso") {
      const last = drag.lassoPoints[drag.lassoPoints.length - 1];
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      if (dx * dx + dy * dy >= 9) {
        drag.lassoPoints.push(pt);
        drag.current = pt;
        redrawDisplay();
      }
    } else {
      drag.current = pt;
      redrawDisplay();
    }
  };

  const handlePointerUp = () => {
    const drag = dragStateRef.current;
    if (!drag?.active || !maskCanvasRef.current) return;
    dragStateRef.current = null;

    const mCtx = maskCanvasRef.current.getContext("2d")!;
    let addedShape = false;

    if (tool === "rect" || tool === "ellipse") {
      const x = Math.min(drag.start.x, drag.current.x);
      const y = Math.min(drag.start.y, drag.current.y);
      const w = Math.abs(drag.current.x - drag.start.x);
      const h = Math.abs(drag.current.y - drag.start.y);

      if (w >= 4 && h >= 4) {
        mCtx.save();
        mCtx.globalCompositeOperation =
          selectionOp === "subtract" ? "destination-out" : "source-over";
        mCtx.fillStyle = "#FFFFFF";
        mCtx.beginPath();
        if (tool === "rect") {
          mCtx.rect(x, y, w, h);
        } else {
          mCtx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        }
        mCtx.fill();
        mCtx.restore();
        addedShape = true;
      }
    } else if (tool === "lasso" && drag.lassoPoints.length >= 3) {
      mCtx.save();
      mCtx.globalCompositeOperation =
        selectionOp === "subtract" ? "destination-out" : "source-over";
      mCtx.fillStyle = "#FFFFFF";
      mCtx.beginPath();
      mCtx.moveTo(drag.lassoPoints[0].x, drag.lassoPoints[0].y);
      for (let i = 1; i < drag.lassoPoints.length; i++) {
        mCtx.lineTo(drag.lassoPoints[i].x, drag.lassoPoints[i].y);
      }
      mCtx.closePath();
      mCtx.fill();
      mCtx.restore();
      addedShape = true;
    } else if (tool === "brush") {
      addedShape = true;
    }

    const hasAny = checkMaskHasSelection(maskCanvasRef.current);
    setHasSelection(hasAny);
    redrawDisplay();

    if (autoEraseOnRelease && addedShape && hasAny && selectionOp === "add") {
      eraseSelectedArea();
    }
  };

  const handleInvertMask = () => {
    if (!maskCanvasRef.current) return;
    const hasAny = invertSelectionMask(maskCanvasRef.current);
    setHasSelection(hasAny);
    redrawDisplay();
  };

  const handleMorphMask = (dir: "expand" | "shrink") => {
    if (!maskCanvasRef.current || !hasSelection) return;
    const hasAny = morphSelectionMask(maskCanvasRef.current, dir, 3);
    setHasSelection(hasAny);
    redrawDisplay();
  };

  const handleResetOriginal = () => {
    const work = workCanvasRef.current;
    const orig = originalSnapshotRef.current;
    if (!work || !orig) return;
    work.getContext("2d")!.putImageData(orig, 0, 0);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setUndoCount(0);
    setRedoCount(0);
    clearSelection();
  };

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const cleanTitle = file.name.replace(/\.[^.]+$/, "");
        setSourcePhoto(null);
        setImageSrc(reader.result);
        setArtTitle(`${cleanTitle} (Edited)`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const buildEditedPhotoItem = (): PhotoItem | null => {
    const work = workCanvasRef.current;
    if (!work) return null;
    const dataUrl = work.toDataURL("image/png");
    const now = Date.now();
    return {
      id: `erase_${now}_${Math.random().toString(36).slice(2, 6)}`,
      title: artTitle.trim() || "Select & Erase Artwork",
      prompt: sourcePhoto?.prompt || "Edited in Select & Erase Studio",
      dataUrl,
      width: work.width,
      height: work.height,
      aspectRatio: sourcePhoto?.aspectRatio || "custom",
      dpi: sourcePhoto?.dpi,
      pageSize: sourcePhoto?.pageSize,
      colorMode: sourcePhoto?.colorMode,
      isColoringPage: sourcePhoto?.isColoringPage,
      kind: "edited",
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleSaveToPhotoHall = async () => {
    const item = buildEditedPhotoItem();
    if (!item) return;
    setSaving(true);
    try {
      await onSaveNewPhoto(item);
      setSaveSuccess("Photo Hall ထဲသို့ သိမ်းဆည်းပြီးပါပြီ!");
      window.setTimeout(() => setSaveSuccess(null), 2600);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPng = () => {
    const work = workCanvasRef.current;
    if (!work) return;
    triggerDownload(work.toDataURL("image/png"), `${artTitle || "select-erase"}.png`);
  };

  const handleDownloadJpg = () => {
    const work = workCanvasRef.current;
    if (!work) return;
    const c = document.createElement("canvas");
    c.width = work.width;
    c.height = work.height;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(work, 0, 0);
    triggerDownload(c.toDataURL("image/jpeg", 0.94), `${artTitle || "select-erase"}.jpg`);
  };

  const handleSendTo = (page: PageId) => {
    const item = buildEditedPhotoItem();
    if (!item) return;
    onSendToPage(page, item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-14 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadImage}
        className="hidden"
      />

      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500">
            Select &amp; Erase Studio · Best Edition
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Precision Select &amp; Erase Editor
          </h1>
          <p className="text-sm text-zinc-600 max-w-2xl">
            ပုံပေါ်ရှိ မလိုအပ်သောအရာများကို Brush, Lasso, Magic Wand, Rectangle နှင့် Oval တို့ဖြင့်
            စိတ်ကြိုက် Select ပေး၍ Smart Fill, Transparent, White သို့မဟုတ် Blur ဖြင့် သေသပ်စွာ ဖျက်နိုင်ပါသည်။
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            disabled={!imageSrc}
            onClick={handleDownloadPng}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl disabled:opacity-45 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            type="button"
            disabled={!imageSrc || saving}
            onClick={handleSaveToPhotoHall}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl disabled:opacity-45 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save to Photo Hall"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{saveSuccess}</span>
          <button
            type="button"
            onClick={() => setSaveSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Canvas Stage + Quick Action Bar */}
        <div className="lg:col-span-8 space-y-3">
          {/* Canvas Toolbar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={!hasSelection || loading}
                onClick={eraseSelectedArea}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Erase Selected Area</span>
              </button>
              <button
                type="button"
                disabled={!hasSelection}
                onClick={clearSelection}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                disabled={undoCount === 0}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap tabular-nums"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo ({undoCount})</span>
              </button>
              <button
                type="button"
                disabled={redoCount === 0}
                onClick={handleRedo}
                title="Redo (Ctrl+Y)"
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap tabular-nums"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span>Redo ({redoCount})</span>
              </button>
              <button
                type="button"
                disabled={!imageSrc}
                onClick={handleResetOriginal}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Compare Before / After Toggle */}
              <button
                type="button"
                disabled={!imageSrc}
                onClick={() => setCompareOriginal((v) => !v)}
                className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap ${
                  compareOriginal
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{compareOriginal ? "Showing Original" : "Compare Original"}</span>
              </button>

              {/* + / - Zoom Stepper */}
              <div className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                <button
                  type="button"
                  disabled={zoomPct <= 50}
                  aria-label="Zoom Out"
                  onClick={() => setZoomPct((z) => Math.max(50, z - 25))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPct(100)}
                  title="Reset zoom to 100%"
                  className="px-1.5 text-[11px] font-semibold text-zinc-800 tabular-nums cursor-pointer"
                >
                  {zoomPct}%
                </button>
                <button
                  type="button"
                  disabled={zoomPct >= 250}
                  aria-label="Zoom In"
                  onClick={() => setZoomPct((z) => Math.min(250, z + 25))}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Dark Studio Canvas Viewport */}
          <div
            className="rounded-2xl border border-zinc-200 bg-[#18181B] overflow-auto min-h-[480px] max-h-[72vh] p-4 sm:p-6 flex items-center justify-center"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {!imageSrc ? (
              <div className="text-center max-w-sm space-y-4 py-16">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-white">
                    No Image Loaded Yet
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Upload a photo or pick any artwork from your Photo Hall to start selecting and erasing areas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-100 rounded-xl cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image to Edit</span>
                </button>
              </div>
            ) : loading ? (
              <div className="text-xs text-zinc-300 py-28">Loading image buffer...</div>
            ) : (
              <div
                className="relative rounded-lg overflow-hidden shadow-2xl border border-white/15 shrink-0"
                style={{
                  width: zoomPct === 100 ? "auto" : `${zoomPct}%`,
                  maxWidth: zoomPct === 100 ? "100%" : "none",
                  backgroundColor: "#ffffff",
                  backgroundImage:
                    "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                }}
              >
                <canvas
                  ref={displayCanvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`block touch-none select-none cursor-crosshair ${
                    zoomPct === 100 ? "max-w-full max-h-[64vh] w-auto h-auto" : "w-full h-auto"
                  }`}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 px-1">
            <span>
              {dims.w}×{dims.h} px · Drag on canvas to select (`Delete` = Erase · `Esc` = Clear · `Ctrl+Z` = Undo)
            </span>
            {tool === "wand" && (
              <span className="text-blue-600 font-medium">
                Magic Wand: Click any uniform region on the image to auto-select it
              </span>
            )}
            {tool === "lasso" && (
              <span className="text-blue-600 font-medium">
                Lasso: Draw freehand around an object to select it cleanly
              </span>
            )}
          </div>
        </div>

        {/* Right: Tools & Precision Settings Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Selection Tools Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-950">Selection Tools</h2>
              <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectionOp("add")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                    selectionOp === "add"
                      ? "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionOp("subtract")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                    selectionOp === "subtract"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  - Subtract
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "brush", label: "Brush", icon: Paintbrush },
                  { id: "lasso", label: "Lasso", icon: Lasso },
                  { id: "wand", label: "Magic Wand", icon: Wand2 },
                  { id: "rect", label: "Rectangle", icon: Square },
                  { id: "ellipse", label: "Oval", icon: Circle },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const active = tool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTool(t.id)}
                    className={`min-h-[42px] px-2 py-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                      active
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] whitespace-nowrap">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selection Refine Utilities */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-semibold text-zinc-600 block">
                Refine Selection Mask
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={handleInvertMask}
                  className="min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <FlipHorizontal2 className="w-3 h-3" />
                  <span>Invert</span>
                </button>
                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={() => handleMorphMask("expand")}
                  className="min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>Expand</span>
                </button>
                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={() => handleMorphMask("shrink")}
                  className="min-h-[34px] inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <Shrink className="w-3 h-3" />
                  <span>Shrink</span>
                </button>
              </div>
            </div>

            {/* + / - Tool Precision Steppers */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              {tool === "brush" && (
                <StepperControl
                  compact
                  label="Brush Size"
                  value={brushSize}
                  min={6}
                  max={140}
                  step={4}
                  unit="px"
                  onChange={setBrushSize}
                />
              )}

              {tool === "wand" && (
                <StepperControl
                  compact
                  label="Wand Color Tolerance"
                  value={wandTolerance}
                  min={2}
                  max={90}
                  step={4}
                  onChange={setWandTolerance}
                />
              )}

              <StepperControl
                compact
                label="Soft Edge (Feather)"
                value={feather}
                min={0}
                max={24}
                step={2}
                unit="px"
                onChange={setFeather}
              />

              <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 cursor-pointer">
                <span>Instant Erase on Release (တိုက်ရိုက်ဖျက်မည်)</span>
                <input
                  type="checkbox"
                  checked={autoEraseOnRelease}
                  onChange={(e) => setAutoEraseOnRelease(e.target.checked)}
                  className="accent-zinc-950 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 2. Erase Fill Mode Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3.5">
            <h2 className="text-sm font-semibold text-zinc-950">Erase &amp; Fill Mode</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "smart-fill", label: "Smart Heal Fill", icon: Sparkles },
                  { id: "transparent", label: "Transparent PNG", icon: Eraser },
                  { id: "white", label: "Pure White", icon: Square },
                  { id: "color", label: "Custom Color", icon: Palette },
                  { id: "blur", label: "Blur Region", icon: Minus },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = fillMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFillMode(m.id)}
                    className={`min-h-[38px] px-2.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    } ${m.id === "blur" ? "col-span-2 justify-center" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {fillMode === "color" && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-700">Pick Fill Color</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_QUICK_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      onClick={() => setCustomColor(c)}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        customColor.toLowerCase() === c.toLowerCase()
                          ? "border-zinc-950 scale-110"
                          : "border-white shadow-xs"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {fillMode === "blur" && (
              <StepperControl
                compact
                label="Blur Intensity"
                value={blurStrength}
                min={4}
                max={40}
                step={2}
                unit="px"
                onChange={setBlurStrength}
              />
            )}
          </div>

          {/* 3. Photo Hall Source Picker & Export */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3.5">
            <div className="space-y-1.5">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-800">Artwork Title</span>
                <input
                  type="text"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="Edited image title..."
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!imageSrc}
                onClick={handleDownloadPng}
                className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl disabled:opacity-45 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG (Alpha)</span>
              </button>
              <button
                type="button"
                disabled={!imageSrc}
                onClick={handleDownloadJpg}
                className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl disabled:opacity-45 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JPG (Print)</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-semibold text-zinc-600 block">
                Send Result To Other Studio Tools
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={() => handleSendTo("ai-edit")}
                  className="min-h-[36px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI Edit</span>
                </button>
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={() => handleSendTo("text")}
                  className="min-h-[36px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <Type className="w-3 h-3" />
                  <span>Text Studio</span>
                </button>
                <button
                  type="button"
                  disabled={!imageSrc}
                  onClick={() => handleSendTo("book")}
                  className="min-h-[36px] inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Book</span>
                </button>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-700">
                    Load from Photo Hall ({photos.length})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {photos.map((photo) => {
                    const selected = imageSrc === photo.dataUrl;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          setSourcePhoto(photo);
                          setImageSrc(photo.dataUrl);
                          setArtTitle(`${photo.title} (Erased)`);
                        }}
                        title={photo.title}
                        className={`aspect-square rounded-lg border overflow-hidden bg-zinc-50 cursor-pointer ${
                          selected
                            ? "border-zinc-950 ring-2 ring-zinc-950/20"
                            : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <img
                          src={photo.dataUrl}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-0.5 bg-white"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
