import type { Product } from "@/services/Product"
import { getDiscountedPrice } from "./discounts"

export function getCartUnitPrice(product: Product): number {
  return getDiscountedPrice(product.price, product.discounts)
}

export function getCartLineSubtotal(product: Product, quantity: number): number {
  const q = Math.max(0, quantity)
  return getCartUnitPrice(product) * q
}

export function getCartLineSavings(product: Product, quantity: number): number {
  const q = Math.max(0, quantity)
  const raw = product.price * q
  const discounted = getCartLineSubtotal(product, quantity)
  return Math.max(0, raw - discounted)
}

export type CartLine = {
  product: Product
  quantity: number
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((acc, line) => acc + getCartLineSubtotal(line.product, line.quantity), 0)
}

export function getCartDiscountSavings(lines: CartLine[]): number {
  return lines.reduce((acc, line) => acc + getCartLineSavings(line.product, line.quantity), 0)
}

export function getCartTotal({
  lines,
  deliveryFee = 0,
  orderDiscount = 0,
}: {
  lines: CartLine[]
  deliveryFee?: number
  orderDiscount?: number
}): number {
  const subtotal = getCartSubtotal(lines)
  return Math.max(0, subtotal + deliveryFee - orderDiscount)
}

export function buildCartLines(
  cartItems: { id: string | number; quantity?: number }[],
  products: Product[]
): CartLine[] {
  const byId = Object.fromEntries(products.map((p) => [p.id, p]))
  return cartItems
    .map((entry) => {
      const id = String(entry.id)
      const product = byId[id]
      if (!product) return null
      const quantity = Math.max(0, entry.quantity ?? 0)
      return { product, quantity } satisfies CartLine
    })
    .filter((line): line is CartLine => line !== null)
}
