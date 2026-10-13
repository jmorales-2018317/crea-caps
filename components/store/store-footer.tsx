import type { ReactNode, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle, type LucideIcon } from "lucide-react";
import { getStoreSettings } from "@/services/store-settings";
import type { StoreSettingsPublic } from "@/types/store-settings";

const DEFAULT_STORE_NAME = "Caps Store";
const DEFAULT_DESCRIPTION =
  "Gorras personalizadas diseñadas para representar tu estilo, identidad o marca.";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
] as const;

type StoreFooterProps = {
  /** Optional override — when omitted, settings are loaded from Supabase. */
  settings?: StoreSettingsPublic | null;
};

export async function StoreFooter({
  settings: settingsProp,
}: StoreFooterProps = {}) {
  const settings =
    settingsProp === undefined
      ? await getStoreSettings().catch(() => null)
      : settingsProp;

  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;
  const description = settings?.description?.trim() || DEFAULT_DESCRIPTION;
  const year = new Date().getFullYear();

  const contactLinks = buildContactLinks(settings);

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
                src="/logo-gold.webp"
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

          {contactLinks.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-tight text-text-strong">
                Contacto
              </h2>
              <ul className="flex flex-wrap gap-2">
                {contactLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted/40 text-text-secondary transition-[color,border-color,background-color] duration-200 hover:border-primary/40 hover:bg-[rgb(184_154_85_/_0.08)] hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={link.label}
                    >
                      <link.icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-tight text-text-strong">
                Tienda
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
                Catálogo público de gorras personalizadas. Explora estilos y
                encuentra la tuya.
              </p>
            </div>
          )}
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

type IconComponent =
  | LucideIcon
  | ((props: SVGProps<SVGSVGElement>) => ReactNode);

type ContactLink = {
  href: string;
  label: string;
  icon: IconComponent;
  external: boolean;
};

function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 8h2V5.5A3.5 3.5 0 0 0 12.5 2H10v3h2v3H10v3h2v9h3v-9h2.2L18 8h-4Z" />
    </svg>
  );
}

function buildContactLinks(
  settings: StoreSettingsPublic | null | undefined,
): ContactLink[] {
  if (!settings) {
    return [];
  }

  const links: ContactLink[] = [];

  const whatsapp = normalizeWhatsappHref(settings.whatsapp_number);
  if (whatsapp) {
    links.push({
      href: whatsapp,
      label: "WhatsApp",
      icon: MessageCircle,
      external: true,
    });
  }

  const email = settings.email?.trim();
  if (email) {
    links.push({
      href: `mailto:${email}`,
      label: "Correo electrónico",
      icon: Mail,
      external: false,
    });
  }

  const instagram = normalizeHttpUrl(settings.instagram_url);
  if (instagram) {
    links.push({
      href: instagram,
      label: "Instagram",
      icon: InstagramIcon,
      external: true,
    });
  }

  const facebook = normalizeHttpUrl(settings.facebook_url);
  if (facebook) {
    links.push({
      href: facebook,
      label: "Facebook",
      icon: FacebookIcon,
      external: true,
    });
  }

  return links;
}

function normalizeWhatsappHref(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

function normalizeHttpUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`,
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
