import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { StoreContactIcon } from "@/components/shared/store-contact-icon";
import {
  DEFAULT_STORE_DESCRIPTION,
  DEFAULT_STORE_NAME,
  FALLBACK_LOGO,
} from "@/lib/constants/store";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import {
  STORE_CONTACT_KINDS,
  STORE_CONTACT_KIND_LABELS,
  isStoreContactSocialKind,
  resolveStoreContact,
  type ResolvedStoreContact,
  type StoreContact,
  type StoreContactKind,
} from "@/lib/store-contacts";
import { cn } from "cn";
import type { StoreSettingsPublic } from "@/types/store-settings";

async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
] as const;

type StoreFooterProps = {
  settings?: StoreSettingsPublic | null;
};

type FooterContactSlot = {
  key: string;
  kind: StoreContactKind;
  label: string;
  resolved: ResolvedStoreContact | null;
};

function buildContactSlots(contacts: StoreContact[]): FooterContactSlot[] {
  const byKind = new Map<StoreContactKind, StoreContact[]>();

  for (const contact of contacts) {
    const list = byKind.get(contact.kind) ?? [];
    list.push(contact);
    byKind.set(contact.kind, list);
  }

  const slots: FooterContactSlot[] = [];

  for (const kind of STORE_CONTACT_KINDS) {
    if (kind === "custom") {
      const customs = byKind.get("custom") ?? [];
      if (customs.length === 0) {
        slots.push({
          key: "custom-empty",
          kind: "custom",
          label: STORE_CONTACT_KIND_LABELS.custom,
          resolved: null,
        });
        continue;
      }

      for (const contact of customs) {
        slots.push({
          key: contact.id,
          kind: "custom",
          label: STORE_CONTACT_KIND_LABELS.custom,
          resolved: resolveStoreContact(contact),
        });
      }
      continue;
    }

    const first = byKind.get(kind)?.[0] ?? null;
    slots.push({
      key: kind,
      kind,
      label: STORE_CONTACT_KIND_LABELS[kind],
      resolved: first ? resolveStoreContact(first) : null,
    });
  }

  return slots;
}

export async function StoreFooter({ settings }: StoreFooterProps) {
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const description =
    settings?.description?.trim() || DEFAULT_STORE_DESCRIPTION;
  const logoSrc =
    settings?.logo_path && settings.logo_path.trim().length > 0
      ? getCatalogImagePublicUrl(settings.logo_path) || FALLBACK_LOGO
      : FALLBACK_LOGO;
  const year = await getCopyrightYear();
  const contactSlots = buildContactSlots(settings?.contacts ?? []);
  const detailSlots = contactSlots.filter(
    (slot) => !isStoreContactSocialKind(slot.kind),
  );
  const socialSlots = contactSlots.filter((slot) =>
    isStoreContactSocialKind(slot.kind),
  );

  return (
    <footer
      className="relative mt-auto border-t border-divider"
      role="contentinfo"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(184_154_85_/_0.06)_0%,transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center rounded-md transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={storeName}
            >
              <Image
                src={logoSrc}
                alt={storeName}
                width={148}
                height={58}
                className="h-8 w-auto"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
              {description}
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página" className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-text-strong">
              Explorar
            </h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-sm text-text-secondary transition-colors duration-200 hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-8">
            <section className="space-y-4" aria-labelledby="footer-social-heading">
              <h2
                id="footer-social-heading"
                className="text-sm font-semibold tracking-tight text-text-strong"
              >
                Redes sociales
              </h2>
              <ul className="flex flex-wrap gap-2">
                {socialSlots.map((slot) => {
                  const label = slot.resolved?.label ?? slot.label;
                  const className = cn(
                    "inline-flex size-10 items-center justify-center rounded-lg border transition-[color,border-color,background-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    slot.resolved
                      ? "cursor-pointer border-border bg-muted/40 text-text-secondary hover:border-primary/40 hover:bg-[rgb(184_154_85_/_0.08)] hover:text-gold-soft"
                      : "cursor-default border-border/50 bg-muted/20 text-text-subtle opacity-40",
                  );

                  if (slot.resolved) {
                    return (
                      <li key={slot.key}>
                        <a
                          href={slot.resolved.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                          aria-label={label}
                        >
                          <StoreContactIcon
                            kind={slot.kind}
                            className="size-4"
                          />
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={slot.key}>
                      <span
                        className={className}
                        aria-label={`${label} (no configurado)`}
                        title={`${label} (no configurado)`}
                      >
                        <StoreContactIcon
                          kind={slot.kind}
                          className="size-4"
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section
              className="space-y-4"
              aria-labelledby="footer-contact-heading"
            >
              <h2
                id="footer-contact-heading"
                className="text-sm font-semibold tracking-tight text-text-strong"
              >
                Contacto
              </h2>
              <ul className="grid grid-cols-2 gap-2">
                {detailSlots.map((slot) => {
                  const label = slot.resolved?.label ?? slot.label;
                  const className = cn(
                    "inline-flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm transition-[color,border-color,background-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    slot.resolved
                      ? "cursor-pointer border-border bg-muted/40 text-text-secondary hover:border-primary/40 hover:bg-[rgb(184_154_85_/_0.08)] hover:text-gold-soft"
                      : "cursor-default border-border/50 bg-muted/20 text-text-subtle opacity-40",
                  );

                  const content = (
                    <>
                      <StoreContactIcon kind={slot.kind} className="size-4" />
                      <span className="min-w-0 truncate">{label}</span>
                    </>
                  );

                  if (slot.resolved) {
                    return (
                      <li key={slot.key}>
                        <a
                          href={slot.resolved.href}
                          target={
                            slot.resolved.external ? "_blank" : undefined
                          }
                          rel={
                            slot.resolved.external
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className={className}
                        >
                          {content}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={slot.key}>
                      <span
                        className={className}
                        title={`${label} (no configurado)`}
                      >
                        {content}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-divider pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-subtle">
            © {year} {storeName}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-subtle">
            Personalización demostrativa · Catálogo de consulta
          </p>
        </div>
      </div>
    </footer>
  );
}
