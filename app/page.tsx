import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/store/featured-products";
import { StoreCategories } from "@/components/store/store-categories";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreHero } from "@/components/store/store-hero";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
} from "@/lib/constants/store";
import { getFeaturedPublishedProducts } from "@/services/products.server";
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
  const [settings, featuredProducts] = await Promise.all([
    getStoreSettings().catch(() => null),
    getFeaturedPublishedProducts().catch(() => []),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <StoreHero />
      <main className="flex-1">
        <FeaturedProducts products={featuredProducts} />
        <StoreCategories />
      </main>
      <StoreFooter settings={settings} />
    </div>
  );
}
