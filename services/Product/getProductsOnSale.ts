import { supabase } from "@/lib/supabase/client"
import { getProductsByIds } from "./getProductsByIds"
import type { Product } from "./types"

export async function getProductsOnSale(): Promise<Product[]> {
  const now = new Date().toISOString()

  const { data: activeDiscounts, error: discountsError } = await supabase
    .from("discounts")
    .select("id")
    .lte("start_date", now)
    .gte("end_date", now)

  if (discountsError) throw discountsError
  const activeIds = (activeDiscounts ?? []).map((d) => d.id)
  if (activeIds.length === 0) return []

  const { data: productDiscounts, error: pdError } = await supabase
    .from("product_discounts")
    .select("product_id")
    .in("discount_id", activeIds)

  if (pdError) throw pdError
  const productIds = [...new Set((productDiscounts ?? []).map((r) => r.product_id))]
  if (productIds.length === 0) return []

  return getProductsByIds(productIds)
}
