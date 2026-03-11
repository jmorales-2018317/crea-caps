import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Category } from "./types"

export async function getCategories(supabaseClient?: SupabaseClient): Promise<Category[]> {
  const supabase = supabaseClient ?? createBrowserClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, value, icon")
    .order("name")

  if (error) throw error
  return (data ?? []) as Category[]
}
