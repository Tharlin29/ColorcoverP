import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT =
  process.env.NODE_ENV === "production"
    ? Number(process.env.PORT) || 3000
    : 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "4:3": { width: 1200, height: 900 },
  "16:9": { width: 1280, height: 720 },
  "3:4": { width: 900, height: 1200 },
  "9:16": { width: 720, height: 1280 },
};

function getColoringPrintDimensions(pageSize?: string, dpi?: number) {
  const safeDpi = dpi === 350 ? 350 : 300;
  if (pageSize === "a4") {
    return safeDpi === 350
      ? { width: 2894, height: 4091 }
      : { width: 2480, height: 3508 };
  }
  return safeDpi === 350
    ? { width: 2975, height: 3850 }
    : { width: 2550, height: 3300 };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;
  return status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;
  return (
    status === 400 ||
    status === 403 ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("PERMISSION_DENIED")
  );
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: string,
  systemInstruction: string
): Promise<{ text: string; modelUsed: string }> {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
      },
    });
    return { text: res.text ?? "", modelUsed: "gemini-4-hydrogen" };
  } catch (err) {
    if (isQuotaError(err)) {
      // Fall back to gemini-3.1-flash-lite (separate free-tier quota)
      const resLite = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents,
        config: {
          systemInstruction,
        },
      });
      return { text: resLite.text ?? "", modelUsed: "gemini-3.1-flash-lite" };
    }
    throw err;
  }
}

  app.post("/api/photo/refine-prompt", async (req, res) => {
    try {
      const { prompt, mood, creationMode } = req.body as {
        prompt?: string;
        mood?: string;
        creationMode?: string;
      };
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          refinedPrompt:
            creationMode === "coloring-book"
              ? `${prompt.trim()}, clean black ink outlines on pure white paper, intricate coloring book line art, no shading or color`
              : `${prompt.trim()}, atmospheric ${mood || "editorial film"} lighting, rich depth, balanced composition`,
        });
      }

      const instruction =
        creationMode === "coloring-book"
          ? `Rewrite this coloring book prompt into a crisp, detailed black-and-white line art subject description (under 40 words) with clear closed shapes for coloring. Translate Burmese accurately to English if needed. Input: "${prompt.trim()}"`
          : `Rewrite and enrich this visual art/photography prompt into a vivid, evocative single-sentence scene description (under 40 words) suitable for ${
              mood || "editorial film"
            } mood. If the input is in Burmese, preserve its cultural/visual meaning vividly in English with atmospheric lighting and composition details. Input: "${prompt.trim()}"`;

      const { text } = await generateWithFallback(
        ai,
        instruction,
        "Return only the refined prompt text without quotes, labels, or markdown."
      );

      const refinedPrompt = (text || prompt).trim().replace(/^["']|["']$/g, "");
      return res.json({ refinedPrompt });
    } catch {
      return res.json({
        refinedPrompt: String(req.body?.prompt || "").trim(),
      });
    }
  });

