import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminClaims } from "@/lib/auth/admin";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_STORE_NAME } from "@/lib/constants/store";
import { getStoreSettings } from "@/services/store-settings.server";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => null);
  const storeName = settings?.store_name?.trim() || DEFAULT_STORE_NAME;

  return {
    title: {
      default: `Admin | ${storeName}`,
      template: `%s | ${storeName}`,
    },
  };
}

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
    <div className="fixed inset-0 flex overflow-hidden bg-muted/30">
      <aside className="hidden h-full w-64 border-r bg-sidebar p-4 lg:block">
        <Skeleton className="h-5 w-32" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4 lg:hidden">
          <Skeleton className="size-7 rounded-md" />
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
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
