import Link from "next/link";
import type { PublishedProductCategory } from "@/types/products";

type ProductCategoriesProps = {
  categories: PublishedProductCategory[];
};

type ProductCategoriesVariant = "section" | "inline";

export function ProductCategories({
  categories,
  variant = "section",
}: ProductCategoriesProps & { variant?: ProductCategoriesVariant }) {
  if (categories.length === 0) {
    return null;
  }

  const list = (
    <ul
      className="flex flex-wrap gap-2"
      aria-label={variant === "inline" ? "Categorías" : undefined}
    >
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/catalogo?categories=${encodeURIComponent(category.code)}`}
            className="inline-flex min-h-9 items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (variant === "inline") {
    return list;
  }

  return (
    <section aria-labelledby="product-categories-heading" className="space-y-3">
      <h2
        id="product-categories-heading"
        className="text-sm font-semibold tracking-tight text-text-strong"
      >
        Categorías
      </h2>
      {list}
    </section>
  );
}
