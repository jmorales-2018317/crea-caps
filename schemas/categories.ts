import { z } from "zod";
import { isLucideIconName } from "@/lib/category-icons";
import { SLUG_REGEX, slugifyName } from "@/lib/slug";

export { SLUG_REGEX };
export const ICON_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  code: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .regex(
      SLUG_REGEX,
      "Usa solo minúsculas, números y guiones (ej. gorras-snapback).",
    ),
  description: z.string().trim().optional(),
  icon: z
    .string()
    .nullable()
    .refine(
      (value) => {
        if (value === null || value.trim().length === 0) {
          return true;
        }
        const trimmed = value.trim();
        return ICON_NAME_REGEX.test(trimmed) && isLucideIconName(trimmed);
      },
      "Selecciona un icono válido de Lucide.",
    ),
  is_active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function toCategoryPayload(values: CategoryFormValues) {
  const icon = values.icon?.trim() ?? "";

  return {
    name: values.name,
    code: values.code,
    description:
      values.description && values.description.length > 0
        ? values.description
        : null,
    icon: icon.length > 0 ? icon : null,
    is_active: values.is_active,
  };
}

/** Generates a category code from the display name. */
export function codeifyCategoryName(name: string): string {
  return slugifyName(name);
}
