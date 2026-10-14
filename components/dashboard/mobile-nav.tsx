"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DashboardLogo } from "@/components/dashboard/dashboard-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type MobileNavProps = {
  email: string | null;
};

export function MobileNav({ email }: MobileNavProps) {
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
      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border">
          <SheetTitle>
            <DashboardLogo onNavigate={() => setOpen(false)} />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegación del panel administrativo
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
        <Separator />
        <div className="p-3">
          <UserMenu email={email} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
