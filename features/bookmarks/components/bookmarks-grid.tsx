"use client";

import { ProductCard } from "@/components/store/product-card";
import { QueryErrorState } from "@/components/dashboard/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarksEmptyState } from "@/features/bookmarks/components/bookmarks-empty-state";
import { ClearBookmarksButton } from "@/features/bookmarks/components/clear-bookmarks-button";
import { useBookmarkedProducts } from "@/features/bookmarks/hooks/use-bookmarked-products";

export function BookmarksGrid() {
  const {
    data,
    isEmpty,
    hasHydrated,
    isPending,
    isError,
    isFetching,
    productIds,
    refetch,
  } = useBookmarkedProducts();

  const products = productIds.length > 0 ? (data ?? []) : [];
  const showLoading =
    !hasHydrated || (productIds.length > 0 && isPending && !data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-strong">
            Productos guardados
          </h1>
          <p className="text-sm text-text-secondary">
            {hasHydrated
              ? productIds.length === 1
                ? "1 producto en tus guardados"
                : `${productIds.length} productos en tus guardados`
              : "Cargando tus guardados…"}
          </p>
        </div>
        {hasHydrated && productIds.length > 0 ? (
          <ClearBookmarksButton disabled={isFetching && !data} />
        ) : null}
      </div>

      {showLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-square w-full rounded-lg"
            />
          ))}
        </div>
      ) : null}

      {!showLoading && isError && productIds.length > 0 ? (
        <QueryErrorState
          title="No se pudieron cargar tus guardados"
          message="Hubo un problema al consultar los productos. Tus IDs locales se conservan."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!showLoading && !isError && isEmpty ? <BookmarksEmptyState /> : null}

      {!showLoading && !isError && !isEmpty && products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}

      {!showLoading &&
      !isError &&
      !isEmpty &&
      products.length === 0 ? (
        <BookmarksEmptyState />
      ) : null}
    </div>
  );
}
