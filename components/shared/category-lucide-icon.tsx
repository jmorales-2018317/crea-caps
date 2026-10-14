"use client";

import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "cn";
import {
  isLucideIconName,
  resolveCategoryIconName,
} from "@/lib/category-icons";

type CategoryLucideIconProps = {
  name: string | null | undefined;
  className?: string;
  /** Si es false, no usa `tag` cuando el nombre es inválido o vacío. */
  fallbackToDefault?: boolean;
};

export function CategoryLucideIcon({
  name,
  className,
  fallbackToDefault = true,
}: CategoryLucideIconProps) {
  const resolved = fallbackToDefault
    ? resolveCategoryIconName(name)
    : name && isLucideIconName(name)
      ? name
      : null;

  if (!resolved) {
    return null;
  }

  return (
    <DynamicIcon
      name={resolved}
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
