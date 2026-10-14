import {
  CONSTRUCTION_LABELS,
  STRAP_LABELS,
  VISOR_LABELS,
} from "@/schemas/products";
import type { PublishedProductDetail } from "@/types/products";

type ProductAttributesProps = {
  attributes: NonNullable<PublishedProductDetail["product_attributes"]>;
};

function visorLabel(
  value: NonNullable<PublishedProductDetail["product_attributes"]>["visor_type"],
): string {
  switch (value) {
    case "curved":
      return "Visera curva";
    case "flat":
      return "Visera plana";
    default:
      return `Visera ${VISOR_LABELS[value].toLowerCase()}`;
  }
}

function constructionLabel(
  value: NonNullable<
    PublishedProductDetail["product_attributes"]
  >["construction_type"],
): string {
  switch (value) {
    case "mesh":
      return "Con malla";
    case "closed":
      return "Cerrada";
    case "mixed":
      return "Mixta";
    default:
      return CONSTRUCTION_LABELS[value];
  }
}

export function ProductAttributesSection({
  attributes,
}: ProductAttributesProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Tipo de visera", value: visorLabel(attributes.visor_type) },
    {
      label: "Construcción",
      value: constructionLabel(attributes.construction_type),
    },
    {
      label: "Tiene cincho",
      value: attributes.has_strap ? "Sí" : "No",
    },
  ];

  if (attributes.has_strap && attributes.strap_type) {
    rows.push({
      label: "Tipo de cincho",
      value: STRAP_LABELS[attributes.strap_type],
    });
  }

  rows.push({
    label: "Logo frontal",
    value: attributes.has_front_logo ? "Sí" : "No",
  });

  return (
    <section aria-labelledby="product-attributes-heading" className="space-y-5">
      <div className="space-y-1">
        <h2
          id="product-attributes-heading"
          className="text-balance text-xl font-semibold tracking-tight text-text-strong sm:text-2xl"
        >
          Características
        </h2>
        <p className="max-w-md text-sm text-text-secondary">
          Detalles físicos de esta gorra.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Características físicas del producto
          </caption>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-divider last:border-b-0"
              >
                <th
                  scope="row"
                  className="w-[40%] px-4 py-3 text-left font-medium text-text-secondary sm:w-56"
                >
                  {row.label}
                </th>
                <td className="px-4 py-3 text-foreground">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
