"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#contacto", label: "Contacto" },
] as const;

const linkClassName =
  "rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function StoreNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="hidden items-center gap-1 sm:flex"
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        ))}
        <Link
          href="/catalogo#buscar"
          className={cn(linkClassName, "inline-flex items-center gap-1.5")}
          aria-label="Buscar en el catálogo"
        >
          <Search className="size-3.5" aria-hidden />
          Buscar
        </Link>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              aria-label="Abrir menú"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Menú</SheetTitle>
            <SheetDescription className="sr-only">
              Navegación de la tienda
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="Navegación principal" className="flex flex-col gap-1 p-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(linkClassName, "px-3 py-2.5")}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/catalogo#buscar"
              className={cn(
                linkClassName,
                "inline-flex items-center gap-2 px-3 py-2.5",
              )}
              aria-label="Buscar en el catálogo"
              onClick={() => setOpen(false)}
            >
              <Search className="size-3.5" aria-hidden />
              Buscar
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
