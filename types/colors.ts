import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Color = Tables<"colors">;
export type ColorInsert = TablesInsert<"colors">;
export type ColorUpdate = TablesUpdate<"colors">;
