"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProductById } from "@/services/Product";

export function useProductById(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}
