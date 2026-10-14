import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import type { PublishedProductCard } from "@/types/products";

type FeaturedProductsProps = {
  products: PublishedProductCard[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section
      id="destacados"
      aria-labelledby="featured-products-heading"
      className="scroll-mt-16 border-t border-divider"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2
              id="featured-products-heading"
              className="text-balance text-2xl font-semibold tracking-tight text-text-strong"
            >
              Productos destacados
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
              Una selección de gorras publicadas para explorar estilos y
              acabados.
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            variant="outline"
            className="h-11 shrink-0 rounded-xl px-5"
            render={<Link href="/catalogo" />}
          >
            Ver catálogo
            <ArrowRight aria-hidden />
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Aún no hay productos destacados. Explora el{" "}
            <Link
              href="/catalogo"
              className="font-medium text-gold-soft underline-offset-4 hover:underline"
            >
              catálogo completo
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
