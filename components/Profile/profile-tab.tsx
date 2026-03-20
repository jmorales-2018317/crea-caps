"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileSkeleton } from "./profile-skeleton"
import { LayoutDashboardIcon, LogOutIcon, PencilIcon, ShoppingCartIcon, UserRoundIcon, SettingsIcon } from "lucide-react"
import { useGetProfileById } from "@/hooks/api"
import { Badge } from "../ui/badge"
import { Spinner } from "../ui/spinner"

export function ProfileTab({ profileId }: { profileId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isClosingSession, setIsClosingSession] = useState(false)

  const { data: profile, isLoading } = useGetProfileById(profileId)

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const handleLogout = async () => {
    setIsClosingSession(true)
    await supabase.auth.signOut()
    setIsClosingSession(false)
    router.push("/")
  }

  const role = profile?.role
  const isAdmin = role === "admin"

  return (
    <div className="p-4">
      <div className="px-1">
        <div className="flex items-center gap-2">
          <UserRoundIcon className="size-12" />
          <div className="px-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {profile?.name || "Usuario"}
              </p>
              {isAdmin && (
                <Badge className="bg-muted text-secondary-foreground">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      <Separator className="mt-4 mb-2" />

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="lg"
          className="w-full gap-2 justify-start"
          onClick={() => router.push("/perfil/editar")}
        >
          <PencilIcon className="size-4" />
          Editar perfil
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full gap-2 justify-start"
          onClick={() => router.push("/carrito")}
        >
          <ShoppingCartIcon className="size-4" />
          Ver carrito
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full gap-2 justify-start"
          onClick={() => router.push("/settings")}
        >
          <SettingsIcon className="size-4" />
          Ajustes
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full gap-2 justify-start"
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboardIcon className="size-4" />
          Ir al dashboard
        </Button>

        <Separator className="mb-3" />

        <Button
          variant="destructive"
          size="lg"
          className="w-full gap-2 justify-start"
          onClick={handleLogout}
          disabled={isClosingSession}
        >
          {isClosingSession ? <Spinner className="size-4" /> : <LogOutIcon className="size-4" />}
          {isClosingSession ? "Cerrando sesión..." : "Cerrar sesión"}
        </Button>
      </div>
    </div>
  )
}

