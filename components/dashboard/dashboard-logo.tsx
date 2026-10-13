import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardLogoProps = {
  className?: string;
  onNavigate?: () => void;
};

export function DashboardLogo({ className, onNavigate }: DashboardLogoProps) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="Caps Store Admin"
    >
      <Image
        src="/logo-gold.webp"
        alt="Caps Store"
        width={148}
        height={58}
        priority
        className="h-8 w-auto"
      />
      <span className="sr-only">Admin</span>
    </Link>
  );
}
