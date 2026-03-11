"use client"

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Button } from "./ui/button"
import { useState } from "react"
import { HomeIcon, LayoutDashboardIcon, MenuIcon, SearchIcon, SettingsIcon, ShoppingCartIcon, UserIcon } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link"
import { Separator } from "./ui/separator"

export function Navbar() {
	const [open, setOpen] = useState(false)
	return (
		<header className="sticky top-0 z-50 border-border border-b rounded-b-2xl bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h1 className="text-3xl font-bold">
					Crea Caps
				</h1>

				<div className="flex items-center gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								suppressHydrationWarning
							>
								<MenuIcon className="size-4" />
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle className="text-2xl font-bold">Menú</SheetTitle>
							</SheetHeader>
							<div className="flex flex-col justify-between h-full gap-2 px-4 py-5">
								<div className="flex flex-col gap-2">
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/" className="flex items-center justify-start gap-2">
											<HomeIcon className="size-4" />
											Inicio
										</Link>
									</Button>
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/buscar" className="flex items-center justify-start gap-2">
											<SearchIcon className="size-4" />
											Búsqueda
										</Link>
									</Button>
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/carrito" className="flex items-center justify-start gap-2">
											<ShoppingCartIcon className="size-4" />
											Carrito
										</Link>
									</Button>
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/perfil" className="flex items-center justify-start gap-2">
											<UserIcon className="size-4" />
											Perfil
										</Link>
									</Button>
								</div>
								<div className="flex flex-col gap-4">
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/dashboard" className="flex items-center justify-start gap-2">
											<LayoutDashboardIcon className="size-4" />
											Ir al Dashboard
										</Link>
									</Button>
									<Separator />
									<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
										<Link href="/settings" className="flex items-center justify-start gap-2">
											<SettingsIcon className="size-4" />
											Ajustes
										</Link>
									</Button>
								</div>
							</div>
						</SheetContent>
					</Sheet>
					<Button onClick={() => setOpen(true)} size="icon-lg" className="flex items-center rounded-xl p-4 bg-black">
						<SearchIcon className="size-4" />
					</Button>
					<CommandDialog open={open} onOpenChange={setOpen}>
						<Command>
							<CommandInput placeholder="Buscar productos, categorías, etc." />
							<CommandList>
								<CommandEmpty>No se encontraron resultados.</CommandEmpty>
								<CommandGroup heading="Sugerencias">
									<CommandItem>Producto 1</CommandItem>
									<CommandItem>Producto 2</CommandItem>
									<CommandItem>Producto 3</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</CommandDialog>
				</div>
			</div>
		</header>
	)
}
