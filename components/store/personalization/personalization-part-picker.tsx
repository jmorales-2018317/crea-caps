"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAP_PART_GROUPS,
  CAP_PART_LABELS,
  getCapPartGroupId,
  isCapPartGroupId,
  isPaletteColorForPart,
  type CapPartColors,
  type CapPartGroupId,
  type CapPartId,
  type PaletteColor,
} from "@/types/personalization";

type PersonalizationPartPickerProps = {
  selectedPart: CapPartId | null;
  pickerOrigin: ColorPickerOrigin | null;
  partColors: CapPartColors;
  paletteColors: PaletteColor[] | null;
  onSelectPart: (part: CapPartId) => void;
  onPartColorChange: (part: CapPartId, color: string) => void;
  onClose: () => void;
  shouldIgnoreOutsidePress: (target: EventTarget | null) => boolean;
};

export function PersonalizationPartPicker({
  selectedPart,
  pickerOrigin,
  partColors,
  paletteColors,
  onSelectPart,
  onPartColorChange,
  onClose,
  shouldIgnoreOutsidePress,
}: PersonalizationPartPickerProps) {
  const selectedLabel = selectedPart ? CAP_PART_LABELS[selectedPart] : null;
  const [activeGroup, setActiveGroup] = useState<CapPartGroupId>(() =>
    selectedPart ? getCapPartGroupId(selectedPart) : CAP_PART_GROUPS[0].id,
  );

  useEffect(() => {
    if (!selectedPart) {
      return;
    }
    setActiveGroup(getCapPartGroupId(selectedPart));
  }, [selectedPart]);

  useEffect(() => {
    if (!selectedPart || pickerOrigin !== "sidebar") {
      return;
    }
    document
      .getElementById(`cap-part-${selectedPart}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pickerOrigin, selectedPart]);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-text-secondary">
        Elige un grupo o haz clic en la gorra para pintar una pieza.
      </p>
      <p className="sr-only" aria-live="polite">
        {selectedPart && selectedLabel
          ? `Pieza seleccionada: ${selectedLabel}`
          : "Ninguna pieza seleccionada"}
      </p>
      <Tabs
        value={activeGroup}
        className="gap-3"
        onValueChange={(value) => {
          if (!isCapPartGroupId(value)) {
            return;
          }
          setActiveGroup(value);
          if (
            pickerOrigin === "sidebar" &&
            selectedPart &&
            getCapPartGroupId(selectedPart) !== value
          ) {
            onClose();
          }
        }}
      >
        <TabsList
          aria-label="Grupos de piezas"
          className="h-10 w-full min-w-0"
        >
          {CAP_PART_GROUPS.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className="min-w-0 cursor-pointer px-1.5 text-xs sm:text-sm"
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {CAP_PART_GROUPS.map((group) => (
          <TabsContent key={group.id} value={group.id} className="flex-none">
            <ul className="grid grid-cols-1 gap-1">
              {group.parts.map((part) => {
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
                        className="w-56 p-2.5"
                      >
                        <PersonalizationColorFields
                          part={part}
                          color={partColors[part]}
                          paletteColors={paletteColors}
                          onColorChange={(color) => {
                            if (
                              isPaletteColorForPart(
                                part,
                                color,
                                paletteColors ?? [],
                              )
                            ) {
                              onPartColorChange(part, color);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
