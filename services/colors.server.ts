import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { PaletteColor } from "@/types/colors";

const PALETTE_COLUMNS = "id, name, hex_code" as const;

/** Cache tag for the public personalization palette. */
export const ACTIVE_COLORS_CACHE_TAG = "active-colors";

/** Active store palette for public personalization. */
export async function getActiveColors(): Promise<PaletteColor[]> {
  "use cache";
  cacheTag(ACTIVE_COLORS_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("colors")
    .select(PALETTE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((color) => ({
    id: color.id,
    name: color.name,
    hex_code: color.hex_code.toUpperCase(),
  }));
}
