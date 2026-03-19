"use client"

import { Product } from "@/services/Product"
import { ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { getDiscountedPrice } from "@/util"
import { Skeleton } from "../ui/skeleton"
import { DiscountBadge } from "../Discounts"
import { useCart } from "react-use-cart"
import { toast } from "sonner"

export function ProductCard({ product }: { product: Product }) {
	const { addItem } = useCart()

	const handleToggleCart = (event: React.MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()
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

	const hasDiscounts = !!product.discounts && product.discounts.length > 0
	const priceWithDiscount = getDiscountedPrice(product.price, product.discounts)


	return (
		<Link href={`/productos/${product.id}`} className="group relative overflow-hidden rounded-xl border border-border bg-card">
			<div className="relative aspect-square">
				<Image
					src={product.images[0]}
					alt={product.name}
					fill
					className="object-contain"
				/>
			</div>
			{hasDiscounts && (
				<DiscountBadge
					discounts={product.discounts}
				/>
			)}
			<div className="flex flex-col p-3 gap-2">
				<p className="text-sm text-foreground line-clamp-2">{product.name}</p>
				<div className="flex justify-between gap-2 items-end">
					<div className="flex flex-col">
						{hasDiscounts && (
							<p className="line-through text-muted-foreground text-xs">
								Q{product.price.toFixed(2)}
							</p>
						)}
						<p className="text-lg font-semibold text-foreground">
							Q{priceWithDiscount.toFixed(2)}
						</p>
					</div>
					<Button
						onClick={handleToggleCart}
						className="size-9"
					>
						<ShoppingCartIcon className="size-4" />
					</Button>
				</div>
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
