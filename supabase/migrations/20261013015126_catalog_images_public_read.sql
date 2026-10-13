-- Public catalog imagery may be read by anyone.
-- Writes remain restricted to store admins (see initial migration).
create policy "catalog_images_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'catalog-images');
