import { Minus, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

interface StepperControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (nextValue: number) => void;
  compact?: boolean;
}

export function StepperControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  compact = false,
}: StepperControlProps) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  const stopHold = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  const clampAndCommit = (dir: -1 | 1, multiplier = 1) => {
    const delta = dir * step * multiplier;
    const raw = valueRef.current + delta;
    const rounded = Math.round(raw * 100) / 100;
    const next = Math.max(min, Math.min(max, rounded));
    if (next !== valueRef.current) {
      onChange(next);
    }
  };

  const startHold = (dir: -1 | 1) => {
    stopHold();
    holdTimeoutRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        clampAndCommit(dir);
      }, 65);
    }, 320);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-zinc-700 truncate">{label}</span>
        <span className="tabular-nums font-semibold text-zinc-900 shrink-0">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
        <button
          type="button"
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          onClick={(e) => clampAndCommit(-1, e.shiftKey ? 5 : 1)}
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          className={`${
            compact ? "min-w-[28px] min-h-[28px]" : "min-w-[32px] min-h-[32px]"
          } flex items-center justify-center rounded-md bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 text-center text-xs font-semibold text-zinc-900 tabular-nums select-none">
          {value}
          {unit}
        </div>

        <button
          type="button"
          disabled={atMax}
          aria-label={`Increase ${label}`}
          onClick={(e) => clampAndCommit(1, e.shiftKey ? 5 : 1)}
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          className={`${
            compact ? "min-w-[28px] min-h-[28px]" : "min-w-[32px] min-h-[32px]"
          } flex items-center justify-center rounded-md bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
