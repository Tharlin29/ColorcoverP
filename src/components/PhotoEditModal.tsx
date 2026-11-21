import { Check, FlipHorizontal2, Loader2, RotateCcw, RotateCw, ShieldCheck, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AiEditColoringConfig,
  AiEditPlan,
  BookPageSize,
  ColoringColorMode,
  PhotoAdjustments,
  PhotoItem,
  PrintDpi,
} from "../types/studio";
import {
  buildFilterString,
  DEFAULT_ADJUSTMENTS,
  prepareImageForAiAnalysis,
  renderAiEditedPhoto,
  renderEditedPhoto,
} from "../utils/imageEditor";
import { StepperControl } from "./StepperControl";

interface PhotoEditModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onSaveOverwrite: (updated: PhotoItem) => Promise<void>;
  onSaveAsCopy: (copy: PhotoItem) => Promise<void>;
}

const FILTER_PRESETS: { id: PhotoAdjustments["filter"]; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "warm-film", label: "Warm Film" },
  { id: "vivid", label: "Vivid" },
  { id: "sunset", label: "Sunset" },
  { id: "mono", label: "Monochrome" },
  { id: "noir", label: "Noir" },
];

export function PhotoEditModal({
  photo,
  onClose,
  onSaveOverwrite,
  onSaveAsCopy,
}: PhotoEditModalProps) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [adj, setAdj] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [editTab, setEditTab] = useState<"manual" | "ai">("manual");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiPlan, setAiPlan] = useState<AiEditPlan | null>(null);
  const [aiIntensity, setAiIntensity] = useState(100);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [aiPreviewDims, setAiPreviewDims] = useState<{ width: number; height: number } | null>(null);
  const [aiColoringEnabled, setAiColoringEnabled] = useState(true);
  const [aiPageSize, setAiPageSize] = useState<BookPageSize>("us-letter");
  const [aiDpi, setAiDpi] = useState<PrintDpi>(300);
  const [aiColorMode, setAiColorMode] = useState<ColoringColorMode>("bw");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setPrompt(photo.prompt);
      setAdj(DEFAULT_ADJUSTMENTS);
      setEditTab("manual");
      setAiInstruction("");
      setAiPlan(null);
      setAiIntensity(100);
      setAiPreviewUrl(null);
      setAiPreviewDims(null);
      setAiColoringEnabled(true);
      setAiPageSize(photo.pageSize || "us-letter");
      setAiDpi(photo.dpi === 350 ? 350 : 300);
      setAiColorMode(photo.colorMode || "bw");
      setAiError(null);
      setAiNotice(null);
    }
  }, [photo]);

  useEffect(() => {
    if (!photo || !aiPlan) return;
    let active = true;
    const cfg: AiEditColoringConfig = {
      enabled: aiColoringEnabled,
      pageSize: aiPageSize,
      dpi: aiDpi,
      colorMode: aiColorMode,
    };
    renderAiEditedPhoto(photo.dataUrl, aiPlan, aiIntensity / 100, cfg)
      .then((res) => {
        if (active) {
          setAiPreviewUrl(res.dataUrl);
          setAiPreviewDims({ width: res.width, height: res.height });
        }
      })
      .catch(() => {
        // Keep current preview
      });
    return () => {
      active = false;
    };
  }, [photo, aiPlan, aiIntensity, aiColoringEnabled, aiPageSize, aiDpi, aiColorMode]);

  if (!photo) return null;

  const handleApplyAiModalEdit = async () => {
    if (!aiInstruction.trim()) {
      setAiError("Please describe the edit to apply.");
      return;
    }
    setAiProcessing(true);
    setAiError(null);
    setAiNotice(null);
    try {
      const cfg: AiEditColoringConfig = {
        enabled: aiColoringEnabled,
        pageSize: aiPageSize,
        dpi: aiDpi,
        colorMode: aiColorMode,
      };
      const analysisImage = await prepareImageForAiAnalysis(photo.dataUrl, 1280);
      const res = await fetch("/api/photo/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: analysisImage,
          instruction: aiInstruction.trim(),
          coloringConfig: cfg,
        }),
      });
      const data = (await res.json()) as {
        plan?: AiEditPlan;
        notice?: string;
        error?: string;
      };
      if (!res.ok || !data.plan) {
        throw new Error(data.error || "Unable to apply AI edit.");
      }
      if (data.notice) setAiNotice(data.notice);
      setAiIntensity(100);
      setAiPlan(data.plan);
      const rendered = await renderAiEditedPhoto(photo.dataUrl, data.plan, 1, cfg);
      setAiPreviewUrl(rendered.dataUrl);
      setAiPreviewDims({ width: rendered.width, height: rendered.height });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI edit failed.");
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSave = async (asCopy: boolean) => {
    setSaving(true);
    try {
      const isDefaultManual =
        adj.brightness === DEFAULT_ADJUSTMENTS.brightness &&
        adj.contrast === DEFAULT_ADJUSTMENTS.contrast &&
        adj.saturation === DEFAULT_ADJUSTMENTS.saturation &&
        adj.warmth === DEFAULT_ADJUSTMENTS.warmth &&
        adj.vignette === DEFAULT_ADJUSTMENTS.vignette &&
        adj.filter === DEFAULT_ADJUSTMENTS.filter &&
        adj.rotation === DEFAULT_ADJUSTMENTS.rotation &&
        adj.flipH === DEFAULT_ADJUSTMENTS.flipH;

      const rendered =
        aiPreviewUrl && aiPreviewDims && isDefaultManual
          ? { dataUrl: aiPreviewUrl, width: aiPreviewDims.width, height: aiPreviewDims.height }
          : await renderEditedPhoto(aiPreviewUrl || photo.dataUrl, adj);

      const now = Date.now();
      const updatedPrompt =
        aiPlan && aiInstruction.trim()
          ? `${prompt.trim() || photo.prompt} · AI Edit: ${aiInstruction.trim()}`
          : prompt.trim() || photo.prompt;

      const isColoringSave = Boolean(aiPlan && aiColoringEnabled);

      if (asCopy) {
        await onSaveAsCopy({
          id: `photo-${now}-${Math.random().toString(36).slice(2, 7)}`,
          title: `${title.trim() || photo.title} (Edited)`,
          prompt: updatedPrompt,
          dataUrl: rendered.dataUrl,
          width: rendered.width,
          height: rendered.height,
          aspectRatio: isColoringSave
            ? aiPageSize === "a4"
              ? "A4"
              : "US Letter"
            : photo.aspectRatio,
          mood: isColoringSave
            ? aiColorMode === "bw"
              ? "B&W Line Art"
              : "Grayscale Line Art"
            : photo.mood,
          dpi: isColoringSave ? aiDpi : photo.dpi,
          pageSize: isColoringSave ? aiPageSize : photo.pageSize,
          colorMode: isColoringSave ? aiColorMode : photo.colorMode,
          isColoringPage: isColoringSave ? true : photo.isColoringPage,
          kind: isColoringSave ? "coloring" : "edited",
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await onSaveOverwrite({
          ...photo,
          title: title.trim() || photo.title,
          prompt: updatedPrompt,
          dataUrl: rendered.dataUrl,
          width: rendered.width,
          height: rendered.height,
          aspectRatio: isColoringSave
            ? aiPageSize === "a4"
              ? "A4"
              : "US Letter"
            : photo.aspectRatio,
          dpi: isColoringSave ? aiDpi : photo.dpi,
          pageSize: isColoringSave ? aiPageSize : photo.pageSize,
          colorMode: isColoringSave ? aiColorMode : photo.colorMode,
          isColoringPage: isColoringSave ? true : photo.isColoringPage,
          kind: isColoringSave ? "coloring" : "edited",
          updatedAt: now,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Photo"
    >
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-t-3xl md:rounded-2xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Edit Photo</h2>
            <p className="text-xs text-zinc-500">Adjust tone, filters, orientation, and details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Preview Canvas */}
          <div className="lg:col-span-7 bg-[#141416] flex items-center justify-center p-6 min-h-[280px] relative overflow-hidden">
            <div className="relative max-h-[420px] flex items-center justify-center">
              <img
                src={aiPreviewUrl || photo.dataUrl}
                alt={title || photo.title}
                referrerPolicy="no-referrer"
                className="max-h-[400px] w-auto object-contain rounded-lg transition-transform duration-200"
                style={{
                  filter: buildFilterString(adj),
                  transform: `rotate(${adj.rotation}deg) scaleX(${adj.flipH ? -1 : 1})`,
                }}
              />
              {adj.vignette > 0 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                      (adj.vignette / 100) * 0.75
                    }) 100%)`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 p-6 space-y-5 overflow-y-auto">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setEditTab("manual")}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  editTab === "manual"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Manual Tone
              </button>
              <button
                type="button"
                onClick={() => setEditTab("ai")}
                className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  editTab === "ai"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Precision Edit</span>
              </button>
            </div>

            {editTab === "ai" ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Applies targeted minor changes while preserving faces, background, and composition.
                  </p>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-zinc-700">
                    Modification Instruction
                  </span>
                  <textarea
                    rows={3}
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    placeholder="e.g. Change Noah's shirt to traditional old Israel robe & sash, or add a small detail in line art..."
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </label>

                <div className="space-y-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-800">Coloring Book Output</span>
                    <button
                      type="button"
                      onClick={() => setAiColoringEnabled((v) => !v)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                        aiColoringEnabled
                          ? "bg-zinc-950 text-white"
                          : "bg-white text-zinc-600 border border-zinc-200"
                      }`}
                    >
                      {aiColoringEnabled ? "300+ DPI ON" : "Photo Mode"}
                    </button>
                  </div>
                  {aiColoringEnabled && (
                    <div className="grid grid-cols-3 gap-1.5">
                      <select
                        value={aiPageSize}
                        onChange={(e) => setAiPageSize(e.target.value as BookPageSize)}
                        aria-label="Page size"
                        className="px-2 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800"
                      >
                        <option value="us-letter">US Letter</option>
                        <option value="a4">A4 Size</option>
                      </select>
                      <select
                        value={aiDpi}
                        onChange={(e) => setAiDpi(Number(e.target.value) as PrintDpi)}
                        aria-label="Print DPI"
                        className="px-2 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800"
                      >
                        <option value={300}>300 DPI</option>
                        <option value={350}>350 DPI</option>
                      </select>
                      <select
                        value={aiColorMode}
                        onChange={(e) => setAiColorMode(e.target.value as ColoringColorMode)}
                        aria-label="Color mode"
                        className="px-2 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800"
                      >
                        <option value="bw">Black & White</option>
                        <option value="grayscale">Grayscale</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={aiProcessing || !aiInstruction.trim()}
                    onClick={handleApplyAiModalEdit}
                    className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                  >
                    {aiProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Apply AI Edit</span>
                      </>
                    )}
                  </button>
                  {aiPlan && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiPlan(null);
                        setAiPreviewUrl(null);
                      }}
                      className="min-h-[42px] px-3 py-2 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {aiError && (
                  <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {aiError}
                  </p>
                )}

                {aiNotice && (
                  <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                    {aiNotice}
                  </p>
                )}

                {aiPlan && (
                  <div className="space-y-3 pt-2 border-t border-zinc-100">
                    <StepperControl
                      label="Edit Blend Strength"
                      value={aiIntensity}
                      min={10}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={setAiIntensity}
                    />
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                      <p className="text-[11px] font-semibold text-zinc-800">
                        Applied: {aiPlan.editSummary}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {aiPlan.preservedIntegrityNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-700">Title</span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-700">Caption / Prompt Note</span>
                    <textarea
                      rows={2}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </label>
                </div>

                {/* Filter Presets */}
                <div>
                  <span className="text-xs font-medium text-zinc-700 block mb-2">Color Grade</span>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAdj((prev) => ({ ...prev, filter: preset.id }))}
                        className={`min-h-[40px] px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          adj.filter === preset.id
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* + / - Stepper Adjustments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { key: "brightness", label: "Brightness", min: 60, max: 140, step: 2 },
                      { key: "contrast", label: "Contrast", min: 60, max: 150, step: 2 },
                      { key: "saturation", label: "Saturation", min: 0, max: 180, step: 5 },
                      { key: "warmth", label: "Warmth", min: -40, max: 40, step: 2 },
                      { key: "vignette", label: "Vignette", min: 0, max: 100, step: 5 },
                    ] as const
                  ).map((item) => (
                    <StepperControl
                      key={item.key}
                      label={item.label}
                      value={adj[item.key]}
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      onChange={(next) => setAdj((prev) => ({ ...prev, [item.key]: next }))}
                    />
                  ))}
                </div>

                {/* Transform */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAdj((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
                    }
                    className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Rotate 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdj((prev) => ({ ...prev, flipH: !prev.flipH }))}
                    className={`flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                      adj.flipH
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <FlipHorizontal2 className="w-4 h-4" />
                    <span>Flip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdj(DEFAULT_ADJUSTMENTS)}
                    className="min-h-[42px] px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-950 cursor-pointer whitespace-nowrap"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-zinc-900 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Save as New Copy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
