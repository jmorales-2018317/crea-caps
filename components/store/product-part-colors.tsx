import {
  PRODUCT_PART_LABELS,
  getApplicableParts,
  resolvePartColor,
} from "@/schemas/products";
import type {
  ProductPart,
  PublishedProductDetail,
  PublishedProductPartColor,
} from "@/types/products";

type ProductPartColorsProps = {
  attributes: NonNullable<PublishedProductDetail["product_attributes"]>;
  partColors: PublishedProductPartColor[];
};

type DisplayRow = {
  part: ProductPart;
  name: string;
  hex: string;
};

function buildDisplayRows(
  attributes: NonNullable<PublishedProductDetail["product_attributes"]>,
  partColors: PublishedProductPartColor[],
): DisplayRow[] {
  const colorHexById: Record<string, string> = {};
  const colorNameById: Record<string, string> = {};
  const partColorIds: Partial<Record<ProductPart, string | null>> = {};

  for (const entry of partColors) {
    partColorIds[entry.part] = entry.color_id;
    if (entry.colors) {
      colorHexById[entry.colors.id] = entry.colors.hex_code;
      colorNameById[entry.colors.id] = entry.colors.name;
    }
  }

  const applicable = getApplicableParts(
    attributes.construction_type,
    attributes.has_strap,
  );

  const rows: DisplayRow[] = [];

  for (const part of applicable) {
    const hex = resolvePartColor(part, partColorIds, colorHexById);
    if (!hex) {
      continue;
    }

    const specificId = partColorIds[part];
    const generalId = partColorIds.all;
    const nameId =
      specificId && colorNameById[specificId]
        ? specificId
        : generalId && colorNameById[generalId]
          ? generalId
          : null;

    if (!nameId) {
      continue;
    }

    rows.push({
      part,
      name: colorNameById[nameId],
      hex,
    });
  }

  return rows;
}

export function ProductPartColors({
  attributes,
  partColors,
}: ProductPartColorsProps) {
  const rows = buildDisplayRows(attributes, partColors);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="product-colors-heading"
      className="space-y-4 border-t border-divider pt-6"
    >
      <div className="space-y-1">
        <h2
          id="product-colors-heading"
          className="text-sm font-semibold tracking-tight text-text-strong"
        >
          Colores por parte
        </h2>
        <p className="text-xs text-muted-foreground">
          Colores reales configurados en este producto.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <li
            key={row.part}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <span
              className="size-9 shrink-0 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: row.hex }}
              title={row.hex}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {PRODUCT_PART_LABELS[row.part]}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {row.name}
                <span className="sr-only">, color {row.hex}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
