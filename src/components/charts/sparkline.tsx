"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export type ChartColor = "teal" | "magenta" | "orange" | "green" | "yellow";

export function Sparkline({
  data,
  color = "teal",
  height = 40,
}: {
  data: { label: string; value: number }[];
  color?: ChartColor;
  height?: number;
}) {
  const gradientId = React.useId();
  const stroke = `hsl(var(--chart-${color}))`;

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
