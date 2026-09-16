import { TrendingDown, TrendingUp } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Sparkline, type ChartColor } from "@/components/charts/sparkline";
import { Card, CardContent } from "@/components/ui/card";

export function FinanceStatCard({
  icon,
  label,
  value,
  trend,
  color,
  valueTone = "default",
  changePercent,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: { label: string; value: number }[];
  color: ChartColor;
  valueTone?: "success" | "destructive" | "default";
  /** Month-over-month % change; omitted when there's no prior-month baseline to compare against. */
  changePercent?: number;
  href?: string;
}) {
  const valueClass =
    valueTone === "success" ? "text-success" : valueTone === "destructive" ? "text-destructive" : "text-foreground";

  const content = (
    <CardContent className="flex flex-col gap-1 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon} {label}
        </div>
        {changePercent != null ? (
          <span
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
              changePercent >= 0
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {changePercent >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(changePercent).toFixed(0)}%
          </span>
        ) : null}
      </div>
      <p className={`font-mono text-xl font-semibold ${valueClass}`}>{value}</p>
      <div className="-mx-2 -mb-2">
        <Sparkline data={trend} color={color} />
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card className="transition-colors hover:bg-accent">{content}</Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
}
