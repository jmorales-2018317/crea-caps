import { ReactNode } from "react"
import { getProfileById } from "@/services/Profile";
import { createClient } from "@/lib/supabase/server"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { Navbar } from "@/components/navbar";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const queryClient = new QueryClient()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  await queryClient.prefetchQuery({
    queryKey: ["get-profile-by-id", user?.id],
    queryFn: () => getProfileById(user?.id ?? "", supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Navbar profileId={user?.id ?? ""} />
      {children}
    </HydrationBoundary>
  )
}

