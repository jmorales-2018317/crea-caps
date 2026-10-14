"use client";

import { useMemo, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
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

/** Above this count, categories switch from checkboxes to a searchable combobox. */
const CATEGORY_COMBOBOX_THRESHOLD = 8;
/** Above this count, colors switch from swatches to a searchable combobox. */
const COLOR_COMBOBOX_THRESHOLD = 18;

type CatalogFiltersProps = {
  params: CatalogSearchParams;
  categories: Category[];
  colors: Color[];
  loading?: boolean;
  idPrefix?: string;
  /** Hide the "Filtros" heading (e.g. when rendered inside a Sheet that already has a title). */
  hideTitle?: boolean;
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

function FilterSection({
  title,
  children,
  count,
}: {
  title: string;
  children: ReactNode;
  count?: number;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wide text-text-secondary uppercase">
        <span>{title}</span>
        {count !== undefined && count > 0 ? (
          <span className="font-medium normal-case text-foreground tabular-nums">
            {count}
          </span>
        ) : null}
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

function ColorSwatch({
  hex,
  className,
}: {
  hex: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-full border border-border",
        className,
      )}
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  );
}

function CategoryFilterList({
  categories,
  selected,
  idPrefix,
  onChange,
}: {
  categories: Category[];
  selected: string[];
  idPrefix: string;
  onChange: (codes: string[]) => void;
}) {
  const chipsRef = useComboboxAnchor();
  const selectedCategories = useMemo(
    () =>
      selected
        .map((code) => categories.find((category) => category.code === code))
        .filter((category): category is Category => Boolean(category)),
    [categories, selected],
  );

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin categorías activas.</p>
    );
  }

  if (categories.length <= CATEGORY_COMBOBOX_THRESHOLD) {
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <CheckboxRow
            key={category.id}
            id={`${idPrefix}-category-${category.code}`}
            checked={selected.includes(category.code)}
            label={category.name}
            onCheckedChange={() =>
              onChange(toggleInList(selected, category.code))
            }
          />
        ))}
      </div>
    );
  }

  return (
    <Combobox
      multiple
      items={categories}
      value={selectedCategories}
      onValueChange={(next) => onChange(next.map((category) => category.code))}
      itemToStringLabel={(category: Category) => category.name}
      isItemEqualToValue={(a: Category, b: Category) => a.id === b.id}
    >
      <ComboboxChips ref={chipsRef} className="w-full bg-background">
        <ComboboxValue>
          {(value: Category[]) => (
            <>
              {value.map((category) => (
                <ComboboxChip key={category.id}>{category.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={`${idPrefix}-category-search`}
                placeholder={
                  value.length > 0 ? "Añadir…" : "Buscar categoría…"
                }
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={chipsRef} className="w-(--anchor-width)">
        <ComboboxEmpty>Sin coincidencias.</ComboboxEmpty>
        <ComboboxList>
          {(category: Category) => (
            <ComboboxItem key={category.id} value={category}>
              {category.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ColorFilterGrid({
  colors,
  selected,
  idPrefix,
  onChange,
}: {
  colors: Color[];
  selected: string[];
  idPrefix: string;
  onChange: (slugs: string[]) => void;
}) {
  const chipsRef = useComboboxAnchor();
  const colorsWithSlug = useMemo(
    () =>
      colors.map((color) => ({
        color,
        slug: slugifyName(color.name),
      })),
    [colors],
  );
  const selectedColors = useMemo(
    () =>
      selected
        .map(
          (slug) =>
            colorsWithSlug.find((entry) => entry.slug === slug)?.color,
        )
        .filter((color): color is Color => Boolean(color)),
    [colorsWithSlug, selected],
  );

  if (colors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin colores activos.</p>
    );
  }

  if (colors.length <= COLOR_COMBOBOX_THRESHOLD) {
    return (
      <div
        className="grid grid-cols-6 gap-2"
        role="group"
        aria-label="Colores"
      >
        {colorsWithSlug.map(({ color, slug }) => {
          const isChecked = selected.includes(slug);
          return (
            <button
              key={color.id}
              type="button"
              id={`${idPrefix}-color-${slug}`}
              title={color.name}
              aria-label={color.name}
              aria-pressed={isChecked}
              onClick={() => onChange(toggleInList(selected, slug))}
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
    );
  }

  return (
    <Combobox
      multiple
      items={colors}
      value={selectedColors}
      onValueChange={(next) =>
        onChange(next.map((color) => slugifyName(color.name)))
      }
      itemToStringLabel={(color: Color) => color.name}
      isItemEqualToValue={(a: Color, b: Color) => a.id === b.id}
    >
      <ComboboxChips ref={chipsRef} className="w-full bg-background">
        <ComboboxValue>
          {(value: Color[]) => (
            <>
              {value.map((color) => (
                <ComboboxChip key={color.id} className="gap-1.5">
                  <ColorSwatch hex={color.hex_code} />
                  {color.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={`${idPrefix}-color-search`}
                placeholder={value.length > 0 ? "Añadir…" : "Buscar color…"}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={chipsRef} className="w-(--anchor-width)">
        <ComboboxEmpty>Sin coincidencias.</ComboboxEmpty>
        <ComboboxList>
          {(color: Color) => (
            <ComboboxItem key={color.id} value={color}>
              <ColorSwatch hex={color.hex_code} />
              <span className="truncate">{color.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
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
  hideTitle = false,
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
  for (const code of params.categories) {
    const category = categories.find((item) => item.code === code);
    chips.push({
      key: `cat-${code}`,
      label: category?.name ?? code,
      clear: () =>
        onChange((current) => ({
          ...current,
          categories: current.categories.filter((item) => item !== code),
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
      {!hideTitle ? (
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
      ) : null}

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

      <FilterSection title="Categorías" count={params.categories.length}>
        <CategoryFilterList
          categories={categories}
          selected={params.categories}
          idPrefix={idPrefix}
          onChange={(slugs) =>
            onChange((current) => ({
              ...current,
              categories: slugs,
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Colores" count={params.colors.length}>
        <ColorFilterGrid
          colors={colors}
          selected={params.colors}
          idPrefix={idPrefix}
          onChange={(slugs) =>
            onChange((current) => ({
              ...current,
              colors: slugs,
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
