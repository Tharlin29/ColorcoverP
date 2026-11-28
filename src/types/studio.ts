export type PageId = "design" | "flyer" | "ai-edit" | "book" | "text";

export type CreationMode = "coloring-book" | "standard";
export type BookPageSize = "us-letter" | "a4";
export type PrintDpi = 300 | 350;
export type ColoringColorMode = "bw" | "grayscale";

export type AspectRatio = "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

export type MoodPreset =
  | "Editorial Film"
  | "Golden Hour"
  | "Cyber Noir"
  | "Watercolor Mist"
  | "Minimalist Arch";

export interface PhotoAdjustments {
  brightness: number; // 50 to 150 (100 default)
  contrast: number; // 50 to 150 (100 default)
  saturation: number; // 0 to 200 (100 default)
  warmth: number; // -50 to 50 (0 default)
  vignette: number; // 0 to 100 (0 default)
  filter: "original" | "warm-film" | "mono" | "vivid" | "noir" | "sunset";
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
}

export interface PhotoItem {
  id: string;
  title: string;
  prompt: string;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
  mood?: string;
  dpi?: number;
  pageSize?: BookPageSize;
  colorMode?: ColoringColorMode;
  isColoringPage?: boolean;
  kind: "coloring" | "generated" | "uploaded" | "edited" | "text-art" | "curated";
  createdAt: number;
  updatedAt: number;
}

export type TextStylePreset =
  | "clean"
  | "shadow"
  | "neon"
  | "outline"
  | "pill-box"
  | "block-3d"
  | "gradient"
  | "quote-bar"
  | "comic-3d"
  | "banner-pill"
  | "ribbon-scroll";

export type TextCanvasAspect = "auto" | "2:3" | "4:5" | "1:1" | "4:3" | "16:9";

export type TextImageFrameStyle = "plain" | "book-cover" | "tilt-card" | "circle-badge";

export type TextBoundStyle =
  | "none"
  | "solid"
  | "rounded"
  | "dashed"
  | "dotted"
  | "double"
  | "neon-glow"
  | "ribbon"
  | "ticket"
  | "bracket"
  | "top-bottom-rule"
  | "speech-bubble"
  | "scallop-seal"
  | "gold-ornate"
  | "shadow-card"
  | "sketch-double"
  | "leaf-crest"
  | "circle"
  | "leaf"
  | "heart"
  | "seal"
  | "book"
  | "cloud-puff"
  | "royal-scroll"
  | "crown-crest"
  | "comic-burst"
  | "vintage-plaque"
  | "postage-stamp"
  | "floral-arch"
  | "starlight"
  | "washi-tape";

export interface FontOption {
  id: string;
  label: string;
  family: string;
  sample: string;
  tag: string;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  fontSize: number; // relative px on 1000 base
  fontFamily: string;
  fontWeight: "400" | "600" | "700";
  color: string;
  accentColor: string;
  bgColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  curve?: number; // -30 to 30 arch curvature
  boundStyle?: TextBoundStyle;
  boundPadX?: number; // 4 to 220 (controls horizontal width: narrow -> wide)
  boundPadY?: number; // 2 to 120 (controls vertical size: small -> large)
  boundThickness?: number; // 1 to 16
  boundRadius?: number; // 0 to 60
  boundColor?: string;
  boundFillColor?: string;
  boundFillOpacity?: number; // 0 to 1
  stylePreset: TextStylePreset;
  align: "left" | "center" | "right";
  rotation: number; // -45 to 45 deg
  letterSpacing: number; // -2 to 20
  opacity: number; // 0.1 to 1
}

export interface TextStudioImageLayer {
  id: string;
  label: string;
  src: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  widthPct: number; // 8 to 90 percentage of canvas width
  aspectRatio: number; // width / height
  rotation: number; // -45 to 45 deg
  opacity: number; // 0.1 to 1
  frameStyle: TextImageFrameStyle;
  caption?: string;
  badgeText?: string;
}

export interface AiEditRecolorRegion {
  label: string;
  shape: "ellipse" | "rect" | "polygon";
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  targetColor: string;
  blendMode: "color" | "multiply" | "hue" | "soft-light" | "source-over";
  opacity: number;
  feather: number;
}

