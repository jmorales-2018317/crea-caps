"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProductImages } from "@/hooks/use-product-images";
import {
  CATALOG_IMAGE_MIME_TYPES,
  getCatalogImagePublicUrl,
  validateImageFile,
} from "@/lib/catalog-images";
import type { ProductImage } from "@/types/products";
import { cn } from "cn";

export type PendingProductImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type ProductImagesDraft = {
  savedImages: ProductImage[];
  baselineImages: ProductImage[];
  removedImageIds: string[];
};

type ProductImagesFieldProps = {
  productId?: string;
  disabled?: boolean;
  pendingImages: PendingProductImage[];
  onPendingImagesChange: (images: PendingProductImage[]) => void;
  onDraftChange?: (draft: ProductImagesDraft) => void;
};

const ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(",");
const SAVED_SORTABLE_TYPE = "product-image-saved";
const PENDING_SORTABLE_TYPE = "product-image-pending";

function arrayMoveByIndex<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [removed] = next.splice(from, 1);
  if (removed === undefined) {
    return items;
  }
  next.splice(to, 0, removed);
  return next;
}

type SortableSavedImageProps = {
  image: ProductImage;
  index: number;
  total: number;
  disabled: boolean;
  itemBusy: boolean;
  onSetPrimary: (imageId: string) => void;
  onMove: (imageId: string, direction: -1 | 1) => void;
  onDelete: (image: ProductImage) => void;
};

function SortableSavedImage({
  image,
  index,
  total,
  disabled,
  itemBusy,
  onSetPrimary,
  onMove,
  onDelete,
}: SortableSavedImageProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: image.id,
    index,
    group: "saved",
    type: SAVED_SORTABLE_TYPE,
    accept: SAVED_SORTABLE_TYPE,
    disabled,
  });
  const url = getCatalogImagePublicUrl(image.storage_path);

  return (
    <li
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-muted/30",
        image.is_primary && "ring-2 ring-foreground/40",
        isDragging && "z-10 opacity-70 shadow-md",
      )}
    >
      <div className="relative aspect-square">
        {url ? (
          <Image
            src={url}
            alt={image.alt_text ?? "Imagen del producto"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : null}
        {image.is_primary ? (
          <span className="absolute left-2 top-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            Principal
          </span>
        ) : null}
        {itemBusy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}
      </div>
      <TooltipProvider delay={300}>
        <div className="flex flex-wrap items-center gap-1 border-t border-border p-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  ref={handleRef}
                  className={cn(
                    "inline-flex size-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                  disabled={disabled}
                  aria-label="Arrastrar para reordenar"
                />
              }
            >
              <GripVertical className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Arrastrar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={disabled || image.is_primary}
                  aria-label="Marcar como principal"
                  onClick={() => {
                    onSetPrimary(image.id);
                  }}
                />
              }
            >
              <Star
                className={cn("size-4", image.is_primary && "fill-current")}
              />
            </TooltipTrigger>
            <TooltipContent>
              {image.is_primary ? "Imagen principal" : "Marcar como principal"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={disabled || index === 0}
                  aria-label="Subir en el orden"
                  onClick={() => {
                    onMove(image.id, -1);
                  }}
                />
              }
            >
              <ArrowUp className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Subir</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={disabled || index === total - 1}
                  aria-label="Bajar en el orden"
                  onClick={() => {
                    onMove(image.id, 1);
                  }}
                />
              }
            >
              <ArrowDown className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Bajar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  disabled={disabled}
                  aria-label="Eliminar imagen"
                  onClick={() => onDelete(image)}
                />
              }
            >
              <Trash2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Eliminar</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </li>
  );
}

type SortablePendingImageProps = {
  item: PendingProductImage;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
};

