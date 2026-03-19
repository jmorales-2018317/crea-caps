"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import CartItem, { type CartItemData } from "@/components/Cart/cart-item"
import { getCartItems, changeCartItemQuantity, removeCartItem, type StoredCartItem } from "@/util"
import type { Product } from "@/services/Product"
import { Spinner } from "@/components/ui/spinner"
import { useProductsByIds } from "@/hooks/api/useProductsByIds"

function hydrateCartItems(
  snapshot: StoredCartItem[],
  productIndex: Record<string, Product>
): CartItemData[] {
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

function getInitialCartSnapshot(): StoredCartItem[] {
  if (typeof window === "undefined") return []
  return getCartItems()
}

export default function CartPage() {
  const [cartSnapshot, setCartSnapshot] = useState<StoredCartItem[]>(getInitialCartSnapshot)

  const cartIds = useMemo(
    () => cartSnapshot.map((s) => s.id),
    [cartSnapshot]
  )
  const { data: products = [], isLoading: productsLoading } = useProductsByIds(cartIds)
  const productIndex = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  )
  const items = useMemo(
    () => hydrateCartItems(cartSnapshot, productIndex),
    [cartSnapshot, productIndex]
  )

  const isLoading = cartIds.length > 0 && productsLoading

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-10rem)] flex gap-2 items-center justify-center">
        <Spinner className="size-5" />
        <p className="text-sm text-muted-foreground">Cargando carrito...</p>
      </div>
    )
  }

  const handleQuantityChange = (id: string, delta: number) => {
    setCartSnapshot(changeCartItemQuantity(id, delta))
  }

  const handleRemove = (id: string) => {
    setCartSnapshot(removeCartItem(id))
  }

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const deliveryFee = items.length > 0 ? 25 : 0
  const discount = items.length > 0 ? 35 : 0
  const totalCost = Math.max(0, subtotal + deliveryFee - discount)

  if (items.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-10rem)] flex gap-2 items-center justify-center">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="divide-y divide-border space-y-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
        ))}
      </div>

      <div className="sticky bottom-20 flex flex-col gap-4 border-t border-border bg-background mt-4 pt-4 pb-6">
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

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-semibold text-foreground">
                ${totalCost.toFixed(2)}
              </span>
            </div>

            <Button
              size="xl"
              className="font-semibold rounded-xl px-4"
            >
              Ir a caja
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
