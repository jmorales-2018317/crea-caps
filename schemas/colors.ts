import { z } from "zod";

export const HEX_CODE_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const colorFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  hex_code: z
    .string()
    .trim()
    .regex(HEX_CODE_REGEX, "Usa un color hexadecimal válido (#RRGGBB)."),
  is_active: z.boolean(),
});

export type ColorFormValues = z.infer<typeof colorFormSchema>;

export function toColorPayload(values: ColorFormValues) {
  return {
    name: values.name,
    hex_code: values.hex_code.toUpperCase(),
    is_active: values.is_active,
  };
}
