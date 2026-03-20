"use client"

import { ShoppingCart } from "lucide-react"
import { DiscountDescription } from "@/components/Discounts"
import { Product } from "@/services/Product"
import { Button } from "../ui/button"
import { getDiscountedPrice } from "@/util"
import { useCart } from "react-use-cart"
import { toast } from "sonner"

export function ProductPrice({ product }: { product: Product }) {
	const { addItem } = useCart()

	const handleButtonPress = () => {
		addItem({ id: product.id, price: product.price }, 1)
		toast.success("Producto agregado al carrito", {
			action: {
				label: "Ver carrito",
				onClick: () => {
					window.location.href = "/carrito"
				},
			},
		})
	}

	const hasDiscounts = !!product.discounts?.length
	const priceWithDiscount = getDiscountedPrice(product.price, product.discounts)
	return (
		<section className="w-full px-4 space-y-2">
			<div className="w-full flex items-end justify-between">
				<div className="text-xs">
					<p className="text-[11px] text-gray-400 mb-1">Precio total</p>
					{hasDiscounts && (
						<p className="line-through text-muted-foreground text-xs">
							Q{product.price.toFixed(2)}
						</p>
					)}
					<p className="text-lg font-semibold text-gray-900">Q{priceWithDiscount.toFixed(2)}</p>
				</div>
				<Button
					loadingLabel="Cargando"
					className="rounded-full text-sm px-6 h-10 gap-2"
					onClick={handleButtonPress}
				>
					<ShoppingCart className="size-3.5" />
					Añadir al carrito
				</Button>
			</div>
			{hasDiscounts && (
				<DiscountDescription discounts={product.discounts ?? []} />
			)}
		</section>
	)
}
