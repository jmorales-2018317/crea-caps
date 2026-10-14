import {
  CONSTRUCTION_TYPES,
  STRAP_TYPES,
  VISOR_TYPES,
} from "@/schemas/products";
import type {
  CatalogSearchParams,
  CatalogSort,
  ConstructionType,
  StrapType,
  VisorType,
} from "@/types/products";

export const CATALOG_DEFAULT_SORT: CatalogSort = "created_at_desc";
export const CATALOG_DEFAULT_PAGE_SIZE = 12;
export const CATALOG_MAX_PAGE_SIZE = 48;

const SORT_VALUES = [
  "name_asc",
  "name_desc",
  "created_at_asc",
  "created_at_desc",
] as const satisfies readonly CatalogSort[];

const VISOR_SET = new Set<string>(VISOR_TYPES);
const CONSTRUCTION_SET = new Set<string>(CONSTRUCTION_TYPES);
const STRAP_SET = new Set<string>(STRAP_TYPES);
const SORT_SET = new Set<string>(SORT_VALUES);

function parseCsv(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  const seen = new Set<string>();
  const items: string[] = [];

  for (const part of value.split(",")) {
    const trimmed = part.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    items.push(trimmed);
  }

  return items;
}

function parseBooleanFlag(
  value: string | null | undefined,
): boolean | null {
  if (value === "1" || value === "true") {
    return true;
  }
  if (value === "0" || value === "false") {
    return false;
  }
  return null;
}

function parsePositiveInt(
  value: string | null | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function filterKnown<T extends string>(
  values: string[],
  allowed: Set<string>,
): T[] {
  return values.filter((value): value is T => allowed.has(value));
}

export function createDefaultCatalogSearchParams(
  overrides: Partial<CatalogSearchParams> = {},
): CatalogSearchParams {
  return normalizeCatalogSearchParams({
    q: "",
    categories: [],
    colors: [],
    visor: [],
    construction: [],
    hasStrap: null,
    strap: [],
    hasFrontLogo: null,
    sort: CATALOG_DEFAULT_SORT,
    page: 1,
    pageSize: CATALOG_DEFAULT_PAGE_SIZE,
    ...overrides,
  });
}

export function normalizeCatalogSearchParams(
  params: CatalogSearchParams,
): CatalogSearchParams {
  const hasStrap = params.hasStrap;
  const strap =
    hasStrap === false
      ? []
      : filterKnown<StrapType>(params.strap, STRAP_SET);

  return {
    q: params.q.trim(),
    categories: [...new Set(params.categories.map((s) => s.trim().toLowerCase()).filter(Boolean))].sort(),
    colors: [...new Set(params.colors.map((s) => s.trim().toLowerCase()).filter(Boolean))].sort(),
    visor: filterKnown<VisorType>(
      [...new Set(params.visor)].sort(),
      VISOR_SET,
    ),
    construction: filterKnown<ConstructionType>(
      [...new Set(params.construction)].sort(),
      CONSTRUCTION_SET,
    ),
    hasStrap: strap.length > 0 && hasStrap === false ? null : hasStrap,
    strap,
    hasFrontLogo: params.hasFrontLogo,
    sort: SORT_SET.has(params.sort) ? params.sort : CATALOG_DEFAULT_SORT,
    page: Math.max(1, Math.floor(params.page) || 1),
    pageSize: Math.min(
      CATALOG_MAX_PAGE_SIZE,
      Math.max(1, Math.floor(params.pageSize) || CATALOG_DEFAULT_PAGE_SIZE),
    ),
  };
}

export function parseCatalogSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): CatalogSearchParams {
  return normalizeCatalogSearchParams({
    q: searchParams.get("q") ?? "",
    categories: parseCsv(searchParams.get("categories")),
    colors: parseCsv(searchParams.get("colors")),
    visor: filterKnown<VisorType>(parseCsv(searchParams.get("visor")), VISOR_SET),
    construction: filterKnown<ConstructionType>(
      parseCsv(searchParams.get("construction")),
      CONSTRUCTION_SET,
    ),
    hasStrap: parseBooleanFlag(searchParams.get("has_strap")),
    strap: filterKnown<StrapType>(parseCsv(searchParams.get("strap")), STRAP_SET),
    hasFrontLogo: parseBooleanFlag(searchParams.get("logo")),
    sort: (searchParams.get("sort") as CatalogSort) || CATALOG_DEFAULT_SORT,
    page: parsePositiveInt(searchParams.get("page"), 1),
    pageSize: parsePositiveInt(
      searchParams.get("pageSize"),
      CATALOG_DEFAULT_PAGE_SIZE,
    ),
  });
}

