"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Skeleton className="rounded-full size-12" />
      <div className="px-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-60" />
      </div>
    </div>
  )
}

