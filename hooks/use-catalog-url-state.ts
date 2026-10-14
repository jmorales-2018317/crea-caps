"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  clearCatalogFilters,
  normalizeCatalogSearchParams,
  parseCatalogSearchParams,
  serializeCatalogSearchParams,
} from "@/lib/catalog-search-params";
import type { CatalogSearchParams } from "@/types/products";

export function useCatalogUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const params = useMemo(
    () => parseCatalogSearchParams(new URLSearchParams(searchKey)),
    [searchKey],
  );

  function replaceParams(next: CatalogSearchParams) {
    const query = serializeCatalogSearchParams(next).toString();
    if (query === searchKey) {
      return;
    }
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });
  }

  function setParams(
    updater:
      | CatalogSearchParams
      | ((current: CatalogSearchParams) => CatalogSearchParams),
    options?: { resetPage?: boolean },
  ) {
    const draft = typeof updater === "function" ? updater(params) : updater;
    const next = normalizeCatalogSearchParams({
      ...draft,
      page: options?.resetPage === false ? draft.page : 1,
    });
    replaceParams(next);
  }

  function setPage(page: number) {
    setParams((current) => ({ ...current, page }), { resetPage: false });
  }

  function clearFilters() {
    setParams((current) => clearCatalogFilters(current));
  }

  return {
    params,
    setParams,
    setPage,
    clearFilters,
  };
}
