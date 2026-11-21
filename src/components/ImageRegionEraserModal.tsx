import {
  Check,
  Circle,
  Eraser,
  Minus,
  Paintbrush,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type EraseSelectionTool = "rect" | "ellipse" | "brush";
export type EraseFillMode = "transparent" | "white" | "smart-fill";

interface ImageRegionEraserModalProps {
  open: boolean;
  imageSrc: string | null;
  title?: string;
  defaultFillMode?: EraseFillMode;
  onClose: () => void;
  onApply: (newDataUrl: string, width: number, height: number) => void;
}

interface Point {
  x: number;
  y: number;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function createSmartFillPatch(
  workCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  bx: number,
  by: number,
  bw: number,
  bh: number
): HTMLCanvasElement {
  const maxGrid = 200;
  const scale = Math.min(1, maxGrid / Math.max(bw, bh));
  const sw = Math.max(8, Math.round(bw * scale));
  const sh = Math.max(8, Math.round(bh * scale));

  const smallImg = document.createElement("canvas");
  smallImg.width = sw;
  smallImg.height = sh;
  const sImgCtx = smallImg.getContext("2d")!;
  sImgCtx.drawImage(workCanvas, bx, by, bw, bh, 0, 0, sw, sh);

  const smallMask = document.createElement("canvas");
  smallMask.width = sw;
  smallMask.height = sh;
  const sMaskCtx = smallMask.getContext("2d")!;
  sMaskCtx.drawImage(maskCanvas, bx, by, bw, bh, 0, 0, sw, sh);

  const imgData = sImgCtx.getImageData(0, 0, sw, sh);
  const maskData = sMaskCtx.getImageData(0, 0, sw, sh);
  const data = imgData.data;
  const mData = maskData.data;

  const total = sw * sh;
  const isHole = new Uint8Array(total);
  const known = new Uint8Array(total);

  // Mark selected pixels + 1px dilation as hole so foreground border doesn't bleed
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = y * sw + x;
      if (mData[idx * 4 + 3] > 20) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
              isHole[ny * sw + nx] = 1;
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < total; i++) {
    if (!isHole[i] && data[i * 4 + 3] > 16) {
      known[i] = 1;
    }
  }

  // Iterative frontier diffusion inward from valid neighboring pixels
  const maxPasses = Math.max(sw, sh) + 12;
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    const nextKnown = new Uint8Array(known);
    const nextData = new Uint8ClampedArray(data);

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = y * sw + x;
        if (known[idx]) continue;

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let aSum = 0;
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= sw || ny < 0 || ny >= sh) continue;
            const nIdx = ny * sw + nx;
            if (known[nIdx]) {
              const p = nIdx * 4;
              rSum += data[p];
              gSum += data[p + 1];
              bSum += data[p + 2];
              aSum += data[p + 3];
              count++;
            }
          }
        }

        if (count > 0) {
          const p = idx * 4;
          nextData[p] = Math.round(rSum / count);
          nextData[p + 1] = Math.round(gSum / count);
          nextData[p + 2] = Math.round(bSum / count);
          nextData[p + 3] = Math.round(aSum / count);
          nextKnown[idx] = 1;
          changed = true;
        }
      }
    }

    data.set(nextData);
    known.set(nextKnown);
    if (!changed) break;
  }

  // Smooth the filled interior pixels
  for (let s = 0; s < 5; s++) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = y * sw + x;
        if (!isHole[idx]) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const p = ((y + dy) * sw + (x + dx)) * 4;
            r += copy[p];
            g += copy[p + 1];
            b += copy[p + 2];
            a += copy[p + 3];
          }
        }
        const p = idx * 4;
        data[p] = Math.round(r / 9);
        data[p + 1] = Math.round(g / 9);
        data[p + 2] = Math.round(b / 9);
        data[p + 3] = Math.round(a / 9);
      }
    }
  }

  sImgCtx.putImageData(imgData, 0, 0);

  const fullPatch = document.createElement("canvas");
  fullPatch.width = bw;
  fullPatch.height = bh;
  const fCtx = fullPatch.getContext("2d")!;
  fCtx.imageSmoothingEnabled = true;
  fCtx.imageSmoothingQuality = "high";
  fCtx.drawImage(smallImg, 0, 0, sw, sh, 0, 0, bw, bh);
  return fullPatch;
}

