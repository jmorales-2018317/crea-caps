import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "./types"

const SELECT_FIELDS = "id, name, email, phone, address, role, created_at"

export async function getProfileById(
  id: string,
  supabaseClient?: SupabaseClient,
): Promise<Profile | null> {
  const supabase = supabaseClient ?? createBrowserClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return profile
}

