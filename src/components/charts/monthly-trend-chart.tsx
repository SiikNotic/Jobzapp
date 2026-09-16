"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyTrendChart({
  data,
  incomeLabel,
  expensesLabel,
}: {
  data: { month: string; income: number; expenses: number }[];
  incomeLabel: string;
  expensesLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(value: number) => `$${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          formatter={(value, name) => [`$${Number(value ?? 0).toFixed(2)}`, String(name)]}
        />
        <Bar dataKey="income" name={incomeLabel} fill="hsl(var(--chart-teal))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="expenses" name={expensesLabel} fill="hsl(var(--chart-magenta))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
