import { supabase } from "@/lib/supabase/client"
import type { Category } from "./types"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, value, icon")
    .order("name")

  if (error) throw error
  return (data ?? []) as Category[]
}
