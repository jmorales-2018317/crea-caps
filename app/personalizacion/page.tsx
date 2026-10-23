import type { Metadata } from "next";
import { PersonalizationStudio } from "@/components/store/personalization/personalization-studio";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
} from "@/lib/constants/store";
import { getSiteUrl } from "@/lib/site-url";
import { getActiveColors } from "@/services/colors.server";
import { getStoreSettings } from "@/services/store-settings.server";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => null);
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: `Personalización | ${storeName}`,
    description:
      settings?.description?.trim() || DEFAULT_STORE_DESCRIPTION,
    alternates: {
      canonical: "/personalizacion",
    },
  };
}

export default async function PersonalizacionPage() {
  const [settings, paletteColors] = await Promise.all([
    getStoreSettings().catch(() => null),
    getActiveColors().catch(() => null),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader settings={settings} />
      <main
        className="flex-1"
        style={{ backgroundImage: "var(--hero-gradient)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-6 space-y-2 sm:mb-8">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
              Personaliza tu gorra
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Sube uno o varios logos, elige si van en la visera o en el panel
              frontal, pinta cada pieza del modelo y comparte la configuración.
              El diseño se queda en tu navegador; no se envía ni se guarda en la
              tienda.
            </p>
          </div>
          <PersonalizationStudio paletteColors={paletteColors} />
        </div>
      </main>
      <StoreFooter settings={settings} />
    </div>
  );
}
