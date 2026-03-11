"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";
import { getCategories } from "@/services/Category";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}
