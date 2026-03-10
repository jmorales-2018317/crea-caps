"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import CartItem, { type CartItemData } from "@/components/Cart/cart-item"
import { getCartItems, changeCartItemQuantity, removeCartItem, type StoredCartItem } from "@/util"
import { PLACEHOLDER_PRODUCTS } from "@/util/constants"
import type { Product } from "@/services/Product"
import { Spinner } from "@/components/ui/spinner"

const productIndex: Record<string, Product> = Object.fromEntries(
  PLACEHOLDER_PRODUCTS.map((p) => [p.id, p])
)

function hydrateCartItems(snapshot: StoredCartItem[]): CartItemData[] {
  return snapshot
    .map((entry) => {
      const product = productIndex[entry.id]
      if (!product) return null
      return {
        id: product.id,
        name: product.name,
        categories: product.categories ?? [],
        price: product.price,
        image: product.images?.[0] ?? "",
        quantity: entry.quantity,
      } satisfies CartItemData
    })
    .filter((item): item is CartItemData => item !== null)
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    queueMicrotask(() => {
      const snapshot = getCartItems()
      setItems(hydrateCartItems(snapshot))
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-10rem)] flex gap-2 items-center justify-center">
        <Spinner className="size-5" />
        <p className="text-sm text-muted-foreground">Cargando carrito...</p>
      </div>
    )
  }

  const handleQuantityChange = (id: string, delta: number) => {
    const snapshot = changeCartItemQuantity(id, delta)
    setItems(hydrateCartItems(snapshot))
  }

  const handleRemove = (id: string) => {
    const snapshot = removeCartItem(id)
    setItems(hydrateCartItems(snapshot))
  }

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const deliveryFee = items.length > 0 ? 25 : 0
  const discount = items.length > 0 ? 35 : 0
  const totalCost = Math.max(0, subtotal + deliveryFee - discount)

  return (
    <div className="w-full">

      <div className="divide-y divide-border">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
        ))}
      </div>

      {
        items.length > 0 && (
          <div className="sticky bottom-20 flex flex-col gap-4 border-t border-border bg-background p-4 pb-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sub-Total</span>
                <span className="font-semibold text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-semibold text-foreground">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span className="font-semibold text-foreground">
                  -${discount.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-dashed border-border pt-3" />

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold text-foreground">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="h-10 px-6 rounded-full text-base font-semibold bg-black"
                >
                  Ir a caja
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {
        items.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground px-4">
            Tu carrito está vacío.
          </p>
        )
      }
    </div>
  )
}
