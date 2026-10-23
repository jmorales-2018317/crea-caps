import { Suspense } from "react";
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

export function StoreHeader({ settings }: StoreHeaderProps) {
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const logoSrc =
    settings?.logo_path && settings.logo_path.trim().length > 0
      ? getCatalogImagePublicUrl(settings.logo_path) || FALLBACK_LOGO
      : FALLBACK_LOGO;

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr] sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 justify-self-start transition-opacity duration-200 hover:opacity-90"
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
        <Suspense fallback={<StoreNav />}>
          <StoreNavWithAuth />
        </Suspense>
      </div>
    </header>
  );
}

async function StoreNavWithAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const showAdminLink = isAdminClaims(data?.claims);

  return <StoreNav showAdminLink={showAdminLink} />;
}
