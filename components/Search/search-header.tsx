"use client"

import { FilterDrawer } from "@/components/Search/filter-drawer"
import { useCategories } from "@/hooks/api/useCategories"
import type { SearchFilters } from "@/services/Search"
import { Skeleton } from "../ui/skeleton"

export function SearchHeader({
  query,
  filters,
  handleApplyFilters,
  productsCount,
  isLoading,
}: {
  query: string
  filters: SearchFilters
  handleApplyFilters: (filters: SearchFilters) => void
  productsCount: number
  isLoading: boolean
}) {

  const { data: categories = [] } = useCategories()

  const resultsMessage = productsCount > 0 ? `${productsCount} resultado${productsCount > 1 ? "s" : ""}` : "No hay resultados"

  const title = query.trim().length > 0 ? `Resultados para: "${query.trim()}"` : "Sugerencias";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <span className="text-lg font-semibold text-foreground">
            {title}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <span className="text-lg font-semibold text-foreground">
          {title}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {resultsMessage}
        </p>
        <FilterDrawer
          initialFilters={filters}
          handleApply={handleApplyFilters}
          categories={categories}
        />
      </div>
    </div>
  )
}
