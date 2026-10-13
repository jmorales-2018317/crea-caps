import { createClient } from "@/lib/supabase/server";
import type { StoreSettingsPublic } from "@/types/store-settings";

const STORE_SETTINGS_COLUMNS =
  "store_name, description, whatsapp_number, email, instagram_url, facebook_url" as const;

/** Public store profile used by storefront chrome (footer, etc.). */
export async function getStoreSettings(): Promise<StoreSettingsPublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_COLUMNS)
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
