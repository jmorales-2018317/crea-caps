import type { Json, Tables, TablesUpdate } from "@/lib/supabase/database.types";
import type { StoreContact } from "@/lib/store-contacts";

export type { StoreContact } from "@/lib/store-contacts";

export type StoreSettings = Tables<"store_settings">;

export type StoreSettingsPublic = {
  store_name: string;
  description: string | null;
  logo_path: string | null;
  contacts: StoreContact[];
};

export type StoreSettingsUpdate = {
  store_name?: string;
  description?: string | null;
  logo_path?: string | null;
  contacts?: Json;
};

export type StoreSettingsRowUpdate = Pick<
  TablesUpdate<"store_settings">,
  "store_name" | "description" | "logo_path" | "contacts"
>;