export interface AiEditSvgElement {
  type: "circle" | "ellipse" | "rect" | "line" | "path" | "polygon";
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  d?: string;
  points?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: "source-over" | "multiply" | "screen" | "overlay" | "soft-light";
}

export interface AiEditColorGrading {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  tintColor?: string;
  tintOpacity?: number;
}

export interface AiEditEraseRegion {
  label: string;
  shape: "ellipse" | "rect" | "polygon";
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  fillColor?: string;
  feather?: number;
}

export interface AiEditColoringConfig {
  enabled: boolean;
  pageSize: BookPageSize;
  dpi: PrintDpi;
  colorMode: ColoringColorMode;
}

export interface AiEditPlan {
  analysis: string;
  editSummary: string;
  preservedIntegrityNote: string;
  colorGrading: AiEditColorGrading;
  recolorRegions: AiEditRecolorRegion[];
  eraseRegions?: AiEditEraseRegion[];
  clothingSvg?: string | null;
  svgElements: AiEditSvgElement[];
}

export interface EditOverlayLayer {
  id: string;
  label: string;
  category: "ai-object" | "cartoon" | "sticker";
  src: string;
  x: number; // 0..100 percentage of canvas width
  y: number; // 0..100 percentage of canvas height
  widthPct: number; // base width % of canvas width
  aspectRatio: number; // width / height
  scale: number; // 0.25..2.5
  rotation: number; // -180..180
  flipH: boolean;
  opacity: number; // 0.1..1
  locked?: boolean;
  hidden?: boolean;
}

export interface CanvasDrawStroke {
  id: string;
  tool: "ink" | "whiteout";
  width: number; // relative stroke width on 1000px base
  points: { x: number; y: number }[]; // normalized 0..1000 coordinates
}

export type ShowcaseLayoutId =
  | "center-plaque-6"
  | "top-banner-5"
  | "hero-plus-4"
  | "clean-grid-4"
  | "diagonal-cascade-5"
  | "spotlight-trio-3"
  | "flat-lay-book"
  | "book-mockup";

export type ShowcaseBackdropId =
  | "festive-pine-desk"
  | "craft-table-lights"
  | "spring-botanical-oak"
  | "pastel-kids-desk"
  | "midnight-studio-gold"
  | "terrazzo-cream-studio"
  | "blush-floral-linen"
  | "galaxy-nebula-desk"
  | "ocean-mint-atelier"
  | "editorial-sage-marble"
  | "candy-pastel-confetti"
  | "flatlay-oak-latte"
  | "flatlay-picnic-grass"
  | "flatlay-linen-blinds"
  | "flatlay-walnut-botanical"
  | "flatlay-pastel-markers"
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
  | "mockup-collage-secret"
  | "mockup-cozy-tablet-christmas"
  | "mockup-cozy-tablet-pastel"
  | "custom";

export type ShowcasePlaqueStyle =
  | "wood-plaque"
  | "cloud-sticker"
  | "ribbon-badge"
  | "scallop-frame"
  | "polaroid-strip"
  | "neo-brutal"
  | "glass-frost"
  | "y2k-spark"
  | "luxe-deco"
  | "postage-stamp"
  | "retro-ticket"
  | "royal-crown"
  | "comic-burst"
  | "floral-arch"
  | "neon-cyber";

export type ShowcaseBannerBoundDash = "solid" | "dashed" | "dotted" | "double";

export type ShowcaseAspectId = "9:16" | "2:3" | "4:5" | "1:1";

export type ShowcaseCardPaper = "white" | "kraft" | "pastel-blue" | "pastel-cream";

export type ShowcaseHeroTextStyle =
  | "outline-3d"
  | "clean"
  | "shadow"
  | "pill-box"
  | "block-3d"
  | "neon";

export type CardOverlayTextStyle =
  | "pill-box"
  | "outline-3d"
  | "shadow"
  | "banner-ribbon"
  | "clean";

export type ShowcaseCardFrameStyle = "paper" | "clean" | "polaroid";

