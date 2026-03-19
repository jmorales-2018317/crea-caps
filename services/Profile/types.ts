export type Role = "admin" | "user"

export type Profile = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: Role
  created_at: string
}