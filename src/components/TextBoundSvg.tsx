import { useEffect, useRef, useState } from "react";
import { TextBoundStyle } from "../types/studio";

interface TextBoundSvgProps {
  styleType: TextBoundStyle;
  thickness: number;
  radius: number;
  strokeColor: string;
  fillColor: string;
  fillOpacity: number;
  scale: number;
  fixedSize?: { w: number; h: number };
}

function buildScallopSvgPath(w: number, h: number, scale: number): string {
  const step = Math.max(12 * scale, 10);
  const nx = Math.max(4, Math.round(w / step));
  const ny = Math.max(2, Math.round(h / step));
  const sx = w / nx;
  const sy = h / ny;
  const amp = Math.min(sx, sy) * 0.28;

  let d = `M 0 0`;
  for (let i = 0; i < nx; i++) {
    d += ` Q ${((i + 0.5) * sx).toFixed(1)} ${(-amp).toFixed(1)} ${((i + 1) * sx).toFixed(1)} 0`;
  }
  for (let i = 0; i < ny; i++) {
    d += ` Q ${(w + amp).toFixed(1)} ${((i + 0.5) * sy).toFixed(1)} ${w} ${((i + 1) * sy).toFixed(1)}`;
  }
  for (let i = nx; i > 0; i--) {
    d += ` Q ${((i - 0.5) * sx).toFixed(1)} ${(h + amp).toFixed(1)} ${((i - 1) * sx).toFixed(1)} ${h}`;
  }
  for (let i = ny; i > 0; i--) {
    d += ` Q ${(-amp).toFixed(1)} ${((i - 0.5) * sy).toFixed(1)} 0 ${((i - 1) * sy).toFixed(1)}`;
  }
  return `${d} Z`;
}

