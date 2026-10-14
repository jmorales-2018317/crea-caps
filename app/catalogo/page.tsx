import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogPageClient } from "@/components/store/catalog-page-client";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
} from "@/lib/constants/store";
import { getSiteUrl } from "@/lib/site-url";
import { getStoreSettings } from "@/services/store-settings.server";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => null);
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const description =
    settings?.description?.trim() || DEFAULT_STORE_DESCRIPTION;
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: `Catálogo | ${storeName}`,
    description,
    alternates: {
      canonical: "/catalogo",
    },
  };
}

export default async function CatalogPage() {
  const settings = await getStoreSettings().catch(() => null);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-4 space-y-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-strong">
            Catálogo
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
            Busca gorras por nombre y combina filtros de categoría, color y características.
          </p>
        </div>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogPageClient />
        </Suspense>
      </main>
      <StoreFooter settings={settings} />
    </div>
  );
}

function CatalogFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 rounded-xl lg:block" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
