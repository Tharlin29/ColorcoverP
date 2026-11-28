import {
  BookOpen,
  Download,
  FileText,
  LayoutTemplate,
  Pencil,
  Search,
  Trash2,
  Type,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageId, PhotoItem } from "../types/studio";
import { exportSinglePhotoAsPdf } from "../utils/exportTools";
import { triggerBlobDownload, triggerDownload } from "../utils/storage";
import {
  PhotoSelectCheckbox,
  PhotoSelectionBar,
  PhotoSelectToggleButton,
  PhotoUndoToast,
  usePhotoMultiSelect,
} from "./PhotoSelectionBar";

interface PhotoHallModalProps {
  open: boolean;
  photos: PhotoItem[];
  onClose: () => void;
  onEditPhoto: (photo: PhotoItem) => void;
  onDeletePhoto?: (id: string) => Promise<void>;
  onDeletePhotos: (ids: string[]) => Promise<void>;
  onRestorePhotos: (items: PhotoItem[]) => Promise<void>;
  onSendToPage: (page: PageId, photo: PhotoItem) => void;
}

type PhotoFilterKind = "all" | "coloring" | "edited" | "generated" | "text-art";

export function PhotoHallModal({
  open,
  photos,
  onClose,
  onEditPhoto,
  onDeletePhotos,
  onRestorePhotos,
  onSendToPage,
}: PhotoHallModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKind, setFilterKind] = useState<PhotoFilterKind>("all");

  const kindCounts = useMemo(() => {
    const counts: Record<PhotoFilterKind, number> = {
      all: photos.length,
      coloring: 0,
      edited: 0,
      generated: 0,
      "text-art": 0,
    };
    for (const p of photos) {
      if (p.kind === "coloring" || p.isColoringPage) counts.coloring += 1;
      if (p.kind === "edited") counts.edited += 1;
      if (p.kind === "generated" || p.kind === "uploaded" || p.kind === "curated") counts.generated += 1;
      if (p.kind === "text-art") counts["text-art"] += 1;
    }
    return counts;
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return photos.filter((p) => {
      if (filterKind === "coloring" && !(p.kind === "coloring" || p.isColoringPage)) return false;
      if (filterKind === "edited" && p.kind !== "edited") return false;
      if (filterKind === "generated" && !["generated", "uploaded", "curated"].includes(p.kind)) return false;
      if (filterKind === "text-art" && p.kind !== "text-art") return false;
      if (!q) return true;
      const haystack = `${p.title} ${p.prompt || ""} ${p.mood || ""} ${p.kind}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [photos, searchQuery, filterKind]);

  const multiSelect = usePhotoMultiSelect({
    photos,
    filteredPhotos,
    onDeletePhotos,
    onRestorePhotos,
  });

  useEffect(() => {
    if (!open) {
      multiSelect.clearSelection();
      setConfirmDeleteId(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (multiSelect.isSelectionActive) {
        e.preventDefault();
        multiSelect.clearSelection();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, multiSelect.isSelectionActive, multiSelect.clearSelection, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Hall Gallery"
    >
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-t-3xl md:rounded-2xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 tabular-nums">
              Photo Hall ({photos.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Saved creations, 300+ DPI coloring pages, and text-styled artwork
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Photo Hall"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        {photos.length > 0 && (
          <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved pages by title or prompt..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-200/70 rounded-lg">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "coloring", label: "Coloring" },
                    { id: "edited", label: "Edited" },
                    { id: "generated", label: "Generated" },
                    { id: "text-art", label: "Text" },
                  ] as const
                ).map((tab) => {
                  const active = filterKind === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterKind(tab.id)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        active
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-600 hover:text-zinc-950"
                      }`}
                    >
                      {tab.label} ({kindCounts[tab.id]})
                    </button>
                  );
                })}
              </div>

              <PhotoSelectToggleButton
                active={multiSelect.isSelectionActive}
                selectedCount={multiSelect.selectedCount}
                onClick={multiSelect.toggleSelectMode}
              />
            </div>
          </div>
        )}

        {/* Sticky Multi-Select Action Bar */}
        {photos.length > 0 && multiSelect.isSelectionActive && (
          <div className="px-6 py-2.5 bg-white border-b border-zinc-200">
            <PhotoSelectionBar
              visibleCount={filteredPhotos.length}
              selectedCount={multiSelect.selectedCount}
              allVisibleSelected={multiSelect.allVisibleSelected}
              confirmBatchDelete={multiSelect.confirmBatchDelete}
              deleting={multiSelect.deleting}
              onToggleSelectAllVisible={multiSelect.toggleSelectAllVisible}
              onClearSelection={multiSelect.clearSelection}
              onRequestBatchDelete={() => multiSelect.setConfirmBatchDelete(true)}
              onCancelBatchDelete={() => multiSelect.setConfirmBatchDelete(false)}
              onConfirmBatchDelete={multiSelect.handleConfirmBatchDelete}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {photos.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-medium text-zinc-900">Your Photo Hall is empty</p>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Create a photo or coloring book page from a prompt to save it here.
              </p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-medium text-zinc-900">No matching pages found</p>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Try another search term or switch back to All categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterKind("all");
                }}
                className="min-h-[38px] px-4 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo) => {
                const isSelected = multiSelect.selectedIds.has(photo.id);
                return (
                <div
                  key={photo.id}
                  onClick={(e) => {
                    if (multiSelect.isSelectionActive) {
                      multiSelect.togglePhotoSelection(photo.id, e.shiftKey);
                    }
                  }}
                  className={`group border rounded-xl overflow-hidden flex flex-col transition-all ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600 bg-blue-50/20"
                      : "border-zinc-200 bg-white"
                  } ${multiSelect.isSelectionActive ? "cursor-pointer select-none" : ""}`}
                >
                  <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                    <PhotoSelectCheckbox
                      checked={isSelected}
                      title={photo.title}
                      onToggle={(shiftKey) => multiSelect.togglePhotoSelection(photo.id, shiftKey)}
                    />
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-xs text-zinc-500 tabular-nums">
                        <span>
                          {photo.width}×{photo.height}
                        </span>
                        {photo.dpi && (
                          <>
                            <span className="mx-1.5" aria-hidden="true">
                              ·
                            </span>
                            <span>{photo.dpi} DPI</span>
                          </>
                        )}
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span className="capitalize">{photo.kind}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-950 mt-1 truncate">
                        {photo.title}
                      </h3>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("ai-edit", photo);
                        }}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditPhoto(photo);
                        }}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("book", photo);
                        }}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("text", photo);
                        }}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("flyer", photo);
                        }}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        <span>Flyer</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const blob = await exportSinglePhotoAsPdf(photo);
                          triggerBlobDownload(blob, `${photo.title || "gbtk-page"}.pdf`);
                        }}
                        title="Download PDF"
                        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md cursor-pointer ml-auto"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownload(photo.dataUrl, `${photo.title || "gbtk-photo"}.png`)
                        }
                        title="Download PNG"
                        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === photo.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await multiSelect.deleteByIdsWithUndo([photo.id]);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer whitespace-nowrap"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(photo.id)}
                          aria-label="Delete photo"
                          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PhotoUndoToast
        deletedCount={multiSelect.undoItems?.length ?? 0}
        restoring={multiSelect.restoring}
        onUndo={multiSelect.handleUndoDelete}
        onDismiss={multiSelect.dismissUndo}
      />
    </div>
  );
}
