import Image from "next/image";
import Link from "next/link";
import {
  DEFAULT_STORE_NAME,
  FALLBACK_LOGO,
} from "@/lib/constants/store";
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
      aria-label={`${DEFAULT_STORE_NAME} Admin`}
    >
      <Image
        src={FALLBACK_LOGO}
        alt={DEFAULT_STORE_NAME}
        width={148}
        height={58}
        priority
        className="h-8 w-auto"
      />
      <span className="sr-only">Admin</span>
    </Link>
  );
}
