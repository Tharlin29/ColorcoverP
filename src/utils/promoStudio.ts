import { PhotoItem, TextCanvasAspect, TextLayer, TextStudioImageLayer } from "../types/studio";
import { svgToDataUrl } from "./stickerLibrary";

export interface ScenicBackdropPreset {
  id: string;
  label: string;
  dataUrl: string;
}

export function getTextCanvasDimensions(aspect: TextCanvasAspect): { width: number; height: number } {
  switch (aspect) {
    case "2:3":
      return { width: 1000, height: 1500 };
    case "4:5":
      return { width: 1080, height: 1350 };
    case "1:1":
      return { width: 1200, height: 1200 };
    case "16:9":
      return { width: 1280, height: 720 };
    case "4:3":
    case "auto":
    default:
      return { width: 1200, height: 900 };
  }
}

export function buildSunnyMeadowBackdropSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1500" width="1000" height="1500">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="28%" stop-color="#38BDF8"/>
      <stop offset="52%" stop-color="#BAE6FD"/>
      <stop offset="68%" stop-color="#FEF3C7"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="78%" cy="38%" r="40%">
      <stop offset="0%" stop-color="#FFFBEB" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#FDE68A" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#FDE68A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="farHill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#84CC16"/>
      <stop offset="100%" stop-color="#4D7C0F"/>
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#BEF264"/>
      <stop offset="35%" stop-color="#84CC16"/>
      <stop offset="78%" stop-color="#4D7C0F"/>
      <stop offset="100%" stop-color="#365314"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#84CC16"/>
      <stop offset="100%" stop-color="#3F6212"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="1000" height="1500" fill="url(#sky)"/>
  <rect width="1000" height="900" fill="url(#sunGlow)"/>

  <!-- Soft Fluffy Clouds -->
  <g fill="#FFFFFF" opacity="0.82">
    <path d="M-20 250 Q30 205 90 220 Q135 170 205 198 Q265 188 295 235 Q335 238 345 270 L-20 270 Z"/>
    <path d="M680 230 Q725 185 785 202 Q835 162 900 190 Q960 175 1020 220 L1020 265 L660 265 Z"/>
    <ellipse cx="490" cy="295" rx="220" ry="38" opacity="0.45"/>
  </g>

  <!-- Distant Rolling Mountains -->
  <path d="M0 545 Q170 460 360 515 Q560 470 760 520 Q910 495 1000 535 L1000 720 L0 720 Z" fill="#93C5FD" opacity="0.55"/>
  <path d="M0 585 Q210 510 440 570 Q680 510 1000 565 L1000 800 L0 800 Z" fill="#FCD34D" opacity="0.35"/>

  <!-- Distant Stone Village Silhouette -->
  <g fill="#E7CFA0" opacity="0.72">
    <rect x="740" y="545" width="38" height="45" rx="2"/>
    <rect x="785" y="532" width="46" height="58" rx="2"/>
    <rect x="838" y="550" width="34" height="40" rx="2"/>
    <rect x="878" y="525" width="52" height="65" rx="2"/>
    <path d="M785 532 Q808 508 831 532 Z"/>
    <rect x="115" y="548" width="42" height="44" rx="2"/>
    <rect x="164" y="535" width="36" height="57" rx="2"/>
  </g>

  <!-- Midground Lush Hills -->
  <path d="M0 640 Q250 565 520 625 Q790 565 1000 620 L1000 1050 L0 1050 Z" fill="url(#farHill)"/>
  <!-- Cypress & Olive Trees on Horizon -->
  <g fill="#3F6212" opacity="0.85">
    <ellipse cx="88" cy="560" rx="22" ry="70"/>
    <ellipse cx="145" cy="580" rx="20" ry="56"/>
    <circle cx="920" cy="595" r="46"/>
    <circle cx="865" cy="612" r="34"/>
  </g>

  <!-- Sunlit Meadow Foreground -->
  <path d="M0 740 Q320 685 650 735 Q850 760 1000 720 L1000 1500 L0 1500 Z" fill="url(#meadow)"/>
  <path d="M0 1060 Q320 990 660 1045 Q860 1075 1000 1020 L1000 1500 L0 1500 Z" fill="#3F6212" opacity="0.45"/>

  <!-- White Daisies / Wildflowers in Meadow -->
  <g>
    ${[
      [110, 1180, 1], [175, 1320, 0.9], [280, 1410, 1.1], [410, 1385, 0.85],
      [620, 1395, 0.9], [770, 1325, 1.05], [885, 1210, 1], [930, 1370, 0.95],
      [65, 980, 0.75], [935, 945, 0.8], [230, 1230, 0.8], [730, 1240, 0.8],
    ]
      .map(
        ([fx, fy, s]) => `<g transform="translate(${fx},${fy}) scale(${s})">
          <circle cx="0" cy="-10" r="6.5" fill="#FFFFFF"/>
          <circle cx="9.5" cy="-3" r="6.5" fill="#FFFFFF"/>
          <circle cx="6" cy="8.5" r="6.5" fill="#FFFFFF"/>
          <circle cx="-6" cy="8.5" r="6.5" fill="#FFFFFF"/>
          <circle cx="-9.5" cy="-3" r="6.5" fill="#FFFFFF"/>
          <circle cx="0" cy="0" r="5.5" fill="#FACC15"/>
        </g>`
      )
      .join("")}
  </g>

  <!-- Foreground Corner Rocks -->
  <path d="M-20 1500 Q30 1320 140 1365 Q235 1400 265 1500 Z" fill="#78716C"/>
  <path d="M-10 1500 Q35 1350 120 1385 Q185 1415 215 1500 Z" fill="#A8A29E" opacity="0.55"/>
  <path d="M1020 1500 Q970 1315 850 1365 Q765 1405 735 1500 Z" fill="#78716C"/>
  <path d="M1010 1500 Q965 1345 875 1385 Q805 1420 775 1500 Z" fill="#A8A29E" opacity="0.55"/>

  <!-- Top Olive Leaf Accents -->
  <g stroke="#14532D" stroke-width="3" fill="url(#leafGrad)">
    <path d="M25 275 Q78 248 118 225" fill="none" stroke="#365314" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="62" cy="245" rx="26" ry="11" transform="rotate(-35 62 245)"/>
    <ellipse cx="98" cy="230" rx="28" ry="11" transform="rotate(-18 98 230)"/>
    <ellipse cx="88" cy="268" rx="26" ry="10" transform="rotate(14 88 268)"/>

    <path d="M975 275 Q922 248 882 225" fill="none" stroke="#365314" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="938" cy="245" rx="26" ry="11" transform="rotate(35 938 245)"/>
    <ellipse cx="902" cy="230" rx="28" ry="11" transform="rotate(18 902 230)"/>
    <ellipse cx="912" cy="268" rx="26" ry="10" transform="rotate(-14 912 268)"/>
  </g>

  <!-- Mid-Side Olive Branches -->
  <g stroke="#14532D" stroke-width="3" fill="url(#leafGrad)">
    <path d="M-10 730 Q55 685 115 655" fill="none" stroke="#365314" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="38" cy="686" rx="34" ry="14" transform="rotate(-32 38 686)"/>
    <ellipse cx="86" cy="662" rx="32" ry="13" transform="rotate(-18 86 662)"/>
    <ellipse cx="72" cy="712" rx="32" ry="13" transform="rotate(15 72 712)"/>
    <ellipse cx="46" cy="738" rx="14" ry="19" fill="#84CC16"/>
    <ellipse cx="18" cy="726" rx="13" ry="18" fill="#A3E635"/>

    <path d="M1010 725 Q945 680 888 652" fill="none" stroke="#365314" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="960" cy="684" rx="34" ry="14" transform="rotate(32 960 684)"/>
    <ellipse cx="914" cy="660" rx="32" ry="13" transform="rotate(18 914 660)"/>
    <ellipse cx="928" cy="708" rx="32" ry="13" transform="rotate(-15 928 708)"/>
    <ellipse cx="952" cy="734" rx="14" ry="19" fill="#84CC16"/>
  </g>
