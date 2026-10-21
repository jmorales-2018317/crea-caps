"use client";

import { useId, type RefObject } from "react";
import type { PopoverRootChangeEventDetails } from "@base-ui/react/popover";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  CAP_PART_LABELS,
  type CapPartColors,
  type CapPartId,
} from "@/types/personalization";

export type ColorPickerOrigin = "viewer" | "sidebar";

export function handleColorPopoverOpenChange(
  open: boolean,
  eventDetails: PopoverRootChangeEventDetails,
  shouldIgnoreOutsidePress: (target: EventTarget | null) => boolean,
  onOpenChange: (open: boolean) => void,
) {
  if (!open) {
    if (eventDetails.reason === "focus-out") {
      eventDetails.cancel();
      return;
    }

    if (eventDetails.reason === "outside-press") {
      const target = eventDetails.event.target;
      if (shouldIgnoreOutsidePress(target)) {
        eventDetails.cancel();
        return;
      }
    }
  }

  onOpenChange(open);
}

type PersonalizationColorFieldsProps = {
  part: CapPartId;
  color: string;
  onColorChange: (color: string) => void;
};

export function PersonalizationColorFields({
  part,
  color,
  onColorChange,
}: PersonalizationColorFieldsProps) {
  const pickerId = useId();

  return (
    <>
      <PopoverTitle className="sr-only">
        Color de {CAP_PART_LABELS[part]}
      </PopoverTitle>
      <ColorPicker id={pickerId} value={color} onChange={onColorChange} />
    </>
  );
}

type PersonalizationColorPopoverProps = {
  open: boolean;
  selectedPart: CapPartId | null;
  partColors: CapPartColors;
  anchorRef: RefObject<Element | null>;
  onPartColorChange: (part: CapPartId, color: string) => void;
  onOpenChange: (open: boolean) => void;
  shouldIgnoreOutsidePress: (target: EventTarget | null) => boolean;
};

export function PersonalizationColorPopover({
  open,
  selectedPart,
  partColors,
  anchorRef,
  onPartColorChange,
  onOpenChange,
  shouldIgnoreOutsidePress,
}: PersonalizationColorPopoverProps) {
  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        handleColorPopoverOpenChange(
          nextOpen,
          eventDetails,
          shouldIgnoreOutsidePress,
          onOpenChange,
        );
      }}
    >
      <PopoverContent
        anchor={anchorRef}
        collisionPadding={12}
        positionMethod="fixed"
        side="top"
        align="center"
        sideOffset={14}
        className="w-64 p-3"
      >
        {selectedPart ? (
          <PersonalizationColorFields
            part={selectedPart}
            color={partColors[selectedPart]}
            onColorChange={(color) => onPartColorChange(selectedPart, color)}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
