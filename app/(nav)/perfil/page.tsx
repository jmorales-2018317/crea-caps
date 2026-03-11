import GoBack from "@/components/go-back"
import { ProfileTab } from "@/components/Profile"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="w-full py-5 px-4 space-y-4">
        <div className="relative flex items-center justify-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Perfil
          </h1>
          <GoBack />
        </div>

        <ProfileTab />
      </section>
    </div>
  )
}
