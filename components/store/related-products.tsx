import { ProductCard } from "@/components/store/product-card";
import type { PublishedProductCard } from "@/types/products";

type RelatedProductsProps = {
  products: PublishedProductCard[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className="border-t border-divider"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-8 space-y-2">
          <h2
            id="related-products-heading"
            className="text-balance text-2xl font-semibold tracking-tight text-text-strong"
          >
            Productos relacionados
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
            Otras gorras publicadas de categorías similares.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
