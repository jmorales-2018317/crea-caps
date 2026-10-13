import {
  CATALOG_IMAGES_BUCKET,
  buildProductImagePath,
  validateImageFile,
} from "@/lib/catalog-images";
import { createClient } from "@/lib/supabase/client";
import type { ProductImage } from "@/types/products";

type SupabaseClient = ReturnType<typeof createClient>;

export type UploadProductImageProgress = {
  fileName: string;
  index: number;
  total: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}

async function removeStoragePaths(
  client: SupabaseClient,
  paths: string[],
): Promise<{ error: Error | null }> {
  const unique = [...new Set(paths.filter((path) => path.trim().length > 0))];
  if (unique.length === 0) {
    return { error: null };
  }

  const { error } = await client.storage
    .from(CATALOG_IMAGES_BUCKET)
    .remove(unique);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

export async function listProductImages(
  productId: string,
): Promise<ProductImage[]> {
  const { data, error } = await createClient()
    .from("product_images")
    .select(
      "id, product_id, storage_path, alt_text, is_primary, sort_order, created_at",
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortImages((data ?? []) as ProductImage[]);
}

export async function listProductImagePaths(
  productIds: string[],
): Promise<string[]> {
  if (productIds.length === 0) {
    return [];
  }

  const { data, error } = await createClient()
    .from("product_images")
    .select("storage_path")
    .in("product_id", productIds);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.storage_path);
}

export async function deleteStoragePaths(paths: string[]): Promise<void> {
  const { error } = await removeStoragePaths(createClient(), paths);
  if (error) {
    throw error;
  }
}

async function nextSortOrder(
  client: SupabaseClient,
  productId: string,
): Promise<number> {
  const { data, error } = await client
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return 0;
  }

  return data.sort_order + 1;
}

