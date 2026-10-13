import type { Tables } from "@/lib/supabase/database.types";

export type StoreSettings = Tables<"store_settings">;

export type StoreSettingsPublic = Pick<
  StoreSettings,
  | "store_name"
  | "description"
  | "whatsapp_number"
  | "email"
  | "instagram_url"
  | "facebook_url"
>;
