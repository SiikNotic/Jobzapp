"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientType } from "@/lib/clients/types";

export function ClientsSearchBar({
  initialQuery,
  initialType,
}: {
  initialQuery: string;
  initialType: ClientType | "all";
}) {
  const t = useTranslations("owner.clients.list");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState(initialQuery);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(nextQuery: string, nextType: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextType !== "all") params.set("type", nextType);
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ""}`);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value, initialType), 300);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9"
        />
      </div>
      <Select value={initialType} onValueChange={(value) => navigate(query, value)}>
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          <SelectItem value="individual">{t("filterIndividual")}</SelectItem>
          <SelectItem value="company">{t("filterCompany")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
