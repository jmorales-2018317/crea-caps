import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductAttributesSection } from "@/components/store/product-attributes";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { ProductInfo } from "@/components/store/product-info";
import { ProductPartColors } from "@/components/store/product-part-colors";
import { RelatedProducts } from "@/components/store/related-products";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
} from "@/lib/constants/store";
import { getSiteUrl } from "@/lib/site-url";
import {
  getPublishedProductByCode,
  getRelatedPublishedProducts,
} from "@/services/products.server";
import { getStoreSettings } from "@/services/store-settings.server";

type ProductPageProps = {
  params: Promise<{ code: string }>;
};

function truncateDescription(value: string, max = 160): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { code } = await params;
  const [product, settings] = await Promise.all([
    getPublishedProductByCode(code).catch(() => null),
    getStoreSettings().catch(() => null),
  ]);

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const description =
    (product.description && truncateDescription(product.description)) ||
    settings?.description?.trim() ||
    DEFAULT_STORE_DESCRIPTION;
  const primary =
    product.product_images.find((image) => image.is_primary) ??
    product.product_images[0] ??
    null;
  const imageUrl = primary
    ? getCatalogImagePublicUrl(primary.storage_path)
    : undefined;
  const siteUrl = getSiteUrl();
  const canonicalPath = `/productos/${product.code}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.name} | ${storeName}`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: product.name,
      description,
      url: canonicalPath,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: primary?.alt_text?.trim() || product.name,
            },
          ]
        : undefined,
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductFallback() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = await getPublishedProductByCode(code);

  if (!product) {
    notFound();
  }

  const [settings, related] = await Promise.all([
    getStoreSettings().catch(() => null),
    getRelatedPublishedProducts({
      excludeId: product.id,
      categoryIds: product.categories.map((category) => category.id),
      limit: 4,
    }).catch(() => []),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProductImageGallery
              images={product.product_images}
              productName={product.name}
            />
          </div>
          <div className="min-w-0">
            <ProductInfo
              productId={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              categories={product.categories}
            />
            {product.product_attributes ? (
              <ProductPartColors
                attributes={product.product_attributes}
                partColors={product.product_part_colors}
              />
            ) : null}
          </div>
        </div>

        {product.product_attributes ? (
          <div className="mt-12 border-t border-divider pt-10 sm:mt-14 sm:pt-12">
            <ProductAttributesSection
              attributes={product.product_attributes}
            />
          </div>
        ) : null}
      </main>
      <RelatedProducts products={related} />
      <StoreFooter settings={settings} />
    </div>
  );
}