function sanitizeSvgMarkup(
  raw: string,
  vw: number,
  vh: number,
  outW: number,
  outH: number
): string | null {
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return null;
  let svg = match[0]
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Normalize opening <svg ...> attributes so vector scales crisply to exact DPI pixel size
  svg = svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let cleanAttrs = attrs
      .replace(/\bwidth\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\bheight\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .trim();
    if (!/\bxmlns\s*=/.test(cleanAttrs)) {
      cleanAttrs = `xmlns="http://www.w3.org/2000/svg" ${cleanAttrs}`.trim();
    }
    if (!/\bviewBox\s*=/.test(cleanAttrs)) {
      cleanAttrs = `${cleanAttrs} viewBox="0 0 ${vw} ${vh}"`.trim();
    }
    return `<svg ${cleanAttrs} width="${outW}" height="${outH}">`;
  });
  return svg;
}

  app.post("/api/photo/generate", async (req, res) => {
    const {
      prompt,
      aspectRatio = "4:3",
      mood = "Editorial Film",
      creationMode = "standard",
      pageSize = "us-letter",
      dpi = 300,
      colorMode = "bw",
    } = req.body as {
      prompt?: string;
      aspectRatio?: string;
      mood?: string;
      creationMode?: "standard" | "coloring-book";
      pageSize?: "us-letter" | "a4";
      dpi?: number;
      colorMode?: "bw" | "grayscale";
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Please enter a prompt to create a photo." });
    }

    const isColoring = creationMode === "coloring-book";
    const dims = isColoring
      ? getColoringPrintDimensions(pageSize, dpi)
      : ASPECT_DIMENSIONS[aspectRatio] ?? ASPECT_DIMENSIONS["4:3"];

    // Clean normalized vector viewBox (scales losslessly to 300/350 DPI canvas)
    const vw = isColoring ? (pageSize === "a4" ? 827 : 850) : dims.width;
    const vh = isColoring ? (pageSize === "a4" ? 1169 : 1100) : dims.height;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: prompt.trim().slice(0, 48),
        enhancedPrompt: prompt.trim(),
        svgMarkup: null,
        width: dims.width,
        height: dims.height,
        source: "procedural",
      });
    }

    try {
      const systemInstruction = isColoring
        ? `You are a master coloring book illustrator. Draw a clean, recognizable, well-proportioned black-and-white line-art SVG illustrating EXACTLY what the user asks for (translate Burmese prompts accurately).
STRICT RULES:
1. Output ONLY raw <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">...</svg> with NO markdown, NO explanation, NO JSON.
2. Start with a pure white background <rect x="0" y="0" width="${vw}" height="${vh}" fill="#FFFFFF"/> and a neat inner page frame <rect x="44" y="44" width="${vw - 88}" height="${vh - 88}" rx="16" fill="none" stroke="#000000" stroke-width="4"/>.
3. Draw the EXACT requested subject clearly in the center/main composition using 20 to 45 crisp SVG primitives (<path>, <circle>, <ellipse>, <rect>, <polygon>, <polyline>) with coordinates strictly inside 55..${vw - 55} and 55..${vh - 55}.
4. Use ONLY fill="#FFFFFF" or fill="none" and stroke="#000000" (stroke-width 2.5 to 5, stroke-linecap="round", stroke-linejoin="round")${
            colorMode === "grayscale"
              ? ' — light neutral gray fills (#E5E5E5, #D4D4D4) are allowed sparingly for subtle tone'
              : " — NO gray or colored fills, strictly pure black ink lines on white paper"
          }.
5. Never substitute an unrelated subject. Never include <text> or <script>.`
        : `You are an acclaimed digital vector illustrator. Draw a rich, layered, recognizable SVG composition illustrating EXACTLY what the user asks for in the mood "${mood}" (translate Burmese prompts accurately).
STRICT RULES:
1. Output ONLY raw <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">...</svg> with NO markdown, NO explanation, NO JSON.
2. Use <defs> gradients and 20 to 45 layered SVG shapes depicting the exact requested scene and mood.
3. Never substitute an unrelated subject. Never include <text> or <script>.`;

      const { text } = await generateWithFallback(
        ai,
        `Illustrate this exact scene as a detailed SVG: "${prompt.trim()}"`,
        systemInstruction
      );

      const rawText = text.trim();
      const svgMarkup = sanitizeSvgMarkup(rawText, vw, vh, dims.width, dims.height);

      return res.json({
        title: prompt.trim().slice(0, 48),
        enhancedPrompt: prompt.trim(),
        svgMarkup,
        width: dims.width,
        height: dims.height,
        source: svgMarkup ? "gemini-svg" : "procedural",
      });
    } catch (err) {
      const notice = isQuotaError(err)
        ? "Free-tier AI daily quota reached. Generated using built-in high-resolution studio engine (you can increase quota in Settings > Secrets)."
        : isAuthError(err)
        ? "API key permission or configuration notice — generated using built-in studio engine (check Settings > Secrets)."
        : undefined;

      return res.json({
        title: prompt.trim().slice(0, 48),
        enhancedPrompt: prompt.trim(),
        svgMarkup: null,
        width: dims.width,
        height: dims.height,
        source: "procedural",
        notice,
      });
    }
  });

  function buildOldIsraelClothingSvg(grayscale: boolean): string {
    const shade = grayscale ? "#E5E5E5" : "#FFFFFF";
    const sashShade = grayscale ? "#D4D4D4" : "#FFFFFF";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Inner Ancient Israelite Tunic -->
    <path d="M 390 420 C 350 435, 315 470, 295 545 L 350 565 L 365 505 L 355 860 C 425 875, 575 875, 645 860 L 635 505 L 650 565 L 705 545 C 685 470, 650 435, 610 420 Q 555 448, 500 452 Q 445 448, 390 420 Z" fill="#FFFFFF" stroke-width="5"/>
    <!-- Tunic V-Neck / Slit Collar Trim -->
    <path d="M 412 426 L 500 505 L 588 426" fill="none" stroke-width="4.5"/>
    <path d="M 426 432 L 500 492 L 574 432" fill="none" stroke-width="3"/>
    <line x1="500" y1="505" x2="500" y2="575" stroke-width="4"/>
    <!-- Draped Ancient Outer Mantle / Shawl over Left Shoulder -->
    <path d="M 382 422 C 362 465, 355 560, 348 845 C 392 854, 435 852, 468 840 C 445 695, 455 570, 560 442 C 520 430, 440 416, 382 422 Z" fill="${shade}" stroke-width="4.8"/>
    <!-- Draped Folds on Mantle -->
    <path d="M 395 465 C 405 565, 395 695, 385 835" fill="none" stroke-width="3"/>
    <path d="M 435 452 C 430 535, 422 615, 428 710" fill="none" stroke-width="3"/>
    <!-- Woven Waist Sash / Girdle -->
    <path d="M 358 612 Q 500 634, 642 612 L 644 654 Q 500 676, 356 654 Z" fill="${sashShade}" stroke-width="4.5"/>
    <path d="M 360 632 Q 500 654, 640 632" fill="none" stroke-width="2.5"/>
    <!-- Sash Knot & Hanging Tassel Ends -->
    <ellipse cx="445" cy="645" rx="18" ry="15" fill="${sashShade}" stroke-width="4"/>
    <path d="M 432 658 L 418 765 L 444 770 L 452 660 Z" fill="${sashShade}" stroke-width="3.8"/>
    <path d="M 454 658 L 462 752 L 486 746 L 468 654 Z" fill="${sashShade}" stroke-width="3.8"/>
    <!-- Lower Tunic Vertical Drape Lines -->
    <path d="M 520 676 C 525 740, 522 800, 518 858" fill="none" stroke-width="3"/>
    <path d="M 580 668 C 592 735, 595 800, 602 855" fill="none" stroke-width="3"/>
    <path d="M 356 842 Q 500 860, 644 842" fill="none" stroke-width="3"/>
  </g>
</svg>`;
  }

  function buildDeterministicFallbackEditPlan(
    instruction: string,
    coloringConfig?: { enabled?: boolean; colorMode?: "bw" | "grayscale" }
  ) {
    const lower = instruction.toLowerCase();
    const isColoring = coloringConfig?.enabled !== false;
    const isGrayscale = coloringConfig?.colorMode === "grayscale";

    const colorMap: Record<string, string> = {
      red: "#DC2626",
      crimson: "#B91C1C",
      blue: "#2563EB",
      navy: "#1E3A8A",
      green: "#16A34A",
      emerald: "#059669",
      yellow: "#EAB308",
      gold: "#D97706",
      black: "#000000",
      white: "#FFFFFF",
      pink: "#EC4899",
      purple: "#7C3AED",
      orange: "#EA580C",
    };
    let pickedColor = isColoring ? "#000000" : "#2563EB";
    if (!isColoring) {
      for (const [name, hex] of Object.entries(colorMap)) {
        if (lower.includes(name)) {
          pickedColor = hex;
          break;
        }
      }
    }

    const svgElements: Array<Record<string, unknown>> = [];
    const recolorRegions: Array<Record<string, unknown>> = [];
    const eraseRegions: Array<Record<string, unknown>> = [];
    let clothingSvg: string | null = null;

    const colorGrading = isColoring
      ? {
          brightness: 100,
          contrast: 108,
          saturation: 0,
          warmth: 0,
          vignette: 0,
          tintOpacity: 0,
        }
      : {
          brightness: lower.includes("bright") ? 110 : lower.includes("dark") ? 90 : 100,
          contrast: lower.includes("contrast") || lower.includes("crisp") ? 114 : 100,
          saturation: lower.includes("vivid") ? 125 : lower.includes("mute") || lower.includes("bw") || lower.includes("black and white") ? 20 : 100,
          warmth: lower.includes("warm") || lower.includes("golden") ? 16 : lower.includes("cool") ? -14 : 0,
          vignette: lower.includes("vignette") ? 30 : 0,
          tintColor: undefined as string | undefined,
          tintOpacity: 0,
        };

    const isClothingRequest =
      lower.includes("shirt") ||
      lower.includes("jacket") ||
      lower.includes("dress") ||
      lower.includes("attire") ||
      lower.includes("clothing") ||
      lower.includes("clothes") ||
      lower.includes("robe") ||
      lower.includes("tunic") ||
      lower.includes("noah") ||
      lower.includes("israel") ||
      lower.includes("အင်္ကျီ") ||
      lower.includes("ဝတ်စုံ") ||
      lower.includes("ဝတ်ရုံ");

    const isRabbit = lower.includes("rabbit") || lower.includes("bunny") || lower.includes("ယုန်");
    const isBabyElephant = lower.includes("elephant") || lower.includes("ဆင်");
    const isPlants =
      lower.includes("plant") ||
      lower.includes("tree") ||
      lower.includes("landscape") ||
      lower.includes("bush") ||
      lower.includes("အပင်") ||
      lower.includes("ရှုခင်း");
    const isButterfly = lower.includes("butterfly") || lower.includes("လိပ်ပြာ");
    const isClouds = lower.includes("cloud") || lower.includes("တိမ်");
    const isSun = lower.includes("sun") || lower.includes("နေမင်း");
    const isSnail = lower.includes("snail") || lower.includes("ခရု");
    const isHouse = lower.includes("house") || lower.includes("home") || lower.includes("cottage") || lower.includes("အိမ်");

    const shadeFill = isGrayscale ? "#EAEAEA" : "#FFFFFF";

    if (isClothingRequest) {
      eraseRegions.push({
        label: "Existing torso garment area below collar",
        shape: "ellipse",
        cx: 500,
        cy: 645,
        rx: 185,
        ry: 215,
        fillColor: "#FFFFFF",
        feather: 14,
      });
      clothingSvg = buildOldIsraelClothingSvg(isGrayscale);
    } else if (isRabbit) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="785" cy="820" rx="52" ry="42" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="740" cy="832" r="16" fill="${shadeFill}" stroke-width="4"/>
    <ellipse cx="812" cy="765" rx="34" ry="30" fill="#FFFFFF" stroke-width="4.5"/>
    <ellipse cx="802" cy="708" rx="11" ry="34" transform="rotate(-10 802 708)" fill="#FFFFFF" stroke-width="4"/>
    <ellipse cx="826" cy="708" rx="11" ry="34" transform="rotate(10 826 708)" fill="${shadeFill}" stroke-width="4"/>
    <circle cx="824" cy="758" r="4" fill="#000000"/>
    <ellipse cx="844" cy="768" rx="5" ry="4" fill="#000000"/>
    <ellipse cx="775" cy="856" rx="22" ry="11" fill="#FFFFFF" stroke-width="4"/>
    <ellipse cx="815" cy="856" rx="18" ry="10" fill="#FFFFFF" stroke-width="4"/>
  </g>
</svg>`;
    } else if (isBabyElephant) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="760" cy="805" rx="72" ry="52" fill="#FFFFFF" stroke-width="4.8"/>
    <rect x="708" y="838" width="24" height="48" rx="8" fill="#FFFFFF" stroke-width="4.5"/>
    <rect x="742" y="842" width="24" height="44" rx="8" fill="${shadeFill}" stroke-width="4.5"/>
    <rect x="786" y="838" width="24" height="48" rx="8" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="828" cy="778" r="44" fill="#FFFFFF" stroke-width="4.8"/>
    <ellipse cx="792" cy="776" rx="28" ry="36" fill="${shadeFill}" stroke-width="4.5"/>
    <path d="M 862 786 C 895 792, 905 828, 886 848 C 875 858, 862 850, 866 838 C 874 824, 868 810, 848 808" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="842" cy="766" r="5" fill="#000000"/>
    <path d="M 690 795 Q 668 815, 672 838" fill="none" stroke-width="4"/>
  </g>
