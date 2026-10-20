"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  LayoutDashboard,
  Mail,
  Menu,
  Search,
  Star,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookmarksCounter } from "@/components/store/bookmarks-counter";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/#destacados", label: "Destacados", icon: Star },
  { href: "/#categorias", label: "Categorías", icon: Tags },
  { href: "/#contacto", label: "Contacto", icon: Mail },
] as const;

const linkClassName =
  "rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const mobileLinkClassName = cn(linkClassName, "px-3 py-2.5");

type StoreNavProps = {
  showAdminLink?: boolean;
};

export function StoreNav({ showAdminLink = false }: StoreNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: center section links */}
      <nav
        aria-label="Secciones"
        className="hidden items-center justify-center gap-1 md:flex"
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Desktop: right actions + mobile trigger */}
      <div className="flex items-center justify-end gap-1">
        <nav
          aria-label="Acciones"
          className="hidden items-center gap-1 md:flex"
        >
          <Link
            href="/catalogo"
            className={cn(linkClassName, "inline-flex items-center gap-1.5")}
            aria-label="Buscar en el catálogo"
          >
            <Search className="size-3.5" aria-hidden />
            Buscar
          </Link>
          <Link
            href="/guardados"
            className={cn(linkClassName, "inline-flex items-center gap-1.5")}
          >
            <Bookmark className="size-3.5" aria-hidden />
            Guardados
            <BookmarksCounter />
          </Link>
          {showAdminLink ? (
            <Link
              href="/dashboard"
              className={cn(
                linkClassName,
                "inline-flex items-center gap-1.5 font-medium text-foreground",
              )}
            >
              <LayoutDashboard className="size-3.5" aria-hidden />
              Administración
            </Link>
          ) : null}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
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
            <div className="flex flex-col gap-4 p-3">
              <nav aria-label="Tienda" className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tienda
                </p>
                <Link
                  href="/catalogo"
                  className={cn(
                    mobileLinkClassName,
                    "inline-flex items-center gap-2",
                  )}
                  aria-label="Buscar en el catálogo"
                  onClick={() => setOpen(false)}
                >
                  <Search className="size-3.5" aria-hidden />
                  Buscar
                </Link>
                <Link
                  href="/guardados"
                  className={cn(
                    mobileLinkClassName,
                    "inline-flex items-center gap-2",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Bookmark className="size-3.5" aria-hidden />
                  Guardados
                  <BookmarksCounter />
                </Link>
              </nav>

              <nav
                aria-label="Secciones"
                className="flex flex-col gap-1 border-t border-border pt-4"
              >
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Secciones
                </p>
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        mobileLinkClassName,
                        "inline-flex items-center gap-2",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {showAdminLink ? (
                <nav
                  aria-label="Administración"
                  className="flex flex-col gap-1 border-t border-border pt-4"
                >
                  <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Administración
                  </p>
                  <Link
                    href="/dashboard"
                    className={cn(
                      mobileLinkClassName,
                      "inline-flex items-center gap-2 font-medium text-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="size-3.5" aria-hidden />
                    Administración
                  </Link>
                </nav>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
