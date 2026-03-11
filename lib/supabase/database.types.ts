export type DiscountTypeDb = "percentage" | "fixed"

export type CategoryRow = {
  id: string
  name: string
  value: string
  icon: string
  created_at: string
  updated_at: string
}

export type DiscountRow = {
  id: string
  name: string
  value: number
  type: DiscountTypeDb
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export type ProductRow = {
  id: string
  name: string
  price: number
  images: string[]
  created_at: string
  updated_at: string
}

export type ProductCategoryRow = {
  product_id: string
  category_id: string
}

export type ProductDiscountRow = {
  product_id: string
  discount_id: string
}

export type OrderRow = {
  id: string
  user_id: string
  status: string
  total: number
  created_at: string
}

export type OrderItemRow = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}
