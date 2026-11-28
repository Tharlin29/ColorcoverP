import { RotateCw } from "lucide-react";
import React, { useRef, useState } from "react";
import { ShowcaseCardSlot } from "../types/studio";
import { ResolvedShowcaseCardRect } from "../utils/showcaseRenderer";

export interface SelectedShowcaseCardRef {
  source: "slot" | "custom";
  index: number;
  id: string;
}

interface ShowcaseCardStageOverlayProps {
  rects: ResolvedShowcaseCardRect[];
  selected: SelectedShowcaseCardRef | null;
  onSelect: (ref: SelectedShowcaseCardRef | null) => void;
  onUpdateCardTransform: (
    ref: SelectedShowcaseCardRef,
    patch: Partial<ShowcaseCardSlot>
  ) => void;
  slotBaseScales: Record<number, number>;
  customBaseWidths: Record<number, number>;
}

type DragMode = "move" | "rotate" | "resize";

interface ActiveDrag {
  mode: DragMode;
  target: SelectedShowcaseCardRef;
  pointerId: number;
  startCanvasX: number;
  startCanvasY: number;
  origCx: number;
  origCy: number;
  origCardW: number;
  origCardH: number;
  origAngleDeg: number;
  origScale: number;
  origWidthPct: number;
  startDistFromCenter: number;
  canvasW: number;
  canvasH: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function snapAngle(deg: number): number {
  const normalized = ((deg + 180) % 360 + 360) % 360 - 180;
  const targets = [0, -90, 90, -45, 45, -15, 15, -180, 180];
  for (const t of targets) {
    if (Math.abs(normalized - t) <= 3.5) {
      return t === -180 ? 180 : t;
    }
  }
  return Math.round(normalized);
}

function hitTestRotatedRect(
  px: number,
  py: number,
  rect: ResolvedShowcaseCardRect
): boolean {
  const rad = (-rect.angleDeg * Math.PI) / 180;
  const dx = px - rect.cx;
  const dy = py - rect.cy;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return Math.abs(lx) <= rect.cardW / 2 && Math.abs(ly) <= rect.cardH / 2;
}

export function ShowcaseCardStageOverlay({
  rects,
  selected,
  onSelect,
  onUpdateCardTransform,
  slotBaseScales,
  customBaseWidths,
}: ShowcaseCardStageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const [draggingMode, setDraggingMode] = useState<DragMode | null>(null);
  const [snapGuideX, setSnapGuideX] = useState(false);
  const [snapGuideY, setSnapGuideY] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (rects.length === 0) return null;

  const canvasW = rects[0].canvasW;
  const canvasH = rects[0].canvasH;

  const clientToCanvas = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const box = el.getBoundingClientRect();
    return {
      x: ((clientX - box.left) / Math.max(1, box.width)) * canvasW,
      y: ((clientY - box.top) / Math.max(1, box.height)) * canvasH,
    };
  };

  const selectedRect = selected
    ? rects.find(
        (r) => r.source === selected.source && r.index === selected.index
      ) || null
    : null;

