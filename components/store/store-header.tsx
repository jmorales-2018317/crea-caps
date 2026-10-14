import Image from "next/image";
import Link from "next/link";
import { StoreNav } from "@/components/store/store-nav";
import { isAdminClaims } from "@/lib/auth/admin";
import {
  DEFAULT_STORE_NAME,
  FALLBACK_LOGO,
} from "@/lib/constants/store";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import { createClient } from "@/lib/supabase/server";
import type { StoreSettingsPublic } from "@/types/store-settings";

type StoreHeaderProps = {
  settings?: StoreSettingsPublic | null;
};

export async function StoreHeader({ settings }: StoreHeaderProps) {
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const logoSrc =
    settings?.logo_path && settings.logo_path.trim().length > 0
      ? getCatalogImagePublicUrl(settings.logo_path) || FALLBACK_LOGO
      : FALLBACK_LOGO;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const showAdminLink = isAdminClaims(data?.claims);

  return (
    <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
          aria-label={storeName}
        >
          <Image
            src={logoSrc}
            alt=""
            width={148}
            height={58}
            priority
            className="h-8 w-auto"
          />
          <span className="font-heading text-base font-semibold tracking-tight text-text-strong sm:text-lg">
            {storeName}
          </span>
        </Link>
        <StoreNav showAdminLink={showAdminLink} />
      </div>
    </header>
  );
}
