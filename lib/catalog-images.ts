export const CATALOG_IMAGES_BUCKET = "catalog-images";

export const CATALOG_IMAGE_MAX_BYTES = 5_242_880;

export const CATALOG_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type CatalogImageMimeType = (typeof CATALOG_IMAGE_MIME_TYPES)[number];

const MIME_TO_EXT: Record<CatalogImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function isCatalogImageMimeType(
  value: string,
): value is CatalogImageMimeType {
  return (CATALOG_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export function validateImageFile(file: File): string | null {
  if (!isCatalogImageMimeType(file.type)) {
    return "Formato no permitido. Usa JPEG, PNG, WebP o AVIF.";
  }

  if (file.size <= 0) {
    return "El archivo está vacío.";
  }

  if (file.size > CATALOG_IMAGE_MAX_BYTES) {
    return "La imagen supera el tamaño máximo de 5 MB.";
  }

  return null;
}

export function buildProductImagePath(productId: string, file: File): string {
  const mime = isCatalogImageMimeType(file.type) ? file.type : "image/jpeg";
  const ext = MIME_TO_EXT[mime];
  const id = crypto.randomUUID();
  return `products/${productId}/${id}.${ext}`;
}

export function buildStoreLogoPath(file: File): string {
  const mime = isCatalogImageMimeType(file.type) ? file.type : "image/jpeg";
  const ext = MIME_TO_EXT[mime];
  const id = crypto.randomUUID();
  return `store/logo/${id}.${ext}`;
}

export function getCatalogImagePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    return "";
  }

  const encoded = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${base}/storage/v1/object/public/${CATALOG_IMAGES_BUCKET}/${encoded}`;
}
