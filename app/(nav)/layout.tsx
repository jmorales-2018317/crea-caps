import { ReactNode } from "react"
import { BottomNav } from "@/components/bottom-nav"

export default function WithBottomLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

