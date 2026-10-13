import { createClient } from "@/lib/supabase/client";
import type { Color, ColorInsert, ColorUpdate } from "@/types/colors";

export async function listColors(): Promise<Color[]> {
  const { data, error } = await createClient()
    .from("colors")
    .select("id, name, hex_code, is_active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createColor(input: ColorInsert): Promise<Color> {
  const { data, error } = await createClient()
    .from("colors")
    .insert(input)
    .select("id, name, hex_code, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateColor(
  id: string,
  input: ColorUpdate,
): Promise<Color> {
  const { data, error } = await createClient()
    .from("colors")
    .update(input)
    .eq("id", id)
    .select("id, name, hex_code, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteColor(id: string): Promise<void> {
  const { error } = await createClient().from("colors").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateColorsActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await createClient()
    .from("colors")
    .update({ is_active: isActive })
    .in("id", ids);

  if (error) {
    throw error;
  }
}

export async function deleteColors(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await createClient()
    .from("colors")
    .delete()
    .in("id", ids);

  if (error) {
    throw error;
  }
}
