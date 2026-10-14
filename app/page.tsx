import type { Metadata } from "next";
import { PublishedProductsCatalog } from "@/components/store/published-products-catalog";
import { StoreCategories } from "@/components/store/store-categories";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreHero } from "@/components/store/store-hero";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
} from "@/lib/constants/store";
import { getStoreSettings } from "@/services/store-settings.server";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => null);
  const title = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const description =
    settings?.description?.trim() || DEFAULT_STORE_DESCRIPTION;

  return {
    title,
    description,
  };
}

export default async function Home() {
  const settings = await getStoreSettings().catch(() => null);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <StoreHero />
      <main
        id="catalogo"
        className="mx-auto w-full max-w-7xl scroll-mt-16 flex-1 border-t border-divider px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mb-8 space-y-2">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-text-strong">
            Catálogo
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
            Gorras publicadas disponibles para consulta.
          </p>
        </div>
        <PublishedProductsCatalog />
      </main>
      <StoreCategories />
      <StoreFooter settings={settings} />
    </div>
  );
}
