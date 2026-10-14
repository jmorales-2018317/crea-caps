import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import {
  CONSTRUCTION_LABELS,
  VISOR_LABELS,
} from "@/schemas/products";
import type { PublishedProductCard } from "@/types/products";

type ProductCardProps = {
  product: PublishedProductCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const primary =
    product.product_images.find((image) => image.is_primary) ??
    product.product_images[0] ??
    null;
  const imageUrl = primary
    ? getCatalogImagePublicUrl(primary.storage_path)
    : null;
  const alt = primary?.alt_text?.trim() || product.name;
  const categories = product.categories ?? [];
  const colors = product.colors ?? [];
  const attributes = product.attributes ?? null;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block min-w-0 space-y-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" aria-hidden />
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <h2 className="truncate text-sm font-medium tracking-tight group-hover:text-foreground">
          {product.name}
        </h2>

        {categories.length > 0 ? (
          <p className="truncate text-xs text-text-secondary">
            {categories.map((category) => category.name).join(" · ")}
          </p>
        ) : null}

        {colors.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1" aria-label="Colores">
            {colors.slice(0, 6).map((color) => (
              <li key={color.id}>
                <span
                  className="block size-3 rounded-full border border-border"
                  style={{ backgroundColor: color.hex_code }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </span>
              </li>
            ))}
            {colors.length > 6 ? (
              <li className="text-[10px] text-muted-foreground">
                +{colors.length - 6}
              </li>
            ) : null}
          </ul>
        ) : null}

        {attributes ? (
          <p className="truncate text-[11px] text-muted-foreground">
            {[
              VISOR_LABELS[attributes.visor_type],
              CONSTRUCTION_LABELS[attributes.construction_type],
              attributes.has_front_logo ? "Con logo" : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
