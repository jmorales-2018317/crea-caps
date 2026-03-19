"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileSkeleton } from "./profile-skeleton"
import { UserRoundIcon } from "lucide-react"
import { useGetProfileById } from "@/hooks/api"

export function ProfileTab({ profileId }: { profileId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const { data: profile, isLoading } = useGetProfileById(profileId)

  useEffect(() => {
    if (!profile) router.replace("/auth/iniciar-sesion")
  }, [profile, router])

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const role = profile?.role
  const isAdmin = role === "admin"

  return (
    <div className="mt-4 space-y-6">
      <div className="px-1">
        <div className="mt-4 flex items-center gap-2">
          <UserRoundIcon className="size-12" />
          <div className="px-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold">
                {profile?.name || "Usuario"}
              </p>
              {isAdmin && (
                <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Admin
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </div>
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
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

