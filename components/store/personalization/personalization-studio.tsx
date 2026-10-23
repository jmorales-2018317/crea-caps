"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ImagePlus, Palette, Share2 } from "lucide-react";
import { cn } from "cn";
import {
  PersonalizationColorPopover,
  type ColorPickerOrigin,
} from "@/components/store/personalization/personalization-color-popover";
import {
  PersonalizationLogosField,
  revokeLogoUrls,
  type PersonalizationLogoItem,
} from "@/components/store/personalization/personalization-logos-field";
import { PersonalizationPartPicker } from "@/components/store/personalization/personalization-part-picker";
import { ResetDesignButton } from "@/components/store/personalization/reset-design-button";
import { ShareDesignDialog } from "@/components/store/personalization/share-design-dialog";
import {
  VIEWER_BACKGROUND_COLORS,
  ViewerBackgroundToggle,
  type ViewerBackgroundMode,
} from "@/components/store/personalization/viewer-background-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersonalizationStore } from "@/hooks/use-personalization-store";
import type { CapPartId, PaletteColor } from "@/types/personalization";

type StudioSidebarTab = "colores" | "logos";

function isStudioSidebarTab(value: string): value is StudioSidebarTab {
  return value === "colores" || value === "logos";
}

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

type PersonalizationStudioProps = {
  paletteColors: PaletteColor[] | null;
};

