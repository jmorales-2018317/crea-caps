import { createClient } from '@/lib/supabase/client';

export async function getPublishedProducts() {
  const { data, error } = await createClient().from('products')
    .select('id,name,slug,description,is_featured,created_at,product_images(id,storage_path,is_primary,sort_order),product_attributes(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
