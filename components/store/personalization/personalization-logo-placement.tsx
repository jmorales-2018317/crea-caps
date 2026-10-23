"use client";

import {
  LOGO_PLACEMENT_FULL_LABELS,
  LOGO_PLACEMENTS,
  isLogoPlacement,
  type LogoPlacement,
} from "@/types/personalization";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const triggerId = `logo-placement-${logoId}`;
  const occupiedSet = new Set(occupied);

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Label
        htmlFor={triggerId}
        className="text-xs font-medium text-text-strong"
      >
        Posición
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (isLogoPlacement(next)) {
            onChange(next);
          }
        }}
      >
        <SelectTrigger id={triggerId} className="w-full min-w-0">
          <SelectValue>
            {(item: LogoPlacement | null) =>
              item ? LOGO_PLACEMENT_FULL_LABELS[item] : null
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          {LOGO_PLACEMENTS.map((placement) => (
            <SelectItem
              key={placement}
              value={placement}
              disabled={occupiedSet.has(placement)}
            >
              {LOGO_PLACEMENT_FULL_LABELS[placement]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
