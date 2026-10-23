"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Upload } from "lucide-react";
import { cn } from "cn";
import { CATALOG_IMAGE_MIME_TYPES } from "@/lib/catalog-images";

const ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(",");

type PersonalizationLogoDropzoneProps = {
  error?: string | null;
  multiple?: boolean;
  remainingSlots?: number;
  idleLabel?: string;
  ariaLabel?: string;
  onFilesSelected: (files: File[]) => void;
};

export function PersonalizationLogoDropzone({
  error = null,
  multiple = false,
  remainingSlots,
  idleLabel,
  ariaLabel,
  onFilesSelected,
}: PersonalizationLogoDropzoneProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDragDepthRef = useRef(0);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

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
    if (!isFileDragEvent(event) || !canTakeMore) {
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
    if (!isFileDragEvent(event) || !canTakeMore) {
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
    if (!canTakeMore) {
      return;
    }
    emitFiles(event.dataTransfer.files);
  };

  const openFilePicker = () => {
    if (canTakeMore) {
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
    (allowMultiple ? "Arrastra tus logos aquí" : "Arrastra tu logo aquí");

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple={allowMultiple}
        className="sr-only"
        disabled={!canTakeMore}
        aria-label={
          ariaLabel ??
          (allowMultiple ? "Sube uno o varios logos" : "Sube un logo")
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      />
      <div
        role="button"
        tabIndex={canTakeMore ? 0 : -1}
        aria-disabled={!canTakeMore}
        aria-label="Zona para soltar o seleccionar logos"
        onClick={openFilePicker}
        onKeyDown={handleDropZoneKeyDown}
        onDragEnter={handleFileDragEnter}
        onDragLeave={handleFileDragLeave}
        onDragOver={handleFileDragOver}
        onDrop={handleFileDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center transition-colors duration-200 motion-reduce:transition-none",
          isFileDragOver
            ? "border-primary bg-primary/10"
            : "border-[#e8d9a8]/28 bg-muted/20 hover:border-primary/45 hover:bg-primary/5",
          !canTakeMore && "pointer-events-none opacity-60",
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border text-gold-soft",
            isFileDragOver
              ? "border-primary/40 bg-primary/10"
              : "border-[#e8d9a8]/22 bg-[#e8d9a8]/6",
          )}
          aria-hidden="true"
        >
          <Upload className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {isFileDragOver
              ? allowMultiple
                ? "Suelta los logos aquí"
                : "Suelta el logo aquí"
              : resolvedIdleLabel}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {canTakeMore
              ? allowMultiple
                ? "o haz clic para seleccionar archivos"
                : "o haz clic para seleccionar un archivo"
              : "Quita un logo para añadir otro"}
          </p>
          <p className="mt-2 text-[10px] font-medium tracking-[0.14em] text-text-subtle uppercase">
            JPEG, PNG, WebP o AVIF · Máx. 5 MB c/u
          </p>
        </div>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