type ReadonlyURLSearchParams = {
  get(name: string): string | null;
};

function csv(values: string[]): string | null {
  return values.length > 0 ? values.join(",") : null;
}

function booleanFlag(value: boolean | null): string | null {
  if (value === true) {
    return "1";
  }
  if (value === false) {
    return "0";
  }
  return null;
}

/** Serialize params for the URL. Omits defaults to keep links short. */
export function serializeCatalogSearchParams(
  params: CatalogSearchParams,
): URLSearchParams {
  const normalized = normalizeCatalogSearchParams(params);
  const out = new URLSearchParams();

  if (normalized.q) {
    out.set("q", normalized.q);
  }
  const categories = csv(normalized.categories);
  if (categories) {
    out.set("categories", categories);
  }
  const colors = csv(normalized.colors);
  if (colors) {
    out.set("colors", colors);
  }
  const visor = csv(normalized.visor);
  if (visor) {
    out.set("visor", visor);
  }
  const construction = csv(normalized.construction);
  if (construction) {
    out.set("construction", construction);
  }
  const hasStrap = booleanFlag(normalized.hasStrap);
  if (hasStrap) {
    out.set("has_strap", hasStrap);
  }
  const strap = csv(normalized.strap);
  if (strap) {
    out.set("strap", strap);
  }
  const logo = booleanFlag(normalized.hasFrontLogo);
  if (logo) {
    out.set("logo", logo);
  }
  if (normalized.sort !== CATALOG_DEFAULT_SORT) {
    out.set("sort", normalized.sort);
  }
  if (normalized.page > 1) {
    out.set("page", String(normalized.page));
  }

  return out;
}

export function catalogSearchParamsToHref(params: CatalogSearchParams): string {
  const query = serializeCatalogSearchParams(params).toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

/** Count of active filter groups (excludes sort/page). */
export function countActiveCatalogFilters(params: CatalogSearchParams): number {
  const normalized = normalizeCatalogSearchParams(params);
  let count = 0;

  if (normalized.q) {
    count += 1;
  }
  if (normalized.categories.length > 0) {
    count += 1;
  }
  if (normalized.colors.length > 0) {
    count += 1;
  }
  if (normalized.visor.length > 0) {
    count += 1;
  }
  if (normalized.construction.length > 0) {
    count += 1;
  }
  if (normalized.hasStrap !== null) {
    count += 1;
  }
  if (normalized.strap.length > 0) {
    count += 1;
  }
  if (normalized.hasFrontLogo !== null) {
    count += 1;
  }

  return count;
}

export function clearCatalogFilters(
  params: CatalogSearchParams,
): CatalogSearchParams {
  return normalizeCatalogSearchParams({
    ...params,
    q: "",
    categories: [],
    colors: [],
    visor: [],
    construction: [],
    hasStrap: null,
    strap: [],
    hasFrontLogo: null,
    page: 1,
  });
}

export const CATALOG_SORT_OPTIONS: Array<{
  value: CatalogSort;
  label: string;
}> = [
  { value: "created_at_desc", label: "Más recientes" },
  { value: "created_at_asc", label: "Más antiguos" },
  { value: "name_asc", label: "Nombre A–Z" },
  { value: "name_desc", label: "Nombre Z–A" },
];
