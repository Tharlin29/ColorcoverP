export function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function createSmartFillPatch(
  workCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  bx: number,
  by: number,
  bw: number,
  bh: number
): HTMLCanvasElement {
  const maxGrid = 240;
  const scale = Math.min(1, maxGrid / Math.max(bw, bh));
  const sw = Math.max(8, Math.round(bw * scale));
  const sh = Math.max(8, Math.round(bh * scale));

  const smallImg = document.createElement("canvas");
  smallImg.width = sw;
  smallImg.height = sh;
  const sImgCtx = smallImg.getContext("2d")!;
  sImgCtx.drawImage(workCanvas, bx, by, bw, bh, 0, 0, sw, sh);

  const smallMask = document.createElement("canvas");
  smallMask.width = sw;
  smallMask.height = sh;
  const sMaskCtx = smallMask.getContext("2d")!;
  sMaskCtx.drawImage(maskCanvas, bx, by, bw, bh, 0, 0, sw, sh);

  const imgData = sImgCtx.getImageData(0, 0, sw, sh);
  const maskData = sMaskCtx.getImageData(0, 0, sw, sh);
  const data = imgData.data;
  const mData = maskData.data;

  const total = sw * sh;
  const isHole = new Uint8Array(total);
  const known = new Uint8Array(total);

  // Dilate selected pixels by 1px so boundary edge halo doesn't bleed inward
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = y * sw + x;
      if (mData[idx * 4 + 3] > 20) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
              isHole[ny * sw + nx] = 1;
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < total; i++) {
    if (!isHole[i] && data[i * 4 + 3] > 16) {
      known[i] = 1;
    }
  }

  // Iterative frontier diffusion inward from valid boundary pixels
  const maxPasses = Math.max(sw, sh) + 16;
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    const nextKnown = new Uint8Array(known);
    const nextData = new Uint8ClampedArray(data);

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = y * sw + x;
        if (known[idx]) continue;

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let aSum = 0;
        let weightSum = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= sw || ny < 0 || ny >= sh) continue;
            const nIdx = ny * sw + nx;
            if (known[nIdx]) {
              const w = dx === 0 || dy === 0 ? 1.4 : 1.0;
              const p = nIdx * 4;
              rSum += data[p] * w;
              gSum += data[p + 1] * w;
              bSum += data[p + 2] * w;
              aSum += data[p + 3] * w;
              weightSum += w;
            }
          }
        }

        if (weightSum > 0) {
          const p = idx * 4;
          nextData[p] = Math.round(rSum / weightSum);
          nextData[p + 1] = Math.round(gSum / weightSum);
          nextData[p + 2] = Math.round(bSum / weightSum);
          nextData[p + 3] = Math.round(aSum / weightSum);
          nextKnown[idx] = 1;
          changed = true;
        }
      }
    }

    data.set(nextData);
    known.set(nextKnown);
    if (!changed) break;
  }

  // Smooth the filled region slightly for natural gradient transitions
  for (let s = 0; s < 6; s++) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = y * sw + x;
        if (!isHole[idx]) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const p = ((y + dy) * sw + (x + dx)) * 4;
            r += copy[p];
            g += copy[p + 1];
            b += copy[p + 2];
            a += copy[p + 3];
          }
        }
        const p = idx * 4;
        data[p] = Math.round(r / 9);
        data[p + 1] = Math.round(g / 9);
        data[p + 2] = Math.round(b / 9);
        data[p + 3] = Math.round(a / 9);
      }
    }
  }

  sImgCtx.putImageData(imgData, 0, 0);

  const fullPatch = document.createElement("canvas");
  fullPatch.width = bw;
  fullPatch.height = bh;
  const fCtx = fullPatch.getContext("2d")!;
  fCtx.imageSmoothingEnabled = true;
  fCtx.imageSmoothingQuality = "high";
  fCtx.drawImage(smallImg, 0, 0, sw, sh, 0, 0, bw, bh);
  return fullPatch;
}

