import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { StudioErrorBoundary } from "./components/StudioErrorBoundary";
import { TopBar } from "./components/TopBar";
import { WorkspaceSkeleton } from "./components/WorkspaceSkeleton";
import { PageId, PhotoItem } from "./types/studio";
import {
  deletePhoto,
  deletePhotos,
  getAllPhotos,
  savePhoto,
  savePhotos,
} from "./utils/storage";

const DesignCreatePage = lazy(() =>
  import("./pages/DesignCreatePage").then((m) => ({ default: m.DesignCreatePage }))
);
const BackPageFlyerPage = lazy(() =>
  import("./pages/BackPageFlyerPage").then((m) => ({ default: m.BackPageFlyerPage }))
);
const BookBuilderPage = lazy(() =>
  import("./pages/BookBuilderPage").then((m) => ({ default: m.BookBuilderPage }))
);
const TextStudioPage = lazy(() =>
  import("./pages/TextStudioPage").then((m) => ({ default: m.TextStudioPage }))
);
const AiImageEditPage = lazy(() =>
  import("./pages/AiImageEditPage").then((m) => ({ default: m.AiImageEditPage }))
);

const PhotoEditModal = lazy(() =>
  import("./components/PhotoEditModal").then((m) => ({ default: m.PhotoEditModal }))
);
const PhotoHallModal = lazy(() =>
  import("./components/PhotoHallModal").then((m) => ({ default: m.PhotoHallModal }))
);

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("design");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [photoHallOpen, setPhotoHallOpen] = useState(false);
  const [handoffPhoto, setHandoffPhoto] = useState<PhotoItem | null>(null);

  const refreshLibrary = useCallback(async () => {
    try {
      const loadedPhotos = await getAllPhotos();
      setPhotos(loadedPhotos);
    } catch {
      // Fault-tolerant fallback: keep current in-memory library state
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSavePhoto = async (photo: PhotoItem) => {
    await savePhoto(photo);
    await refreshLibrary();
  };

  const handleSavePhotos = async (items: PhotoItem[]) => {
    await savePhotos(items);
    await refreshLibrary();
  };

  const handleDeletePhoto = async (id: string) => {
    await deletePhoto(id);
    await refreshLibrary();
  };

  const handleDeletePhotos = async (ids: string[]) => {
    await deletePhotos(ids);
    await refreshLibrary();
  };

  const handleRestorePhotos = async (items: PhotoItem[]) => {
    await savePhotos(items);
    await refreshLibrary();
  };

  const handleSendToPage = (page: PageId, photo: PhotoItem) => {
    setHandoffPhoto(photo);
    navigateTo(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111113] print:hidden">
      <TopBar
        activePage={activePage}
        onNavigate={(page) => {
          setHandoffPhoto(null);
          navigateTo(page);
        }}
        photoCount={photos.length}
        onOpenPhotoHall={() => setPhotoHallOpen(true)}
      />

      <main className="flex-1">
        <StudioErrorBoundary
          resetKey={activePage}
          onResetHome={() => {
            setHandoffPhoto(null);
            navigateTo("design");
          }}
        >
          <Suspense fallback={<WorkspaceSkeleton />}>
            {activePage === "design" && (
              <DesignCreatePage
                photos={photos}
                initialPhoto={handoffPhoto}
                onNavigate={navigateTo}
                onSaveNewPhoto={handleSavePhoto}
                onSendToPage={handleSendToPage}
              />
            )}

            {activePage === "flyer" && (
              <BackPageFlyerPage
                photos={photos}
                initialPhoto={handoffPhoto}
                onSaveNewPhoto={handleSavePhoto}
                onBackHome={() => navigateTo("design")}
              />
            )}

            {activePage === "book" && (
              <BookBuilderPage
                photos={photos}
                initialPhoto={handoffPhoto}
                onSaveNewPhoto={handleSavePhoto}
                onBackHome={() => navigateTo("design")}
              />
            )}

            {activePage === "text" && (
              <TextStudioPage
                photos={photos}
                initialPhoto={handoffPhoto}
                onSaveToPhotoHall={handleSavePhoto}
                onBackHome={() => navigateTo("design")}
              />
            )}

            {activePage === "ai-edit" && (
              <AiImageEditPage
                photos={photos}
                initialPhoto={handoffPhoto}
                onSaveNewPhoto={handleSavePhoto}
                onSavePhotos={handleSavePhotos}
                onSendToPage={handleSendToPage}
                onBackHome={() => navigateTo("design")}
              />
            )}
          </Suspense>
        </StudioErrorBoundary>
      </main>

      <footer className="hidden md:block border-t border-zinc-200/80 py-6 px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>GBTK STUDIO · Printable Page &amp; Coloring Books (300+ DPI)</span>
          <span className="tabular-nums">{photos.length} pages in Photo Hall</span>
        </div>
      </footer>

      {editingPhoto && (
        <StudioErrorBoundary
          resetKey={editingPhoto.id}
          onResetHome={() => setEditingPhoto(null)}
        >
          <Suspense fallback={null}>
            <PhotoEditModal
              photo={editingPhoto}
              onClose={() => setEditingPhoto(null)}
              onSaveOverwrite={handleSavePhoto}
              onSaveAsCopy={handleSavePhoto}
            />
          </Suspense>
        </StudioErrorBoundary>
      )}

      {photoHallOpen && (
        <StudioErrorBoundary
          resetKey="photo-hall"
          onResetHome={() => setPhotoHallOpen(false)}
        >
          <Suspense fallback={null}>
            <PhotoHallModal
              open={photoHallOpen}
              photos={photos}
              onClose={() => setPhotoHallOpen(false)}
              onEditPhoto={(photo) => setEditingPhoto(photo)}
              onDeletePhoto={handleDeletePhoto}
              onDeletePhotos={handleDeletePhotos}
              onRestorePhotos={handleRestorePhotos}
              onSendToPage={handleSendToPage}
            />
          </Suspense>
        </StudioErrorBoundary>
      )}
    </div>
  );
}
