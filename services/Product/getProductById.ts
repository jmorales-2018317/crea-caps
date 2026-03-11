import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Product } from "./types"
import type { Category } from "@/services/Category"
import type { Discount } from "@/services/Discounts/types"

export async function getProductById(
  id: string,
  supabaseClient?: SupabaseClient
): Promise<Product | null> {
  const supabase = supabaseClient ?? createBrowserClient()
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, description, price, images")
    .eq("id", id)
    .single()

  if (productError || !product) return null

  const [productCategoriesRes, productDiscountsRes] = await Promise.all([
    supabase.from("product_categories").select("category_id").eq("product_id", id),
    supabase.from("product_discounts").select("discount_id").eq("product_id", id),
  ])

  const categoryIds = (productCategoriesRes.data ?? []).map((r: { category_id: string }) => r.category_id)
  const discountIds = (productDiscountsRes.data ?? []).map((r: { discount_id: string }) => r.discount_id)

  const [categoriesRes, discountsRes] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("categories").select("*").in("id", categoryIds)
      : { data: [] as Category[], error: null },
    discountIds.length > 0
      ? supabase.from("discounts").select("*").in("id", discountIds)
      : { data: [] as Discount[], error: null },
  ])

  const categories = (categoriesRes.data ?? []) as Category[]
  const discounts = (discountsRes.data ?? []) as Discount[]

  return {
    ...product,
    images: product.images ?? [],
    categories,
    discounts: discounts.length > 0 ? discounts : undefined,
  } as Product
}
