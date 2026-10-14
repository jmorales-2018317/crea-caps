import { normalizeCatalogSearchParams } from "@/lib/catalog-search-params";
import { toPriceNumber } from "@/lib/format-currency";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import type {
  CatalogSearchParams,
  CatalogSearchResult,
  ConstructionType,
  PublishedProductCard,
  PublishedProductCardAttributes,
  PublishedProductCardColor,
  PublishedProductCategory,
  PublishedProductImage,
  StrapType,
  VisorType,
} from "@/types/products";

type RpcRow = {
  id: string;
  name: string;
  code: string;
  price: number | string;
  created_at: string;
  categories: Json;
  colors: Json;
  attributes: Json;
  product_images: Json;
  total_count: number;
};

function asArray<T>(value: Json): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapCategories(value: Json): PublishedProductCategory[] {
  return asArray<Record<string, unknown>>(value)
    .map((row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.name !== "string" ||
        typeof row.code !== "string"
      ) {
        return null;
      }
      return {
        id: row.id,
        name: row.name,
        code: row.code,
      };
    })
    .filter((row): row is PublishedProductCategory => row !== null);
}

function mapColors(value: Json): PublishedProductCardColor[] {
  return asArray<Record<string, unknown>>(value)
    .map((row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.name !== "string" ||
        typeof row.hex_code !== "string"
      ) {
        return null;
      }
      return {
        id: row.id,
        name: row.name,
        hex_code: row.hex_code,
        slug: typeof row.slug === "string" ? row.slug : "",
      };
    })
    .filter((row): row is PublishedProductCardColor => row !== null);
}

function mapAttributes(value: Json): PublishedProductCardAttributes | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.visor_type !== "string" ||
    typeof row.construction_type !== "string" ||
    typeof row.has_strap !== "boolean" ||
    typeof row.has_front_logo !== "boolean"
  ) {
    return null;
  }

  return {
    visor_type: row.visor_type as VisorType,
    construction_type: row.construction_type as ConstructionType,
    has_strap: row.has_strap,
    strap_type:
      typeof row.strap_type === "string"
        ? (row.strap_type as StrapType)
        : null,
    has_front_logo: row.has_front_logo,
  };
}

function mapImages(value: Json): PublishedProductImage[] {
  return asArray<Record<string, unknown>>(value)
    .map((row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.storage_path !== "string" ||
        typeof row.is_primary !== "boolean" ||
        typeof row.sort_order !== "number" ||
        typeof row.created_at !== "string"
      ) {
        return null;
      }
      return {
        id: row.id,
        storage_path: row.storage_path,
        alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
        is_primary: row.is_primary,
        sort_order: row.sort_order,
        created_at: row.created_at,
      };
    })
    .filter((row): row is PublishedProductImage => row !== null);
}

function mapCard(row: RpcRow): PublishedProductCard {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    price: toPriceNumber(row.price),
    created_at: row.created_at,
    categories: mapCategories(row.categories),
    colors: mapColors(row.colors),
    attributes: mapAttributes(row.attributes),
    product_images: mapImages(row.product_images),
  };
}

export async function searchPublishedProducts(
  params: CatalogSearchParams,
): Promise<CatalogSearchResult> {
  const normalized = normalizeCatalogSearchParams(params);

  const { data, error } = await createClient().rpc("search_published_products", {
    p_query: normalized.q || null,
    p_category_codes:
      normalized.categories.length > 0 ? normalized.categories : null,
    p_color_slugs: normalized.colors.length > 0 ? normalized.colors : null,
    p_visor_types: normalized.visor.length > 0 ? normalized.visor : null,
    p_construction_types:
      normalized.construction.length > 0 ? normalized.construction : null,
    p_has_strap: normalized.hasStrap,
    p_strap_types: normalized.strap.length > 0 ? normalized.strap : null,
    p_has_front_logo: normalized.hasFrontLogo,
    p_sort: normalized.sort,
    p_page: normalized.page,
    p_page_size: normalized.pageSize,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RpcRow[];
  const total = rows[0]?.total_count ?? 0;

  return {
    items: rows.map(mapCard),
    total: Number(total),
    page: normalized.page,
    pageSize: normalized.pageSize,
  };
}
