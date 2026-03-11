import type { Discount } from "@/services/Discounts"
import { DiscountTypeEnum } from "@/services/Discounts"

function toNumber(x: unknown): number {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

export function getDiscountedPrice(
  basePrice: number,
  discounts?: Discount[]
): number {
  const initial = toNumber(basePrice)
  if (!discounts || discounts.length === 0) {
    return basePrice
  }

  const discounted = discounts.reduce((acc, discount) => {
    const value = toNumber(discount.value)
    if (discount.type === DiscountTypeEnum.PERCENTAGE) {
      return acc * (1 - value / 100)
    }
    return acc - value
  }, initial)

  const result = Math.max(0, discounted)
  return Number.isFinite(result) ? result : basePrice
}

