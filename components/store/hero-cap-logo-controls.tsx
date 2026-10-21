"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG_IMAGE_MIME_TYPES } from "@/lib/catalog-images";

type HeroCapLogoControlsProps = {
  previewUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
};

const ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(",");

export function HeroCapLogoControls({
  previewUrl,
  isProcessing,
  error,
  onFileSelected,
  onClear,
}: HeroCapLogoControlsProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-2 sm:bottom-0 sm:top-auto">
      <div
        className="pointer-events-auto flex max-w-full flex-col items-center gap-1.5"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full border border-[#e8d9a8]/30 bg-background/80 p-1 shadow-[0_8px_24px_rgb(0_0_0_/_0.28)] backdrop-blur-md">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={isProcessing}
            aria-label="Sube un logo para el frente de la gorra"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            className="h-8 rounded-full px-3 text-xs text-text-strong hover:bg-[#e8d9a8]/12 sm:text-[0.8rem]"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-3.5" aria-hidden />
            {isProcessing
              ? "Procesando…"
              : previewUrl
                ? "Cambiar logo"
                : "Sube tu logo"}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-text-secondary hover:bg-[#e8d9a8]/12 hover:text-text-strong"
              aria-label="Quitar logo"
              onClick={onClear}
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          ) : null}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="max-w-[16rem] text-center text-[0.7rem] leading-snug text-destructive"
          >
            {error}
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {previewUrl ? "Logo aplicado en el frente de la gorra." : ""}
        </p>
      </div>
    </div>
  );
}