  const beginDrag = (
    e: React.PointerEvent,
    mode: DragMode,
    rect: ResolvedShowcaseCardRect
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const target: SelectedShowcaseCardRef = {
      source: rect.source,
      index: rect.index,
      id: rect.id,
    };
    onSelect(target);

    const pt = clientToCanvas(e.clientX, e.clientY);
    const dist = Math.hypot(pt.x - rect.cx, pt.y - rect.cy);

    dragRef.current = {
      mode,
      target,
      pointerId: e.pointerId,
      startCanvasX: pt.x,
      startCanvasY: pt.y,
      origCx: rect.cx,
      origCy: rect.cy,
      origCardW: rect.cardW,
      origCardH: rect.cardH,
      origAngleDeg: rect.angleDeg,
      origScale:
        rect.source === "slot" ? (slotBaseScales[rect.index] ?? 1) : 1,
      origWidthPct:
        rect.source === "custom"
          ? (customBaseWidths[rect.index] ?? (rect.cardW / rect.canvasW) * 100)
          : (rect.cardW / rect.canvasW) * 100,
      startDistFromCenter: Math.max(20, dist),
      canvasW: rect.canvasW,
      canvasH: rect.canvasH,
    };
    setDraggingMode(mode);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pt = clientToCanvas(e.clientX, e.clientY);
    // Hit test from topmost rendered card downwards
    for (let i = rects.length - 1; i >= 0; i--) {
      if (hitTestRotatedRect(pt.x, pt.y, rects[i])) {
        beginDrag(e, "move", rects[i]);
        return;
      }
    }
    onSelect(null);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const pt = clientToCanvas(e.clientX, e.clientY);

    if (!drag) {
      let found: string | null = null;
      for (let i = rects.length - 1; i >= 0; i--) {
        if (hitTestRotatedRect(pt.x, pt.y, rects[i])) {
          found = `${rects[i].source}-${rects[i].index}`;
          break;
        }
      }
      if (found !== hoveredKey) setHoveredKey(found);
      return;
    }

    e.preventDefault();

    if (drag.mode === "move") {
      const dx = pt.x - drag.startCanvasX;
      const dy = pt.y - drag.startCanvasY;
      let nextX = clamp(((drag.origCx + dx) / drag.canvasW) * 100, 4, 96);
      let nextY = clamp(((drag.origCy + dy) / drag.canvasH) * 100, 4, 96);

      // Gentle magnetic center snap (within 1.5%)
      const snappedX = Math.abs(nextX - 50) <= 1.5;
      const snappedY = Math.abs(nextY - 50) <= 1.5;
      if (snappedX) nextX = 50;
      if (snappedY) nextY = 50;
      setSnapGuideX(snappedX);
      setSnapGuideY(snappedY);

      onUpdateCardTransform(drag.target, {
        x: Math.round(nextX * 10) / 10,
        y: Math.round(nextY * 10) / 10,
      });
    } else if (drag.mode === "rotate") {
      // Angle from center to pointer; top-center handle sits at -90deg (straight up)
      const angleRad = Math.atan2(pt.y - drag.origCy, pt.x - drag.origCx);
      const degFromTop = (angleRad * 180) / Math.PI + 90;
      const snapped = snapAngle(degFromTop);
      onUpdateCardTransform(drag.target, {
        rotation: snapped,
      });
    } else if (drag.mode === "resize") {
      const dist = Math.hypot(pt.x - drag.origCx, pt.y - drag.origCy);
      const ratio = dist / drag.startDistFromCenter;
      if (drag.target.source === "custom") {
        const nextW = clamp(Math.round(drag.origWidthPct * ratio), 12, 90);
        onUpdateCardTransform(drag.target, { widthPct: nextW });
      } else {
        const nextScale = clamp(
          Math.round(drag.origScale * ratio * 100) / 100,
          0.35,
          2.2
        );
        onUpdateCardTransform(drag.target, { scale: nextScale });
      }
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setDraggingMode(null);
    setSnapGuideX(false);
    setSnapGuideY(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={() => {
        if (!dragRef.current) setHoveredKey(null);
      }}
      className={`absolute inset-0 z-10 select-none touch-none ${
        draggingMode === "move"
          ? "cursor-grabbing"
          : hoveredKey
            ? "cursor-grab"
            : "cursor-default"
      }`}
      aria-label="Interactive showcase card positioning stage"
    >
      {/* Center alignment snap guides while dragging */}
      {snapGuideX && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-dashed border-blue-400/90"
        />
      )}
      {snapGuideY && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-blue-400/90"
        />
      )}

      {/* Subtle hover highlight on unselected cards */}
      {rects.map((rect) => {
        const key = `${rect.source}-${rect.index}`;
        const isSelected =
          selected?.source === rect.source && selected?.index === rect.index;
        const isHovered = hoveredKey === key && !isSelected && !draggingMode;
        if (!isHovered) return null;
        return (
          <div
            key={`hover-${key}`}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-sm border-2 border-dashed border-blue-400/90 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]"
            style={{
              left: `${(rect.cx / rect.canvasW) * 100}%`,
              top: `${(rect.cy / rect.canvasH) * 100}%`,
              width: `${(rect.cardW / rect.canvasW) * 100}%`,
              height: `${(rect.cardH / rect.canvasH) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${rect.angleDeg}deg)`,
            }}
          />
        );
      })}

      {/* Active selected card transform gizmo (Move, Rotate, 4-Corner Resize) */}
      {selectedRect && (
        <div
          className="absolute rounded-sm border-2 border-blue-500 shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]"
          style={{
            left: `${(selectedRect.cx / selectedRect.canvasW) * 100}%`,
            top: `${(selectedRect.cy / selectedRect.canvasH) * 100}%`,
            width: `${(selectedRect.cardW / selectedRect.canvasW) * 100}%`,
            height: `${(selectedRect.cardH / selectedRect.canvasH) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${selectedRect.angleDeg}deg)`,
          }}
        >
          {/* Rotate Handle Stem + Knob */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -top-7 h-7 w-0.5 -translate-x-1/2 bg-blue-500"
          />
          <button
            type="button"
            title="Drag to rotate (snaps to 0° straight)"
            aria-label="Rotate card"
            onPointerDown={(e) => beginDrag(e, "rotate", selectedRect)}
            className="absolute left-1/2 -top-10 -translate-x-1/2 w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-blue-700"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Live angle / position badge during drag */}
          {draggingMode && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -bottom-7 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-950/90 text-white text-[10px] font-mono tabular-nums whitespace-nowrap shadow"
            >
              {draggingMode === "rotate"
                ? Math.round(selectedRect.angleDeg) === 0
                  ? "0° Straight"
                  : `${Math.round(selectedRect.angleDeg)}°`
                : `${Math.round((selectedRect.cx / selectedRect.canvasW) * 100)}% , ${Math.round((selectedRect.cy / selectedRect.canvasH) * 100)}%`}
            </div>
          )}

          {/* 4 Corner Resize Handles */}
          {(
            [
              { pos: "-top-2 -left-2", cursor: "cursor-nwse-resize" },
              { pos: "-top-2 -right-2", cursor: "cursor-nesw-resize" },
              { pos: "-bottom-2 -left-2", cursor: "cursor-nesw-resize" },
              { pos: "-bottom-2 -right-2", cursor: "cursor-nwse-resize" },
            ] as const
          ).map((handle, idx) => (
            <button
              key={`resize-${idx}`}
              type="button"
              title="Drag corner to resize card"
              aria-label="Resize card"
              onPointerDown={(e) => beginDrag(e, "resize", selectedRect)}
              className={`absolute ${handle.pos} w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-sm ${handle.cursor}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
