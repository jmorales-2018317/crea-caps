"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

export type ViewerBackgroundMode = "dark" | "light";

export const VIEWER_BACKGROUND_COLORS: Record<ViewerBackgroundMode, string> = {
  dark: "#1a1815",
  light: "#f3f0ed",
};

const OPTIONS = [
  { mode: "dark" as const, label: "Modo oscuro", icon: Moon },
  { mode: "light" as const, label: "Modo claro", icon: Sun },
];

type ViewerBackgroundToggleProps = {
  value: ViewerBackgroundMode;
  onChange: (mode: ViewerBackgroundMode) => void;
};

export function ViewerBackgroundToggle({
  value,
  onChange,
}: ViewerBackgroundToggleProps) {
  const isLight = value === "light";

  return (
    <div
      role="radiogroup"
      aria-label="Color de fondo del visor"
      className={cn(
        "absolute bottom-3 left-3 z-30 flex rounded-full border p-0.5 shadow-sm backdrop-blur-md sm:bottom-4 sm:left-4",
        isLight
          ? "border-[#3d3830]/14 bg-[#f3f0ed]/80"
          : "border-[#e8d9a8]/20 bg-[#090807]/55",
      )}
    >
      {OPTIONS.map(({ mode, label, icon: Icon }) => {
        const selected = value === mode;

        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex h-8 min-w-11 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? isLight
                  ? "bg-[#2f2b26] text-[#f4f1ea]"
                  : "bg-[#e8d9a8]/18 text-[#f5f2ea]"
                : isLight
                  ? "text-[#3d3830] hover:text-[#1f1c18]"
                  : "text-[#d4cfc4] hover:text-[#f5f2ea]",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>
              <span className="hidden sm:inline">Modo </span>
              {mode === "dark" ? "oscuro" : "claro"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