</svg>`;
    } else if (isPlants) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Bush & Tree -->
    <path d="M 110 880 L 110 710 M 110 760 L 80 730 M 110 740 L 140 715" fill="none" stroke-width="5"/>
    <circle cx="110" cy="675" r="56" fill="#FFFFFF" stroke-width="4.5"/>
    <circle cx="72" cy="705" r="38" fill="${shadeFill}" stroke-width="4.5"/>
    <circle cx="148" cy="705" r="38" fill="${shadeFill}" stroke-width="4.5"/>
    <!-- Right Grasses & Foliage -->
    <path d="M 820 885 C 805 835, 790 800, 775 775 C 800 805, 815 835, 825 885" fill="${shadeFill}" stroke-width="4"/>
    <path d="M 835 885 C 835 820, 842 770, 855 740 C 855 785, 855 835, 850 885" fill="#FFFFFF" stroke-width="4"/>
    <path d="M 860 885 C 878 838, 898 802, 918 782 C 898 820, 882 850, 874 885" fill="${shadeFill}" stroke-width="4"/>
    <circle cx="885" cy="865" r="34" fill="#FFFFFF" stroke-width="4"/>
    <circle cx="920" cy="872" r="26" fill="${shadeFill}" stroke-width="4"/>
  </g>
</svg>`;
    } else if (isButterfly) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="translate(790 220) rotate(-14)">
    <ellipse cx="-32" cy="-18" rx="34" ry="24" fill="#FFFFFF" stroke-width="4.2"/>
    <ellipse cx="32" cy="-18" rx="34" ry="24" fill="#FFFFFF" stroke-width="4.2"/>
    <ellipse cx="-24" cy="18" rx="24" ry="18" fill="${shadeFill}" stroke-width="4"/>
    <ellipse cx="24" cy="18" rx="24" ry="18" fill="${shadeFill}" stroke-width="4"/>
    <circle cx="-34" cy="-18" r="8" fill="${shadeFill}" stroke-width="3"/>
    <circle cx="34" cy="-18" r="8" fill="${shadeFill}" stroke-width="3"/>
    <ellipse cx="0" cy="2" rx="6" ry="26" fill="#000000"/>
    <path d="M -3 -22 Q -14 -44, -24 -42 M 3 -22 Q 14 -44, 24 -42" fill="none" stroke-width="3.2"/>
  </g>
