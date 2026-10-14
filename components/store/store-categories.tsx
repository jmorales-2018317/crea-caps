"use client";

import Link from "next/link";
import { QueryErrorState } from "@/components/dashboard/query-state";
import { CategoryLucideIcon } from "@/components/shared/category-lucide-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreCategories } from "@/hooks/use-categories";

const STORE_CATEGORY_LIMIT = 8;
const CATEGORIES_LIST_CLASS =
  "mt-10 grid grid-cols-2 justify-items-center gap-x-4 gap-y-10 sm:flex sm:flex-row sm:flex-wrap sm:justify-around sm:gap-y-10";
const CATEGORY_ITEM_CLASS = "w-full sm:w-1/6";

export function StoreCategories() {
  const categoriesQuery = useStoreCategories(STORE_CATEGORY_LIMIT);

  if (categoriesQuery.isPending) {
    return (
      <section
        id="categorias"
        aria-labelledby="store-categories-heading"
        className="scroll-mt-16 border-t border-divider"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <CategoriesHeader />
          <ul className={CATEGORIES_LIST_CLASS}>
            {Array.from({ length: 6 }).map((_, index) => (
              <li
                key={index}
                className={`flex flex-col items-center gap-3 ${CATEGORY_ITEM_CLASS}`}
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
        id="categorias"
        aria-labelledby="store-categories-heading"
        className="scroll-mt-16 border-t border-divider"
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
      id="categorias"
      aria-labelledby="store-categories-heading"
      className="scroll-mt-16 border-t border-divider"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <CategoriesHeader />
        <ul className={CATEGORIES_LIST_CLASS}>
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={`animate-hero-enter ${CATEGORY_ITEM_CLASS}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link
                href={`/catalogo?categories=${encodeURIComponent(category.code)}`}
                className="group flex flex-col items-center gap-3 text-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  className="flex size-20 items-center justify-center rounded-full border border-primary/55 bg-[rgb(184_154_85_/_0.08)] text-gold-soft shadow-[inset_0_0_24px_rgb(184_154_85_/_0.06)] transition-colors group-hover:border-primary/80 sm:size-24"
                  aria-hidden="true"
                >
                  <CategoryLucideIcon
                    name={category.icon}
                    className="size-7 text-gold-soft sm:size-8"
                  />
                </span>
                <span className="max-w-[10rem] text-sm font-semibold tracking-tight text-gold-soft sm:text-base">
                  {category.name}
                </span>
              </Link>
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
      <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
        Explora algunos estilos del catálogo Crea Caps.
      </p>
    </div>
  );
}
