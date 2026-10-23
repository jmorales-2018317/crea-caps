"use client";

import { useMemo, useState, type RefObject } from "react";
import type { PopoverRootChangeEventDetails } from "@base-ui/react/popover";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  CAP_PART_LABELS,
  DEFAULT_CAP_PART_COLORS,
  getSelectableColorsForPart,
  isBlackWhiteCapPart,
  isPaletteColorForPart,
  type CapPartColors,
  type CapPartId,
  type PaletteColor,
} from "@/types/personalization";

export type ColorPickerOrigin = "viewer" | "sidebar";

const PALETTE_SEARCH_THRESHOLD = 10;

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
  paletteColors: PaletteColor[] | null;
  onColorChange: (color: string) => void;
};

export function PersonalizationColorFields({
  part,
  color,
  paletteColors,
  onColorChange,
}: PersonalizationColorFieldsProps) {
  const [search, setSearch] = useState("");
  const options = useMemo(
    () => getSelectableColorsForPart(part, paletteColors ?? []),
    [part, paletteColors],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((option) => {
      const haystack = `${option.name} ${option.hex_code}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [options, search]);

  const selectedOption = options.find((option) => option.hex_code === color);
  const isDefault = color === DEFAULT_CAP_PART_COLORS[part];
  const isBlackWhite = isBlackWhiteCapPart(part);
  const showSearch = options.length >= PALETTE_SEARCH_THRESHOLD;

  return (
    <div className="space-y-2.5">
      <PopoverTitle className="sr-only">
        Color de {CAP_PART_LABELS[part]}
      </PopoverTitle>
      {isBlackWhite ? (
        <p className="text-xs text-text-secondary">Solo negro o blanco.</p>
      ) : null}

      {paletteColors === null ? (
        <p className="text-xs text-text-secondary">
          No se pudieron cargar los colores de la paleta.
        </p>
      ) : options.length === 0 ? (
        <p className="text-xs text-text-secondary">
          {isBlackWhite
            ? "No hay negro o blanco activos en la paleta."
            : "No hay colores activos en la paleta."}
        </p>
      ) : (
        <>
          {showSearch ? (
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar color…"
              aria-label={`Buscar color para ${CAP_PART_LABELS[part]}`}
            />
          ) : null}
          <div
            role="radiogroup"
            aria-label={`Paleta de ${CAP_PART_LABELS[part]}`}
            className="flex max-h-44 flex-wrap content-start gap-2 overflow-y-auto p-1"
          >
            {filtered.map((option) => {
              const selected = option.hex_code === color;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.name}
                  title={`${option.name} (${option.hex_code})`}
                  onClick={() => onColorChange(option.hex_code)}
                  className={cn(
                    "size-6.5 shrink-0 cursor-pointer rounded-md border outline-none transition-[box-shadow,transform] duration-150 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "z-10 border-transparent shadow-[0_0_0_2px_var(--popover),0_0_0_3.5px_var(--foreground)]"
                      : "border-border",
                  )}
                  style={{ backgroundColor: option.hex_code }}
                />
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="text-xs text-text-secondary">
              Ningún color coincide con la búsqueda.
            </p>
          ) : null}
        </>
      )}

      <p className="text-xs text-text-secondary">
        {selectedOption
          ? selectedOption.name
          : isDefault
            ? "Color por defecto"
            : color}
      </p>
    </div>
  );
}

type PersonalizationColorPopoverProps = {
  open: boolean;
  selectedPart: CapPartId | null;
  partColors: CapPartColors;
  paletteColors: PaletteColor[] | null;
  anchorRef: RefObject<Element | null>;
  onPartColorChange: (part: CapPartId, color: string) => void;
  onOpenChange: (open: boolean) => void;
  shouldIgnoreOutsidePress: (target: EventTarget | null) => boolean;
};

export function PersonalizationColorPopover({
  open,
  selectedPart,
  partColors,
  paletteColors,
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
        className="w-56 p-2.5"
        initialFocus={false}
        finalFocus={false}
      >
        {selectedPart ? (
          <PersonalizationColorFields
            part={selectedPart}
            color={partColors[selectedPart]}
            paletteColors={paletteColors}
            onColorChange={(color) => {
              if (isPaletteColorForPart(selectedPart, color, paletteColors ?? [])) {
                onPartColorChange(selectedPart, color);
              }
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
