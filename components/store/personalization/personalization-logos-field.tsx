"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { PersonalizationLogoDropzone } from "@/components/store/personalization/personalization-logo-dropzone";
import { PersonalizationLogoPlacement } from "@/components/store/personalization/personalization-logo-placement";
import { PersonalizationLogoSizeControl } from "@/components/store/personalization/personalization-logo-size-control";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/catalog-images";
import {
  LOGO_PLACEMENT_FULL_LABELS,
  MAX_PERSONALIZATION_LOGOS,
  getLogoSizePxDefault,
  getLogoSizePxMax,
  sanitizeLogoSizePx,
  takeAvailableLogoPlacements,
  type LogoPlacement,
  type PersonalizationLogoDraft,
} from "@/types/personalization";

export type PersonalizationLogoItem = PersonalizationLogoDraft & {
  error?: string | null;
  isProcessing?: boolean;
};

type PersonalizationLogosFieldProps = {
  logos: PersonalizationLogoItem[];
  onLogosChange: (logos: PersonalizationLogoItem[]) => void;
};

function createLogoId() {
  return crypto.randomUUID();
}

function occupiedPlacements(
  logos: readonly PersonalizationLogoItem[],
  exceptId?: string,
): LogoPlacement[] {
  return logos
    .filter((logo) => logo.id !== exceptId)
    .map((logo) => logo.placement);
}

export function appendLogoFiles(
  current: PersonalizationLogoItem[],
  files: File[],
): { logos: PersonalizationLogoItem[]; error: string | null } {
  const remaining = MAX_PERSONALIZATION_LOGOS - current.length;
  if (remaining <= 0) {
    return {
      logos: current,
      error: `Ya usaste las ${MAX_PERSONALIZATION_LOGOS} posiciones disponibles.`,
    };
  }

  const accepted: File[] = [];
  let fileError: string | null = null;
  for (const file of files) {
    if (accepted.length >= remaining) {
      break;
    }
    const validationError = validateImageFile(file);
    if (validationError) {
      fileError = validationError;
      continue;
    }
    accepted.push(file);
  }

  if (accepted.length === 0) {
    return {
      logos: current,
      error: fileError ?? "No se pudo leer la imagen.",
    };
  }

  const placements = takeAvailableLogoPlacements(
    occupiedPlacements(current),
    accepted.length,
  );
  const next = [
    ...current,
    ...accepted.map((file, index) => ({
      id: createLogoId(),
      url: URL.createObjectURL(file),
      placement: placements[index]!,
      sizePx: getLogoSizePxDefault(placements[index]!),
      isProcessing: true,
      error: null,
    })),
  ];

  let overflowError: string | null = null;
  if (files.length > accepted.length && remaining < files.length) {
    overflowError =
      remaining - accepted.length <= 0
        ? `Solo se añadieron ${accepted.length} logo${accepted.length === 1 ? "" : "s"}. No quedan posiciones libres.`
        : `Solo se añadieron ${accepted.length} logo${accepted.length === 1 ? "" : "s"} por el límite de posiciones.`;
  }

  return { logos: next, error: overflowError ?? fileError };
}

export function revokeLogoUrls(logos: readonly PersonalizationLogoItem[]) {
  for (const logo of logos) {
    if (logo.url.startsWith("blob:")) {
      URL.revokeObjectURL(logo.url);
    }
  }
}

export function PersonalizationLogosField({
  logos,
  onLogosChange,
}: PersonalizationLogosFieldProps) {
  const [addError, setAddError] = useState<string | null>(null);
  const [openLogoIds, setOpenLogoIds] = useState<string[]>([]);
  const remaining = MAX_PERSONALIZATION_LOGOS - logos.length;

  const handleAddFiles = (files: File[]) => {
    const { logos: next, error } = appendLogoFiles(logos, files);
    setAddError(error);
    const previousIds = new Set(logos.map((logo) => logo.id));
    const addedIds = next
      .filter((logo) => !previousIds.has(logo.id))
      .map((logo) => logo.id);
    if (addedIds.length > 0) {
      setOpenLogoIds([addedIds[addedIds.length - 1]!]);
    }
    onLogosChange(next);
  };

  const handleClear = (logoId: string) => {
    const target = logos.find((logo) => logo.id === logoId);
    if (target?.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    setAddError(null);
    setOpenLogoIds((current) => current.filter((id) => id !== logoId));
    onLogosChange(logos.filter((logo) => logo.id !== logoId));
  };

  return (
    <div className="space-y-3">
      <PersonalizationLogoDropzone
        multiple
        remainingSlots={remaining}
        error={addError}
        idleLabel={remaining <= 0 ? "Sin posiciones libres" : undefined}
        onFilesSelected={handleAddFiles}
      />

      {logos.length > 0 ? (
        <Accordion
          value={openLogoIds}
          onValueChange={(next) => setOpenLogoIds(next.map(String).slice(-1))}
          className="gap-2"
        >
          {logos.map((logo) => {
            const placementLabel = LOGO_PLACEMENT_FULL_LABELS[logo.placement];
            return (
              <AccordionItem
                key={logo.id}
                value={logo.id}
                className="overflow-hidden rounded-xl border border-border/80 bg-muted/20 px-4"
              >
                <div className="flex items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger
                      className="cursor-pointer items-center gap-3 py-2 hover:no-underline"
                      aria-label={`Editar posición y tamaño: ${placementLabel}`}
                    >
                      <span className="relative size-10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logo.url}
                          alt=""
                          className="size-10 object-contain"
                        />
                        {logo.isProcessing ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                            <Loader2
                              className="size-4 animate-spin text-muted-foreground"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left">
                        {logo.isProcessing ? "Procesando…" : placementLabel}
                      </span>
                    </AccordionTrigger>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer text-text-secondary hover:bg-destructive/15 hover:text-destructive"
                    aria-label={`Quitar logo de ${placementLabel}`}
                    onClick={() => handleClear(logo.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
                {logo.error ? (
                  <p role="alert" className="pb-2 text-sm text-destructive">
                    {logo.error}
                  </p>
                ) : null}
                <AccordionContent className="border-t border-border/60 pt-3 pb-3 [&_p:not(:last-child)]:mb-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-end gap-x-2 gap-y-3">
                    <PersonalizationLogoPlacement
                      logoId={logo.id}
                      value={logo.placement}
                      occupied={occupiedPlacements(logos, logo.id)}
                      onChange={(placement) => {
                        onLogosChange(
                          logos.map((item) =>
                            item.id === logo.id
                              ? {
                                  ...item,
                                  placement,
                                  sizePx: sanitizeLogoSizePx(
                                    item.sizePx,
                                    placement,
                                  ),
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                    <PersonalizationLogoSizeControl
                      value={sanitizeLogoSizePx(logo.sizePx, logo.placement)}
                      max={getLogoSizePxMax(logo.placement)}
                      label="Tamaño"
                      onChange={(sizePx) => {
                        onLogosChange(
                          logos.map((item) =>
                            item.id === logo.id
                              ? {
                                  ...item,
                                  sizePx: sanitizeLogoSizePx(
                                    sizePx,
                                    item.placement,
                                  ),
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : null}
    </div>
  );
}
