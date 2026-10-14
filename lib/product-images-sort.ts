import type { ProductImage } from "@/types/products";

export function sortProductImages<
  T extends Pick<ProductImage, "sort_order" | "is_primary" | "created_at">,
>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}

export function sortListImages<
  T extends Pick<ProductImage, "sort_order" | "is_primary">,
>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    return a.sort_order - b.sort_order;
  });
}
