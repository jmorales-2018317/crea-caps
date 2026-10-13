import { createClient } from "@/lib/supabase/client";

export type DashboardStats = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalCategories: number;
};

async function countRows(
  table: "products" | "categories",
  filters?: { column: string; value: string },
): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (filters) {
    query = query.eq(filters.column, filters.value);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalProducts, publishedProducts, draftProducts, totalCategories] =
    await Promise.all([
      countRows("products"),
      countRows("products", { column: "status", value: "published" }),
      countRows("products", { column: "status", value: "draft" }),
      countRows("categories"),
    ]);

  return {
    totalProducts,
    publishedProducts,
    draftProducts,
    totalCategories,
  };
}
