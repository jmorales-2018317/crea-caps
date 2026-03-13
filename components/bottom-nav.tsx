"use client"

import { cn } from "@/lib/utils"
import { HomeIcon, ShoppingCartIcon, SearchIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function NavLink({
	href,
	isActive,
	className,
	children,
}: {
	href: string
	isActive: boolean
	className: string
	children: React.ReactNode
}) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (isActive) {
			e.preventDefault()
			window.scrollTo({ top: 0, behavior: "smooth" })
		}
	}

	return (
		<Link href={href} className={className} onClick={handleClick}>
			{children}
		</Link>
	)
}

export function BottomNav() {
	const pathname = usePathname()
	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-background border-border border-t rounded-t-2xl p-4 flex flex-col items-center justify-between">
			<div className="flex w-full items-center justify-between gap-2">
				<NavLink href="/" isActive={pathname === "/"} className={cn("flex flex-col items-center justify-center gap-1 text-sm", pathname === "/" ? "text-black font-medium" : "text-zinc-400")}>
					<HomeIcon className="size-4" /> Inicio
				</NavLink>
				<NavLink href="/buscar" isActive={pathname === "/buscar"} className={cn("flex flex-col items-center justify-center gap-1 text-sm", pathname === "/buscar" ? "text-black font-medium" : "text-zinc-400")}>
					<SearchIcon className="size-4" /> Buscar
				</NavLink>
				<NavLink href="/carrito" isActive={pathname === "/carrito"} className={cn("flex flex-col items-center justify-center gap-1 text-sm", pathname === "/carrito" ? "text-black font-medium" : "text-zinc-400")}>
					<ShoppingCartIcon className="size-4" /> Carrito
				</NavLink>
				<NavLink href="/perfil" isActive={pathname === "/productos"} className={cn("flex flex-col items-center justify-center gap-1 text-sm", pathname === "/productos" ? "text-black font-medium" : "text-zinc-400")}>
					<UserIcon className="size-4" /> Perfil
				</NavLink>
			</div>
		</footer>
	)
}
