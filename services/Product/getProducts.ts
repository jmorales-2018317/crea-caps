import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Product } from "./types"
import type { Category } from "@/services/Category"
import type { Discount } from "@/services/Discounts/types"
import type {
  ProductRow,
  ProductCategoryRow,
  ProductDiscountRow,
} from "@/lib/supabase/database.types"

/**
 * Obtiene todos los productos con sus categorías y descuentos desde Supabase.
 */
export async function getProducts(supabaseClient?: SupabaseClient): Promise<Product[]> {
  const supabase = supabaseClient ?? createBrowserClient()
  const [productsRes, productCategoriesRes, productDiscountsRes] = await Promise.all([
    supabase.from("products").select("id, name, price, images").order("created_at", { ascending: false }),
    supabase.from("product_categories").select("product_id, category_id"),
    supabase.from("product_discounts").select("product_id, discount_id"),
  ])

  if (productsRes.error) throw productsRes.error
  if (productCategoriesRes.error) throw productCategoriesRes.error
  if (productDiscountsRes.error) throw productDiscountsRes.error

  const productRows = (productsRes.data ?? []) as ProductRow[]
  const productCategories = (productCategoriesRes.data ?? []) as ProductCategoryRow[]
  const productDiscounts = (productDiscountsRes.data ?? []) as ProductDiscountRow[]

  const categoryIds = [...new Set(productCategories.map((pc) => pc.category_id))]
  const discountIds = [...new Set(productDiscounts.map((pd) => pd.discount_id))]

  const [categoriesRes, discountsRes] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("categories").select("id, name, value, icon").in("id", categoryIds)
      : { data: [] as Category[], error: null },
    discountIds.length > 0
      ? supabase.from("discounts").select("id, name, value, type, start_date, end_date").in("id", discountIds)
      : { data: [] as Discount[], error: null },
  ])

  if (categoriesRes.error) throw categoriesRes.error
  if (discountsRes.error) throw discountsRes.error

  const categoriesById = new Map((categoriesRes.data ?? []).map((c) => [c.id, c as Category]))
  const discountsById = new Map((discountsRes.data ?? []).map((d) => [d.id, d as Discount]))

  const categoriesByProductId = new Map<string, Category[]>()
  const discountsByProductId = new Map<string, Discount[]>()

  for (const pc of productCategories) {
    const cat = categoriesById.get(pc.category_id)
    if (cat) {
      const list = categoriesByProductId.get(pc.product_id) ?? []
      list.push(cat)
      categoriesByProductId.set(pc.product_id, list)
    }
  }

  for (const pd of productDiscounts) {
    const disc = discountsById.get(pd.discount_id)
    if (disc) {
      const list = discountsByProductId.get(pd.product_id) ?? []
      list.push(disc)
      discountsByProductId.set(pd.product_id, list)
    }
  }

  return productRows.map((row) => ({
    ...row,
    images: row.images ?? [],
    categories: categoriesByProductId.get(row.id) ?? [],
    discounts: discountsByProductId.get(row.id) ?? undefined,
  })) as Product[]
}
