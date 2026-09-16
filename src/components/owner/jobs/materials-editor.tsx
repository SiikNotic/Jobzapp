"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JobMaterial } from "@/lib/jobs/types";

export function MaterialsEditor({
  materials,
  onChange,
}: {
  materials: JobMaterial[];
  onChange: (materials: JobMaterial[]) => void;
}) {
  const t = useTranslations("jobs.materials");

  function updateRow(index: number, patch: Partial<JobMaterial>) {
    onChange(materials.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function removeRow(index: number) {
    onChange(materials.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...materials, { name: "", quantity: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="materials" value={JSON.stringify(materials)} />
      {materials.map((material, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={material.name}
            onChange={(e) => updateRow(index, { name: e.target.value })}
            placeholder={t("namePlaceholder")}
            className="flex-1"
          />
          <Input
            value={material.quantity}
            onChange={(e) => updateRow(index, { quantity: e.target.value })}
            placeholder={t("quantityPlaceholder")}
            className="w-24"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeRow(index)}
            aria-label={t("remove")}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
        <Plus /> {t("addMaterial")}
      </Button>
    </div>
  );
}
