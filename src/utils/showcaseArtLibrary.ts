import { ShowcaseCardSlot, ShowcaseDesignConfig } from "../types/studio";
import { BOOK_MOCKUP_THUMB_URLS, FLAT_LAY_THUMB_URLS } from "./flatLayAssets";
import { svgToDataUrl } from "./stickerLibrary";

// ---------------------------------------------------------------------------
// 1. Handprint Craft Card SVGs (Inspired by Festive Keepsake Craft Pin)
// ---------------------------------------------------------------------------

function reindeerKraftSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#C9A37E"/>
  <g stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.72">
    <path d="M70 70 v32 M54 86 h32 M58 74 l24 24 M82 74 l-24 24"/>
    <path d="M415 110 v32 M399 126 h32 M403 114 l24 24 M427 114 l-24 24"/>
    <path d="M90 545 v28 M76 559 h28 M80 549 l20 20 M100 549 l-20 20"/>
    <path d="M420 515 v30 M405 530 h30 M409 519 l22 22 M431 519 l-22 22"/>
    <circle cx="150" cy="45" r="3" fill="#FFF"/><circle cx="350" cy="60" r="3" fill="#FFF"/>
    <circle cx="55" cy="360" r="3" fill="#FFF"/><circle cx="445" cy="320" r="3" fill="#FFF"/>
  </g>
  <!-- Handprint Antlers + Face -->
  <g fill="#6D381E">
    <rect x="115" y="165" width="38" height="145" rx="19" transform="rotate(-24 134 235)"/>
    <rect x="180" y="102" width="40" height="165" rx="20" transform="rotate(-10 200 185)"/>
    <rect x="242" y="90" width="42" height="175" rx="21"/>
    <rect x="304" y="114" width="40" height="158" rx="20" transform="rotate(11 324 190)"/>
    <rect x="358" y="218" width="36" height="132" rx="18" transform="rotate(34 376 284)"/>
    <ellipse cx="250" cy="342" rx="115" ry="102"/>
  </g>
  <!-- Googly Eyes -->
  <circle cx="206" cy="296" r="23" fill="#FFFFFF" stroke="#451A03" stroke-width="2"/>
  <circle cx="210" cy="300" r="11" fill="#111113"/>
  <circle cx="292" cy="296" r="23" fill="#FFFFFF" stroke="#451A03" stroke-width="2"/>
  <circle cx="288" cy="300" r="11" fill="#111113"/>
  <!-- Red Pom-Pom Nose & Smile -->
  <circle cx="250" cy="348" r="29" fill="#DC2626"/>
  <circle cx="241" cy="338" r="8" fill="#FCA5A5" opacity="0.7"/>
  <path d="M210 388 Q250 422 290 388" fill="none" stroke="#1F1209" stroke-width="6" stroke-linecap="round"/>
  <!-- Red-White Twine Bow + Gold Bell -->
  <g transform="translate(250 482)">
    <path d="M0 0 C-58 -36 -82 8 -20 12 Z" fill="none" stroke="#B91C1C" stroke-width="11" stroke-linejoin="round"/>
    <path d="M0 0 C-58 -36 -82 8 -20 12 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="10 10"/>
    <path d="M0 0 C58 -36 82 8 20 12 Z" fill="none" stroke="#B91C1C" stroke-width="11" stroke-linejoin="round"/>
    <path d="M0 0 C58 -36 82 8 20 12 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="10 10"/>
    <path d="M-8 6 L-46 68 M8 6 L46 68" stroke="#B91C1C" stroke-width="8" stroke-linecap="round"/>
    <path d="M-8 6 L-46 68 M8 6 L46 68" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="8 8" stroke-linecap="round"/>
    <circle cx="0" cy="18" r="16" fill="#FBBF24" stroke="#92400E" stroke-width="3"/>
    <circle cx="-5" cy="13" r="4" fill="#FEF9C3"/>
  </g>
</svg>`;
}

function treeHandprintWhiteSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#FAF8F4"/>
  <!-- Gold Stars -->
  <g stroke="#CA8A04" stroke-width="3.5" stroke-linecap="round">
    <path d="M88 145 v28 M74 159 h28 M78 149 l20 20 M98 149 l-20 20"/>
    <path d="M402 155 v28 M388 169 h28 M392 159 l20 20 M412 159 l-20 20"/>
    <path d="M90 505 v26 M77 518 h26 M81 509 l18 18 M99 509 l-18 18"/>
    <path d="M406 498 v26 M393 511 h26 M397 502 l18 18 M415 502 l-18 18"/>
  </g>
  <!-- Trunk -->
  <rect x="220" y="505" width="60" height="82" rx="8" fill="#7C4A26"/>
  <!-- Upside-Down Green Handprint Tree -->
  <g fill="#16A34A">
    <ellipse cx="250" cy="300" rx="108" ry="125"/>
    <rect x="108" y="348" width="38" height="150" rx="19" transform="rotate(24 127 423)"/>
    <rect x="172" y="370" width="40" height="160" rx="20" transform="rotate(10 192 450)"/>
    <rect x="230" y="382" width="42" height="162" rx="21"/>
    <rect x="292" y="370" width="40" height="158" rx="20" transform="rotate(-10 312 448)"/>
    <rect x="355" y="346" width="38" height="145" rx="19" transform="rotate(-24 374 418)"/>
  </g>
  <!-- Pom-Pom Ornaments -->
  <circle cx="250" cy="235" r="18" fill="#EF4444"/>
  <circle cx="204" cy="295" r="17" fill="#FACC15"/>
  <circle cx="302" cy="302" r="18" fill="#38BDF8"/>
  <circle cx="255" cy="355" r="17" fill="#EC4899"/>
  <circle cx="176" cy="402" r="17" fill="#10B981"/>
  <circle cx="322" cy="410" r="17" fill="#EF4444"/>
  <circle cx="248" cy="455" r="17" fill="#FACC15"/>
  <!-- Gold Glitter Star -->
  <polygon points="250,76 266,118 310,120 275,148 288,192 250,166 212,192 225,148 190,120 234,118" fill="#FBBF24" stroke="#D97706" stroke-width="4"/>
</svg>`;
}

function twinReindeerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#FCFBF8"/>
  <!-- Hearts -->
  <path d="M250 185 C250 150 202 145 202 182 C202 214 250 245 250 245 C250 245 298 214 298 182 C298 145 250 150 250 185 Z" fill="none" stroke="#EF4444" stroke-width="6"/>
  <path d="M210 278 C210 264 190 262 190 278 C190 290 210 302 210 302 C210 302 230 290 230 278 C230 262 210 264 210 278 Z" fill="#EF4444"/>
  <path d="M292 292 C292 280 276 278 276 292 C276 302 292 312 292 312 C292 312 308 302 308 292 C308 278 292 280 292 292 Z" fill="#EF4444"/>
  <!-- Left Handprint Reindeer -->
  <g transform="translate(135 420)">
    <g fill="#854D27">
      <rect x="-118" y="-58" width="24" height="92" rx="12" transform="rotate(-68 -106 -12)"/>
      <rect x="-118" y="-12" width="24" height="92" rx="12" transform="rotate(-86 -106 34)"/>
      <rect x="-108" y="32" width="24" height="88" rx="12" transform="rotate(-108 -96 76)"/>
      <ellipse cx="0" cy="25" rx="68" ry="52"/>
      <ellipse cx="52" cy="-35" rx="34" ry="30"/>
    </g>
    <path d="M35 -60 L20 -115 M27 -88 L8 -96 M55 -62 L58 -118 M56 -88 L75 -98" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
    <circle cx="54" cy="-38" r="13" fill="#FFF"/><circle cx="58" cy="-38" r="6" fill="#111"/>
    <circle cx="84" cy="-26" r="11" fill="#DC2626"/>
    <path d="M-28 70 L-32 135 M-4 72 L-4 135 M22 72 L24 135 M44 68 L50 135" stroke="#292524" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- Right Handprint Reindeer -->
  <g transform="translate(365 420) scale(-1 1)">
    <g fill="#854D27">
      <rect x="-118" y="-58" width="24" height="92" rx="12" transform="rotate(-68 -106 -12)"/>
      <rect x="-118" y="-12" width="24" height="92" rx="12" transform="rotate(-86 -106 34)"/>
      <rect x="-108" y="32" width="24" height="88" rx="12" transform="rotate(-108 -96 76)"/>
      <ellipse cx="0" cy="25" rx="68" ry="52"/>
      <ellipse cx="52" cy="-35" rx="34" ry="30"/>
    </g>
    <path d="M35 -60 L20 -115 M27 -88 L8 -96 M55 -62 L58 -118 M56 -88 L75 -98" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
    <circle cx="54" cy="-38" r="13" fill="#FFF"/><circle cx="58" cy="-38" r="6" fill="#111"/>
    <circle cx="84" cy="-26" r="11" fill="#DC2626"/>
    <path d="M-28 70 L-32 135 M-4 72 L-4 135 M22 72 L24 135 M44 68 L50 135" stroke="#292524" stroke-width="6" stroke-linecap="round"/>
  </g>
</svg>`;
}

function santaHandprintKraftSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#CCA882"/>
  <g stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.65">
    <path d="M72 185 v24 M60 197 h24 M64 189 l16 16 M80 189 l-16 16"/>
    <path d="M425 235 v26 M412 248 h26 M416 239 l18 18 M434 239 l-18 18"/>
  </g>
  <!-- Red Handprint Suit & Hat -->
  <g fill="#DC2626">
    <path d="M162 245 Q245 78 345 142 Q325 225 320 265 Z"/>
    <ellipse cx="248" cy="395" rx="102" ry="88"/>
    <rect x="132" y="425" width="38" height="145" rx="19" transform="rotate(14 151 497)"/>
    <rect x="195" y="445" width="40" height="155" rx="20"/>
    <rect x="258" y="448" width="40" height="155" rx="20"/>
    <rect x="318" y="428" width="38" height="142" rx="19" transform="rotate(-14 337 499)"/>
  </g>
  <!-- Hat Pom-Pom -->
  <circle cx="352" cy="145" r="28" fill="#FFFFFF"/>
  <!-- Face -->
  <ellipse cx="248" cy="296" rx="68" ry="52" fill="#FDE68A"/>
  <!-- Googly Eyes & Red Nose -->
  <circle cx="220" cy="285" r="16" fill="#FFF" stroke="#444" stroke-width="2"/>
  <circle cx="222" cy="287" r="7" fill="#111"/>
  <circle cx="276" cy="285" r="16" fill="#FFF" stroke="#444" stroke-width="2"/>
  <circle cx="274" cy="287" r="7" fill="#111"/>
  <circle cx="248" cy="316" r="16" fill="#EF4444"/>
  <!-- Cotton Trim & Fluffy Beard -->
  <g fill="#FFFFFF">
    <circle cx="168" cy="248" r="24"/><circle cx="204" cy="240" r="25"/><circle cx="248" cy="236" r="26"/>
    <circle cx="292" cy="240" r="25"/><circle cx="328" cy="248" r="24"/>
    <circle cx="152" cy="322" r="28"/><circle cx="176" cy="368" r="32"/><circle cx="212" cy="398" r="34"/>
    <circle cx="250" cy="408" r="36"/><circle cx="288" cy="398" r="34"/><circle cx="324" cy="368" r="32"/>
    <circle cx="346" cy="322" r="28"/><circle cx="218" cy="352" r="26"/><circle cx="278" cy="352" r="26"/>
  </g>
</svg>`;
}

function snowmanHandprintBlueSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#7AA1C7"/>
  <g stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.78">
    <path d="M85 110 v28 M71 124 h28 M75 114 l20 20 M95 114 l-20 20"/>
    <path d="M405 140 v32 M389 156 h32 M393 144 l24 24 M417 144 l-24 24"/>
    <path d="M412 410 v28 M398 424 h28 M402 414 l20 20 M422 414 l-20 20"/>
    <path d="M82 475 v26 M69 488 h26 M73 479 l18 18 M91 479 l-18 18"/>
  </g>
  <!-- White Handprint Body -->
  <g fill="#F8FAFC">
    <ellipse cx="250" cy="290" rx="82" ry="74"/>
    <ellipse cx="250" cy="400" rx="102" ry="88"/>
    <rect x="132" y="428" width="38" height="145" rx="19" transform="rotate(14 151 500)"/>
    <rect x="195" y="446" width="40" height="156" rx="20"/>
    <rect x="260" y="446" width="40" height="156" rx="20"/>
    <rect x="322" y="426" width="38" height="145" rx="19" transform="rotate(-14 341 498)"/>
  </g>
  <!-- Top Hat -->
  <rect x="164" y="198" width="172" height="26" rx="8" fill="#18181B"/>
  <rect x="190" y="96" width="120" height="110" rx="8" fill="#18181B"/>
  <rect x="190" y="176" width="120" height="22" fill="#DC2626"/>
  <!-- Eyes, Carrot Nose & Smile -->
  <circle cx="224" cy="264" r="15" fill="#FFF" stroke="#334155" stroke-width="2"/><circle cx="226" cy="266" r="7" fill="#111"/>
  <circle cx="276" cy="264" r="15" fill="#FFF" stroke="#334155" stroke-width="2"/><circle cx="274" cy="266" r="7" fill="#111"/>
  <polygon points="248,284 316,298 248,310" fill="#F97316"/>
  <g fill="#18181B">
    <circle cx="222" cy="322" r="4"/><circle cx="236" cy="330" r="4"/><circle cx="252" cy="332" r="4"/>
    <circle cx="268" cy="328" r="4"/><circle cx="280" cy="320" r="4"/>
  </g>
  <!-- Polka-Dot Red Scarf -->
  <path d="M168 348 Q250 374 334 348 L342 384 Q250 408 162 382 Z" fill="#DC2626"/>
  <path d="M292 368 L372 442 L346 462 L272 386 Z" fill="#DC2626"/>
  <g fill="#FFFFFF" opacity="0.88">
    <circle cx="195" cy="368" r="5"/><circle cx="232" cy="378" r="5"/><circle cx="272" cy="378" r="5"/><circle cx="312" cy="366" r="5"/>
  </g>
  <!-- Buttons -->
  <circle cx="250" cy="415" r="11" fill="#18181B"/>
  <circle cx="250" cy="450" r="11" fill="#18181B"/>
  <circle cx="250" cy="485" r="11" fill="#18181B"/>
