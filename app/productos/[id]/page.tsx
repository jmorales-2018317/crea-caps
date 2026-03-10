import { ProductCard, ProductCarousel, ProductPrice } from "@/components/Product"
import { PLACEHOLDER_PRODUCTS } from "@/util/constants"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import GoBack from "@/components/go-back"

export default function ProductDetail() {
  const product = PLACEHOLDER_PRODUCTS[0]

  return (
    <div className="bg-background flex flex-col items-center justify-center space-y-5 pb-25">
      <section className="w-full bg-zinc-100 py-5 px-4 space-y-4">
        <div className="relative flex items-center justify-center">

          <h1 className="text-lg font-semibold text-gray-900">
            Modern Sofa Chair
          </h1>
          <GoBack />
        </div>
        <ProductCarousel products={PLACEHOLDER_PRODUCTS} />
      </section>
      <div className="px-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {PLACEHOLDER_PRODUCTS[0].categories.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-900">
          Detalles del producto
        </h2>
        <p className="text-xs leading-relaxed text-gray-500">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua
        </p>
      </div>

      <ProductPrice product={product} />

      <Separator />

      <section className="w-full px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">Productos relacionados</h2>
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
