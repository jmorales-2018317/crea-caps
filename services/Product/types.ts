import type { Category } from "../Category"
import type { Discount } from "../Discounts/types"

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  images: string[]
  created_at?: string
  updated_at?: string
  categories: Category[]
  discounts?: Discount[]
}