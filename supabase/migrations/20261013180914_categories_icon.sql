-- Lucide icon name (kebab-case) for store/dashboard category display.
alter table public.categories
  add column icon text null
  check (icon is null or icon ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

comment on column public.categories.icon is
  'Lucide React icon name in kebab-case (e.g. shopping-bag). Null means no icon.';
