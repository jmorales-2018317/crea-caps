"use client"

import { Badge } from "@/components/ui/badge"
import { Discount, DiscountTypeEnum } from "@/services/Discounts"

export function DiscountBadge({
  discounts,
}: {
  discounts?: Discount[]
}) {

  const discountText = discounts?.map((discount) => {
    return discount.type === DiscountTypeEnum.PERCENTAGE ? `${discount.value}%` : `Q${discount.value}`
  }).join(", ")
  return (
    <Badge
      variant="default"
      className="absolute z-index-2 left-2 top-2 bg-golden text-[10px] h-5 text-secondary-foreground"
    >
      -{discountText}
    </Badge>
  )
}
