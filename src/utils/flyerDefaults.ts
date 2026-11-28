import {
  FlyerDecorItem,
  FlyerElement,
  FlyerReadyMadePhoto,
  FlyerState,
} from "../types/flyer";

export const FLYER_WIDTH = 850;
export const FLYER_HEIGHT = 1100;

export const DEFAULT_STORE_URL = "https://coloringbooks-ten.vercel.app";

export const DEFAULT_FLYER_ASSETS = {
  logo: "/assets/flyer/gbtk-logo.jpg",
  qr: "/assets/flyer/gbtk-qr.png",
  referenceFlyer: "/assets/flyer/gbtk-reference-flyer.jpg",
} as const;

export const READY_MADE_FLYER_PHOTOS: FlyerReadyMadePhoto[] = [
  {
    id: "default-gbtk-logo",
    title: "GBTK Studio Rainbow Logo",
    subtitle: "3D Pastel Logo (Default Top)",
    src: DEFAULT_FLYER_ASSETS.logo,
    role: "logo",
    aspect: 1,
  },
  {
    id: "default-store-qr",
    title: "Official Store QR Code",
    subtitle: "Scannable QR (Default Bottom)",
    src: DEFAULT_FLYER_ASSETS.qr,
    role: "qr",
    aspect: 1,
  },
  {
    id: "default-flyer-reference",
    title: "Complete Back Page Flyer",
    subtitle: "Ready-Made Full Flyer Template",
    src: DEFAULT_FLYER_ASSETS.referenceFlyer,
    role: "reference",
    aspect: 1792 / 2400,
  },
];

export const RAINBOW_BORDER_BANDS = [
  "#F9A8B8", // pastel coral-pink
  "#FBC490", // pastel peach
  "#FBE79A", // pastel lemon
  "#A8E6C3", // pastel mint
  "#A8D8FA", // pastel sky blue
  "#C8B6F6", // pastel lavender
];

export const RAINBOW_LETTER_COLORS = [
  "#FDA4AF", // coral pink
  "#FDBA74", // peach orange
  "#FDE68A", // pastel yellow
  "#A7F3D0", // mint green
  "#BAE6FD", // sky blue
  "#DDD6FE", // soft lavender
];

export const PASTEL_TEXT_PRESETS = [
  { label: "Ink Black", value: "#111113" },
  { label: "Charcoal", value: "#374151" },
  { label: "Pastel Coral", value: "#F4728A" },
  { label: "Pastel Peach", value: "#F59E6C" },
  { label: "Pastel Gold", value: "#EAB308" },
  { label: "Pastel Mint", value: "#34B88A" },
  { label: "Pastel Sky", value: "#4DA8E8" },
  { label: "Pastel Lavender", value: "#9B7BE8" },
  { label: "Pure White", value: "#FFFFFF" },
];

export const PASTEL_BG_PRESETS = [
  { label: "Transparent", value: "transparent" },
  { label: "Offer Yellow", value: "#FEF0A6" },
  { label: "Blush Pink", value: "#FCE7F3" },
  { label: "Soft Mint", value: "#DCFCE7" },
  { label: "Baby Blue", value: "#E0F2FE" },
  { label: "Lavender Mist", value: "#EDE9FE" },
  { label: "Warm Cream", value: "#FFF7ED" },
  { label: "Crisp White", value: "#FFFFFF" },
  { label: "Deep Ink", value: "#18181B" },
];

