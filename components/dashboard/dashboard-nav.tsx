"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  dashboardNavItems,
  isDashboardNavActive,
} from "@/components/dashboard/nav";

type DashboardNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardNav({ onNavigate, className }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Principal">
      {dashboardNavItems.map((item) => {
        const Icon = item.icon;
        const active = isDashboardNavActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary/80"
                : "text-text-secondary hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-gold-soft" : "text-text-subtle",
              )}
              aria-hidden
            />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
