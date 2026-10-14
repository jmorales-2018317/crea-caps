import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoreCategories } from "@/components/store/store-categories";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreHero } from "@/components/store/store-hero";
import { Button } from "@/components/ui/button";
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
        <div className="mx-auto flex max-w-xl flex-col items-start gap-5 sm:items-center sm:text-center">
          <div className="space-y-2">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-text-strong">
              Catálogo
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Explora gorras publicadas con búsqueda y filtros por categoría,
              color y características.
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            className="h-11 rounded-xl px-6"
            render={<Link href="/catalogo" />}
          >
            Ver catálogo
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </main>
      <StoreCategories />
      <StoreFooter settings={settings} />
    </div>
  );
}