</svg>`;
}

function penguinHandprintSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680">
  <rect width="500" height="680" fill="#F9F8F5"/>
  <g stroke="#3B82F6" stroke-width="3" stroke-linecap="round" opacity="0.72">
    <path d="M78 240 v30 M63 255 h30 M68 245 l20 20 M88 245 l-20 20"/>
    <path d="M412 200 v30 M397 215 h30 M402 205 l20 20 M422 205 l-20 20"/>
    <path d="M84 480 v28 M70 494 h28 M74 484 l20 20 M94 484 l-20 20"/>
  </g>
  <!-- Orange Feet -->
  <ellipse cx="212" cy="566" rx="34" ry="18" fill="#F97316"/>
  <ellipse cx="290" cy="566" rx="34" ry="18" fill="#F97316"/>
  <!-- Black Handprint Body -->
  <g fill="#18181B">
    <ellipse cx="250" cy="375" rx="95" ry="118"/>
    <circle cx="250" cy="245" r="78"/>
    <rect x="96" y="345" width="38" height="142" rx="19" transform="rotate(26 115 416)"/>
    <rect x="366" y="345" width="38" height="142" rx="19" transform="rotate(-26 385 416)"/>
    <rect x="192" y="458" width="36" height="106" rx="18"/>
    <rect x="272" y="458" width="36" height="106" rx="18"/>
  </g>
  <!-- White Belly -->
  <ellipse cx="250" cy="395" rx="64" ry="86" fill="#FFFFFF"/>
  <!-- Red Knit Beanie -->
  <circle cx="250" cy="112" r="24" fill="#DC2626"/>
  <path d="M174 205 Q182 122 250 122 Q318 122 326 205 Z" fill="#DC2626"/>
  <rect x="166" y="188" width="168" height="28" rx="14" fill="#B91C1C"/>
  <!-- Eyes & Orange Beak -->
  <circle cx="222" cy="248" r="18" fill="#FFF"/><circle cx="224" cy="250" r="8" fill="#111"/>
  <circle cx="278" cy="248" r="18" fill="#FFF"/><circle cx="276" cy="250" r="8" fill="#111"/>
  <polygon points="228,274 272,274 250,316" fill="#F97316"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Hand-Colored Festive Coloring Page SVGs (Inspired by Coloring Pin)
// ---------------------------------------------------------------------------

function santaColoringSheetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
  <rect width="500" height="640" fill="#FFFFFF"/>
  <!-- Stars & Trees Background -->
  <g stroke="#111113" stroke-width="3.5" fill="#FEF08A">
    <polygon points="90,85 98,105 118,107 102,120 107,140 90,128 73,140 78,120 62,107 82,105"/>
    <polygon points="415,110 422,126 438,128 426,138 430,154 415,144 400,154 404,138 392,128 408,126"/>
  </g>
  <g stroke="#111113" stroke-width="3" fill="none">
    <polygon points="70,380 110,290 150,380"/>
    <polygon points="360,360 405,270 450,360"/>
  </g>
  <!-- Santa Claus -->
  <g stroke="#111113" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M160 185 Q245 70 345 128 Q325 180 315 215 Z" fill="#EF4444"/>
    <circle cx="355" cy="135" r="22" fill="#FFFFFF"/>
    <rect x="165" y="192" width="165" height="32" rx="16" fill="#FFFFFF"/>
    <circle cx="248" cy="252" r="56" fill="#FDE68A"/>
    <path d="M190 268 Q180 345 248 355 Q316 345 306 268 Q278 292 248 292 Q218 292 190 268 Z" fill="#FFFFFF"/>
    <circle cx="228" cy="245" r="5" fill="#111113"/>
    <circle cx="268" cy="245" r="5" fill="#111113"/>
    <circle cx="248" cy="264" r="10" fill="#FCA5A5"/>
    <!-- Coat -->
    <path d="M150 330 L345 330 L372 495 L125 495 Z" fill="#EF4444"/>
    <rect x="142" y="425" width="212" height="30" fill="#27272A"/>
    <rect x="226" y="418" width="44" height="44" rx="6" fill="#FBBF24"/>
    <!-- Boots -->
    <rect x="168" y="495" width="56" height="65" rx="12" fill="#27272A"/>
    <rect x="274" y="495" width="56" height="65" rx="12" fill="#27272A"/>
    <!-- Gift Box -->
    <rect x="85" y="340" width="95" height="82" rx="6" fill="#22C55E"/>
    <rect x="122" y="340" width="20" height="82" fill="#EF4444"/>
    <rect x="85" y="370" width="95" height="20" fill="#EF4444"/>
  </g>
</svg>`;
}

function snowmanColoringSheetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
  <rect width="500" height="640" fill="#FFFFFF"/>
  <!-- Snowflakes -->
  <g stroke="#111113" stroke-width="3" stroke-linecap="round">
    <path d="M90 120 v40 M70 140 h40 M76 126 l28 28 M104 126 l-28 28"/>
    <path d="M400 115 v40 M380 135 h40 M386 121 l28 28 M414 121 l-28 28"/>
  </g>
  <g stroke="#111113" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <!-- Stick Arms -->
    <path d="M155 375 L72 325 M95 340 L76 310" fill="none"/>
    <path d="M345 375 L428 325 M405 340 L424 310" fill="none"/>
    <!-- Snowman Circles -->
    <circle cx="250" cy="468" r="118" fill="#FFFFFF"/>
    <circle cx="250" cy="318" r="88" fill="#FFFFFF"/>
    <circle cx="250" cy="196" r="66" fill="#FFFFFF"/>
    <!-- Hat -->
    <rect x="164" y="138" width="172" height="24" rx="8" fill="#3F3F46"/>
    <rect x="192" y="56" width="116" height="84" rx="6" fill="#3F3F46"/>
    <rect x="192" y="114" width="116" height="22" fill="#EF4444"/>
    <!-- Face -->
    <circle cx="228" cy="184" r="6" fill="#111113"/>
    <circle cx="272" cy="184" r="6" fill="#111113"/>
    <polygon points="248,198 312,210 248,220" fill="#F97316"/>
    <!-- Striped Scarf -->
    <path d="M175 244 Q250 268 325 244 L334 282 Q250 304 168 280 Z" fill="#16A34A"/>
    <path d="M278 272 L345 360 L306 376 L248 286 Z" fill="#EF4444"/>
    <circle cx="250" cy="340" r="8" fill="#111113"/>
    <circle cx="250" cy="378" r="8" fill="#111113"/>
    <circle cx="250" cy="450" r="8" fill="#111113"/>
  </g>
</svg>`;
}

function treeColoringSheetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
  <rect width="500" height="640" fill="#FFFFFF"/>
  <g stroke="#111113" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="218" y="455" width="64" height="65" fill="#92400E"/>
    <polygon points="85,465 250,260 415,465" fill="#22C55E"/>
    <polygon points="118,350 250,175 382,350" fill="#22C55E"/>
    <polygon points="155,235 250,100 345,235" fill="#22C55E"/>
    <polygon points="250,42 264,78 302,80 272,102 282,138 250,116 218,138 228,102 198,80 236,78" fill="#FACC15"/>
    <!-- Ornaments -->
    <circle cx="250" cy="185" r="14" fill="#EF4444"/>
    <circle cx="205" cy="278" r="15" fill="#38BDF8"/>
    <circle cx="296" cy="284" r="15" fill="#FACC15"/>
    <circle cx="170" cy="400" r="16" fill="#EF4444"/>
    <circle cx="252" cy="382" r="16" fill="#F472B6"/>
    <circle cx="334" cy="412" r="16" fill="#FACC15"/>
    <!-- Gifts -->
    <rect x="92" y="485" width="90" height="75" rx="6" fill="#EF4444"/>
    <rect x="128" y="485" width="18" height="75" fill="#FACC15"/>
    <rect x="315" y="476" width="95" height="84" rx="6" fill="#3B82F6"/>
    <rect x="352" y="476" width="18" height="84" fill="#EF4444"/>
  </g>
</svg>`;
}

function reindeerColoringSheetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
  <rect width="500" height="640" fill="#FFFFFF"/>
  <g stroke="#111113" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <!-- Antlers -->
    <path d="M196 168 L145 80 M170 124 L132 115 M182 145 L195 92" fill="none" stroke-width="8"/>
    <path d="M304 168 L355 80 M330 124 L368 115 M318 145 L305 92" fill="none" stroke-width="8"/>
    <!-- Body -->
    <ellipse cx="250" cy="442" rx="95" ry="110" fill="#D99B66"/>
    <ellipse cx="250" cy="455" rx="55" ry="72" fill="#FEF3C7"/>
    <!-- Scarf -->
    <path d="M175 322 Q250 352 325 322 L332 365 Q250 392 168 365 Z" fill="#16A34A"/>
    <rect x="195" y="332" width="24" height="38" fill="#EF4444"/>
    <rect x="275" y="332" width="24" height="38" fill="#EF4444"/>
    <!-- Head -->
    <ellipse cx="250" cy="242" rx="92" ry="82" fill="#D99B66"/>
    <ellipse cx="152" cy="198" rx="34" ry="16" transform="rotate(-24 152 198)" fill="#D99B66"/>
    <ellipse cx="348" cy="198" rx="34" ry="16" transform="rotate(24 348 198)" fill="#D99B66"/>
    <ellipse cx="250" cy="272" rx="52" ry="38" fill="#FEF3C7"/>
    <circle cx="212" cy="222" r="9" fill="#111113"/>
    <circle cx="288" cy="222" r="9" fill="#111113"/>
    <circle cx="250" cy="264" r="18" fill="#EF4444"/>
    <path d="M232 292 Q250 306 268 292" fill="none"/>
  </g>
</svg>`;
}

function gingerbreadColoringSheetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
  <rect width="500" height="640" fill="#FFFFFF"/>
  <g stroke="#111113" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="335" y="135" width="46" height="82" fill="#EF4444"/>
    <rect x="105" y="300" width="290" height="235" fill="#D99B66"/>
    <polygon points="65,315 250,150 435,315" fill="#FFFFFF"/>
    <path d="M85 315 Q125 348 165 315 Q205 348 250 315 Q295 348 335 315 Q375 348 415 315" fill="#FFFFFF"/>
    <!-- Round Candy Window -->
    <circle cx="250" cy="252" r="36" fill="#EF4444"/>
    <circle cx="250" cy="252" r="20" fill="#FFFFFF"/>
    <!-- Door -->
    <path d="M205 535 L205 405 Q250 365 295 405 L295 535 Z" fill="#92400E"/>
    <circle cx="276" cy="472" r="7" fill="#FACC15"/>
    <!-- Side Windows -->
    <rect x="132" y="395" width="52" height="52" rx="6" fill="#FEF08A"/>
    <rect x="316" y="395" width="52" height="52" rx="6" fill="#FEF08A"/>
    <!-- Gumdrops -->
    <circle cx="145" cy="525" r="18" fill="#22C55E"/>
    <circle cx="355" cy="525" r="18" fill="#EC4899"/>
    <circle cx="185" cy="340" r="14" fill="#EF4444"/>
    <circle cx="315" cy="340" r="14" fill="#38BDF8"/>
  </g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Cute Animal & Botanical Pack SVGs
// ---------------------------------------------------------------------------

function cuteAnimalCardSvg(kind: "dino" | "bunny" | "lion" | "whale" | "rainbow" | "butterfly"): string {
  switch (kind) {
    case "dino":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#ECFDF5"/>
        <g stroke="#14532D" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M165 210 L145 170 L195 190 L225 145 L250 185 L295 160 L300 205" fill="#FACC15"/>
          <ellipse cx="255" cy="375" rx="115" ry="95" fill="#22C55E"/>
          <circle cx="220" cy="230" r="72" fill="#22C55E"/>
          <rect x="175" y="438" width="42" height="82" rx="14" fill="#22C55E"/>
          <rect x="275" y="438" width="42" height="82" rx="14" fill="#22C55E"/>
          <ellipse cx="258" cy="395" rx="65" ry="58" fill="#BBF7D0"/>
          <circle cx="202" cy="218" r="8" fill="#111113"/>
          <path d="M185 252 Q212 272 242 252" fill="none"/>
        </g>
      </svg>`;
    case "bunny":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FFF1F2"/>
        <g stroke="#4C0519" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="195" cy="170" rx="28" ry="88" transform="rotate(-10 195 170)" fill="#FFFFFF"/>
          <ellipse cx="305" cy="170" rx="28" ry="88" transform="rotate(10 305 170)" fill="#FFFFFF"/>
          <ellipse cx="195" cy="178" rx="14" ry="56" transform="rotate(-10 195 178)" fill="#FDA4AF"/>
          <ellipse cx="305" cy="178" rx="14" ry="56" transform="rotate(10 305 178)" fill="#FDA4AF"/>
          <ellipse cx="250" cy="435" rx="88" ry="95" fill="#FFFFFF"/>
          <circle cx="250" cy="292" r="82" fill="#FFFFFF"/>
          <circle cx="220" cy="282" r="8" fill="#111113"/>
          <circle cx="280" cy="282" r="8" fill="#111113"/>
          <ellipse cx="250" cy="306" rx="12" ry="9" fill="#FB7185"/>
        </g>
      </svg>`;
    case "lion":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FEFCE8"/>
        <g stroke="#451A03" stroke-width="5" stroke-linejoin="round">
          <circle cx="250" cy="278" r="128" fill="#EA580C"/>
          <ellipse cx="250" cy="462" rx="82" ry="88" fill="#FBBF24"/>
          <circle cx="250" cy="278" r="86" fill="#FBBF24"/>
          <circle cx="222" cy="264" r="8" fill="#111113"/>
          <circle cx="278" cy="264" r="8" fill="#111113"/>
          <polygon points="236,288 264,288 250,306" fill="#451A03"/>
        </g>
      </svg>`;
    case "whale":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#EFF6FF"/>
        <g stroke="#1E3A8A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M250 185 Q225 110 185 130 M250 185 Q275 110 315 130" fill="none" stroke="#38BDF8" stroke-width="8"/>
          <ellipse cx="245" cy="335" rx="135" ry="92" fill="#38BDF8"/>
          <path d="M365 335 Q435 280 452 320 Q430 350 380 355 Q430 380 440 415 Q395 415 365 365 Z" fill="#38BDF8"/>
          <ellipse cx="235" cy="378" rx="95" ry="42" fill="#E0F2FE"/>
          <circle cx="178" cy="322" r="8" fill="#111113"/>
        </g>
      </svg>`;
    case "rainbow":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#F0F9FF"/>
        <g fill="none" stroke-width="26" stroke-linecap="round">
          <path d="M90 380 A160 160 0 0 1 410 380" stroke="#EF4444"/>
          <path d="M116 380 A134 134 0 0 1 384 380" stroke="#FBBF24"/>
          <path d="M142 380 A108 108 0 0 1 358 380" stroke="#22C55E"/>
          <path d="M168 380 A82 82 0 0 1 332 380" stroke="#3B82F6"/>
        </g>
        <g fill="#FFFFFF" stroke="#0284C7" stroke-width="4">
          <circle cx="115" cy="395" r="42"/><circle cx="155" cy="385" r="36"/><circle cx="78" cy="402" r="32"/>
          <circle cx="385" cy="395" r="42"/><circle cx="345" cy="385" r="36"/><circle cx="422" cy="402" r="32"/>
        </g>
      </svg>`;
    case "butterfly":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FAF5FF"/>
        <g stroke="#581C87" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="165" cy="255" rx="92" ry="72" transform="rotate(-18 165 255)" fill="#F472B6"/>
          <ellipse cx="335" cy="255" rx="92" ry="72" transform="rotate(18 335 255)" fill="#F472B6"/>
          <ellipse cx="180" cy="385" rx="70" ry="56" transform="rotate(16 180 385)" fill="#C084FC"/>
          <ellipse cx="320" cy="385" rx="70" ry="56" transform="rotate(-16 320 385)" fill="#C084FC"/>
          <circle cx="155" cy="245" r="26" fill="#FEF08A"/>
          <circle cx="345" cy="245" r="26" fill="#FEF08A"/>
          <ellipse cx="250" cy="330" rx="18" ry="96" fill="#4C1D95"/>
        </g>
      </svg>`;
  }
}

// ---------------------------------------------------------------------------
// 4. Space, Rockets & Vehicles Pack SVGs
// ---------------------------------------------------------------------------

function spaceCardSvg(kind: "rocket" | "saturn" | "robot" | "firetruck" | "astronaut" | "ufo"): string {
  switch (kind) {
    case "rocket":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#1E1B4B"/>
        <g fill="#FEF08A">
          <circle cx="95" cy="110" r="6"/><circle cx="405" cy="145" r="7"/><circle cx="120" cy="480" r="5"/><circle cx="410" cy="450" r="6"/>
          <polygon points="390,78 396,94 412,96 400,106 403,122 390,113 377,122 380,106 368,96 384,94"/>
        </g>
        <!-- Flame -->
        <path d="M210 435 Q250 565 290 435 Z" fill="#F97316"/>
        <path d="M225 435 Q250 520 275 435 Z" fill="#FACC15"/>
        <!-- Fins -->
        <path d="M180 355 L125 430 L185 415 Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
        <path d="M320 355 L375 430 L315 415 Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
        <!-- Rocket Body -->
        <path d="M250 110 Q340 210 322 430 L178 430 Q160 210 250 110 Z" fill="#F8FAFC" stroke="#FFFFFF" stroke-width="5"/>
        <path d="M250 110 Q292 158 308 210 L192 210 Q208 158 250 110 Z" fill="#EF4444"/>
        <circle cx="250" cy="295" r="46" fill="#38BDF8" stroke="#0F172A" stroke-width="8"/>
        <circle cx="236" cy="280" r="14" fill="#E0F2FE" opacity="0.8"/>
      </svg>`;
    case "saturn":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#0F172A"/>
        <g fill="#E0F2FE" opacity="0.85">
          <circle cx="80" cy="95" r="5"/><circle cx="380" cy="110" r="6"/><circle cx="105" cy="520" r="5"/><circle cx="420" cy="505" r="7"/>
        </g>
        <ellipse cx="250" cy="325" rx="198" ry="52" transform="rotate(-18 250 325)" fill="none" stroke="#38BDF8" stroke-width="26"/>
        <circle cx="250" cy="320" r="112" fill="#F59E0B" stroke="#FEF3C7" stroke-width="6"/>
        <path d="M150 285 Q250 315 350 285" fill="none" stroke="#FDE047" stroke-width="14" stroke-linecap="round"/>
        <path d="M148 345 Q250 375 352 345" fill="none" stroke="#D97706" stroke-width="14" stroke-linecap="round"/>
        <path d="M72 372 A198 52 -18 0 0 428 278" fill="none" stroke="#7DD3FC" stroke-width="22" stroke-linecap="round"/>
        <circle cx="220" cy="308" r="8" fill="#111113"/><circle cx="280" cy="308" r="8" fill="#111113"/>
        <path d="M235 332 Q250 345 265 332" fill="none" stroke="#111113" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    case "robot":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#EFF6FF"/>
        <g stroke="#1E3A8A" stroke-width="6" stroke-linejoin="round">
          <line x1="250" y1="100" x2="250" y2="155"/>
          <circle cx="250" cy="88" r="18" fill="#F43F5E"/>
          <rect x="145" y="155" width="210" height="145" rx="28" fill="#60A5FA"/>
          <rect x="175" y="192" width="150" height="68" rx="16" fill="#0F172A"/>
          <circle cx="215" cy="226" r="14" fill="#38BDF8"/>
          <circle cx="285" cy="226" r="14" fill="#38BDF8"/>
          <rect x="128" y="322" width="244" height="190" rx="26" fill="#93C5FD"/>
          <rect x="180" y="362" width="140" height="92" rx="14" fill="#FEF08A"/>
          <circle cx="215" cy="408" r="14" fill="#EF4444"/><circle cx="250" cy="408" r="14" fill="#22C55E"/><circle cx="285" cy="408" r="14" fill="#3B82F6"/>
          <rect x="180" y="512" width="46" height="62" rx="10" fill="#3B82F6"/>
          <rect x="274" y="512" width="46" height="62" rx="10" fill="#3B82F6"/>
        </g>
      </svg>`;
    case "firetruck":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FEF2F2"/>
        <g stroke="#18181B" stroke-width="6" stroke-linejoin="round">
          <rect x="125" y="215" width="160" height="24" rx="10" fill="#E4E4E7"/>
          <rect x="308" y="220" width="38" height="32" rx="8" fill="#FACC15"/>
          <path d="M80 280 L285 280 L295 252 L388 252 L428 335 L428 430 L80 430 Z" fill="#DC2626"/>
          <rect x="308" y="274" width="76" height="66" rx="10" fill="#BAE6FD"/>
          <rect x="96" y="316" width="170" height="36" rx="8" fill="#FFFFFF"/>
          <circle cx="155" cy="438" r="46" fill="#27272A"/><circle cx="155" cy="438" r="20" fill="#E4E4E7"/>
          <circle cx="348" cy="438" r="46" fill="#27272A"/><circle cx="348" cy="438" r="20" fill="#E4E4E7"/>
        </g>
      </svg>`;
    case "astronaut":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#312E81"/>
        <g stroke="#0F172A" stroke-width="6" stroke-linejoin="round">
          <rect x="155" y="340" width="190" height="185" rx="40" fill="#F8FAFC"/>
          <rect x="200" y="385" width="100" height="68" rx="14" fill="#E2E8F0"/>
          <circle cx="226" cy="419" r="10" fill="#EF4444"/><circle cx="252" cy="419" r="10" fill="#38BDF8"/><circle cx="278" cy="419" r="10" fill="#FACC15"/>
          <circle cx="250" cy="235" r="108" fill="#FFFFFF"/>
          <ellipse cx="250" cy="238" rx="76" ry="62" fill="#38BDF8"/>
          <ellipse cx="222" cy="216" rx="22" ry="12" transform="rotate(-24 222 216)" fill="#E0F2FE" stroke="none"/>
        </g>
      </svg>`;
    case "ufo":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#172554"/>
        <polygon points="180,350 320,350 390,565 110,565" fill="#FEF08A" opacity="0.28"/>
        <path d="M165 280 A85 78 0 0 1 335 280 Z" fill="#67E8F9" stroke="#FFFFFF" stroke-width="5"/>
        <ellipse cx="250" cy="295" rx="168" ry="48" fill="#A855F7" stroke="#FFFFFF" stroke-width="6"/>
        <circle cx="155" cy="298" r="12" fill="#FACC15"/><circle cx="215" cy="310" r="12" fill="#22C55E"/>
        <circle cx="285" cy="310" r="12" fill="#F43F5E"/><circle cx="345" cy="298" r="12" fill="#FACC15"/>
      </svg>`;
  }
}

