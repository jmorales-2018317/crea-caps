"use client"

import { useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/components/Cart"
import { Spinner } from "@/components/ui/spinner"
import { useProductsByIds } from "@/hooks/api/useProductsByIds"
import { useCart } from "react-use-cart"
import { buildCartLines, getCartSubtotal, getCartTotal } from "@/util"

const DELIVERY_FEE = 25

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, isEmpty } = useCart()

  const cartIds = useMemo(
    () => items.map((i) => String(i.id)),
    [items]
  )

  const { data: products = [], isLoading } = useProductsByIds(cartIds)

  const lines = useMemo(() => buildCartLines(items, products), [items, products])

  const handleQuantityChange = useCallback(
    (id: string, delta: number) => {
      const current = items.find((i) => String(i.id) === id)?.quantity ?? 1
      updateItemQuantity(id, Math.max(1, current + delta))
    },
    [items, updateItemQuantity]
  )

  if (isLoading) {
    return (
      <div className="w-full flex gap-2 items-center justify-center py-10">
        <Spinner className="size-5" />
        <p className="text-sm text-muted-foreground">Cargando carrito...</p>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="w-full flex gap-2 items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
      </div>
    )
  }

  const subtotal = getCartSubtotal(lines)
  const grandTotal = getCartTotal({
    lines,
    deliveryFee: DELIVERY_FEE,
  })

  return (
    <div className="w-full">
      <div className="divide-y divide-border space-y-4">
        {products.map((item) => (
          <CartItem
            key={item.id}
            product={item}
            quantity={items.find((i) => String(i.id) === item.id)?.quantity ?? 0}
            updateItemQuantity={handleQuantityChange}
            removeItem={removeItem}
          />
        ))}
      </div>

      <div className="sticky bottom-20 flex flex-col gap-4 border-t border-border bg-background mt-4 pt-4 pb-6">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sub-Total</span>
            <span className="font-semibold text-foreground">
              Q{subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-semibold text-foreground">
              Q{DELIVERY_FEE.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-dashed border-border pt-3" />

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-semibold text-foreground">
                Q{grandTotal.toFixed(2)}
              </span>
            </div>

            <Button size="xl" className="font-medium px-5">
              Ir a caja
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
