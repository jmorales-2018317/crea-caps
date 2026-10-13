"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { X } from "lucide-react";
import { CategoryLucideIcon } from "@/components/shared/category-lucide-icon";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  filterLucideIconNames,
  formatLucideIconLabel,
} from "@/lib/category-icons";

const VISIBLE_ICON_LIMIT = 40;

type CategoryIconPickerProps = {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function CategoryIconPicker({
  id,
  value,
  onChange,
  disabled = false,
  "aria-invalid": ariaInvalid,
}: CategoryIconPickerProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const items = useMemo(
    () =>
      filterLucideIconNames(deferredQuery, {
        limit: VISIBLE_ICON_LIMIT,
        include: value,
      }),
    [deferredQuery, value],
  );

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          {value ? (
            <CategoryLucideIcon name={value} className="size-4" />
          ) : (
            <span className="text-xs text-text-subtle">—</span>
          )}
        </span>
        <Combobox
          items={items}
          value={value}
          onValueChange={(next) => {
            onChange(next);
            if (next) {
              setQuery("");
            }
          }}
          inputValue={query}
          onInputValueChange={(next, details) => {
            if (
              details.reason === "item-press" ||
              details.reason === "input-clear"
            ) {
              setQuery("");
              return;
            }
            setQuery(next);
          }}
          itemToStringLabel={(name: string) => formatLucideIconLabel(name)}
          filter={null}
          disabled={disabled}
        >
          <ComboboxInput
            id={id}
            className="w-full min-w-0 flex-1"
            placeholder="Buscar icono Lucide…"
            showClear={query.length > 0}
            aria-invalid={ariaInvalid}
          />
          <ComboboxContent className="w-(--anchor-width)">
            <ComboboxEmpty>No se encontraron iconos.</ComboboxEmpty>
            <ComboboxList>
              {(name: string) => (
                <ComboboxItem key={name} value={name}>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <CategoryLucideIcon
                      name={name}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="truncate font-mono text-xs">{name}</span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {value ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Quitar icono"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Escribe para buscar entre todos los iconos de Lucide. Déjalo vacío si
        no quieres icono.
      </p>
    </div>
  );
}
