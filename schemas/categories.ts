import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .regex(
      SLUG_REGEX,
      "Usa solo minúsculas, números y guiones (ej. gorras-snapback).",
    ),
  description: z.string().trim().optional(),
  is_active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function toCategoryPayload(values: CategoryFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description:
      values.description && values.description.length > 0
        ? values.description
        : null,
    is_active: values.is_active,
  };
}

export function slugifyCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
