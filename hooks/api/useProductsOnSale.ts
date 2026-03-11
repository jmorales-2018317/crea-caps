"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProductsOnSale } from "@/services/Product";

export function useProductsOnSale() {
  return useQuery({
    queryKey: queryKeys.productsOnSale,
    queryFn: getProductsOnSale,
  });
}
