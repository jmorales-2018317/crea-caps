"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminProductDetailQueryKey,
  adminProductsQueryKey,
  publishedProductsQueryKey,
} from "@/hooks/use-products";
import {
  deleteProductImage,
  listProductImages,
  reorderProductImages,
  setPrimaryProductImage,
  uploadProductImage,
  uploadProductImages,
  type UploadProductImageProgress,
} from "@/services/product-images";

export function productImagesQueryKey(productId: string) {
  return ["products", "images", productId] as const;
}

async function invalidateProductImageQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  productId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: productImagesQueryKey(productId) }),
    queryClient.invalidateQueries({
      queryKey: adminProductDetailQueryKey(productId),
    }),
    queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
    queryClient.invalidateQueries({ queryKey: publishedProductsQueryKey }),
  ]);
}

export function useProductImages(productId: string | undefined) {
  return useQuery({
    queryKey: productId
      ? productImagesQueryKey(productId)
      : (["products", "images", "new"] as const),
    queryFn: () => listProductImages(productId!),
    enabled: Boolean(productId),
  });
}

export function useUploadProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProductImage({ productId, file }),
    onSuccess: async () => {
      await invalidateProductImageQueries(queryClient, productId);
    },
  });
}

export function useUploadProductImages(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: File[];
      onProgress?: (progress: UploadProductImageProgress) => void;
    }) => uploadProductImages(productId, files, onProgress),
    onSuccess: async () => {
      await invalidateProductImageQueries(queryClient, productId);
    },
  });
}

export function useSetPrimaryProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      setPrimaryProductImage(productId, imageId),
    onSuccess: async () => {
      await invalidateProductImageQueries(queryClient, productId);
    },
  });
}

export function useReorderProductImages(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      reorderProductImages(productId, orderedIds),
    onSuccess: async () => {
      await invalidateProductImageQueries(queryClient, productId);
    },
  });
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteProductImage(imageId),
    onSuccess: async () => {
      await invalidateProductImageQueries(queryClient, productId);
    },
  });
}
