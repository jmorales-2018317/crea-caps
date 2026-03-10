enum SortEnum {
    RECENT = "recent",
    POPULAR = "popular",
}

interface SearchFilters {
    categoryId: string | null
    priceMin: number
    priceMax: number
    sort: SortEnum
}

export { type SearchFilters, SortEnum }