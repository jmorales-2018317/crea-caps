"use client"

import { useMemo, useState } from "react"
import GoBack from "@/components/go-back"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { ProductCard, ProductCardSkeleton } from "@/components/Product"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { FilterDrawer } from "@/components/Search/filter-drawer"
import { useSearchProducts } from "@/hooks/api/useSearchProducts"
import { useCategories } from "@/hooks/api/useCategories"
import type { SearchFilters } from "@/services/Search"
import { SortEnum } from "@/services/Search"
import { useSearchParams } from "next/navigation"

export function SearchContent() {
  const searchParams = useSearchParams()

  const categoryId = searchParams.get("categoryId") ?? null
  const priceMin = Number(searchParams.get("priceMin") || 0)
  const priceMax = Number(searchParams.get("priceMax") || 1000)
  const sort = searchParams.get("sort") ?? SortEnum.RECENT

  const defaultFilters = useMemo(
    () => ({
      categoryId,
      priceMin,
      priceMax,
      sort: sort as SearchFilters["sort"],
    }),
    [categoryId, priceMin, priceMax, sort]
  )

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)

  const debouncedQuery = useDebouncedValue(query, 300)
  const { data: categories = [] } = useCategories()
  const { data: products = [], isLoading, isError } = useSearchProducts(debouncedQuery, filters)

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="w-full py-5 px-4 space-y-4">
        <div className="relative flex items-center justify-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Búsqueda
          </h1>
          <GoBack />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-input/20 px-3 py-1">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar gorras, modelos, colores..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:border-0"
            />
          </div>
          <FilterDrawer
            initialFilters={filters}
            handleApply={setFilters}
            categories={categories}
          />
        </div>
      </section>

      <section className="px-4">
        <div className="mb-3 flex justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">
              {query.trim() ? `"${query.trim()}"` : "Todos los productos"}
            </h1>
            {
              !isLoading && (
                <h2 className="font-medium text-foreground">
                  {products.length} resultados
                </h2>
              )
            }
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Error al buscar. Intenta de nuevo.
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No hay resultados para tu búsqueda o filtros.
          </p>
        )}
      </section>
    </div>
  )
}
