"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientPicker } from "@/components/owner/client-picker";

export function NewClientDuplicateCheck() {
  const t = useTranslations("owner.clients.new");
  const router = useRouter();

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="size-4 text-muted-foreground" /> {t("checkExistingTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ClientPicker
          placeholder={t("checkExistingPlaceholder")}
          onSelect={(client) => router.push(`/owner/clients/view?id=${client.id}`)}
        />
      </CardContent>
    </Card>
  );
}
