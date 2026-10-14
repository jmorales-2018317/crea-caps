"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { dashboardStatsQueryKey } from "@/hooks/use-dashboard-stats";
import {
  createCategory,
  deleteCategories,
  deleteCategory,
  getCategoriesByIds,
  listActiveCategories,
  listCategories,
  searchCategoriesByName,
  updateCategoriesActive,
  updateCategory,
} from "@/services/categories";
import {
  activeToggleToastMessage,
  isOnlyActiveToggle,
  toastMutationError,
  toastSuccess,
} from "@/lib/toast";
import type { CategoryInsert, CategoryUpdate } from "@/types/categories";

export const categoriesQueryKey = ["categories"] as const;
export const storeCategoriesQueryKey = ["categories", "store"] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: listCategories,
  });
}

export function useStoreCategories(limit = 8) {
  return useQuery({
    queryKey: [...storeCategoriesQueryKey, limit] as const,
    queryFn: () => listActiveCategories({ limit }),
  });
}

export function useSearchCategories(name: string) {
  const trimmed = name.trim();

  return useQuery({
    queryKey: [...categoriesQueryKey, "search", trimmed] as const,
    queryFn: () => searchCategoriesByName(trimmed),
    placeholderData: keepPreviousData,
  });
}

export function useCategoriesByIds(ids: string[]) {
  const sortedIds = [...ids].sort();

  return useQuery({
    queryKey: [...categoriesQueryKey, "by-ids", sortedIds] as const,
    queryFn: () => getCategoriesByIds(ids),
    enabled: ids.length > 0,
  });
}

function useInvalidateCategories() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
      queryClient.invalidateQueries({ queryKey: storeCategoriesQueryKey }),
      queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
    ]);
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (input: CategoryInsert) => createCategory(input),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Categoría creada");
    },
    onError: (error) => {
      toastMutationError(error, "categories");
    },
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryUpdate }) =>
      updateCategory(id, input),
    onSuccess: async (_data, variables) => {
      await invalidate();
      if (isOnlyActiveToggle(variables.input)) {
        toastSuccess(
          activeToggleToastMessage("categoría", variables.input.is_active),
        );
        return;
      }
      toastSuccess("Categoría actualizada");
    },
    onError: (error) => {
      toastMutationError(error, "categories");
    },
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Categoría eliminada");
    },
    onError: (error) => {
      toastMutationError(error, "categories");
    },
  });
}

export function useUpdateCategoriesActive() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      updateCategoriesActive(ids, isActive),
    onSuccess: async (_data, variables) => {
      await invalidate();
      toastSuccess(
        activeToggleToastMessage("categorías", variables.isActive),
      );
    },
    onError: (error) => {
      toastMutationError(error, "categories");
    },
  });
}

export function useDeleteCategories() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: (ids: string[]) => deleteCategories(ids),
    onSuccess: async (_data, variables) => {
      await invalidate();
      toastSuccess(
        variables.length > 1 ? "Categorías eliminadas" : "Categoría eliminada",
      );
    },
    onError: (error) => {
      toastMutationError(error, "categories");
    },
  });
}
