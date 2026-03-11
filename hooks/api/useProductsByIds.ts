"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProductsByIds } from "@/services/Product";

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.productsByIds(ids),
    queryFn: () => getProductsByIds(ids),
    enabled: ids.length > 0,
  });
}
