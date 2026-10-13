import { createClient } from "@/lib/supabase/client";
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "@/types/categories";

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await createClient()
    .from("categories")
    .select("id, name, slug, description, is_active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCategory(
  input: CategoryInsert,
): Promise<Category> {
  const { data, error } = await createClient()
    .from("categories")
    .insert(input)
    .select("id, name, slug, description, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(
  id: string,
  input: CategoryUpdate,
): Promise<Category> {
  const { data, error } = await createClient()
    .from("categories")
    .update(input)
    .eq("id", id)
    .select("id, name, slug, description, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await createClient()
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
