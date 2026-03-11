"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { searchProducts } from "@/services/Search";
import type { SearchFilters } from "@/services/Search";

export function useSearchProducts(query: string, filters: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: () => searchProducts({ query, filters }),
  });
}
