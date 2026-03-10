"use client"

import { Product } from "@/services/Product"
import { ShoppingCartIcon } from "lucide-react"
import Image from "next/image"

export function ProductCard({ product }: { product: Product }) {
	return (
		<div className="group relative overflow-hidden rounded-xl border border-border bg-card">
			<div className="relative aspect-square bg-muted/50">
				<Image
					src={product.image}
					alt={product.name}
					fill
					className="object-cover"
				/>
			</div>
			<button
				type="button"
				className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 text-muted-foreground hover:text-primary"
				aria-label="Añadir a favoritos"
			>
				<ShoppingCartIcon className="size-4" />
			</button>
			<div className="px-3 py-2	">
				<p className="text-sm font-medium text-foreground">{product.name}</p>
				<p className="text-xs text-muted-foreground">Precio —</p>
			</div>
		</div>
	)
}
