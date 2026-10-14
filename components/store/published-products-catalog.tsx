"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";

export function PublishedProductsCatalog() {
  const productsQuery = useProducts();

  if (productsQuery.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] w-full rounded-lg" />
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
        description="Pronto verás aquí las gorras publicadas."
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const primary =
          product.product_images.find((image) => image.is_primary) ??
          product.product_images[0] ??
          null;
        const imageUrl = primary
          ? getCatalogImagePublicUrl(primary.storage_path)
          : null;
        const alt = primary?.alt_text?.trim() || product.name;

        return (
          <li key={product.id} className="min-w-0">
            <article className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-8" aria-hidden />
                  </span>
                )}
              </div>
              <h2 className="truncate text-sm font-medium tracking-tight">
                {product.name}
              </h2>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