function SortablePendingImage({
  item,
  index,
  total,
  disabled,
  onMove,
  onRemove,
}: SortablePendingImageProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: item.id,
    index,
    group: "pending",
    type: PENDING_SORTABLE_TYPE,
    accept: PENDING_SORTABLE_TYPE,
    disabled,
  });

  return (
    <li
      ref={ref}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-muted/30",
        isDragging && "z-10 opacity-70 shadow-md",
      )}
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
        <img
          src={item.previewUrl}
          alt={item.file.name}
          className="size-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          Pendiente
        </span>
      </div>
      <TooltipProvider delay={300}>
        <div className="flex flex-wrap items-center gap-1 border-t border-border p-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  ref={handleRef}
                  className={cn(
                    "inline-flex size-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                  disabled={disabled}
                  aria-label="Arrastrar para reordenar"
                />
              }
            >
              <GripVertical className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Arrastrar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={disabled || index === 0}
                  aria-label="Subir en el orden"
                  onClick={() => onMove(item.id, -1)}
                />
              }
            >
              <ArrowUp className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Subir</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={disabled || index === total - 1}
                  aria-label="Bajar en el orden"
                  onClick={() => onMove(item.id, 1)}
                />
              }
            >
              <ArrowDown className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Bajar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  disabled={disabled}
                  aria-label="Quitar imagen pendiente"
                  onClick={() => onRemove(item.id)}
                />
              }
            >
              <Trash2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Eliminar</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </li>
  );
}

