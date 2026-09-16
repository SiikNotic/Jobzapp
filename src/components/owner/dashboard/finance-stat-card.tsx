import { Sparkline, type ChartColor } from "@/components/charts/sparkline";
import { Card, CardContent } from "@/components/ui/card";

export function FinanceStatCard({
  icon,
  label,
  value,
  trend,
  color,
  valueTone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: { label: string; value: number }[];
  color: ChartColor;
  valueTone?: "success" | "destructive" | "default";
}) {
  const valueClass =
    valueTone === "success" ? "text-success" : valueTone === "destructive" ? "text-destructive" : "text-foreground";

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon} {label}
        </div>
        <p className={`font-mono text-xl font-semibold ${valueClass}`}>{value}</p>
        <div className="-mx-2 -mb-2">
          <Sparkline data={trend} color={color} />
        </div>
      </CardContent>
    </Card>
  );
}
