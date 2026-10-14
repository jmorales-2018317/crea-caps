-- Flexible contact channels (WhatsApp, email, social, custom URLs) as a JSON array.
alter table public.store_settings
  add column if not exists contacts jsonb not null default '[]'::jsonb;

update public.store_settings as s
set contacts = (
  select coalesce(jsonb_agg(item), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'id', gen_random_uuid()::text,
      'kind', 'whatsapp',
      'value', btrim(s.whatsapp_number)
    ) as item
    where s.whatsapp_number is not null and btrim(s.whatsapp_number) <> ''
    union all
    select jsonb_build_object(
      'id', gen_random_uuid()::text,
      'kind', 'email',
      'value', btrim(s.email)
    )
    where s.email is not null and btrim(s.email) <> ''
    union all
    select jsonb_build_object(
      'id', gen_random_uuid()::text,
      'kind', 'instagram',
      'value', btrim(s.instagram_url)
    )
    where s.instagram_url is not null and btrim(s.instagram_url) <> ''
    union all
    select jsonb_build_object(
      'id', gen_random_uuid()::text,
      'kind', 'facebook',
      'value', btrim(s.facebook_url)
    )
    where s.facebook_url is not null and btrim(s.facebook_url) <> ''
  ) as items
);

alter table public.store_settings
  drop column if exists whatsapp_number,
  drop column if exists email,
  drop column if exists instagram_url,
  drop column if exists facebook_url;

alter table public.store_settings
  drop constraint if exists store_settings_contacts_is_array;

alter table public.store_settings
  add constraint store_settings_contacts_is_array
  check (jsonb_typeof(contacts) = 'array');
