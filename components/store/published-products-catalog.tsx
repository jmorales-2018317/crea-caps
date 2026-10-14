"use client";

import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";

type PublishedProductsCatalogProps = {
  categoryCode?: string;
};

export function PublishedProductsCatalog({
  categoryCode,
}: PublishedProductsCatalogProps) {
  const productsQuery = useProducts(
    categoryCode ? { categoryCode } : {},
  );

  if (productsQuery.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <QueryErrorState
        title="No se pudo cargar el catálogo"
        message="Hubo un problema al consultar los productos publicados."
        onRetry={() => {
          void productsQuery.refetch();
        }}
      />
    );
  }

  const products = productsQuery.data ?? [];

  if (products.length === 0) {
    return (
      <QueryEmptyState
        title="Catálogo vacío"
        description={
          categoryCode
            ? "No hay productos publicados en esta categoría."
            : "Pronto verás aquí las gorras publicadas."
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard
            product={{
              id: product.id,
              name: product.name,
              code: product.code,
              price: product.price,
              product_images: product.product_images,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
