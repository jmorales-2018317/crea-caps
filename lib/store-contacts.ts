import type { Json } from "@/lib/supabase/database.types";

export const STORE_CONTACT_KINDS = [
  "whatsapp",
  "email",
  "phone",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "website",
  "custom",
] as const;

export type StoreContactKind = (typeof STORE_CONTACT_KINDS)[number];

export type StoreContact = {
  id: string;
  kind: StoreContactKind;
  value: string;
  label?: string | null;
};

export const STORE_CONTACT_KIND_LABELS: Record<StoreContactKind, string> = {
  whatsapp: "WhatsApp",
  email: "Correo electrónico",
  phone: "Teléfono",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  website: "Sitio web",
  custom: "Personalizado",
};

export const STORE_CONTACT_KIND_PLACEHOLDERS: Record<StoreContactKind, string> =
  {
    whatsapp: "5215512345678",
    email: "hola@caps.store",
    phone: "+52 55 1234 5678",
    instagram: "https://instagram.com/tu-cuenta",
    facebook: "https://facebook.com/tu-pagina",
    tiktok: "https://tiktok.com/@tu-cuenta",
    youtube: "https://youtube.com/@tu-canal",
    website: "https://tu-sitio.com",
    custom: "https://…",
  };

/** Brand icons served from `/public/icons/contacts/`. */
export const STORE_CONTACT_BRAND_ICON_SRC = {
  whatsapp: "/icons/contacts/whatsapp.svg",
  instagram: "/icons/contacts/instagram.svg",
  facebook: "/icons/contacts/facebook.svg",
  tiktok: "/icons/contacts/tiktok.svg",
  youtube: "/icons/contacts/youtube.svg",
} as const satisfies Partial<Record<StoreContactKind, string>>;

export type StoreContactBrandKind = keyof typeof STORE_CONTACT_BRAND_ICON_SRC;

export function isStoreContactBrandKind(
  kind: StoreContactKind,
): kind is StoreContactBrandKind {
  return kind in STORE_CONTACT_BRAND_ICON_SRC;
}

/** Social networks shown as icon-only in the storefront. */
export const STORE_CONTACT_SOCIAL_KINDS = [
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
] as const satisfies readonly StoreContactKind[];

export type StoreContactSocialKind = (typeof STORE_CONTACT_SOCIAL_KINDS)[number];

export function isStoreContactSocialKind(
  kind: StoreContactKind,
): kind is StoreContactSocialKind {
  return (STORE_CONTACT_SOCIAL_KINDS as readonly string[]).includes(kind);
}

/** Direct contact channels managed as a dynamic list in the dashboard. */
export const STORE_CONTACT_DIRECT_KINDS = [
  "email",
  "phone",
  "website",
  "custom",
] as const satisfies readonly StoreContactKind[];

export type StoreContactDirectKind = (typeof STORE_CONTACT_DIRECT_KINDS)[number];

export function isStoreContactDirectKind(
  kind: StoreContactKind,
): kind is StoreContactDirectKind {
  return (STORE_CONTACT_DIRECT_KINDS as readonly string[]).includes(kind);
}

export type StoreSocialsFormValues = Record<
  StoreContactSocialKind,
  { id: string; value: string }
>;

export function emptyStoreSocials(): StoreSocialsFormValues {
  return {
    whatsapp: { id: crypto.randomUUID(), value: "" },
    instagram: { id: crypto.randomUUID(), value: "" },
    facebook: { id: crypto.randomUUID(), value: "" },
    tiktok: { id: crypto.randomUUID(), value: "" },
    youtube: { id: crypto.randomUUID(), value: "" },
  };
}

export type StoreDirectContact = StoreContact & {
  kind: StoreContactDirectKind;
};

/** Split persisted contacts into fixed social fields + direct contact rows. */
export function splitStoreContacts(contacts: StoreContact[]): {
  socials: StoreSocialsFormValues;
  contacts: StoreDirectContact[];
} {
  const socials = emptyStoreSocials();
  const direct: StoreDirectContact[] = [];

  for (const contact of contacts) {
    if (isStoreContactSocialKind(contact.kind)) {
      if (!socials[contact.kind].value) {
        socials[contact.kind] = {
          id: contact.id,
          value: contact.value,
        };
      }
      continue;
    }

    if (isStoreContactDirectKind(contact.kind)) {
      direct.push({
        ...contact,
        kind: contact.kind,
      });
    }
  }

  return { socials, contacts: direct };
}

