import type { ChartColor } from "./sparkline";

export function ChartLegend({
  items,
}: {
  items: { key: string; label: string; value: string | number; color: ChartColor }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-sm">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: `hsl(var(--chart-${item.color}))` }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
