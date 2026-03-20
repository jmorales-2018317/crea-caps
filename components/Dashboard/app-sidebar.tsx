"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Package2,
  Percent,
  ReceiptText,
  Settings2,
  Tags,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavAdmin, NavMain, NavUser } from "@/components/Dashboard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useGetProfileById } from "@/hooks/api/useGetProfileById"

// Datos de navegación (lado admin / dashboard).
const data = {
  administration: [
    {
      name: "Productos",
      url: "/dashboard/productos",
      hasCreate: true,
      icon: Package2,
    },
    {
      name: "Descuentos",
      url: "/dashboard/descuentos",
      hasCreate: true,
      icon: Percent,
    },
    {
      name: "Categorías",
      url: "/dashboard/categorias",
      hasCreate: true,
      icon: Tags,
    },
    {
      name: "Perfiles",
      url: "/dashboard/perfiles",
      hasCreate: false,
      icon: Users,
    },
    {
      name: "Órdenes",
      url: "/dashboard/ordenes",
      hasCreate: false,
      icon: ReceiptText,
    },
  ],
}

type AppSidebarProps = {
  profileId: string
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ profileId, ...props }: AppSidebarProps) {
  const { data: profile } = useGetProfileById(profileId)

  if (!profile) {
    return null
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="text-xl font-bold tracking-tighter text-golden">Crea Caps</Link>
      </SidebarHeader>
      <SidebarContent>
        <NavAdmin administration={data.administration} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser profile={profile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