// ---------------------------------------------------------------------------
// 5. Ocean Creatures & Summer Fun Pack SVGs
// ---------------------------------------------------------------------------

function oceanCardSvg(kind: "octopus" | "turtle" | "flamingo" | "sailboat" | "starfish" | "hibiscus"): string {
  switch (kind) {
    case "octopus":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#ECFEFF"/>
        <g stroke="#831843" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M150 365 Q100 445 140 485 Q175 475 185 410" fill="#F472B6"/>
          <path d="M200 380 Q180 485 215 515 Q245 490 238 400" fill="#F472B6"/>
          <path d="M300 380 Q320 485 285 515 Q255 490 262 400" fill="#F472B6"/>
          <path d="M350 365 Q400 445 360 485 Q325 475 315 410" fill="#F472B6"/>
          <circle cx="250" cy="265" r="118" fill="#F472B6"/>
          <circle cx="212" cy="260" r="15" fill="#FFFFFF"/><circle cx="214" cy="262" r="7" fill="#111113"/>
          <circle cx="288" cy="260" r="15" fill="#FFFFFF"/><circle cx="286" cy="262" r="7" fill="#111113"/>
          <path d="M228 302 Q250 322 272 302" fill="none"/>
        </g>
        <circle cx="115" cy="145" r="16" fill="#BAE6FD"/><circle cx="385" cy="120" r="22" fill="#BAE6FD"/>
      </svg>`;
    case "turtle":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#F0FDFA"/>
        <g stroke="#14532D" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="145" cy="275" rx="48" ry="26" transform="rotate(-30 145 275)" fill="#4ADE80"/>
          <ellipse cx="355" cy="275" rx="48" ry="26" transform="rotate(30 355 275)" fill="#4ADE80"/>
          <ellipse cx="165" cy="450" rx="42" ry="24" transform="rotate(30 165 450)" fill="#4ADE80"/>
          <ellipse cx="335" cy="450" rx="42" ry="24" transform="rotate(-30 335 450)" fill="#4ADE80"/>
          <circle cx="250" cy="185" r="46" fill="#4ADE80"/>
          <ellipse cx="250" cy="355" rx="112" ry="132" fill="#16A34A"/>
          <polygon points="250,275 305,320 285,395 215,395 195,320" fill="#86EFAC"/>
          <circle cx="232" cy="175" r="6" fill="#111113"/><circle cx="268" cy="175" r="6" fill="#111113"/>
        </g>
      </svg>`;
    case "flamingo":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FFF1F2"/>
        <g stroke="#881337" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <line x1="255" y1="420" x2="255" y2="565" stroke-width="8"/>
          <path d="M230 435 L185 485 L245 485" fill="none" stroke-width="8"/>
          <ellipse cx="265" cy="375" rx="95" ry="65" fill="#FB7185"/>
          <path d="M210 340 Q155 235 215 165 Q245 140 272 155" fill="none" stroke="#FB7185" stroke-width="32"/>
          <circle cx="268" cy="155" r="34" fill="#FB7185"/>
          <path d="M295 152 Q335 162 325 195 L292 178 Z" fill="#18181B"/>
          <circle cx="272" cy="148" r="6" fill="#111113"/>
        </g>
      </svg>`;
    case "sailboat":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#EFF6FF"/>
        <circle cx="385" cy="125" r="46" fill="#FACC15"/>
        <g stroke="#0F172A" stroke-width="5" stroke-linejoin="round">
          <line x1="250" y1="125" x2="250" y2="395" stroke-width="8"/>
          <polygon points="242,140 120,375 242,375" fill="#F43F5E"/>
          <polygon points="260,175 375,375 260,375" fill="#FFFFFF"/>
          <polygon points="105,405 395,405 352,475 148,475" fill="#0284C7"/>
        </g>
        <path d="M40 495 Q110 465 180 495 Q250 525 320 495 Q390 465 460 495" fill="none" stroke="#38BDF8" stroke-width="14" stroke-linecap="round"/>
      </svg>`;
    case "starfish":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FEFCE8"/>
        <polygon points="250,115 292,225 410,232 318,308 348,425 250,358 152,425 182,308 90,232 208,225" fill="#FB923C" stroke="#9A3412" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="222" cy="272" r="12" fill="#111113"/><circle cx="278" cy="272" r="12" fill="#111113"/>
        <path d="M228 308 Q250 326 272 308" fill="none" stroke="#111113" stroke-width="6" stroke-linecap="round"/>
        <circle cx="195" cy="296" r="12" fill="#FDA4AF"/><circle cx="305" cy="296" r="12" fill="#FDA4AF"/>
      </svg>`;
    case "hibiscus":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#F0FDF4"/>
        <g stroke="#14532D" stroke-width="5">
          <ellipse cx="145" cy="365" rx="68" ry="34" transform="rotate(-35 145 365)" fill="#22C55E"/>
          <ellipse cx="355" cy="365" rx="68" ry="34" transform="rotate(35 355 365)" fill="#22C55E"/>
        </g>
        <g fill="#F43F5E" stroke="#881337" stroke-width="5">
          <circle cx="250" cy="205" r="70"/><circle cx="332" cy="272" r="70"/><circle cx="298" cy="368" r="70"/>
          <circle cx="202" cy="368" r="70"/><circle cx="168" cy="272" r="70"/>
        </g>
        <circle cx="250" cy="295" r="36" fill="#FACC15"/>
      </svg>`;
  }
}

// ---------------------------------------------------------------------------
// 6. Myanmar Culture & Kids Learning Pack SVGs
// ---------------------------------------------------------------------------

function myanmarLearningCardSvg(
  kind: "pagoda" | "parasol" | "owl-abc" | "lanterns" | "lotus" | "elephant"
): string {
  switch (kind) {
    case "pagoda":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FFFBEB"/>
        <circle cx="250" cy="220" r="135" fill="#FDE68A"/>
        <g fill="#D97706" stroke="#78350F" stroke-width="5" stroke-linejoin="round">
          <polygon points="250,95 266,180 234,180"/>
          <path d="M210 265 Q250 175 290 265 Z" fill="#F59E0B"/>
          <rect x="165" y="265" width="170" height="42" rx="6" fill="#FBBF24"/>
          <rect x="132" y="307" width="236" height="48" rx="6" fill="#F59E0B"/>
          <rect x="96" y="355" width="308" height="58" rx="6" fill="#D97706"/>
          <path d="M220 413 L220 355 Q250 325 280 355 L280 413 Z" fill="#78350F"/>
        </g>
        <path d="M60 475 Q175 450 250 475 Q325 500 440 475" fill="none" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
      </svg>`;
    case "parasol":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FFF1F2"/>
        <g stroke="#7F1D1D" stroke-width="5" stroke-linejoin="round">
          <line x1="250" y1="145" x2="250" y2="545" stroke-width="10" stroke="#78350F"/>
          <path d="M70 305 Q250 135 430 305 L385 330 Q250 285 115 330 Z" fill="#E11D48"/>
          <path d="M135 280 Q250 150 365 280 L330 305 Q250 272 170 305 Z" fill="#FB7185"/>
          <path d="M195 262 Q250 165 305 262 Z" fill="#FACC15"/>
          <circle cx="250" cy="235" r="24" fill="#FFFFFF"/>
        </g>
      </svg>`;
    case "owl-abc":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#EFF6FF"/>
        <g stroke="#1E3A8A" stroke-width="5" stroke-linejoin="round">
          <rect x="135" y="135" width="230" height="28" rx="8" fill="#1E293B"/>
          <polygon points="250,95 385,135 250,170 115,135" fill="#1E293B"/>
          <ellipse cx="250" cy="345" rx="115" ry="128" fill="#6366F1"/>
          <ellipse cx="250" cy="378" rx="74" ry="82" fill="#E0E7FF"/>
          <circle cx="210" cy="272" r="36" fill="#FFFFFF"/><circle cx="215" cy="272" r="14" fill="#111113"/>
          <circle cx="290" cy="272" r="36" fill="#FFFFFF"/><circle cx="285" cy="272" r="14" fill="#111113"/>
          <polygon points="236,296 264,296 250,322" fill="#F59E0B"/>
          <rect x="155" y="458" width="190" height="82" rx="14" fill="#FACC15"/>
        </g>
      </svg>`;
    case "lanterns":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#1E1B4B"/>
        <g stroke="#FEF08A" stroke-width="4">
          <line x1="165" y1="0" x2="165" y2="175"/><line x1="335" y1="0" x2="335" y2="235"/><line x1="250" y1="0" x2="250" y2="115"/>
        </g>
        <g stroke="#78350F" stroke-width="4">
          <ellipse cx="165" cy="250" rx="54" ry="68" fill="#F59E0B"/>
          <ellipse cx="250" cy="195" rx="62" ry="78" fill="#EF4444"/>
          <ellipse cx="335" cy="315" rx="54" ry="68" fill="#FBBF24"/>
        </g>
        <circle cx="250" cy="195" r="22" fill="#FEF08A" opacity="0.75"/>
      </svg>`;
    case "lotus":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#ECFDF5"/>
        <ellipse cx="250" cy="445" rx="175" ry="38" fill="#10B981" stroke="#065F46" stroke-width="5"/>
        <g fill="#F472B6" stroke="#831843" stroke-width="5" stroke-linejoin="round">
          <path d="M250 155 Q315 260 250 420 Q185 260 250 155 Z" fill="#FB7185"/>
          <path d="M195 215 Q135 305 225 420 Q235 300 195 215 Z"/>
          <path d="M305 215 Q365 305 275 420 Q265 300 305 215 Z"/>
          <path d="M125 275 Q95 365 205 420 Q190 330 125 275 Z" fill="#F9A8D4"/>
          <path d="M375 275 Q405 365 295 420 Q310 330 375 275 Z" fill="#F9A8D4"/>
        </g>
      </svg>`;
    case "elephant":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#F0F9FF"/>
        <g stroke="#1E293B" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <ellipse cx="145" cy="275" rx="58" ry="86" fill="#94A3B8"/>
          <ellipse cx="355" cy="275" rx="58" ry="86" fill="#94A3B8"/>
          <ellipse cx="250" cy="405" rx="95" ry="102" fill="#CBD5E1"/>
          <circle cx="250" cy="275" r="88" fill="#CBD5E1"/>
          <path d="M240 315 Q240 425 295 410 Q320 402 308 380" fill="none" stroke="#CBD5E1" stroke-width="34"/>
          <circle cx="215" cy="256" r="8" fill="#111113"/><circle cx="285" cy="256" r="8" fill="#111113"/>
        </g>
      </svg>`;
  }
}

// ---------------------------------------------------------------------------
// 7. Botanical Mandalas & Cozy Aesthetic Pack SVGs
// ---------------------------------------------------------------------------

