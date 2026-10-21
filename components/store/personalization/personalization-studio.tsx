"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Share2 } from "lucide-react";
import {
  PersonalizationColorPopover,
  type ColorPickerOrigin,
} from "@/components/store/personalization/personalization-color-popover";
import { PersonalizationLogoDropzone } from "@/components/store/personalization/personalization-logo-dropzone";
import { PersonalizationLogoSizeControl } from "@/components/store/personalization/personalization-logo-size-control";
import { PersonalizationPartPicker } from "@/components/store/personalization/personalization-part-picker";
import { ResetDesignButton } from "@/components/store/personalization/reset-design-button";
import { ShareDesignDialog } from "@/components/store/personalization/share-design-dialog";
import { Button } from "@/components/ui/button";
import { usePersonalizationStore } from "@/hooks/use-personalization-store";
import { validateImageFile } from "@/lib/catalog-images";
import type { CapPartId } from "@/types/personalization";

type PickerPoint = {
  x: number;
  y: number;
};

function clampPickerPoint(
  x: number,
  y: number,
  width: number,
  height: number,
): PickerPoint {
  const inset = 16;
  return {
    x: Math.min(width - inset, Math.max(inset, x)),
    y: Math.min(height - inset, Math.max(inset, y)),
  };
}

const PersonalizationCapCanvas = dynamic(
  () =>
    import("@/components/store/personalization/personalization-cap-viewer").then(
      (mod) => mod.PersonalizationCapViewer,
    ),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" aria-hidden="true" />,
  },
);

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function PersonalizationStudio() {
  const partColors = usePersonalizationStore((state) => state.partColors);
  const selectedPart = usePersonalizationStore((state) => state.selectedPart);
  const logoSizePx = usePersonalizationStore((state) => state.logoSizePx);
  const selectPart = usePersonalizationStore((state) => state.selectPart);
  const setPartColor = usePersonalizationStore((state) => state.setPartColor);
  const setLogoSizePx = usePersonalizationStore((state) => state.setLogoSizePx);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [pickerPoint, setPickerPoint] = useState<PickerPoint | null>(null);
  const [pickerOrigin, setPickerOrigin] = useState<ColorPickerOrigin | null>(
    null,
  );
  const previewUrlRef = useRef<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);
  const partListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      revokeIfBlob(previewUrlRef.current);
    };
  }, []);

  const replacePreview = (nextUrl: string | null) => {
    revokeIfBlob(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  };

  const handleLogoReady = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handleLogoError = useCallback((message: string) => {
    setIsProcessing(false);
    if (previewUrlRef.current) {
      setError(message);
    }
  }, []);

  const clearLogo = () => {
    replacePreview(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleFileSelected = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);
    replacePreview(URL.createObjectURL(file));
  };

  const placePickerAtViewerCenter = () => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    viewer.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const rect = viewer.getBoundingClientRect();
    setPickerPoint({
      x: rect.width / 2,
      y: rect.height / 2,
    });
  };

  const closeColorPicker = () => {
    selectPart(null);
    setPickerOrigin(null);
  };

  const handlePartClick = (
    part: CapPartId | null,
    point?: { clientX: number; clientY: number },
  ) => {
    selectPart(part);
    const viewer = viewerRef.current;
    if (!part || !viewer) {
      setPickerOrigin(null);
      return;
    }

    setPickerOrigin("viewer");

    if (!point) {
      placePickerAtViewerCenter();
      return;
    }

    const rect = viewer.getBoundingClientRect();
    setPickerPoint(
      clampPickerPoint(
        point.clientX - rect.left,
        point.clientY - rect.top,
        rect.width,
        rect.height,
      ),
    );
  };

  const handleListSelect = (part: CapPartId) => {
    selectPart(part);
    setPickerOrigin("sidebar");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-3">
        <section
          aria-label="Visor 3D de la gorra"
          className="relative overflow-hidden rounded-2xl border border-[#e8d9a8]/20 bg-[#1a1815]"
        >
          <div
            ref={viewerRef}
            className="relative h-[min(62svh,26rem)] w-full sm:h-[min(64svh,32rem)] lg:h-[min(70vh,40rem)]"
          >
            <PersonalizationCapCanvas
              logoUrl={previewUrl}
              logoSizePx={logoSizePx}
              partColors={partColors}
              selectedPart={selectedPart}
              onLogoReady={handleLogoReady}
              onLogoError={handleLogoError}
              onPartClick={handlePartClick}
            />
            <div
              ref={pickerAnchorRef}
              aria-hidden="true"
              className="pointer-events-none absolute z-20 size-px -translate-x-1/2 -translate-y-1/2"
              style={{
                left: pickerPoint?.x ?? "50%",
                top: pickerPoint?.y ?? "50%",
              }}
            />
            <PersonalizationColorPopover
              open={pickerOrigin === "viewer" && selectedPart !== null}
              selectedPart={selectedPart}
              partColors={partColors}
              anchorRef={pickerAnchorRef}
              onPartColorChange={setPartColor}
              onOpenChange={(open) => {
                if (!open) {
                  closeColorPicker();
                }
              }}
              shouldIgnoreOutsidePress={(target) => {
                if (!(target instanceof Node)) {
                  return false;
                }
                return Boolean(
                  viewerRef.current?.contains(target) ||
                    partListRef.current?.contains(target),
                );
              }}
            />
            <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#1a1815] via-[#1a1815]/80 to-transparent px-4 pb-2.5 pt-8 text-center text-xs text-text-secondary/90">
              Arrastra para rotar · Rueda o pellizca para zoom · Haz clic en una
              pieza para cambiar su color
            </p>
          </div>
        </section>

        <div
          role="group"
          aria-label="Acciones del diseño"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <Button
            type="button"
            className="h-10 w-full cursor-pointer"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="size-4" aria-hidden="true" />
            Compartir diseño
          </Button>
          <ResetDesignButton
            hasLogo={Boolean(previewUrl)}
            onResetLogo={clearLogo}
          />
        </div>
      </div>

      <aside className="space-y-5 rounded-2xl border border-[#e8d9a8]/20 bg-card/80 p-4 shadow-[0_12px_36px_rgb(0_0_0_/_0.28)] backdrop-blur-md sm:p-5">
        <PersonalizationLogoDropzone
          previewUrl={previewUrl}
          isProcessing={isProcessing}
          error={error}
          onFileSelected={handleFileSelected}
          onClear={clearLogo}
        />

        {previewUrl ? (
          <PersonalizationLogoSizeControl
            value={logoSizePx}
            onChange={setLogoSizePx}
          />
        ) : null}

        <div ref={partListRef} className="border-t border-divider pt-5">
          <PersonalizationPartPicker
            selectedPart={selectedPart}
            pickerOrigin={pickerOrigin}
            partColors={partColors}
            onSelectPart={handleListSelect}
            onPartColorChange={setPartColor}
            onClose={closeColorPicker}
            shouldIgnoreOutsidePress={(target) => {
              if (!(target instanceof Node)) {
                return false;
              }
              return Boolean(viewerRef.current?.contains(target));
            }}
          />
        </div>
      </aside>

      <ShareDesignDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        partColors={partColors}
        logoSizePx={logoSizePx}
      />
    </div>
  );
}
