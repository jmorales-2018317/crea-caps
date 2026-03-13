"use client"

import { Badge } from "@/components/ui/badge"

export function DiscountBadge() {
  return (
    <Badge
      variant="outline"
      className="absolute z-index-2 left-2 top-2 bg-background text-[10px] h-5"
    >
      Oferta
    </Badge>
  )
}
