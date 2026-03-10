"use client"

import { useEffect, useState } from "react"
import { Product } from "@/services/Product"
import { ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { getCartItems, handleAddToCart, handleRemoveFromCart } from "@/util"
import { cn } from "@/lib/utils"

export function ProductCard({ product }: { product: Product }) {
	const [isInCart, setIsInCart] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		queueMicrotask(() => {
			const cartItem = getCartItems().find((item) => item.id === product.id)
			setIsInCart(!!cartItem)
			setIsLoading(false)
		})
	}, [product.id])

	const handleToggleCart = (event: React.MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()

		setIsLoading(true)
		if (isInCart) {
			handleRemoveFromCart({
				product,
				setQuantity: () => setIsInCart(false),
			})
		} else {
			handleAddToCart({
				product,
				setQuantity: () => setIsInCart(true),
			})
		}
		setIsLoading(false)
	}

	return (
		<Link href={`/productos/${product.id}`} className="group relative overflow-hidden rounded-xl border border-border bg-card">
			<div className="relative aspect-square bg-muted/50">
				<Image
					src={product.images[0]}
					alt={product.name}
					fill
					className="object-contain"
				/>
			</div>
			<Button
				variant="outline"
				size="icon-lg"
				disabled={isLoading}
				className={cn("absolute z-index-2 right-2 top-2 rounded-lg bg-card/80 p-1.5 hover:text-primary", isInCart && "text-primary border-primary")}
				onClick={handleToggleCart}
			>
				<ShoppingCartIcon className="size-4" />
			</Button>
			<div className="px-3 py-2	">
				<p className="text-sm font-medium text-foreground">{product.name}</p>
				<p className="text-xs text-muted-foreground">Q{product.price}</p>
			</div>
		</Link>
	)
}
