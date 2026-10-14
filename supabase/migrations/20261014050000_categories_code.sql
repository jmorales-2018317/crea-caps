-- Rename categories.slug → code; update catalog search RPC.

alter table public.categories
  rename column slug to code;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_key'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      rename constraint categories_slug_key to categories_code_key;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_check'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      rename constraint categories_slug_check to categories_code_check;
  end if;
end $$;

drop function if exists public.search_published_products(
  text, text[], text[], text[], text[], boolean, text[], boolean, text, integer, integer
);

create or replace function public.search_published_products(
  p_query text default null,
  p_category_codes text[] default null,
  p_color_slugs text[] default null,
  p_visor_types text[] default null,
  p_construction_types text[] default null,
  p_has_strap boolean default null,
  p_strap_types text[] default null,
  p_has_front_logo boolean default null,
  p_sort text default 'created_at_desc',
  p_page integer default 1,
  p_page_size integer default 12
)
returns table (
  id uuid,
  name text,
  code text,
  price numeric,
  created_at timestamptz,
  categories jsonb,
  colors jsonb,
  attributes jsonb,
  product_images jsonb,
  total_count bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 12), 1), 48);
  v_offset integer;
  v_query text := nullif(btrim(coalesce(p_query, '')), '');
  v_category_codes text[] := (
    select array_agg(distinct btrim(s))
    from unnest(coalesce(p_category_codes, array[]::text[])) as s
    where btrim(s) <> ''
  );
  v_color_slugs text[] := (
    select array_agg(distinct btrim(s))
    from unnest(coalesce(p_color_slugs, array[]::text[])) as s
    where btrim(s) <> ''
  );
  v_visor_types text[] := (
    select array_agg(distinct btrim(s))
    from unnest(coalesce(p_visor_types, array[]::text[])) as s
    where btrim(s) <> ''
  );
  v_construction_types text[] := (
    select array_agg(distinct btrim(s))
    from unnest(coalesce(p_construction_types, array[]::text[])) as s
    where btrim(s) <> ''
  );
  v_strap_types text[] := (
    select array_agg(distinct btrim(s))
    from unnest(coalesce(p_strap_types, array[]::text[])) as s
    where btrim(s) <> ''
  );
  v_sort text := coalesce(nullif(btrim(p_sort), ''), 'created_at_desc');
begin
  if v_sort not in ('name_asc', 'name_desc', 'created_at_asc', 'created_at_desc') then
    v_sort := 'created_at_desc';
  end if;

  v_offset := (v_page - 1) * v_page_size;

  return query
  with filtered as (
    select
      p.id,
      p.name,
      p.code,
      p.price,
      p.created_at
    from public.products p
    where p.status = 'published'
      and (
        v_query is null
        or p.name ilike '%' || replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_') || '%' escape '\'
      )
      and (
        v_category_codes is null
        or exists (
          select 1
          from public.product_categories pc
          join public.categories c on c.id = pc.category_id
          where pc.product_id = p.id
            and c.is_active
            and c.code = any (v_category_codes)
        )
      )
      and (
        v_color_slugs is null
        or exists (
          select 1
          from public.product_part_colors ppc
          join public.colors col on col.id = ppc.color_id
          where ppc.product_id = p.id
            and col.is_active
            and public.color_name_slug(col.name) = any (v_color_slugs)
        )
      )
      and (
        v_visor_types is null
        and v_construction_types is null
        and p_has_strap is null
        and v_strap_types is null
        and p_has_front_logo is null
        or exists (
          select 1
          from public.product_attributes pa
          where pa.product_id = p.id
            and (v_visor_types is null or pa.visor_type = any (v_visor_types))
            and (
              v_construction_types is null
              or pa.construction_type = any (v_construction_types)
            )
            and (p_has_strap is null or pa.has_strap = p_has_strap)
            and (v_strap_types is null or pa.strap_type = any (v_strap_types))
            and (
              p_has_front_logo is null
              or pa.has_front_logo = p_has_front_logo
            )
        )
      )
  ),
  counted as (
    select
      f.*,
      count(*) over () as total_count
    from filtered f
  ),
  ordered as (
    select *
    from counted
    order by
      case when v_sort = 'name_asc' then counted.name end asc nulls last,
      case when v_sort = 'name_desc' then counted.name end desc nulls last,
      case when v_sort = 'created_at_asc' then counted.created_at end asc nulls last,
      case when v_sort = 'created_at_desc' then counted.created_at end desc nulls last,
      counted.created_at desc,
      counted.id asc
    offset v_offset
    limit v_page_size
  )
  select
    o.id,
    o.name,
    o.code,
    o.price,
    o.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'code', c.code
          )
          order by c.name
        )
        from public.product_categories pc
        join public.categories c on c.id = pc.category_id
        where pc.product_id = o.id
          and c.is_active
      ),
      '[]'::jsonb
    ) as categories,
    coalesce(
      (
        select jsonb_agg(color_row order by color_row->>'name')
        from (
          select distinct on (col.id)
            jsonb_build_object(
              'id', col.id,
              'name', col.name,
              'hex_code', col.hex_code,
              'slug', public.color_name_slug(col.name)
            ) as color_row
          from public.product_part_colors ppc
          join public.colors col on col.id = ppc.color_id
          where ppc.product_id = o.id
            and col.is_active
          order by col.id, col.name
        ) distinct_colors
      ),
      '[]'::jsonb
    ) as colors,
    (
      select jsonb_build_object(
        'visor_type', pa.visor_type,
        'construction_type', pa.construction_type,
        'has_strap', pa.has_strap,
        'strap_type', pa.strap_type,
        'has_front_logo', pa.has_front_logo
      )
      from public.product_attributes pa
      where pa.product_id = o.id
    ) as attributes,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', img.id,
            'storage_path', img.storage_path,
            'alt_text', img.alt_text,
            'is_primary', img.is_primary,
            'sort_order', img.sort_order,
            'created_at', img.created_at
          )
          order by img.is_primary desc, img.sort_order asc, img.created_at asc
        )
        from public.product_images img
        where img.product_id = o.id
      ),
      '[]'::jsonb
    ) as product_images,
    o.total_count
  from ordered o;
end;
$$;

revoke all on function public.search_published_products(
  text, text[], text[], text[], text[], boolean, text[], boolean, text, integer, integer
) from public;
grant execute on function public.search_published_products(
  text, text[], text[], text[], text[], boolean, text[], boolean, text, integer, integer
) to anon, authenticated;
