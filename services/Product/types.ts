import { Category } from "../Category"

interface Product {
    id: string
    name: string
    price: number
    images: string[]
    category: Category[]
}

export type { Product }