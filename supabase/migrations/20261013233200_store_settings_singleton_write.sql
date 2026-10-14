-- store_settings is a singleton (id = 1). Admins may update the row but must not
-- insert a second configuration or delete the seeded one.
drop policy if exists "admin_insert" on public.store_settings;
drop policy if exists "admin_delete" on public.store_settings;
