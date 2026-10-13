import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminClaims } from "@/lib/auth/admin";
import { SignOutButton } from "./sign-out-button";

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
    <main className="p-8">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-neutral-200" />
    </main>
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

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-8 py-4">
        <p className="text-sm font-medium">Caps Store · Admin</p>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
