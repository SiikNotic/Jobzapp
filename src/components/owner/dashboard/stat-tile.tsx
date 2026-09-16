import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  icon,
  label,
  value,
  href,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
  tone?: "default" | "success" | "destructive" | "warning";
}) {
  const valueClass =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "warning"
          ? "text-amber-600 dark:text-amber-400"
          : "text-foreground";

  const content = (
    <CardContent className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className={`font-mono text-xl font-semibold ${valueClass}`}>{value}</p>
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
