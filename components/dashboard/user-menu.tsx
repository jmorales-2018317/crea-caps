"use client";

import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type UserMenuProps = {
  email: string | null;
  className?: string;
  onNavigate?: () => void;
};

function getInitials(email: string | null): string {
  if (!email) return "AD";
  const local = email.split("@")[0] ?? "AD";
  return local.slice(0, 2).toUpperCase();
}

export function UserMenu({ email, className, onNavigate }: UserMenuProps) {
  const label = email ?? "Administrador";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3 px-1">
        <Avatar>
          <AvatarFallback className="text-xs font-medium">
            {getInitials(email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {label}
          </p>
          <p className="text-xs text-muted-foreground">Administrador</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          nativeButton={false}
          render={<Link href="/" onClick={onNavigate} />}
        >
          <Store className="size-4" aria-hidden />
          Ir a la tienda
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 justify-start gap-2 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
