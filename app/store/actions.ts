"use server";

import { updateTag } from "next/cache";
import { STORE_SETTINGS_CACHE_TAG } from "@/services/store-settings.server";

/** Bust the public store-settings cache after an admin save. */
export async function revalidateStoreSettingsCache() {
  updateTag(STORE_SETTINGS_CACHE_TAG);
}
