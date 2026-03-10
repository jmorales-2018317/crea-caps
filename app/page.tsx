import Link from "next/link"

import { CategoryItem } from "@/components/Category"
import { HomeBannersSlider } from "@/components/Home"
import { ProductCard } from "@/components/Product"
import { CATEGORIES, PLACEHOLDER_PRODUCTS } from "@/util/constants"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main className="bg-background pb-24">
      <Navbar />
      <div className="min-h-screen bg-background space-y-5 pt-5">
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
    </main>
  )
}

