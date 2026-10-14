import Image from "next/image";
import Link from "next/link";
import { StoreNav } from "@/components/store/store-nav";
import {
  DEFAULT_STORE_NAME,
  FALLBACK_LOGO,
} from "@/lib/constants/store";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import type { StoreSettingsPublic } from "@/types/store-settings";

type StoreHeaderProps = {
  settings?: StoreSettingsPublic | null;
};

export function StoreHeader({ settings }: StoreHeaderProps) {
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const logoSrc =
    settings?.logo_path && settings.logo_path.trim().length > 0
      ? getCatalogImagePublicUrl(settings.logo_path) || FALLBACK_LOGO
      : FALLBACK_LOGO;

  return (
    <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center transition-opacity duration-200 hover:opacity-90"
          aria-label={storeName}
        >
          <Image
            src={logoSrc}
            alt={storeName}
            width={148}
            height={58}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <StoreNav />
      </div>
    </header>
  );
}
