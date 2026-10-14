const gtqFormatter = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

/** Formats a product price in Guatemalan quetzales. */
export function formatGtq(price: number | string): string {
  return gtqFormatter.format(toPriceNumber(price));
}

/** Coerces DB/RPC numeric values (number or string) to a finite number. */
export function toPriceNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
