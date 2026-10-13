"use client";

import { usePathname } from "next/navigation";
import { getDashboardModuleTitle } from "@/components/dashboard/nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserMenu } from "@/components/dashboard/user-menu";

type DashboardHeaderProps = {
  email: string | null;
};

export function DashboardHeader({ email }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = getDashboardModuleTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6">
      <MobileNav />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium sm:text-base">{title}</p>
      </div>
      <UserMenu email={email} />
    </header>
  );
}
