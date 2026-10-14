import Link from "next/link";
import { ProductCategories } from "@/components/store/product-categories";
import type { PublishedProductCategory } from "@/types/products";

type ProductInfoProps = {
  name: string;
  sku: string | null;
  description: string | null;
  categories: PublishedProductCategory[];
};

export function ProductInfo({
  name,
  sku,
  description,
  categories,
}: ProductInfoProps) {
  const trimmedSku = sku?.trim() || null;
  const trimmedDescription = description?.trim() || null;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <nav aria-label="Miga de pan" className="text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/catalogo"
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Catálogo
              </Link>
            </li>
            <li aria-hidden className="text-border">
              /
            </li>
            <li className="min-w-0 truncate text-foreground">{name}</li>
          </ol>
        </nav>

        <div className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            {name}
          </h1>
          {trimmedSku ? (
            <p className="text-sm text-text-secondary">
              <span className="text-muted-foreground">SKU</span>{" "}
              <span className="font-medium text-foreground">{trimmedSku}</span>
            </p>
          ) : null}
        </div>

        <ProductCategories categories={categories} variant="inline" />
      </div>

      <div className="border-t border-divider pt-5">
        <h2 className="mb-2 text-sm font-semibold tracking-tight text-text-strong">
          Descripción
        </h2>
        {trimmedDescription ? (
          <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-text-secondary sm:text-base">
            {trimmedDescription}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este producto no tiene descripción.
          </p>
        )}
      </div>
    </div>
  );
}
