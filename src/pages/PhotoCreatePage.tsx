import { PhotoItem } from "../types/studio";
import { BackPageFlyerPage } from "./BackPageFlyerPage";

interface LegacyPhotoCreateProps {
  photos: PhotoItem[];
  onSaveNewPhoto: (photo: PhotoItem) => Promise<void>;
  onBackHome: () => void;
}

/**
 * Compatibility forwarder for stale browser sessions that still hold a reference
 * to the removed PhotoCreatePage module before reloading. Always renders BackPageFlyerPage.
 */
export function PhotoCreatePage({
  photos,
  onSaveNewPhoto,
  onBackHome,
}: LegacyPhotoCreateProps) {
  return (
    <BackPageFlyerPage
      photos={photos}
      onSaveNewPhoto={onSaveNewPhoto}
      onBackHome={onBackHome}
    />
  );
}
