"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Abrir menú"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border">
          <SheetTitle>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="font-heading text-sm font-semibold tracking-tight"
            >
              Caps Store
              <span className="ml-1.5 font-normal text-muted-foreground">
                Admin
              </span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegación del panel administrativo
          </SheetDescription>
        </SheetHeader>
        <div className="p-3">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
