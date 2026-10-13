"use client";

import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "cn";
import { isLucideIconName } from "@/lib/category-icons";

type CategoryLucideIconProps = {
  name: string | null | undefined;
  className?: string;
};

export function CategoryLucideIcon({
  name,
  className,
}: CategoryLucideIconProps) {
  if (!name || !isLucideIconName(name)) {
    return null;
  }

  return (
    <DynamicIcon
      name={name as IconName}
      className={cn("size-4", className)}
      aria-hidden="true"
      fallback={() => (
        <span
          className={cn(
            "inline-block size-4 animate-pulse rounded-sm bg-muted",
            className,
          )}
          aria-hidden="true"
        />
      )}
    />
  );
}
