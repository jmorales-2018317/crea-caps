import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Bienvenido al panel administrativo.</p>
      <Suspense
        fallback={
          <p className="mt-2 h-4 w-40 animate-pulse rounded bg-neutral-200" />
        }
      >
        <UserEmail />
      </Suspense>
    </main>
  );
}

async function UserEmail() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  return (
    <p className="mt-2 text-sm text-gray-500">{email ?? "Administrador"}</p>
  );
}
