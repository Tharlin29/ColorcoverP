import { PhotoItem } from "../types/studio";

const DB_NAME = "lumina-studio-db";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";
const SEED_FLAG = "lumina_seeded_v1";

export const STUDIO_ASSETS = {
  photoCreate: "/src/assets/images/card_photo_create_1794574941126.jpg",
  bookBuilder: "/src/assets/images/card_book_builder_1794628315325.jpg",
  textStudio: "/src/assets/images/card_text_studio_1794574941080.jpg",
  baganDawn: "/src/assets/images/sample_bagan_dawn_1794574942633.jpg",
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function seedDefaultPhotosIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG) === "1") return;
  const now = Date.now();
  const seeds: PhotoItem[] = [
    {
      id: "seed-bagan-dawn",
      title: "Bagan Golden Dawn",
      prompt: "Ancient terracotta pagodas emerging through soft golden morning mist",
      dataUrl: STUDIO_ASSETS.baganDawn,
      width: 1200,
      height: 900,
      aspectRatio: "4:3",
      mood: "Golden Hour",
      kind: "curated",
      createdAt: now - 300000,
      updatedAt: now - 300000,
    },
    {
      id: "seed-travertine-arches",
      title: "Travertine Sun Arches",
      prompt: "Architectural stone arches with crisp golden shadows",
      dataUrl: STUDIO_ASSETS.textStudio,
      width: 1200,
      height: 900,
      aspectRatio: "4:3",
      mood: "Minimalist Arch",
      kind: "curated",
      createdAt: now - 900000,
      updatedAt: now - 900000,
    },
  ];

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    const store = tx.objectStore(PHOTO_STORE);
    for (const item of seeds) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  localStorage.setItem(SEED_FLAG, "1");
}

export async function getAllPhotos(): Promise<PhotoItem[]> {
  await seedDefaultPhotosIfNeeded();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readonly");
    const store = tx.objectStore(PHOTO_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result as PhotoItem[]) || [];
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function savePhoto(photo: PhotoItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function readFileAsDataUrl(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth || 1080,
          height: img.naturalHeight || 1080,
        });
      };
      img.onerror = () => reject(new Error("Unable to decode selected image."));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsDataURL(file);
  });
}

export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
