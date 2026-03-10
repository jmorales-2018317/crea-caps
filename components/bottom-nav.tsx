"use client"

import { cn } from "@/lib/utils"
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
	const pathname = usePathname()
	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-background border-border border rounded-t-2xl px-4 py-5 flex flex-col items-center justify-between">
			<div className="flex w-full items-center justify-between gap-2">
				<Link href="/" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/" ? "text-black font-medium" : "text-zinc-400")}>
					<HomeIcon className="size-4" /> Inicio
				</Link>
				<Link href="/buscar" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/buscar" ? "text-black font-medium" : "text-zinc-400")}	>
					<SearchIcon className="size-4" /> Buscar
				</Link>
				<Link href="/productos" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/productos" ? "text-black font-medium" : "text-zinc-400")}>
					<ShoppingBagIcon className="size-4" /> Productos
				</Link>
				<Link href="/carrito" className={cn("flex flex-col items-center justify-center gap-1", pathname === "/carrito" ? "text-black font-medium" : "text-zinc-400")}>
					<ShoppingCartIcon className="size-4" /> Carrito
				</Link>
			</div>
		</footer>
	)
}
