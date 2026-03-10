"use client"

import { useState } from "react"
import GoBack from "@/components/go-back"
import { ProductCard } from "@/components/Product"
import { PLACEHOLDER_PRODUCTS } from "@/util/constants"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { FilterDrawer } from "@/components/Search/filter-drawer"
import { type SearchFilters } from "@/services/Search"

export function SearchContent() {
  const [filters, setFilters] = useState<SearchFilters | null>(null)

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
              className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:border-0"
            />
          </div>
          <FilterDrawer
            initialFilters={filters ?? undefined}
            handleApply={setFilters}
          />
        </div>
      </section>

      <section className="px-4">
        <div className="mb-3 flex justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">&quot;GORRAS&quot;</h1>
            <h2 className="font-medium text-foreground">127 resultados</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
