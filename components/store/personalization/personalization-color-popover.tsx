"use client";

import { useMemo, useState, type RefObject } from "react";
import type { PopoverRootChangeEventDetails } from "@base-ui/react/popover";
import { Search, XIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  CAP_PART_LABELS,
  getSelectableColorsForPart,
  isBlackWhiteCapPart,
  isPaletteColorForPart,
  type CapPartColors,
  type CapPartId,
  type PaletteColor,
} from "@/types/personalization";

export type ColorPickerOrigin = "viewer" | "sidebar";

export const COLOR_POPOVER_CONTENT_CLASS = "w-80 p-4";

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

  const isBlackWhite = isBlackWhiteCapPart(part);

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <PopoverTitle className="min-w-0 text-xs leading-snug font-medium text-foreground">
          Color de {CAP_PART_LABELS[part]}
        </PopoverTitle>
        <PopoverClose
          aria-label="Cerrar"
          className="mt-0.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-3.5" aria-hidden="true" />
        </PopoverClose>
      </div>
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
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nombre o hex"
              aria-label={`Buscar color para ${CAP_PART_LABELS[part]}`}
              className="h-8 bg-muted pl-7 text-base md:h-7 md:text-sm"
            />
          </div>
          <div
            role="radiogroup"
            aria-label={`Paleta de ${CAP_PART_LABELS[part]}`}
            className="grid max-h-56 grid-cols-2 content-start gap-2 overflow-y-auto"
          >
            {filtered.map((option) => {
              const selected = option.hex_code === color;
              return (
                <PopoverClose
                  key={option.id}
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-auto w-full min-w-0 justify-start gap-2 bg-popover px-2 py-1.5 text-xs",
                        selected && "bg-muted",
                      )}
                    />
                  }
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => onColorChange(option.hex_code)}
                >
                  <span
                    className="size-5 shrink-0 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: option.hex_code }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{option.name}</span>
                </PopoverClose>
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
        className={COLOR_POPOVER_CONTENT_CLASS}
        initialFocus={false}
        finalFocus={false}
      >
        {selectedPart ? (
          <PersonalizationColorFields
            key={selectedPart}
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
