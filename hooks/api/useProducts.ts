"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProducts } from "@/services/Product";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  });
}
