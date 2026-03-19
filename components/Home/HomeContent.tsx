"use client";

import Link from "next/link";
import { CategoryItem } from "@/components/Category";
import { HomeBannersSlider } from "@/components/Home";
import { ProductCard } from "@/components/Product";
import { useCategories } from "@/hooks/api/useCategories";
import { useProducts } from "@/hooks/api/useProducts";
import { useProductsOnSale } from "@/hooks/api/useProductsOnSale";

export function HomeContent() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { data: productsOnSale = [] } = useProductsOnSale();

  return (
    <main className="bg-background py-4">
      <div className="bg-background space-y-5">
        <HomeBannersSlider />
        {productsOnSale.length > 0 && (
          <section className="px-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">En oferta</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {productsOnSale.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
        {(categories.length > 0 && (
          <section className="px-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Categorías</h2>
              <Link href="/buscar" className="text-xs font-medium">
                Ver más
              </Link>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </div>
          </section>
        )
        )}
        <section className="px-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">Podrían interesarte</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
