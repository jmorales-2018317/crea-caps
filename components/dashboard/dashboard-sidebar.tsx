import { DashboardLogo } from "@/components/dashboard/dashboard-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Separator } from "@/components/ui/separator";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center px-5">
        <DashboardLogo />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <DashboardNav />
      </div>
    </aside>
  );
}
