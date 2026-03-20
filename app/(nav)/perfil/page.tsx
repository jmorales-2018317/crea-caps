import { ProfileTab } from "@/components/Profile"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileById } from "@/services/Profile"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

export default async function ProfilePage() {
  const queryClient = new QueryClient()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profileId = user?.id

  console.log("profileId", profileId)

  if (!profileId) {
    return redirect("/auth/iniciar-sesion")
  }

  await queryClient.prefetchQuery({
    queryKey: ["get-profile-by-id", profileId],
    queryFn: () => getProfileById(profileId, supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileTab profileId={profileId} />
    </HydrationBoundary>
  )
}
