import { BookOpen, Download, Eraser, FileText, Pencil, Trash2, Type, X } from "lucide-react";
import { useState } from "react";
import { PageId, PhotoItem } from "../types/studio";
import { exportSinglePhotoAsPdf } from "../utils/exportTools";
import { triggerBlobDownload, triggerDownload } from "../utils/storage";

interface PhotoHallModalProps {
  open: boolean;
  photos: PhotoItem[];
  onClose: () => void;
  onEditPhoto: (photo: PhotoItem) => void;
  onDeletePhoto: (id: string) => Promise<void>;
  onSendToPage: (page: PageId, photo: PhotoItem) => void;
}

export function PhotoHallModal({
  open,
  photos,
  onClose,
  onEditPhoto,
  onDeletePhoto,
  onSendToPage,
}: PhotoHallModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
            <h2 className="text-lg font-semibold text-zinc-950">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {photos.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-medium text-zinc-900">Your Photo Hall is empty</p>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Create a photo or coloring book page from a prompt to save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group border border-zinc-200 rounded-xl overflow-hidden bg-white flex flex-col"
                >
                  <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
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

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditPhoto(photo);
                        }}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("erase", photo);
                        }}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Erase</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSendToPage("book", photo);
                        }}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
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
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const blob = await exportSinglePhotoAsPdf(photo);
                          triggerBlobDownload(blob, `${photo.title || "lumina-page"}.pdf`);
                        }}
                        title="Download PDF"
                        className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md cursor-pointer ml-auto"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownload(photo.dataUrl, `${photo.title || "lumina-photo"}.png`)
                        }
                        title="Download PNG"
                        className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === photo.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeletePhoto(photo.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer whitespace-nowrap"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(photo.id)}
                          aria-label="Delete photo"
                          className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
