import { z } from "zod";
import { SLUG_REGEX, slugifyCategoryName } from "@/schemas/categories";
import type { ConstructionType, ProductPart, SaveAdminProductPayload } from "@/types/products";

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export const VISOR_TYPES = ["curved", "flat", "other"] as const;
export const CONSTRUCTION_TYPES = ["mesh", "closed", "mixed"] as const;
export const STRAP_TYPES = [
  "snapback",
  "velcro",
  "buckle",
  "fabric",
  "other",
] as const;

export const PRODUCT_PARTS = [
  "all",
  "crown",
  "front_panel",
  "side_panels",
  "back_panels",
  "visor",
  "mesh",
  "strap",
  "button",
] as const;

export const PRODUCT_PART_LABELS: Record<(typeof PRODUCT_PARTS)[number], string> =
  {
    all: "Color general",
    crown: "Corona",
    front_panel: "Panel frontal",
    side_panels: "Paneles laterales",
    back_panels: "Paneles posteriores",
    visor: "Visera",
    mesh: "Malla",
    strap: "Cincho",
    button: "Botón superior",
  };

export const STATUS_LABELS: Record<(typeof PRODUCT_STATUSES)[number], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export const VISOR_LABELS: Record<(typeof VISOR_TYPES)[number], string> = {
  curved: "Curva",
  flat: "Plana",
  other: "Otra",
};

export const CONSTRUCTION_LABELS: Record<
  (typeof CONSTRUCTION_TYPES)[number],
  string
> = {
  mesh: "Malla",
  closed: "Cerrada",
  mixed: "Mixta",
};

export const STRAP_LABELS: Record<(typeof STRAP_TYPES)[number], string> = {
  snapback: "Snapback",
  velcro: "Velcro",
  buckle: "Hebilla",
  fabric: "Tela",
  other: "Otro",
};

const ALWAYS_PARTS: ProductPart[] = [
  "all",
  "crown",
  "front_panel",
  "side_panels",
  "back_panels",
  "visor",
  "button",
];

export function getApplicableParts(
  constructionType: ConstructionType,
  hasStrap: boolean,
): ProductPart[] {
  const parts = [...ALWAYS_PARTS];
  if (constructionType === "mesh" || constructionType === "mixed") {
    parts.push("mesh");
  }
  if (hasStrap) {
    parts.push("strap");
  }
  return parts;
}

/** Resuelve el hex visible: color de parte > color general. Sin fallback hardcodeado. */
export function resolvePartColor(
  part: ProductPart,
  partColors: Partial<Record<ProductPart, string | null | undefined>>,
  colorHexById: Record<string, string>,
): string | null {
  const specificId = partColors[part];
  if (specificId && colorHexById[specificId]) {
    return colorHexById[specificId];
  }
  if (part !== "all") {
    const generalId = partColors.all;
    if (generalId && colorHexById[generalId]) {
      return colorHexById[generalId];
    }
  }
  return null;
}

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(160, "El nombre no puede superar 160 caracteres."),
    slug: z
      .string()
      .trim()
      .min(1, "El slug es obligatorio.")
      .regex(
        SLUG_REGEX,
        "Usa solo minúsculas, números y guiones (ej. gorra-mesh-curved).",
      ),
    sku: z.string().trim().optional(),
    description: z.string().trim().optional(),
    status: z.enum(PRODUCT_STATUSES),
    is_featured: z.boolean(),
    category_ids: z.array(z.string().uuid()),
    visor_type: z.enum(VISOR_TYPES),
    construction_type: z.enum(CONSTRUCTION_TYPES),
    has_strap: z.boolean(),
    strap_type: z.enum(STRAP_TYPES).nullable(),
    has_front_logo: z.boolean(),
    part_colors: z.record(z.enum(PRODUCT_PARTS), z.string().uuid().nullable()),
  })
  .superRefine((values, ctx) => {
    if (values.has_strap) {
      if (!values.strap_type) {
        ctx.addIssue({
          code: "custom",
          path: ["strap_type"],
          message: "Selecciona el tipo de cincho.",
        });
      }
    } else if (values.strap_type !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["strap_type"],
        message: "El tipo de cincho debe quedar vacío si no hay cincho.",
      });
    }

    const applicable = new Set(
      getApplicableParts(values.construction_type, values.has_strap),
    );
    for (const [part, colorId] of Object.entries(values.part_colors)) {
      if (colorId && !applicable.has(part as ProductPart)) {
        ctx.addIssue({
          code: "custom",
          path: ["part_colors", part],
          message: "Esta parte no aplica a la configuración actual.",
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function emptyPartColors(): ProductFormValues["part_colors"] {
  return Object.fromEntries(
    PRODUCT_PARTS.map((part) => [part, null]),
  ) as ProductFormValues["part_colors"];
}

export function defaultProductFormValues(): ProductFormValues {
  return {
    name: "",
    slug: "",
    sku: "",
    description: "",
    status: "published",
    is_featured: false,
    category_ids: [],
    visor_type: "curved",
    construction_type: "closed",
    has_strap: true,
    strap_type: "snapback",
    has_front_logo: false,
    part_colors: emptyPartColors(),
  };
}

export function toSaveAdminProductPayload(
  values: ProductFormValues,
  id?: string | null,
): SaveAdminProductPayload {
  const applicable = getApplicableParts(
    values.construction_type,
    values.has_strap,
  );

  const part_colors = applicable
    .map((part) => {
      const colorId = values.part_colors[part];
      if (!colorId) {
        return null;
      }
      return { part, color_id: colorId };
    })
    .filter((row): row is { part: ProductPart; color_id: string } =>
      Boolean(row),
    );

  return {
    id: id ?? null,
    name: values.name,
    slug: values.slug,
    sku: values.sku && values.sku.length > 0 ? values.sku : null,
    description:
      values.description && values.description.length > 0
        ? values.description
        : null,
    status: values.status,
    is_featured: values.is_featured,
    category_ids: values.category_ids,
    attributes: {
      visor_type: values.visor_type,
      construction_type: values.construction_type,
      has_strap: values.has_strap,
      strap_type: values.has_strap ? values.strap_type : null,
      has_front_logo: values.has_front_logo,
    },
    part_colors,
  };
}

export const slugifyProductName = slugifyCategoryName;
