import { z } from "zod";
import {
  MAX_STORE_CONTACTS,
  STORE_CONTACT_DIRECT_KINDS,
  STORE_CONTACT_SOCIAL_KINDS,
  contactValueShape,
  contactsToJson,
  mergeStoreContacts,
  normalizeHttpUrl,
  normalizePhoneDigits,
  type StoreContact,
  type StoreContactDirectKind,
  type StoreContactSocialKind,
  type StoreDirectContact,
  type StoreSocialsFormValues,
} from "@/lib/store-contacts";

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : ""));

const storeContactDirectKindSchema = z.enum(STORE_CONTACT_DIRECT_KINDS);

function refineContactValue(
  kind: StoreContactDirectKind | StoreContactSocialKind,
  value: string,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  const shape = contactValueShape(kind);

  if (shape === "email") {
    if (!z.string().email().safeParse(value).success) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Ingresa un correo electrónico válido.",
      });
    }
    return;
  }

  if (shape === "phone") {
    const digits = normalizePhoneDigits(value);
    if (digits.length < 8 || digits.length > 15) {
      ctx.addIssue({
        code: "custom",
        path,
        message:
          kind === "whatsapp"
            ? "Ingresa un número de WhatsApp válido (8–15 dígitos)."
            : "Ingresa un teléfono válido (8–15 dígitos).",
      });
    }
    return;
  }

  if (!normalizeHttpUrl(value)) {
    ctx.addIssue({
      code: "custom",
      path,
      message: "Ingresa una URL válida.",
    });
  }
}

const storeContactFormSchema = z
  .object({
    id: z.string().min(1),
    kind: storeContactDirectKindSchema,
    value: z.string(),
    label: z.string().optional().nullable(),
  })
  .superRefine((contact, ctx) => {
    const value = contact.value.trim();
    if (!value) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "El valor es obligatorio.",
      });
      return;
    }

    if (contact.kind === "custom") {
      const label = contact.label?.trim() ?? "";
      if (!label) {
        ctx.addIssue({
          code: "custom",
          path: ["label"],
          message: "El nombre del enlace es obligatorio.",
        });
      }
    }

    refineContactValue(contact.kind, value, ctx, ["value"]);
  });

const storeSocialFieldSchema = z.object({
  id: z.string().min(1),
  value: z.string(),
});

const storeSocialsFormSchema = z
  .object({
    whatsapp: storeSocialFieldSchema,
    instagram: storeSocialFieldSchema,
    facebook: storeSocialFieldSchema,
    tiktok: storeSocialFieldSchema,
    youtube: storeSocialFieldSchema,
  })
  .superRefine((socials, ctx) => {
    for (const kind of STORE_CONTACT_SOCIAL_KINDS) {
      const value = socials[kind].value.trim();
      if (!value) {
        continue;
      }
      refineContactValue(kind, value, ctx, [kind, "value"]);
    }
  });

export const storeSettingsFormSchema = z
  .object({
    store_name: z
      .string()
      .trim()
      .min(1, "El nombre de la tienda es obligatorio.")
      .max(120, "El nombre no puede superar 120 caracteres."),
    description: optionalTrimmed.pipe(
      z.string().max(500, "La descripción no puede superar 500 caracteres."),
    ),
    socials: storeSocialsFormSchema,
    contacts: z.array(storeContactFormSchema).max(
      MAX_STORE_CONTACTS,
      `Puedes añadir hasta ${MAX_STORE_CONTACTS} contactos.`,
    ),
  })
  .superRefine((values, ctx) => {
    const socialCount = STORE_CONTACT_SOCIAL_KINDS.filter(
      (kind) => values.socials[kind].value.trim().length > 0,
    ).length;

    if (socialCount + values.contacts.length > MAX_STORE_CONTACTS) {
      ctx.addIssue({
        code: "custom",
        path: ["contacts"],
        message: `En total puedes tener hasta ${MAX_STORE_CONTACTS} canales entre redes y contacto.`,
      });
    }
  });

export type StoreSettingsFormValues = z.infer<typeof storeSettingsFormSchema>;

function normalizeContactValue(contact: StoreContact): string {
  const shape = contactValueShape(contact.kind);
  const trimmed = contact.value.trim();

  if (shape === "phone") {
    return normalizePhoneDigits(trimmed);
  }

  if (shape === "url") {
    return normalizeHttpUrl(trimmed) ?? trimmed;
  }

  return trimmed;
}

export function toStoreSettingsPayload(values: StoreSettingsFormValues) {
  const socials: StoreSocialsFormValues = values.socials;
  const directContacts: StoreDirectContact[] = values.contacts.map(
    (contact) => ({
      id: contact.id,
      kind: contact.kind,
      value: contact.value,
      label:
        contact.kind === "custom" ? (contact.label?.trim() ?? "") : null,
    }),
  );

  const contacts = mergeStoreContacts(socials, directContacts).map(
    (contact) => ({
      ...contact,
      value: normalizeContactValue(contact),
    }),
  );

  return {
    store_name: values.store_name,
    description:
      values.description.length > 0 ? values.description : null,
    contacts: contactsToJson(contacts),
  };
}
