import { cacheLife, cacheTag } from "next/cache";
import { sortProductImages } from "@/lib/product-images-sort";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  PublishedProductCard,
  PublishedProductDetail,
  ProductPart,
} from "@/types/products";

const DETAIL_SELECT = `
  id,
  name,
  slug,
  sku,
  description,
  status,
  product_images (
    id,
    storage_path,
    alt_text,
    is_primary,
    sort_order,
    created_at
  ),
  product_attributes (
    visor_type,
    construction_type,
    has_strap,
    strap_type,
    has_front_logo
  ),
  product_categories (
    categories ( id, name, slug )
  ),
  product_part_colors (
    part,
    color_id,
    colors ( id, name, hex_code )
  )
` as const;

const CARD_SELECT = `
  id,
  name,
  slug,
  product_images (
    id,
    storage_path,
    alt_text,
    is_primary,
    sort_order,
    created_at
  )
` as const;

export function productCacheTag(slug: string) {
  return `product-${slug}`;
}

type DetailRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: PublishedProductDetail["status"];
  product_images: PublishedProductDetail["product_images"] | null;
  product_attributes:
    | PublishedProductDetail["product_attributes"]
    | PublishedProductDetail["product_attributes"][]
    | null;
  product_categories:
    | Array<{
        categories: {
          id: string;
          name: string;
          slug: string;
        } | null;
      }>
    | null;
  product_part_colors:
    | Array<{
        part: ProductPart;
        color_id: string;
        colors: {
          id: string;
          name: string;
          hex_code: string;
        } | null;
      }>
    | null;
};

function normalizeAttributes(
  value:
    | PublishedProductDetail["product_attributes"]
    | PublishedProductDetail["product_attributes"][]
    | null
    | undefined,
): PublishedProductDetail["product_attributes"] {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function mapDetail(row: DetailRow): PublishedProductDetail {
  const categories = (row.product_categories ?? [])
    .map((entry) => entry.categories)
    .filter((category): category is NonNullable<typeof category> =>
      Boolean(category),
    );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    status: row.status,
    product_images: sortProductImages(row.product_images ?? []),
    product_attributes: normalizeAttributes(row.product_attributes),
    categories,
    product_part_colors: (row.product_part_colors ?? []).map((entry) => ({
      part: entry.part,
      color_id: entry.color_id,
      colors: entry.colors,
    })),
  };
}

function mapCard(row: {
  id: string;
  name: string;
  slug: string;
  product_images: PublishedProductCard["product_images"] | null;
}): PublishedProductCard {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    product_images: sortProductImages(row.product_images ?? []),
  };
}

/** Public product detail by slug. Returns null when missing or not published. */
export async function getPublishedProductBySlug(
  slug: string,
): Promise<PublishedProductDetail | null> {
  "use cache";
  cacheTag(productCacheTag(slug));
  cacheLife("hours");

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await createPublicClient()
    .from("products")
    .select(DETAIL_SELECT)
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapDetail(data as DetailRow);
}

export async function getRelatedPublishedProducts(options: {
  excludeId: string;
  categoryIds: string[];
  limit?: number;
}): Promise<PublishedProductCard[]> {
  "use cache";
  cacheTag(`related-products-${options.excludeId}`);
  cacheLife("hours");

  const limit = Math.max(1, Math.min(12, options.limit ?? 4));
  const categoryIds = options.categoryIds.filter(Boolean);

  if (categoryIds.length === 0) {
    return [];
  }

  const { data: links, error: linksError } = await createPublicClient()
    .from("product_categories")
    .select("product_id")
    .in("category_id", categoryIds)
    .neq("product_id", options.excludeId);

  if (linksError) {
    throw linksError;
  }

  const relatedIds = [
    ...new Set((links ?? []).map((link) => link.product_id)),
  ].slice(0, limit * 3);

  if (relatedIds.length === 0) {
    return [];
  }

  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "published")
    .in("id", relatedIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapCard(
      row as {
        id: string;
        name: string;
        slug: string;
        product_images: PublishedProductCard["product_images"] | null;
      },
    ),
  );
}
