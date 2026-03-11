"use client"

import { createElement, useMemo } from "react"
import Link from "next/link"
import { HelpCircle } from "lucide-react"

import { getCategoryIcon } from "@/util"
import { cn } from "@/lib/utils"
import type { Category } from "@/services/Category"

type CategoryItemProps = {
  category: Category
}

export function CategoryItem({ category }: CategoryItemProps) {
  const iconElement = useMemo(() => {
    const IconComponent = getCategoryIcon(category.icon) ?? HelpCircle
    return createElement(IconComponent, { className: "size-6" })
  }, [category.icon])

  const href = `/buscar?categoryId=${category.id}`

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2"
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full border border-border bg-card text-black",
          "transition-colors hover:bg-black/10"
        )}
      >
        {iconElement}
      </span>
      <span className="text-center text-xs font-medium text-foreground">
        {category.name}
      </span>
    </Link>
  )
}

