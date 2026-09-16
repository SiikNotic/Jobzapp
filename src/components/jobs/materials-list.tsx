import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

import type { JobMaterial } from "@/lib/jobs/types";

export function MaterialsList({ materials }: { materials: JobMaterial[] }) {
  const t = useTranslations("jobs.materials");

  if (materials.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {materials.map((material, index) => (
        <li
          key={`${material.name}-${index}`}
          className="flex items-center gap-2 text-sm"
        >
          <Package className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1">{material.name}</span>
          {material.quantity ? (
            <span className="text-muted-foreground">× {material.quantity}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
