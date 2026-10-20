"use client";

import { useBookmarksHydrated } from "@/hooks/use-bookmarks-hydrated";
import { useBookmarksStore } from "@/hooks/use-bookmarks-store";
import { cn } from "cn";

type BookmarksCounterProps = {
  className?: string;
};

export function BookmarksCounter({ className }: BookmarksCounterProps) {
  const hasHydrated = useBookmarksHydrated();
  const count = useBookmarksStore((state) => state.productIds.length);

  if (!hasHydrated || count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none text-foreground",
        className,
      )}
      aria-label={`${count} productos guardados`}
    >
      {label}
    </span>
  );
}
