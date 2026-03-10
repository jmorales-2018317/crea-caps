enum DiscountType {
    PERCENTAGE = "percentage",
    FIXED = "fixed",
}

interface Discount {
    id: string
    name: string
    value: number
    type: DiscountType
    startDate: Date
    endDate: Date
}

export { type Discount, DiscountType }