import { Category } from "../Category"

interface Product {
    id: string
    name: string
    price: number
    images: string[]
    categories: Category[]
}

export type { Product }