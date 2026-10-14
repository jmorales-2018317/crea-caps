import { DashboardLogo } from "@/components/dashboard/dashboard-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Separator } from "@/components/ui/separator";

type DashboardSidebarProps = {
  email: string | null;
};

export function DashboardSidebar({ email }: DashboardSidebarProps) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-14 shrink-0 items-center px-5">
        <DashboardLogo />
      </div>
      <Separator className="shrink-0" />
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <DashboardNav />
      </div>
      <Separator className="shrink-0" />
      <div className="shrink-0 p-3">
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
