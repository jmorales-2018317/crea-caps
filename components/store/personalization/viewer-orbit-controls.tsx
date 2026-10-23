"use client";

import type { ReactNode } from "react";
import { Rotate3d, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewerOrbitControlsProps = {
  isLight: boolean;
  rotationEnabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleRotation: () => void;
};

export function ViewerOrbitControls({
  isLight,
  rotationEnabled,
  onZoomIn,
  onZoomOut,
  onToggleRotation,
}: ViewerOrbitControlsProps) {
  const rotationLabel = rotationEnabled
    ? "Desactivar rotación"
    : "Activar rotación";

  return (
    <TooltipProvider delay={300}>
      <div
        role="toolbar"
        aria-label="Controles del visor 3D"
        className="absolute right-3 bottom-3 z-30 flex flex-col gap-2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      >
        <ControlButton
          isLight={isLight}
          label="Acercar"
          onClick={onZoomIn}
        >
          <ZoomIn className="size-4" aria-hidden="true" />
        </ControlButton>
        <ControlButton
          isLight={isLight}
          label="Alejar"
          onClick={onZoomOut}
        >
          <ZoomOut className="size-4" aria-hidden="true" />
        </ControlButton>
        <ControlButton
          isLight={isLight}
          label={rotationLabel}
          pressed={rotationEnabled}
          onClick={onToggleRotation}
        >
          <Rotate3d className="size-4" aria-hidden="true" />
        </ControlButton>
      </div>
    </TooltipProvider>
  );
}

type ControlButtonProps = {
  isLight: boolean;
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ControlButton({
  isLight,
  label,
  pressed,
  onClick,
  children,
}: ControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            onPointerDown={(event) => event.stopPropagation()}
            className={cn(
              "size-10 cursor-pointer touch-manipulation rounded-xl border shadow-sm backdrop-blur-md",
              isLight
                ? "border-[#3d3830]/14 bg-[#f3f0ed]/80 text-[#3d3830] hover:bg-[#f3f0ed] hover:text-[#1f1c18]"
                : "border-[#e8d9a8]/20 bg-[#090807]/55 text-[#d4cfc4] hover:bg-[#090807]/75 hover:text-[#f5f2ea]",
              pressed &&
                (isLight
                  ? "bg-[#2f2b26] text-[#f4f1ea] ring-1 ring-[#2f2b26]/40 hover:bg-[#2f2b26] hover:text-[#f4f1ea]"
                  : "bg-[#e8d9a8]/22 text-[#f5f2ea] ring-1 ring-[#e8d9a8]/35 hover:bg-[#e8d9a8]/28 hover:text-[#f5f2ea]"),
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}
