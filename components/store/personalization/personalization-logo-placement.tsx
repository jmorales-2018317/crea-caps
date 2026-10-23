"use client";

import { cn } from "cn";
import {
  LOGO_PLACEMENT_FULL_LABELS,
  LOGO_PLACEMENT_GROUPS,
  LOGO_PLACEMENT_LABELS,
  type LogoPlacement,
} from "@/types/personalization";

type PersonalizationLogoPlacementProps = {
  logoId: string;
  value: LogoPlacement;
  occupied: readonly LogoPlacement[];
  onChange: (placement: LogoPlacement) => void;
};

export function PersonalizationLogoPlacement({
  logoId,
  value,
  occupied,
  onChange,
}: PersonalizationLogoPlacementProps) {
  const groupName = `logo-placement-${logoId}`;

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-text-strong">Posición</legend>
      <div className="space-y-2.5">
        {LOGO_PLACEMENT_GROUPS.map((group) => (
          <div key={group.id} className="space-y-1.5">
            <p className="text-[11px] font-medium tracking-wide text-text-secondary uppercase">
              {group.label}
            </p>
            <div
              role="presentation"
              className={cn(
                "grid gap-1.5",
                group.placements.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2",
              )}
            >
              {group.placements.map((placement) => {
                const isSelected = value === placement;
                const isTaken = occupied.includes(placement) && !isSelected;
                const inputId = `${groupName}-${placement}`;
                return (
                  <div key={placement} className="min-w-0">
                    <input
                      id={inputId}
                      type="radio"
                      name={groupName}
                      value={placement}
                      checked={isSelected}
                      disabled={isTaken}
                      className="peer sr-only"
                      onChange={() => onChange(placement)}
                    />
                    <label
                      htmlFor={inputId}
                      title={
                        isTaken
                          ? "Ya hay un logo en esta posición"
                          : LOGO_PLACEMENT_FULL_LABELS[placement]
                      }
                      className={cn(
                        "flex min-h-8 cursor-pointer items-center justify-center rounded-md border px-1.5 text-center text-xs font-medium transition-colors duration-150 outline-none motion-reduce:transition-none",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card",
                        isSelected
                          ? "border-primary bg-primary/15 text-text-strong"
                          : "border-border bg-muted/40 text-text-secondary hover:border-primary/40 hover:text-text-strong",
                        isTaken &&
                          "pointer-events-none cursor-not-allowed opacity-45 hover:border-border hover:text-text-secondary",
                      )}
                    >
                      {LOGO_PLACEMENT_LABELS[placement]}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
