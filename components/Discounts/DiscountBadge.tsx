"use client"

import { Badge } from "@/components/ui/badge"
import { Discount, DiscountTypeEnum } from "@/services/Discounts"
import { cn } from "@/lib/utils"

type DiscountBadgeProps = {
  discount: Discount
} & React.ComponentProps<typeof Badge>

export function DiscountBadge({
  discount, 
  ...props
}: DiscountBadgeProps) {
  const discountText = discount.type === DiscountTypeEnum.PERCENTAGE ? `${discount.value}%` : `Q${discount.value}`
  return (
    <Badge
      className="bg-golden text-[10px] h-5 text-secondary-foreground"
      {...props}
    >
      -{discountText}
    </Badge>
  )
}

type DiscountsBadgesListProps = {
  discounts: Discount[]
  className?: string
} & React.ComponentProps<typeof Badge>

export function DiscountsBadgesList({
  discounts,
  className,
  ...props
}: DiscountsBadgesListProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {discounts.map((discount) => (
        <DiscountBadge key={discount.id} discount={discount} {...props} />
      ))}
    </div>
  )
}
