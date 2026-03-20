"use client"

import {
  Eye,
  Plus,
  MoreHorizontal,
  type LucideIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type NavAdminProps = {
  administration: {
    name: string
    url: string
    icon: LucideIcon
    hasCreate: boolean
  }[]
}

export function NavAdmin({
  administration,
}: NavAdminProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleView = (item: { url: string }) => {
    router.push(item.url)
  }

  const handleCreate = (item: { url: string }) => {
    router.push(`${item.url}/nuevo`)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/dashboard">
            <LayoutDashboardIcon className="text-sidebar-foreground/70" />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarGroupLabel>Administración</SidebarGroupLabel>
      <SidebarMenu>
        {administration.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onSelect={() => handleView(item)}>
                  <Eye className="text-muted-foreground" />
                  <span>Ver</span>
                </DropdownMenuItem>
                {item.hasCreate ? (
                  <>
                    <DropdownMenuItem onSelect={() => handleCreate(item)}>
                      <Plus className="text-muted-foreground" />
                      <span>Crear</span>
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
