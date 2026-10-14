"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { CatalogPagination } from "@/components/store/catalog-pagination";
import { CatalogSearchBar } from "@/components/store/catalog-search-bar";
import { CatalogSortSelect } from "@/components/store/catalog-sort";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { countActiveCatalogFilters } from "@/lib/catalog-search-params";
import {
  useCatalogFilterCategories,
  useCatalogFilterColors,
  useCatalogSearch,
} from "@/hooks/use-catalog-search";
import { useCatalogUrlState } from "@/hooks/use-catalog-url-state";

export function CatalogPageClient() {
  const { params, setParams, setPage, clearFilters } = useCatalogUrlState();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchQuery = useCatalogSearch(params);
  const categoriesQuery = useCatalogFilterCategories();
  const colorsQuery = useCatalogFilterColors();
  const activeCount = countActiveCatalogFilters(params);
  const facetsLoading = categoriesQuery.isPending || colorsQuery.isPending;

  const filterProps = {
    params,
    categories: categoriesQuery.data ?? [],
    colors: colorsQuery.data ?? [],
    loading: facetsLoading,
    onChange: (updater: Parameters<typeof setParams>[0]) =>
      setParams(updater),
    onClear: clearFilters,
  };

  const total = searchQuery.data?.total ?? 0;
  const items = searchQuery.data?.items ?? [];
  const showInitialLoading = searchQuery.isPending && !searchQuery.isPlaceholderData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogSearchBar
          value={params.q}
          onChange={(q) => setParams((current) => ({ ...current, q }))}
        />
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 lg:hidden"
                />
              }
            >
              <SlidersHorizontal />
              Filtros
              {activeCount > 0 ? (
                <span className="rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                  {activeCount}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto p-0">
              <SheetHeader className="border-b border-divider px-4 py-3">
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription className="sr-only">
                  Filtrar el catálogo de gorras
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <CatalogFilters {...filterProps} idPrefix="catalog-mobile" />
              </div>
            </SheetContent>
          </Sheet>
          <CatalogSortSelect
            value={params.sort}
            onChange={(sort) => setParams((current) => ({ ...current, sort }))}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-divider bg-card/40 p-4">
            <CatalogFilters {...filterProps} idPrefix="catalog-desktop" />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {showInitialLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[4/5] w-full rounded-lg"
                />
              ))}
            </div>
          ) : null}

          {searchQuery.isError ? (
            <QueryErrorState
              title="No se pudo cargar el catálogo"
              message="Hubo un problema al consultar los productos publicados."
              onRetry={() => {
                void searchQuery.refetch();
              }}
            />
          ) : null}

          {!showInitialLoading && !searchQuery.isError && items.length === 0 ? (
            <QueryEmptyState
              title="Sin coincidencias"
              description={
                activeCount > 0
                  ? "Prueba a quitar algunos filtros o cambiar el término de búsqueda."
                  : "Pronto verás aquí las gorras publicadas."
              }
            />
          ) : null}

          {!showInitialLoading && !searchQuery.isError && items.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <li key={product.id} className="min-w-0">
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
              <CatalogPagination
                page={params.page}
                pageSize={params.pageSize}
                total={total}
                onPageChange={setPage}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
