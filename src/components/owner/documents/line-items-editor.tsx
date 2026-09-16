"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lineItemsTotal, type LineItem, type LineItemKind } from "@/lib/documents/types";

export function LineItemsEditor({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const t = useTranslations("documents.editor");

  function updateRow(index: number, patch: Partial<LineItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...items, { kind: "material", description: "", quantity: 1, unit_cost: 0 }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="line_items" value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Select
              value={item.kind}
              onValueChange={(value) => updateRow(index, { kind: value as LineItemKind })}
            >
              <SelectTrigger className="sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">{t("kindMaterial")}</SelectItem>
                <SelectItem value="labor">{t("kindLabor")}</SelectItem>
                <SelectItem value="other">{t("kindOther")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={item.description}
              onChange={(e) => updateRow(index, { description: e.target.value })}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t("quantity")}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                className="w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t("unitCost")}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_cost}
                onChange={(e) => updateRow(index, { unit_cost: Number(e.target.value) })}
                className="w-28"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
              aria-label={t("remove")}
              className="self-end"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
        <Plus /> {t("addItem")}
      </Button>
      <div className="self-end text-sm font-medium">
        {t("total")}: ${lineItemsTotal(items).toFixed(2)}
      </div>
    </div>
  );
}
