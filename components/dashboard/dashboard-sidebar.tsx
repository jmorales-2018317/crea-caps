import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Separator } from "@/components/ui/separator";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="font-heading text-sm font-semibold tracking-tight">
          Caps Store
          <span className="ml-1.5 font-normal text-muted-foreground">Admin</span>
        </Link>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <DashboardNav />
      </div>
    </aside>
  );
}
