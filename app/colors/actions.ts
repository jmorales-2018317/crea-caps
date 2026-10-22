"use server";

import { updateTag } from "next/cache";
import { ACTIVE_COLORS_CACHE_TAG } from "@/services/colors.server";

/** Bust the public palette cache after an admin color mutation. */
export async function revalidateActiveColorsCache() {
  updateTag(ACTIVE_COLORS_CACHE_TAG);
}
