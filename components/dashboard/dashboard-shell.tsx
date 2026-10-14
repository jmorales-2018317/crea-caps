import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

type DashboardShellProps = {
  email: string | null;
  children: React.ReactNode;
};

export function DashboardShell({ email, children }: DashboardShellProps) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-muted/30">
      <DashboardSidebar email={email} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 lg:hidden">
          <MobileNav email={email} />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
