import { cacheLife, cacheTag } from "next/cache";
import { parseStoreContacts } from "@/lib/store-contacts";
import { createPublicClient } from "@/lib/supabase/public";
import type { StoreSettingsPublic } from "@/types/store-settings";

const STORE_SETTINGS_ID = 1;

/** Cache tag for public storefront settings (footer, metadata, etc.). */
export const STORE_SETTINGS_CACHE_TAG = "store-settings";

const STORE_SETTINGS_COLUMNS =
  "store_name, description, logo_path, contacts" as const;

/** Public store profile used by storefront chrome (header, footer, metadata). */
export async function getStoreSettings(): Promise<StoreSettingsPublic | null> {
  "use cache";
  cacheTag(STORE_SETTINGS_CACHE_TAG);
  cacheLife("hours");

  const client = createPublicClient();
  const { data, error } = await client
    .from("store_settings")
    .select(STORE_SETTINGS_COLUMNS)
    .eq("id", STORE_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    store_name: data.store_name,
    description: data.description,
    logo_path: data.logo_path,
    contacts: parseStoreContacts(data.contacts),
  };
}
