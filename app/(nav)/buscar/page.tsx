import { Suspense } from "react"
import { SearchContent } from "@/components/Search"
import { ProductCardSkeleton } from "@/components/Product"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchPageFallback() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
