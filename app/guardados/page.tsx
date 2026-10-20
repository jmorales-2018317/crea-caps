import type { Metadata } from "next";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { BookmarksGrid } from "@/components/store/bookmarks-grid";
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
    title: `Guardados | ${storeName}`,
    description,
    alternates: {
      canonical: "/guardados",
    },
  };
}

export default async function GuardadosPage() {
  const settings = await getStoreSettings().catch(() => null);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <BookmarksGrid />
      </main>
      <StoreFooter settings={settings} />
    </div>
  );
}
