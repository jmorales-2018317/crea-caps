"use client"

import { cn } from "@/lib/utils"
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
	const pathname = usePathname()
	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-background border-border border-t rounded-t-3xl px-4 py-5 flex flex-col items-center justify-between">
			<div className="flex w-full items-center justify-between gap-2">
				<Link href="/" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/" ? "text-primary" : "text-muted-foreground")}>
					<HomeIcon className="size-4" /> Inicio
				</Link>
				<Link href="/productos" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/productos" ? "text-primary" : "text-muted-foreground")}>
					<ShoppingBagIcon className="size-4" /> Productos
				</Link>
				<Link href="/carrito" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/carrito" ? "text-primary" : "text-muted-foreground")}>
					<ShoppingCartIcon className="size-4" /> Carrito
				</Link>
				<Link href="/perfil" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/perfil" ? "text-primary" : "text-muted-foreground")}	>
					<UserIcon className="size-4" /> Perfil
				</Link>
			</div>
		</footer>
	)
}
