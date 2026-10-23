"use client";

import { useState } from "react";
import { PersonalizationLogoDropzone } from "@/components/store/personalization/personalization-logo-dropzone";
import { PersonalizationLogoPlacement } from "@/components/store/personalization/personalization-logo-placement";
import { PersonalizationLogoSizeControl } from "@/components/store/personalization/personalization-logo-size-control";
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
      error: "Ya usaste las 5 posiciones disponibles.",
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

export function replaceLogoFile(
  current: PersonalizationLogoItem[],
  logoId: string,
  file: File,
): PersonalizationLogoItem[] | null {
  const validationError = validateImageFile(file);
  const target = current.find((logo) => logo.id === logoId);
  if (!target) {
    return null;
  }
  if (validationError) {
    return current.map((logo) =>
      logo.id === logoId ? { ...logo, error: validationError } : logo,
    );
  }

  if (target.url.startsWith("blob:")) {
    URL.revokeObjectURL(target.url);
  }

  return current.map((logo) =>
    logo.id === logoId
      ? {
          ...logo,
          url: URL.createObjectURL(file),
          isProcessing: true,
          error: null,
        }
      : logo,
  );
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
  const remaining = MAX_PERSONALIZATION_LOGOS - logos.length;

  const handleAddFiles = (files: File[]) => {
    const { logos: next, error } = appendLogoFiles(logos, files);
    setAddError(error);
    onLogosChange(next);
  };

  const handleReplace = (logoId: string, files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    const next = replaceLogoFile(logos, logoId, file);
    if (next) {
      setAddError(null);
      onLogosChange(next);
    }
  };

  const handleClear = (logoId: string) => {
    const target = logos.find((logo) => logo.id === logoId);
    if (target?.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    setAddError(null);
    onLogosChange(logos.filter((logo) => logo.id !== logoId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs leading-relaxed text-text-secondary">
          JPEG, PNG, WebP o AVIF. Máximo 5 MB. Una imagen por posición: visera o
          panel frontal.
        </p>
        <p className="shrink-0 text-xs tabular-nums text-text-secondary">
          {logos.length}/{MAX_PERSONALIZATION_LOGOS}
        </p>
      </div>

      {logos.length === 0 ? (
        <PersonalizationLogoDropzone
          multiple
          remainingSlots={remaining}
          error={addError}
          onFilesSelected={handleAddFiles}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {logos.map((logo, index) => (
              <li
                key={logo.id}
                className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3"
              >
                <PersonalizationLogoDropzone
                  compact
                  previewUrl={logo.url}
                  isProcessing={logo.isProcessing}
                  error={logo.error ?? null}
                  ariaLabel={`Cambiar logo ${index + 1} en ${LOGO_PLACEMENT_FULL_LABELS[logo.placement]}`}
                  onFilesSelected={(files) => handleReplace(logo.id, files)}
                  onClear={() => handleClear(logo.id)}
                />
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
                              sizePx: sanitizeLogoSizePx(item.sizePx, placement),
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
              </li>
            ))}
          </ul>
          {remaining > 0 ? (
            <PersonalizationLogoDropzone
              compact
              multiple
              remainingSlots={remaining}
              error={addError}
              idleLabel="Añadir otro logo"
              ariaLabel="Añadir otro logo"
              onFilesSelected={handleAddFiles}
            />
          ) : addError ? (
            <p role="alert" className="text-sm text-destructive">
              {addError}
            </p>
          ) : null}
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {logos.length > 0
          ? `${logos.length} logo${logos.length === 1 ? "" : "s"} ${
              logos.length === 1 ? "aplicado" : "aplicados"
            }.`
          : "Ningún logo aplicado."}
      </p>
    </div>
  );
}