</svg>`;
}

export function buildGoldenSunsetBackdropSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1500" width="1000" height="1500">
  <defs>
    <linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="35%" stop-color="#FBBF24"/>
      <stop offset="65%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <radialGradient id="gsun" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#FDE047" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FDE047" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1500" fill="url(#gsky)"/>
  <rect width="1000" height="1200" fill="url(#gsun)"/>
  <path d="M0 840 Q280 760 550 830 Q800 770 1000 820 L1000 1500 L0 1500 Z" fill="#B45309" opacity="0.65"/>
  <path d="M0 980 Q320 910 680 970 Q880 940 1000 960 L1000 1500 L0 1500 Z" fill="#78350F" opacity="0.85"/>
</svg>`;
}

export function buildSampleBookCoverSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900">
  <defs>
    <linearGradient id="covSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="55%" stop-color="#BAE6FD"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <linearGradient id="covHill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#A3E635"/>
      <stop offset="100%" stop-color="#4D7C0F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="900" fill="url(#covSky)"/>
  <circle cx="620" cy="460" r="120" fill="#FEF08A" opacity="0.7"/>
  <!-- Tree on Left -->
  <path d="M40 900 L65 440 L125 460 L110 900 Z" fill="#78350F"/>
  <circle cx="95" cy="280" r="175" fill="#4D7C0F"/>
  <circle cx="215" cy="340" r="115" fill="#65A30D"/>
  <circle cx="135" cy="210" r="130" fill="#84CC16"/>
  <!-- Hills -->
  <path d="M0 570 Q240 500 500 560 Q680 515 800 550 L800 900 L0 900 Z" fill="url(#covHill)"/>
  <!-- Cover Title -->
  <g text-anchor="middle" font-family="'Fredoka', 'Outfit', sans-serif" font-weight="700">
    <text x="430" y="135" font-size="92" fill="#FBBF24" stroke="#1C1917" stroke-width="14" paint-order="stroke">STORY</text>
    <text x="430" y="218" font-size="60" fill="#22D3EE" stroke="#1C1917" stroke-width="11" paint-order="stroke">COLORING</text>
    <text x="430" y="282" font-size="54" fill="#FB923C" stroke="#1C1917" stroke-width="10" paint-order="stroke">ADVENTURE</text>
  </g>
  <rect x="245" y="302" width="370" height="40" rx="20" fill="#FEF3C7" stroke="#78350F" stroke-width="3"/>
  <text x="430" y="328" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="20" font-weight="700" fill="#78350F">A Story Coloring Book for Kids</text>
  <!-- Cute Shepherd & Sheep Centerpiece -->
  <ellipse cx="425" cy="740" rx="115" ry="42" fill="#78716C"/>
  <!-- Little Sheep Left -->
  <g transform="translate(225 695)">
    <ellipse cx="0" cy="0" rx="52" ry="40" fill="#FEFCE8" stroke="#1C1917" stroke-width="4"/>
    <circle cx="42" cy="-16" r="24" fill="#FEF3C7" stroke="#1C1917" stroke-width="4"/>
    <circle cx="48" cy="-20" r="3.5" fill="#1C1917"/>
    <line x1="-22" y1="36" x2="-22" y2="62" stroke="#1C1917" stroke-width="6" stroke-linecap="round"/>
    <line x1="18" y1="36" x2="18" y2="62" stroke="#1C1917" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- Shepherd Character -->
  <g transform="translate(425 615)">
    <path d="M-45 20 L45 20 L55 125 L-55 125 Z" fill="#F5F5F4" stroke="#1C1917" stroke-width="4"/>
    <path d="M-38 20 L10 110 L-45 125 Z" fill="#0EA5E9" stroke="#1C1917" stroke-width="4"/>
    <circle cx="0" cy="-28" r="40" fill="#FDE68A" stroke="#1C1917" stroke-width="4"/>
    <path d="M-38 -36 Q0 -80 38 -36 Q28 -55 0 -55 Q-28 -55 -38 -36 Z" fill="#78350F" stroke="#1C1917" stroke-width="3"/>
    <circle cx="-13" cy="-28" r="4" fill="#1C1917"/>
    <circle cx="13" cy="-28" r="4" fill="#1C1917"/>
    <path d="M-10 -12 Q0 -3 10 -12" fill="none" stroke="#1C1917" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Harp -->
    <path d="M18 15 L52 -18 L52 75 L18 65 Z" fill="#D97706" stroke="#1C1917" stroke-width="4"/>
    <line x1="28" y1="10" x2="28" y2="63" stroke="#FEF3C7" stroke-width="2"/>
    <line x1="38" y1="0" x2="38" y2="68" stroke="#FEF3C7" stroke-width="2"/>
  </g>
  <!-- Little Sheep Right -->
  <g transform="translate(625 710)">
    <ellipse cx="0" cy="0" rx="54" ry="42" fill="#FEFCE8" stroke="#1C1917" stroke-width="4"/>
    <circle cx="-42" cy="-16" r="24" fill="#FEF3C7" stroke="#1C1917" stroke-width="4"/>
    <circle cx="-48" cy="-20" r="3.5" fill="#1C1917"/>
    <line x1="-18" y1="38" x2="-18" y2="64" stroke="#1C1917" stroke-width="6" stroke-linecap="round"/>
    <line x1="22" y1="38" x2="22" y2="64" stroke="#1C1917" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- Bottom Author Ribbon -->
  <rect x="240" y="815" width="320" height="44" rx="22" fill="#FEF3C7" stroke="#78350F" stroke-width="3"/>
  <text x="400" y="843" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="22" font-weight="700" fill="#451A03">GBTK STUDIO</text>
</svg>`;
}

export function buildSampleColoringCardSvg(variant: 0 | 1 | 2): string {
  if (variant === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="#FFFFFF"/>
      <g stroke="#111113" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="#FFFFFF">
        <path d="M40 480 Q180 450 320 475 Q460 450 560 480" fill="none"/>
        <ellipse cx="265" cy="445" rx="75" ry="26"/>
        <ellipse cx="265" cy="432" rx="60" ry="16"/>
        <!-- Character pouring -->
        <circle cx="185" cy="170" r="44"/>
        <path d="M148 225 L220 225 L235 390 L135 390 Z"/>
        <ellipse cx="242" cy="295" rx="34" ry="44" transform="rotate(35 242 295)"/>
        <path d="M268 320 Q278 370 265 425" fill="none" stroke-width="4"/>
        <path d="M282 325 Q292 370 278 425" fill="none" stroke-width="4"/>
        <!-- Sheep -->
        <ellipse cx="430" cy="310" rx="68" ry="52"/>
        <circle cx="365" cy="292" r="28"/>
        <ellipse cx="425" cy="420" rx="58" ry="40"/>
        <circle cx="365" cy="422" r="25"/>
      </g>
    </svg>`;
  }
  if (variant === 1) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <rect width="600" height="600" fill="#FFFFFF"/>
      <g stroke="#111113" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="#FFFFFF">
        <!-- Stream & Rocks -->
        <path d="M40 310 Q240 280 560 330" fill="none"/>
        <path d="M360 305 Q410 410 380 520" fill="none"/>
        <path d="M480 315 Q530 410 510 520" fill="none"/>
        <!-- Kneeling Character -->
        <circle cx="255" cy="175" r="44"/>
        <path d="M210 230 L295 230 L310 380 L195 380 Z"/>
        <path d="M295 265 L350 340 L330 358 L278 295 Z"/>
        <!-- Smooth Stones -->
        <ellipse cx="220" cy="465" rx="36" ry="22"/>
        <ellipse cx="305" cy="472" rx="40" ry="24"/>
        <ellipse cx="385" cy="445" rx="32" ry="20"/>
        <ellipse cx="455" cy="475" rx="34" ry="21"/>
        <ellipse cx="365" cy="348" rx="24" ry="15"/>
      </g>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <g stroke="#111113" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="#FFFFFF">
      <path d="M40 495 Q300 465 560 495" fill="none"/>
      <!-- Sling Arc -->
      <path d="M120 120 Q300 75 445 125" fill="none" stroke-width="4"/>
      <circle cx="385" cy="112" r="20"/>
      <path d="M150 185 Q240 135 380 125" fill="none" stroke-width="4"/>
      <!-- Action Pose Character -->
      <circle cx="275" cy="220" r="44"/>
      <path d="M235 275 L315 275 L325 395 L225 395 Z"/>
      <path d="M235 290 L155 190" fill="none" stroke-width="14"/>
      <path d="M315 290 L440 315" fill="none" stroke-width="14"/>
      <path d="M248 395 L185 485" fill="none" stroke-width="16"/>
      <path d="M302 395 L385 485" fill="none" stroke-width="16"/>
    </g>
  </svg>`;
}

export const SCENIC_BACKDROPS: ScenicBackdropPreset[] = [
  {
    id: "sunny-meadow",
    label: "Sunny Meadow",
    dataUrl: svgToDataUrl(buildSunnyMeadowBackdropSvg()),
  },
  {
    id: "golden-sunset",
    label: "Golden Sunset",
    dataUrl: svgToDataUrl(buildGoldenSunsetBackdropSvg()),
  },
];

export function buildBookPromoPosterTemplate(photos: PhotoItem[]): {
  aspectRatio: TextCanvasAspect;
  backdropDataUrl: string;
  imageLayers: TextStudioImageLayer[];
  textLayers: TextLayer[];
} {
  const coloringPhotos = photos.filter((p) => p.isColoringPage || p.kind === "coloring");
  const colorArtPhotos = photos.filter((p) => !p.isColoringPage && p.kind !== "coloring");

  const coverSrc =
    colorArtPhotos[0]?.dataUrl || photos[0]?.dataUrl || svgToDataUrl(buildSampleBookCoverSvg());
  const coverAspect =
    colorArtPhotos[0] && colorArtPhotos[0].height > 0
      ? colorArtPhotos[0].width / colorArtPhotos[0].height
      : 0.92;

  const getCardSrc = (idx: 0 | 1 | 2) => {
    const pick = coloringPhotos[idx] || photos[idx + 1];
    if (pick) {
      return {
        src: pick.dataUrl,
        aspect: pick.height > 0 ? pick.width / pick.height : 1,
        label: pick.title || `Design ${idx + 1}`,
      };
    }
    return {
      src: svgToDataUrl(buildSampleColoringCardSvg(idx)),
      aspect: 1,
      label: `Page ${idx + 1}`,
    };
  };

  const card1 = getCardSrc(0);
  const card2 = getCardSrc(1);
  const card3 = getCardSrc(2);

  const now = Date.now();

  const imageLayers: TextStudioImageLayer[] = [
    {
      id: `img-cover-${now}`,
      label: "Book Cover 3D",
      src: coverSrc,
      x: 50,
      y: 39,
      widthPct: 60,
      aspectRatio: Math.max(0.65, Math.min(1.2, coverAspect)),
      rotation: 0,
      opacity: 1,
      frameStyle: "book-cover",
      badgeText: "40\nDESIGNS",
    },
    {
      id: `img-card-1-${now}`,
      label: card1.label,
      src: card1.src,
      x: 19.5,
      y: 68.5,
      widthPct: 28,
      aspectRatio: Math.max(0.7, Math.min(1.2, card1.aspect)),
      rotation: -4,
      opacity: 1,
      frameStyle: "tilt-card",
      caption: "Page 01 · Bold Line Art",
    },
    {
      id: `img-card-2-${now}`,
      label: card2.label,
      src: card2.src,
      x: 50,
      y: 68,
      widthPct: 28,
      aspectRatio: Math.max(0.7, Math.min(1.2, card2.aspect)),
      rotation: 0,
      opacity: 1,
      frameStyle: "tilt-card",
      caption: "Page 02 · Easy Coloring",
    },
    {
      id: `img-card-3-${now}`,
      label: card3.label,
      src: card3.src,
      x: 80.5,
      y: 68.5,
      widthPct: 28,
      aspectRatio: Math.max(0.7, Math.min(1.2, card3.aspect)),
      rotation: 4,
      opacity: 1,
      frameStyle: "tilt-card",
      caption: "Page 03 · 300+ DPI Print",
    },
  ];

  const textLayers: TextLayer[] = [
    {
      id: `txt-head1-${now}`,
      text: "A LITTLE SHEPHERD.",
      x: 50,
      y: 7.5,
      fontSize: 70,
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      fontWeight: "700",
      color: "#FBBF24",
      accentColor: "#F59E0B",
      bgColor: "#111113",
      strokeColor: "#1C1917",
      strokeWidth: 10,
      curve: 14,
      stylePreset: "comic-3d",
      align: "center",
      rotation: 0,
      letterSpacing: 1,
      opacity: 1,
    },
    {
      id: `txt-head2-${now}`,
      text: "A BIG STORY.",
      x: 50,
      y: 14.2,
      fontSize: 82,
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      fontWeight: "700",
      color: "#22D3EE",
      accentColor: "#06B6D4",
      bgColor: "#111113",
      strokeColor: "#0F172A",
      strokeWidth: 11,
      curve: 0,
      stylePreset: "comic-3d",
      align: "center",
      rotation: 0,
      letterSpacing: 2,
      opacity: 1,
    },
    {
      id: `txt-banner-${now}`,
      text: "40 Bold & Easy Coloring Designs",
      x: 50,
      y: 83.2,
      fontSize: 38,
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      fontWeight: "700",
      color: "#FDE047",
      accentColor: "#F59E0B",
      bgColor: "#0E525E",
      strokeColor: "#FBBF24",
      strokeWidth: 4,
      curve: 0,
      stylePreset: "banner-pill",
      align: "center",
      rotation: 0,
      letterSpacing: 0.5,
      opacity: 1,
    },
    {
      id: `txt-ribbon-${now}`,
      text: "Courage • Kindness • Faith",
      x: 50,
      y: 89.2,
      fontSize: 32,
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      fontWeight: "700",
      color: "#451A03",
      accentColor: "#D97706",
      bgColor: "#FEF3C7",
      strokeColor: "#D97706",
      strokeWidth: 3,
      curve: 0,
      stylePreset: "ribbon-scroll",
      align: "center",
      rotation: 0,
      letterSpacing: 0.5,
      opacity: 1,
    },
    {
      id: `txt-footer-${now}`,
      text: "GBTK STUDIO",
      x: 50,
      y: 95,
      fontSize: 28,
      fontFamily: "'Outfit', 'Padauk', sans-serif",
      fontWeight: "700",
      color: "#FFFFFF",
      accentColor: "#FEF3C7",
      bgColor: "#0F766E",
      strokeColor: "#FFFFFF",
      strokeWidth: 3,
      curve: 0,
      stylePreset: "banner-pill",
      align: "center",
      rotation: 0,
      letterSpacing: 0.5,
      opacity: 1,
    },
  ];

  return {
    aspectRatio: "2:3",
    backdropDataUrl: SCENIC_BACKDROPS[0].dataUrl,
    imageLayers,
    textLayers,
  };
}
