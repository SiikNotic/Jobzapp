"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { ChartColor } from "./sparkline";

export type DonutSegment = {
  key: string;
  label: string;
  value: number;
  color: ChartColor;
};

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  emptyLabel,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: number | string;
  emptyLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={segments.filter((s) => s.value > 0).length > 1 ? 3 : 0}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
            stroke="none"
          >
            {segments.map((segment) => (
              <Cell key={segment.key} fill={`hsl(var(--chart-${segment.color}))`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{centerValue}</span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  );
}