export function createStoreDirectContact(
  kind: StoreContactDirectKind = "email",
): StoreDirectContact {
  return {
    id: crypto.randomUUID(),
    kind,
    value: "",
    label: kind === "custom" ? "" : null,
  };
}

/** Merge social fields + direct contacts back into a single ordered list. */
export function mergeStoreContacts(
  socials: StoreSocialsFormValues,
  contacts: StoreDirectContact[],
): StoreContact[] {
  const merged: StoreContact[] = [];

  for (const kind of STORE_CONTACT_SOCIAL_KINDS) {
    const value = socials[kind].value.trim();
    if (!value) {
      continue;
    }
    merged.push({
      id: socials[kind].id || crypto.randomUUID(),
      kind,
      value,
      label: null,
    });
  }

  for (const contact of contacts) {
    if (!isStoreContactDirectKind(contact.kind)) {
      continue;
    }
    merged.push(contact);
  }

  return merged.slice(0, MAX_STORE_CONTACTS);
}

export const MAX_STORE_CONTACTS = 12;

export type ContactValueShape = "phone" | "email" | "url";

export function contactValueShape(kind: StoreContactKind): ContactValueShape {
  if (kind === "whatsapp" || kind === "phone") {
    return "phone";
  }
  if (kind === "email") {
    return "email";
  }
  return "url";
}

export function isStoreContactKind(value: string): value is StoreContactKind {
  return (STORE_CONTACT_KINDS as readonly string[]).includes(value);
}

export function createStoreContact(
  kind: StoreContactKind = "whatsapp",
): StoreContact {
  return {
    id: crypto.randomUUID(),
    kind,
    value: "",
    label: kind === "custom" ? "" : null,
  };
}

export function contactDisplayLabel(contact: StoreContact): string {
  if (contact.kind === "custom") {
    const custom = contact.label?.trim();
    if (custom) {
      return custom;
    }
  }

  if (contact.kind === "email" || contact.kind === "phone") {
    const value = contact.value.trim();
    if (value) {
      return value;
    }
  }

  return STORE_CONTACT_KIND_LABELS[contact.kind];
}

export function normalizeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
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

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export type ResolvedStoreContact = {
  id: string;
  href: string;
  label: string;
  kind: StoreContactKind;
  external: boolean;
};

export function resolveStoreContact(
  contact: StoreContact,
): ResolvedStoreContact | null {
  const label = contactDisplayLabel(contact);
  const raw = contact.value.trim();
  if (!raw) {
    return null;
  }

  if (contact.kind === "email") {
    return {
      id: contact.id,
      href: `mailto:${raw}`,
      label,
      kind: contact.kind,
      external: false,
    };
  }

  if (contact.kind === "whatsapp") {
    const digits = normalizePhoneDigits(raw);
    if (digits.length < 8) {
      return null;
    }
    return {
      id: contact.id,
      href: `https://wa.me/${digits}`,
      label,
      kind: contact.kind,
      external: true,
    };
  }

  if (contact.kind === "phone") {
    const digits = normalizePhoneDigits(raw);
    if (digits.length < 8) {
      return null;
    }
    return {
      id: contact.id,
      href: `tel:+${digits}`,
      label,
      kind: contact.kind,
      external: false,
    };
  }

  const url = normalizeHttpUrl(raw);
  if (!url) {
    return null;
  }

  return {
    id: contact.id,
    href: url,
    label,
    kind: contact.kind,
    external: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Best-effort parse of DB JSON into typed contacts (invalid entries dropped). */
export function parseStoreContacts(value: unknown): StoreContact[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const contacts: StoreContact[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }

    const kindRaw = typeof entry.kind === "string" ? entry.kind : "";
    if (!isStoreContactKind(kindRaw)) {
      continue;
    }

    const id =
      typeof entry.id === "string" && entry.id.trim().length > 0
        ? entry.id.trim()
        : null;
    if (!id) {
      continue;
    }

    const contactValue =
      typeof entry.value === "string" ? entry.value.trim() : "";
    if (!contactValue) {
      continue;
    }

    const label =
      typeof entry.label === "string"
        ? entry.label.trim()
        : entry.label === null
          ? null
          : undefined;

    contacts.push({
      id,
      kind: kindRaw,
      value: contactValue,
      label: kindRaw === "custom" ? (label ?? "") : null,
    });
  }

  return contacts.slice(0, MAX_STORE_CONTACTS);
}

export function contactsToJson(contacts: StoreContact[]): Json {
  return contacts.map((contact) => ({
    id: contact.id,
    kind: contact.kind,
    value: contact.value,
    ...(contact.kind === "custom" && contact.label
      ? { label: contact.label }
      : {}),
  }));
}
