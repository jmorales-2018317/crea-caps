"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileSkeleton } from "./profile-skeleton"
import { UserRoundIcon } from "lucide-react"
import Link from "next/link"

export function ProfileTab() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/auth/iniciar-sesion")
  }

  const role = user?.app_metadata?.role as string | undefined
  const isAdmin = role === "admin"

  return (
    <div className="mt-4 space-y-6">
      <div className="px-1">
        {loading ? (
          <ProfileSkeleton />
        ) : user ? (
          <div className="mt-4 flex items-center gap-2">
            <UserRoundIcon className="size-12" />
            <div className="px-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold">
                  {user.user_metadata?.name || "Usuario"}
                </p>
                {isAdmin && (
                  <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Admin
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-xl" asChild>
              <Link href="/auth/iniciar-sesion">
                Iniciar sesion
              </Link>
            </Button>
            <Button className="flex-1 rounded-xl" asChild>
              <Link href="/auth/registrarse">
                Registrarse
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-2" />

      <div className="space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/perfil/editar")}
        >
          Editar perfil
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/carrito")}
        >
          Ver carrito
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/settings")}
        >
          Ajustes
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/dashboard")}
        >
          Ir al dashboard
        </Button>

        {user ? (
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handleLogin}
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </div>
  )
}

