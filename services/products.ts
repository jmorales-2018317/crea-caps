import { createClient } from "@/lib/supabase/client";
import {
  deleteStoragePaths,
  listProductImagePaths,
} from "@/services/product-images";
import type {
  AdminProductDetail,
  AdminProductListItem,
  AdminProductsListParams,
  AdminProductsListResult,
  ProductImage,
  ProductStatus,
  SaveAdminProductPayload,
} from "@/types/products";

const LIST_SELECT = `
  id,
  name,
  slug,
  sku,
  description,
  is_featured,
  status,
  created_at,
  updated_at,
  product_categories (
    category_id,
    categories ( id, name )
  ),
  product_images (
    id,
    storage_path,
    is_primary,
    sort_order
  )
`;

const DETAIL_SELECT = `
  id,
  name,
  slug,
  sku,
  description,
  is_featured,
  status,
  created_at,
  updated_at,
  product_attributes (
    product_id,
    visor_type,
    construction_type,
    has_strap,
    strap_type,
    has_front_logo
  ),
  product_categories ( category_id ),
  product_part_colors ( part, color_id ),
  product_images (
    id,
    product_id,
    storage_path,
    alt_text,
    is_primary,
    sort_order,
    created_at
  )
`;

function sortProductImages<T extends Pick<ProductImage, "sort_order" | "is_primary" | "created_at">>(
  images: T[],
): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}

function sortListImages<
  T extends Pick<ProductImage, "sort_order" | "is_primary">,
>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    return a.sort_order - b.sort_order;
  });
}

type SupabaseClient = ReturnType<typeof createClient>;

function productFields(payload: SaveAdminProductPayload) {
  return {
    name: payload.name,
    slug: payload.slug,
    sku: payload.sku,
    description: payload.description,
    status: payload.status,
    is_featured: payload.is_featured,
  };
}

async function syncProductRelations(
  client: SupabaseClient,
  productId: string,
  payload: SaveAdminProductPayload,
) {
  const { error: attributesError } = await client
    .from("product_attributes")
    .upsert(
      {
        product_id: productId,
        visor_type: payload.attributes.visor_type,
        construction_type: payload.attributes.construction_type,
        has_strap: payload.attributes.has_strap,
        strap_type: payload.attributes.strap_type,
        has_front_logo: payload.attributes.has_front_logo,
      },
      { onConflict: "product_id" },
    );

  if (attributesError) {
    throw attributesError;
  }

  const { error: deleteCategoriesError } = await client
    .from("product_categories")
    .delete()
    .eq("product_id", productId);

  if (deleteCategoriesError) {
    throw deleteCategoriesError;
  }

  if (payload.category_ids.length > 0) {
    const { error: insertCategoriesError } = await client
      .from("product_categories")
      .insert(
        payload.category_ids.map((category_id) => ({
          product_id: productId,
          category_id,
        })),
      );

    if (insertCategoriesError) {
      throw insertCategoriesError;
    }
  }

  const { error: deleteColorsError } = await client
    .from("product_part_colors")
    .delete()
    .eq("product_id", productId);

  if (deleteColorsError) {
    throw deleteColorsError;
  }

  if (payload.part_colors.length > 0) {
    const { error: insertColorsError } = await client
      .from("product_part_colors")
      .insert(
        payload.part_colors.map((row) => ({
          product_id: productId,
          part: row.part,
          color_id: row.color_id,
        })),
      );

    if (insertColorsError) {
      throw insertColorsError;
    }
  }
}

export async function getPublishedProducts() {
  const { data, error } = await createClient()
    .from("products")
    .select(
      "id,name,slug,description,is_featured,created_at,product_images(id,storage_path,alt_text,is_primary,sort_order,created_at),product_attributes(*)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((product) => ({
    ...product,
    product_images: sortProductImages(product.product_images ?? []),
  }));
}

export async function listAdminProducts(
  params: AdminProductsListParams = {},
): Promise<AdminProductsListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "all";

  let query = createClient()
    .from("products")
    .select(LIST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search.length > 0) {
    const safe = search.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
    if (safe.length > 0) {
      const pattern = `%${safe}%`;
      query = query.or(
        `name.ilike.${pattern},sku.ilike.${pattern},slug.ilike.${pattern}`,
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const items = ((data ?? []) as AdminProductListItem[]).map((item) => ({
    ...item,
    product_images: sortListImages(item.product_images ?? []),
  }));

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminProduct(
  id: string,
): Promise<AdminProductDetail> {
  const { data, error } = await createClient()
    .from("products")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const row = data as AdminProductDetail & {
    product_attributes?:
      | AdminProductDetail["product_attributes"]
      | AdminProductDetail["product_attributes"][];
  };

  const attributes = Array.isArray(row.product_attributes)
    ? (row.product_attributes[0] ?? null)
    : (row.product_attributes ?? null);

  return {
    ...row,
    product_attributes: attributes,
    product_categories: row.product_categories ?? [],
    product_part_colors: row.product_part_colors ?? [],
    product_images: sortProductImages(row.product_images ?? []),
  };
}

export async function createProduct(
  payload: SaveAdminProductPayload,
): Promise<string> {
  const client = createClient();

  const { data, error } = await client
    .from("products")
    .insert(productFields(payload))
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  try {
    await syncProductRelations(client, data.id, payload);
  } catch (relationError) {
    await client.from("products").delete().eq("id", data.id);
    throw relationError;
  }

  return data.id;
}

export async function updateProduct(
  id: string,
  payload: SaveAdminProductPayload,
): Promise<string> {
  const client = createClient();

  const { error } = await client
    .from("products")
    .update(productFields(payload))
    .eq("id", id);

  if (error) {
    throw error;
  }

  await syncProductRelations(client, id, payload);
  return id;
}

export async function updateProductStatus(
  id: string,
  status: ProductStatus,
): Promise<void> {
  const { error } = await createClient()
    .from("products")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateProductsStatus(
  ids: string[],
  status: ProductStatus,
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await createClient()
    .from("products")
    .update({ status })
    .in("id", ids);

  if (error) {
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const paths = await listProductImagePaths([id]);

  const { error } = await createClient()
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  if (paths.length > 0) {
    try {
      await deleteStoragePaths(paths);
    } catch {
      // Rows already removed; Storage cleanup is best-effort.
    }
  }
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const paths = await listProductImagePaths(ids);

  const { error } = await createClient()
    .from("products")
    .delete()
    .in("id", ids);

  if (error) {
    throw error;
  }

  if (paths.length > 0) {
    try {
      await deleteStoragePaths(paths);
    } catch {
      // Rows already removed; Storage cleanup is best-effort.
    }
  }
}
