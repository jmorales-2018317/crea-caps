export const queryKeys = {
  categories: ["categories"] as const,
  products: ["products"] as const,
  productsOnSale: ["products", "on-sale"] as const,
  productsByIds: (ids: string[]) => ["products", "by-ids", [...ids].sort()] as const,
  product: (id: string) => ["product", id] as const,
  search: (query: string, filters: unknown) =>
    ["search", query, filters] as const,
}
