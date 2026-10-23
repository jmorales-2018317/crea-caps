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
  previewUrl?: string | null;
  isProcessing?: boolean;
  error?: string | null;
  multiple?: boolean;
  remainingSlots?: number;
  compact?: boolean;
  idleLabel?: string;
  ariaLabel?: string;
  onFilesSelected: (files: File[]) => void;
  onClear?: () => void;
};

export function PersonalizationLogoDropzone({
  previewUrl = null,
  isProcessing = false,
  error = null,
  multiple = false,
  remainingSlots,
  compact = false,
  idleLabel,
  ariaLabel,
  onFilesSelected,
  onClear,
}: PersonalizationLogoDropzoneProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDragDepthRef = useRef(0);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const isBusy = isProcessing;
  const canTakeMore = remainingSlots == null || remainingSlots > 0;
  const allowMultiple = multiple && (remainingSlots == null || remainingSlots > 1);

  const isFileDragEvent = (event: ReactDragEvent) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const resetFileDragState = () => {
    fileDragDepthRef.current = 0;
    setIsFileDragOver(false);
  };

  const emitFiles = (list: FileList | File[] | null) => {
    if (!list) {
      return;
    }
    const files = Array.from(list);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileDragEnter = (event: ReactDragEvent) => {
    if (!isFileDragEvent(event) || isBusy || !canTakeMore) {
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
    if (!isFileDragEvent(event) || isBusy || !canTakeMore) {
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
    if (isBusy || !canTakeMore) {
      return;
    }
    emitFiles(event.dataTransfer.files);
  };

  const openFilePicker = () => {
    if (!isBusy && canTakeMore) {
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
    emitFiles(event.target.files);
    event.target.value = "";
  };

  const resolvedIdleLabel =
    idleLabel ??
    (previewUrl
      ? "Cambiar imagen"
      : allowMultiple
        ? "Arrastra tus logos aquí"
        : "Arrastra tu logo aquí");

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple={allowMultiple}
        className="sr-only"
        disabled={isBusy || !canTakeMore}
        aria-label={
          ariaLabel ??
          (previewUrl
            ? "Cambiar esta imagen"
            : allowMultiple
              ? "Sube uno o varios logos"
              : "Sube un logo")
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      />
      <div className="relative">
        <div
          role="button"
          tabIndex={isBusy || !canTakeMore ? -1 : 0}
          aria-disabled={isBusy || !canTakeMore}
          aria-label={
            previewUrl
              ? "Zona para cambiar esta imagen"
              : "Zona para soltar o seleccionar logos"
          }
          onClick={openFilePicker}
          onKeyDown={handleDropZoneKeyDown}
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragOver={handleFileDragOver}
          onDrop={handleFileDrop}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed text-left transition-colors duration-200 motion-reduce:transition-none",
            compact ? "min-h-14 px-2.5 py-2" : "min-h-16 px-3 py-3",
            isFileDragOver
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/30 hover:border-primary/40",
            previewUrl && onClear && "pr-10",
            (isBusy || !canTakeMore) && "pointer-events-none opacity-60",
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="size-10 shrink-0 object-contain"
            />
          ) : (
            <ImagePlus
              className="size-6 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {isBusy
                ? "Procesando…"
                : isFileDragOver
                  ? allowMultiple
                    ? "Suelta los logos aquí"
                    : "Suelta el logo aquí"
                  : resolvedIdleLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {allowMultiple
                ? "o haz clic para seleccionar archivos"
                : "o haz clic para seleccionar un archivo"}
            </p>
          </div>
        </div>
        {previewUrl && onClear ? (
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
    </div>
  );
}