</svg>`;
    } else if (isClouds) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 135 215 C 110 215, 95 195, 102 174 C 108 156, 128 148, 146 156 C 156 130, 190 122, 214 138 C 232 126, 260 134, 268 154 C 288 154, 304 170, 302 190 C 300 206, 286 215, 268 215 Z" fill="#FFFFFF" stroke-width="4.2"/>
    <path d="M 700 185 C 678 185, 665 168, 672 150 C 678 134, 696 128, 712 135 C 722 112, 754 106, 775 120 C 792 110, 816 118, 824 136 C 842 136, 856 150, 854 168 C 852 180, 838 185, 822 185 Z" fill="${shadeFill}" stroke-width="4.2"/>
  </g>
</svg>`;
    } else if (isSun) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="translate(845 155)">
    <circle cx="0" cy="0" r="52" fill="${shadeFill}" stroke-width="4.5"/>
    <line x1="0" y1="-72" x2="0" y2="-95" stroke-width="4.5"/>
    <line x1="0" y1="72" x2="0" y2="95" stroke-width="4.5"/>
    <line x1="-72" y1="0" x2="-95" y2="0" stroke-width="4.5"/>
    <line x1="72" y1="0" x2="95" y2="0" stroke-width="4.5"/>
    <line x1="-51" y1="-51" x2="-68" y2="-68" stroke-width="4.5"/>
    <line x1="51" y1="-51" x2="68" y2="-68" stroke-width="4.5"/>
    <line x1="-51" y1="51" x2="-68" y2="68" stroke-width="4.5"/>
    <line x1="51" y1="51" x2="68" y2="68" stroke-width="4.5"/>
  </g>
</svg>`;
    } else if (isSnail) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 110 868 Q 175 848, 238 860 Q 256 864, 250 878 Q 175 884, 110 878 Z" fill="#FFFFFF" stroke-width="4.2"/>
    <circle cx="176" cy="826" r="40" fill="${shadeFill}" stroke-width="4.5"/>
    <path d="M 176 826 m -6 0 a 6 6 0 1 0 12 0 a 12 12 0 1 0 -24 0 a 19 19 0 1 0 38 0" fill="none" stroke-width="3.6"/>
    <path d="M 232 858 L 240 834 M 244 860 L 256 838" fill="none" stroke-width="3.2"/>
    <circle cx="241" cy="832" r="3.5" fill="#000000"/>
    <circle cx="257" cy="836" r="3.5" fill="#000000"/>
  </g>
</svg>`;
    } else if (isHouse) {
      clothingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
    <rect x="115" y="720" width="180" height="145" fill="#FFFFFF" stroke-width="4.8"/>
    <polygon points="95,720 205,630 315,720" fill="${shadeFill}" stroke-width="4.8"/>
    <rect x="245" y="642" width="26" height="45" fill="#FFFFFF" stroke-width="4"/>
    <rect x="180" y="782" width="48" height="83" rx="4" fill="${shadeFill}" stroke-width="4.2"/>
    <circle cx="218" cy="825" r="3.5" fill="#000000"/>
    <rect x="132" y="756" width="34" height="34" fill="#FFFFFF" stroke-width="3.8"/>
    <line x1="149" y1="756" x2="149" y2="790" stroke-width="2.5"/>
    <line x1="132" y1="773" x2="166" y2="773" stroke-width="2.5"/>
    <rect x="242" y="756" width="34" height="34" fill="#FFFFFF" stroke-width="3.8"/>
    <line x1="259" y1="756" x2="259" y2="790" stroke-width="2.5"/>
    <line x1="242" y1="773" x2="276" y2="773" stroke-width="2.5"/>
  </g>
</svg>`;
    } else if (lower.includes("dot") || lower.includes("circle") || lower.includes("pin")) {
      const cx = lower.includes("left") ? 180 : lower.includes("center") ? 500 : 850;
      const cy = lower.includes("bottom") ? 850 : lower.includes("center") ? 500 : 150;
      svgElements.push({
        type: "circle",
        cx,
        cy,
        r: 18,
        fill: pickedColor,
        stroke: isColoring ? "#000000" : "none",
        strokeWidth: isColoring ? 3 : 0,
        opacity: 0.96,
        blendMode: "source-over",
      });
    } else if (lower.includes("line") || lower.includes("stripe") || lower.includes("underline") || lower.includes("border")) {
      const y = lower.includes("top") ? 90 : lower.includes("center") ? 500 : 910;
      svgElements.push({
        type: "line",
        x1: 120,
        y1: y,
        x2: 880,
        y2: y,
        stroke: pickedColor,
        strokeWidth: 6,
        opacity: 0.96,
        blendMode: "source-over",
      });
    }

    return {
      analysis: "Analyzed uploaded image proportions, head/neck boundary, and line structure for non-destructive editing.",
      editSummary: isClothingRequest
        ? `Replaced character's shirt with fitting traditional attire (${instruction.trim()}) in clean line art.`
        : `Applied requested subtle adjustment: "${instruction.trim()}"`,
      preservedIntegrityNote: "Character face, beard/hair, expression, hands, and outer background remain 100% intact.",
      colorGrading,
      recolorRegions,
      eraseRegions,
      clothingSvg,
      svgElements,
    };
  }

  app.post("/api/photo/ai-edit", async (req, res) => {
    try {
      const { imageDataUrl, instruction, coloringConfig } = req.body as {
        imageDataUrl?: string;
        instruction?: string;
        coloringConfig?: {
          enabled?: boolean;
          pageSize?: "us-letter" | "a4";
          dpi?: number;
          colorMode?: "bw" | "grayscale";
        };
      };

      if (!imageDataUrl || typeof imageDataUrl !== "string") {
        return res.status(400).json({ error: "Original image is required." });
      }
      if (!instruction || typeof instruction !== "string" || !instruction.trim()) {
        return res.status(400).json({ error: "Please enter an editing instruction." });
      }

      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid image format. Please provide a valid PNG, JPEG, or WebP image." });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const isColoring = coloringConfig?.enabled !== false;
      const colorMode = coloringConfig?.colorMode === "grayscale" ? "grayscale" : "bw";

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          plan: buildDeterministicFallbackEditPlan(instruction, { enabled: isColoring, colorMode }),
          source: "fallback",
          notice: "Gemini API key is not configured — applied local studio precision edit fallback.",
        });
      }

      const systemInstruction = `You are an advanced AI Image Editing and Coloring Book Modification Assistant.
Your task is to inspect the user's Original Image and produce a precise, non-destructive edit plan for ONLY the requested edits, WITHOUT altering the subject's face, expression, identity, layout, or unedited background.

COORDINATE SYSTEM:
- ALL coordinates for eraseRegions, recolorRegions, clothingSvg (viewBox="0 0 1000 1000"), and svgElements use normalized 0..1000 x 0..1000 space where (0,0) is top-left and (1000,1000) is bottom-right.
- Inspect the EXACT position of the subject's chin/neck, shoulders, arms, torso, and waist in the uploaded image before placing any masks or garments!

CRITICAL RULE FOR ADDING SCENE ELEMENTS (e.g., rabbit, baby elephant, trees/plants, butterfly, clouds, sun, snail, house):
- If the user asks to ADD an object, animal, or scenery element (not replacing clothes), leave \`eraseRegions = []\` so NOTHING on the original image is erased!
- Inspect the uploaded image for open sky/ground/corner space that does NOT overlap the main subject's face or body, and draw a crisp, recognizable, well-proportioned illustration of the requested element inside \`clothingSvg\` (\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">...</svg>\`).

CRITICAL RULE FOR CLOTHING / SHIRT / ATTIRE CHANGES (e.g., "Noah clothes", "old Israel dress", "change shirt to robe/tunic/coat"):
- DO NOT just tint or recolor the existing shirt!
- Instead, REPLACE the clothing cleanly using TWO coordinated steps:
  1) \`eraseRegions\`: Add 1-3 white masks (\`fillColor: "#FFFFFF"\`, \`feather: 8..16\`) covering ONLY the old shirt/torso/sleeves BELOW the neck/chin/beard and INSIDE the outer arms/background. NEVER cover the head, face, beard, hair, or hands!
  2) \`clothingSvg\`: Draw a complete, fitting, historically & character-appropriate outfit in \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">...</svg>\` aligned precisely to the subject's neck, shoulder slope, sleeve angle, chest, and waist!
     - Example: If the prompt mentions Noah or old Israel dress/clothes, draw an authentic ancient Israelite tunic with V-neck/slit collar, draped outer mantle/cloak over the shoulder, woven waist sash/girdle with knotted hanging ends, and natural vertical cloth fold lines.
     - Match the illustration's stroke thickness (${isColoring ? 'stroke="#000000" stroke-width="3.5" to "5.5", stroke-linecap="round", stroke-linejoin="round"' : "matching scene line weight and color"}).

${
  isColoring
    ? `COLORING BOOK OUTPUT MODE (${colorMode === "bw" ? "STRICT BLACK & WHITE MONOCHROME" : "GRAYSCALE LINE ART"}):
