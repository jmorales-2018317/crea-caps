"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdminClaims } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
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
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-foreground">Administración</h1>
        <p className="text-sm text-muted-foreground">
          Acceso exclusivo para administradores.
        </p>

        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-auto p-3"
          required
        />

        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-auto p-3"
          required
        />

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="h-auto p-3">
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>
    </main>
  );
}
