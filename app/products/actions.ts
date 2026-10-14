"use server";

import { updateTag } from "next/cache";
import {
  FEATURED_PRODUCTS_CACHE_TAG,
  productCacheTag,
} from "@/services/products.server";

/** Bust public product caches after an admin catalog mutation. */
export async function revalidatePublishedProductCaches(slug?: string) {
  updateTag(FEATURED_PRODUCTS_CACHE_TAG);

  const normalizedSlug = slug?.trim();
  if (normalizedSlug) {
    updateTag(productCacheTag(normalizedSlug));
  }
}
