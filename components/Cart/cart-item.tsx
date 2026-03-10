import { XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../ui/dialog"
import Image from "next/image"
import Link from "next/link"
import CartItemStockButtons from "./cart-item-stock-buttons"
import { Category } from "@/services/Category"


export type CartItemData = {
	id: string
	name: string
	categories: Category[]
	price: number
	image: string
	quantity: number
}

export default function CartItem({
	item,
	onQuantityChange,
	onRemove,
}: {
	item: CartItemData
	onQuantityChange: (id: string, delta: number) => void
	onRemove: (id: string) => void
}) {

	return (
		<div className="flex gap-2 p-4 border-b border-border last:border-0 items-center">
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
								onClick={() => onRemove(item.id)}
							>
								Eliminar
							</Button>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>
			<Link
				href={`/productos/${item.id}`}
				className="flex min-w-0 flex-1 items-center gap-2"
			>
				<div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted/50">
					<Image
						src={item.image}
						alt={item.name}
						fill
						sizes="80px"
						className="object-contain"
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-between">
					<div>
						<h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h3>
						<p className="text-xs text-muted-foreground line-clamp-1">{item.categories.map((category) => category.name).join(", ")}</p>
						<p className="mt-0.5 text-sm font-semibold text-foreground">
							${item.price.toFixed(2)}
						</p>
					</div>
				</div>
			</Link>
			<CartItemStockButtons
				id={item.id}
				quantity={item.quantity}
				onQuantityChange={onQuantityChange}
			/>
		</div>
	)
}