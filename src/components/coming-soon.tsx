import { useTranslations } from "next-intl";
import { Construction } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardHeader className="items-center text-center">
          <Construction className="mb-2 size-8 text-muted-foreground" />
          <CardTitle>{t("comingSoon")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {t("comingSoonDescription")}
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
