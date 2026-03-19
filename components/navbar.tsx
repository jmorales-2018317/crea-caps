"use client"

import { SubmitEvent, useEffect, useState } from "react"
import { Button } from "./ui/button"
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
import { useGetProfileById } from "@/hooks/api"
import { useRouter, useSearchParams } from "next/navigation"
import { SortEnum } from "@/services/Search"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

type NavbarProps = {
	profileId: string
}

export function Navbar({ profileId }: NavbarProps) {
	const { data: profile } = useGetProfileById(profileId)

	const role = profile?.role
	const isAdmin = role === "admin"

	const router = useRouter()
	const searchParams = useSearchParams()

	const queryParam = searchParams.get("query") ?? ""
	const [query, setQuery] = useState(queryParam)

	useEffect(() => {
		setQuery(queryParam)
	}, [queryParam])

	const categoryId = searchParams.get("categoryId") ?? null
	const priceMin = searchParams.get("priceMin") ?? "0"
	const priceMax = searchParams.get("priceMax") ?? "1000"
	const sort = searchParams.get("sort") ?? SortEnum.RECENT

	const handleSearch = (e: SubmitEvent) => {
		e.preventDefault()

		const params = new URLSearchParams()
		params.set("query", query.trim())
		if (categoryId) params.set("categoryId", categoryId)
		params.set("priceMin", priceMin)
		params.set("priceMax", priceMax)
		params.set("sort", sort)

		router.push(`/buscar?${params.toString()}`)
	}

	return (
		<header className="flex flex-col sticky min-h-16 top-0 z-50">
			<section className="flex items-center justify-between min-h-16 bg-card px-4 py-2 gap-4 shadow-sm">
				<div className="flex items-center gap-1">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon-lg"
								className="w-fit"
							>
								<MenuIcon />
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
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
									{
										isAdmin && (
											<Button variant="ghost" size="icon-lg" className="w-full px-4" asChild>
												<Link href="/dashboard" className="flex items-center justify-start gap-2">
													<LayoutDashboardIcon className="size-4" />
													Ir al Dashboard
												</Link>
											</Button>
										)
									}
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

					<Link href="/" className="text-2xl font-bold tracking-tighter text-golden">Crea Caps</Link>
				</div>

				<form onSubmit={handleSearch} className="flex-1 max-w-lg">
					<InputGroup className="h-8">
						<InputGroupInput
							className="text-xs"
							name="query"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Buscar gorras..."
						/>
						<InputGroupAddon align="inline-end" className="py-0 pr-1">
							<InputGroupButton type="submit" variant="default" size="icon-sm" className="rounded-l-none size-8">
								<SearchIcon />
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</form>
			</section>

			<section className="bg-secondary text-white font-medium text-sm flex items-center justify-around px-4 py-1 gap-4 shadow-sm">
				<Button variant="ghost" className="px-4" asChild>
					<Link href="/">
						<HomeIcon className="size-4" />
						Inicio
					</Link>
				</Button>
				<Button variant="ghost" className="px-4" asChild>
					<Link href="/carrito">
						<ShoppingCartIcon className="size-4" />
						Carrito
					</Link>
				</Button>
				<Button variant="ghost" className="px-4" asChild>
					<Link href="/perfil">
						<UserIcon className="size-4" />
						Perfil
					</Link>
				</Button>
			</section >
		</header>
	)
}
