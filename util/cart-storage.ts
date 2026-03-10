import { Product } from "@/services/Product"
import { toast } from "sonner"

const CART_STORAGE_KEY = "crea-caps:cart:v1"

export type StoredCartItem = {
  id: string
  quantity: number
}

export type CartItemInput = {
  id: string
  quantity?: number
}

function safeParse(raw: string | null): StoredCartItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as unknown[])
      .filter((x): x is { id?: unknown; quantity?: unknown } => !!x && typeof x === "object")
      .map((x) => ({
        id: String(x.id ?? ""),
        quantity: Math.max(0, Number(x.quantity ?? 0)),
      }))
      .filter((x) => x.id && x.quantity > 0)
  } catch {
    return []
  }
}

export function getCartItems(): StoredCartItem[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(CART_STORAGE_KEY))
}

export function setCartItems(items: StoredCartItem[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export function addCartItem(input: CartItemInput) {
  const quantityToAdd = Math.max(1, input.quantity ?? 1)
  const prev = getCartItems()
  const existing = prev.find((p) => p.id === input.id)
  if (existing) {
    const next = prev.map((p) =>
      p.id === input.id
        ? { ...p, quantity: p.quantity + quantityToAdd }
        : p
    )
    setCartItems(next)
    return next
  }

  const next: StoredCartItem[] = [
    ...prev,
    {
      id: input.id,
      quantity: quantityToAdd,
    },
  ]

  setCartItems(next)
  return next
}

export function changeCartItemQuantity(
  id: string,
  delta: number
): StoredCartItem[] {
  const prev = getCartItems()
  const next = prev
    .map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
    .filter((item) => item.quantity > 0)

  setCartItems(next)
  return next
}

export function removeCartItem(id: string): StoredCartItem[] {
  const prev = getCartItems()
  const next = prev.filter((item) => item.id !== id)
  setCartItems(next)
  return next
}

export const handleAddToCart = ({
  product,
  setQuantity,
}: {
  product: Product
  setQuantity: (quantity: number) => void
}) => {
  addCartItem({
    id: product.id,
    quantity: 1,
  })
  setQuantity(1);
  toast.success("Producto agregado al carrito", {
    action: {
      label: "Deshacer",
      onClick: () => {
        removeCartItem(product.id)
        setQuantity(0)
        toast.success("Se removió el producto del carrito");
      },
    },
  });
};



export const handleRemoveFromCart = ({
  product,
  setQuantity,
}: {
  product: Product
  setQuantity: (quantity: number) => void
}) => {
  removeCartItem(product.id)
  setQuantity(0)
  toast.success("Producto removido del carrito", {
    action: {
      label: "Deshacer",
      onClick: () => {
        addCartItem({
          id: product.id,
          quantity: 1,
        })
        setQuantity(1)
        toast.success("Producto agregado nuevamente al carrito");
      },
    },
  });
};
