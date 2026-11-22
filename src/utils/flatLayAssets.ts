import flatlayOakLatteImg from "../assets/images/flatlay_oak_latte_1795344823169.jpg";
import flatlayPicnicGrassImg from "../assets/images/flatlay_picnic_grass_1795344827197.jpg";
import flatlayLinenBlindsImg from "../assets/images/flatlay_linen_blinds_1795344827032.jpg";
import flatlayWalnutBotanicalImg from "../assets/images/flatlay_walnut_botanical_1795344826888.jpg";
import flatlayPastelMarkersImg from "../assets/images/flatlay_pastel_markers_1795344827018.jpg";
import { ShowcaseBackdropId } from "../types/studio";

export type FlatLayBackdropId =
  | "flatlay-oak-latte"
  | "flatlay-picnic-grass"
  | "flatlay-linen-blinds"
  | "flatlay-walnut-botanical"
  | "flatlay-pastel-markers";

export const FLAT_LAY_PHOTO_URLS: Record<FlatLayBackdropId, string> = {
  "flatlay-oak-latte": flatlayOakLatteImg,
  "flatlay-picnic-grass": flatlayPicnicGrassImg,
  "flatlay-linen-blinds": flatlayLinenBlindsImg,
  "flatlay-walnut-botanical": flatlayWalnutBotanicalImg,
  "flatlay-pastel-markers": flatlayPastelMarkersImg,
};

export interface FlatLayBookSpreadGeometry {
  cx: number; // normalized 0..1 center X on 2:3 image
  cy: number; // normalized 0..1 center Y on 2:3 image
  spreadW: number; // normalized total 2-page width
  spreadH: number; // normalized book page height
  angleDeg: number; // rotation degrees clockwise
  paperTint: string;
  isSpiral?: boolean;
}

export const FLAT_LAY_BOOK_SPREAD_GEOMETRY: Record<
  FlatLayBackdropId,
  FlatLayBookSpreadGeometry
> = {
  "flatlay-oak-latte": {
    cx: 0.505,
    cy: 0.585,
    spreadW: 0.72,
    spreadH: 0.325,
    angleDeg: 18.5,
    paperTint: "#FCF9F2",
    isSpiral: true,
  },
  "flatlay-picnic-grass": {
    cx: 0.478,
    cy: 0.508,
    spreadW: 0.675,
    spreadH: 0.28,
    angleDeg: 0,
    paperTint: "#FAF6EE",
  },
  "flatlay-linen-blinds": {
    cx: 0.5,
    cy: 0.535,
    spreadW: 0.815,
    spreadH: 0.382,
    angleDeg: 0,
    paperTint: "#FCF9F2",
  },
  "flatlay-walnut-botanical": {
    cx: 0.486,
    cy: 0.525,
    spreadW: 0.74,
    spreadH: 0.328,
    angleDeg: 0,
    paperTint: "#F7F1E3",
  },
  "flatlay-pastel-markers": {
    cx: 0.502,
    cy: 0.638,
    spreadW: 0.855,
    spreadH: 0.298,
    angleDeg: 0,
    paperTint: "#FFFFFF",
  },
};

export function isFlatLayBackdrop(id: ShowcaseBackdropId): id is FlatLayBackdropId {
  return id in FLAT_LAY_PHOTO_URLS;
}
