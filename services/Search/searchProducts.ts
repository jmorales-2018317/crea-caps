import { supabase } from "@/lib/supabase/client"
import { getProductsByIds } from "@/services/Product"
import type { Product } from "@/services/Product"
import type { SearchFilters } from "./types"
import { SortEnum } from "./types"

export type SearchProductsParams = {
  query?: string
  filters: SearchFilters
}

/**
 * Busca productos con filtros (categoría, rango de precio) y orden (reciente / popular).
 * Usa la RPC search_products en Supabase y luego hidrata con getProductsByIds.
 */
export async function searchProducts({
  query = "",
  filters,
}: SearchProductsParams): Promise<Product[]> {
  const { data: rows, error } = await supabase.rpc("search_products", {
    p_query: query.trim() || null,
    p_category_id: filters.categoryId ?? null,
    p_price_min: filters.priceMin ?? null,
    p_price_max: filters.priceMax ?? null,
    p_sort: filters.sort === SortEnum.POPULAR ? "popular" : "recent",
  })

  if (error) throw error
  const ids = (rows ?? []).map((r: { product_id: string }) => r.product_id)
  if (ids.length === 0) return []

  const products = await getProductsByIds(ids)
  const byId = new Map(products.map((p) => [p.id, p]))
  return ids.map((id: string) => byId.get(id)).filter((p: Product): p is Product => p != null)
}
