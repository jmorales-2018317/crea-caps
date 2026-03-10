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
import { HomeIcon, MenuIcon, SearchIcon, ShoppingBagIcon, ShoppingCartIcon, TagsIcon, UserIcon } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link"

export function Navbar() {
	const [open, setOpen] = useState(false)
	return (
		<header className="border-border border-b rounded-3xl bg-card p-4">
			<div className="flex items-start justify-between gap-2">
				<h1 className="text-3xl font-bold bg-linear-to-tr from-primary to-primary/60 bg-clip-text text-transparent">
					Crea Caps
				</h1>
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
						<div className="flex flex-col gap-2 px-4">
							<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
								<Link href="/perfil" className="flex items-center justify-start gap-2">
									<UserIcon className="size-4" />
									Perfil
								</Link>
							</Button>
							<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
								<Link href="/" className="flex items-center justify-start gap-2">
									<HomeIcon className="size-4" />
									Inicio
								</Link>
							</Button>
							<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
								<Link href="/carrito" className="flex items-center justify-start gap-2">
									<ShoppingCartIcon className="size-4" />
									Carrito
								</Link>
							</Button>
							<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
								<Link href="/productos" className="flex items-center justify-start gap-2">
									<ShoppingBagIcon className="size-4" />
									Productos
								</Link>
							</Button>
							<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
								<Link href="/categorias" className="flex items-center justify-start gap-2">
									<TagsIcon className="size-4" />
									Categorías
								</Link>
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<div className="flex flex-col gap-4 mt-4">
				<Button onClick={() => setOpen(true)} variant="outline" className="flex items-center gap-2 justify-start bg-accent h-8 text-muted-foreground">
					<SearchIcon className="size-4" />
					Buscar
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
		</header>
	)
}
