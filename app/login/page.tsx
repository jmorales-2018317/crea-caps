"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function ProbarGooglePage() {
  const [session, setSession] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s?.user ? { email: s.user.email ?? undefined } : null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s?.user ? { email: s.user.email ?? undefined } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-xl font-semibold text-foreground">
        Probar login con Google
      </h1>
      <Button
        onClick={handleGoogleLogin}
        className="rounded-full bg-black min-w-[200px]"
      >
        Iniciar sesión con Google
      </Button>
      {session && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">Sesión iniciada</p>
          <p className="font-medium text-foreground">{session.email}</p>
        </div>
      )}
    </div>
  )
}
