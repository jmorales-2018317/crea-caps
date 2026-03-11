"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProductsOnSale } from "@/services/Product";
import { SupabaseClient } from "@supabase/supabase-js";

export function useProductsOnSale(supabaseClient?: SupabaseClient) {
  return useQuery({
    queryKey: queryKeys.productsOnSale,
    queryFn: () => getProductsOnSale(supabaseClient),
  });
}
