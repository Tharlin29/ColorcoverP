import cardPhotoCreateWebp from "../assets/images/webp/card_photo_create_1794574941126.webp";
import cardBookBuilderWebp from "../assets/images/webp/card_book_builder_1794628315325.webp";
import cardTextStudioWebp from "../assets/images/webp/card_text_studio_1794574941080.webp";
import sampleBaganDawnWebp from "../assets/images/webp/sample_bagan_dawn_1794574942633.webp";
import { PhotoItem } from "../types/studio";

const DB_NAME = "lumina-studio-db";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";
const SEED_FLAG = "lumina_seeded_v1";

export const STUDIO_ASSETS = {
  photoCreate: cardPhotoCreateWebp,
  bookBuilder: cardBookBuilderWebp,
  textStudio: cardTextStudioWebp,
  baganDawn: sampleBaganDawnWebp,
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });
  return dbPromise;
}

function buildDefaultSeeds(): PhotoItem[] {
  const now = Date.now();
  return [
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
}

async function seedDefaultPhotosIfNeeded(): Promise<void> {
  try {
    if (localStorage.getItem(SEED_FLAG) === "1") return;
  } catch {
    return;
  }
  const seeds = buildDefaultSeeds();
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
  try {
    localStorage.setItem(SEED_FLAG, "1");
  } catch {
    // ignore storage quota / private mode
  }
}

export async function getAllPhotos(): Promise<PhotoItem[]> {
  try {
    await seedDefaultPhotosIfNeeded();
    const db = await openDB();
    const items = await new Promise<PhotoItem[]>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readonly");
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as PhotoItem[]) || [];
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });

    // Repair any legacy unbundled /src/assets/images/ seed URLs stored in older sessions
    let needsRepair = false;
    const repaired = items.map((item) => {
      if (item.id === "seed-bagan-dawn" && item.dataUrl.startsWith("/src/assets/")) {
        needsRepair = true;
        return { ...item, dataUrl: STUDIO_ASSETS.baganDawn };
      }
      if (item.id === "seed-travertine-arches" && item.dataUrl.startsWith("/src/assets/")) {
        needsRepair = true;
        return { ...item, dataUrl: STUDIO_ASSETS.textStudio };
      }
      return item;
    });

    if (needsRepair) {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_STORE);
      for (const item of repaired) {
        if (item.id === "seed-bagan-dawn" || item.id === "seed-travertine-arches") {
          store.put(item);
        }
      }
    }

    return repaired;
  } catch {
    return buildDefaultSeeds();
  }
}

export async function savePhoto(photo: PhotoItem): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).put(photo);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Gracefully degrade if IndexedDB is unavailable in restricted contexts
  }
}

export async function savePhotos(items: PhotoItem[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_STORE);
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Gracefully degrade if IndexedDB is unavailable
  }
}

export async function deletePhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Gracefully degrade if IndexedDB is unavailable
  }
}

export async function deletePhotos(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_STORE);
      for (const id of ids) {
        store.delete(id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Gracefully degrade if IndexedDB is unavailable
  }
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