export const FLYER_FONT_OPTIONS = [
  { label: "Fredoka (Rounded)", value: "'Fredoka', sans-serif" },
  { label: "Baloo 2 (Playful)", value: "'Baloo 2', sans-serif" },
  { label: "Outfit (Clean)", value: "'Outfit', sans-serif" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Caveat (Handwritten)", value: "'Caveat', cursive" },
  { label: "Oswald (Bold Tall)", value: "'Oswald', sans-serif" },
  { label: "Noto Sans Myanmar", value: "'Noto Sans Myanmar', sans-serif" },
];

export const FLYER_DECORATIONS: FlyerDecorItem[] = [
  // Top-left cluster around logo
  { id: "d1", kind: "star", x: 250, y: 118, size: 28, color: "#FDE68A", rotation: -12 },
  { id: "d2", kind: "star", x: 184, y: 164, size: 22, color: "#FDBA74", rotation: 14 },
  { id: "d3", kind: "dot", x: 266, y: 168, size: 9, color: "#FDA4AF", rotation: 0 },
  { id: "d4", kind: "star", x: 214, y: 208, size: 21, color: "#A7F3D0", rotation: -8 },
  { id: "d5", kind: "heart", x: 198, y: 262, size: 28, color: "#C4B5FD", rotation: -16 },
  { id: "d6", kind: "dot", x: 260, y: 274, size: 8, color: "#C4B5FD", rotation: 0 },

  // Top-right cluster around logo
  { id: "d7", kind: "star", x: 602, y: 114, size: 28, color: "#FDBA74", rotation: 10 },
  { id: "d8", kind: "dot", x: 672, y: 108, size: 9, color: "#93C5FD", rotation: 0 },
  { id: "d9", kind: "heart", x: 656, y: 160, size: 28, color: "#FDA4AF", rotation: 15 },
  { id: "d10", kind: "dot", x: 588, y: 186, size: 8, color: "#C4B5FD", rotation: 0 },
  { id: "d11", kind: "heart", x: 660, y: 214, size: 16, color: "#FDA4AF", rotation: 12 },
  { id: "d12", kind: "star", x: 608, y: 258, size: 28, color: "#A7F3D0", rotation: -14 },
  { id: "d13", kind: "dot", x: 676, y: 266, size: 8, color: "#FDBA74", rotation: 0 },

  // Bottom-left cluster around QR
  { id: "d14", kind: "dot", x: 204, y: 734, size: 9, color: "#FDA4AF", rotation: 0 },
  { id: "d15", kind: "star", x: 136, y: 774, size: 28, color: "#FDBA74", rotation: -10 },
  { id: "d16", kind: "heart", x: 166, y: 842, size: 29, color: "#FDA4AF", rotation: -14 },
  { id: "d17", kind: "dot", x: 234, y: 878, size: 9, color: "#C4B5FD", rotation: 0 },
  { id: "d18", kind: "star", x: 116, y: 902, size: 22, color: "#C4B5FD", rotation: 18 },
  { id: "d19", kind: "dot", x: 148, y: 938, size: 9, color: "#FDBA74", rotation: 0 },
  { id: "d20", kind: "star", x: 214, y: 952, size: 26, color: "#93C5FD", rotation: -8 },

  // Bottom-right cluster around QR
  { id: "d21", kind: "heart", x: 642, y: 746, size: 20, color: "#FDA4AF", rotation: 14 },
  { id: "d22", kind: "dot", x: 726, y: 736, size: 9, color: "#93C5FD", rotation: 0 },
  { id: "d23", kind: "star", x: 708, y: 802, size: 24, color: "#C4B5FD", rotation: 12 },
  { id: "d24", kind: "dot", x: 634, y: 826, size: 9, color: "#FDBA74", rotation: 0 },
  { id: "d25", kind: "star", x: 746, y: 838, size: 20, color: "#FDE68A", rotation: -12 },
  { id: "d26", kind: "heart", x: 676, y: 888, size: 30, color: "#C4B5FD", rotation: 16 },
  { id: "d27", kind: "dot", x: 742, y: 906, size: 9, color: "#FDA4AF", rotation: 0 },
  { id: "d28", kind: "star", x: 632, y: 958, size: 20, color: "#A7F3D0", rotation: 10 },
  { id: "d29", kind: "dot", x: 706, y: 954, size: 8, color: "#C4B5FD", rotation: 0 },
];

export function createDefaultFlyerElements(): FlyerElement[] {
  return [
    {
      id: "flyer-logo",
      type: "image",
      role: "logo",
      label: "GBTK Studio Logo",
      src: DEFAULT_FLYER_ASSETS.logo,
      x: 425,
      y: 186,
      width: 276,
      height: 276,
      naturalAspect: 1,
      blendMultiply: true,
      borderRadius: 0,
    },
    {
      id: "flyer-headline",
      type: "text",
      role: "text",
      label: "Thank You Headline",
      text: "THANK YOU FOR DOWNLOADING!",
      x: 425,
      y: 364,
      width: 720,
      height: 60,
      fontSize: 41,
      fontFamily: "'Fredoka', sans-serif",
      color: "#F4728A",
      rainbowLetters: true,
      bold: true,
      italic: false,
      outline: true,
      outlineColor: "#18181B",
      outlineWidth: 2.2,
      bgColor: "transparent",
      roundedPadding: false,
      borderRadius: 16,
      paddingX: 16,
      paddingY: 8,
      align: "center",
      lineHeight: 1.15,
      letterSpacing: 1,
    },
    {
      id: "flyer-body-1",
      type: "text",
      role: "text",
      label: "Welcome Message",
      text: "We hope your little ones enjoy coloring these pages!",
      x: 425,
      y: 422,
      width: 710,
      height: 44,
      fontSize: 27,
      fontFamily: "'Fredoka', sans-serif",
      color: "#111113",
      rainbowLetters: false,
      bold: false,
      italic: false,
      outline: false,
      outlineColor: "#18181B",
      outlineWidth: 1.5,
      bgColor: "transparent",
      roundedPadding: false,
      borderRadius: 12,
      paddingX: 12,
      paddingY: 6,
      align: "center",
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    {
      id: "flyer-body-2",
      type: "text",
      role: "text",
      label: "Store Teaser Text",
      text: "Want the complete coloring book collections,\nclassroom posters, and cute 3D sticker sheets?",
      x: 425,
      y: 488,
      width: 700,
      height: 76,
      fontSize: 27,
      fontFamily: "'Fredoka', sans-serif",
      color: "#111113",
      rainbowLetters: false,
      bold: false,
      italic: false,
      outline: false,
      outlineColor: "#18181B",
      outlineWidth: 1.5,
      bgColor: "transparent",
      roundedPadding: false,
      borderRadius: 12,
      paddingX: 12,
      paddingY: 6,
      align: "center",
      lineHeight: 1.28,
      letterSpacing: 0,
    },
    {
      id: "flyer-offer-box",
      type: "text",
      role: "text",
      label: "10% Off Offer Box (Clickable Link)",
      text: "GET 10% OFF YOUR FIRST ORDER!\nVisit our official store: coloringbooks-ten.vercel.app",
      x: 425,
      y: 608,
      width: 684,
      height: 112,
      fontSize: 26,
      fontFamily: "'Fredoka', sans-serif",
      color: "#111113",
      rainbowLetters: false,
      bold: false,
      firstLineBold: true,
      italic: false,
      outline: false,
      outlineColor: "#18181B",
      outlineWidth: 1.5,
      bgColor: "#FEF0A6",
      roundedPadding: true,
      borderRadius: 20,
      paddingX: 28,
      paddingY: 20,
      align: "center",
      lineHeight: 1.35,
      letterSpacing: 0.2,
      linkUrl: DEFAULT_STORE_URL,
    },
    {
      id: "flyer-scan-label",
      type: "text",
      role: "text",
      label: "Scan Prompt Label",
      text: "SCAN TO VISIT OUR STORE",
      x: 425,
      y: 710,
      width: 440,
      height: 36,
      fontSize: 21,
      fontFamily: "'Fredoka', sans-serif",
      color: "#F4728A",
      rainbowLetters: true,
      bold: true,
      italic: false,
      outline: true,
      outlineColor: "#18181B",
      outlineWidth: 1.6,
      bgColor: "transparent",
      roundedPadding: false,
      borderRadius: 10,
      paddingX: 10,
      paddingY: 4,
      align: "center",
      lineHeight: 1.15,
      letterSpacing: 0.8,
    },
    {
      id: "flyer-qr",
      type: "image",
      role: "qr",
      label: "Store QR Code (Clickable Link)",
      src: DEFAULT_FLYER_ASSETS.qr,
      x: 425,
      y: 856,
      width: 248,
      height: 248,
      naturalAspect: 1,
      blendMultiply: true,
      borderRadius: 0,
      linkUrl: DEFAULT_STORE_URL,
    },
    {
      id: "flyer-footer",
      type: "text",
      role: "text",
      label: "Footer & Pinterest Handle",
      text: "Follow us on Pinterest: @GBTKSTUDIO29 | Personal & Classroom Use Only",
      x: 425,
      y: 1022,
      width: 720,
      height: 38,
      fontSize: 19,
      fontFamily: "'Fredoka', sans-serif",
      color: "#111113",
      rainbowLetters: false,
      bold: false,
      italic: false,
      outline: false,
      outlineColor: "#18181B",
      outlineWidth: 1,
      bgColor: "transparent",
      roundedPadding: false,
      borderRadius: 10,
      paddingX: 10,
      paddingY: 4,
      align: "center",
      lineHeight: 1.25,
      letterSpacing: 0,
    },
  ];
}

export function createDefaultFlyerState(): FlyerState {
  return {
    borderStyle: "pastel-rainbow",
    pageBgColor: "#FFFFFF",
    customBgImage: undefined,
    showDecorations: true,
    elements: createDefaultFlyerElements(),
  };
}
