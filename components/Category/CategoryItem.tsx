"use client"

import Link from "next/link"
import { HelpCircle } from "lucide-react"

import { getCategoryIcon } from "@/util"
import { cn } from "@/lib/utils"
import type { Category } from "@/services/Category"

type CategoryItemProps = {
  category: Category
}

export function CategoryItem({ category }: CategoryItemProps) {
  const { label, href, icon: iconName } = category
  const Icon = getCategoryIcon(iconName) ?? HelpCircle

  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-2"
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full border border-border bg-card text-primary",
          "transition-colors hover:bg-primary/10"
        )}
      >
        <Icon className="size-6" />
      </span>
      <span className="text-center text-xs font-medium text-foreground">
        {label}
      </span>
    </Link>
  )
}