function buildSealSvgPath(cx: number, cy: number, outerR: number, innerR: number, teeth = 24): string {
  const ctrlR = outerR + (outerR - innerR) * 0.45;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const aMid = ((i + 0.5) / teeth) * Math.PI * 2;
    const a1 = ((i + 1) / teeth) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * innerR;
    const y0 = cy + Math.sin(a0) * innerR;
    const xc = cx + Math.cos(aMid) * ctrlR;
    const yc = cy + Math.sin(aMid) * ctrlR;
    const x1 = cx + Math.cos(a1) * innerR;
    const y1 = cy + Math.sin(a1) * innerR;
    if (i === 0) d += `M ${x0.toFixed(1)} ${y0.toFixed(1)}`;
    d += ` Q ${xc.toFixed(1)} ${yc.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return `${d} Z`;
}

export function TextBoundSvg({
  styleType,
  thickness,
  radius,
  strokeColor,
  fillColor,
  fillOpacity,
  scale,
  fixedSize,
}: TextBoundSvgProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fixedSize ?? { w: 120, h: 48 });

  useEffect(() => {
    if (fixedSize) return;
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 2 && r.height > 2) {
        setSize({ w: r.width, h: r.height });
      }
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [fixedSize, styleType, thickness, radius, scale]);

  if (!styleType || styleType === "none") return null;

  const w = fixedSize ? fixedSize.w : size.w;
  const h = fixedSize ? fixedSize.h : size.h;
  const lw = Math.max(1.2, thickness * scale);
  const rad = Math.min(radius * scale, w / 2, h / 2);
  const fill = fillOpacity > 0 ? fillColor : "none";
  const solidMaskFill = fillOpacity > 0 ? fillColor : "#FFFFFF";

  const renderShape = () => {
    switch (styleType) {
      case "solid":
        return (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={Math.min(rad, 8 * scale)}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
          />
        );
      case "rounded": {
        const pillR = Math.min(Math.max(rad, h / 2), h / 2);
        return (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={pillR}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
          />
        );
      }
      case "dashed":
        return (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={rad}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeDasharray={`${lw * 3} ${lw * 2}`}
            strokeLinecap="round"
          />
        );
      case "dotted":
        return (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={rad}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeDasharray={`0.5 ${lw * 2.3}`}
            strokeLinecap="round"
          />
        );
      case "double": {
        const inset = Math.max(4 * scale, lw * 1.6);
        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={rad}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {w > inset * 3 && h > inset * 3 && (
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                rx={Math.max(0, rad - inset)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(1, lw * 0.55)}
              />
            )}
          </>
        );
      }
      case "neon-glow":
        return (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={rad}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            style={{ filter: `drop-shadow(0 0 ${Math.max(4, 10 * scale)}px ${strokeColor})` }}
          />
        );
      case "ribbon": {
        const tail = Math.min(28, w * 0.14, h * 0.48);
        const pts = `0,0 ${w},0 ${w - tail},${h / 2} ${w},${h} 0,${h} ${tail},${h / 2}`;
        return (
          <polygon
            points={pts}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "ticket": {
        const n = Math.min(14 * scale, w * 0.2, h * 0.35);
        const d = `M ${n} 0 L ${w - n} 0 A ${n} ${n} 0 0 0 ${w} ${n} L ${w} ${h - n} A ${n} ${n} 0 0 0 ${w - n} ${h} L ${n} ${h} A ${n} ${n} 0 0 0 0 ${h - n} L 0 ${n} A ${n} ${n} 0 0 0 ${n} 0 Z`;
        return (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "bracket": {
        const arm = Math.min(24 * scale, w * 0.25, h * 0.45);
        const d = `M 0 ${arm} L 0 0 L ${arm} 0 M ${w - arm} 0 L ${w} 0 L ${w} ${arm} M ${w} ${h - arm} L ${w} ${h} L ${w - arm} ${h} M ${arm} ${h} L 0 ${h} L 0 ${h - arm}`;
        return (
          <>
            {fillOpacity > 0 && (
              <rect x={0} y={0} width={w} height={h} fill={fillColor} fillOpacity={fillOpacity} />
            )}
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
      }
      case "top-bottom-rule":
        return (
          <>
            {fillOpacity > 0 && (
              <rect x={0} y={0} width={w} height={h} fill={fillColor} fillOpacity={fillOpacity} />
            )}
            <line x1={0} y1={0} x2={w} y2={0} stroke={strokeColor} strokeWidth={lw} strokeLinecap="round" />
            <line x1={0} y1={h} x2={w} y2={h} stroke={strokeColor} strokeWidth={lw} strokeLinecap="round" />
          </>
        );
      case "speech-bubble": {
        const r = Math.min(Math.max(rad, 14 * scale), w / 2, h / 2);
        const tailH = Math.max(10, h * 0.22);
        const tailW = Math.max(12, Math.min(26, w * 0.14));
        const midX = w * 0.5;
        const d = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${midX + tailW * 0.6} ${h} L ${midX - tailW * 0.2} ${h + tailH} L ${midX - tailW * 0.5} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
        return (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "scallop-seal":
        return (
          <path
            d={buildScallopSvgPath(w, h, scale)}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      case "gold-ornate": {
        const inset = Math.max(5 * scale, lw * 1.5);
        const dSize = Math.max(4 * scale, lw * 1.3);
        const corners = [
          [0, 0],
          [w, 0],
          [w, h],
          [0, h],
        ];
        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={Math.min(rad, 10 * scale)}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {w > inset * 3 && h > inset * 3 && (
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(1, lw * 0.55)}
              />
            )}
            {corners.map(([cx, cy], idx) => (
              <polygon
                key={idx}
                points={`${cx},${cy - dSize} ${cx + dSize},${cy} ${cx},${cy + dSize} ${cx - dSize},${cy}`}
                fill={strokeColor}
              />
            ))}
          </>
        );
      }
      case "shadow-card": {
        const off = Math.max(5 * scale, lw * 1.6);
        return (
          <>
            <rect x={off} y={off} width={w} height={h} rx={rad} fill={strokeColor} />
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={rad}
              fill={fillOpacity > 0 ? fillColor : "#FFFFFF"}
              fillOpacity={fillOpacity > 0 ? fillOpacity : 1}
              stroke={strokeColor}
              strokeWidth={lw}
            />
          </>
        );
      }
      case "sketch-double": {
        const off = Math.max(3 * scale, lw * 0.9);
        return (
          <>
            {fillOpacity > 0 && (
              <rect x={0} y={0} width={w} height={h} fill={fillColor} fillOpacity={fillOpacity} />
            )}
            <rect x={0} y={0} width={w} height={h} fill="none" stroke={strokeColor} strokeWidth={lw} />
            <rect
              x={off}
              y={-off * 0.6}
              width={w}
              height={h}
              fill="none"
              stroke={strokeColor}
              strokeWidth={lw}
              transform={`rotate(1 ${w / 2} ${h / 2})`}
            />
          </>
        );
      }
      case "leaf-crest": {
        const pillR = Math.min(Math.max(rad, h * 0.45), h / 2);
        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={pillR}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {[-1, 1].map((side) => {
              const lx = side === -1 ? 0 : w;
              const ly = h / 2;
              return (
                <g key={side} transform={`translate(${lx} ${ly})`}>
                  <ellipse
                    cx={0}
                    cy={-6 * scale}
                    rx={11 * scale}
                    ry={5 * scale}
                    transform={`rotate(${side * -28})`}
                    fill="#65A30D"
                    stroke={strokeColor}
                    strokeWidth={Math.max(1.2, lw * 0.55)}
                  />
                  <ellipse
                    cx={0}
                    cy={6 * scale}
                    rx={11 * scale}
                    ry={5 * scale}
                    transform={`rotate(${side * 28})`}
                    fill="#65A30D"
                    stroke={strokeColor}
                    strokeWidth={Math.max(1.2, lw * 0.55)}
                  />
                </g>
              );
            })}
          </>
        );
      }
      case "circle": {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.max(w, h) * 0.52;
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
          />
        );
      }
      case "leaf": {
        const cy = h / 2;
        const tip = Math.max(18 * scale, h * 0.36);
        const vCtrl = Math.max(14 * scale, h * 0.36);
        const lx = -tip;
        const rx = w + tip;
        const d = `M ${lx.toFixed(1)} ${cy.toFixed(1)} C ${(w * 0.16).toFixed(1)} ${(-vCtrl).toFixed(1)}, ${(w * 0.84).toFixed(1)} ${(-vCtrl).toFixed(1)}, ${rx.toFixed(1)} ${cy.toFixed(1)} C ${(w * 0.84).toFixed(1)} ${(h + vCtrl).toFixed(1)}, ${(w * 0.16).toFixed(1)} ${(h + vCtrl).toFixed(1)}, ${lx.toFixed(1)} ${cy.toFixed(1)} Z`;
        const stemD = `M ${lx.toFixed(1)} ${cy.toFixed(1)} Q ${(lx - 8 * scale).toFixed(1)} ${(cy + 2 * scale).toFixed(1)} ${(lx - 14 * scale).toFixed(1)} ${(cy + 7 * scale).toFixed(1)}`;
        return (
          <>
            <path
              d={d}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            <path
              d={stemD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinecap="round"
            />
            <line
              x1={lx + 4 * scale}
              y1={cy}
              x2={lx + 16 * scale}
              y2={cy}
              stroke={strokeColor}
              strokeWidth={Math.max(1, lw * 0.55)}
              strokeLinecap="round"
            />
            <line
              x1={rx - 16 * scale}
              y1={cy}
              x2={rx - 4 * scale}
              y2={cy}
              stroke={strokeColor}
              strokeWidth={Math.max(1, lw * 0.55)}
              strokeLinecap="round"
            />
          </>
        );
      }
      case "heart": {
        const cx = w / 2;
        const cy = h / 2;
        const hw = Math.max(w * 0.76, h * 0.92);
        const hh = Math.max(h * 1.15, w * 0.56);
        const d = `M ${cx.toFixed(1)} ${(cy - hh * 0.42).toFixed(1)} C ${(cx + hw * 0.15).toFixed(1)} ${(cy - hh * 1.15).toFixed(1)}, ${(cx + hw * 1.15).toFixed(1)} ${(cy - hh * 0.85).toFixed(1)}, ${(cx + hw * 0.96).toFixed(1)} ${(cy - hh * 0.12).toFixed(1)} C ${(cx + hw * 0.85).toFixed(1)} ${(cy + hh * 0.38).toFixed(1)}, ${(cx + hw * 0.28).toFixed(1)} ${(cy + hh * 0.72).toFixed(1)}, ${cx.toFixed(1)} ${(cy + hh * 0.98).toFixed(1)} C ${(cx - hw * 0.28).toFixed(1)} ${(cy + hh * 0.72).toFixed(1)}, ${(cx - hw * 0.85).toFixed(1)} ${(cy + hh * 0.38).toFixed(1)}, ${(cx - hw * 0.96).toFixed(1)} ${(cy - hh * 0.12).toFixed(1)} C ${(cx - hw * 1.15).toFixed(1)} ${(cy - hh * 0.85).toFixed(1)}, ${(cx - hw * 0.15).toFixed(1)} ${(cy - hh * 1.15).toFixed(1)}, ${cx.toFixed(1)} ${(cy - hh * 0.42).toFixed(1)} Z`;
        return (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "seal": {
        const cx = w / 2;
        const cy = h / 2;
        const outerR = Math.max(w, h) * 0.56;
        const innerR = outerR * 0.87;
        return (
          <>
            <path
              d={buildSealSvgPath(cx, cy, outerR, innerR, 24)}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            <circle
              cx={cx}
              cy={cy}
              r={outerR * 0.78}
              fill="none"
              stroke={strokeColor}
              strokeWidth={Math.max(1, lw * 0.6)}
            />
            <circle
              cx={cx}
              cy={cy}
              r={outerR * 0.71}
              fill="none"
              stroke={strokeColor}
              strokeWidth={Math.max(1, lw * 0.6)}
              strokeDasharray={`${lw * 1.2} ${lw * 1.5}`}
              strokeLinecap="round"
            />
          </>
        );
      }
      case "book": {
        const px = Math.max(14 * scale, w * 0.08);
        const py = Math.max(10 * scale, h * 0.16);
        const bx = -px;
        const by = -py;
        const bw = w + px * 2;
        const bh = h + py * 2;
        const cx = bx + bw / 2;
        const arch = Math.min(18 * scale, bh * 0.22);
        const covPad = Math.max(5 * scale, lw * 1.3);
        const pagesD = `M ${bx.toFixed(1)} ${(by + arch * 0.45).toFixed(1)} Q ${(bx + bw * 0.25).toFixed(1)} ${(by - arch * 0.7).toFixed(1)} ${cx.toFixed(1)} ${(by + arch * 0.7).toFixed(1)} Q ${(bx + bw * 0.75).toFixed(1)} ${(by - arch * 0.7).toFixed(1)} ${(bx + bw).toFixed(1)} ${(by + arch * 0.45).toFixed(1)} L ${(bx + bw).toFixed(1)} ${(by + bh - arch * 0.25).toFixed(1)} Q ${(bx + bw * 0.75).toFixed(1)} ${(by + bh - arch * 1.05).toFixed(1)} ${cx.toFixed(1)} ${(by + bh + arch * 0.3).toFixed(1)} Q ${(bx + bw * 0.25).toFixed(1)} ${(by + bh - arch * 1.05).toFixed(1)} ${bx.toFixed(1)} ${(by + bh - arch * 0.25).toFixed(1)} Z`;
        return (
          <>
            <rect
              x={bx - covPad}
              y={by + arch * 0.3}
              width={bw + covPad * 2}
              height={bh + covPad * 0.9}
              rx={Math.min(8 * scale, rad + 4 * scale)}
              fill={fillOpacity > 0 ? strokeColor : "none"}
              fillOpacity={fillOpacity > 0 ? 0.18 : 0}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            <path
              d={pagesD}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            <line
              x1={cx}
              y1={by + arch * 0.7}
              x2={cx}
              y2={by + arch * 1.45}
              stroke={strokeColor}
              strokeWidth={Math.max(1.2, lw * 0.65)}
              strokeLinecap="round"
            />
            <line
              x1={cx}
              y1={by + bh + arch * 0.3}
              x2={cx}
              y2={by + bh - arch * 0.55}
              stroke={strokeColor}
              strokeWidth={Math.max(1.2, lw * 0.65)}
              strokeLinecap="round"
            />
          </>
        );
      }
      case "cloud-puff": {
        const topN = Math.max(3, Math.min(6, Math.round(w / Math.max(36 * scale, 18))));
        const sideN = Math.max(2, Math.min(3, Math.round(h / Math.max(28 * scale, 14))));
        const sx = w / topN;
        const sy = h / sideN;
        const puffX = Math.min(sx * 0.44, 24 * scale);
        const puffY = Math.min(sy * 0.48, 22 * scale);

        let d = `M 0 0`;
        for (let i = 0; i < topN; i++) {
          const x0 = i * sx;
          const x1 = x0 + sx;
          const boost = i > 0 && i < topN - 1 ? 1.25 : 0.92;
          d += ` C ${(x0 + sx * 0.14).toFixed(1)} ${(-puffX * boost).toFixed(1)}, ${(x1 - sx * 0.14).toFixed(1)} ${(-puffX * boost).toFixed(1)}, ${x1.toFixed(1)} 0`;
        }
        for (let i = 0; i < sideN; i++) {
          const y0 = i * sy;
          const y1 = y0 + sy;
          d += ` C ${(w + puffY).toFixed(1)} ${(y0 + sy * 0.12).toFixed(1)}, ${(w + puffY).toFixed(1)} ${(y1 - sy * 0.12).toFixed(1)}, ${w.toFixed(1)} ${y1.toFixed(1)}`;
        }
        for (let i = topN; i > 0; i--) {
          const x0 = i * sx;
          const x1 = (i - 1) * sx;
          const boost = i > 1 && i < topN ? 1.15 : 0.88;
          d += ` C ${(x0 - sx * 0.14).toFixed(1)} ${(h + puffX * boost).toFixed(1)}, ${(x1 + sx * 0.14).toFixed(1)} ${(h + puffX * boost).toFixed(1)}, ${x1.toFixed(1)} ${h.toFixed(1)}`;
        }
        for (let i = sideN; i > 0; i--) {
          const y0 = i * sy;
          const y1 = (i - 1) * sy;
          d += ` C ${(-puffY).toFixed(1)} ${(y0 - sy * 0.12).toFixed(1)}, ${(-puffY).toFixed(1)} ${(y1 + sy * 0.12).toFixed(1)}, 0 ${y1.toFixed(1)}`;
        }
        d += " Z";

        return (
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "royal-scroll": {
        const spoolW = Math.max(7 * scale, Math.min(18 * scale, h * 0.28));
        const curlExt = Math.max(4 * scale, Math.min(12 * scale, h * 0.16));
        const inset = Math.max(3.5 * scale, lw * 1.4);
        const capR = spoolW * 0.48;
        const pegR = Math.max(1.6 * scale, spoolW * 0.2);

        return (
          <>
            <rect
              x={spoolW * 0.4}
              y={0}
              width={Math.max(4, w - spoolW * 0.8)}
              height={h}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            {h > inset * 3.5 && (
              <>
                <line
                  x1={spoolW * 0.7}
                  y1={inset}
                  x2={w - spoolW * 0.7}
                  y2={inset}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.52)}
                />
                <line
                  x1={spoolW * 0.7}
                  y1={h - inset}
                  x2={w - spoolW * 0.7}
                  y2={h - inset}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.52)}
                />
              </>
            )}
            {[-1, 1].map((side) => {
              const sx = side === -1 ? -spoolW * 0.55 : w - spoolW * 0.45;
              const sy = -curlExt;
              const sh = h + curlExt * 2;
              const creaseX = side === -1 ? sx + spoolW * 0.62 : sx + spoolW * 0.38;
              const pegX = sx + spoolW / 2;
              return (
                <g key={side}>
                  <rect
                    x={sx}
                    y={sy}
                    width={spoolW}
                    height={sh}
                    rx={capR}
                    fill={solidMaskFill}
                    fillOpacity={fillOpacity > 0 ? fillOpacity : 1}
                    stroke={strokeColor}
                    strokeWidth={lw}
                  />
                  <line
                    x1={creaseX}
                    y1={sy + capR * 1.1}
                    x2={creaseX}
                    y2={sy + sh - capR * 1.1}
                    stroke={strokeColor}
                    strokeWidth={Math.max(0.9, lw * 0.55)}
                  />
                  <circle cx={pegX} cy={sy - pegR * 0.7} r={pegR} fill={strokeColor} />
                  <circle cx={pegX} cy={sy + sh + pegR * 0.7} r={pegR} fill={strokeColor} />
                </g>
              );
            })}
          </>
        );
      }
      case "crown-crest": {
        const r = Math.min(Math.max(rad, 8 * scale), h * 0.38);
        const inset = Math.max(3.5 * scale, lw * 1.5);
        const cx = w / 2;
        const crownW = Math.max(20 * scale, Math.min(48 * scale, w * 0.34));
        const crownH = crownW * 0.54;
        const crownBaseY = lw * 0.4;
        const d = Math.max(2.8 * scale, lw * 1.05);
        const dotR = Math.max(1.4 * scale, lw * 0.55);
        const crownD = `M ${(cx - crownW * 0.42).toFixed(1)} ${crownBaseY.toFixed(1)} L ${(cx - crownW * 0.5).toFixed(1)} ${(crownBaseY - crownH * 0.78).toFixed(1)} L ${(cx - crownW * 0.2).toFixed(1)} ${(crownBaseY - crownH * 0.42).toFixed(1)} L ${cx.toFixed(1)} ${(crownBaseY - crownH).toFixed(1)} L ${(cx + crownW * 0.2).toFixed(1)} ${(crownBaseY - crownH * 0.42).toFixed(1)} L ${(cx + crownW * 0.5).toFixed(1)} ${(crownBaseY - crownH * 0.78).toFixed(1)} L ${(cx + crownW * 0.42).toFixed(1)} ${crownBaseY.toFixed(1)} Z`;

        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={r}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {w > inset * 3.5 && h > inset * 3.5 && (
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                rx={Math.max(2, r - inset)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(0.9, lw * 0.52)}
              />
            )}
            {[0, w].map((sx, idx) => (
              <polygon
                key={idx}
                points={`${sx},${h / 2 - d} ${sx + d},${h / 2} ${sx},${h / 2 + d} ${sx - d},${h / 2}`}
                fill={solidMaskFill}
                stroke={strokeColor}
                strokeWidth={Math.max(1, lw * 0.7)}
              />
            ))}
            <path
              d={crownD}
              fill={solidMaskFill}
              fillOpacity={fillOpacity > 0 ? fillOpacity : 1}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            <circle cx={cx - crownW * 0.5} cy={crownBaseY - crownH * 0.86} r={dotR} fill={strokeColor} />
            <circle cx={cx} cy={crownBaseY - crownH * 1.08} r={dotR} fill={strokeColor} />
            <circle cx={cx + crownW * 0.5} cy={crownBaseY - crownH * 0.86} r={dotR} fill={strokeColor} />
          </>
        );
      }
      case "comic-burst": {
        const cx = w / 2;
        const cy = h / 2;
        const spikes = 18;
        const rxInner = w * 0.52;
        const ryInner = h * 0.56;
        const pts: string[] = [];
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
          const isOuter = i % 2 === 0;
          const spikeBoost = isOuter ? (i % 4 === 0 ? 1.32 : 1.18) : 0.94;
          const px = cx + Math.cos(angle) * rxInner * spikeBoost;
          const py = cy + Math.sin(angle) * ryInner * spikeBoost;
          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        return (
          <polygon
            points={pts.join(" ")}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={lw}
            strokeLinejoin="round"
          />
        );
      }
      case "vintage-plaque": {
        const c = Math.min(18 * scale, w * 0.16, h * 0.34);
        const inset = Math.max(3.8 * scale, lw * 1.5);
        const buildConcave = (x: number, y: number, bw: number, bh: number, cr: number) =>
          `M ${(x + cr).toFixed(1)} ${y.toFixed(1)} L ${(x + bw - cr).toFixed(1)} ${y.toFixed(1)} Q ${(x + bw - cr).toFixed(1)} ${(y + cr).toFixed(1)} ${(x + bw).toFixed(1)} ${(y + cr).toFixed(1)} L ${(x + bw).toFixed(1)} ${(y + bh - cr).toFixed(1)} Q ${(x + bw - cr).toFixed(1)} ${(y + bh - cr).toFixed(1)} ${(x + bw - cr).toFixed(1)} ${(y + bh).toFixed(1)} L ${(x + cr).toFixed(1)} ${(y + bh).toFixed(1)} Q ${(x + cr).toFixed(1)} ${(y + bh - cr).toFixed(1)} ${x.toFixed(1)} ${(y + bh - cr).toFixed(1)} L ${x.toFixed(1)} ${(y + cr).toFixed(1)} Q ${(x + cr).toFixed(1)} ${(y + cr).toFixed(1)} ${(x + cr).toFixed(1)} ${y.toFixed(1)} Z`;
        const d = Math.max(3 * scale, lw * 1.05);
        return (
          <>
            <path
              d={buildConcave(0, 0, w, h, c)}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            {w > inset * 4 && h > inset * 4 && (
              <path
                d={buildConcave(inset, inset, w - inset * 2, h - inset * 2, Math.max(3, c * 0.85))}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(0.9, lw * 0.52)}
              />
            )}
            {[0, w].map((sx, idx) => (
              <polygon
                key={idx}
                points={`${sx},${h / 2 - d} ${sx + d},${h / 2} ${sx},${h / 2 + d} ${sx - d},${h / 2}`}
                fill={strokeColor}
              />
            ))}
          </>
        );
      }
      case "postage-stamp": {
        const step = Math.max(12 * scale, 9);
        const nx = Math.max(4, Math.round(w / step));
        const ny = Math.max(2, Math.round(h / step));
        const sx = w / nx;
        const sy = h / ny;
        const notch = Math.min(sx, sy) * 0.28;
        const pad = Math.max(4 * scale, notch * 1.35);
        const ox = -pad;
        const oy = -pad;
        const ow = w + pad * 2;
        const oh = h + pad * 2;
        const osx = ow / nx;
        const osy = oh / ny;

        let d = `M ${ox.toFixed(1)} ${oy.toFixed(1)}`;
        for (let i = 0; i < nx; i++) {
          const x0 = ox + i * osx;
          const x1 = x0 + osx;
          d += ` L ${(x0 + osx * 0.25).toFixed(1)} ${oy.toFixed(1)} Q ${(x0 + osx * 0.5).toFixed(1)} ${(oy + notch * 1.15).toFixed(1)} ${(x0 + osx * 0.75).toFixed(1)} ${oy.toFixed(1)} L ${x1.toFixed(1)} ${oy.toFixed(1)}`;
        }
        for (let i = 0; i < ny; i++) {
          const y0 = oy + i * osy;
          const y1 = y0 + osy;
          d += ` L ${(ox + ow).toFixed(1)} ${(y0 + osy * 0.25).toFixed(1)} Q ${(ox + ow - notch * 1.15).toFixed(1)} ${(y0 + osy * 0.5).toFixed(1)} ${(ox + ow).toFixed(1)} ${(y0 + osy * 0.75).toFixed(1)} L ${(ox + ow).toFixed(1)} ${y1.toFixed(1)}`;
        }
        for (let i = nx; i > 0; i--) {
          const x0 = ox + i * osx;
          const x1 = ox + (i - 1) * osx;
          d += ` L ${(x0 - osx * 0.25).toFixed(1)} ${(oy + oh).toFixed(1)} Q ${(x0 - osx * 0.5).toFixed(1)} ${(oy + oh - notch * 1.15).toFixed(1)} ${(x0 - osx * 0.75).toFixed(1)} ${(oy + oh).toFixed(1)} L ${x1.toFixed(1)} ${(oy + oh).toFixed(1)}`;
        }
        for (let i = ny; i > 0; i--) {
          const y0 = oy + i * osy;
          const y1 = oy + (i - 1) * osy;
          d += ` L ${ox.toFixed(1)} ${(y0 - osy * 0.25).toFixed(1)} Q ${(ox + notch * 1.15).toFixed(1)} ${(y0 - osy * 0.5).toFixed(1)} ${ox.toFixed(1)} ${(y0 - osy * 0.75).toFixed(1)} L ${ox.toFixed(1)} ${y1.toFixed(1)}`;
        }
        d += " Z";

        return (
          <>
            <path
              d={d}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
              strokeLinejoin="round"
            />
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="none"
              stroke={strokeColor}
              strokeWidth={Math.max(0.9, lw * 0.55)}
            />
          </>
        );
      }
      case "floral-arch": {
        const r = Math.min(Math.max(rad, h * 0.42), h / 2);
        const inset = Math.max(3.5 * scale, lw * 1.45);
        const petalR = Math.max(3.2 * scale, Math.min(7.5 * scale, h * 0.17));
        const leafRx = petalR * 1.35;
        const leafRy = petalR * 0.58;
        const clusters = [
          { x: r * 0.32, y: r * 0.25, flip: 1 },
          { x: w - r * 0.32, y: h - r * 0.25, flip: -1 },
        ];
        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={r}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {w > inset * 3.5 && h > inset * 3.5 && (
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                rx={Math.max(2, r - inset)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(0.9, lw * 0.5)}
              />
            )}
            {clusters.map((cl, ci) => (
              <g key={ci} transform={`translate(${cl.x.toFixed(1)} ${cl.y.toFixed(1)})`}>
                <ellipse
                  cx={cl.flip * petalR * 1.9}
                  cy={-petalR * 0.55}
                  rx={leafRx}
                  ry={leafRy}
                  transform={`rotate(${cl.flip * -24} ${(cl.flip * petalR * 1.9).toFixed(1)} ${(-petalR * 0.55).toFixed(1)})`}
                  fill={solidMaskFill}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.62)}
                />
                <ellipse
                  cx={-cl.flip * petalR * 0.45}
                  cy={cl.flip * petalR * 1.85}
                  rx={leafRx}
                  ry={leafRy}
                  transform={`rotate(${cl.flip * 66} ${(-cl.flip * petalR * 0.45).toFixed(1)} ${(cl.flip * petalR * 1.85).toFixed(1)})`}
                  fill={solidMaskFill}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.62)}
                />
                {[0, 1, 2, 3, 4].map((p) => {
                  const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <circle
                      key={p}
                      cx={Math.cos(a) * petalR * 0.88}
                      cy={Math.sin(a) * petalR * 0.88}
                      r={petalR * 0.64}
                      fill={solidMaskFill}
                      stroke={strokeColor}
                      strokeWidth={Math.max(0.9, lw * 0.62)}
                    />
                  );
                })}
                <circle
                  cx={0}
                  cy={0}
                  r={petalR * 0.42}
                  fill={solidMaskFill}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.62)}
                />
              </g>
            ))}
          </>
        );
      }
      case "starlight": {
        const r = Math.min(Math.max(rad, 8 * scale), h * 0.38);
        const inset = Math.max(3.8 * scale, lw * 1.45);
        const bigR = Math.max(5.5 * scale, Math.min(14 * scale, h * 0.27));
        const smallR = bigR * 0.55;
        const sparkleD = (sx: number, sy: number, sr: number) =>
          `M ${sx.toFixed(1)} ${(sy - sr).toFixed(1)} Q ${sx.toFixed(1)} ${sy.toFixed(1)} ${(sx + sr).toFixed(1)} ${sy.toFixed(1)} Q ${sx.toFixed(1)} ${sy.toFixed(1)} ${sx.toFixed(1)} ${(sy + sr).toFixed(1)} Q ${sx.toFixed(1)} ${sy.toFixed(1)} ${(sx - sr).toFixed(1)} ${sy.toFixed(1)} Q ${sx.toFixed(1)} ${sy.toFixed(1)} ${sx.toFixed(1)} ${(sy - sr).toFixed(1)} Z`;

        return (
          <>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={r}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {w > inset * 3.5 && h > inset * 3.5 && (
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                rx={Math.max(2, r - inset)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(0.9, lw * 0.52)}
              />
            )}
            {[
              [r * 0.2, r * 0.2, bigR],
              [w - r * 0.2, h - r * 0.2, bigR],
              [w - r * 0.2, r * 0.2, smallR],
              [r * 0.2, h - r * 0.2, smallR],
            ].map(([sx, sy, sr], idx) => (
              <path
                key={idx}
                d={sparkleD(sx, sy, sr)}
                fill={solidMaskFill}
                stroke={strokeColor}
                strokeWidth={Math.max(0.9, lw * 0.62)}
                strokeLinejoin="round"
              />
            ))}
          </>
        );
      }
      case "washi-tape": {
        const off = Math.max(2.5 * scale, lw * 1.1);
        const tapeW = Math.max(18 * scale, Math.min(38 * scale, w * 0.3));
        const tapeH = Math.max(6.5 * scale, Math.min(13 * scale, h * 0.26));
        const tapes = [
          { x: tapeW * 0.14, y: tapeH * 0.15 },
          { x: w - tapeW * 0.14, y: h - tapeH * 0.15 },
        ];
        return (
          <>
            <polyline
              points={`${off},${h + off} ${w + off},${h + off} ${w + off},${off}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={Math.max(0.9, lw * 0.55)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={Math.min(rad, 6 * scale)}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={lw}
            />
            {tapes.map((tp, idx) => (
              <g
                key={idx}
                transform={`translate(${tp.x.toFixed(1)} ${tp.y.toFixed(1)}) rotate(-33)`}
              >
                <rect
                  x={-tapeW / 2}
                  y={-tapeH / 2}
                  width={tapeW}
                  height={tapeH}
                  fill={solidMaskFill}
                  fillOpacity={fillOpacity > 0 ? fillOpacity : 0.96}
                  stroke={strokeColor}
                  strokeWidth={Math.max(0.9, lw * 0.65)}
                />
                {[1, 2, 3, 4].map((sIdx) => {
                  const sx = -tapeW / 2 + (tapeW / 5) * sIdx;
                  return (
                    <line
                      key={sIdx}
                      x1={sx - tapeH * 0.28}
                      y1={tapeH / 2}
                      x2={sx + tapeH * 0.28}
                      y2={-tapeH / 2}
                      stroke={strokeColor}
                      strokeWidth={Math.max(0.8, lw * 0.42)}
                    />
                  );
                })}
              </g>
            ))}
          </>
        );
      }
      default:
        return null;
    }
  };

  if (fixedSize) {
    const isTallEmblem =
      styleType === "circle" || styleType === "seal" || styleType === "heart";
    const padX = isTallEmblem ? Math.round(w * 0.28) : Math.round(w * 0.24);
    const padY = isTallEmblem ? Math.round(w * 0.46) : Math.round(h * 0.62);
    return (
      <svg
        viewBox={`${-padX} ${-padY} ${w + padX * 2} ${h + padY * 2}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
      >
        {renderShape()}
      </svg>
    );
  }

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-full overflow-visible block"
      >
        {renderShape()}
      </svg>
    </div>
  );
}
