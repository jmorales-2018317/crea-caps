"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getCategories } from "@/services/Category";
import { SupabaseClient } from "@supabase/supabase-js";

export function useCategories(supabaseClient?: SupabaseClient) {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(supabaseClient),
  });
}