function aestheticMandalaCardSvg(
  kind: "mandala" | "teacup" | "monstera" | "bouquet" | "moon-crystal" | "retro-sun"
): string {
  switch (kind) {
    case "mandala":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FAFDF9"/>
        <g transform="translate(250 320)" stroke="#065F46" stroke-width="4" fill="none">
          <circle r="175" fill="#ECFDF5"/>
          <circle r="138" stroke="#D97706" stroke-dasharray="10 8"/>
          <circle r="96" fill="#FFFFFF"/>
          <polygon points="0,-168 38,-38 168,0 38,38 0,168 -38,38 -168,0 -38,-38" fill="#A7F3D0" opacity="0.65"/>
          <polygon points="-118,-118 0,-54 118,-118 54,0 118,118 0,54 -118,118 -54,0" fill="#FDE68A" opacity="0.55"/>
          <circle r="38" fill="#065F46"/>
        </g>
      </svg>`;
    case "teacup":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FEF7EC"/>
        <g stroke="#451A03" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="115" y="425" width="270" height="44" rx="8" fill="#D97706"/>
          <rect x="135" y="380" width="230" height="45" rx="8" fill="#0F766E"/>
          <path d="M165 250 L335 250 Q335 375 250 375 Q165 375 165 250 Z" fill="#FFFFFF"/>
          <path d="M335 272 Q380 272 380 308 Q380 342 325 342" fill="none" stroke-width="10"/>
          <path d="M220 205 Q205 170 225 145 M258 205 Q245 165 265 135 M295 205 Q282 175 300 150" fill="none" stroke="#B45309"/>
        </g>
      </svg>`;
    case "monstera":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#F4F7F4"/>
        <rect x="44" y="44" width="412" height="552" rx="18" fill="none" stroke="#15803D" stroke-width="4"/>
        <path d="M250 120 Q395 160 385 320 Q375 450 250 475 Q125 450 115 320 Q105 160 250 120 Z" fill="#16A34A" stroke="#064E3B" stroke-width="6"/>
        <g fill="#F4F7F4">
          <ellipse cx="170" cy="245" rx="34" ry="12" transform="rotate(-15 170 245)"/>
          <ellipse cx="330" cy="245" rx="34" ry="12" transform="rotate(15 330 245)"/>
          <ellipse cx="172" cy="335" rx="38" ry="12" transform="rotate(-10 172 335)"/>
          <ellipse cx="328" cy="335" rx="38" ry="12" transform="rotate(10 328 335)"/>
        </g>
        <line x1="250" y1="150" x2="250" y2="545" stroke="#064E3B" stroke-width="8" stroke-linecap="round"/>
      </svg>`;
    case "bouquet":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FFF1F5"/>
        <g stroke="#4C0519" stroke-width="5">
          <polygon points="175,345 325,345 280,535 220,535" fill="#E7CFAF"/>
          <circle cx="195" cy="260" r="56" fill="#FB7185"/>
          <circle cx="305" cy="260" r="56" fill="#F472B6"/>
          <circle cx="250" cy="205" r="64" fill="#FDE047"/>
          <circle cx="250" cy="285" r="48" fill="#FFFFFF"/>
        </g>
      </svg>`;
    case "moon-crystal":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#1E1B4B"/>
        <circle cx="250" cy="240" r="115" fill="#FDE68A"/>
        <circle cx="292" cy="215" r="98" fill="#1E1B4B"/>
        <g fill="#C084FC" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round">
          <polygon points="250,350 288,435 288,525 212,525 212,435"/>
          <polygon points="165,405 205,465 205,525 145,525 145,455" fill="#38BDF8"/>
          <polygon points="335,405 355,455 355,525 295,525 295,465" fill="#A855F7"/>
        </g>
      </svg>`;
    case "retro-sun":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640" width="500" height="640">
        <rect width="500" height="640" fill="#FAF5EB"/>
        <circle cx="250" cy="265" r="112" fill="#F59E0B" stroke="#78350F" stroke-width="6"/>
        <path d="M90 420 A160 160 0 0 1 410 420" fill="none" stroke="#EA580C" stroke-width="24" stroke-linecap="round"/>
        <path d="M128 420 A122 122 0 0 1 372 420" fill="none" stroke="#0D9488" stroke-width="24" stroke-linecap="round"/>
        <path d="M166 420 A84 84 0 0 1 334 420" fill="none" stroke="#FACC15" stroke-width="24" stroke-linecap="round"/>
      </svg>`;
  }
}

export const ART_CARD_PACKS: {
  id: string;
  label: string;
  cards: ShowcaseCardSlot[];
}[] = [
  {
    id: "christmas-handprints",
    label: "Christmas Handprint Crafts (6 Cards)",
    cards: [
      { id: "hp-1", label: "Reindeer Kraft", src: svgToDataUrl(reindeerKraftSvg()), paper: "kraft" },
      { id: "hp-2", label: "Handprint Tree", src: svgToDataUrl(treeHandprintWhiteSvg()), paper: "white" },
      { id: "hp-3", label: "Twin Reindeers", src: svgToDataUrl(twinReindeerSvg()), paper: "white" },
      { id: "hp-4", label: "Santa Handprint", src: svgToDataUrl(santaHandprintKraftSvg()), paper: "kraft" },
      { id: "hp-5", label: "Snowman Card", src: svgToDataUrl(snowmanHandprintBlueSvg()), paper: "pastel-blue" },
      { id: "hp-6", label: "Penguin Card", src: svgToDataUrl(penguinHandprintSvg()), paper: "white" },
    ],
  },
  {
    id: "christmas-coloring",
    label: "Festive Coloring Pages (6 Sheets)",
    cards: [
      { id: "cc-1", label: "Santa Gift", src: svgToDataUrl(santaColoringSheetSvg()), paper: "white" },
      { id: "cc-2", label: "Jolly Snowman", src: svgToDataUrl(snowmanColoringSheetSvg()), paper: "white" },
      { id: "cc-3", label: "Christmas Tree", src: svgToDataUrl(treeColoringSheetSvg()), paper: "white" },
      { id: "cc-4", label: "Cute Reindeer", src: svgToDataUrl(reindeerColoringSheetSvg()), paper: "white" },
      { id: "cc-5", label: "Gingerbread House", src: svgToDataUrl(gingerbreadColoringSheetSvg()), paper: "white" },
      { id: "cc-6", label: "Snowman Handprint", src: svgToDataUrl(snowmanHandprintBlueSvg()), paper: "white" },
    ],
  },
  {
    id: "kids-animals",
    label: "Cute Animals & Kids Fun (6 Cards)",
    cards: [
      { id: "ka-1", label: "Happy Dino", src: svgToDataUrl(cuteAnimalCardSvg("dino")), paper: "white" },
      { id: "ka-2", label: "Sweet Bunny", src: svgToDataUrl(cuteAnimalCardSvg("bunny")), paper: "white" },
      { id: "ka-3", label: "Friendly Lion", src: svgToDataUrl(cuteAnimalCardSvg("lion")), paper: "white" },
      { id: "ka-4", label: "Ocean Whale", src: svgToDataUrl(cuteAnimalCardSvg("whale")), paper: "white" },
      { id: "ka-5", label: "Rainbow Sky", src: svgToDataUrl(cuteAnimalCardSvg("rainbow")), paper: "white" },
      { id: "ka-6", label: "Butterfly", src: svgToDataUrl(cuteAnimalCardSvg("butterfly")), paper: "white" },
    ],
  },
  {
    id: "space-vehicles",
    label: "Space, Robots & Vehicles (6 Cards)",
    cards: [
      { id: "sp-1", label: "Rocket Ship", src: svgToDataUrl(spaceCardSvg("rocket")), paper: "white" },
      { id: "sp-2", label: "Planet Saturn", src: svgToDataUrl(spaceCardSvg("saturn")), paper: "white" },
      { id: "sp-3", label: "Friendly Robot", src: svgToDataUrl(spaceCardSvg("robot")), paper: "white" },
      { id: "sp-4", label: "Fire Engine", src: svgToDataUrl(spaceCardSvg("firetruck")), paper: "white" },
      { id: "sp-5", label: "Astronaut", src: svgToDataUrl(spaceCardSvg("astronaut")), paper: "white" },
      { id: "sp-6", label: "UFO Saucer", src: svgToDataUrl(spaceCardSvg("ufo")), paper: "white" },
    ],
  },
  {
    id: "ocean-tropical",
    label: "Ocean Creatures & Summer (6 Cards)",
    cards: [
      { id: "oc-1", label: "Happy Octopus", src: svgToDataUrl(oceanCardSvg("octopus")), paper: "white" },
      { id: "oc-2", label: "Sea Turtle", src: svgToDataUrl(oceanCardSvg("turtle")), paper: "white" },
      { id: "oc-3", label: "Pink Flamingo", src: svgToDataUrl(oceanCardSvg("flamingo")), paper: "white" },
      { id: "oc-4", label: "Sailboat", src: svgToDataUrl(oceanCardSvg("sailboat")), paper: "white" },
      { id: "oc-5", label: "Sunny Starfish", src: svgToDataUrl(oceanCardSvg("starfish")), paper: "white" },
      { id: "oc-6", label: "Hibiscus Bloom", src: svgToDataUrl(oceanCardSvg("hibiscus")), paper: "white" },
    ],
  },
  {
    id: "myanmar-learning",
    label: "Myanmar Culture & Learning (6 Cards)",
    cards: [
      { id: "mm-1", label: "Bagan Temple", src: svgToDataUrl(myanmarLearningCardSvg("pagoda")), paper: "pastel-cream" },
      { id: "mm-2", label: "Pathein Parasol", src: svgToDataUrl(myanmarLearningCardSvg("parasol")), paper: "white" },
      { id: "mm-3", label: "Scholar Owl", src: svgToDataUrl(myanmarLearningCardSvg("owl-abc")), paper: "white" },
      { id: "mm-4", label: "Festive Lanterns", src: svgToDataUrl(myanmarLearningCardSvg("lanterns")), paper: "white" },
      { id: "mm-5", label: "Sacred Lotus", src: svgToDataUrl(myanmarLearningCardSvg("lotus")), paper: "white" },
      { id: "mm-6", label: "Cute Elephant", src: svgToDataUrl(myanmarLearningCardSvg("elephant")), paper: "white" },
    ],
  },
  {
    id: "botanical-mandala",
    label: "Botanical Mandalas & Cozy (6 Cards)",
    cards: [
      { id: "bm-1", label: "Sunburst Mandala", src: svgToDataUrl(aestheticMandalaCardSvg("mandala")), paper: "pastel-cream" },
      { id: "bm-2", label: "Cozy Teacup", src: svgToDataUrl(aestheticMandalaCardSvg("teacup")), paper: "pastel-cream" },
      { id: "bm-3", label: "Monstera Print", src: svgToDataUrl(aestheticMandalaCardSvg("monstera")), paper: "white" },
      { id: "bm-4", label: "Wildflower Bouquet", src: svgToDataUrl(aestheticMandalaCardSvg("bouquet")), paper: "white" },
      { id: "bm-5", label: "Moon & Crystals", src: svgToDataUrl(aestheticMandalaCardSvg("moon-crystal")), paper: "white" },
      { id: "bm-6", label: "Retro Rainbow Sun", src: svgToDataUrl(aestheticMandalaCardSvg("retro-sun")), paper: "pastel-cream" },
    ],
  },
];

export type ShowcasePresetCategory =
  | "mockups"
  | "flatlay"
  | "kids"
  | "myanmar"
  | "seasonal"
  | "learning"
  | "aesthetic";

export interface ShowcaseDesignPreset {
  id: string;
  label: string;
  badge: string;
  category: ShowcasePresetCategory;
  thumbnailSrc?: string;
  config: ShowcaseDesignConfig;
}

function christmasStickersWindowSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 720" width="560" height="720">
  <defs>
    <filter id="st-sh" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.14"/>
    </filter>
  </defs>
  <!-- Crisp White App Window -->
  <rect x="4" y="4" width="552" height="712" rx="22" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
  <!-- Top Window Bar -->
  <circle cx="30" cy="28" r="7" fill="#EF4444"/>
  <circle cx="52" cy="28" r="7" fill="#F59E0B"/>
  <circle cx="74" cy="28" r="7" fill="#10B981"/>
  <text x="280" y="33" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="16" font-weight="600" fill="#3F3F46">Christmas Printable PDF/PNG</text>
  <line x1="16" y1="48" x2="544" y2="48" stroke="#F4F4F5" stroke-width="2"/>

  <!-- Row 1: Santa on Gold Star + 3 Gift Boxes -->
  <g filter="url(#st-sh)">
    <!-- Gold Star Santa -->
    <g transform="translate(116 142)">
      <polygon points="0,-72 22,-22 76,-18 34,18 48,70 0,40 -48,70 -34,18 -76,-18 -22,-22" fill="#F59E0B" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>
      <polygon points="0,-66 19,-20 68,-16 30,15 43,62 0,36 -43,62 -30,15 -68,-16 -19,-20" fill="#FBBF24"/>
      <circle cx="0" cy="-14" r="24" fill="#FDE2C8"/>
      <path d="M-24,-22 Q0,-56 24,-22 Z" fill="#DC2626"/>
      <rect x="-26" y="-26" width="52" height="10" rx="5" fill="#FFFFFF"/>
      <circle cx="24" cy="-38" r="7" fill="#FFFFFF"/>
      <path d="M-22,-4 Q0,26 22,-4 Z" fill="#FFFFFF"/>
      <circle cx="-8" cy="-14" r="3" fill="#18181B"/>
      <circle cx="8" cy="-14" r="3" fill="#18181B"/>
      <circle cx="0" cy="-8" r="4" fill="#F87171"/>
      <rect x="-22" y="14" width="44" height="28" rx="10" fill="#DC2626"/>
      <rect x="-22" y="25" width="44" height="7" fill="#18181B"/>
      <rect x="-6" y="24" width="12" height="9" rx="2" fill="#FACC15"/>
    </g>
    <!-- Gift 1 (White/Red) -->
    <g transform="translate(248 118)">
      <rect x="-36" y="-34" width="72" height="68" rx="10" fill="#F8FAFC" stroke="#FFFFFF" stroke-width="10"/>
      <rect x="-34" y="-32" width="68" height="64" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="-8" y="-32" width="16" height="64" fill="#DC2626"/>
      <rect x="-34" y="-6" width="68" height="14" fill="#DC2626"/>
      <ellipse cx="-14" cy="-38" rx="14" ry="8" fill="#DC2626"/>
      <ellipse cx="14" cy="-38" rx="14" ry="8" fill="#DC2626"/>
    </g>
    <!-- Gift 2 (Red/Gold) -->
    <g transform="translate(356 132)">
      <rect x="-34" y="-32" width="68" height="64" rx="10" fill="#DC2626" stroke="#FFFFFF" stroke-width="10"/>
      <rect x="-32" y="-30" width="64" height="60" rx="8" fill="#DC2626"/>
      <rect x="-7" y="-30" width="14" height="60" fill="#FBBF24"/>
      <rect x="-32" y="-5" width="64" height="12" fill="#FBBF24"/>
      <ellipse cx="-12" cy="-36" rx="13" ry="7" fill="#FBBF24"/>
      <ellipse cx="12" cy="-36" rx="13" ry="7" fill="#FBBF24"/>
    </g>
    <!-- Gift 3 (Cream/Gold) -->
    <g transform="translate(466 122)">
      <rect x="-38" y="-38" width="76" height="76" rx="12" fill="#FEF3C7" stroke="#FFFFFF" stroke-width="10"/>
      <rect x="-36" y="-36" width="72" height="72" rx="10" fill="#FFFBEB" stroke="#FDE68A" stroke-width="2"/>
      <rect x="-8" y="-36" width="16" height="72" fill="#EAB308"/>
      <rect x="-36" y="-6" width="72" height="14" fill="#EAB308"/>
      <ellipse cx="-15" cy="-42" rx="15" ry="9" fill="#EAB308"/>
      <ellipse cx="15" cy="-42" rx="15" ry="9" fill="#EAB308"/>
    </g>

    <!-- Row 2: Ornaments, Candy Canes, Green Gift, Merry Christmas -->
    <g transform="translate(270 250)">
      <circle cx="0" cy="6" r="36" fill="#0F766E" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="0" cy="6" r="34" fill="#14B8A6"/>
      <rect x="-34" y="-2" width="68" height="16" fill="#DC2626"/>
      <circle cx="-14" cy="6" r="4" fill="#FEF08A"/>
      <circle cx="0" cy="6" r="4" fill="#FEF08A"/>
      <circle cx="14" cy="6" r="4" fill="#FEF08A"/>
      <rect x="-9" y="-36" width="18" height="10" rx="3" fill="#EAB308"/>
    </g>
    <g transform="translate(374 268)">
      <circle cx="0" cy="6" r="35" fill="#15803D" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="0" cy="6" r="33" fill="#228B56"/>
      <rect x="-33" y="-1" width="66" height="14" fill="#D97706"/>
      <circle cx="-12" cy="6" r="3.5" fill="#FFFFFF"/>
      <circle cx="0" cy="6" r="3.5" fill="#FFFFFF"/>
      <circle cx="12" cy="6" r="3.5" fill="#FFFFFF"/>
      <rect x="-9" y="-35" width="18" height="10" rx="3" fill="#EAB308"/>
    </g>
    <!-- Large Candy Cane Right -->
    <g transform="translate(476 268)">
      <path d="M-24,-40 C-24,-74 26,-74 26,-36 L14,68" fill="none" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round"/>
      <path d="M-24,-40 C-24,-74 26,-74 26,-36 L14,68" fill="none" stroke="#DC2626" stroke-width="18" stroke-linecap="round"/>
      <path d="M-24,-40 C-24,-74 26,-74 26,-36 L14,68" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-dasharray="14 14" stroke-linecap="butt"/>
    </g>
    <!-- Green Gift Left -->
    <g transform="translate(102 346)">
      <rect x="-40" y="-34" width="80" height="68" rx="10" fill="#15803D" stroke="#FFFFFF" stroke-width="10"/>
      <rect x="-38" y="-32" width="76" height="64" rx="8" fill="#16A34A"/>
      <rect x="-8" y="-32" width="16" height="64" fill="#DC2626"/>
      <rect x="-38" y="-6" width="76" height="14" fill="#DC2626"/>
      <ellipse cx="-14" cy="-38" rx="14" ry="8" fill="#DC2626"/>
      <ellipse cx="14" cy="-38" rx="14" ry="8" fill="#DC2626"/>
    </g>
    <!-- Merry Christmas Sticker -->
    <g transform="translate(285 362)">
      <rect x="-86" y="-34" width="172" height="72" rx="34" fill="#FFFFFF" stroke="#F4F4F5" stroke-width="3"/>
      <text x="0" y="-2" text-anchor="middle" font-family="'Caveat', cursive" font-size="38" font-weight="700" fill="#B91C1C">Merry</text>
      <text x="0" y="28" text-anchor="middle" font-family="'Caveat', cursive" font-size="36" font-weight="700" fill="#B91C1C">Christmas</text>
    </g>

    <!-- Row 3: Gingerbread Men, Christmas Tree, Standing Reindeer -->
    <g transform="translate(106 492)">
      <circle cx="0" cy="-36" r="24" fill="#B46936" stroke="#FFFFFF" stroke-width="9"/>
      <rect x="-24" y="-12" width="48" height="48" rx="16" fill="#B46936" stroke="#FFFFFF" stroke-width="9"/>
      <circle cx="0" cy="-36" r="22" fill="#C67B43"/>
      <rect x="-38" y="-8" width="76" height="16" rx="8" fill="#C67B43"/>
      <rect x="-22" y="-12" width="44" height="48" rx="16" fill="#C67B43"/>
      <rect x="-20" y="24" width="16" height="30" rx="8" fill="#C67B43"/>
      <rect x="4" y="24" width="16" height="30" rx="8" fill="#C67B43"/>
      <circle cx="-7" cy="-40" r="3" fill="#FFFFFF"/>
      <circle cx="7" cy="-40" r="3" fill="#FFFFFF"/>
      <path d="M-7,-30 Q0,-24 7,-30" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="0" cy="4" r="4" fill="#22C55E"/>
      <circle cx="0" cy="18" r="4" fill="#EF4444"/>
    </g>
    <g transform="translate(228 492)">
      <circle cx="0" cy="-36" r="24" fill="#B46936" stroke="#FFFFFF" stroke-width="9"/>
      <rect x="-24" y="-12" width="48" height="48" rx="16" fill="#B46936" stroke="#FFFFFF" stroke-width="9"/>
      <circle cx="0" cy="-36" r="22" fill="#C67B43"/>
      <rect x="-38" y="-8" width="76" height="16" rx="8" fill="#C67B43"/>
      <rect x="-22" y="-12" width="44" height="48" rx="16" fill="#C67B43"/>
      <rect x="-20" y="24" width="16" height="30" rx="8" fill="#C67B43"/>
      <rect x="4" y="24" width="16" height="30" rx="8" fill="#C67B43"/>
      <circle cx="-7" cy="-40" r="3" fill="#FFFFFF"/>
      <circle cx="7" cy="-40" r="3" fill="#FFFFFF"/>
      <path d="M-7,-30 Q0,-24 7,-30" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="0" cy="4" r="4" fill="#EF4444"/>
      <circle cx="0" cy="18" r="4" fill="#FACC15"/>
    </g>
    <!-- Christmas Tree -->
    <g transform="translate(352 486)">
      <polygon points="0,-66 48,38 -48,38" fill="#15803D" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>
      <rect x="-12" y="34" width="24" height="22" rx="4" fill="#78350F"/>
      <polygon points="0,-62 34,-12 -34,-12" fill="#16A34A"/>
      <polygon points="0,-32 42,14 -42,14" fill="#15803D"/>
      <polygon points="0,-4 48,38 -48,38" fill="#166534"/>
      <polygon points="0,-78 6,-64 20,-64 9,-55 13,-42 0,-50 -13,-42 -9,-55 -20,-64 -6,-64" fill="#FACC15"/>
      <circle cx="-12" cy="-12" r="5" fill="#EF4444"/>
      <circle cx="14" cy="4" r="5" fill="#FACC15"/>
      <circle cx="-16" cy="22" r="5" fill="#38BDF8"/>
      <circle cx="18" cy="26" r="5" fill="#EF4444"/>
    </g>
    <!-- Standing Reindeer -->
    <g transform="translate(470 478)">
      <ellipse cx="0" cy="20" rx="28" ry="20" fill="#B46936" stroke="#FFFFFF" stroke-width="9"/>
      <circle cx="-12" cy="-16" r="20" fill="#C67B43" stroke="#FFFFFF" stroke-width="8"/>
      <ellipse cx="0" cy="20" rx="26" ry="18" fill="#C67B43"/>
      <rect x="-20" y="32" width="10" height="24" rx="5" fill="#92400E"/>
      <rect x="8" y="32" width="10" height="24" rx="5" fill="#92400E"/>
      <circle cx="-12" cy="-16" r="19" fill="#C67B43"/>
      <path d="M-20,-32 L-28,-50 M-4,-32 L4,-50" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
      <circle cx="-22" cy="-14" r="5" fill="#DC2626"/>
      <circle cx="-14" cy="-20" r="2.5" fill="#18181B"/>
    </g>

    <!-- Row 4: Reindeer Face, Holly Leaves, Ho Ho -->
    <g transform="translate(116 632)">
      <circle cx="0" cy="4" r="32" fill="#B46936" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="0" cy="4" r="30" fill="#C67B43"/>
      <path d="M-16,-22 L-26,-44 M16,-22 L26,-44" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
      <circle cx="-10" cy="-2" r="3.5" fill="#18181B"/>
      <circle cx="10" cy="-2" r="3.5" fill="#18181B"/>
      <circle cx="0" cy="12" r="9" fill="#DC2626"/>
    </g>
    <g transform="translate(248 638)">
      <ellipse cx="-24" cy="0" rx="28" ry="16" transform="rotate(-24 -24 0)" fill="#15803D" stroke="#FFFFFF" stroke-width="8"/>
      <ellipse cx="24" cy="0" rx="28" ry="16" transform="rotate(24 24 0)" fill="#16A34A" stroke="#FFFFFF" stroke-width="8"/>
      <ellipse cx="-24" cy="0" rx="26" ry="14" transform="rotate(-24 -24 0)" fill="#15803D"/>
      <ellipse cx="24" cy="0" rx="26" ry="14" transform="rotate(24 24 0)" fill="#16A34A"/>
      <circle cx="0" cy="12" r="9" fill="#DC2626"/>
      <circle cx="-10" cy="18" r="8" fill="#EF4444"/>
      <circle cx="10" cy="18" r="8" fill="#B91C1C"/>
    </g>
    <g transform="translate(362 638)">
      <ellipse cx="-24" cy="0" rx="26" ry="14" transform="rotate(-20 -24 0)" fill="#16A34A"/>
      <ellipse cx="24" cy="0" rx="26" ry="14" transform="rotate(20 24 0)" fill="#15803D"/>
      <circle cx="0" cy="12" r="9" fill="#DC2626"/>
      <circle cx="-10" cy="18" r="8" fill="#EF4444"/>
      <circle cx="10" cy="18" r="8" fill="#B91C1C"/>
    </g>
    <g transform="translate(474 624)">
      <text x="0" y="-4" text-anchor="middle" font-family="'Fredoka', sans-serif" font-size="42" font-weight="700" fill="#DC2626" stroke="#FFFFFF" stroke-width="10" paint-order="stroke fill">Ho</text>
      <text x="0" y="38" text-anchor="middle" font-family="'Fredoka', sans-serif" font-size="42" font-weight="700" fill="#DC2626" stroke="#FFFFFF" stroke-width="10" paint-order="stroke fill">Ho</text>
    </g>
  </g>
</svg>`;
}

function pastelPrintablesWindowSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 720" width="560" height="720">
  <defs>
    <filter id="ps-sh" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect x="4" y="4" width="552" height="712" rx="22" fill="#FFFFFF" stroke="#E7E5E4" stroke-width="2"/>
  <circle cx="30" cy="28" r="7" fill="#F87171"/>
  <circle cx="52" cy="28" r="7" fill="#FBBF24"/>
  <circle cx="74" cy="28" r="7" fill="#34D399"/>
  <text x="280" y="33" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="16" font-weight="600" fill="#57534E">Printable Stickers &amp; Coloring PDF/PNG</text>
  <line x1="16" y1="48" x2="544" y2="48" stroke="#F5F5F4" stroke-width="2"/>

  <g filter="url(#ps-sh)">
    <!-- Pastel Rainbow -->
    <g transform="translate(136 146)">
      <path d="M-74,30 A74,74 0 0,1 74,30" fill="none" stroke="#FFFFFF" stroke-width="50" stroke-linecap="round"/>
      <path d="M-64,30 A64,64 0 0,1 64,30" fill="none" stroke="#FCA5A5" stroke-width="18" stroke-linecap="round"/>
      <path d="M-46,30 A46,46 0 0,1 46,30" fill="none" stroke="#FDE68A" stroke-width="18" stroke-linecap="round"/>
      <path d="M-28,30 A28,28 0 0,1 28,30" fill="none" stroke="#99F6E4" stroke-width="16" stroke-linecap="round"/>
      <circle cx="-62" cy="36" r="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="62" cy="36" r="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    </g>
    <!-- Cute Bear Head -->
    <g transform="translate(310 146)">
      <circle cx="-36" cy="-34" r="18" fill="#D6A984" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="36" cy="-34" r="18" fill="#D6A984" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="0" cy="4" r="46" fill="#D6A984" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="-36" cy="-34" r="16" fill="#D6A984"/>
      <circle cx="36" cy="-34" r="16" fill="#D6A984"/>
      <circle cx="0" cy="4" r="44" fill="#E2B996"/>
      <ellipse cx="0" cy="18" rx="18" ry="14" fill="#FEF3C7"/>
      <circle cx="-15" cy="-2" r="4" fill="#292524"/>
      <circle cx="15" cy="-2" r="4" fill="#292524"/>
      <ellipse cx="0" cy="12" rx="6" ry="4.5" fill="#44403C"/>
      <circle cx="-24" cy="10" r="6" fill="#FDA4AF" opacity="0.65"/>
      <circle cx="24" cy="10" r="6" fill="#FDA4AF" opacity="0.65"/>
    </g>
    <!-- Sun Flower -->
    <g transform="translate(462 146)">
      <circle cx="0" cy="0" r="46" fill="#FDE68A" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="0" cy="-32" r="16" fill="#FBBF24"/>
      <circle cx="30" cy="-10" r="16" fill="#FBBF24"/>
      <circle cx="19" cy="26" r="16" fill="#FBBF24"/>
      <circle cx="-19" cy="26" r="16" fill="#FBBF24"/>
      <circle cx="-30" cy="-10" r="16" fill="#FBBF24"/>
      <circle cx="0" cy="0" r="22" fill="#FB923C"/>
      <circle cx="-6" cy="-3" r="2.8" fill="#431407"/>
      <circle cx="6" cy="-3" r="2.8" fill="#431407"/>
      <path d="M-5,6 Q0,11 5,6" fill="none" stroke="#431407" stroke-width="2.2" stroke-linecap="round"/>
    </g>

    <!-- Middle Row: Botanical Leaf, Cozy Mug, Cute Butterfly -->
    <g transform="translate(116 336)">
      <ellipse cx="0" cy="0" rx="44" ry="56" fill="#A7F3D0" stroke="#FFFFFF" stroke-width="10"/>
      <path d="M0,-44 C36,-20 36,30 0,48 C-36,30 -36,-20 0,-44 Z" fill="#34D399"/>
      <path d="M0,-40 L0,48 M0,-14 L18,-26 M0,6 L-18,-6 M0,24 L18,12" stroke="#ECFDF5" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <g transform="translate(282 342)">
      <rect x="-88" y="-38" width="176" height="76" rx="36" fill="#FFF7ED" stroke="#FED7AA" stroke-width="3"/>
      <text x="0" y="-2" text-anchor="middle" font-family="'Fredoka', sans-serif" font-size="28" font-weight="700" fill="#B45309">Create &amp;</text>
      <text x="0" y="28" text-anchor="middle" font-family="'Fredoka', sans-serif" font-size="28" font-weight="700" fill="#0F766E">Color Pack</text>
    </g>
    <g transform="translate(454 336)">
      <circle cx="-20" cy="-14" r="26" fill="#DDD6FE" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="20" cy="-14" r="26" fill="#DDD6FE" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="-16" cy="18" r="20" fill="#C4B5FD" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="16" cy="18" r="20" fill="#C4B5FD" stroke="#FFFFFF" stroke-width="8"/>
      <circle cx="-20" cy="-14" r="24" fill="#C4B5FD"/>
      <circle cx="20" cy="-14" r="24" fill="#C4B5FD"/>
      <circle cx="-16" cy="18" r="18" fill="#A78BFA"/>
      <circle cx="16" cy="18" r="18" fill="#A78BFA"/>
      <rect x="-5" y="-24" width="10" height="54" rx="5" fill="#4C1D95"/>
    </g>

    <!-- Bottom Row: B&W Coloring Line Art Mini Cards -->
    <g transform="translate(154 552)">
      <rect x="-102" y="-108" width="204" height="216" rx="16" fill="#FFFFFF" stroke="#D6D3D1" stroke-width="3"/>
      <g stroke="#18181B" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="0" cy="-14" r="44"/>
        <circle cx="0" cy="-14" r="22"/>
        <path d="M0,-58 C18,-36 18,-36 0,-14 C-18,-36 -18,-36 0,-58 Z"/>
        <path d="M44,-14 C22,4 22,4 0,-14 C22,-32 22,-32 44,-14 Z"/>
        <path d="M0,30 C-18,8 -18,8 0,-14 C18,8 18,8 0,30 Z"/>
        <path d="M-44,-14 C-22,-32 -22,-32 0,-14 C-22,4 -22,4 -44,-14 Z"/>
        <line x1="-64" y1="64" x2="64" y2="64"/>
        <line x1="-42" y1="80" x2="42" y2="80"/>
      </g>
    </g>
    <g transform="translate(406 552)">
      <rect x="-102" y="-108" width="204" height="216" rx="16" fill="#FFFFFF" stroke="#D6D3D1" stroke-width="3"/>
      <g stroke="#18181B" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-58,40 L-58,-12 L0,-56 L58,-12 L58,40 Z"/>
        <rect x="-16" y="4" width="32" height="36" rx="14"/>
        <circle cx="0" cy="-24" r="10"/>
        <path d="M-76,40 L76,40"/>
        <circle cx="46" cy="-54" r="14"/>
        <path d="M-64,-44 Q-44,-60 -26,-44"/>
      </g>
    </g>
  </g>
</svg>`;
}