async function countImages(
  client: SupabaseClient,
  productId: string,
): Promise<number> {
  const { count, error } = await client
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function uploadProductImage(input: {
  productId: string;
  file: File;
  altText?: string | null;
}): Promise<ProductImage> {
  const validationError = validateImageFile(input.file);
  if (validationError) {
    throw new Error(validationError);
  }

  const client = createClient();
  const path = buildProductImagePath(input.productId, input.file);
  const existingCount = await countImages(client, input.productId);
  const sortOrder = await nextSortOrder(client, input.productId);
  const isPrimary = existingCount === 0;

  const { error: uploadError } = await client.storage
    .from(CATALOG_IMAGES_BUCKET)
    .upload(path, input.file, {
      contentType: input.file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error: insertError } = await client
    .from("product_images")
    .insert({
      product_id: input.productId,
      storage_path: path,
      alt_text: input.altText ?? null,
      is_primary: isPrimary,
      sort_order: sortOrder,
    })
    .select(
      "id, product_id, storage_path, alt_text, is_primary, sort_order, created_at",
    )
    .single();

  if (insertError) {
    await removeStoragePaths(client, [path]);
    throw insertError;
  }

  return data as ProductImage;
}

export type ProductImageDraftCommitInput = {
  productId: string;
  savedImages: ProductImage[];
  baselineImages: ProductImage[];
  removedImageIds: string[];
  pendingFiles: File[];
};

export type ProductImageDraftCommitResult = {
  hadChanges: boolean;
  uploadErrors: { fileName: string; error: string }[];
  storageWarning?: string;
};

function imagesDraftEquals(
  baseline: ProductImage[],
  current: ProductImage[],
): boolean {
  if (baseline.length !== current.length) {
    return false;
  }
  return baseline.every((image, index) => {
    const other = current[index];
    return (
      other !== undefined &&
      image.id === other.id &&
      image.is_primary === other.is_primary
    );
  });
}

export async function commitProductImageDraft(
  input: ProductImageDraftCommitInput,
): Promise<ProductImageDraftCommitResult> {
  const {
    productId,
    savedImages,
    baselineImages,
    removedImageIds,
    pendingFiles,
  } = input;

  const orderOrPrimaryChanged = !imagesDraftEquals(
    baselineImages,
    savedImages,
  );
  const hadChanges =
    removedImageIds.length > 0 ||
    pendingFiles.length > 0 ||
    orderOrPrimaryChanged;

  if (!hadChanges) {
    return { hadChanges: false, uploadErrors: [] };
  }

  let storageWarning: string | undefined;

  for (const imageId of removedImageIds) {
    const result = await deleteProductImage(imageId);
    if (result.storageWarning) {
      storageWarning = result.storageWarning;
    }
  }

  const uploadErrors: ProductImageDraftCommitResult["uploadErrors"] = [];
  let uploaded: ProductImage[] = [];

  if (pendingFiles.length > 0) {
    const result = await uploadProductImages(productId, pendingFiles);
    uploaded = result.uploaded;
    for (const entry of result.errors) {
      uploadErrors.push({
        fileName: entry.fileName,
        error: entry.error ?? "No se pudo subir la imagen.",
      });
    }
  }

  const finalIds = [
    ...savedImages.map((image) => image.id),
    ...uploaded.map((image) => image.id),
  ];

  if (finalIds.length > 0) {
    await reorderProductImages(productId, finalIds);
    const localPrimary = savedImages.find((image) => image.is_primary);
    if (localPrimary) {
      await setPrimaryProductImage(productId, localPrimary.id);
    } else if (uploaded[0]) {
      await setPrimaryProductImage(productId, uploaded[0].id);
    }
  }

  return { hadChanges: true, uploadErrors, storageWarning };
}

export async function uploadProductImages(
  productId: string,
  files: File[],
  onProgress?: (progress: UploadProductImageProgress) => void,
): Promise<{ uploaded: ProductImage[]; errors: UploadProductImageProgress[] }> {
  const uploaded: ProductImage[] = [];
  const errors: UploadProductImageProgress[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]!;
    onProgress?.({
      fileName: file.name,
      index,
      total: files.length,
      status: "uploading",
    });

    try {
      const image = await uploadProductImage({ productId, file });
      uploaded.push(image);
      onProgress?.({
        fileName: file.name,
        index,
        total: files.length,
        status: "done",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen.";
      const entry: UploadProductImageProgress = {
        fileName: file.name,
        index,
        total: files.length,
        status: "error",
        error: message,
      };
      errors.push(entry);
      onProgress?.(entry);
    }
  }

  return { uploaded, errors };
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  const client = createClient();

  const { error: clearError } = await client
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("is_primary", true);

  if (clearError) {
    throw clearError;
  }

  const { error: setError } = await client
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (setError) {
    throw setError;
  }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[],
): Promise<void> {
  const client = createClient();

  const updates = orderedIds.map((id, sortOrder) =>
    client
      .from("product_images")
      .update({ sort_order: sortOrder })
      .eq("id", id)
      .eq("product_id", productId),
  );

  const results = await Promise.all(updates);
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    throw firstError;
  }
}

export async function deleteProductImage(imageId: string): Promise<{
  storageWarning?: string;
}> {
  const client = createClient();

  const { data: image, error: fetchError } = await client
    .from("product_images")
    .select(
      "id, product_id, storage_path, alt_text, is_primary, sort_order, created_at",
    )
    .eq("id", imageId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const { count: refCount, error: countError } = await client
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("storage_path", image.storage_path);

  if (countError) {
    throw countError;
  }

  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    throw deleteError;
  }

  if (image.is_primary) {
    const { data: nextPrimary, error: nextError } = await client
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextError) {
      throw nextError;
    }

    if (nextPrimary) {
      const { error: promoteError } = await client
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", nextPrimary.id);

      if (promoteError) {
        throw promoteError;
      }
    }
  }

  const remainingRefs = (refCount ?? 1) - 1;
  if (remainingRefs > 0) {
    return {};
  }

  const { error: storageError } = await removeStoragePaths(client, [
    image.storage_path,
  ]);

  if (storageError) {
    return {
      storageWarning:
        "La imagen se eliminó del catálogo, pero no se pudo borrar el archivo del almacenamiento.",
    };
  }

  return {};
}
