"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  email: string | null;
};

function getInitials(email: string | null): string {
  if (!email) return "AD";
  const local = email.split("@")[0] ?? "AD";
  return local.slice(0, 2).toUpperCase();
}

export function UserMenu({ email }: UserMenuProps) {
  const label = email ?? "Administrador";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 px-1.5 sm:px-2"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback className="text-xs font-medium">
            {getInitials(email)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-44 truncate text-sm font-medium sm:inline">
          {label}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5 px-0.5 py-0.5">
              <span className="text-sm font-medium text-foreground">
                Cuenta administrativa
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {label}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
