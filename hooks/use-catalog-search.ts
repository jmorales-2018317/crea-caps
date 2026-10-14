"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listActiveCategoriesForFilters } from "@/services/categories";
import { searchPublishedProducts } from "@/services/catalog-search";
import { listActiveColors } from "@/services/colors";
import type { CatalogSearchParams } from "@/types/products";

export const catalogSearchQueryKey = ["products", "catalog"] as const;
export const catalogFilterCategoriesQueryKey = [
  "categories",
  "catalog-filters",
] as const;
export const catalogFilterColorsQueryKey = [
  "colors",
  "catalog-filters",
] as const;

export function catalogSearchParamsQueryKey(params: CatalogSearchParams) {
  return [...catalogSearchQueryKey, params] as const;
}

export function useCatalogSearch(params: CatalogSearchParams) {
  return useQuery({
    queryKey: catalogSearchParamsQueryKey(params),
    queryFn: () => searchPublishedProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogFilterCategories() {
  return useQuery({
    queryKey: catalogFilterCategoriesQueryKey,
    queryFn: listActiveCategoriesForFilters,
  });
}

export function useCatalogFilterColors() {
  return useQuery({
    queryKey: catalogFilterColorsQueryKey,
    queryFn: listActiveColors,
  });
}
