"use client";

import { QueryErrorState } from "@/components/dashboard/query-state";
import { CategoryLucideIcon } from "@/components/shared/category-lucide-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreCategories } from "@/hooks/use-categories";

const STORE_CATEGORY_LIMIT = 8;

export function StoreCategories() {
  const categoriesQuery = useStoreCategories(STORE_CATEGORY_LIMIT);

  if (categoriesQuery.isPending) {
    return (
      <section
        aria-labelledby="store-categories-heading"
        className="border-t border-divider"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <CategoriesHeader />
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <li
                key={index}
                className="flex flex-col items-center gap-3"
              >
                <Skeleton className="size-20 rounded-full sm:size-24" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <section
        aria-labelledby="store-categories-heading"
        className="border-t border-divider"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <CategoriesHeader />
          <div className="mt-8">
            <QueryErrorState
              title="No se pudieron cargar las categorías"
              message="Hubo un problema al consultar las categorías activas."
              onRetry={() => {
                void categoriesQuery.refetch();
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  const categories = categoriesQuery.data ?? [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="store-categories-heading"
      className="border-t border-divider"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <CategoriesHeader />
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 md:grid-cols-4">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="animate-hero-enter"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <article className="flex flex-col items-center gap-3 text-center">
                <span
                  className="flex size-20 items-center justify-center rounded-full border border-primary/55 bg-[rgb(184_154_85_/_0.08)] text-gold-soft shadow-[inset_0_0_24px_rgb(184_154_85_/_0.06)] sm:size-24"
                  aria-hidden="true"
                >
                  <CategoryLucideIcon
                    name={category.icon}
                    className="size-7 text-gold-soft sm:size-8"
                  />
                </span>
                <h3 className="max-w-[10rem] text-sm font-semibold tracking-tight text-gold-soft sm:text-base">
                  {category.name}
                </h3>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoriesHeader() {
  return (
    <div className="space-y-2">
      <h2
        id="store-categories-heading"
        className="text-balance text-2xl font-semibold tracking-tight text-text-strong"
      >
        Categorías
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
        Explora algunos estilos del catálogo Caps Store.
      </p>
    </div>
  );
}
