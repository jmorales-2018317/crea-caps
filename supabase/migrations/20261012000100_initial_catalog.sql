-- Caps Store MVP: pure catalog, no quotes or orders.
create extension if not exists pgcrypto;

create or replace function public.is_store_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
         and auth.uid() is not null;
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create table public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(btrim(name)) between 1 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 sku text unique,
 description text,
 is_featured boolean not null default false,
 status text not null default 'draft' check (status in ('draft','published','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index products_status_created_idx on public.products(status, created_at desc);
create index products_featured_idx on public.products(is_featured) where status='published';
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(btrim(name)) > 0),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 description text,
 is_active boolean not null default true
);
create table public.product_categories (
 product_id uuid not null references public.products(id) on delete cascade,
 category_id uuid not null references public.categories(id) on delete restrict,
 primary key(product_id, category_id)
);
create index product_categories_category_idx on public.product_categories(category_id);

create table public.colors (
 id uuid primary key default gen_random_uuid(),
 name text not null unique check (length(btrim(name)) > 0),
 hex_code text not null check (hex_code ~ '^#[0-9A-Fa-f]{6}$'),
 is_active boolean not null default true
);
create table public.product_part_colors (
 product_id uuid not null references public.products(id) on delete cascade,
 part text not null check (part in ('all','crown','front_panel','side_panels','back_panels','visor','mesh','strap','button')),
 color_id uuid not null references public.colors(id) on delete restrict,
 primary key (product_id, part)
);
create index product_part_colors_color_idx on public.product_part_colors(color_id);

create table public.product_attributes (
 product_id uuid primary key references public.products(id) on delete cascade,
 visor_type text not null check (visor_type in ('curved','flat','other')),
 construction_type text not null check (construction_type in ('mesh','closed','mixed')),
 has_strap boolean not null default true,
 strap_type text check (strap_type in ('snapback','velcro','buckle','fabric','other')),
 has_front_logo boolean not null default false,
 constraint strap_coherence check ((has_strap and strap_type is not null) or (not has_strap and strap_type is null))
);
create index product_attributes_filter_idx on public.product_attributes(construction_type, visor_type, strap_type);

create table public.product_images (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 storage_path text not null unique check (length(btrim(storage_path)) > 0),
 alt_text text,
 is_primary boolean not null default false,
 sort_order integer not null default 0 check (sort_order >= 0),
 created_at timestamptz not null default now()
);
create index product_images_product_sort_idx on public.product_images(product_id,sort_order);
create unique index one_primary_image_per_product on public.product_images(product_id) where is_primary;

create table public.store_settings (
 id integer primary key default 1 check (id=1),
 store_name text not null default 'Caps Store',
 description text,
 logo_path text,
 whatsapp_number text,
 email text,
 instagram_url text,
 facebook_url text,
 updated_at timestamptz not null default now()
);
create trigger store_settings_touch before update on public.store_settings for each row execute function public.touch_updated_at();
insert into public.store_settings(id,store_name) values(1,'Caps Store');

-- Ensure that all catalog changes originate from an authenticated administrator.
do $$ declare t text; begin
 foreach t in array array['products','categories','product_categories','colors','product_part_colors','product_attributes','product_images','store_settings'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy "admin_insert" on public.%I for insert to authenticated with check ((select public.is_store_admin()))',t);
  execute format('create policy "admin_update" on public.%I for update to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()))',t);
  execute format('create policy "admin_delete" on public.%I for delete to authenticated using ((select public.is_store_admin()))',t);
 end loop;
end $$;

create policy "products_read" on public.products for select to anon, authenticated
using (status='published' or (select public.is_store_admin()));
create policy "categories_read" on public.categories for select to anon,authenticated
using (is_active or (select public.is_store_admin()));
create policy "colors_read" on public.colors for select to anon,authenticated
using (is_active or (select public.is_store_admin()));
create policy "product_categories_read" on public.product_categories for select to anon,authenticated
using ((select public.is_store_admin()) or (exists (select 1 from public.products p where p.id=product_id and p.status='published') and exists (select 1 from public.categories c where c.id=category_id and c.is_active)));
create policy "product_part_colors_read" on public.product_part_colors for select to anon,authenticated
using ((select public.is_store_admin()) or (exists (select 1 from public.products p where p.id=product_id and p.status='published') and exists (select 1 from public.colors c where c.id=color_id and c.is_active)));
create policy "product_attributes_read" on public.product_attributes for select to anon,authenticated
using ((select public.is_store_admin()) or exists (select 1 from public.products p where p.id=product_id and p.status='published'));
create policy "product_images_read" on public.product_images for select to anon,authenticated
using ((select public.is_store_admin()) or exists (select 1 from public.products p where p.id=product_id and p.status='published'));
create policy "store_settings_read" on public.store_settings for select to anon,authenticated using (true);

-- Public-facing catalog imagery. Files are publicly retrievable via their public URLs.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('catalog-images','catalog-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "admin_catalog_storage_insert" on storage.objects for insert to authenticated
with check (bucket_id='catalog-images' and (select public.is_store_admin()));
create policy "admin_catalog_storage_update" on storage.objects for update to authenticated
using (bucket_id='catalog-images' and (select public.is_store_admin()))
with check (bucket_id='catalog-images' and (select public.is_store_admin()));
create policy "admin_catalog_storage_delete" on storage.objects for delete to authenticated
using (bucket_id='catalog-images' and (select public.is_store_admin()));
create policy "admin_catalog_storage_select" on storage.objects for select to authenticated
using (bucket_id='catalog-images' and (select public.is_store_admin()));
