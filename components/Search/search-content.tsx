"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { ProductCard, ProductCardSkeleton } from "@/components/Product"
import { useSearchProducts } from "@/hooks/api/useSearchProducts"
import type { SearchFilters } from "@/services/Search"
import { SortEnum } from "@/services/Search"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchHeader } from "./search-header"

export function SearchContent() {
  const searchParams = useSearchParams()

  const query = searchParams.get("query") ?? ""

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

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)

  const router = useRouter()
  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    setFilters(defaultFilters)
  }, [defaultFilters])

  const { data: products = [], isLoading, isError } = useSearchProducts(debouncedQuery, filters)

  const handleApplyFilters = useCallback(
    (nextFilters: SearchFilters) => {
      setFilters(nextFilters)

      const params = new URLSearchParams()
      params.set("query", query)
      if (nextFilters.categoryId) params.set("categoryId", nextFilters.categoryId)
      params.set("priceMin", String(nextFilters.priceMin))
      params.set("priceMax", String(nextFilters.priceMax))
      params.set("sort", nextFilters.sort)

      router.replace(`/buscar?${params.toString()}`)
    },
    [query, router],
  )

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <SearchHeader
          query={query}
          filters={filters}
          handleApplyFilters={handleApplyFilters}
          productsCount={products.length}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="py-12 text-center text-sm text-destructive">
          Error al buscar. Intenta de nuevo.
        </p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <SearchHeader
          query={query}
          filters={filters}
          handleApplyFilters={handleApplyFilters}
          productsCount={products.length}
          isLoading={isLoading}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay resultados para tu búsqueda o filtros.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <SearchHeader
        query={query}
        filters={filters}
        handleApplyFilters={handleApplyFilters}
        productsCount={products.length}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
