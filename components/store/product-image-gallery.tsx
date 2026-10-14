"use client";

import Image from "next/image";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import { cn } from "cn";
import type { PublishedProductImage } from "@/types/products";

type ProductImageGalleryProps = {
  images: PublishedProductImage[];
  productName: string;
};

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const labelId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  const count = images.length;
  const safeIndex =
    count === 0 ? 0 : Math.min(Math.max(activeIndex, 0), count - 1);
  const active = count > 0 ? images[safeIndex] : null;
  const activeUrl = active
    ? getCatalogImagePublicUrl(active.storage_path)
    : null;
  const activeAlt = active?.alt_text?.trim() || productName;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) {
        return;
      }
      const next = ((index % count) + count) % count;
      setActiveIndex(next);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(safeIndex - 1), [safeIndex, goTo]);
  const goNext = useCallback(() => goTo(safeIndex + 1), [safeIndex, goTo]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (count <= 1) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null || count <= 1) {
      pointerStartX.current = null;
      return;
    }
    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < 40) {
      return;
    }
    if (delta > 0) {
      goPrev();
    } else {
      goNext();
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="region"
        aria-labelledby={labelId}
        aria-roledescription="carrusel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl"
      >
        <p id={labelId} className="sr-only">
          Galería de imágenes de {productName}. Usa las flechas del teclado
          para cambiar de imagen.
        </p>

        <div
          className={cn(
            "grid gap-3",
            count > 1 && "sm:grid-cols-[4.5rem_minmax(0,1fr)]",
          )}
        >
          <div
            className={cn("relative", count > 1 && "order-1 sm:order-2")}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <button
              type="button"
              className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted text-left transition-opacity hover:opacity-95"
              onClick={() => {
                if (activeUrl) {
                  setLightboxOpen(true);
                }
              }}
              disabled={!activeUrl}
              aria-label={
                activeUrl
                  ? `Ampliar imagen ${safeIndex + 1} de ${count}`
                  : "Sin imagen disponible"
              }
            >
              {activeUrl ? (
                <Image
                  src={activeUrl}
                  alt={activeAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-12" aria-hidden />
                </span>
              )}
            </button>

            {count > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 size-10 -translate-y-1/2 shadow-sm"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 size-10 -translate-y-1/2 shadow-sm"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight aria-hidden />
                </Button>
                <p
                  className="absolute right-2 bottom-2 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground ring-1 ring-border"
                  aria-live="polite"
                >
                  {safeIndex + 1} / {count}
                </p>
              </>
            ) : null}
          </div>

          {count > 1 ? (
            <ul
              className="order-2 flex flex-wrap gap-2 sm:order-1 sm:max-h-full sm:flex-col sm:flex-nowrap sm:overflow-y-auto"
              aria-label="Todas las fotos"
            >
              {images.map((image, index) => {
                const url = getCatalogImagePublicUrl(image.storage_path);
                const alt =
                  image.alt_text?.trim() || `${productName} ${index + 1}`;
                const isActive = index === safeIndex;

                return (
                  <li key={image.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Ver imagen ${index + 1} de ${count}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative size-14 overflow-hidden rounded-md border bg-muted outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-[4.5rem]",
                        isActive
                          ? "border-primary"
                          : "border-border/70 hover:border-primary/50",
                      )}
                    >
                      <Image
                        src={url}
                        alt={alt}
                        fill
                        className="object-cover"
                        sizes="72px"
                        unoptimized
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-3xl border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">{activeAlt}</DialogTitle>
          {activeUrl ? (
            <div className="relative mx-auto aspect-square w-full max-w-[min(90vw,36rem)] overflow-hidden rounded-xl bg-background">
              <Image
                src={activeUrl}
                alt={activeAlt}
                fill
                className="object-cover"
                sizes="90vw"
                unoptimized
              />
            </div>
          ) : null}
          {count > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={goPrev}
                aria-label="Imagen anterior"
              >
                <ChevronLeft aria-hidden />
              </Button>
              <p className="min-w-14 text-center text-sm tabular-nums text-background">
                {safeIndex + 1} / {count}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={goNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
