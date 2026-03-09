import Link from "next/link";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Search } from "lucide-react";

export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 w-full rounded-b-lg border-b border-neutral-200">
			<nav className="mx-auto flex-col items-center justify-between px-4 sm:px-6 lg:px-8">
				<div>
					<Link
						href="/"
						className="text-lg font-semibold tracking-tight text-white transition-colors hover:text-neutral-600"
					>
						Crea Caps
					</Link>
					<ul className="flex items-center gap-6">
						<li>
							<Link
								href="/"
								className="text-sm font-medium text-white transition-colors hover:text-neutral-900"
							>
								Inicio
							</Link>
						</li>
						<li>
							<Link
								href="/productos"
								className="text-sm font-medium text-white transition-colors hover:text-neutral-900"
							>
								Productos
							</Link>
						</li>
					</ul>
				</div>
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder="Search..." />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupAddon align="inline-end">12 results</InputGroupAddon>
				</InputGroup>
			</nav>
		</header>
	);
}
