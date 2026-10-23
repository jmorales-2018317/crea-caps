"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "cn";
import {
  COLOR_POPOVER_CONTENT_CLASS,
  handleColorPopoverOpenChange,
  PersonalizationColorFields,
  type ColorPickerOrigin,
} from "@/components/store/personalization/personalization-color-popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function toOpenGroups(value: unknown): CapPartGroupId[] {
  const items = Array.isArray(value) ? value : value == null ? [] : [value];
  return items.map(String).filter(isCapPartGroupId);
}

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
  const selectedGroupId = selectedPart ? getCapPartGroupId(selectedPart) : null;
  const [userOpenGroups, setUserOpenGroups] = useState<CapPartGroupId[]>([]);
  const openGroups = useMemo(() => {
    if (selectedGroupId && !userOpenGroups.includes(selectedGroupId)) {
      return [selectedGroupId];
    }
    return userOpenGroups.slice(-1);
  }, [selectedGroupId, userOpenGroups]);

  useEffect(() => {
    if (!selectedPart || pickerOrigin !== "sidebar") {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`cap-part-${selectedPart}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pickerOrigin, selectedPart]);

  return (
    <div className="space-y-2">
      <p className="sr-only" aria-live="polite">
        {selectedPart && selectedLabel
          ? `Pieza seleccionada: ${selectedLabel}`
          : "Ninguna pieza seleccionada"}
      </p>
      <p className="text-[11px] font-medium tracking-[0.16em] text-text-subtle uppercase">
        Lista de piezas
      </p>
      <Accordion
        value={openGroups}
        onValueChange={(next) => {
          const ids = toOpenGroups(next).slice(-1);
          setUserOpenGroups(ids);
          if (selectedPart && !ids.includes(getCapPartGroupId(selectedPart))) {
            onClose();
          }
        }}
        className="overflow-hidden rounded-xl border border-[#e8d9a8]/18"
      >
        {CAP_PART_GROUPS.map((group) => (
          <AccordionItem
            key={group.id}
            value={group.id}
            className="border-[#e8d9a8]/12 px-2.5"
          >
            <AccordionTrigger className="cursor-pointer items-center py-3 hover:no-underline">
              <span className="min-w-0 truncate text-sm font-medium text-text-strong">
                {group.label}
                <span className="text-text-secondary">
                  {" "}
                  · {group.parts.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-[#e8d9a8]/12 pt-1.5 pb-2 pl-2 [&_p:not(:last-child)]:mb-0">
              <ul className="flex flex-col gap-0.5">
                {group.parts.map((part) => {
                  const isSelected = selectedPart === part;
                  const isPopoverOpen =
                    pickerOrigin === "sidebar" && isSelected;
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
                            "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm transition-colors duration-200 outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "border-primary/55 bg-primary/10 text-text-strong"
                              : "border-transparent text-text-secondary hover:bg-muted/35 hover:text-text-strong",
                          )}
                        >
                          <span
                            className="size-5 shrink-0 rounded-[6px] border border-white/14 shadow-sm"
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
                          className={COLOR_POPOVER_CONTENT_CLASS}
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
