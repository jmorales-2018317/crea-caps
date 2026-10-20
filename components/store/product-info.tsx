import Link from "next/link";
import { ProductCategories } from "@/components/store/product-categories";
import { BookmarkButton } from "@/components/store/bookmark-button";
import { formatGtq } from "@/lib/format-currency";
import type { PublishedProductCategory } from "@/types/products";

type ProductInfoProps = {
  productId: string;
  name: string;
  price: number;
  description: string | null;
  categories: PublishedProductCategory[];
};

export function ProductInfo({
  productId,
  name,
  price,
  description,
  categories,
}: ProductInfoProps) {
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
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 text-balance text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
              {name}
            </h1>
            <BookmarkButton
              productId={productId}
              size="lg"
              variant="outline"
              className="size-9 shrink-0 rounded-lg sm:size-11 [&_svg]:size-4 sm:[&_svg]:size-6"
            />
          </div>
          <p className="text-xl font-semibold tabular-nums tracking-tight text-text-strong sm:text-2xl">
            {formatGtq(price)}
          </p>
        </div>

        <ProductCategories categories={categories} variant="inline" />
      </div>

      {trimmedDescription ? (
        <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-text-secondary sm:text-base">
          {trimmedDescription}
        </p>
      ) : null}
    </div>
  );
}
