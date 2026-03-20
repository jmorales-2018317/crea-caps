import { createClient } from "@/lib/supabase/client"

export async function signInWithGoogle() {
  const supabase = createClient()

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL)

  const callback = new URL("/auth/callback", origin)

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  })
}
