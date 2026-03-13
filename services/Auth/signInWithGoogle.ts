import { createClient } from "@/lib/supabase/client"

export const signInWithGoogle = async () => {
  const supabase = createClient()
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  })
}
