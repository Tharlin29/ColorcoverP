export type FlyerBorderStyle = "pastel-rainbow" | "pastel-pink" | "pastel-mint" | "clean-white";

export type FlyerElementRole = "logo" | "qr" | "image" | "text";

export interface FlyerBaseElement {
  id: string;
  role: FlyerElementRole;
  label: string;
  /** Center X in canvas coordinates (0..850) */
  x: number;
  /** Center Y in canvas coordinates (0..1100) */
  y: number;
  /** Element bounding width in canvas coordinates */
  width: number;
  /** Element bounding height in canvas coordinates (used directly for images, auto/min for text) */
  height: number;
  /** Optional clickable URL embedded in exported PDF */
  linkUrl?: string;
}

export interface FlyerTextElement extends FlyerBaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  rainbowLetters?: boolean;
  bold: boolean;
  firstLineBold?: boolean;
  italic: boolean;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  bgColor: string; // "transparent" or hex
  roundedPadding: boolean;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface FlyerImageElement extends FlyerBaseElement {
  type: "image";
  src: string;
  /** Natural image aspect ratio (naturalWidth / naturalHeight) */
  naturalAspect: number;
  /** Blend white background seamlessly on white flyer */
  blendMultiply?: boolean;
  borderRadius: number;
}

export type FlyerElement = FlyerTextElement | FlyerImageElement;

export interface FlyerDecorItem {
  id: string;
  kind: "star" | "heart" | "dot";
  x: number; // 0..850
  y: number; // 0..1100
  size: number;
  color: string;
  rotation: number;
}

export interface FlyerState {
  borderStyle: FlyerBorderStyle;
  pageBgColor: string;
  customBgImage?: string;
  showDecorations: boolean;
  elements: FlyerElement[];
}

export interface FlyerReadyMadePhoto {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  role: "logo" | "qr" | "reference";
  aspect: number;
}