export function PersonalizationStudio({
  paletteColors,
}: PersonalizationStudioProps) {
  const partColors = usePersonalizationStore((state) => state.partColors);
  const selectedPart = usePersonalizationStore((state) => state.selectedPart);
  const hasHydrated = usePersonalizationStore((state) => state.hasHydrated);
  const selectPart = usePersonalizationStore((state) => state.selectPart);
  const setPartColor = usePersonalizationStore((state) => state.setPartColor);
  const constrainToPalette = usePersonalizationStore(
    (state) => state.constrainToPalette,
  );

  const [logos, setLogos] = useState<PersonalizationLogoItem[]>([]);
  const [sidebarTab, setSidebarTab] = useState<StudioSidebarTab>("colores");
  const [shareOpen, setShareOpen] = useState(false);
  const [pickerPoint, setPickerPoint] = useState<PickerPoint | null>(null);
  const [pickerOrigin, setPickerOrigin] = useState<ColorPickerOrigin | null>(
    null,
  );
  const [backgroundMode, setBackgroundMode] =
    useState<ViewerBackgroundMode>("dark");
  const isLightViewer = backgroundMode === "light";
  const viewerBackground = VIEWER_BACKGROUND_COLORS[backgroundMode];
  const logosRef = useRef<PersonalizationLogoItem[]>([]);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);
  const partListRef = useRef<HTMLDivElement>(null);
  const pickerOpenTimeoutRef = useRef<number>(0);

  useEffect(() => {
    logosRef.current = logos;
  }, [logos]);

  useEffect(() => {
    return () => {
      window.clearTimeout(pickerOpenTimeoutRef.current);
      revokeLogoUrls(logosRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || paletteColors === null) {
      return;
    }
    constrainToPalette(paletteColors);
  }, [constrainToPalette, hasHydrated, paletteColors]);

  const handleLogoReady = useCallback((id: string) => {
    setLogos((current) =>
      current.map((logo) =>
        logo.id === id ? { ...logo, isProcessing: false, error: null } : logo,
      ),
    );
  }, []);

  const handleLogoError = useCallback((id: string, message: string) => {
    setLogos((current) =>
      current.map((logo) =>
        logo.id === id ? { ...logo, isProcessing: false, error: message } : logo,
      ),
    );
  }, []);

  const clearLogos = () => {
    revokeLogoUrls(logosRef.current);
    logosRef.current = [];
    setLogos([]);
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
    window.clearTimeout(pickerOpenTimeoutRef.current);
    selectPart(null);
    setPickerOrigin(null);
  };

  const handlePartClick = (
    part: CapPartId | null,
    point?: { clientX: number; clientY: number },
  ) => {
    window.clearTimeout(pickerOpenTimeoutRef.current);
    selectPart(part);
    const viewer = viewerRef.current;
    if (!part || !viewer) {
      setPickerOrigin(null);
      return;
    }

    const rect = viewer.getBoundingClientRect();
    const nextPoint = point
      ? clampPickerPoint(
          point.clientX - rect.left,
          point.clientY - rect.top,
          rect.width,
          rect.height,
        )
      : null;

    pickerOpenTimeoutRef.current = window.setTimeout(() => {
      setPickerOrigin("viewer");
      if (nextPoint) {
        setPickerPoint(nextPoint);
        return;
      }
      placePickerAtViewerCenter();
    }, 0);
  };

  const handleListSelect = (part: CapPartId) => {
    selectPart(part);
    setPickerOrigin("sidebar");
  };

  const handleSidebarTabChange = (value: string) => {
    if (!isStudioSidebarTab(value)) {
      return;
    }
    if (value !== "colores" && pickerOrigin === "sidebar") {
      closeColorPicker();
    }
    setSidebarTab(value);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-3">
        <section
          aria-label="Visor 3D de la gorra"
          className={cn(
            "relative overflow-hidden rounded-2xl border transition-colors duration-300",
            isLightViewer ? "border-[#c4b48a]/35" : "border-[#e8d9a8]/20",
          )}
          style={{ backgroundColor: viewerBackground }}
        >
          <div
            ref={viewerRef}
            className="relative h-[min(62svh,26rem)] w-full sm:h-[min(64svh,32rem)] lg:h-[min(70vh,40rem)]"
          >
            <PersonalizationCapCanvas
              logos={logos}
              partColors={partColors}
              selectedPart={selectedPart}
              isLightBackground={isLightViewer}
              onLogoReady={handleLogoReady}
              onLogoError={handleLogoError}
              onPartClick={handlePartClick}
            />
            <ViewerBackgroundToggle
              value={backgroundMode}
              onChange={setBackgroundMode}
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
              paletteColors={paletteColors}
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
            <p
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t to-transparent px-4 pb-2.5 pt-8 text-center text-xs",
                isLightViewer
                  ? "from-[#f0ece4] via-[#f0ece4]/80 text-[#4a453d]"
                  : "from-[#1a1815] via-[#1a1815]/80 text-text-secondary/90",
              )}
            >
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
            hasLogo={logos.length > 0}
            onResetLogo={clearLogos}
          />
        </div>
      </div>

      <aside className="flex flex-col rounded-2xl border border-[#e8d9a8]/20 bg-card/80 p-4 shadow-[0_12px_36px_rgb(0_0_0_/_0.28)] backdrop-blur-md sm:p-5 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6.5rem)] lg:min-h-0 lg:overflow-hidden">
        <Tabs
          value={sidebarTab}
          onValueChange={handleSidebarTabChange}
          className="flex flex-1 flex-col gap-4 lg:min-h-0"
        >
          <TabsList
            aria-label="Secciones de personalización"
            className="h-10 w-full min-w-0 shrink-0"
          >
            <TabsTrigger
              value="colores"
              className="min-w-0 cursor-pointer gap-1.5"
            >
              <Palette aria-hidden="true" />
              Colores
            </TabsTrigger>
            <TabsTrigger
              value="logos"
              className="min-w-0 cursor-pointer gap-1.5"
            >
              <ImagePlus aria-hidden="true" />
              Logos
              {logos.length > 0 ? (
                <span className="tabular-nums text-xs text-muted-foreground">
                  {logos.length}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="colores"
            className="flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]"
          >
            <div ref={partListRef} className="min-h-0">
              <PersonalizationPartPicker
                selectedPart={selectedPart}
                pickerOrigin={pickerOrigin}
                partColors={partColors}
                paletteColors={paletteColors}
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
          </TabsContent>
          <TabsContent
            value="logos"
            className="flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]"
          >
            <PersonalizationLogosField logos={logos} onLogosChange={setLogos} />
          </TabsContent>
        </Tabs>
      </aside>

      <ShareDesignDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        partColors={partColors}
        logos={logos.map((logo) => ({
          placement: logo.placement,
          size: logo.sizePx,
        }))}
      />
    </div>
  );
}
