import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

export type ProductImage = Tables<"product_images">;
export type ProductAttributes = Tables<"product_attributes">;
export type ProductPartColor = Tables<"product_part_colors">;

export type ProductStatus = Product["status"];
export type VisorType = ProductAttributes["visor_type"];
export type ConstructionType = ProductAttributes["construction_type"];
export type StrapType = NonNullable<ProductAttributes["strap_type"]>;
export type ProductPart = ProductPartColor["part"];

export type AdminProductListItem = Product & {
  product_categories: Array<{
    category_id: string;
    categories: { id: string; name: string } | null;
  }>;
  product_images: Array<
    Pick<ProductImage, "id" | "storage_path" | "is_primary" | "sort_order">
  >;
};

export type AdminProductDetail = Product & {
  product_attributes: ProductAttributes | null;
  product_categories: Array<{ category_id: string }>;
  product_part_colors: Array<{
    part: ProductPart;
    color_id: string;
  }>;
  product_images: ProductImage[];
};

export type AdminProductsListParams = {
  search?: string;
  status?: ProductStatus | "all";
  page?: number;
  pageSize?: number;
};

export type AdminProductsListResult = {
  items: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type SaveAdminProductPayload = {
  id?: string | null;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: ProductStatus;
  is_featured: boolean;
  category_ids: string[];
  attributes: {
    visor_type: VisorType;
    construction_type: ConstructionType;
    has_strap: boolean;
    strap_type: StrapType | null;
    has_front_logo: boolean;
  };
  part_colors: Array<{
    part: ProductPart;
    color_id: string;
  }>;
};

export type PublishedProductImage = Pick<
  ProductImage,
  | "id"
  | "storage_path"
  | "alt_text"
  | "is_primary"
  | "sort_order"
  | "created_at"
>;

export type PublishedProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublishedProductPartColor = {
  part: ProductPart;
  color_id: string;
  colors: {
    id: string;
    name: string;
    hex_code: string;
  } | null;
};

export type PublishedProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: ProductStatus;
  product_images: PublishedProductImage[];
  product_attributes: Pick<
    ProductAttributes,
    | "visor_type"
    | "construction_type"
    | "has_strap"
    | "strap_type"
    | "has_front_logo"
  > | null;
  categories: PublishedProductCategory[];
  product_part_colors: PublishedProductPartColor[];
};

export type PublishedProductCardColor = {
  id: string;
  name: string;
  hex_code: string;
  slug: string;
};

export type PublishedProductCardAttributes = Pick<
  ProductAttributes,
  | "visor_type"
  | "construction_type"
  | "has_strap"
  | "strap_type"
  | "has_front_logo"
>;

export type PublishedProductCard = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  product_images: Array<
    Pick<
      ProductImage,
      "id" | "storage_path" | "alt_text" | "is_primary" | "sort_order" | "created_at"
    >
  >;
  categories?: PublishedProductCategory[];
  colors?: PublishedProductCardColor[];
  attributes?: PublishedProductCardAttributes | null;
};

export type PublishedProductsFilters = {
  categorySlug?: string;
};

export type CatalogSort =
  | "name_asc"
  | "name_desc"
  | "created_at_asc"
  | "created_at_desc";

export type CatalogSearchParams = {
  q: string;
  categories: string[];
  colors: string[];
  visor: VisorType[];
  construction: ConstructionType[];
  hasStrap: boolean | null;
  strap: StrapType[];
  hasFrontLogo: boolean | null;
  sort: CatalogSort;
  page: number;
  pageSize: number;
};

export type CatalogSearchResult = {
  items: PublishedProductCard[];
  total: number;
  page: number;
  pageSize: number;
};
