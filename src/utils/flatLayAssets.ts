import flatlayOakLatteImg from "../assets/images/flatlay_oak_latte_1795344823169.jpg";
import flatlayPicnicGrassImg from "../assets/images/flatlay_picnic_grass_1795344827197.jpg";
import flatlayLinenBlindsImg from "../assets/images/flatlay_linen_blinds_1795344827032.jpg";
import flatlayWalnutBotanicalImg from "../assets/images/flatlay_walnut_botanical_1795344826888.jpg";
import flatlayPastelMarkersImg from "../assets/images/flatlay_pastel_markers_1795344827018.jpg";
import mockupStandingKidsImg from "../assets/images/mockup_standing_kids_1795383912435.jpg";
import mockupWorkbookPastelImg from "../assets/images/mockup_workbook_pastel_1795383912221.jpg";
import mockupCozyBundleImg from "../assets/images/mockup_cozy_bundle_1795383911427.jpg";
import mockupFrontBackImg from "../assets/images/mockup_front_back_1795383912353.jpg";
import mockupJungleCollageImg from "../assets/images/mockup_jungle_collage_1795383912814.jpg";
import mockupGiftboxKidsImg from "../assets/images/mockup_giftbox_kids_1795441155034.jpg";
import mockupSpiralFlipImg from "../assets/images/mockup_spiral_flip_1795441155445.jpg";
import mockupPlushNumbersImg from "../assets/images/mockup_plush_numbers_1795441155204.jpg";
import mockupLookInsideImg from "../assets/images/mockup_look_inside_1795441153215.jpg";
import mockupToddlerTraceImg from "../assets/images/mockup_toddler_trace_1795441155967.jpg";
import mockupAnimalFactsImg from "../assets/images/mockup_animal_facts_1795441154753.jpg";
import mockupCreamInfographicImg from "../assets/images/mockup_cream_infographic_1795441163107.jpg";
import mockupAlphabetHandsImg from "../assets/images/mockup_alphabet_hands_1795441155863.jpg";
import mockupCollageSecretImg from "../assets/images/mockup_collage_secret_1795441155348.jpg";
import { ShowcaseBackdropId } from "../types/studio";

export type FlatLayBackdropId =
  | "flatlay-oak-latte"
  | "flatlay-picnic-grass"
  | "flatlay-linen-blinds"
  | "flatlay-walnut-botanical"
  | "flatlay-pastel-markers";

export type BookMockupBackdropId =
  | "mockup-standing-kids"
  | "mockup-workbook-pastel"
  | "mockup-cozy-bundle"
  | "mockup-front-back"
  | "mockup-jungle-collage"
  | "mockup-giftbox-kids"
  | "mockup-spiral-flip"
  | "mockup-plush-numbers"
  | "mockup-look-inside"
  | "mockup-toddler-trace"
  | "mockup-animal-facts"
  | "mockup-cream-infographic"
  | "mockup-alphabet-hands"
  | "mockup-collage-secret";

export type PhotoShowcaseBackdropId = FlatLayBackdropId | BookMockupBackdropId;

export const FLAT_LAY_PHOTO_URLS: Record<FlatLayBackdropId, string> = {
  "flatlay-oak-latte": flatlayOakLatteImg,
  "flatlay-picnic-grass": flatlayPicnicGrassImg,
  "flatlay-linen-blinds": flatlayLinenBlindsImg,
  "flatlay-walnut-botanical": flatlayWalnutBotanicalImg,
  "flatlay-pastel-markers": flatlayPastelMarkersImg,
};

export const BOOK_MOCKUP_PHOTO_URLS: Record<BookMockupBackdropId, string> = {
  "mockup-standing-kids": mockupStandingKidsImg,
  "mockup-workbook-pastel": mockupWorkbookPastelImg,
  "mockup-cozy-bundle": mockupCozyBundleImg,
  "mockup-front-back": mockupFrontBackImg,
  "mockup-jungle-collage": mockupJungleCollageImg,
  "mockup-giftbox-kids": mockupGiftboxKidsImg,
  "mockup-spiral-flip": mockupSpiralFlipImg,
  "mockup-plush-numbers": mockupPlushNumbersImg,
  "mockup-look-inside": mockupLookInsideImg,
  "mockup-toddler-trace": mockupToddlerTraceImg,
  "mockup-animal-facts": mockupAnimalFactsImg,
  "mockup-cream-infographic": mockupCreamInfographicImg,
  "mockup-alphabet-hands": mockupAlphabetHandsImg,
  "mockup-collage-secret": mockupCollageSecretImg,
};

