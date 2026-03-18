"use client"

import { useEffect, useState } from "react"
import { Product } from "@/services/Product"
import { ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { getCartItems, handleAddToCart, handleRemoveFromCart, getDiscountedPrice } from "@/util"
import { Skeleton } from "../ui/skeleton"
import { DiscountBadge } from "../Discounts"

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

	const hasDiscounts = !!product.discounts?.length
	const priceWithDiscount = getDiscountedPrice(product.price, product.discounts)


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
			{hasDiscounts && (
				<DiscountBadge />
			)}
			<div className="flex flex-col gap-1 p-3">
				<p className="text-sm text-foreground line-clamp-2">{product.name}</p>
				<div className="flex items-center gap-2">
					<p className="text-sm font-semibold text-foreground">
						Q{priceWithDiscount.toFixed(2)}
					</p>
					{hasDiscounts && (
						<p className="line-through text-muted-foreground text-xs">
							Q{product.price.toFixed(2)}
						</p>
					)}
				</div>
				<Button
					size="lg"
					disabled={isLoading}
					className="w-full gap-2 mt-2"
					onClick={handleToggleCart}
				>
					<ShoppingCartIcon className="size-4" />
					{isInCart ? "Remover" : "Agregar"}
				</Button>
			</div>
		</Link>
	)
}

export function ProductCardSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="aspect-square w-full rounded-lg" />
			<Skeleton className="h-5 w-3/4 mt-1" />
			<Skeleton className="h-5 w-1/2" />
			<Skeleton className="h-6 w-full mt-1" />
		</div>
	)
}
