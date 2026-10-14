"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATALOG_SORT_OPTIONS } from "@/lib/catalog-search-params";
import type { CatalogSort } from "@/types/products";

type CatalogSortSelectProps = {
  value: CatalogSort;
  onChange: (value: CatalogSort) => void;
};

export function CatalogSortSelect({ value, onChange }: CatalogSortSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onChange(next as CatalogSort);
        }
      }}
    >
      <SelectTrigger
        className="h-10 w-full min-w-44 sm:w-52"
        aria-label="Ordenar resultados"
      >
        <SelectValue>
          {(item: CatalogSort | null) =>
            CATALOG_SORT_OPTIONS.find((option) => option.value === item)
              ?.label ?? "Ordenar"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {CATALOG_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
