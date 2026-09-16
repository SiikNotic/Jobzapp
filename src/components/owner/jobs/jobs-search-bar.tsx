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
import type { JobStatus } from "@/lib/jobs/types";

export function JobsSearchBar({
  initialQuery,
  initialStatus,
}: {
  initialQuery: string;
  initialStatus: JobStatus | "all";
}) {
  const t = useTranslations("jobs.list");
  const tStatus = useTranslations("jobs.status");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState(initialQuery);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus !== "all") params.set("status", nextStatus);
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ""}`);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value, initialStatus), 300);
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
      <Select value={initialStatus} onValueChange={(value) => navigate(query, value)}>
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          <SelectItem value="scheduled">{tStatus("scheduled")}</SelectItem>
          <SelectItem value="in_progress">{tStatus("in_progress")}</SelectItem>
          <SelectItem value="completed">{tStatus("completed")}</SelectItem>
          <SelectItem value="cancelled">{tStatus("cancelled")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