export function ProductImagesField({
  productId,
  disabled = false,
  pendingImages,
  onPendingImagesChange,
  onDraftChange,
}: ProductImagesFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const savedDragSnapshotRef = useRef<ProductImage[] | null>(null);
  const fileDragDepthRef = useRef(0);
  const draftDirtyRef = useRef(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [orderedSaved, setOrderedSaved] = useState<ProductImage[]>([]);
  const [baselineSaved, setBaselineSaved] = useState<ProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const imagesQuery = useProductImages(productId);

  useEffect(() => {
    if (!imagesQuery.data || isDraggingRef.current || draftDirtyRef.current) {
      return;
    }
    setOrderedSaved(imagesQuery.data);
    setBaselineSaved(imagesQuery.data);
  }, [imagesQuery.data]);

  useEffect(() => {
    onDraftChange?.({
      savedImages: orderedSaved,
      baselineImages: baselineSaved,
      removedImageIds,
    });
  }, [baselineSaved, onDraftChange, orderedSaved, removedImageIds]);

  const markDraftDirty = useCallback(() => {
    draftDirtyRef.current = true;
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setLocalError(null);
      const files = Array.from(fileList);
      if (files.length === 0) {
        return;
      }

      const next: PendingProductImage[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const validationError = validateImageFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          continue;
        }
        next.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (errors.length > 0) {
        setLocalError(errors.join(" "));
      }

      if (next.length === 0) {
        return;
      }

      markDraftDirty();
      onPendingImagesChange([...pendingImages, ...next]);
    },
    [markDraftDirty, onPendingImagesChange, pendingImages],
  );

  const removePending = useCallback(
    (id: string) => {
      const target = pendingImages.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      markDraftDirty();
      onPendingImagesChange(pendingImages.filter((item) => item.id !== id));
    },
    [markDraftDirty, onPendingImagesChange, pendingImages],
  );

  const updateSavedOrder = (next: ProductImage[]) => {
    markDraftDirty();
    setOrderedSaved(next);
  };

  const moveSaved = (imageId: string, direction: -1 | 1) => {
    const index = orderedSaved.findIndex((image) => image.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= orderedSaved.length) {
      return;
    }
    updateSavedOrder(arrayMoveByIndex(orderedSaved, index, target));
  };

  const movePending = (id: string, direction: -1 | 1) => {
    const index = pendingImages.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= pendingImages.length) {
      return;
    }
    markDraftDirty();
    onPendingImagesChange(arrayMoveByIndex(pendingImages, index, target));
  };

  const handleSetPrimary = (imageId: string) => {
    markDraftDirty();
    setOrderedSaved((current) =>
      current.map((image) => ({
        ...image,
        is_primary: image.id === imageId,
      })),
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }
    markDraftDirty();
    setRemovedImageIds((current) =>
      current.includes(deleteTarget.id)
        ? current
        : [...current, deleteTarget.id],
    );
    setOrderedSaved((current) => {
      const next = current.filter((image) => image.id !== deleteTarget.id);
      if (deleteTarget.is_primary && next.length > 0 && next[0]) {
        return next.map((image, index) => ({
          ...image,
          is_primary: index === 0,
        }));
      }
      return next;
    });
    setDeleteTarget(null);
  };

  const isBusy = disabled;
  const hasImages = orderedSaved.length > 0 || pendingImages.length > 0;
  const isLoadingSaved = Boolean(productId) && imagesQuery.isPending;

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
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
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

  const fileDropHandlers = {
    onDragEnter: handleFileDragEnter,
    onDragLeave: handleFileDragLeave,
    onDragOver: handleFileDragOver,
    onDrop: handleFileDrop,
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        JPEG, PNG, WebP o AVIF. Máximo 5 MB por archivo. Arrastra archivos aquí
        o haz clic en la zona para seleccionarlos; usa el asa para reordenar.
        Los cambios de imágenes se aplican al guardar.
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        disabled={isBusy}
        onChange={(event) => {
          if (event.target.files) {
            addFiles(event.target.files);
          }
          event.target.value = "";
        }}
      />

      {localError ? (
        <p className="text-sm text-destructive" role="alert">
          {localError}
        </p>
      ) : null}

      {isLoadingSaved ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {productId && imagesQuery.isError ? (
        <p className="text-sm text-destructive" role="alert">
          No se pudieron cargar las imágenes guardadas.
        </p>
      ) : null}

      {!isLoadingSaved && !hasImages ? (
        <div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          aria-disabled={isBusy}
          aria-label="Zona para soltar o seleccionar imágenes"
          onClick={openFilePicker}
          onKeyDown={handleDropZoneKeyDown}
          {...fileDropHandlers}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-colors",
            isFileDragOver
              ? "border-foreground bg-muted/60"
              : "border-border bg-muted/20 hover:border-foreground/40",
            isBusy && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {isFileDragOver
              ? "Suelta las imágenes aquí"
              : "Arrastra imágenes aquí"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            o haz clic para seleccionar archivos
          </p>
        </div>
      ) : null}

      {!isLoadingSaved && hasImages ? (
        <div
          {...fileDropHandlers}
          className={cn(
            "space-y-3 rounded-lg border border-dashed p-3 transition-colors",
            isFileDragOver
              ? "border-foreground bg-muted/60"
              : "border-border bg-muted/20",
            isBusy && "opacity-60",
          )}
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={openFilePicker}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-center text-xs text-muted-foreground transition-colors",
              "hover:bg-muted/80 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <ImagePlus className="size-3.5 shrink-0" />
            <span>
              {isFileDragOver
                ? "Suelta para añadir más imágenes"
                : "Arrastra más imágenes aquí o haz clic para seleccionar"}
            </span>
          </button>
          <DragDropProvider
            onDragStart={() => {
              isDraggingRef.current = true;
              savedDragSnapshotRef.current = orderedSaved;
            }}
            onDragEnd={(event) => {
              isDraggingRef.current = false;

              if (event.canceled) {
                if (savedDragSnapshotRef.current) {
                  setOrderedSaved(savedDragSnapshotRef.current);
                }
                savedDragSnapshotRef.current = null;
                return;
              }
              savedDragSnapshotRef.current = null;

              const { source } = event.operation;
              if (
                !isSortable(source) ||
                source.initialIndex === source.index
              ) {
                return;
              }

              if (source.group === "saved") {
                updateSavedOrder(move(orderedSaved, event));
                return;
              }

              if (source.group === "pending") {
                markDraftDirty();
                onPendingImagesChange(move(pendingImages, event));
              }
            }}
          >
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {orderedSaved.map((image, index) => (
                <SortableSavedImage
                  key={image.id}
                  image={image}
                  index={index}
                  total={orderedSaved.length}
                  disabled={isBusy}
                  itemBusy={false}
                  onSetPrimary={handleSetPrimary}
                  onMove={moveSaved}
                  onDelete={setDeleteTarget}
                />
              ))}

              {pendingImages.map((item, index) => (
                <SortablePendingImage
                  key={item.id}
                  item={item}
                  index={index}
                  total={pendingImages.length}
                  disabled={isBusy}
                  onMove={movePending}
                  onRemove={removePending}
                />
              ))}
            </ul>
          </DragDropProvider>
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar imagen</AlertDialogTitle>
            <AlertDialogDescription>
              La imagen se quitará de la galería y se eliminará al guardar el
              producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBusy}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
