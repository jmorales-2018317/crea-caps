import { Suspense } from "react"
import { SearchContent } from "@/components/Search"
import { ProductCardSkeleton } from "@/components/Product"

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-5 px-4">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 mx-auto rounded bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
