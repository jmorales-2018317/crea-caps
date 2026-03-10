"use client"

import { Product } from "@/services/Product"
import { ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ProductCard({ product }: { product: Product }) {
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
			<button
				type="button"
				className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 text-muted-foreground hover:text-primary"
				aria-label="Añadir a favoritos"
			>
				<ShoppingCartIcon className="size-4" />
			</button>
			<div className="px-3 py-2	">
				<p className="text-sm font-medium text-foreground">{product.name}</p>
				<p className="text-xs text-muted-foreground">Q{product.price}</p>
			</div>
		</Link>
	)
}