export interface ShowcaseCardSlot {
  id: string;
  label: string;
  src: string;
  paper: ShowcaseCardPaper;
  caption?: string;
  overlayText?: string;
  overlayStyle?: CardOverlayTextStyle;
  overlayColor?: string;
  overlayBgColor?: string;
  overlayPosition?: "top" | "center" | "bottom";
  overlayX?: number; // 0..100 horizontal % inside card (default 50)
  overlayY?: number; // 0..100 vertical % inside card
  overlayFontSize?: number; // percentage scale 60..180 (default 100)
  /** Optional manual free-positioning & orientation overrides */
  x?: number; // 0..100 horizontal % of canvas width
  y?: number; // 0..100 vertical % of canvas height
  widthPct?: number; // 10..90 % of canvas width (primarily for custom added cards)
  aspectRatio?: number; // width / height ratio of image
  rotation?: number; // -180..180 deg (0 = straight/upright, +/- = tilted)
  scale?: number; // 0.35..2.2 size multiplier for layout slot cards
  frameStyle?: ShowcaseCardFrameStyle; // default "paper"
  aboveBanner?: boolean; // for custom added cards: draw above hero banner (default true)
}

export interface ShowcaseDesignConfig {
  aspect: ShowcaseAspectId;
  layout: ShowcaseLayoutId;
  backdrop: ShowcaseBackdropId;
  customBackdropSrc?: string;
  hideHeroBanner?: boolean;
  overlayFlatLayPages?: boolean;
  plaqueStyle: ShowcasePlaqueStyle;
  plaqueBgColor?: string;
  bannerBoundColor?: string;
  bannerBoundWidth?: number; // 0..14 border stroke width
  bannerBoundDash?: ShowcaseBannerBoundDash;
  bannerBoundRadius?: number; // 0..48 corner roundness
  bannerBoundBgOpacity?: number; // 0..100 fill opacity
  bannerBoundShadow?: boolean; // drop shadow toggle (default true)
  bannerBoundScaleX?: number; // 70..100 width %
  bannerBoundScaleY?: number; // 75..125 height %
  accentBadge: string; // e.g., "25" or ""
  titleLine1: string; // e.g., "Cutest" or "Christmas"
  titleLine2Ribbon: string; // e.g., "Christmas Handprint" or "Coloring Pages"
  titleLine3: string; // e.g., "Crafts for Kids" or "for Kids"
  subtitleText: string; // e.g., "Easy Keepsakes" or "Print, color, and celebrate!"
  footerBrandText: string; // e.g., "Zumblies.com" or ""
  primaryColor: string;
  secondaryColor: string;
  ribbonColor: string;
  subtitleBgColor: string;
  subtitleTextColor: string;
  footerBgColor: string;
  footerTextColor?: string;
  title1Color?: string;
  title1BgColor?: string;
  title1Style?: ShowcaseHeroTextStyle;
  title2TextColor?: string;
  title2Style?: "ribbon" | ShowcaseHeroTextStyle;
  title3Color?: string;
  title3BgColor?: string;
  title3Style?: ShowcaseHeroTextStyle;
  subtitleStyle?: "pill" | ShowcaseHeroTextStyle;
  footerStyle?: "pill" | ShowcaseHeroTextStyle;
  titleFontScale?: number; // percentage 60..150 (default 100)
  bannerOffsetX?: number; // -35..35 horizontal % offset for hero plaque & text
  bannerOffsetY?: number; // -35..35 vertical % offset for hero plaque & text
  title1OffsetX?: number; // -250..250 horizontal offset (base 1000px)
  title1OffsetY?: number; // -250..250 vertical offset (base 1000px)
  title2OffsetX?: number;
  title2OffsetY?: number;
  title3OffsetX?: number;
  title3OffsetY?: number;
  subtitleOffsetX?: number;
  subtitleOffsetY?: number;
  footerOffsetX?: number; // -35..35 horizontal % offset
  footerOffsetY?: number; // -85..5 vertical % offset
  fontFamily: string;
  decorTheme: "christmas" | "hearts" | "stars" | "botanical" | "sparkle";
  showCardCaptions: boolean;
  cards: ShowcaseCardSlot[];
  customCards?: ShowcaseCardSlot[];
  customTextLayers?: TextLayer[];
}