export const ALL_PHOTO_BACKDROP_URLS: Record<PhotoShowcaseBackdropId, string> = {
  ...FLAT_LAY_PHOTO_URLS,
  ...BOOK_MOCKUP_PHOTO_URLS,
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

export interface MockupSlotGeometry {
  label: string;
  cx: number; // normalized 0..1 center X on 2:3 image
  cy: number; // normalized 0..1 center Y on 2:3 image
  w: number; // normalized width
  h: number; // normalized height
  angleDeg: number;
  fit: "cover" | "contain";
  paperBg: string;
  insetPct?: number;
  spineEdge?: "left" | "none";
}

export const BOOK_MOCKUP_SLOT_GEOMETRY: Record<
  BookMockupBackdropId,
  MockupSlotGeometry[]
> = {
  "mockup-standing-kids": [
    {
      label: "Standing 3D Book Cover",
      cx: 0.502,
      cy: 0.573,
      w: 0.415,
      h: 0.378,
      angleDeg: 0.8,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
  ],
  "mockup-workbook-pastel": [
    {
      label: "Open Left Page",
      cx: 0.308,
      cy: 0.354,
      w: 0.375,
      h: 0.355,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Open Right Page",
      cx: 0.692,
      cy: 0.354,
      w: 0.375,
      h: 0.355,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Tilted Front Cover",
      cx: 0.618,
      cy: 0.668,
      w: 0.422,
      h: 0.388,
      angleDeg: 22.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
  ],
  "mockup-cozy-bundle": [
    {
      label: "Main Book Cover",
      cx: 0.382,
      cy: 0.34,
      w: 0.39,
      h: 0.322,
      angleDeg: -10.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Printable Sheet #1",
      cx: 0.612,
      cy: 0.59,
      w: 0.38,
      h: 0.318,
      angleDeg: 17,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Printable Sheet #2",
      cx: 0.695,
      cy: 0.745,
      w: 0.372,
      h: 0.302,
      angleDeg: 25,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-front-back": [
    {
      label: "Front Book Cover",
      cx: 0.585,
      cy: 0.37,
      w: 0.442,
      h: 0.372,
      angleDeg: 14.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Back Book Cover",
      cx: 0.515,
      cy: 0.702,
      w: 0.434,
      h: 0.382,
      angleDeg: -14.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
  ],
  "mockup-jungle-collage": [
    {
      label: "Coloring Sheet #1",
      cx: 0.525,
      cy: 0.562,
      w: 0.215,
      h: 0.222,
      angleDeg: -5.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Coloring Sheet #2",
      cx: 0.702,
      cy: 0.578,
      w: 0.222,
      h: 0.228,
      angleDeg: 11.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Mini Book Cover",
      cx: 0.862,
      cy: 0.715,
      w: 0.272,
      h: 0.212,
      angleDeg: 17,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
  ],
  "mockup-giftbox-kids": [
    {
      label: "Gift Box Book Cover",
      cx: 0.558,
      cy: 0.648,
      w: 0.145,
      h: 0.105,
      angleDeg: -14,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Fanned Sheet #1 (Left)",
      cx: 0.285,
      cy: 0.908,
      w: 0.25,
      h: 0.105,
      angleDeg: 5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.05,
      spineEdge: "none",
    },
    {
      label: "Fanned Sheet #2 (Center)",
      cx: 0.512,
      cy: 0.912,
      w: 0.275,
      h: 0.108,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.05,
      spineEdge: "none",
    },
    {
      label: "Fanned Sheet #3 (Right)",
      cx: 0.745,
      cy: 0.908,
      w: 0.255,
      h: 0.105,
      angleDeg: -5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.05,
      spineEdge: "none",
    },
  ],
  "mockup-spiral-flip": [
    {
      label: "Spiral Book Cover",
      cx: 0.332,
      cy: 0.342,
      w: 0.375,
      h: 0.342,
      angleDeg: -8.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "none",
    },
    {
      label: "Open Flip Coloring Page",
      cx: 0.758,
      cy: 0.34,
      w: 0.355,
      h: 0.325,
      angleDeg: 0.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Printable Sheet #1",
      cx: 0.344,
      cy: 0.694,
      w: 0.348,
      h: 0.324,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Printable Sheet #2",
      cx: 0.708,
      cy: 0.694,
      w: 0.348,
      h: 0.324,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-plush-numbers": [
    {
      label: "Open Left B&W Page",
      cx: 0.312,
      cy: 0.702,
      w: 0.375,
      h: 0.245,
      angleDeg: 2,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Open Right Colored Page",
      cx: 0.73,
      cy: 0.71,
      w: 0.375,
      h: 0.245,
      angleDeg: 2,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-look-inside": [
    {
      label: "Standing 3D Book Cover",
      cx: 0.495,
      cy: 0.228,
      w: 0.33,
      h: 0.328,
      angleDeg: 0,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Inside Left Page",
      cx: 0.308,
      cy: 0.758,
      w: 0.382,
      h: 0.325,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Inside Right Page",
      cx: 0.694,
      cy: 0.758,
      w: 0.382,
      h: 0.325,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-toddler-trace": [
    {
      label: "Standing Tracing Book Cover",
      cx: 0.818,
      cy: 0.756,
      w: 0.228,
      h: 0.205,
      angleDeg: 2.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Desk Tracing Sheet",
      cx: 0.45,
      cy: 0.818,
      w: 0.295,
      h: 0.072,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-animal-facts": [
    {
      label: "Open Left Fact Page",
      cx: 0.31,
      cy: 0.578,
      w: 0.435,
      h: 0.36,
      angleDeg: -13.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Open Right Fact Page",
      cx: 0.728,
      cy: 0.515,
      w: 0.435,
      h: 0.36,
      angleDeg: -13.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Standing Background Cover",
      cx: 0.165,
      cy: 0.155,
      w: 0.34,
      h: 0.315,
      angleDeg: -11.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
  ],
  "mockup-cream-infographic": [
    {
      label: "Centered Square Cover",
      cx: 0.506,
      cy: 0.42,
      w: 0.395,
      h: 0.275,
      angleDeg: 0,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Fanned Sheet #1",
      cx: 0.228,
      cy: 0.735,
      w: 0.22,
      h: 0.24,
      angleDeg: -18.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Fanned Sheet #2",
      cx: 0.41,
      cy: 0.712,
      w: 0.225,
      h: 0.245,
      angleDeg: -5.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Fanned Sheet #3",
      cx: 0.59,
      cy: 0.715,
      w: 0.225,
      h: 0.245,
      angleDeg: 5.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Fanned Sheet #4",
      cx: 0.78,
      cy: 0.742,
      w: 0.235,
      h: 0.245,
      angleDeg: 17.5,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-alphabet-hands": [
    {
      label: "Tilted ABC Book Cover",
      cx: 0.265,
      cy: 0.235,
      w: 0.37,
      h: 0.34,
      angleDeg: -19.5,
      fit: "cover",
      paperBg: "#FFFFFF",
      insetPct: 0,
      spineEdge: "left",
    },
    {
      label: "Open Left Page",
      cx: 0.308,
      cy: 0.712,
      w: 0.388,
      h: 0.35,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
    {
      label: "Open Right Letter Page",
      cx: 0.696,
      cy: 0.712,
      w: 0.388,
      h: 0.35,
      angleDeg: 0,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.04,
      spineEdge: "none",
    },
  ],
  "mockup-collage-secret": [
    {
      label: "Mini Book #1 (Top-Left)",
      cx: 0.352,
      cy: 0.22,
      w: 0.255,
      h: 0.17,
      angleDeg: -26,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #2 (Top-Right)",
      cx: 0.672,
      cy: 0.222,
      w: 0.255,
      h: 0.17,
      angleDeg: 28,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #3 (Mid-Right Top)",
      cx: 0.875,
      cy: 0.362,
      w: 0.255,
      h: 0.17,
      angleDeg: 54,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #4 (Mid-Right Bottom)",
      cx: 0.875,
      cy: 0.625,
      w: 0.255,
      h: 0.17,
      angleDeg: 112,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #5 (Bottom-Right)",
      cx: 0.665,
      cy: 0.78,
      w: 0.255,
      h: 0.17,
      angleDeg: -26,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #6 (Bottom-Left)",
      cx: 0.338,
      cy: 0.775,
      w: 0.255,
      h: 0.17,
      angleDeg: 26,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #7 (Mid-Left Bottom)",
      cx: 0.125,
      cy: 0.618,
      w: 0.255,
      h: 0.17,
      angleDeg: -66,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
    {
      label: "Mini Book #8 (Mid-Left Top)",
      cx: 0.135,
      cy: 0.368,
      w: 0.255,
      h: 0.17,
      angleDeg: 32,
      fit: "contain",
      paperBg: "#FFFFFF",
      insetPct: 0.03,
      spineEdge: "none",
    },
  ],
};

export function isFlatLayBackdrop(id: ShowcaseBackdropId): id is FlatLayBackdropId {
  return id in FLAT_LAY_PHOTO_URLS;
}

export function isBookMockupBackdrop(id: ShowcaseBackdropId): id is BookMockupBackdropId {
  return id in BOOK_MOCKUP_PHOTO_URLS;
}

export function isPhotoShowcaseBackdrop(
  id: ShowcaseBackdropId
): id is PhotoShowcaseBackdropId {
  return id in ALL_PHOTO_BACKDROP_URLS;
}

export function getBookMockupSlotCount(id: ShowcaseBackdropId): number {
  if (isBookMockupBackdrop(id)) {
    return BOOK_MOCKUP_SLOT_GEOMETRY[id].length;
  }
  return 2;
}