export function applyMagicWandToMask(
  workCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  seedX: number,
  seedY: number,
  tolerance: number,
  mode: "add" | "subtract"
): boolean {
  const w = workCanvas.width;
  const h = workCanvas.height;
  const sx = Math.max(0, Math.min(w - 1, Math.round(seedX)));
  const sy = Math.max(0, Math.min(h - 1, Math.round(seedY)));

  const wCtx = workCanvas.getContext("2d")!;
  const mCtx = maskCanvas.getContext("2d")!;
  const img = wCtx.getImageData(0, 0, w, h);
  const mask = mCtx.getImageData(0, 0, w, h);
  const px = img.data;
  const mpx = mask.data;

  const seedIdx = (sy * w + sx) * 4;
  const sr = px[seedIdx];
  const sg = px[seedIdx + 1];
  const sb = px[seedIdx + 2];
  const sa = px[seedIdx + 3];

  const tolSq = tolerance * tolerance * 3;
  const total = w * h;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const start = sy * w + sx;
  visited[start] = 1;
  queue[tail++] = start;

  let selectedCount = 0;
  while (head < tail) {
    const cur = queue[head++];
    const p = cur * 4;
    if (mode === "add") {
      mpx[p] = 255;
      mpx[p + 1] = 255;
      mpx[p + 2] = 255;
      mpx[p + 3] = 255;
    } else {
      mpx[p + 3] = 0;
    }
    selectedCount++;

    const cx = cur % w;
    const cy = (cur - cx) / w;

    const neighbors = [
      cx > 0 ? cur - 1 : -1,
      cx < w - 1 ? cur + 1 : -1,
      cy > 0 ? cur - w : -1,
      cy < h - 1 ? cur + w : -1,
    ];

    for (let i = 0; i < 4; i++) {
      const nb = neighbors[i];
      if (nb < 0 || visited[nb]) continue;
      visited[nb] = 1;
      const np = nb * 4;
      const dr = px[np] - sr;
      const dg = px[np + 1] - sg;
      const db = px[np + 2] - sb;
      const da = px[np + 3] - sa;
      if (dr * dr + dg * dg + db * db + da * da <= tolSq) {
        queue[tail++] = nb;
      }
    }
  }

  mCtx.putImageData(mask, 0, 0);
  return selectedCount > 0;
}

export function invertSelectionMask(maskCanvas: HTMLCanvasElement): boolean {
  const w = maskCanvas.width;
  const h = maskCanvas.height;
  const mCtx = maskCanvas.getContext("2d")!;
  const img = mCtx.getImageData(0, 0, w, h);
  const d = img.data;
  let hasAny = false;
  for (let i = 0; i < d.length; i += 4) {
    const nextA = d[i + 3] > 128 ? 0 : 255;
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
    d[i + 3] = nextA;
    if (nextA > 0) hasAny = true;
  }
  mCtx.putImageData(img, 0, 0);
  return hasAny;
}

export function morphSelectionMask(
  maskCanvas: HTMLCanvasElement,
  direction: "expand" | "shrink",
  radius = 2
): boolean {
  const w = maskCanvas.width;
  const h = maskCanvas.height;
  const mCtx = maskCanvas.getContext("2d")!;
  const src = mCtx.getImageData(0, 0, w, h);
  const dst = mCtx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;

  let hasAny = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (direction === "expand") {
        let hit = false;
        for (let dy = -radius; dy <= radius && !hit; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            if (s[(ny * w + nx) * 4 + 3] > 20) {
              hit = true;
              break;
            }
          }
        }
        if (hit) {
          d[idx] = 255;
          d[idx + 1] = 255;
          d[idx + 2] = 255;
          d[idx + 3] = 255;
          hasAny = true;
        }
      } else {
        let allHit = true;
        for (let dy = -radius; dy <= radius && allHit; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) {
            allHit = false;
            break;
          }
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w || s[(ny * w + nx) * 4 + 3] <= 20) {
              allHit = false;
              break;
            }
          }
        }
        if (allHit) {
          d[idx] = 255;
          d[idx + 1] = 255;
          d[idx + 2] = 255;
          d[idx + 3] = 255;
          hasAny = true;
        }
      }
    }
  }

  mCtx.putImageData(dst, 0, 0);
  return hasAny;
}
