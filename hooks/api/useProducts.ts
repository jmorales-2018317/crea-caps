"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getProducts } from "@/services/Product";
import { SupabaseClient } from "@supabase/supabase-js";

export function useProducts(supabaseClient?: SupabaseClient) {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(supabaseClient),
  });
}
