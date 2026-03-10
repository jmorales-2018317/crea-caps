import { Category } from "../Category"
import { Discount } from "../Discounts/types"

interface Product {
    id: string
    name: string
    price: number
    images: string[]
    categories: Category[]
    discounts?: Discount[]
}

export type { Product }