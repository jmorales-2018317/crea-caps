"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { CircleHelp, Info, Share2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePersonalizationStore } from "@/hooks/use-personalization-store";
import {
  CAP_PARTS,
  LOGO_PLACEMENTS,
  MAX_PERSONALIZATION_LOGOS,
  type CapPartId,
  type PaletteColor,
} from "@/types/personalization";

const FORM_SECTION_CLASS =
  "rounded-2xl border border-[#e8d9a8]/20 bg-card/80 p-4 shadow-[0_12px_36px_rgb(0_0_0_/_0.18)] backdrop-blur-md sm:p-5";

function StudioFormSection({
  title,
  accessory,
  children,
}: {
  title?: string;
  accessory?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={FORM_SECTION_CLASS}>
      {title ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold tracking-tight text-text-strong sm:text-xl">
            {title}
          </h2>
          {accessory}
        </header>
      ) : null}
      {children}
    </section>
  );
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
  const [shareOpen, setShareOpen] = useState(false);
  const [pickerPoint, setPickerPoint] = useState<PickerPoint | null>(null);
  const [pickerOrigin, setPickerOrigin] = useState<ColorPickerOrigin | null>(
    null,
  );
  const [backgroundMode, setBackgroundMode] =
    useState<ViewerBackgroundMode>("dark");
  const [showLogoAnchors, setShowLogoAnchors] = useState(false);
  const isLightViewer = backgroundMode === "light";
  const viewerBackground = VIEWER_BACKGROUND_COLORS[backgroundMode];
  const logoAnchorMarkers = showLogoAnchors
    ? LOGO_PLACEMENTS.filter(
        (placement) => !logos.some((logo) => logo.placement === placement),
      )
    : [];
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
        <section
          aria-label="Visor 3D de la gorra"
          className={cn(
            "relative overflow-hidden rounded-2xl border transition-colors duration-300",
            isLightViewer
              ? "border-[#b7ad9c]/40"
              : "border-[#e8d9a8]/20 shadow-[inset_0_0_88px_rgb(184_154_85_/_0.08)]",
          )}
          style={{ backgroundColor: viewerBackground }}
        >
          {isLightViewer ? null : (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute left-1/2 top-[48%] size-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(184_154_85_/_0.16)_0%,rgb(184_154_85_/_0.06)_38%,transparent_66%)] sm:size-[115%]" />
            </div>
          )}
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
              logoAnchorMarkers={logoAnchorMarkers}
            />
            <p
              className={cn(
                "pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 pr-28 text-[11px] font-medium tracking-[0.16em] uppercase sm:left-4 sm:top-4 sm:pr-40",
                isLightViewer ? "text-primary" : "text-gold-soft",
              )}
            >
              <span
                aria-hidden="true"
                className="relative flex size-2.5 shrink-0 items-center justify-center"
              >
                <span className="absolute size-2 animate-ping rounded-full bg-current opacity-60" />
                <span className="relative size-1.5 rounded-full bg-current" />
              </span>
              Vista en tiempo real
            </p>
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
          </div>
        </section>
        <p className="flex items-start gap-1.5 px-1 text-left text-[11px] leading-relaxed text-text-subtle sm:items-center sm:text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0 sm:mt-0" aria-hidden="true" />
          <span>
            El diseño es conceptual y el resultado final puede variar un poco.
          </span>
        </p>
      </div>

      <aside className="flex flex-col gap-4">
        <StudioFormSection
          title="Pinta cada pieza"
          accessory={
            <Badge
              variant="outline"
              className="h-6 rounded-full border-[#e8d9a8]/28 px-2.5 text-[10px] font-medium tracking-[0.16em] text-gold-soft uppercase"
            >
              {CAP_PARTS.length} piezas
            </Badge>
          }
        >
          <p className="mb-4 text-xs leading-relaxed text-text-secondary">
            Haz clic en la gorra o elige una de las {CAP_PARTS.length} piezas.
            Los colores vienen de la paleta disponible.
          </p>
          <div ref={partListRef}>
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
        </StudioFormSection>

        <StudioFormSection
          title="Añade una imagen"
          accessory={
            <span className="tabular-nums text-sm font-medium text-gold-soft">
              {logos.length} / {MAX_PERSONALIZATION_LOGOS}
            </span>
          }
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-subtle transition-colors hover:text-text-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    aria-label="Qué significan las posiciones disponibles"
                  >
                    <CircleHelp className="size-3.5" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-pretty">
                    Los puntos amarillos en la gorra marcan las posiciones
                    disponibles para colocar una imagen.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Label
                htmlFor="show-logo-anchors"
                className="cursor-pointer text-xs font-medium text-text-strong"
              >
                Mostrar posiciones disponibles
              </Label>
            </div>
            <Switch
              id="show-logo-anchors"
              size="sm"
              checked={showLogoAnchors}
              onCheckedChange={setShowLogoAnchors}
            />
          </div>
          <PersonalizationLogosField logos={logos} onLogosChange={setLogos} />
        </StudioFormSection>

        <StudioFormSection>
          <div
            role="group"
            aria-label="Acciones del diseño"
            className="flex flex-col gap-2"
          >
            <Button
              type="button"
              className="h-11 w-full cursor-pointer rounded-xl"
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
        </StudioFormSection>
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
