"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookmarksHydrated } from "@/hooks/use-bookmarks-hydrated";
import { useBookmarksStore } from "@/hooks/use-bookmarks-store";
import { getPublishedProductsByIds } from "@/services/products";

export const bookmarkedProductsQueryKey = ["products", "bookmarked"] as const;

export function bookmarkedProductsFilteredQueryKey(productIds: string[]) {
  return [...bookmarkedProductsQueryKey, productIds] as const;
}

export function useBookmarkedProducts() {
  const hasHydrated = useBookmarksHydrated();
  const productIds = useBookmarksStore((state) => state.productIds);
  const pruneMissingBookmarks = useBookmarksStore(
    (state) => state.pruneMissingBookmarks,
  );
  const lastPrunedKey = useRef<string | null>(null);

  const query = useQuery({
    queryKey: bookmarkedProductsFilteredQueryKey(productIds),
    queryFn: () => getPublishedProductsByIds(productIds),
    enabled: hasHydrated && productIds.length > 0,
  });

  useEffect(() => {
    if (!query.isSuccess || !query.data) return;

    const key = productIds.join("|");
    if (lastPrunedKey.current === key) return;

    const returnedIds = query.data.map((product) => product.id);
    if (returnedIds.length !== productIds.length) {
      pruneMissingBookmarks(returnedIds);
    }
    lastPrunedKey.current = key;
  }, [productIds, pruneMissingBookmarks, query.data, query.isSuccess]);

  return {
    ...query,
    productIds,
    hasHydrated,
    isEmpty: hasHydrated && productIds.length === 0,
  };
}
