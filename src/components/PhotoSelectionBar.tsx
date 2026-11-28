import { Check, CheckSquare, RotateCcw, Square, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PhotoItem } from "../types/studio";

interface UsePhotoMultiSelectOptions {
  photos: PhotoItem[];
  filteredPhotos: PhotoItem[];
  onDeletePhotos: (ids: string[]) => Promise<void>;
  onRestorePhotos: (items: PhotoItem[]) => Promise<void>;
}

export function usePhotoMultiSelect({
  photos,
  filteredPhotos,
  onDeletePhotos,
  onRestorePhotos,
}: UsePhotoMultiSelectOptions) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [undoItems, setUndoItems] = useState<PhotoItem[] | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Prune any selected IDs that no longer exist in photos
  useEffect(() => {
    const existing = new Set(photos.map((p) => p.id));
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (existing.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [photos]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const scheduleUndoClear = useCallback(() => {
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = window.setTimeout(() => {
      setUndoItems(null);
      undoTimerRef.current = null;
    }, 6500);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
    setConfirmBatchDelete(false);
    setSelectMode(false);
  }, []);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
        setLastSelectedId(null);
        setConfirmBatchDelete(false);
        return false;
      }
      return true;
    });
  }, []);

  const togglePhotoSelection = useCallback(
    (photoId: string, shiftKey = false) => {
      setConfirmBatchDelete(false);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastSelectedId) {
          const idxA = filteredPhotos.findIndex((p) => p.id === lastSelectedId);
          const idxB = filteredPhotos.findIndex((p) => p.id === photoId);
          if (idxA !== -1 && idxB !== -1) {
            const start = Math.min(idxA, idxB);
            const end = Math.max(idxA, idxB);
            for (let i = start; i <= end; i++) {
              next.add(filteredPhotos[i].id);
            }
            return next;
          }
        }
        if (next.has(photoId)) {
          next.delete(photoId);
        } else {
          next.add(photoId);
        }
        return next;
      });
      setLastSelectedId(photoId);
    },
    [filteredPhotos, lastSelectedId]
  );

  const visibleSelectedCount = useMemo(() => {
    let count = 0;
    for (const p of filteredPhotos) {
      if (selectedIds.has(p.id)) count += 1;
    }
    return count;
  }, [filteredPhotos, selectedIds]);

  const allVisibleSelected =
    filteredPhotos.length > 0 && visibleSelectedCount === filteredPhotos.length;

  const toggleSelectAllVisible = useCallback(() => {
    setConfirmBatchDelete(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const p of filteredPhotos) {
          next.delete(p.id);
        }
      } else {
        for (const p of filteredPhotos) {
          next.add(p.id);
        }
      }
      return next;
    });
  }, [allVisibleSelected, filteredPhotos]);

  const deleteByIdsWithUndo = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0 || deleting) return;
      const idSet = new Set(ids);
      const snapshot = photos.filter((p) => idSet.has(p.id));
      if (snapshot.length === 0) return;

      setDeleting(true);
      try {
        await onDeletePhotos(ids);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) next.delete(id);
          return next;
        });
        setConfirmBatchDelete(false);
        setUndoItems(snapshot);
        scheduleUndoClear();
      } finally {
        setDeleting(false);
      }
    },
    [deleting, onDeletePhotos, photos, scheduleUndoClear]
  );

  const handleConfirmBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await deleteByIdsWithUndo(ids);
    setSelectMode(false);
    setLastSelectedId(null);
  }, [deleteByIdsWithUndo, selectedIds]);

  const handleUndoDelete = useCallback(async () => {
    if (!undoItems || undoItems.length === 0 || restoring) return;
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setRestoring(true);
    try {
      await onRestorePhotos(undoItems);
      setUndoItems(null);
    } finally {
      setRestoring(false);
    }
  }, [onRestorePhotos, restoring, undoItems]);

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoItems(null);
  }, []);

  const isSelectionActive = selectMode || selectedIds.size > 0;

  return {
    selectMode,
    selectedIds,
    selectedCount: selectedIds.size,
    visibleSelectedCount,
    allVisibleSelected,
    isSelectionActive,
    confirmBatchDelete,
    deleting,
    restoring,
    undoItems,
    setConfirmBatchDelete,
    toggleSelectMode,
    togglePhotoSelection,
    toggleSelectAllVisible,
    clearSelection,
    deleteByIdsWithUndo,
    handleConfirmBatchDelete,
    handleUndoDelete,
    dismissUndo,
  };
}

