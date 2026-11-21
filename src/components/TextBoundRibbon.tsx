import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Copy,
  Frame,
  Minus,
  Move,
  Palette,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FontOption, TextLayer, TextStylePreset } from "../types/studio";
import { FONT_OPTIONS } from "../utils/imageEditor";
import { TEXT_BOUND_STYLES } from "../utils/textBoundRenderer";
import { StepperControl } from "./StepperControl";

export const DEFAULT_RIBBON_STYLE_PRESETS: { id: TextStylePreset; label: string }[] = [
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

export const DEFAULT_RIBBON_SWATCHES = [
  "#FFFFFF",
  "#111113",
  "#FBBF24",
  "#22D3EE",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#10B981",
  "#2563EB",
  "#451A03",
];

type RibbonTab = "text" | "bound" | "arrange";
type RibbonPopover = "font" | "style" | "swatches" | "effects" | "bound-shape" | null;

interface CompactRibbonStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (nextValue: number) => void;
}

function CompactRibbonStepper({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  disabled = false,
  onChange,
}: CompactRibbonStepperProps) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  const stopHold = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  const clampAndCommit = (dir: -1 | 1, multiplier = 1) => {
    if (disabled) return;
    const delta = dir * step * multiplier;
    const raw = valueRef.current + delta;
    const rounded = Math.round(raw * 100) / 100;
    const next = Math.max(min, Math.min(max, rounded));
    if (next !== valueRef.current) {
      onChange(next);
    }
  };

  const startHold = (dir: -1 | 1) => {
    if (disabled) return;
    stopHold();
    holdTimeoutRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        clampAndCommit(dir);
      }, 65);
    }, 320);
  };

  return (
    <div className="inline-flex items-center gap-1 h-9 px-1.5 rounded-lg bg-zinc-50 border border-zinc-200 shrink-0">
      <span className="text-[11px] font-medium text-zinc-500 pl-1 whitespace-nowrap">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label}`}
        onClick={(e) => clampAndCommit(-1, e.shiftKey ? 5 : 1)}
        onMouseDown={() => startHold(-1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold(-1)}
        onTouchEnd={stopHold}
        className="w-6 h-6 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="min-w-[38px] text-center text-xs font-semibold text-zinc-900 font-mono tabular-nums select-none">
        {value}
        {unit}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        aria-label={`Increase ${label}`}
        onClick={(e) => clampAndCommit(1, e.shiftKey ? 5 : 1)}
        onMouseDown={() => startHold(1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold(1)}
        onTouchEnd={stopHold}
        className="w-6 h-6 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export interface TextBoundRibbonProps {
  layers: TextLayer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onUpdateLayer: (patch: Partial<TextLayer>) => void;
  stylePresets?: { id: TextStylePreset; label: string }[];
  fontOptions?: FontOption[];
  colorSwatches?: string[];
  minLayers?: number;
  disabled?: boolean;
  defaultBoundColor?: string;
  defaultBoundFillColor?: string;
  defaultBoundFillOpacity?: number;
}

export function TextBoundRibbon({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onUpdateLayer,
  stylePresets = DEFAULT_RIBBON_STYLE_PRESETS,
  fontOptions = FONT_OPTIONS,
  colorSwatches = DEFAULT_RIBBON_SWATCHES,
  minLayers = 0,
  disabled = false,
  defaultBoundColor = "#FFFFFF",
  defaultBoundFillColor = "#111113",
  defaultBoundFillOpacity = 0.25,
}: TextBoundRibbonProps) {
  const [ribbonTab, setRibbonTab] = useState<RibbonTab>("text");
  const [openPopover, setOpenPopover] = useState<RibbonPopover>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);

  const activeLayer =
    layers.find((l) => l.id === activeLayerId) || (layers.length > 0 ? layers[0] : null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopover(null);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const togglePopover = (target: Exclude<RibbonPopover, null>) => {
    setOpenPopover((prev) => (prev === target ? null : target));
  };

  const applyBoundPatch = (patch: Partial<TextLayer>) => {
    if (!activeLayer) return;
    const isNone = !activeLayer.boundStyle || activeLayer.boundStyle === "none";
    if (isNone && !patch.boundStyle) {
      onUpdateLayer({
        boundStyle: "solid",
        boundColor: activeLayer.boundColor || defaultBoundColor,
        boundFillColor: activeLayer.boundFillColor || defaultBoundFillColor,
        boundFillOpacity: activeLayer.boundFillOpacity ?? defaultBoundFillOpacity,
        ...patch,
      });
    } else {
      onUpdateLayer(patch);
    }
  };

  const currentFont = activeLayer
    ? fontOptions.find((f) => f.family === activeLayer.fontFamily) || fontOptions[0]
    : fontOptions[0];

  const currentStylePreset = activeLayer
    ? stylePresets.find((s) => s.id === activeLayer.stylePreset) || stylePresets[0]
    : stylePresets[0];

  const currentBoundStyle = activeLayer
    ? TEXT_BOUND_STYLES.find((b) => b.id === (activeLayer.boundStyle || "none")) ||
      TEXT_BOUND_STYLES[0]
    : TEXT_BOUND_STYLES[0];

  const hasBound = Boolean(activeLayer?.boundStyle && activeLayer.boundStyle !== "none");
  const controlsDisabled = disabled || !activeLayer;

  return (
    <div
      ref={ribbonRef}
      aria-label="Text and Bound Formatting Toolbar"
      className="bg-white border border-zinc-200 rounded-xl shadow-xs relative z-30"
    >
      {/* Row 1: Microsoft Word-Style Ribbon Tabs + Layer Strip */}
      <div className="bg-[#F4F4F2] border-b border-zinc-200 px-3 pt-1.5 pb-1.5 rounded-t-xl flex flex-wrap items-center justify-between gap-2">
        {/* Ribbon Tabs */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Toolbar sections">
          {(
            [
              { id: "text", label: "Text", icon: Type },
              { id: "bound", label: "Bound", icon: Frame },
              { id: "arrange", label: "Arrange", icon: Move },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = ribbonTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setRibbonTab(tab.id);
                  setOpenPopover(null);
                }}
                className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? "bg-white text-zinc-950 border border-zinc-200 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === "bound" && hasBound && (
                  <span className="text-[10px] font-medium text-blue-600">· On</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Layer Switcher & Layer Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {layers.length > 0 && (
            <div className="flex items-center gap-1 max-w-[260px] sm:max-w-[340px] overflow-x-auto">
              {layers.map((l, idx) => {
                const selected = activeLayer?.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelectLayer(l.id)}
                    title={l.text || `Text ${idx + 1}`}
                    className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      selected
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    T{idx + 1}: {(l.text || "Text").trim().slice(0, 10) || idx + 1}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onAddLayer();
              setOpenPopover(null);
            }}
            className="min-h-[34px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-45 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text</span>
          </button>

          {activeLayer && (
            <>
              <button
                type="button"
                disabled={controlsDisabled}
                onClick={onDuplicateLayer}
                title="Duplicate selected text layer"
                aria-label="Duplicate selected text layer"
                className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 disabled:opacity-40 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {layers.length > minLayers && (
                <button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => onDeleteLayer(activeLayer.id)}
                  title="Delete selected text layer"
                  aria-label="Delete selected text layer"
                  className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Empty / No Layer State */}
      {!activeLayer ? (
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
          <span>
            {disabled
              ? "Upload or select an image below to add text and decorative bounds."
              : "Click Add Text to place translated Myanmar or English text and bounds directly on the image."}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={onAddLayer}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-45 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Text</span>
          </button>
        </div>
      ) : (
        <>
          {/* Row 2: Inline Text Content Input Bar */}
          <div className="px-3 py-2 border-b border-zinc-100 flex items-center gap-2.5 bg-white">
            <label
              htmlFor="ribbon-text-content"
              className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap shrink-0"
            >
              Text
            </label>
            <textarea
              id="ribbon-text-content"
              rows={1}
              value={activeLayer.text}
              onChange={(e) => onUpdateLayer({ text: e.target.value })}
              placeholder="Type or paste translated text (မြန်မာ / English)..."
              className="flex-1 min-h-[38px] max-h-[72px] px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y leading-snug"
            />
          </div>

          {/* Row 3: Word-Style Ribbon Groups */}
          <div className="px-3 py-2.5 flex flex-wrap items-stretch gap-y-2.5">
            {ribbonTab === "text" && (
              <>
                {/* Group 1: Font */}
                <div className="flex flex-col justify-between gap-1.5 pr-3 mr-3 border-r border-zinc-200/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Font Family Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => togglePopover("font")}
                        className={`h-9 inline-flex items-center justify-between gap-2 px-2.5 text-xs font-medium rounded-lg border min-w-[148px] max-w-[190px] cursor-pointer whitespace-nowrap ${
                          openPopover === "font"
                            ? "border-blue-600 bg-blue-50/50 text-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-900"
                        }`}
                      >
                        <span className="truncate" style={{ fontFamily: currentFont.family }}>
                          {currentFont.label}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </button>

                      {openPopover === "font" && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 z-50 max-h-72 overflow-y-auto grid grid-cols-1 gap-1">
                          {fontOptions.map((font) => {
                            const selected = activeLayer.fontFamily === font.family;
                            return (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => {
                                  onUpdateLayer({ fontFamily: font.family });
                                  setOpenPopover(null);
                                }}
                                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left border cursor-pointer ${
                                  selected
                                    ? "bg-blue-50 border-blue-600 text-zinc-950"
                                    : "bg-white border-transparent hover:bg-zinc-50 text-zinc-800"
                                }`}
                              >
                                <div className="min-w-0">
                                  <div
                                    className="text-xs font-semibold truncate"
                                    style={{ fontFamily: font.family }}
                                  >
                                    {font.label}
                                  </div>
                                  <div
                                    className="text-[11px] text-zinc-500 truncate"
                                    style={{ fontFamily: font.family }}
                                  >
                                    {font.sample}
                                  </div>
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 shrink-0">
                                  {font.tag}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Font Size Stepper */}
                    <CompactRibbonStepper
                      label="Size"
                      value={activeLayer.fontSize}
                      min={16}
                      max={140}
                      step={2}
                      unit="px"
                      onChange={(val) => onUpdateLayer({ fontSize: val })}
                    />

                    {/* Font Weight */}
                    <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/70 h-9">
                      {(
                        [
                          { id: "400", label: "Reg" },
                          { id: "600", label: "Med" },
                          { id: "700", label: "Bold" },
                        ] as const
                      ).map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => onUpdateLayer({ fontWeight: w.id })}
                          className={`h-7 px-2 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                            activeLayer.fontWeight === w.id
                              ? "bg-white text-zinc-950 shadow-2xs"
                              : "text-zinc-600 hover:text-zinc-950"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>

                    {/* Alignment */}
                    <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/70 h-9">
                      {(
                        [
                          { id: "left", icon: AlignLeft },
                          { id: "center", icon: AlignCenter },
                          { id: "right", icon: AlignRight },
                        ] as const
                      ).map((al) => {
                        const Icon = al.icon;
                        return (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => onUpdateLayer({ align: al.id })}
                            aria-label={`Align ${al.id}`}
                            className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer ${
                              activeLayer.align === al.id
                                ? "bg-white text-zinc-950 shadow-2xs"
                                : "text-zinc-500 hover:text-zinc-950"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Font &amp; Paragraph
                  </span>
                </div>

                {/* Group 2: Style & Colors */}
                <div className="flex flex-col justify-between gap-1.5 pr-3 mr-3 border-r border-zinc-200/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Text Style Gallery Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => togglePopover("style")}
                        className={`h-9 inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap ${
                          openPopover === "style"
                            ? "border-blue-600 bg-blue-50/50 text-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-900"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentStylePreset.label}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </button>

                      {openPopover === "style" && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl p-2.5 z-50 space-y-2">
                          <div className="text-[11px] font-semibold text-zinc-700">
                            Text Style Presets
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {stylePresets.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  onUpdateLayer({ stylePreset: st.id });
                                  setOpenPopover(null);
                                }}
                                className={`min-h-[34px] px-2 py-1 text-[11px] font-medium rounded-lg border cursor-pointer truncate ${
                                  activeLayer.stylePreset === st.id
                                    ? "bg-zinc-950 text-white border-zinc-950"
                                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Swatches Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => togglePopover("swatches")}
                        title="Quick text color swatches"
                        className={`h-9 inline-flex items-center gap-1.5 px-2 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                          openPopover === "swatches"
                            ? "border-blue-600 bg-blue-50/50 text-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-800"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-300"
                          style={{ backgroundColor: activeLayer.color }}
                        />
                        <Palette className="w-3.5 h-3.5 text-zinc-500" />
                      </button>

                      {openPopover === "swatches" && (
                        <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 space-y-2">
                          <div className="text-[11px] font-semibold text-zinc-700">
                            Quick Text Colors
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {colorSwatches.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                aria-label={`Select text color ${hex}`}
                                onClick={() => {
                                  onUpdateLayer({ color: hex });
                                  setOpenPopover(null);
                                }}
                                className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                                  activeLayer.color.toUpperCase() === hex
                                    ? "ring-2 ring-blue-600 ring-offset-2 scale-110"
                                    : "border-zinc-300"
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Direct Color Pickers */}
                    <label className="h-9 inline-flex items-center gap-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Fill</span>
                      <input
                        type="color"
                        value={activeLayer.color}
                        onChange={(e) => onUpdateLayer({ color: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                    <label className="h-9 inline-flex items-center gap-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Accent</span>
                      <input
                        type="color"
                        value={activeLayer.accentColor}
                        onChange={(e) => onUpdateLayer({ accentColor: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                    <label className="h-9 inline-flex items-center gap-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Outline</span>
                      <input
                        type="color"
                        value={activeLayer.strokeColor || "#111113"}
                        onChange={(e) => onUpdateLayer({ strokeColor: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                    <label className="h-9 inline-flex items-center gap-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Banner</span>
                      <input
                        type="color"
                        value={activeLayer.bgColor}
                        onChange={(e) => onUpdateLayer({ bgColor: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Style &amp; Colors
                  </span>
                </div>

                {/* Group 3: Effects & Quick Bound Shortcut */}
                <div className="flex flex-col justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => togglePopover("effects")}
                        className={`h-9 inline-flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                          openPopover === "effects"
                            ? "border-blue-600 bg-blue-50/50 text-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-800"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Effects</span>
                        <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                          {activeLayer.curve ?? 0}° · {Math.round(activeLayer.opacity * 100)}%
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </button>

                      {openPopover === "effects" && (
                        <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 space-y-3">
                          <StepperControl
                            compact
                            label="Arch Curve"
                            value={activeLayer.curve ?? 0}
                            min={-25}
                            max={25}
                            step={1}
                            onChange={(val) => onUpdateLayer({ curve: val })}
                          />
                          <StepperControl
                            compact
                            label="Letter Spacing"
                            value={activeLayer.letterSpacing}
                            min={-2}
                            max={20}
                            step={1}
                            onChange={(val) => onUpdateLayer({ letterSpacing: val })}
                          />
                          <StepperControl
                            compact
                            label="Opacity"
                            value={Math.round(activeLayer.opacity * 100)}
                            min={10}
                            max={100}
                            step={5}
                            unit="%"
                            onChange={(val) => onUpdateLayer({ opacity: val / 100 })}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRibbonTab("bound");
                        setOpenPopover("bound-shape");
                      }}
                      className={`h-9 inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap ${
                        hasBound
                          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <Frame className="w-3.5 h-3.5" />
                      <span>{hasBound ? currentBoundStyle.label : "Add Bound"}</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Effects &amp; Frame
                  </span>
                </div>
              </>
            )}

            {ribbonTab === "bound" && (
              <>
                {/* Group 1: Bound Frame Shape */}
                <div className="flex flex-col justify-between gap-1.5 pr-3 mr-3 border-r border-zinc-200/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => togglePopover("bound-shape")}
                        className={`h-9 inline-flex items-center justify-between gap-2 px-2.5 text-xs font-semibold rounded-lg border min-w-[148px] cursor-pointer whitespace-nowrap ${
                          openPopover === "bound-shape"
                            ? "border-blue-600 bg-blue-50/50 text-zinc-950"
                            : hasBound
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-900"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <Frame className="w-3.5 h-3.5 shrink-0" />
                          <span>{currentBoundStyle.label}</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-75 shrink-0" />
                      </button>

                      {openPopover === "bound-shape" && (
                        <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-zinc-900">
                              Text Bound / ဘောင်စတိုင် (၂၁ မျိုး)
                            </span>
                            {hasBound && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateLayer({ boundStyle: "none" });
                                  setOpenPopover(null);
                                }}
                                className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                              >
                                Remove Bound
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
                            {TEXT_BOUND_STYLES.map((bs) => {
                              const selected = (activeLayer.boundStyle ?? "none") === bs.id;
                              return (
                                <button
                                  key={bs.id}
                                  type="button"
                                  onClick={() => {
                                    onUpdateLayer({ boundStyle: bs.id });
                                    setOpenPopover(null);
                                  }}
                                  className={`min-h-[34px] px-2 py-1 text-[11px] font-medium rounded-lg border cursor-pointer truncate ${
                                    selected
                                      ? "bg-zinc-950 text-white border-zinc-950"
                                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                                  }`}
                                >
                                  {bs.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {hasBound && (
                      <button
                        type="button"
                        onClick={() => onUpdateLayer({ boundStyle: "none" })}
                        title="Remove Bound"
                        className="h-9 inline-flex items-center gap-1 px-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Bound Style (၂၁ မျိုး)
                  </span>
                </div>

                {/* Group 2: Bound Size & Width */}
                <div className="flex flex-col justify-between gap-1.5 pr-3 mr-3 border-r border-zinc-200/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CompactRibbonStepper
                      label="Width"
                      value={activeLayer.boundPadX ?? 36}
                      min={4}
                      max={220}
                      step={4}
                      unit="px"
                      onChange={(val) => applyBoundPatch({ boundPadX: val })}
                    />
                    <CompactRibbonStepper
                      label="Size"
                      value={activeLayer.boundPadY ?? 18}
                      min={2}
                      max={120}
                      step={2}
                      unit="px"
                      onChange={(val) => applyBoundPatch({ boundPadY: val })}
                    />
                    <CompactRibbonStepper
                      label="Line"
                      value={activeLayer.boundThickness ?? 4}
                      min={1}
                      max={16}
                      step={1}
                      unit="px"
                      onChange={(val) => applyBoundPatch({ boundThickness: val })}
                    />
                    <CompactRibbonStepper
                      label="Radius"
                      value={activeLayer.boundRadius ?? 14}
                      min={0}
                      max={60}
                      step={2}
                      unit="px"
                      onChange={(val) => applyBoundPatch({ boundRadius: val })}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Width · Size · Thickness · Radius
                  </span>
                </div>

                {/* Group 3: Bound Colors & Fill % */}
                <div className="flex flex-col justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <label className="h-9 inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Border</span>
                      <input
                        type="color"
                        value={activeLayer.boundColor || defaultBoundColor}
                        onChange={(e) => applyBoundPatch({ boundColor: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                    <label className="h-9 inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-[11px] font-medium text-zinc-700 cursor-pointer whitespace-nowrap">
                      <span>Fill</span>
                      <input
                        type="color"
                        value={activeLayer.boundFillColor || defaultBoundFillColor}
                        onChange={(e) => applyBoundPatch({ boundFillColor: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                    <CompactRibbonStepper
                      label="Fill %"
                      value={Math.round((activeLayer.boundFillOpacity ?? 0) * 100)}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(val) => applyBoundPatch({ boundFillOpacity: val / 100 })}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Border &amp; Fill
                  </span>
                </div>
              </>
            )}

            {ribbonTab === "arrange" && (
              <>
                {/* Group 1: Quick Snap */}
                <div className="flex flex-col justify-between gap-1.5 pr-3 mr-3 border-r border-zinc-200/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/70 h-9">
                      {(
                        [
                          { label: "Top", y: 12 },
                          { label: "Mid", y: 50 },
                          { label: "Bottom", y: 88 },
                        ] as const
                      ).map((v) => (
                        <button
                          key={`rib-y-${v.label}`}
                          type="button"
                          onClick={() => onUpdateLayer({ y: v.y })}
                          className={`h-7 px-2.5 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                            Math.abs(activeLayer.y - v.y) <= 4
                              ? "bg-white text-zinc-950 shadow-2xs"
                              : "text-zinc-600 hover:text-zinc-950"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>

                    <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/70 h-9">
                      {(
                        [
                          { label: "Left", x: 18 },
                          { label: "Center", x: 50 },
                          { label: "Right", x: 82 },
                        ] as const
                      ).map((h) => (
                        <button
                          key={`rib-x-${h.label}`}
                          type="button"
                          onClick={() => onUpdateLayer({ x: h.x })}
                          className={`h-7 px-2.5 text-[11px] font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                            Math.abs(activeLayer.x - h.x) <= 4
                              ? "bg-white text-zinc-950 shadow-2xs"
                              : "text-zinc-600 hover:text-zinc-950"
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Quick Snap (အပေါ်/အောက် · ဘယ်/ညာ)
                  </span>
                </div>

                {/* Group 2: Position X/Y & Rotate */}
                <div className="flex flex-col justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CompactRibbonStepper
                      label="X"
                      value={Math.round(activeLayer.x)}
                      min={0}
                      max={100}
                      step={2}
                      unit="%"
                      onChange={(val) => onUpdateLayer({ x: val })}
                    />
                    <CompactRibbonStepper
                      label="Y"
                      value={Math.round(activeLayer.y)}
                      min={0}
                      max={100}
                      step={2}
                      unit="%"
                      onChange={(val) => onUpdateLayer({ y: val })}
                    />
                    <CompactRibbonStepper
                      label="Rotate"
                      value={activeLayer.rotation}
                      min={-45}
                      max={45}
                      step={2}
                      unit="°"
                      onChange={(val) => onUpdateLayer({ rotation: val })}
                    />
                    {activeLayer.rotation !== 0 && (
                      <button
                        type="button"
                        onClick={() => onUpdateLayer({ rotation: 0 })}
                        title="Reset rotation to 0°"
                        className="h-9 inline-flex items-center gap-1 px-2.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>0°</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 leading-none">
                    Position &amp; Rotation
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
