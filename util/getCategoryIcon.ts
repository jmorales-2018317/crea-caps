import {
    FootprintsIcon,
    LaptopIcon,
    ShirtIcon,
    WatchIcon,
    TrophyIcon,
  } from "lucide-react"
  import type { LucideIcon } from "lucide-react"
  
  export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    ShirtIcon,
    LaptopIcon,
    FootprintsIcon,
    WatchIcon,
    TrophyIcon,
  } as const
  
  export type CategoryIconName = keyof typeof CATEGORY_ICONS
  
  export function getCategoryIcon(name: CategoryIconName): LucideIcon | null {
    return CATEGORY_ICONS[name] ?? null
  }
  