"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { CATALOG_IMAGE_MIME_TYPES } from "@/lib/catalog-images";

const ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(",");

type PersonalizationLogoDropzoneProps = {
  previewUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
};

export function PersonalizationLogoDropzone({
  previewUrl,
  isProcessing,
  error,
  onFileSelected,
  onClear,
}: PersonalizationLogoDropzoneProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDragDepthRef = useRef(0);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const isBusy = isProcessing;

  const isFileDragEvent = (event: ReactDragEvent) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const resetFileDragState = () => {
    fileDragDepthRef.current = 0;
    setIsFileDragOver(false);
  };

  const handleFileDragEnter = (event: ReactDragEvent) => {
    if (!isFileDragEvent(event) || isBusy) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    fileDragDepthRef.current += 1;
    setIsFileDragOver(true);
  };

  const handleFileDragLeave = (event: ReactDragEvent) => {
    if (!isFileDragEvent(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    fileDragDepthRef.current -= 1;
    if (fileDragDepthRef.current <= 0) {
      resetFileDragState();
    }
  };

  const handleFileDragOver = (event: ReactDragEvent) => {
    if (!isFileDragEvent(event) || isBusy) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleFileDrop = (event: ReactDragEvent) => {
    if (!isFileDragEvent(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    resetFileDragState();
    if (isBusy) {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const openFilePicker = () => {
    if (!isBusy) {
      inputRef.current?.click();
    }
  };

  const handleDropZoneKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-strong">Logo frontal</p>
      <p className="text-xs leading-relaxed text-text-secondary">
        JPEG, PNG, WebP o AVIF. Máximo 5 MB.
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={isBusy}
        aria-label="Sube un logo para el frente de la gorra"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      />
      <div className="relative">
        <div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          aria-disabled={isBusy}
          aria-label="Zona para soltar o seleccionar un logo"
          onClick={openFilePicker}
          onKeyDown={handleDropZoneKeyDown}
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragOver={handleFileDragOver}
          onDrop={handleFileDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center transition-colors duration-200 motion-reduce:transition-none",
            isFileDragOver
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/30 hover:border-primary/40",
            isBusy && "pointer-events-none opacity-60",
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="mb-2 max-h-16 max-w-full object-contain"
            />
          ) : (
            <ImagePlus
              className="mb-2 size-7 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-medium text-foreground">
            {isBusy
              ? "Procesando…"
              : isFileDragOver
                ? "Suelta el logo aquí"
                : previewUrl
                  ? "Cambiar logo"
                  : "Arrastra tu logo aquí"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            o haz clic para seleccionar un archivo
          </p>
        </div>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1.5 right-1.5 z-10 cursor-pointer bg-background/80 text-text-secondary shadow-sm backdrop-blur-sm hover:bg-destructive/15 hover:text-destructive"
            aria-label="Quitar logo"
            onClick={onClear}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {previewUrl ? "Logo aplicado en el frente de la gorra." : ""}
      </p>
    </div>
  );
}