interface PhotoSelectToggleButtonProps {
  active: boolean;
  selectedCount: number;
  onClick: () => void;
}

export function PhotoSelectToggleButton({
  active,
  selectedCount,
  onClick,
}: PhotoSelectToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
        active
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400"
      }`}
    >
      {active ? (
        <CheckSquare className="w-3.5 h-3.5" />
      ) : (
        <Square className="w-3.5 h-3.5" />
      )}
      <span>
        {active
          ? selectedCount > 0
            ? `Selecting (${selectedCount})`
            : "Done Selecting"
          : "Select"}
      </span>
    </button>
  );
}

interface PhotoSelectionBarProps {
  visibleCount: number;
  selectedCount: number;
  allVisibleSelected: boolean;
  confirmBatchDelete: boolean;
  deleting: boolean;
  onToggleSelectAllVisible: () => void;
  onClearSelection: () => void;
  onRequestBatchDelete: () => void;
  onCancelBatchDelete: () => void;
  onConfirmBatchDelete: () => void;
  className?: string;
}

export function PhotoSelectionBar({
  visibleCount,
  selectedCount,
  allVisibleSelected,
  confirmBatchDelete,
  deleting,
  onToggleSelectAllVisible,
  onClearSelection,
  onRequestBatchDelete,
  onCancelBatchDelete,
  onConfirmBatchDelete,
  className = "",
}: PhotoSelectionBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-blue-50/90 border border-blue-200 rounded-xl ${className}`}
      role="region"
      aria-label="Multi-select photo actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-zinc-950 tabular-nums whitespace-nowrap">
          {selectedCount === 0
            ? "Tap photos to select · ပုံများကို ရွေးချယ်ပါ"
            : `${selectedCount} selected`}
        </span>

        {visibleCount > 0 && (
          <button
            type="button"
            onClick={onToggleSelectAllVisible}
            className="min-h-[34px] px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:border-blue-400 rounded-lg cursor-pointer whitespace-nowrap tabular-nums"
          >
            {allVisibleSelected
              ? `Deselect All (${visibleCount})`
              : `Select All (${visibleCount})`}
          </button>
        )}

        <button
          type="button"
          onClick={onClearSelection}
          className="min-h-[34px] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white/80 hover:bg-white border border-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
        >
          {selectedCount > 0 ? "Clear" : "Cancel"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {confirmBatchDelete && selectedCount > 0 ? (
          <>
            <span className="text-xs font-semibold text-red-700 tabular-nums whitespace-nowrap">
              Delete {selectedCount} {selectedCount === 1 ? "photo" : "photos"}?
            </span>
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirmBatchDelete}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Deleting..." : "Confirm Delete"}</span>
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onCancelBatchDelete}
              className="min-h-[36px] px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={selectedCount === 0 || deleting}
            onClick={onRequestBatchDelete}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 disabled:text-zinc-500 rounded-lg cursor-pointer disabled:cursor-not-allowed whitespace-nowrap tabular-nums transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({selectedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface PhotoSelectCheckboxProps {
  checked: boolean;
  title: string;
  onToggle: (shiftKey: boolean) => void;
}

export function PhotoSelectCheckbox({
  checked,
  title,
  onToggle,
}: PhotoSelectCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Deselect ${title}` : `Select ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e.shiftKey);
      }}
      className="absolute top-2 left-2 z-10 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
    >
      <span
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${
          checked
            ? "bg-blue-600 border-blue-600 text-white scale-105"
            : "bg-white/95 border-zinc-400 text-transparent hover:border-blue-600"
        }`}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </span>
    </button>
  );
}

interface PhotoUndoToastProps {
  deletedCount: number;
  restoring: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function PhotoUndoToast({
  deletedCount,
  restoring,
  onUndo,
  onDismiss,
}: PhotoUndoToastProps) {
  if (deletedCount <= 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-950 text-white shadow-2xl border border-zinc-800 max-w-[92vw]"
    >
      <span className="text-xs font-medium tabular-nums whitespace-nowrap">
        Deleted {deletedCount} {deletedCount === 1 ? "photo" : "photos"}
      </span>
      <button
        type="button"
        disabled={restoring}
        onClick={onUndo}
        className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-zinc-950 bg-amber-300 hover:bg-amber-200 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{restoring ? "Restoring..." : "Undo"}</span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
