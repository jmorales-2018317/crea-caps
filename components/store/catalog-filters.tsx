"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin categorías activas.</p>
        ) : (
          categories.map((category) => (
            <CheckboxRow
              key={category.id}
              id={id(`category-${category.slug}`)}
              checked={params.categories.includes(category.slug)}
              label={category.name}
              onCheckedChange={() =>
                onChange((current) => ({
                  ...current,
                  categories: toggleInList(current.categories, category.slug),
                }))
              }
            />
          ))
        )}
      </FilterSection>

      <FilterSection title="Colores">
        {colors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin colores activos.</p>
        ) : (
          colors.map((color) => {
            const slug = slugifyName(color.name);
            return (
              <CheckboxRow
                key={color.id}
                id={id(`color-${slug}`)}
                checked={params.colors.includes(slug)}
                label={color.name}
                leading={
                  <span
                    className="size-3.5 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: color.hex_code }}
                    aria-hidden
                  />
                }
                onCheckedChange={() =>
                  onChange((current) => ({
                    ...current,
                    colors: toggleInList(current.colors, slug),
                  }))
                }
              />
            );
          })
        )}
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
