import { XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../ui/dialog"
import Image from "next/image"
import Link from "next/link"
import CartItemStockButtons from "./cart-item-stock-buttons"
import { Product } from "@/services/Product"
import { getDiscountedPrice } from "@/util"
import { DiscountsBadgesList } from "../Discounts/DiscountBadge"

export default function CartItem({
	product,
	quantity,
	updateItemQuantity,
	removeItem,
}: {
	product: Product
	quantity: number
	updateItemQuantity: (id: string, delta: number) => void
	removeItem: (productId: string) => void
}) {
	const hasDiscounts = !!product.discounts && product.discounts.length > 0
	const priceWithDiscount = getDiscountedPrice(product.price, product.discounts)

	return (
		<div className="flex gap-2 border-b border-border last:border-0 items-center">
			<Dialog>
				<DialogTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="shrink-0"
						aria-label="Eliminar producto"
					>
						<XIcon className="size-4" />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold text-foreground">Eliminar producto</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground">
							¿Estás seguro de que deseas eliminar este producto del carrito?
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<DialogClose asChild>
							<Button variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<DialogClose asChild>
							<Button
								variant="destructive"
								onClick={() => removeItem(product.id)}
							>
								Eliminar
							</Button>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>
			<Link
				href={`/productos/${product.id}`}
				className="flex min-w-0 flex-1 gap-2"
			>
				<div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted/50">
					<Image
						src={product.images[0]}
						alt={product.name}
						fill
						sizes="80px"
						className="object-contain"
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-between gap-1 py-1">
					<h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
					<div className="flex flex-col">
						{hasDiscounts && (
							<div className="flex items-center gap-1">
								<p className="line-through text-muted-foreground text-xs">
									Q{product.price.toFixed(2)}
								</p>
								<DiscountsBadgesList discounts={product.discounts ?? []} />
							</div>
						)}
						<p className="text-base font-semibold text-foreground">
							Q{priceWithDiscount.toFixed(2)}
						</p>
					</div>
				</div>
			</Link>
			<CartItemStockButtons
				id={product.id}
				quantity={quantity}
				updateItemQuantity={updateItemQuantity}
			/>
		</div>
	)
}