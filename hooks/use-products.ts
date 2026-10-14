"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { revalidatePublishedProductCaches } from "@/app/products/actions";
import { dashboardStatsQueryKey } from "@/hooks/use-dashboard-stats";
import {
  createProduct,
  deleteProduct,
  deleteProducts,
  getAdminProduct,
  getPublishedProducts,
  listAdminProducts,
  updateProduct,
  updateProductFeatured,
  updateProductStatus,
  updateProductsStatus,
} from "@/services/products";
import type {
  AdminProductsListParams,
  ProductStatus,
  PublishedProductsFilters,
  SaveAdminProductPayload,
} from "@/types/products";

export const publishedProductsQueryKey = ["products", "published"] as const;
export const adminProductsQueryKey = ["products", "admin"] as const;

export function publishedProductsFilteredQueryKey(
  filters: PublishedProductsFilters = {},
) {
  return [
    ...publishedProductsQueryKey,
    { categorySlug: filters.categorySlug ?? null },
  ] as const;
}

export function adminProductDetailQueryKey(id: string) {
  return ["products", "admin", "detail", id] as const;
}

export function useProducts(filters: PublishedProductsFilters = {}) {
  return useQuery({
    queryKey: publishedProductsFilteredQueryKey(filters),
    queryFn: () => getPublishedProducts(filters),
  });
}

export function useAdminProducts(params: AdminProductsListParams) {
  return useQuery({
    queryKey: [...adminProductsQueryKey, params] as const,
    queryFn: () => listAdminProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: id
      ? adminProductDetailQueryKey(id)
      : (["products", "admin", "detail", "new"] as const),
    queryFn: () => getAdminProduct(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateAdminProducts() {
  const queryClient = useQueryClient();

  return async (options?: { productId?: string; slug?: string }) => {
    const tasks = [
      queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
      queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      queryClient.invalidateQueries({ queryKey: publishedProductsQueryKey }),
      revalidatePublishedProductCaches(options?.slug),
    ];

    if (options?.productId) {
      tasks.push(
        queryClient.invalidateQueries({
          queryKey: adminProductDetailQueryKey(options.productId),
        }),
      );
    }

    await Promise.all(tasks);
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: (payload: SaveAdminProductPayload) => createProduct(payload),
    onSuccess: async (id, payload) => {
      await invalidate({ productId: id, slug: payload.slug });
    },
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SaveAdminProductPayload;
    }) => updateProduct(id, payload),
    onSuccess: async (_data, variables) => {
      await invalidate({
        productId: variables.id,
        slug: variables.payload.slug,
      });
    },
  });
}

export function useUpdateProductStatus() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: ({
      id,
      status,
      slug,
    }: {
      id: string;
      status: ProductStatus;
      slug?: string;
    }) => updateProductStatus(id, status),
    onSuccess: async (_data, variables) => {
      await invalidate({ productId: variables.id, slug: variables.slug });
    },
  });
}

export function useUpdateProductFeatured() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: ({
      id,
      isFeatured,
      slug,
    }: {
      id: string;
      isFeatured: boolean;
      slug?: string;
    }) => updateProductFeatured(id, isFeatured),
    onSuccess: async (_data, variables) => {
      await invalidate({ productId: variables.id, slug: variables.slug });
    },
  });
}

export function useUpdateProductsStatus() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ProductStatus }) =>
      updateProductsStatus(ids, status),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useDeleteProducts() {
  const invalidate = useInvalidateAdminProducts();

  return useMutation({
    mutationFn: (ids: string[]) => deleteProducts(ids),
    onSuccess: async () => {
      await invalidate();
    },
  });
}
