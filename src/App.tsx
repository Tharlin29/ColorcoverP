import { useCallback, useEffect, useState } from "react";
import { PhotoEditModal } from "./components/PhotoEditModal";
import { PhotoHallModal } from "./components/PhotoHallModal";
import { TopBar } from "./components/TopBar";
import { AiImageEditPage } from "./pages/AiImageEditPage";
import { BookBuilderPage } from "./pages/BookBuilderPage";
import { DesignCreatePage } from "./pages/DesignCreatePage";
import { PhotoCreatePage } from "./pages/PhotoCreatePage";
import { SelectErasePage } from "./pages/SelectErasePage";
import { TextStudioPage } from "./pages/TextStudioPage";
import { PageId, PhotoItem } from "./types/studio";
import {
  deletePhoto,
  getAllPhotos,
  savePhoto,
} from "./utils/storage";

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("design");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [photoHallOpen, setPhotoHallOpen] = useState(false);
  const [handoffPhoto, setHandoffPhoto] = useState<PhotoItem | null>(null);

  const refreshLibrary = useCallback(async () => {
    const loadedPhotos = await getAllPhotos();
    setPhotos(loadedPhotos);
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

  const handleDeletePhoto = async (id: string) => {
    await deletePhoto(id);
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
        {activePage === "design" && (
          <DesignCreatePage
            photos={photos}
            onNavigate={navigateTo}
            onSaveNewPhoto={handleSavePhoto}
            onSendToPage={handleSendToPage}
          />
        )}

        {activePage === "erase" && (
          <SelectErasePage
            photos={photos}
            initialPhoto={handoffPhoto}
            onSaveNewPhoto={handleSavePhoto}
            onSendToPage={handleSendToPage}
          />
        )}

        {activePage === "create" && (
          <PhotoCreatePage
            photos={photos}
            onSaveNewPhoto={handleSavePhoto}
            onEditPhoto={(photo) => setEditingPhoto(photo)}
            onDeletePhoto={handleDeletePhoto}
            onSendToPage={handleSendToPage}
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
            onBackHome={() => navigateTo("design")}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-zinc-200/80 py-6 px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Lumina Studio · Coloring Book (300+ DPI), Book Builder & Typography</span>
          <span className="tabular-nums">{photos.length} pages in Photo Hall</span>
        </div>
      </footer>

      <PhotoEditModal
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSaveOverwrite={handleSavePhoto}
        onSaveAsCopy={handleSavePhoto}
      />

      <PhotoHallModal
        open={photoHallOpen}
        photos={photos}
        onClose={() => setPhotoHallOpen(false)}
        onEditPhoto={(photo) => setEditingPhoto(photo)}
        onDeletePhoto={handleDeletePhoto}
        onSendToPage={handleSendToPage}
      />
    </div>
  );
}