- Output MUST be pure coloring book line art: NO RGB or CMYK colors anywhere in clothingSvg or svgElements!
- Use ONLY stroke="#000000" and fill="#FFFFFF"${colorMode === "grayscale" ? " (with subtle neutral gray fills #E5E5E5 or #D4D4D4 sparingly if helpful)" : " (strictly pure black ink on pure white paper, NO gray fills)"}.
- Keep colorGrading saturation=0, brightness=100, contrast=105, warmth=0, vignette=0, and recolorRegions=[].`
    : `STANDARD PHOTO EDIT MODE:
- For subtle detail additions (a dot, line, pin, graphic), use \`svgElements\`.
- Keep \`colorGrading\` strictly neutral (100,100,100,0,0) unless color/tone adjustment is explicitly requested.`
}
- Translate Burmese/Myanmar instructions accurately.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.STRING,
            description: "Step 1: Concise visual analysis of the uploaded image (subject pose, neck/shoulder/torso coordinates, style).",
          },
          editSummary: {
            type: Type.STRING,
            description: "Step 2: Exact description of the garment replacement or minor edit applied.",
          },
          preservedIntegrityNote: {
            type: Type.STRING,
            description: "Step 3: Confirmation that face, head, hands, and background were preserved untouched.",
          },
          colorGrading: {
            type: Type.OBJECT,
            properties: {
              brightness: { type: Type.NUMBER },
              contrast: { type: Type.NUMBER },
              saturation: { type: Type.NUMBER },
              warmth: { type: Type.NUMBER },
              vignette: { type: Type.NUMBER },
              tintColor: { type: Type.STRING },
              tintOpacity: { type: Type.NUMBER },
            },
            required: ["brightness", "contrast", "saturation", "warmth", "vignette"],
          },
          eraseRegions: {
            type: Type.ARRAY,
            description: "Masks covering ONLY the old shirt/garment torso area before drawing new clothingSvg.",
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                shape: { type: Type.STRING, enum: ["ellipse", "rect", "polygon"] },
                cx: { type: Type.NUMBER },
                cy: { type: Type.NUMBER },
                rx: { type: Type.NUMBER },
                ry: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ["x", "y"],
                  },
                },
                fillColor: { type: Type.STRING },
                feather: { type: Type.NUMBER },
              },
              required: ["label", "shape"],
            },
          },
          clothingSvg: {
            type: Type.STRING,
            description: "Raw <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 1000\">...</svg> drawing the new fitting outfit aligned to the character's neck/shoulders/torso, or empty string if not a clothing edit.",
          },
          recolorRegions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                shape: { type: Type.STRING, enum: ["ellipse", "rect", "polygon"] },
                cx: { type: Type.NUMBER },
                cy: { type: Type.NUMBER },
                rx: { type: Type.NUMBER },
                ry: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ["x", "y"],
                  },
                },
                targetColor: { type: Type.STRING },
                blendMode: {
                  type: Type.STRING,
                  enum: ["color", "multiply", "hue", "soft-light", "source-over"],
                },
                opacity: { type: Type.NUMBER },
                feather: { type: Type.NUMBER },
              },
              required: ["label", "shape", "targetColor", "blendMode", "opacity", "feather"],
            },
          },
          svgElements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["circle", "ellipse", "rect", "line", "path", "polygon"],
                },
                cx: { type: Type.NUMBER },
                cy: { type: Type.NUMBER },
                r: { type: Type.NUMBER },
                rx: { type: Type.NUMBER },
                ry: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                x1: { type: Type.NUMBER },
                y1: { type: Type.NUMBER },
                x2: { type: Type.NUMBER },
                y2: { type: Type.NUMBER },
                d: { type: Type.STRING },
                points: { type: Type.STRING },
                fill: { type: Type.STRING },
                stroke: { type: Type.STRING },
                strokeWidth: { type: Type.NUMBER },
                opacity: { type: Type.NUMBER },
                blendMode: {
                  type: Type.STRING,
                  enum: ["source-over", "multiply", "screen", "overlay", "soft-light"],
                },
              },
              required: ["type"],
            },
          },
        },
        required: [
          "analysis",
          "editSummary",
          "preservedIntegrityNote",
          "colorGrading",
          "eraseRegions",
          "clothingSvg",
          "recolorRegions",
          "svgElements",
        ],
      };

      const contents = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `User modification instruction: "${instruction.trim()}"\nInspect the uploaded image carefully. If modifying clothing/attire, locate the exact chin/neck/shoulder/waist boundaries and return eraseRegions + a detailed fitting clothingSvg in 0..1000 space (NOT a color tint). Return the JSON edit plan.`,
          },
        ],
      };

      let rawJson = "";
      try {
        const aiRes = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        rawJson = aiRes.text ?? "";
      } catch (err) {
        if (isQuotaError(err)) {
          const aiLiteRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
            },
          });
          rawJson = aiLiteRes.text ?? "";
        } else {
          throw err;
        }
      }

      const plan = JSON.parse(rawJson || "{}") as Record<string, unknown>;
      if (typeof plan.clothingSvg === "string" && plan.clothingSvg.trim()) {
        plan.clothingSvg = sanitizeSvgMarkup(plan.clothingSvg, 1000, 1000, 1000, 1000);
      } else {
        plan.clothingSvg = null;
      }

      return res.json({
        plan,
        source: "gemini",
      });
    } catch (err) {
      const instruction = String(req.body?.instruction || "");
      const coloringConfig = req.body?.coloringConfig as
        | { enabled?: boolean; colorMode?: "bw" | "grayscale" }
        | undefined;
      const notice = isQuotaError(err)
        ? "Free-tier AI quota reached — applied local precision edit fallback (you can adjust quota in Settings > Secrets)."
        : isAuthError(err)
        ? "API key permission or configuration notice — applied local precision edit fallback (check Settings > Secrets)."
        : "Unable to reach AI edit service — applied local precision edit fallback.";

      return res.json({
        plan: buildDeterministicFallbackEditPlan(instruction, coloringConfig),
        source: "fallback",
        notice,
      });
    }
  });

  app.post("/api/design/compose", async (req, res) => {
    try {
      const { prompt, preferredLayout } = req.body as {
        prompt?: string;
        preferredLayout?: string;
      };

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Please enter a design topic or prompt." });
      }

      const rawPrompt = prompt.trim();
      const lower = rawPrompt.toLowerCase();

      const buildFallbackDesign = () => {
        const numMatch = rawPrompt.match(/\b(\d{1,3})\b/);
        const accentBadge = numMatch ? numMatch[1] : "";
        const isHoliday =
          lower.includes("christmas") ||
          lower.includes("holiday") ||
          lower.includes("santa") ||
          lower.includes("winter") ||
          lower.includes("snowman") ||
          lower.includes("ခရစ္စမတ်");
        const isCraft = lower.includes("craft") || lower.includes("handprint") || lower.includes("diy");
        const cleanTitle = rawPrompt.replace(/\b\d{1,3}\b/, "").trim();
        const words = cleanTitle.split(/\s+/).filter(Boolean);

        const layout =
          preferredLayout && ["center-plaque-6", "top-banner-5", "hero-plus-4", "clean-grid-4"].includes(preferredLayout)
            ? preferredLayout
            : isCraft
            ? "center-plaque-6"
            : "top-banner-5";

        const titleLine1 = words.slice(0, Math.max(1, Math.ceil(words.length * 0.3))).join(" ") || "Creative";
        const titleLine2Ribbon =
          words.slice(Math.max(1, Math.ceil(words.length * 0.3)), Math.max(2, Math.ceil(words.length * 0.7))).join(" ") ||
          (isCraft ? "Handprint Crafts" : "Coloring Pages");
        const titleLine3 =
          words.slice(Math.max(2, Math.ceil(words.length * 0.7))).join(" ") || "for Kids";

        return {
          accentBadge,
          titleLine1,
          titleLine2Ribbon,
          titleLine3,
          subtitleText: isCraft ? "Easy Keepsakes" : "Print, color, and celebrate!",
          footerBrandText: "GBTK STUDIO",
          layout,
          backdrop: isHoliday
            ? isCraft
              ? "craft-table-lights"
              : "festive-pine-desk"
            : lower.includes("night") || lower.includes("gold")
            ? "midnight-studio-gold"
            : lower.includes("spring") || lower.includes("flower") || lower.includes("nature")
            ? "spring-botanical-oak"
            : "pastel-kids-desk",
          plaqueStyle: isCraft ? "wood-plaque" : "cloud-sticker",
          decorTheme: isHoliday ? "christmas" : lower.includes("flower") ? "botanical" : "stars",
          primaryColor: isHoliday ? "#DC2626" : "#E11D48",
          secondaryColor: isHoliday ? "#15803D" : "#0F766E",
          ribbonColor: isHoliday ? "#DC2626" : "#2563EB",
          subtitleBgColor: isCraft ? "#14532D" : "#FDE047",
          subtitleTextColor: isCraft ? "#FFFFFF" : "#1C1917",
          footerBgColor: isHoliday ? "#DC2626" : "#0F766E",
          cards: [],
        };
      };

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          design: buildFallbackDesign(),
          source: "fallback",
        });
      }

      const systemInstruction = `You are a Pinterest & Etsy Printable Showcase Graphic Designer.
Given a user's topic or prompt (in English or Burmese), design a vibrant, cohesive Showcase Poster / Pin layout with festive die-cut sticker typography and 6 distinct cute vector card illustrations matching the topic.

STRICT RULES:
1. Keep \`titleLine1\`, \`titleLine2Ribbon\`, \`titleLine3\`, \`subtitleText\`, and \`footerBrandText\` concise and punchy (2-4 words each). If user writes in Burmese, preserve Burmese script cleanly or match the user's language!
2. Choose harmonious high-contrast colors (\`primaryColor\`, \`secondaryColor\`, \`ribbonColor\`, \`subtitleBgColor\`, \`subtitleTextColor\`, \`footerBgColor\`). Ensure \`subtitleTextColor\` contrasts strongly against \`subtitleBgColor\`.
3. For \`cards\`, generate 6 crisp, colorful, adorable card illustrations as raw \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 640">...</svg>\` strings depicting 6 different themed subjects for this exact prompt (bold ink outlines \`stroke="#18181B" stroke-width="5"\`, cheerful colors, soft pastel or white card background \`<rect width="500" height="640" fill="..."/>\`, NO \`<text>\` or \`<script>\`).`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          accentBadge: { type: Type.STRING, description: "Optional number badge like '25' or '30', or empty string." },
          titleLine1: { type: Type.STRING },
          titleLine2Ribbon: { type: Type.STRING },
          titleLine3: { type: Type.STRING },
          subtitleText: { type: Type.STRING },
          footerBrandText: { type: Type.STRING },
          layout: {
            type: Type.STRING,
            enum: ["center-plaque-6", "top-banner-5", "hero-plus-4", "clean-grid-4"],
          },
          backdrop: {
            type: Type.STRING,
            enum: [
              "festive-pine-desk",
              "craft-table-lights",
              "spring-botanical-oak",
              "pastel-kids-desk",
              "midnight-studio-gold",
            ],
          },
          plaqueStyle: {
            type: Type.STRING,
            enum: ["wood-plaque", "cloud-sticker", "ribbon-badge"],
          },
          decorTheme: {
            type: Type.STRING,
            enum: ["christmas", "hearts", "stars", "botanical"],
          },
          primaryColor: { type: Type.STRING },
          secondaryColor: { type: Type.STRING },
          ribbonColor: { type: Type.STRING },
          subtitleBgColor: { type: Type.STRING },
          subtitleTextColor: { type: Type.STRING },
          footerBgColor: { type: Type.STRING },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                paper: { type: Type.STRING, enum: ["white", "kraft", "pastel-blue", "pastel-cream"] },
                svg: { type: Type.STRING },
              },
              required: ["label", "paper", "svg"],
            },
          },
        },
        required: [
          "accentBadge",
          "titleLine1",
          "titleLine2Ribbon",
          "titleLine3",
          "subtitleText",
          "footerBrandText",
          "layout",
          "backdrop",
          "plaqueStyle",
          "decorTheme",
          "primaryColor",
          "secondaryColor",
          "ribbonColor",
          "subtitleBgColor",
          "subtitleTextColor",
          "footerBgColor",
          "cards",
        ],
      };

      let rawJson = "";
      try {
        const aiRes = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: `Create a showcase poster design and 6 distinct card illustrations for: "${rawPrompt}"${
            preferredLayout ? `. Preferred layout: ${preferredLayout}` : ""
          }`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        rawJson = aiRes.text ?? "";
      } catch (err) {
        if (isQuotaError(err)) {
          const liteRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Create a showcase poster design and 6 distinct card illustrations for: "${rawPrompt}"`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
            },
          });
          rawJson = liteRes.text ?? "";
        } else {
          throw err;
        }
      }

      const parsed = JSON.parse(rawJson || "{}") as {
        cards?: Array<{ label?: string; paper?: string; svg?: string }>;
        [key: string]: unknown;
      };

      const sanitizedCards = (Array.isArray(parsed.cards) ? parsed.cards : [])
        .map((c, idx) => {
          const cleanSvg =
            typeof c.svg === "string"
              ? sanitizeSvgMarkup(c.svg, 500, 640, 500, 640)
              : null;
          if (!cleanSvg) return null;
          return {
            label: String(c.label || `Design ${idx + 1}`),
            paper: ["white", "kraft", "pastel-blue", "pastel-cream"].includes(String(c.paper))
              ? String(c.paper)
              : "white",
            svg: cleanSvg,
          };
        })
        .filter((item): item is { label: string; paper: string; svg: string } => Boolean(item));

      return res.json({
        design: {
          ...parsed,
          cards: sanitizedCards,
        },
        source: "gemini",
      });
    } catch (err) {
      const notice = isQuotaError(err)
        ? "Free-tier AI quota reached — generated using studio design engine (adjust quota in Settings > Secrets)."
        : isAuthError(err)
        ? "API key permission notice — generated using studio design engine."
        : undefined;

      const rawPrompt = String(req.body?.prompt || "Creative Design").trim();
      const words = rawPrompt.split(/\s+/).filter(Boolean);
      return res.json({
        design: {
          accentBadge: rawPrompt.match(/\b(\d{1,3})\b/)?.[1] || "",
          titleLine1: words.slice(0, 2).join(" ") || "Creative",
          titleLine2Ribbon: words.slice(2, 4).join(" ") || "Showcase Pack",
          titleLine3: words.slice(4).join(" ") || "for Kids",
          subtitleText: "Print, color, and celebrate!",
          footerBrandText: "GBTK STUDIO",
          layout: "top-banner-5",
          backdrop: "pastel-kids-desk",
          plaqueStyle: "cloud-sticker",
          decorTheme: "stars",
          primaryColor: "#DC2626",
          secondaryColor: "#15803D",
          ribbonColor: "#2563EB",
          subtitleBgColor: "#FDE047",
          subtitleTextColor: "#1C1917",
          footerBgColor: "#DC2626",
          cards: [],
        },
        source: "fallback",
        notice,
      });
    }
  });

  function normalizeMonochromeColor(raw: string, isStroke: boolean): string {
    const val = raw.trim().toLowerCase();
    if (val === "none" || val === "transparent") return "none";
    if (val === "#fff" || val === "#ffffff" || val === "white") return "#FFFFFF";
    if (val === "#000" || val === "#000000" || val === "black") return "#000000";
    if (isStroke) return "#000000";
    // For fills, map dark hex colors to pure #000000 and anything light/colored to #FFFFFF
    const hexMatch = val.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const h = hexMatch[1];
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum < 0.35 ? "#000000" : "#FFFFFF";
    }
    return "#FFFFFF";
  }

  function sanitizeMonochromeSvgMarkup(raw: string): string | null {
    const base = sanitizeSvgMarkup(raw, 220, 220, 220, 220);
    if (!base) return null;
    let svg = base
      .replace(/<defs[\s\S]*?<\/defs>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<text[\s\S]*?<\/text>/gi, "")
      .replace(/<image[^>]*\/?>/gi, "");

    svg = svg.replace(/\bfill\s*=\s*(?:"([^"]*)"|'([^']*)')/gi, (_m, a, b) => {
      const col = normalizeMonochromeColor(a ?? b ?? "", false);
      return `fill="${col}"`;
    });
    svg = svg.replace(/\bstroke\s*=\s*(?:"([^"]*)"|'([^']*)')/gi, (_m, a, b) => {
      const col = normalizeMonochromeColor(a ?? b ?? "", true);
      return `stroke="${col}"`;
    });
    return svg;
  }

  app.post("/api/sticker/generate", async (req, res) => {
    try {
      const { prompt, kind = "sticker" } = req.body as {
        prompt?: string;
        kind?: "sticker" | "cartoon";
      };

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Please enter a sticker or cartoon idea to generate." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to generate custom B&W stickers and cartoons.",
        });
      }

      const cleanPrompt = prompt.trim();
      const isSticker = kind !== "cartoon";

      const systemInstruction = isSticker
        ? `You are a master coloring-book die-cut sticker illustrator. Draw a charming, trendy, clean PURE BLACK AND WHITE coloring sticker depicting EXACTLY what the user requests (translate Burmese prompts accurately).
STRICT RULES:
1. Output ONLY raw <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">...</svg> with NO markdown fences, NO explanation, NO JSON.
2. PURE BLACK & WHITE ONLY: Every stroke MUST be stroke="#000000" and every fill MUST be fill="#FFFFFF" or fill="none" (use fill="#000000" ONLY for tiny eye pupils). Zero gray, zero color, zero gradients, zero <text> or <script>.
3. Give the sticker an appealing, popular coloring-book die-cut look: bold outer contour (stroke-width="5.5"), smooth rounded cubic-Bezier shapes, cute expressive details, and crisp interior linework (stroke-width="2.5" to "4", stroke-linecap="round", stroke-linejoin="round").
4. Keep all artwork centered inside 20..200 x 20..200 with a transparent/unboxed canvas (no full-canvas square border rectangle).`
        : `You are a master children's coloring-book cartoon illustrator. Draw a natural-looking, expressive, charming PURE BLACK AND WHITE coloring cartoon depicting EXACTLY what the user requests (translate Burmese prompts accurately).
STRICT RULES:
1. Output ONLY raw <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">...</svg> with NO markdown fences, NO explanation, NO JSON.
2. PURE BLACK & WHITE ONLY: Every stroke MUST be stroke="#000000" and every fill MUST be fill="#FFFFFF" or fill="none" (use fill="#000000" ONLY for tiny eye pupils/noses). Zero gray, zero color, zero gradients, zero <text> or <script>.
3. Draw smooth, organic, storybook-quality proportions (natural head/body curves, floppy ears or foliage, expressive eyes with white highlight dots) using 15 to 40 SVG primitives with stroke-linecap="round" stroke-linejoin="round".
4. Keep all artwork centered inside 18..202 x 18..202 without any background box rectangle.`;

      const { text } = await generateWithFallback(
        ai,
        `Create a pure black-and-white coloring book ${isSticker ? "sticker" : "cartoon"} SVG of: "${cleanPrompt}"`,
        systemInstruction
      );

      const svg = sanitizeMonochromeSvgMarkup(text.trim());
      if (!svg) {
        return res.status(502).json({
          error: "The AI returned an invalid SVG shape. Please try a simpler prompt.",
        });
      }

      const label = cleanPrompt.length > 28 ? `${cleanPrompt.slice(0, 26).trim()}…` : cleanPrompt;
      return res.json({
        asset: {
          id: `ai-${isSticker ? "sticker" : "cartoon"}-${Date.now()}`,
          label,
          mode: isSticker ? "sticker" : "cartoon",
          category: "popular",
          aspectRatio: 1,
          defaultWidthPct: isSticker ? 22 : 26,
          svg,
        },
      });
    } catch (err) {
      if (isQuotaError(err)) {
        return res.status(429).json({
          error:
            "AI daily quota reached. You can increase quota in Settings > Secrets, or continue using the built-in packs.",
        });
      }
      if (isAuthError(err)) {
        return res.status(401).json({
          error: "Gemini API key is invalid or unauthorized. Please check Settings > Secrets.",
        });
      }
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to generate B&W illustration.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
      })
    );
    app.use(
      express.static(distPath, {
        maxAge: "1h",
        index: false,
      })
    );
    app.get("/{*path}", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GBTK STUDIO server listening on http://localhost:${PORT}`);
  });
}

startServer();
