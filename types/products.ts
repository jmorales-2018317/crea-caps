import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

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
};

export type AdminProductDetail = Product & {
  product_attributes: ProductAttributes | null;
  product_categories: Array<{ category_id: string }>;
  product_part_colors: Array<{
    part: ProductPart;
    color_id: string;
  }>;
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
