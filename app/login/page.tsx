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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-gradient)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-2xl border border-border bg-card/80" />
      </div>
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
