"use client";

import { ProductCard, ProductCarousel, ProductPrice } from "@/components/Product";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import GoBack from "@/components/go-back";
import { useProductById } from "@/hooks/api/useProductById";
import { useProducts } from "@/hooks/api/useProducts";
import { notFound } from "next/navigation";

type ProductDetailContentProps = {
  productId: string;
};

export function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const { data: product, isError } = useProductById(productId);
  const { data: products = [] } = useProducts();

  if (isError || !product) {
    return notFound();
  }

  return (
    <div className="bg-background flex flex-col items-center justify-center space-y-5 pb-25">
      <section className="w-full bg-zinc-100 py-5 px-4 space-y-4">
        <div className="relative flex items-center justify-center">
          <h1 className="text-lg font-semibold text-gray-900">{product.name}</h1>
          <GoBack />
        </div>
        <ProductCarousel productImages={product.images} />
      </section>
      <div className="w-full px-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {product.categories.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>

        <h2 className="text-base font-semibold text-gray-900 mt-4">
          Detalles del producto
        </h2>
        <p className="text-sm leading-relaxed text-gray-500 mt-1">
          {product.description}
        </p>
      </div>

      <ProductPrice product={product} />

      <Separator />

      <section className="w-full px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">
            Productos relacionados
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
