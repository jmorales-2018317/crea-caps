-- Categories are optional on products. Deleting a category should remove
-- product_categories links without blocking the delete or removing products.
alter table public.product_categories
  drop constraint product_categories_category_id_fkey;

alter table public.product_categories
  add constraint product_categories_category_id_fkey
  foreign key (category_id)
  references public.categories(id)
  on delete cascade;
