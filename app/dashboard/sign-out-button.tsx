import { signOut } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
