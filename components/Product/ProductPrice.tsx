"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ShoppingCart } from "lucide-react"
import { Product } from "@/services/Product"
import { Button } from "../ui/button"
import { getCartItems, getDiscountedPrice, handleAddToCart } from "@/util"
import { useRouter } from "next/navigation"

const iconSize = "size-3.5"

export function ProductPrice({ product }: { product: Product }) {
	const router = useRouter()
	const [quantity, setQuantity] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	const isOnCart = quantity > 0

	const handleButtonPress = () => {
		setIsLoading(true)
		if (isOnCart) {
			router.push("/carrito")
		} else {
			handleAddToCart({ product, setQuantity })
		}
		setIsLoading(false)
	}

	useEffect(() => {
		queueMicrotask(() => {
			const cartItem = getCartItems().find((item) => item.id === product.id)
			setQuantity(cartItem?.quantity ?? 0)
			setIsLoading(false)
		})
	}, [product.id])

	const buttonContent = isOnCart ? (
		<>
			Ir al carrito
			<ArrowRight className={iconSize} />
		</>
	) : (
		<>
			Añadir al carrito
			<ShoppingCart className={iconSize} />
		</>
	)

	const hasDiscounts = !!product.discounts?.length
	const priceWithDiscount = getDiscountedPrice(product.price, product.discounts)

	return (
		<section className="w-full px-4 space-y-2">
			<div className="w-full flex items-center justify-between">
				<div className="text-xs">
					<p className="text-[11px] text-gray-400">Precio total</p>
					<p className="text-lg font-semibold text-gray-900">Q{priceWithDiscount.toFixed(2)}</p>
					{hasDiscounts && (
						<p className="line-through text-muted-foreground text-xs">
							Q{product.price.toFixed(2)}
						</p>
					)}
				</div>
				<Button
					isLoading={isLoading}
					loadingLabel="Cargando"
					className="rounded-full text-sm px-6 h-10 gap-2 bg-black text-white"
					onClick={handleButtonPress}
				>
					{buttonContent}
				</Button>
			</div>
		</section>
	)
}
