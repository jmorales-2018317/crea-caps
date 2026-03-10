import { CartPage } from "@/components/Cart"
import GoBack from "@/components/go-back"

export default function CartRoutePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="w-full py-5 px-4 space-y-4">
        <div className="relative flex items-center justify-center">

          <h1 className="text-lg font-semibold text-gray-900">
            Mi carrito
          </h1>
          <GoBack />
        </div>
      </section>
      <CartPage />
    </div>
  )
}
