"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBookmarksHydrated } from "@/features/bookmarks/hooks/use-bookmarks-hydrated";
import { useBookmarksStore } from "@/features/bookmarks/stores/bookmarks.store";
import { cn } from "cn";

type BookmarkButtonSize = "sm" | "md" | "lg";
type BookmarkButtonVariant = "overlay" | "ghost" | "outline";

type BookmarkButtonProps = {
  productId: string;
  size?: BookmarkButtonSize;
  variant?: BookmarkButtonVariant;
  className?: string;
  showTooltip?: boolean;
};

/** Visual control sizes; hit area targets ~36–44px for touch. */
const sizeMap = {
  sm: "icon" as const,
  md: "icon-lg" as const,
  lg: "icon-lg" as const,
};

const hitAreaClassMap = {
  sm: "size-9",
  md: "size-10",
  lg: "size-11",
};

const iconSizeMap = {
  sm: "size-5",
  md: "size-5",
  lg: "size-6",
};

export function BookmarkButton({
  productId,
  size = "md",
  variant = "overlay",
  className,
  showTooltip = true,
}: BookmarkButtonProps) {
  const hasHydrated = useBookmarksHydrated();
  const isBookmarked = useBookmarksStore((state) =>
    state.productIds.includes(productId),
  );
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark);

  const active = hasHydrated && isBookmarked;
  const label = active ? "Quitar de guardados" : "Guardar producto";

  const buttonClassName = cn(
    hitAreaClassMap[size],
    "touch-manipulation transition-transform duration-200 active:scale-95",
    variant === "overlay" &&
      "rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background",
    active && "text-gold-soft",
    className,
  );

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasHydrated) return;
    toggleBookmark(productId);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const icon = (
    <Bookmark
      className={cn(
        iconSizeMap[size],
        "transition-[fill,transform] duration-200",
        active && "fill-current scale-105",
      )}
      aria-hidden
    />
  );

  if (!showTooltip) {
    return (
      <Button
        type="button"
        variant={variant === "outline" ? "outline" : "ghost"}
        size={sizeMap[size]}
        disabled={!hasHydrated}
        aria-label={label}
        aria-pressed={active}
        className={buttonClassName}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      >
        {icon}
      </Button>
    );
  }

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={variant === "outline" ? "outline" : "ghost"}
              size={sizeMap[size]}
              disabled={!hasHydrated}
              aria-label={label}
              aria-pressed={active}
              className={buttonClassName}
              onClick={handleClick}
              onPointerDown={handlePointerDown}
            />
          }
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
