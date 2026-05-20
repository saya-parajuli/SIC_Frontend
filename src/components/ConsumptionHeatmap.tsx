import { useMemo } from "react";
import type { HeatPoint } from "@/data/mockData";

interface Props {
  data: HeatPoint[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ConsumptionHeatmap({ data }: Props) {
  const { grid, max } = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;
    data.forEach((p) => {
      grid[p.day][p.hour] = p.kwh;
      if (p.kwh > max) max = p.kwh;
    });
    return { grid, max: max || 1 };
  }, [data]);

  return (
    <div className="w-full">
      <div className="flex">
        <div className="w-10 shrink-0" />
        <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px] text-[9px] text-muted-foreground">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-center">{h % 3 === 0 ? h : ""}</div>
          ))}
        </div>
      </div>
      {grid.map((row, d) => (
        <div key={d} className="mt-[2px] flex items-center">
          <div className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">{DAYS[d]}</div>
          <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px]">
            {row.map((v, h) => {
              const intensity = v / max;
              return (
                <div
                  key={h}
                  title={`${DAYS[d]} ${String(h).padStart(2, "0")}:00 — ${v.toFixed(2)} kWh`}
                  className="aspect-square rounded-[2px] transition-transform hover:scale-125"
                  style={{
                    background: `color-mix(in oklab, var(--color-chart-1) ${Math.round(intensity * 100)}%, var(--color-muted))`,
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-[2px]">
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((i) => (
            <div
              key={i}
              className="h-2 w-4 rounded-[1px]"
              style={{ background: `color-mix(in oklab, var(--color-chart-1) ${Math.round(i * 100)}%, var(--color-muted))` }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
