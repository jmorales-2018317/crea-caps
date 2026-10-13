import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminClaims } from "@/lib/auth/admin";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 border-r bg-sidebar p-4 lg:block">
        <Skeleton className="h-5 w-32" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b px-4 sm:px-6">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  if (!isAdminClaims(data.claims)) {
    redirect("/");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;

  return <DashboardShell email={email}>{children}</DashboardShell>;
}
