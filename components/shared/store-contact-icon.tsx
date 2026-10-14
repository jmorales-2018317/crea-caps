import { Globe, Link2, Mail, Phone } from "lucide-react";
import { cn } from "cn";
import {
  STORE_CONTACT_BRAND_ICON_SRC,
  isStoreContactBrandKind,
  type StoreContactKind,
} from "@/lib/store-contacts";

const LUCIDE_ICONS = {
  email: Mail,
  phone: Phone,
  website: Globe,
  custom: Link2,
} as const;

type LucideContactKind = keyof typeof LUCIDE_ICONS;

function isLucideContactKind(kind: StoreContactKind): kind is LucideContactKind {
  return kind in LUCIDE_ICONS;
}

function BrandMaskIcon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function StoreContactIcon({
  kind,
  className,
}: {
  kind: StoreContactKind;
  className?: string;
}) {
  if (isStoreContactBrandKind(kind)) {
    return (
      <BrandMaskIcon
        src={STORE_CONTACT_BRAND_ICON_SRC[kind]}
        className={className}
      />
    );
  }

  if (isLucideContactKind(kind)) {
    const Icon = LUCIDE_ICONS[kind];
    return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
  }

  return null;
}
