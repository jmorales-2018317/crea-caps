import { ReactNode } from "react"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfileById } from "@/services/Profile"
import { AppSidebar } from "@/components/Dashboard"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardBreadcrumb } from "@/components/Dashboard/dashboard-breadcrumb"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const queryClient = new QueryClient()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profileId = user?.id
  if (!profileId) {
    return redirect("/auth/iniciar-sesion")
  }

  const profile = await getProfileById(profileId, supabase)
  if (!profile || profile.role !== "admin") {
    return redirect("/")
  }

  queryClient.setQueryData(["get-profile-by-id", profileId], profile)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar profileId={profileId} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DashboardBreadcrumb />
            </div>
          </header>
          <div className="flex flex-col gap-4 p-5 max-sm:p-4 py-0 max-sm:py-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  )
}

