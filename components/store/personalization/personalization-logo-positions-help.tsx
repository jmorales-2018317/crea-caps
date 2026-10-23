"use client";

import { CircleHelp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PersonalizationLogoPositionsHelp() {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label="Qué significan las posiciones disponibles"
        className="-ml-2 inline-flex size-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-muted hover:text-text-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-expanded:bg-muted aria-expanded:text-text-strong"
      >
        <CircleHelp className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        collisionPadding={16}
        className="w-[min(18rem,calc(100vw-2rem))] p-3"
      >
        <PopoverDescription className="mt-1 text-pretty">
          Los puntos amarillos en la gorra marcan las posiciones disponibles
          para colocar una imagen.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
