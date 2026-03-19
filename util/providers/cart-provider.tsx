"use client"

import { CartProvider as ReactUseCartProvider } from "react-use-cart"
import { ReactNode } from "react"

export default function CartProvider({ children }: { children: ReactNode }) {
  return (
    <ReactUseCartProvider id="crea-caps:cart:v1">
      {children}
    </ReactUseCartProvider>
  )
}