export const SHOWCASE_DESIGN_PRESETS: ShowcaseDesignPreset[] = [
  // --- 2 Cozy Knit Tablet Digital Stickers & Printables Showcase Designs ---
  {
    id: "mockup-cozy-tablet-christmas",
    label: "Christmas Digital Stickers Cozy Tablet",
    badge: "Cozy Tablet",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-cozy-tablet-christmas"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-cozy-tablet-christmas",
      hideHeroBanner: false,
      overlayFlatLayPages: true,
      plaqueStyle: "luxe-deco",
      plaqueBgColor: "#FDFBF5",
      bannerBoundColor: "#C8A96A",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 18,
      bannerBoundBgOpacity: 96,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 76,
      bannerOffsetY: -6,
      titleFontScale: 92,
      accentBadge: "",
      titleLine1: "Christmas",
      titleLine2Ribbon: "Digital Stickers",
      titleLine3: "",
      subtitleText: "Instant & Printable PDF/PNG",
      footerBrandText: "",
      primaryColor: "#7F1D1D",
      secondaryColor: "#2D5A3D",
      ribbonColor: "#7F1D1D",
      title1Color: "#7F1D1D",
      title1Style: "clean",
      title2TextColor: "#7F1D1D",
      title2Style: "clean",
      title3Color: "#2D5A3D",
      title3Style: "clean",
      subtitleStyle: "pill",
      subtitleBgColor: "#2D5A3D",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#7F1D1D",
      fontFamily: "'Playfair Display', 'Padauk', serif",
      decorTheme: "christmas",
      showCardCaptions: false,
      cards: [
        {
          id: "xmas-tablet-sheet-1",
          label: "Christmas Stickers Window",
          src: svgToDataUrl(christmasStickersWindowSvg()),
          paper: "white",
          frameStyle: "clean",
        },
        ART_CARD_PACKS[1].cards[0],
        ART_CARD_PACKS[1].cards[1],
        ART_CARD_PACKS[1].cards[2],
      ],
      customTextLayers: [],
    },
  },
  {
    id: "mockup-cozy-tablet-pastel",
    label: "Cozy Knit Tablet Printable & Coloring",
    badge: "Tablet 2:3",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-cozy-tablet-pastel"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-cozy-tablet-pastel",
      hideHeroBanner: false,
      overlayFlatLayPages: true,
      plaqueStyle: "luxe-deco",
      plaqueBgColor: "#FFFDF8",
      bannerBoundColor: "#C5A267",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 18,
      bannerBoundBgOpacity: 96,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 76,
      bannerOffsetY: -6,
      titleFontScale: 90,
      accentBadge: "",
      titleLine1: "Printable Pages",
      titleLine2Ribbon: "& Digital Stickers",
      titleLine3: "",
      subtitleText: "Instant & Printable PDF/PNG",
      footerBrandText: "",
      primaryColor: "#5C3D2E",
      secondaryColor: "#3D6B5B",
      ribbonColor: "#5C3D2E",
      title1Color: "#5C3D2E",
      title1Style: "clean",
      title2TextColor: "#5C3D2E",
      title2Style: "clean",
      title3Color: "#3D6B5B",
      title3Style: "clean",
      subtitleStyle: "pill",
      subtitleBgColor: "#3D6B5B",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#5C3D2E",
      fontFamily: "'Playfair Display', 'Padauk', serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        {
          id: "pastel-tablet-sheet-1",
          label: "Printable Stickers & Coloring Window",
          src: svgToDataUrl(pastelPrintablesWindowSvg()),
          paper: "white",
          frameStyle: "clean",
        },
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[2],
      ],
      customTextLayers: [],
    },
  },
  // --- 9 New Commercial 2:3 Coloring Book & Learning Activity Showcase Designs ---
  {
    id: "mockup-giftbox-kids",
    label: "My First Coloring Book Gift Box Unboxing",
    badge: "Gift Promo",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-giftbox-kids"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-giftbox-kids",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "transparent",
      bannerBoundColor: "#EC4899",
      bannerBoundWidth: 0,
      bannerBoundDash: "solid",
      bannerBoundRadius: 28,
      bannerBoundBgOpacity: 0,
      bannerBoundShadow: false,
      bannerBoundScaleX: 92,
      bannerBoundScaleY: 82,
      bannerOffsetY: -2,
      titleFontScale: 92,
      accentBadge: "",
      titleLine1: "My First",
      titleLine2Ribbon: "Coloring Book",
      titleLine3: "24 Easy Pages",
      subtitleText: "Little Dreamy Stories",
      footerBrandText: "",
      primaryColor: "#EC4899",
      secondaryColor: "#4338CA",
      ribbonColor: "#EC4899",
      title1Color: "#EC4899",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#3730A3",
      title3Style: "outline-3d",
      subtitleBgColor: "#6D28D9",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#6D28D9",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "hearts",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [
        {
          id: "gift-badge-age",
          text: "Ages 3–7",
          x: 13,
          y: 35,
          fontSize: 34,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#F9A8D4",
          bgColor: "#6D28D9",
          strokeColor: "#3B0764",
          strokeWidth: 3,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 20,
          boundPadY: 16,
          boundThickness: 3,
          boundRadius: 24,
          boundColor: "#FFFFFF",
          boundFillColor: "#6D28D9",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -5,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "gift-badge-1",
          text: "Encourages Creativity",
          x: 84,
          y: 37,
          fontSize: 24,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#F59E0B",
          bgColor: "#FDE047",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 16,
          boundPadY: 10,
          boundThickness: 3,
          boundRadius: 20,
          boundColor: "#FFFFFF",
          boundFillColor: "#FDE047",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "gift-badge-2",
          text: "Builds Fine Motor Skills",
          x: 84,
          y: 43,
          fontSize: 24,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#EC4899",
          bgColor: "#F9A8D4",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 16,
          boundPadY: 10,
          boundThickness: 3,
          boundRadius: 20,
          boundColor: "#FFFFFF",
          boundFillColor: "#F9A8D4",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "gift-badge-3",
          text: "Perfect Gift Idea",
          x: 84,
          y: 49,
          fontSize: 24,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#06B6D4",
          bgColor: "#67E8F9",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 16,
          boundPadY: 10,
          boundThickness: 3,
          boundRadius: 20,
          boundColor: "#FFFFFF",
          boundFillColor: "#67E8F9",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "gift-footer-cta",
          text: "Available in Print & PDF",
          x: 50,
          y: 96,
          fontSize: 30,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#FDE047",
          bgColor: "#6D28D9",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "dashed",
          boundPadX: 28,
          boundPadY: 11,
          boundThickness: 3,
          boundRadius: 18,
          boundColor: "#F9A8D4",
          boundFillColor: "#5B21B6",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-spiral-flip",
    label: "Spiral Flip Coloring Book & Vocabulary Pad",
    badge: "Flip Book",
    category: "learning",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-spiral-flip"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-spiral-flip",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#F97316",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 86,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "FLIP PAD",
      titleLine1: "Spiral Flip",
      titleLine2Ribbon: "Colouring Book",
      titleLine3: "Vocabulary & Fun Art",
      subtitleText: "Easy Top-Coil Pages",
      footerBrandText: "",
      primaryColor: "#EA580C",
      secondaryColor: "#2563EB",
      ribbonColor: "#2563EB",
      title1Color: "#EA580C",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#15803D",
      title3Style: "clean",
      subtitleBgColor: "#FACC15",
      subtitleTextColor: "#18181B",
      footerBgColor: "#2563EB",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[5].cards[2],
      ],
      customTextLayers: [
        {
          id: "spiral-badge-1",
          text: "PREMIUM EDITION",
          x: 20,
          y: 92,
          fontSize: 24,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#7C2D12",
          accentColor: "#F59E0B",
          bgColor: "#FDE047",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 18,
          boundPadY: 12,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FDE047",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -4,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-plush-numbers",
    label: "Learn Through Coloring · Plush Friends Spread",
    badge: "Color by #",
    category: "learning",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-plush-numbers"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-plush-numbers",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "transparent",
      bannerBoundColor: "#F59E0B",
      bannerBoundWidth: 0,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 0,
      bannerBoundShadow: false,
      bannerBoundScaleX: 92,
      bannerBoundScaleY: 80,
      bannerOffsetY: -4,
      titleFontScale: 94,
      accentBadge: "",
      titleLine1: "Learn Through",
      titleLine2Ribbon: "Coloring",
      titleLine3: "Color by Number · Ages 3–8",
      subtitleText: "",
      footerBrandText: "",
      primaryColor: "#EA580C",
      secondaryColor: "#2563EB",
      ribbonColor: "#2563EB",
      title1Color: "#EA580C",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#1E3A8A",
      title3Style: "pill-box",
      subtitleBgColor: "#FFFFFF",
      subtitleTextColor: "#1E3A8A",
      footerBgColor: "#2563EB",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[3],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
      ],
      customTextLayers: [],
    },
  },
  {
    id: "mockup-look-inside",
    label: "Standing Cover + Take a Look Inside Spread",
    badge: "Look Inside",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-look-inside"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-look-inside",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "ribbon-badge",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#0284C7",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: 33,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Take a Look",
      titleLine2Ribbon: "Inside!",
      titleLine3: "Cute Animals · Simple Designs",
      subtitleText: "",
      footerBrandText: "",
      primaryColor: "#0369A1",
      secondaryColor: "#EC4899",
      ribbonColor: "#EC4899",
      title1Color: "#0369A1",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#BE185D",
      title3Style: "clean",
      subtitleBgColor: "#EC4899",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#EC4899",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [
        {
          id: "lookinside-mid-banner",
          text: "Take a Look Inside!",
          x: 50,
          y: 50,
          fontSize: 58,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#0C4A6E",
          accentColor: "#EC4899",
          bgColor: "#FEF08A",
          strokeColor: "#FFFFFF",
          strokeWidth: 10,
          curve: 0,
          boundStyle: "none",
          boundPadX: 28,
          boundPadY: 12,
          boundThickness: 4,
          boundRadius: 20,
          boundColor: "#FFFFFF",
          boundFillColor: "#FEF08A",
          boundFillOpacity: 0,
          stylePreset: "comic-3d",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "lookinside-age-seal",
          text: "AGES 4–5",
          x: 82,
          y: 12,
          fontSize: 28,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#FDE047",
          bgColor: "#EC4899",
          strokeColor: "#831843",
          strokeWidth: 3,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 18,
          boundPadY: 14,
          boundThickness: 3,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#EC4899",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 5,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "lookinside-footer-strip",
          text: "Cute Animals · Simple Designs · Big Fun!",
          x: 50,
          y: 96,
          fontSize: 26,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#FDE047",
          bgColor: "#EC4899",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 26,
          boundPadY: 10,
          boundThickness: 3,
          boundRadius: 22,
          boundColor: "#FFFFFF",
          boundFillColor: "#EC4899",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-toddler-trace",
    label: "Trace & Color Activity · Toddler Desk Lifestyle",
    badge: "Tracing 2–4",
    category: "learning",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-toddler-trace"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-toddler-trace",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "ribbon-badge",
      plaqueBgColor: "transparent",
      bannerBoundColor: "#4C1D95",
      bannerBoundWidth: 0,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 0,
      bannerBoundShadow: false,
      bannerBoundScaleX: 90,
      bannerBoundScaleY: 82,
      bannerOffsetY: -1,
      titleFontScale: 92,
      accentBadge: "",
      titleLine1: "Trace & Color",
      titleLine2Ribbon: "Activity Book",
      titleLine3: "for Toddlers",
      subtitleText: "",
      footerBrandText: "",
      primaryColor: "#4C1D95",
      secondaryColor: "#7C3AED",
      ribbonColor: "#5B21B6",
      title1Color: "#3B0764",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#3B0764",
      title3Style: "clean",
      subtitleBgColor: "#5B21B6",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#4C1D95",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[2].cards[2],
      ],
      customTextLayers: [
        {
          id: "toddler-age-circle",
          text: "Ages 2–4",
          x: 16,
          y: 36,
          fontSize: 32,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#DDD6FE",
          bgColor: "#4C1D95",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "circle",
          boundPadX: 22,
          boundPadY: 22,
          boundThickness: 4,
          boundRadius: 40,
          boundColor: "#FFFFFF",
          boundFillColor: "#4C1D95",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -4,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "toddler-footer-band",
          text: "Cute Kitty Fun & Early Learning!",
          x: 50,
          y: 94,
          fontSize: 32,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#DDD6FE",
          bgColor: "#4C1D95",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 34,
          boundPadY: 14,
          boundThickness: 3,
          boundRadius: 24,
          boundColor: "#FFFFFF",
          boundFillColor: "#3B0764",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-animal-facts",
    label: "Little Explorers Open Animal Fun Facts Spread",
    badge: "Fun Facts",
    category: "learning",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-animal-facts"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-animal-facts",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "floral-arch",
      plaqueBgColor: "#FFFDF7",
      bannerBoundColor: "#15803D",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 22,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "AGES 3–5",
      titleLine1: "Little Explorers",
      titleLine2Ribbon: "Animal Fun Facts",
      titleLine3: "Color & Discover Wildlife",
      subtitleText: "Bold Easy Line Art",
      footerBrandText: "",
      primaryColor: "#15803D",
      secondaryColor: "#EA580C",
      ribbonColor: "#0284C7",
      title1Color: "#EA580C",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#166534",
      title3Style: "clean",
      subtitleBgColor: "#FACC15",
      subtitleTextColor: "#18181B",
      footerBgColor: "#15803D",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[3],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [
        {
          id: "facts-badge-1",
          text: "DID YOU KNOW? Fun Facts Inside!",
          x: 50,
          y: 94,
          fontSize: 28,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#F59E0B",
          bgColor: "#FEF08A",
          strokeColor: "#18181B",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "double",
          boundPadX: 24,
          boundPadY: 11,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#18181B",
          boundFillColor: "#FEF9C3",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-cream-infographic",
    label: "Cream Studio Infographic Poster + 4 Sheets",
    badge: "Infographic",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-cream-infographic"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-cream-infographic",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "transparent",
      bannerBoundColor: "#EC4899",
      bannerBoundWidth: 0,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 0,
      bannerBoundShadow: false,
      bannerBoundScaleX: 90,
      bannerBoundScaleY: 78,
      bannerOffsetY: -4,
      titleFontScale: 90,
      accentBadge: "",
      titleLine1: "Little Hands · Big Imagination",
      titleLine2Ribbon: "Colouring Book",
      titleLine3: "Draw · Colour · Be Creative",
      subtitleText: "",
      footerBrandText: "",
      primaryColor: "#E11D48",
      secondaryColor: "#18181B",
      ribbonColor: "#E11D48",
      title1Color: "#18181B",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#18181B",
      title3Style: "clean",
      subtitleBgColor: "#F472B6",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#E11D48",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "hearts",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [
        {
          id: "cream-right-top",
          text: "Perfect for Kids (3+)",
          x: 86,
          y: 12,
          fontSize: 22,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#F59E0B",
          bgColor: "#FEF08A",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 14,
          boundPadY: 12,
          boundThickness: 2,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FEF08A",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 3,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "cream-left-1",
          text: "Boosts Creativity",
          x: 15,
          y: 33,
          fontSize: 22,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#FDA4AF",
          bgColor: "#FB7185",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 14,
          boundPadY: 9,
          boundThickness: 2,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#FB7185",
          boundFillOpacity: 0.95,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "cream-left-2",
          text: "Improves Focus",
          x: 15,
          y: 41,
          fontSize: 22,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#6EE7B7",
          bgColor: "#34D399",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 14,
          boundPadY: 9,
          boundThickness: 2,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#10B981",
          boundFillOpacity: 0.95,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "cream-left-3",
          text: "Fine Motor Skills",
          x: 15,
          y: 49,
          fontSize: 22,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#C4B5FD",
          bgColor: "#8B5CF6",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 14,
          boundPadY: 9,
          boundThickness: 2,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#8B5CF6",
          boundFillOpacity: 0.95,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "cream-right-pages",
          text: "50+ Pages",
          x: 86,
          y: 46,
          fontSize: 28,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#831843",
          accentColor: "#F472B6",
          bgColor: "#FBCFE8",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 16,
          boundPadY: 14,
          boundThickness: 2,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#FBCFE8",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -3,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "cream-bottom-pill",
          text: "A fun way to learn and grow!",
          x: 52,
          y: 95,
          fontSize: 28,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#F472B6",
          bgColor: "#FBCFE8",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "rounded",
          boundPadX: 28,
          boundPadY: 10,
          boundThickness: 2,
          boundRadius: 22,
          boundColor: "#FFFFFF",
          boundFillColor: "#FBCFE8",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 0,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-alphabet-hands",
    label: "Alphabet Fun! Beginning Sounds Overhead",
    badge: "ABC Phonics",
    category: "learning",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-alphabet-hands"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-alphabet-hands",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#0284C7",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "ABC",
      titleLine1: "Alphabet Fun!",
      titleLine2Ribbon: "Beginning Sounds",
      titleLine3: "Coloring Book for Kids",
      subtitleText: "Early Literacy & Phonics",
      footerBrandText: "",
      primaryColor: "#DC2626",
      secondaryColor: "#2563EB",
      ribbonColor: "#2563EB",
      title1Color: "#DC2626",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#15803D",
      title3Style: "clean",
      subtitleBgColor: "#FACC15",
      subtitleTextColor: "#18181B",
      footerBgColor: "#2563EB",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[4],
      ],
      customTextLayers: [
        {
          id: "abc-callout-1",
          text: "A Fun Coloring Book for Kids",
          x: 78,
          y: 23,
          fontSize: 25,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#F59E0B",
          bgColor: "#FDE047",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 16,
          boundPadY: 14,
          boundThickness: 3,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#FEF08A",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 2,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "abc-callout-2",
          text: "Builds Letter Recognition",
          x: 78,
          y: 34,
          fontSize: 25,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#EC4899",
          bgColor: "#FBCFE8",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 16,
          boundPadY: 14,
          boundThickness: 3,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#FBCFE8",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -2,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "abc-callout-3",
          text: "Early Literacy Phonics",
          x: 78,
          y: 45,
          fontSize: 25,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#18181B",
          accentColor: "#10B981",
          bgColor: "#BBF7D0",
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 16,
          boundPadY: 14,
          boundThickness: 3,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#BBF7D0",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 1,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-collage-secret",
    label: "8-Book Cute Animal Collage + Bold Sticker Title",
    badge: "Viral Pin",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-collage-secret"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-collage-secret",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "comic-burst",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#DC2626",
      bannerBoundWidth: 5,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 84,
      bannerBoundScaleY: 80,
      bannerOffsetY: 32,
      titleFontScale: 88,
      accentBadge: "",
      titleLine1: "The SECRET",
      titleLine2Ribbon: "COLORING BOOK",
      titleLine3: "that sells like crazy",
      subtitleText: "",
      footerBrandText: "",
      primaryColor: "#DC2626",
      secondaryColor: "#0D9488",
      ribbonColor: "#0D9488",
      title1Color: "#DC2626",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#EA580C",
      title3Style: "outline-3d",
      subtitleBgColor: "#FACC15",
      subtitleTextColor: "#18181B",
      footerBgColor: "#DC2626",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[3],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [
        {
          id: "collage-line-1",
          text: "The SECRET",
          x: 50,
          y: 40,
          fontSize: 64,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#DC2626",
          accentColor: "#F59E0B",
          bgColor: "#FFFFFF",
          strokeColor: "#FFFFFF",
          strokeWidth: 14,
          curve: 0,
          boundStyle: "none",
          boundPadX: 16,
          boundPadY: 8,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FFFFFF",
          boundFillOpacity: 0,
          stylePreset: "comic-3d",
          align: "center",
          rotation: -2,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "collage-line-2",
          text: "to making a",
          x: 50,
          y: 47,
          fontSize: 48,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#EA580C",
          accentColor: "#FACC15",
          bgColor: "#FFFFFF",
          strokeColor: "#FFFFFF",
          strokeWidth: 12,
          curve: 0,
          boundStyle: "none",
          boundPadX: 16,
          boundPadY: 8,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FFFFFF",
          boundFillOpacity: 0,
          stylePreset: "comic-3d",
          align: "center",
          rotation: 1,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "collage-line-3",
          text: "COLORING BOOK",
          x: 50,
          y: 54,
          fontSize: 60,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#0D9488",
          accentColor: "#FACC15",
          bgColor: "#FFFFFF",
          strokeColor: "#FFFFFF",
          strokeWidth: 14,
          curve: 0,
          boundStyle: "none",
          boundPadX: 16,
          boundPadY: 8,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FFFFFF",
          boundFillOpacity: 0,
          stylePreset: "comic-3d",
          align: "center",
          rotation: -1,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "collage-line-4",
          text: "that sells like crazy!",
          x: 50,
          y: 61,
          fontSize: 46,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#B91C1C",
          accentColor: "#F59E0B",
          bgColor: "#FFFFFF",
          strokeColor: "#FFFFFF",
          strokeWidth: 12,
          curve: 0,
          boundStyle: "none",
          boundPadX: 16,
          boundPadY: 8,
          boundThickness: 3,
          boundRadius: 16,
          boundColor: "#FFFFFF",
          boundFillColor: "#FFFFFF",
          boundFillOpacity: 0,
          stylePreset: "comic-3d",
          align: "center",
          rotation: 1,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  // --- 5 Commercial 2:3 Coloring Book & Workbook Mockup Showcase Designs ---
  {
    id: "mockup-standing-kids",
    label: "Standing 3D Animal Coloring Book",
    badge: "Book Mockup",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-standing-kids"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-standing-kids",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "cloud-sticker",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#F59E0B",
      bannerBoundWidth: 5,
      bannerBoundDash: "solid",
      bannerBoundRadius: 30,
      bannerBoundBgOpacity: 96,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "AGES 3+",
      titleLine1: "Animal",
      titleLine2Ribbon: "Coloring Book",
      titleLine3: "Fun · Cute · Happy",
      subtitleText: "Let's Color the Animal World!",
      footerBrandText: "",
      primaryColor: "#2563EB",
      secondaryColor: "#F59E0B",
      ribbonColor: "#16A34A",
      title1Color: "#EA580C",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#15803D",
      title3Style: "clean",
      subtitleBgColor: "#DC2626",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#2563EB",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[3],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
      ],
      customTextLayers: [],
    },
  },
  {
    id: "mockup-workbook-pastel",
    label: "Pastel Open Workbook & Bear Cover",
    badge: "Workbook 2:3",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-workbook-pastel"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-workbook-pastel",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "y2k-spark",
      plaqueBgColor: "#FFFDF9",
      bannerBoundColor: "#0EA5E9",
      bannerBoundWidth: 4,
      bannerBoundDash: "double",
      bannerBoundRadius: 28,
      bannerBoundBgOpacity: 94,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "PRE-K TO K",
      titleLine1: "Learn Numbers",
      titleLine2Ribbon: "1–10 Activity Book",
      titleLine3: "Count, Trace & Color",
      subtitleText: "Fun Early Learning Pages",
      footerBrandText: "",
      primaryColor: "#0284C7",
      secondaryColor: "#EA580C",
      ribbonColor: "#F97316",
      title1Color: "#0369A1",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#15803D",
      title3Style: "clean",
      subtitleBgColor: "#0284C7",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#0284C7",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [],
    },
  },
  {
    id: "mockup-cozy-bundle",
    label: "Cozy Oak Printable Bundle + Badges",
    badge: "Bundle 2:3",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-cozy-bundle"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-cozy-bundle",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "floral-arch",
      plaqueBgColor: "#FFFDF9",
      bannerBoundColor: "#EC4899",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Cozy Girl",
      titleLine2Ribbon: "Fantasy Coloring",
      titleLine3: "40 Printable Pages",
      subtitleText: "Instant PDF Download",
      footerBrandText: "",
      primaryColor: "#DB2777",
      secondaryColor: "#0D9488",
      ribbonColor: "#EC4899",
      title1Color: "#BE185D",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#0F766E",
      title3Style: "clean",
      subtitleBgColor: "#7C3AED",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#DB2777",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[6].cards[1],
        ART_CARD_PACKS[6].cards[3],
        ART_CARD_PACKS[6].cards[4],
        ART_CARD_PACKS[6].cards[0],
        ART_CARD_PACKS[6].cards[2],
        ART_CARD_PACKS[6].cards[5],
      ],
      customTextLayers: [
        {
          id: "badge-cozy-1",
          text: "40+ Unique Designs",
          x: 79,
          y: 28,
          fontSize: 34,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#FDE047",
          bgColor: "#EC4899",
          strokeColor: "#831843",
          strokeWidth: 4,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 24,
          boundPadY: 16,
          boundThickness: 4,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#EC4899",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: 4,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "badge-cozy-2",
          text: "Printable PDF",
          x: 83,
          y: 41,
          fontSize: 34,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#A7F3D0",
          bgColor: "#0D9488",
          strokeColor: "#134E4A",
          strokeWidth: 4,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 24,
          boundPadY: 16,
          boundThickness: 4,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#0D9488",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -3,
          letterSpacing: 0,
          opacity: 1,
        },
        {
          id: "badge-cozy-3",
          text: "Instant Download",
          x: 20,
          y: 83,
          fontSize: 32,
          fontFamily: "'Fredoka', 'Padauk', sans-serif",
          fontWeight: "700",
          color: "#FFFFFF",
          accentColor: "#DDD6FE",
          bgColor: "#7C3AED",
          strokeColor: "#4C1D95",
          strokeWidth: 4,
          curve: 0,
          boundStyle: "scallop-seal",
          boundPadX: 22,
          boundPadY: 16,
          boundThickness: 4,
          boundRadius: 18,
          boundColor: "#FFFFFF",
          boundFillColor: "#7C3AED",
          boundFillOpacity: 0.96,
          stylePreset: "clean",
          align: "center",
          rotation: -4,
          letterSpacing: 0,
          opacity: 1,
        },
      ],
    },
  },
  {
    id: "mockup-front-back",
    label: "Dual Front & Back ABC Book Covers",
    badge: "Front & Back",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-front-back"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-front-back",
      hideHeroBanner: true,
      overlayFlatLayPages: false,
      plaqueStyle: "ribbon-badge",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#2563EB",
      bannerBoundWidth: 4,
      bannerBoundDash: "solid",
      bannerBoundRadius: 22,
      bannerBoundBgOpacity: 95,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "AGES 3–6",
      titleLine1: "Alphabet",
      titleLine2Ribbon: "Tracing Book",
      titleLine3: "Learn · Trace · Grow",
      subtitleText: "Front & Back Cover Showcase",
      footerBrandText: "",
      primaryColor: "#2563EB",
      secondaryColor: "#DC2626",
      ribbonColor: "#2563EB",
      title1Color: "#DC2626",
      title1Style: "outline-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#16A34A",
      title3Style: "clean",
      subtitleBgColor: "#F59E0B",
      subtitleTextColor: "#1C1917",
      footerBgColor: "#2563EB",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[5].cards[5],
      ],
      customTextLayers: [],
    },
  },
  {
    id: "mockup-jungle-collage",
    label: "Jungle Cute Animals Desk Collage",
    badge: "Collage 2:3",
    category: "mockups",
    thumbnailSrc: BOOK_MOCKUP_THUMB_URLS["mockup-jungle-collage"],
    config: {
      aspect: "2:3",
      layout: "book-mockup",
      backdrop: "mockup-jungle-collage",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "floral-arch",
      plaqueBgColor: "#FFFDF7",
      bannerBoundColor: "#15803D",
      bannerBoundWidth: 5,
      bannerBoundDash: "double",
      bannerBoundRadius: 26,
      bannerBoundBgOpacity: 94,
      bannerBoundShadow: true,
      bannerBoundScaleX: 82,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Jungle",
      titleLine2Ribbon: "Coloring Book",
      titleLine3: "Cute Animals Edition",
      subtitleText: "40+ Adorable Safari Pages",
      footerBrandText: "",
      primaryColor: "#15803D",
      secondaryColor: "#EA580C",
      ribbonColor: "#15803D",
      title1Color: "#D97706",
      title1Style: "outline-3d",
      title2TextColor: "#FEF9C3",
      title2Style: "ribbon",
      title3Color: "#166534",
      title3Style: "clean",
      subtitleBgColor: "#EA580C",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#15803D",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[2].cards[2],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[3],
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[5],
      ],
      customTextLayers: [],
    },
  },
  // --- 5 Photorealistic 2:3 Flat-Lay Open Coloring Book Designs ---
  {
    id: "flatlay-oak-latte",
    label: "Cozy Oak & Latte Golden Hour Flat-Lay",
    badge: "Flat-Lay 2:3",
    category: "flatlay",
    thumbnailSrc: FLAT_LAY_THUMB_URLS["flatlay-oak-latte"],
    config: {
      aspect: "2:3",
      layout: "flat-lay-book",
      backdrop: "flatlay-oak-latte",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "glass-frost",
      plaqueBgColor: "#FFFDF9",
      bannerBoundColor: "#FFFFFF",
      bannerBoundWidth: 3,
      bannerBoundDash: "solid",
      bannerBoundRadius: 24,
      bannerBoundBgOpacity: 62,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 78,
      bannerOffsetY: -6,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Cozy Afternoon",
      titleLine2Ribbon: "Cottage Coloring Book",
      titleLine3: "30 Relaxing Pages",
      subtitleText: "Print & Color with Pencils",
      footerBrandText: "",
      primaryColor: "#78350F",
      secondaryColor: "#57534E",
      ribbonColor: "#92400E",
      title1Color: "#78350F",
      title1Style: "clean",
      title2TextColor: "#FFFBEB",
      title2Style: "ribbon",
      title3Color: "#44403C",
      title3Style: "clean",
      subtitleBgColor: "#78350F",
      subtitleTextColor: "#FFFBEB",
      footerBgColor: "#78350F",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [ART_CARD_PACKS[6].cards[0], ART_CARD_PACKS[6].cards[1]],
    },
  },
  {
    id: "flatlay-picnic-grass",
    label: "Summer Picnic Blanket & Wildflowers",
    badge: "Flat-Lay 2:3",
    category: "flatlay",
    thumbnailSrc: FLAT_LAY_THUMB_URLS["flatlay-picnic-grass"],
    config: {
      aspect: "2:3",
      layout: "flat-lay-book",
      backdrop: "flatlay-picnic-grass",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "floral-arch",
      plaqueBgColor: "#FFFDF9",
      bannerBoundColor: "#15803D",
      bannerBoundWidth: 4,
      bannerBoundDash: "double",
      bannerBoundRadius: 22,
      bannerBoundBgOpacity: 88,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 80,
      bannerOffsetY: -5,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Summer Meadow",
      titleLine2Ribbon: "Wildflower Coloring",
      titleLine3: "Botanical Escape Edition",
      subtitleText: "Dreamy Afternoon Pages",
      footerBrandText: "",
      primaryColor: "#15803D",
      secondaryColor: "#B45309",
      ribbonColor: "#15803D",
      title1Color: "#166534",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#92400E",
      title3Style: "clean",
      subtitleBgColor: "#D97706",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#15803D",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [ART_CARD_PACKS[6].cards[2], ART_CARD_PACKS[6].cards[3]],
    },
  },
  {
    id: "flatlay-linen-blinds",
    label: "Minimalist Linen & Window Blinds",
    badge: "Flat-Lay 2:3",
    category: "flatlay",
    thumbnailSrc: FLAT_LAY_THUMB_URLS["flatlay-linen-blinds"],
    config: {
      aspect: "2:3",
      layout: "flat-lay-book",
      backdrop: "flatlay-linen-blinds",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "polaroid-strip",
      plaqueBgColor: "#FFFFFF",
      bannerBoundColor: "#27272A",
      bannerBoundWidth: 3,
      bannerBoundDash: "solid",
      bannerBoundRadius: 8,
      bannerBoundBgOpacity: 74,
      bannerBoundShadow: true,
      bannerBoundScaleX: 86,
      bannerBoundScaleY: 80,
      bannerOffsetY: -4,
      titleFontScale: 84,
      accentBadge: "",
      titleLine1: "Minimalist Ink",
      titleLine2Ribbon: "Whimsical Botanicals",
      titleLine3: "Modern Editorial Coloring",
      subtitleText: "Crisp Line Art Collection",
      footerBrandText: "",
      primaryColor: "#18181B",
      secondaryColor: "#52525B",
      ribbonColor: "#18181B",
      title1Color: "#18181B",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#3F3F46",
      title3Style: "clean",
      subtitleBgColor: "#3F3F46",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#18181B",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "sparkle",
      showCardCaptions: false,
      cards: [ART_CARD_PACKS[6].cards[4], ART_CARD_PACKS[6].cards[0]],
    },
  },
  {
    id: "flatlay-walnut-botanical",
    label: "Moody Dark Walnut & Botanical Tea",
    badge: "Flat-Lay 2:3",
    category: "flatlay",
    thumbnailSrc: FLAT_LAY_THUMB_URLS["flatlay-walnut-botanical"],
    config: {
      aspect: "2:3",
      layout: "flat-lay-book",
      backdrop: "flatlay-walnut-botanical",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "luxe-deco",
      plaqueBgColor: "#141923",
      bannerBoundColor: "#EAB308",
      bannerBoundWidth: 4,
      bannerBoundDash: "double",
      bannerBoundRadius: 6,
      bannerBoundBgOpacity: 88,
      bannerBoundShadow: true,
      bannerBoundScaleX: 86,
      bannerBoundScaleY: 78,
      bannerOffsetY: -5,
      titleFontScale: 82,
      accentBadge: "",
      titleLine1: "Artisan Edition",
      titleLine2Ribbon: "Botanical Florals",
      titleLine3: "Luxury Coloring Book",
      subtitleText: "Thick Paper · Fine Line Art",
      footerBrandText: "",
      primaryColor: "#EAB308",
      secondaryColor: "#FDE68A",
      ribbonColor: "#B45309",
      title1Color: "#FDE047",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#FEF3C7",
      title3Style: "clean",
      subtitleBgColor: "#EAB308",
      subtitleTextColor: "#141923",
      footerBgColor: "#141923",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [ART_CARD_PACKS[6].cards[1], ART_CARD_PACKS[6].cards[5]],
    },
  },
  {
    id: "flatlay-pastel-markers",
    label: "Pastel Cream Desk & Alcohol Markers",
    badge: "Flat-Lay 2:3",
    category: "flatlay",
    thumbnailSrc: FLAT_LAY_THUMB_URLS["flatlay-pastel-markers"],
    config: {
      aspect: "2:3",
      layout: "flat-lay-book",
      backdrop: "flatlay-pastel-markers",
      hideHeroBanner: false,
      overlayFlatLayPages: false,
      plaqueStyle: "y2k-spark",
      plaqueBgColor: "#FFFDF9",
      bannerBoundColor: "#EC4899",
      bannerBoundWidth: 4,
      bannerBoundDash: "double",
      bannerBoundRadius: 30,
      bannerBoundBgOpacity: 92,
      bannerBoundShadow: true,
      bannerBoundScaleX: 88,
      bannerBoundScaleY: 82,
      bannerOffsetY: -3,
      titleFontScale: 86,
      accentBadge: "",
      titleLine1: "Bold & Easy",
      titleLine2Ribbon: "Cozy Cute Coloring",
      titleLine3: "Alcohol Marker Friendly",
      subtitleText: "40 Viral Cute Illustrations",
      footerBrandText: "",
      primaryColor: "#EC4899",
      secondaryColor: "#7C3AED",
      ribbonColor: "#EC4899",
      title1Color: "#DB2777",
      title1Style: "clean",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#6D28D9",
      title3Style: "clean",
      subtitleBgColor: "#7C3AED",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#EC4899",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "sparkle",
      showCardCaptions: false,
      cards: [ART_CARD_PACKS[2].cards[0], ART_CARD_PACKS[2].cards[1]],
    },
  },

  // --- Original 4 Presets ---
  {
    id: "craft-plaque-25",
    label: "25 Keepsake Crafts (6-Card Plaque)",
    badge: "Craft Pin",
    category: "seasonal",
    config: {
      aspect: "9:16",
      layout: "center-plaque-6",
      backdrop: "craft-table-lights",
      plaqueStyle: "wood-plaque",
      accentBadge: "25",
      titleLine1: "Cutest",
      titleLine2Ribbon: "Christmas Handprint",
      titleLine3: "Crafts for Kids",
      subtitleText: "Easy Keepsakes",
      footerBrandText: "",
      primaryColor: "#DC2626",
      secondaryColor: "#14532D",
      ribbonColor: "#DC2626",
      subtitleBgColor: "#14532D",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#DC2626",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "christmas",
      showCardCaptions: false,
      cards: ART_CARD_PACKS[0].cards,
    },
  },
  {
    id: "coloring-showcase-5",
    label: "Coloring Pages Showcase (Top Banner + 5 Fan)",
    badge: "Coloring Pin",
    category: "seasonal",
    config: {
      aspect: "9:16",
      layout: "top-banner-5",
      backdrop: "festive-pine-desk",
      plaqueStyle: "cloud-sticker",
      accentBadge: "",
      titleLine1: "Christmas",
      titleLine2Ribbon: "Coloring Pages",
      titleLine3: "for Kids",
      subtitleText: "Print, color, and celebrate!",
      footerBrandText: "GBTK STUDIO",
      primaryColor: "#DC2626",
      secondaryColor: "#15803D",
      ribbonColor: "#15803D",
      subtitleBgColor: "#FDE047",
      subtitleTextColor: "#1C1917",
      footerBgColor: "#DC2626",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "christmas",
      showCardCaptions: false,
      cards: ART_CARD_PACKS[1].cards,
    },
  },
  {
    id: "spring-animals-pack",
    label: "Kids Animal Coloring & Activity Pack",
    badge: "Spring Pack",
    category: "kids",
    config: {
      aspect: "9:16",
      layout: "top-banner-5",
      backdrop: "spring-botanical-oak",
      plaqueStyle: "cloud-sticker",
      accentBadge: "30",
      titleLine1: "Adorable",
      titleLine2Ribbon: "Animal Coloring",
      titleLine3: "Pages for Kids",
      subtitleText: "Bold & Easy Printables",
      footerBrandText: "GBTK STUDIO",
      primaryColor: "#0EA5E9",
      secondaryColor: "#15803D",
      ribbonColor: "#0284C7",
      subtitleBgColor: "#FACC15",
      subtitleTextColor: "#1E293B",
      footerBgColor: "#0F766E",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: ART_CARD_PACKS[2].cards,
    },
  },

  // --- High-Appeal Showcase Designs ---
  {
    id: "space-explorer-pack",
    label: "Galaxy Space & Rocket Coloring Kit",
    badge: "Space 3D",
    category: "kids",
    config: {
      aspect: "9:16",
      layout: "diagonal-cascade-5",
      backdrop: "galaxy-nebula-desk",
      plaqueStyle: "scallop-frame",
      plaqueBgColor: "#1E1B4B",
      accentBadge: "20",
      titleLine1: "Blast Off!",
      titleLine2Ribbon: "Space & Rockets",
      titleLine3: "Coloring Adventure",
      subtitleText: "Planets, Robots & UFOs",
      footerBrandText: "GBTK Space Editions",
      primaryColor: "#38BDF8",
      secondaryColor: "#FACC15",
      ribbonColor: "#7C3AED",
      title1Color: "#38BDF8",
      title1Style: "block-3d",
      title2TextColor: "#FFFFFF",
      title2Style: "ribbon",
      title3Color: "#FDE047",
      title3Style: "shadow",
      subtitleBgColor: "#0EA5E9",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#7C3AED",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "sparkle",
      showCardCaptions: true,
      cards: ART_CARD_PACKS[3].cards,
    },
  },
  {
    id: "candy-pastel-rainbow",
    label: "Pastel Confetti Kids Sticker & Art Bundle",
    badge: "Candy Pop",
    category: "kids",
    config: {
      aspect: "4:5",
      layout: "spotlight-trio-3",
      backdrop: "candy-pastel-confetti",
      plaqueStyle: "scallop-frame",
      accentBadge: "30",
      titleLine1: "Sweet & Happy",
      titleLine2Ribbon: "Pastel Art Pack",
      titleLine3: "Stickers & Printables",
      subtitleText: "Instant Cute Collection",
      footerBrandText: "GBTK Kids Club",
      primaryColor: "#EC4899",
      secondaryColor: "#7C3AED",
      ribbonColor: "#F43F5E",
      title1Style: "block-3d",
      title3Style: "shadow",
      subtitleBgColor: "#38BDF8",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#7C3AED",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "hearts",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[2].cards[4],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[4].cards[0],
        ART_CARD_PACKS[2].cards[0],
        ART_CARD_PACKS[4].cards[4],
      ],
    },
  },
  {
    id: "dino-jungle-jumbo",
    label: "Roar-Some Dino & Jungle Jumbo Pack",
    badge: "Jumbo 40",
    category: "kids",
    config: {
      aspect: "9:16",
      layout: "hero-plus-4",
      backdrop: "spring-botanical-oak",
      plaqueStyle: "polaroid-strip",
      accentBadge: "40",
      titleLine1: "Roar-Some",
      titleLine2Ribbon: "Dinosaur World",
      titleLine3: "Kids Coloring Book",
      subtitleText: "300+ DPI Crisp Outlines",
      footerBrandText: "Dino Print Studio",
      primaryColor: "#15803D",
      secondaryColor: "#B45309",
      ribbonColor: "#EA580C",
      title1Style: "block-3d",
      title3Style: "outline-3d",
      subtitleBgColor: "#14532D",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#EA580C",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: true,
      cards: ART_CARD_PACKS[2].cards,
    },
  },
  {
    id: "myanmar-alphabet-kids",
    label: "Myanmar Preschool & Alphabet Fun Book",
    badge: "MM Kids",
    category: "myanmar",
    config: {
      aspect: "4:5",
      layout: "diagonal-cascade-5",
      backdrop: "candy-pastel-confetti",
      plaqueStyle: "cloud-sticker",
      accentBadge: "၃၃",
      titleLine1: "ပျော်ရွှင်စရာ",
      titleLine2Ribbon: "မြန်မာစာနှင့် ပုံဆွဲစာအုပ်",
      titleLine3: "ကလေးများအတွက် လေ့ကျင့်ခန်း",
      subtitleText: "ရောင်စုံပုံလေးများဖြင့် သင်ယူမယ်",
      footerBrandText: "GBTK Kids Myanmar",
      primaryColor: "#2563EB",
      secondaryColor: "#E11D48",
      ribbonColor: "#2563EB",
      title1Style: "outline-3d",
      title3Style: "outline-3d",
      subtitleBgColor: "#E11D48",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#0EA5E9",
      fontFamily: "'Padauk', 'Noto Sans Myanmar', sans-serif",
      decorTheme: "stars",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[5].cards[2],
        ART_CARD_PACKS[5].cards[5],
        ART_CARD_PACKS[5].cards[1],
        ART_CARD_PACKS[5].cards[4],
        ART_CARD_PACKS[5].cards[0],
        ART_CARD_PACKS[5].cards[3],
      ],
    },
  },
  {
    id: "autumn-cozy-harvest",
    label: "Cozy Autumn Crafts & Classroom Pack",
    badge: "Autumn Warm",
    category: "seasonal",
    config: {
      aspect: "9:16",
      layout: "diagonal-cascade-5",
      backdrop: "craft-table-lights",
      plaqueStyle: "wood-plaque",
      accentBadge: "24",
      titleLine1: "Cozy Fall",
      titleLine2Ribbon: "Autumn Harvest",
      titleLine3: "Crafts & Printables",
      subtitleText: "Warm Classroom Projects",
      footerBrandText: "CraftTable Studio",
      primaryColor: "#C2410C",
      secondaryColor: "#78350F",
      ribbonColor: "#C2410C",
      title1Style: "outline-3d",
      title3Style: "outline-3d",
      subtitleBgColor: "#3F6212",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#9A3412",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[6].cards[1],
        ART_CARD_PACKS[0].cards[0],
        ART_CARD_PACKS[6].cards[5],
        ART_CARD_PACKS[6].cards[3],
        ART_CARD_PACKS[0].cards[3],
        ART_CARD_PACKS[6].cards[0],
      ],
    },
  },
  {
    id: "blush-floral-valentine",
    label: "Blush Floral & Sweetheart Gift Cards",
    badge: "Blush Floral",
    category: "seasonal",
    config: {
      aspect: "4:5",
      layout: "clean-grid-4",
      backdrop: "blush-floral-linen",
      plaqueStyle: "scallop-frame",
      accentBadge: "18",
      titleLine1: "Sweetheart",
      titleLine2Ribbon: "Blush & Blossom",
      titleLine3: "Greeting Cards & Art",
      subtitleText: "Hand-Painted Spring Kit",
      footerBrandText: "Rosewood Atelier",
      primaryColor: "#BE185D",
      secondaryColor: "#881337",
      ribbonColor: "#E11D48",
      title1Style: "shadow",
      title3Style: "shadow",
      subtitleBgColor: "#881337",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#BE185D",
      fontFamily: "'Caveat', 'Padauk', cursive",
      decorTheme: "hearts",
      showCardCaptions: true,
      cards: [
        ART_CARD_PACKS[6].cards[3],
        ART_CARD_PACKS[2].cards[1],
        ART_CARD_PACKS[4].cards[2],
        ART_CARD_PACKS[5].cards[4],
        ART_CARD_PACKS[2].cards[5],
        ART_CARD_PACKS[6].cards[1],
      ],
    },
  },
  {
    id: "winter-frosted-wonderland",
    label: "Frosted Winter Wonderland Bundle",
    badge: "Winter Ice",
    category: "seasonal",
    config: {
      aspect: "9:16",
      layout: "center-plaque-6",
      backdrop: "ocean-mint-atelier",
      plaqueStyle: "cloud-sticker",
      accentBadge: "35",
      titleLine1: "Frosted",
      titleLine2Ribbon: "Winter Wonderland",
      titleLine3: "Coloring & Craft Kit",
      subtitleText: "Snowy Day Printable Fun",
      footerBrandText: "GBTK Winter Pack",
      primaryColor: "#0369A1",
      secondaryColor: "#0F766E",
      ribbonColor: "#0284C7",
      title1Style: "block-3d",
      title3Style: "outline-3d",
      subtitleBgColor: "#E11D48",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#0F766E",
      fontFamily: "'Fredoka', 'Padauk', sans-serif",
      decorTheme: "christmas",
      showCardCaptions: false,
      cards: [
        ART_CARD_PACKS[0].cards[4],
        ART_CARD_PACKS[0].cards[5],
        ART_CARD_PACKS[1].cards[1],
        ART_CARD_PACKS[1].cards[0],
        ART_CARD_PACKS[1].cards[2],
        ART_CARD_PACKS[0].cards[1],
      ],
    },
  },
  {
    id: "botanical-mandala-luxe",
    label: "Botanical Mandala Luxury Coloring Edition",
    badge: "Luxe Gold",
    category: "aesthetic",
    config: {
      aspect: "2:3",
      layout: "spotlight-trio-3",
      backdrop: "editorial-sage-marble",
      plaqueStyle: "scallop-frame",
      plaqueBgColor: "#FFFFFF",
      accentBadge: "",
      titleLine1: "Mindful Ink",
      titleLine2Ribbon: "Botanical Mandala",
      titleLine3: "Luxury Coloring Book",
      subtitleText: "40 Intricate Floral Pages",
      footerBrandText: "Atelier Botanical",
      primaryColor: "#065F46",
      secondaryColor: "#B45309",
      ribbonColor: "#064E3B",
      title1Color: "#B45309",
      title1Style: "shadow",
      title2TextColor: "#FEF3C7",
      title2Style: "ribbon",
      title3Color: "#065F46",
      title3Style: "clean",
      subtitleBgColor: "#D97706",
      subtitleTextColor: "#FFFFFF",
      footerBgColor: "#064E3B",
      fontFamily: "'Bricolage Grotesque', 'Padauk', sans-serif",
      decorTheme: "botanical",
      showCardCaptions: true,
      cards: ART_CARD_PACKS[6].cards,
    },
  },
];

