export type DiscountType = "percentage" | "fixed"

/** Coincide con la tabla `discounts` en Supabase */
export type Discount = {
  id: string
  name: string
  value: number
  type: DiscountType
  start_date: string
  end_date: string
  created_at?: string
  updated_at?: string
}

/** Enum para usar en código (ej. discount.type === DiscountTypeEnum.PERCENTAGE) */
export const DiscountTypeEnum = {
  PERCENTAGE: "percentage" as const,
  FIXED: "fixed" as const,
}