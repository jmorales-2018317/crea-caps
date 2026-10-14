import { createClient } from "@/lib/supabase/client";
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "@/types/categories";

const CATEGORY_COLUMNS =
  "id, name, code, description, icon, is_active" as const;

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await createClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** Active categories with icon for the public store showcase. */
export async function listActiveCategories(
  options?: { limit?: number },
): Promise<Category[]> {
  const limit = options?.limit ?? 8;

  const { data, error } = await createClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("is_active", true)
    .not("icon", "is", null)
    .neq("icon", "")
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** All active categories for public catalog filters. */
export async function listActiveCategoriesForFilters(): Promise<Category[]> {
  const { data, error } = await createClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function searchCategoriesByName(
  name = "",
  options?: { limit?: number },
): Promise<Category[]> {
  const limit = options?.limit ?? 40;
  const trimmed = name.trim();

  let query = createClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .order("name", { ascending: true })
    .limit(limit);

  if (trimmed.length > 0) {
    query = query.ilike("name", `%${trimmed}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCategoriesByIds(ids: string[]): Promise<Category[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await createClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .in("id", ids)
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
    .select(CATEGORY_COLUMNS)
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
    .select(CATEGORY_COLUMNS)
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

export async function updateCategoriesActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await createClient()
    .from("categories")
    .update({ is_active: isActive })
    .in("id", ids);

  if (error) {
    throw error;
  }
}

export async function deleteCategories(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const { error } = await createClient()
    .from("categories")
    .delete()
    .in("id", ids);

  if (error) {
    throw error;
  }
}
