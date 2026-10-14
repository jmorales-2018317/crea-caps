"use client";

import { useState, type ReactNode } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { countActiveCatalogFilters } from "@/lib/catalog-search-params";
import { slugifyName } from "@/lib/slug";
import {
  CONSTRUCTION_LABELS,
  CONSTRUCTION_TYPES,
  STRAP_LABELS,
  STRAP_TYPES,
  VISOR_LABELS,
  VISOR_TYPES,
} from "@/schemas/products";
import type { CatalogSearchParams } from "@/types/products";
import type { Category } from "@/types/categories";
import type { Color } from "@/types/colors";
import { cn } from "cn";

const CATEGORY_PREVIEW_COUNT = 6;
const COLOR_PREVIEW_COUNT = 18;
const SEARCHABLE_THRESHOLD = 10;

type CatalogFiltersProps = {
  params: CatalogSearchParams;
  categories: Category[];
  colors: Color[];
  loading?: boolean;
  idPrefix?: string;
  onChange: (
    updater: (current: CatalogSearchParams) => CatalogSearchParams,
  ) => void;
  onClear: () => void;
};

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function sortSelectedFirst<T>(
  items: T[],
  isSelected: (item: T) => boolean,
): T[] {
  return [...items].sort((a, b) => {
    const aSelected = isSelected(a);
    const bSelected = isSelected(b);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function CheckboxRow({
  id,
  checked,
  disabled,
  label,
  onCheckedChange,
  leading,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  leading?: ReactNode;
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      {leading}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Label>
  );
}

function FilterSearch({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 text-sm"
      />
    </div>
  );
}

function ExpandToggle({
  expanded,
  hiddenCount,
  onToggle,
}: {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}) {
  if (hiddenCount <= 0 && !expanded) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="mt-1 h-7 px-1.5 text-xs text-text-secondary hover:text-foreground"
      onClick={onToggle}
    >
      {expanded ? "Ver menos" : `Ver ${hiddenCount} más`}
    </Button>
  );
}

function CategoryFilterList({
  categories,
  selected,
  idPrefix,
  onToggle,
}: {
  categories: Category[];
  selected: string[];
  idPrefix: string;
  onToggle: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const showSearch = categories.length > SEARCHABLE_THRESHOLD;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = sortSelectedFirst(
    categories.filter((category) =>
      normalizedQuery
        ? category.name.toLowerCase().includes(normalizedQuery)
        : true,
    ),
    (category) => selected.includes(category.slug),
  );

  const visible =
    expanded || normalizedQuery
      ? filtered
      : filtered.slice(0, CATEGORY_PREVIEW_COUNT);
  const hiddenCount = Math.max(0, filtered.length - CATEGORY_PREVIEW_COUNT);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin categorías activas.</p>
    );
  }

  return (
    <div className="space-y-2">
      {showSearch ? (
        <FilterSearch
          id={`${idPrefix}-category-search`}
          value={query}
          onChange={setQuery}
          placeholder="Buscar categoría…"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
      ) : (
        <div
          className={cn(
            "space-y-2",
            expanded &&
              filtered.length > CATEGORY_PREVIEW_COUNT &&
              "max-h-56 overflow-y-auto overscroll-contain pr-1",
          )}
        >
          {visible.map((category) => (
            <CheckboxRow
              key={category.id}
              id={`${idPrefix}-category-${category.slug}`}
              checked={selected.includes(category.slug)}
              label={category.name}
              onCheckedChange={() => onToggle(category.slug)}
            />
          ))}
        </div>
      )}

      {!normalizedQuery ? (
        <ExpandToggle
          expanded={expanded}
          hiddenCount={hiddenCount}
          onToggle={() => setExpanded((current) => !current)}
        />
      ) : null}
    </div>
  );
}

function ColorFilterGrid({
  colors,
  selected,
  idPrefix,
  onToggle,
}: {
  colors: Color[];
  selected: string[];
  idPrefix: string;
  onToggle: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const showSearch = colors.length > SEARCHABLE_THRESHOLD;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = sortSelectedFirst(
    colors.filter((color) =>
      normalizedQuery
        ? color.name.toLowerCase().includes(normalizedQuery)
        : true,
    ),
    (color) => selected.includes(slugifyName(color.name)),
  );

  const visible =
    expanded || normalizedQuery
      ? filtered
      : filtered.slice(0, COLOR_PREVIEW_COUNT);
  const hiddenCount = Math.max(0, filtered.length - COLOR_PREVIEW_COUNT);

  if (colors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin colores activos.</p>
    );
  }

  return (
    <div className="space-y-2">
      {showSearch ? (
        <FilterSearch
          id={`${idPrefix}-color-search`}
          value={query}
          onChange={setQuery}
          placeholder="Buscar color…"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
      ) : (
        <div
          className={cn(
            "grid grid-cols-6 gap-2",
            expanded &&
              filtered.length > COLOR_PREVIEW_COUNT &&
              "max-h-44 overflow-y-auto overscroll-contain pr-1",
          )}
          role="group"
          aria-label="Colores"
        >
          {visible.map((color) => {
            const slug = slugifyName(color.name);
            const isChecked = selected.includes(slug);
            return (
              <button
                key={color.id}
                type="button"
                id={`${idPrefix}-color-${slug}`}
                title={color.name}
                aria-label={color.name}
                aria-pressed={isChecked}
                onClick={() => onToggle(slug)}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-full border outline-none transition-[box-shadow,transform] focus-visible:ring-3 focus-visible:ring-ring/50",
                  isChecked
                    ? "scale-105 border-foreground shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--foreground)]"
                    : "border-border hover:scale-105",
                )}
                style={{ backgroundColor: color.hex_code }}
              >
                {isChecked ? (
                  <Check
                    className="size-3.5 drop-shadow-[0_1px_1px_rgb(0_0_0_/_0.55)]"
                    style={{
                      color:
                        relativeLuminance(color.hex_code) > 0.55
                          ? "#171717"
                          : "#fafafa",
                    }}
                    aria-hidden
                  />
                ) : null}
                <span className="sr-only">{color.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {!normalizedQuery ? (
        <ExpandToggle
          expanded={expanded}
          hiddenCount={hiddenCount}
          onToggle={() => setExpanded((current) => !current)}
        />
      ) : null}
    </div>
  );
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  if (full.length !== 6) return 0.5;

  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function CatalogFilters({
  params,
  categories,
  colors,
  loading,
  idPrefix = "catalog",
  onChange,
  onClear,
}: CatalogFiltersProps) {
  const activeCount = countActiveCatalogFilters(params);
  const strapDisabled = params.hasStrap === false;
  const id = (suffix: string) => `${idPrefix}-${suffix}`;

  const chips: Array<{ key: string; label: string; clear: () => void }> = [];

  if (params.q) {
    chips.push({
      key: "q",
      label: `“${params.q}”`,
      clear: () => onChange((current) => ({ ...current, q: "" })),
    });
  }
  for (const slug of params.categories) {
    const category = categories.find((item) => item.slug === slug);
    chips.push({
      key: `cat-${slug}`,
      label: category?.name ?? slug,
      clear: () =>
        onChange((current) => ({
          ...current,
          categories: current.categories.filter((item) => item !== slug),
        })),
    });
  }
  for (const slug of params.colors) {
    const color = colors.find((item) => slugifyName(item.name) === slug);
    chips.push({
      key: `color-${slug}`,
      label: color?.name ?? slug,
      clear: () =>
        onChange((current) => ({
          ...current,
          colors: current.colors.filter((item) => item !== slug),
        })),
    });
  }
  for (const value of params.visor) {
    chips.push({
      key: `visor-${value}`,
      label: VISOR_LABELS[value],
      clear: () =>
        onChange((current) => ({
          ...current,
          visor: current.visor.filter((item) => item !== value),
        })),
    });
  }
  for (const value of params.construction) {
    chips.push({
      key: `construction-${value}`,
      label: CONSTRUCTION_LABELS[value],
      clear: () =>
        onChange((current) => ({
          ...current,
          construction: current.construction.filter((item) => item !== value),
        })),
    });
  }
  if (params.hasStrap !== null) {
    chips.push({
      key: "has-strap",
      label: params.hasStrap ? "Con cincho" : "Sin cincho",
      clear: () => onChange((current) => ({ ...current, hasStrap: null })),
    });
  }
  for (const value of params.strap) {
    chips.push({
      key: `strap-${value}`,
      label: STRAP_LABELS[value],
      clear: () =>
        onChange((current) => ({
          ...current,
          strap: current.strap.filter((item) => item !== value),
        })),
    });
  }
  if (params.hasFrontLogo !== null) {
    chips.push({
      key: "logo",
      label: params.hasFrontLogo ? "Con logo" : "Sin logo",
      clear: () => onChange((current) => ({ ...current, hasFrontLogo: null })),
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-text-strong">
          Filtros
          {activeCount > 0 ? (
            <span className="ml-1.5 text-text-secondary">({activeCount})</span>
          ) : null}
        </p>
        {activeCount > 0 ? (
          <Button type="button" variant="ghost" size="xs" onClick={onClear}>
            Limpiar todo
          </Button>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground transition-colors hover:bg-surface-hover"
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="sr-only">Eliminar filtro {chip.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <FilterSection title="Categorías">
        <CategoryFilterList
          categories={categories}
          selected={params.categories}
          idPrefix={idPrefix}
          onToggle={(slug) =>
            onChange((current) => ({
              ...current,
              categories: toggleInList(current.categories, slug),
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Colores">
        <ColorFilterGrid
          colors={colors}
          selected={params.colors}
          idPrefix={idPrefix}
          onToggle={(slug) =>
            onChange((current) => ({
              ...current,
              colors: toggleInList(current.colors, slug),
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Tipo de visera">
        {VISOR_TYPES.map((value) => (
          <CheckboxRow
            key={value}
            id={id(`visor-${value}`)}
            checked={params.visor.includes(value)}
            label={VISOR_LABELS[value]}
            onCheckedChange={() =>
              onChange((current) => ({
                ...current,
                visor: toggleInList(current.visor, value),
              }))
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Construcción">
        {CONSTRUCTION_TYPES.map((value) => (
          <CheckboxRow
            key={value}
            id={id(`construction-${value}`)}
            checked={params.construction.includes(value)}
            label={CONSTRUCTION_LABELS[value]}
            onCheckedChange={() =>
              onChange((current) => ({
                ...current,
                construction: toggleInList(current.construction, value),
              }))
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Cincho">
        <CheckboxRow
          id={id("has-strap-yes")}
          checked={params.hasStrap === true}
          label="Tiene cincho"
          onCheckedChange={(checked) =>
            onChange((current) => ({
              ...current,
              hasStrap: checked ? true : null,
            }))
          }
        />
        <CheckboxRow
          id={id("has-strap-no")}
          checked={params.hasStrap === false}
          disabled={params.strap.length > 0}
          label="No tiene cincho"
          onCheckedChange={(checked) =>
            onChange((current) => ({
              ...current,
              hasStrap: checked ? false : null,
              strap: checked ? [] : current.strap,
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Tipo de cincho">
        {STRAP_TYPES.map((value) => (
          <CheckboxRow
            key={value}
            id={id(`strap-${value}`)}
            checked={params.strap.includes(value)}
            disabled={strapDisabled}
            label={STRAP_LABELS[value]}
            onCheckedChange={() =>
              onChange((current) => ({
                ...current,
                hasStrap:
                  current.hasStrap === false ? null : current.hasStrap,
                strap: toggleInList(current.strap, value),
              }))
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Logo frontal">
        <CheckboxRow
          id={id("logo-yes")}
          checked={params.hasFrontLogo === true}
          label="Con logo"
          onCheckedChange={(checked) =>
            onChange((current) => ({
              ...current,
              hasFrontLogo: checked ? true : null,
            }))
          }
        />
        <CheckboxRow
          id={id("logo-no")}
          checked={params.hasFrontLogo === false}
          label="Sin logo"
          onCheckedChange={(checked) =>
            onChange((current) => ({
              ...current,
              hasFrontLogo: checked ? false : null,
            }))
          }
        />
      </FilterSection>
    </div>
  );
}
