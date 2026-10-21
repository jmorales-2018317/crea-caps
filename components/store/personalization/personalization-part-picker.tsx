"use client";

import { useEffect } from "react";
import { cn } from "cn";
import {
  handleColorPopoverOpenChange,
  PersonalizationColorFields,
  type ColorPickerOrigin,
} from "@/components/store/personalization/personalization-color-popover";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CAP_PART_LABELS,
  CAP_PARTS,
  type CapPartColors,
  type CapPartId,
} from "@/types/personalization";

type PersonalizationPartPickerProps = {
  selectedPart: CapPartId | null;
  pickerOrigin: ColorPickerOrigin | null;
  partColors: CapPartColors;
  onSelectPart: (part: CapPartId) => void;
  onPartColorChange: (part: CapPartId, color: string) => void;
  onClose: () => void;
  shouldIgnoreOutsidePress: (target: EventTarget | null) => boolean;
};

export function PersonalizationPartPicker({
  selectedPart,
  pickerOrigin,
  partColors,
  onSelectPart,
  onPartColorChange,
  onClose,
  shouldIgnoreOutsidePress,
}: PersonalizationPartPickerProps) {
  const selectedLabel = selectedPart ? CAP_PART_LABELS[selectedPart] : null;

  useEffect(() => {
    if (!selectedPart) {
      return;
    }
    document
      .getElementById(`cap-part-${selectedPart}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedPart]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-strong">Piezas</p>
      <p className="text-xs leading-relaxed text-text-secondary">
        Haz clic en una pieza de la gorra o en la lista para cambiar su color.
      </p>
      <p className="sr-only" aria-live="polite">
        {selectedPart && selectedLabel
          ? `Pieza seleccionada: ${selectedLabel}`
          : "Ninguna pieza seleccionada"}
      </p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {CAP_PARTS.map((part) => {
          const isSelected = selectedPart === part;
          const isPopoverOpen = pickerOrigin === "sidebar" && isSelected;
          const label = CAP_PART_LABELS[part];
          return (
            <li key={part}>
              <Popover
                open={isPopoverOpen}
                onOpenChange={(open, eventDetails) => {
                  handleColorPopoverOpenChange(
                    open,
                    eventDetails,
                    shouldIgnoreOutsidePress,
                    (nextOpen) => {
                      if (nextOpen) {
                        onSelectPart(part);
                        return;
                      }
                      if (isPopoverOpen) {
                        onClose();
                      }
                    },
                  );
                }}
              >
                <PopoverTrigger
                  type="button"
                  id={`cap-part-${part}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition-colors duration-200 outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary/10 text-text-strong"
                      : "border-transparent bg-muted/40 text-text-secondary hover:border-border hover:bg-surface-hover hover:text-text-strong",
                  )}
                >
                  <span
                    className="size-5 shrink-0 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: partColors[part] }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{label}</span>
                </PopoverTrigger>
                <PopoverContent
                  side="left"
                  align="center"
                  sideOffset={10}
                  collisionPadding={12}
                  className="w-64 p-3"
                >
                  <PersonalizationColorFields
                    part={part}
                    color={partColors[part]}
                    onColorChange={(color) => onPartColorChange(part, color)}
                  />
                </PopoverContent>
              </Popover>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
