import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminClaims } from "@/lib/auth/admin";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginGate />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
    </main>
  );
}

async function LoginGate() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (!error && isAdminClaims(data?.claims)) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
