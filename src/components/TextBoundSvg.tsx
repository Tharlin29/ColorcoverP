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
}: TextBoundSvgProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 120, h: 48 });

  useEffect(() => {
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
  }, [styleType, thickness, radius, scale]);

  if (!styleType || styleType === "none") return null;

  const w = size.w;
  const h = size.h;
  const lw = Math.max(1.5, thickness * scale);
  const rad = Math.min(radius * scale, w / 2, h / 2);
  const fill = fillOpacity > 0 ? fillColor : "none";

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
      default:
        return null;
    }
  };

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
