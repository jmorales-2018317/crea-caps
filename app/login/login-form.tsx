"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminClaims } from "@/lib/auth/admin";
import {
  DEFAULT_STORE_NAME,
  FALLBACK_LOGO,
} from "@/lib/constants/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    const { data, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError || !data?.claims || !isAdminClaims(data.claims)) {
      await supabase.auth.signOut();
      setError("No tienes permisos de administrador");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-gradient)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(184_154_85_/_0.14)_0%,transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 size-[28rem] rounded-full bg-[radial-gradient(circle,rgb(184_154_85_/_0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2 rounded-lg px-1 py-2 text-sm text-text-secondary transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
            Volver al inicio
          </Link>

          <div className="flex flex-1 flex-col items-center justify-center py-10 sm:py-14">
            <form
              onSubmit={handleLogin}
              className="w-full animate-hero-enter"
              aria-labelledby="login-heading"
            >
              <div className="mb-8 flex flex-col items-center gap-5 text-center">
                <Image
                  src={FALLBACK_LOGO}
                  alt={DEFAULT_STORE_NAME}
                  width={168}
                  height={66}
                  priority
                  className="h-10 w-auto sm:h-11"
                />
                <div className="space-y-2">
                  <h1
                    id="login-heading"
                    className="text-2xl font-semibold tracking-tight text-text-strong sm:text-[1.75rem]"
                  >
                    Administración
                  </h1>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    Acceso exclusivo para administradores de {DEFAULT_STORE_NAME}.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-8">
                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <Label htmlFor={emailId} className="text-text-secondary">
                      Correo electrónico
                    </Label>
                    <Input
                      id={emailId}
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="admin@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 px-3"
                      required
                      aria-invalid={Boolean(error) || undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={passwordId} className="text-text-secondary">
                      Contraseña
                    </Label>
                    <Input
                      id={passwordId}
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 px-3"
                      required
                      aria-invalid={Boolean(error) || undefined}
                    />
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-11 w-full text-sm font-semibold tracking-wide"
                  >
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
