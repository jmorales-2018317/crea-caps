"use client"

import Link from "next/link"

import { CategoryItem } from "@/components/Category"
import { HomeBannersSlider } from "@/components/Home"
import { ProductCard } from "@/components/Product"
import type { Category } from "@/services/Category"
import type { Product } from "@/services/Product"

const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Producto 1",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Producto 2",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Producto 3",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3e74?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Producto 4",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
  },
]

const CATEGORIES: Category[] = [
  { id: "ropa", label: "Ropa", href: "/productos?cat=ropa", icon: "ShirtIcon" },
  {
    id: "electronica",
    label: "Electrónica",
    href: "/productos?cat=electronica",
    icon: "LaptopIcon",
  },
  {
    id: "zapatos",
    label: "Zapatos",
    href: "/productos?cat=zapatos",
    icon: "FootprintsIcon",
  },
  {
    id: "relojes",
    label: "Relojes",
    href: "/productos?cat=relojes",
    icon: "",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background space-y-5 py-5">
      <HomeBannersSlider />
      <section className="px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Categorías</h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="flex justify-between gap-2">
          {CATEGORIES.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </section>
      <section className="px-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">Productos</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