export function ImageRegionEraserModal({
  open,
  imageSrc,
  title = "Select & Erase Image Area",
  defaultFillMode = "smart-fill",
  onClose,
  onApply,
}: ImageRegionEraserModalProps) {
  const [tool, setTool] = useState<EraseSelectionTool>("rect");
  const [fillMode, setFillMode] = useState<EraseFillMode>(defaultFillMode);
  const [brushSize, setBrushSize] = useState(36);
  const [feather, setFeather] = useState(4);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hasSelection, setHasSelection] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalSnapshotRef = useRef<ImageData | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);

  const dragStateRef = useRef<{
    active: boolean;
    start: Point;
    current: Point;
  } | null>(null);

  useEffect(() => {
    setFillMode(defaultFillMode);
  }, [defaultFillMode, open]);

  const redrawDisplay = useCallback(() => {
    const disp = displayCanvasRef.current;
    const work = workCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!disp || !work || !mask) return;

    const ctx = disp.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, disp.width, disp.height);
    ctx.drawImage(work, 0, 0);

    // Tint finalized mask selection in semi-transparent crimson
    const tintCanvas = document.createElement("canvas");
    tintCanvas.width = disp.width;
    tintCanvas.height = disp.height;
    const tCtx = tintCanvas.getContext("2d");
    if (tCtx) {
      tCtx.drawImage(mask, 0, 0);
      tCtx.globalCompositeOperation = "source-in";
      tCtx.fillStyle = "rgba(239, 68, 68, 0.42)";
      tCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);
      ctx.drawImage(tintCanvas, 0, 0);
    }

    // Draw active drag marquee if dragging rect or ellipse
    const drag = dragStateRef.current;
    if (drag?.active && (tool === "rect" || tool === "ellipse")) {
      const x = Math.min(drag.start.x, drag.current.x);
      const y = Math.min(drag.start.y, drag.current.y);
      const w = Math.abs(drag.current.x - drag.start.x);
      const h = Math.abs(drag.current.y - drag.start.y);

      ctx.save();
      ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(2, Math.round(Math.min(disp.width, disp.height) * 0.004));
      ctx.setLineDash([8, 6]);

      ctx.beginPath();
      if (tool === "rect") {
        ctx.rect(x, y, w, h);
      } else {
        ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#EF4444";
      ctx.lineDashOffset = 7;
      ctx.stroke();
      ctx.restore();
    }
  }, [tool]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    let mounted = true;
    setLoading(true);
    setHasSelection(false);
    setUndoCount(0);
    undoStackRef.current = [];

    loadImg(imageSrc)
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
  }, [open, imageSrc, redrawDisplay]);

  useEffect(() => {
    if (!loading && open) {
      redrawDisplay();
    }
  }, [loading, open, dims, redrawDisplay]);

  if (!open || !imageSrc) return null;

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
    return Math.max(6, (brushSize / 600) * minDim);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);
    dragStateRef.current = { active: true, start: pt, current: pt };

    if (tool === "brush") {
      const mCtx = maskCanvasRef.current.getContext("2d")!;
      const bw = getScaledBrushWidth();
      mCtx.fillStyle = "#FFFFFF";
      mCtx.beginPath();
      mCtx.arc(pt.x, pt.y, bw / 2, 0, Math.PI * 2);
      mCtx.fill();
      setHasSelection(true);
      redrawDisplay();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (!drag?.active || !maskCanvasRef.current) return;
    const pt = getCanvasPoint(e);

    if (tool === "brush") {
      const mCtx = maskCanvasRef.current.getContext("2d")!;
      mCtx.strokeStyle = "#FFFFFF";
      mCtx.lineWidth = getScaledBrushWidth();
      mCtx.lineCap = "round";
      mCtx.lineJoin = "round";
      mCtx.beginPath();
      mCtx.moveTo(drag.current.x, drag.current.y);
      mCtx.lineTo(pt.x, pt.y);
      mCtx.stroke();
      drag.current = pt;
      setHasSelection(true);
      redrawDisplay();
    } else {
      drag.current = pt;
      redrawDisplay();
    }
  };

  const handlePointerUp = () => {
    const drag = dragStateRef.current;
    if (!drag?.active || !maskCanvasRef.current) return;
    dragStateRef.current = null;

    if (tool === "rect" || tool === "ellipse") {
      const x = Math.min(drag.start.x, drag.current.x);
      const y = Math.min(drag.start.y, drag.current.y);
      const w = Math.abs(drag.current.x - drag.start.x);
      const h = Math.abs(drag.current.y - drag.start.y);

      if (w >= 4 && h >= 4) {
        const mCtx = maskCanvasRef.current.getContext("2d")!;
        mCtx.fillStyle = "#FFFFFF";
        mCtx.beginPath();
        if (tool === "rect") {
          mCtx.rect(x, y, w, h);
        } else {
          mCtx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        }
        mCtx.fill();
        setHasSelection(true);
      }
      redrawDisplay();
    }
  };

  const clearSelection = () => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mCtx = mask.getContext("2d")!;
    mCtx.clearRect(0, 0, mask.width, mask.height);
    setHasSelection(false);
    redrawDisplay();
  };

  const eraseSelectedArea = () => {
    const work = workCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!work || !mask || !hasSelection) return;

    const wCtx = work.getContext("2d")!;
    const mCtx = mask.getContext("2d")!;
    const { width: w, height: h } = work;

    // Find mask bounding box
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

    // Push snapshot for Undo
    undoStackRef.current.push(wCtx.getImageData(0, 0, w, h));
    setUndoCount(undoStackRef.current.length);

    // Prepare feathered mask
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
    } else if (fillMode === "white") {
      const patch = document.createElement("canvas");
      patch.width = w;
      patch.height = h;
      const pCtx = patch.getContext("2d")!;
      pCtx.fillStyle = "#FFFFFF";
      pCtx.fillRect(0, 0, w, h);
      pCtx.globalCompositeOperation = "destination-in";
      pCtx.drawImage(featheredMask, 0, 0);
      wCtx.drawImage(patch, 0, 0);
    } else {
      const margin = Math.max(24, Math.round(Math.min(w, h) * 0.06));
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

    // Clear selection mask after erasing
    mCtx.clearRect(0, 0, w, h);
    setHasSelection(false);
    redrawDisplay();
  };

  const handleUndo = () => {
    const work = workCanvasRef.current;
    if (!work || undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop()!;
    work.getContext("2d")!.putImageData(prev, 0, 0);
    setUndoCount(undoStackRef.current.length);
    clearSelection();
  };

  const handleReset = () => {
    const work = workCanvasRef.current;
    const orig = originalSnapshotRef.current;
    if (!work || !orig) return;
    work.getContext("2d")!.putImageData(orig, 0, 0);
    undoStackRef.current = [];
    setUndoCount(0);
    clearSelection();
  };

  const handleApplyAndSave = () => {
    const work = workCanvasRef.current;
    if (!work) return;
    const dataUrl = work.toDataURL("image/png");
    onApply(dataUrl, work.width, work.height);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-bold text-zinc-950">{title}</h2>
            <p className="text-xs text-zinc-500">
              ပုံပေါ်ရှိ ဖျက်လိုသောနေရာကို Rectangle, Oval သို့မဟုတ် Brush ဖြင့် Select ပေးပြီး Erase Selected Area နှိပ်ပါ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close eraser"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          {/* Selection Tool */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Select Tool
            </span>
            <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-lg">
              <button
                type="button"
                onClick={() => setTool("rect")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                  tool === "rect" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Rectangle</span>
              </button>
              <button
                type="button"
                onClick={() => setTool("ellipse")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                  tool === "ellipse" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Oval</span>
              </button>
              <button
                type="button"
                onClick={() => setTool("brush")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                  tool === "brush" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Brush</span>
              </button>
            </div>

            {tool === "brush" && (
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-700 bg-white border border-zinc-200 px-2 py-1 rounded-lg">
                <span className="font-medium pr-1">Size</span>
                <button
                  type="button"
                  disabled={brushSize <= 8}
                  aria-label="Decrease Brush Size"
                  onClick={() => setBrushSize((s) => Math.max(8, s - 4))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="tabular-nums font-semibold text-[11px] text-zinc-900 w-9 text-center">
                  {brushSize}px
                </span>
                <button
                  type="button"
                  disabled={brushSize >= 110}
                  aria-label="Increase Brush Size"
                  onClick={() => setBrushSize((s) => Math.min(110, s + 4))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Erase Fill Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Fill Mode
            </span>
            <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-lg">
              {(
                [
                  { id: "smart-fill", label: "Smart Fill" },
                  { id: "white", label: "Pure White" },
                  { id: "transparent", label: "Transparent" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFillMode(m.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                    fillMode === m.id ? "bg-blue-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-700 bg-white border border-zinc-200 px-2 py-1 rounded-lg">
              <span className="font-medium pr-1">Soft Edge</span>
              <button
                type="button"
                disabled={feather <= 0}
                aria-label="Decrease Soft Edge"
                onClick={() => setFeather((f) => Math.max(0, f - 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="tabular-nums font-semibold text-[11px] text-zinc-900 w-8 text-center">
                {feather}px
              </span>
              <button
                type="button"
                disabled={feather >= 20}
                aria-label="Increase Soft Edge"
                onClick={() => setFeather((f) => Math.min(20, f + 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-950 hover:text-white disabled:opacity-35 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div
          className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[#18181B]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {loading ? (
            <div className="text-xs text-zinc-300 py-24">Loading image editor...</div>
          ) : (
            <div
              className="relative rounded-lg overflow-hidden shadow-2xl border border-white/15"
              style={{
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
                className="block max-w-full max-h-[54vh] w-auto h-auto touch-none select-none cursor-crosshair"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!hasSelection}
              onClick={eraseSelectedArea}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Erase Selected Area</span>
            </button>
            <button
              type="button"
              disabled={!hasSelection}
              onClick={clearSelection}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Selection</span>
            </button>
            <button
              type="button"
              disabled={undoCount === 0}
              onClick={handleUndo}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 rounded-lg cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo ({undoCount})</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyAndSave}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
