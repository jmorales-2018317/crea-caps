"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  Raycaster,
  Vector2,
  type Camera,
  type Group,
  type Texture,
  type WebGLRenderer,
} from "three";
import {
  getCapPartIdFromObject,
  type CapLogoInstance,
} from "@/components/store/hero-cap-model";
import {
  createHeroLogoTextureFromUrl,
  logoSizePxToScale,
} from "@/components/store/hero-cap-logo";
import { HeroCapScene } from "@/components/store/hero-cap-scene";
import { ViewerOrbitControls } from "@/components/store/personalization/viewer-orbit-controls";
import type {
  CapPartColors,
  CapPartId,
  LogoPlacement,
  PersonalizationLogoDraft,
} from "@/types/personalization";

const CANVAS_ARIA_LABEL =
  "Visor 3D para personalizar la gorra. Activa la rotación para girar el modelo. Usa los botones o la rueda para hacer zoom. Haz clic en una pieza para cambiar su color.";
const INITIAL_ROTATION_Y = -0.45;
const INITIAL_ROTATION_X = 0;
const INITIAL_ZOOM_DISTANCE = 2.5;
const CAMERA_LOOK_AT_Y = -0.14;
const MIN_ZOOM_DISTANCE = 1.35;
const MAX_ZOOM_DISTANCE = 4.6;
const ZOOM_STEP = 0.32;
const PITCH_MIN = -0.85;
const PITCH_MAX = 0.72;
const AXIS_LOCK_RATIO = 1.25;
const ROTATION_SPEED = 0.008;
const WHEEL_ZOOM_SPEED = 0.0024;
const DRAG_THRESHOLD_PX = 5;
const LOGO_APPLY_ERROR = "No se pudo aplicar el logo. Prueba con otra imagen.";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type ThreePickContext = {
  camera: Camera;
  gl: WebGLRenderer;
};

type PersonalizationCapViewerProps = {
  logos: PersonalizationLogoDraft[];
  partColors: CapPartColors;
  selectedPart: CapPartId | null;
  isLightBackground?: boolean;
  onLogoReady?: (id: string) => void;
  onLogoError?: (id: string, message: string) => void;
  onPartClick: (
    part: CapPartId | null,
    point?: { clientX: number; clientY: number },
  ) => void;
  logoAnchorMarkers?: readonly LogoPlacement[];
};

function pickCapPart(
  clientX: number,
  clientY: number,
  three: ThreePickContext,
  target: Group | null,
  rect: DOMRect,
): CapPartId | null {
  if (!target || rect.width === 0 || rect.height === 0) {
    return null;
  }

  const ndc = new Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  three.camera.updateMatrixWorld();
  target.updateMatrixWorld(true);
  const raycaster = new Raycaster();
  raycaster.setFromCamera(ndc, three.camera);
  const hits = raycaster.intersectObject(target, true);

  for (const hit of hits) {
    const part = getCapPartIdFromObject(hit.object);
    if (part) {
      return part;
    }
  }

  return null;
}

export function PersonalizationCapViewer({
  logos,
  partColors,
  selectedPart,
  isLightBackground = false,
  onLogoReady,
  onLogoError,
  onPartClick,
  logoAnchorMarkers = [],
}: PersonalizationCapViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [hoveredPart, setHoveredPart] = useState<CapPartId | null>(null);
  const [logoTextures, setLogoTextures] = useState<Record<string, Texture>>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(INITIAL_ROTATION_Y);
  const rotationXRef = useRef(INITIAL_ROTATION_X);
  const zoomDistanceRef = useRef(INITIAL_ZOOM_DISTANCE);
  const capRootRef = useRef<Group | null>(null);
  const threeRef = useRef<ThreePickContext | null>(null);
  const pointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDistanceRef = useRef(0);
  const pinchStartZoomRef = useRef(INITIAL_ZOOM_DISTANCE);
  const requestIdRef = useRef(0);
  const logoTexturesRef = useRef<Record<string, Texture>>({});
  const logoUrlsRef = useRef<Record<string, string>>({});
  const logosKey = logos.map((logo) => `${logo.id}:${logo.url}`).join("|");
  const onLogoReadyRef = useRef(onLogoReady);
  const onLogoErrorRef = useRef(onLogoError);
  const onPartClickRef = useRef(onPartClick);

  useEffect(() => {
    onLogoReadyRef.current = onLogoReady;
    onLogoErrorRef.current = onLogoError;
    onPartClickRef.current = onPartClick;
  }, [onLogoError, onLogoReady, onPartClick]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;
    const nextIds = new Set(logos.map((logo) => logo.id));
    const current = logoTexturesRef.current;
    const urls = logoUrlsRef.current;

    for (const [id, texture] of Object.entries(current)) {
      const nextUrl = logos.find((logo) => logo.id === id)?.url;
      if (nextIds.has(id) && nextUrl && urls[id] === nextUrl) {
        continue;
      }
      texture.dispose();
      delete current[id];
      delete urls[id];
    }

    if (logos.length === 0) {
      logoTexturesRef.current = {};
      logoUrlsRef.current = {};
      setLogoTextures({});
      return;
    }

    const pending = logos.filter((logo) => current[logo.id] == null);

    if (pending.length === 0) {
      setLogoTextures({ ...current });
      return;
    }

    void (async () => {
      const loaded: Record<string, Texture> = {};
      await Promise.all(
        pending.map(async (logo) => {
          try {
            const texture = await createHeroLogoTextureFromUrl(logo.url);
            if (cancelled || requestId !== requestIdRef.current) {
              texture.dispose();
              return;
            }
            loaded[logo.id] = texture;
            logoUrlsRef.current[logo.id] = logo.url;
            onLogoReadyRef.current?.(logo.id);
          } catch {
            if (!cancelled && requestId === requestIdRef.current) {
              onLogoErrorRef.current?.(logo.id, LOGO_APPLY_ERROR);
            }
          }
        }),
      );

      if (cancelled || requestId !== requestIdRef.current) {
        for (const texture of Object.values(loaded)) {
          texture.dispose();
        }
        return;
      }

      logoTexturesRef.current = { ...logoTexturesRef.current, ...loaded };
      setLogoTextures({ ...logoTexturesRef.current });
    })();

    return () => {
      cancelled = true;
    };
    // logosKey captures id+url identity without depending on size/placement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logosKey]);

  useEffect(() => {
    return () => {
      for (const texture of Object.values(logoTexturesRef.current)) {
        texture.dispose();
      }
      logoTexturesRef.current = {};
      logoUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomDistanceRef.current = clamp(
        zoomDistanceRef.current + event.deltaY * WHEEL_ZOOM_SPEED,
        MIN_ZOOM_DISTANCE,
        MAX_ZOOM_DISTANCE,
      );
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
    };
  }, []);

  const zoomBy = useCallback((delta: number) => {
    zoomDistanceRef.current = clamp(
      zoomDistanceRef.current + delta,
      MIN_ZOOM_DISTANCE,
      MAX_ZOOM_DISTANCE,
    );
  }, []);

  const handleZoomIn = useCallback(() => {
    zoomBy(-ZOOM_STEP);
  }, [zoomBy]);

  const handleZoomOut = useCallback(() => {
    zoomBy(ZOOM_STEP);
  }, [zoomBy]);

  const handleToggleRotation = useCallback(() => {
    setRotationEnabled((current) => !current);
  }, []);

  useEffect(() => {
    if (rotationEnabled) {
      return;
    }
    pointersRef.current.clear();
    pinchStartDistanceRef.current = 0;
    pointerDownRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);
  }, [rotationEnabled]);

  const updateHover = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const three = threeRef.current;
      if (!three) {
        return;
      }
      const part = pickCapPart(
        clientX,
        clientY,
        three,
        capRootRef.current,
        rect,
      );
      setHoveredPart(part);
    },
    [],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (!rotationEnabled) {
      pointerDownRef.current = true;
      hasDraggedRef.current = false;
      startXRef.current = event.clientX;
      startYRef.current = event.clientY;
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    if (pointersRef.current.size >= 2) {
      const points = [...pointersRef.current.values()];
      const first = points[0];
      const second = points[1];
      if (first && second) {
        pinchStartDistanceRef.current = pointerDistance(first, second);
        pinchStartZoomRef.current = zoomDistanceRef.current;
      }
      hasDraggedRef.current = true;
      pointerDownRef.current = false;
      setIsDragging(true);
      setHoveredPart(null);
      return;
    }

    pointerDownRef.current = true;
    hasDraggedRef.current = false;
    lastXRef.current = event.clientX;
    lastYRef.current = event.clientY;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }

    if (pointersRef.current.size >= 2) {
      if (!rotationEnabled) {
        return;
      }
      const points = [...pointersRef.current.values()];
      const first = points[0];
      const second = points[1];
      if (
        first &&
        second &&
        pinchStartDistanceRef.current > 0
      ) {
        const distance = pointerDistance(first, second);
        const scale = pinchStartDistanceRef.current / distance;
        zoomDistanceRef.current = clamp(
          pinchStartZoomRef.current * scale,
          MIN_ZOOM_DISTANCE,
          MAX_ZOOM_DISTANCE,
        );
      }
      return;
    }

    if (!pointerDownRef.current) {
      updateHover(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      );
      return;
    }

    const deltaX = event.clientX - startXRef.current;
    const deltaY = event.clientY - startYRef.current;
    if (
      !hasDraggedRef.current &&
      Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD_PX
    ) {
      hasDraggedRef.current = true;
      if (rotationEnabled) {
        setIsDragging(true);
        setHoveredPart(null);
      }
    }

    if (!rotationEnabled) {
      return;
    }

    if (hasDraggedRef.current) {
      const dx = event.clientX - lastXRef.current;
      const dy = event.clientY - lastYRef.current;
      const absTotalX = Math.abs(deltaX);
      const absTotalY = Math.abs(deltaY);
      const lockToYaw = absTotalX > absTotalY * AXIS_LOCK_RATIO;
      const lockToPitch = absTotalY > absTotalX * AXIS_LOCK_RATIO;

      if (!lockToPitch) {
        rotationYRef.current += dx * ROTATION_SPEED;
      }
      if (!lockToYaw) {
        rotationXRef.current = clamp(
          rotationXRef.current + dy * ROTATION_SPEED,
          PITCH_MIN,
          PITCH_MAX,
        );
      }
      lastXRef.current = event.clientX;
      lastYRef.current = event.clientY;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartDistanceRef.current = 0;
    }

    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      if (remaining) {
        lastXRef.current = remaining.x;
        lastYRef.current = remaining.y;
        startXRef.current = remaining.x;
        startYRef.current = remaining.y;
      }
      pointerDownRef.current = true;
      return;
    }

    const wasDragging = hasDraggedRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerDownRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);

    if (wasDragging) {
      updateHover(event.clientX, event.clientY, rect);
      return;
    }

    const three = threeRef.current;
    if (!three) {
      return;
    }

    const part = pickCapPart(
      event.clientX,
      event.clientY,
      three,
      capRootRef.current,
      rect,
    );
    onPartClickRef.current(part, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    setHoveredPart(part);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointersRef.current.delete(event.pointerId);
    pinchStartDistanceRef.current = 0;
    pointerDownRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    if (!pointerDownRef.current) {
      setHoveredPart(null);
    }
  };

  const cursorClass = !rotationEnabled
    ? hoveredPart
      ? "cursor-pointer"
      : "cursor-default"
    : isDragging
      ? "cursor-grabbing"
      : hoveredPart
        ? "cursor-pointer"
        : "cursor-grab";

  return (
    <div className={`absolute inset-0 z-0 ${cursorClass}`}>
      <Canvas
        className={
          isLightBackground
            ? "pointer-events-none relative h-full w-full"
            : "pointer-events-none relative h-full w-full drop-shadow-[0_20px_36px_rgb(0_0_0_/_0.55)] sm:drop-shadow-[0_28px_48px_rgb(0_0_0_/_0.55)]"
        }
        dpr={[1, 2]}
        shadows
        gl={{ alpha: true, antialias: true }}
        camera={{
          fov: 40,
          position: [0, CAMERA_LOOK_AT_Y, INITIAL_ZOOM_DISTANCE],
          near: 0.01,
          far: 100,
        }}
        onCreated={({ camera, gl }) => {
          threeRef.current = { camera, gl };
          gl.setClearColor(0x000000, 0);
        }}
        role="img"
        aria-label={CANVAS_ARIA_LABEL}
      >
        <HeroCapScene
          rotationYRef={rotationYRef}
          rotationXRef={rotationXRef}
          zoomDistanceRef={zoomDistanceRef}
          lookAtY={CAMERA_LOOK_AT_Y}
          isLightBackground={isLightBackground}
          logos={logos.flatMap((logo) => {
            const texture = logoTextures[logo.id];
            if (!texture) {
              return [];
            }
            return [
              {
                id: logo.id,
                placement: logo.placement,
                texture,
                size: logoSizePxToScale(logo.sizePx, logo.placement),
              } satisfies CapLogoInstance,
            ];
          })}
          partColors={partColors}
          selectedPart={selectedPart}
          hoveredPart={hoveredPart}
          capRootRef={capRootRef}
          logoAnchorMarkers={logoAnchorMarkers}
        />
      </Canvas>
      <div
        ref={overlayRef}
        className={
          rotationEnabled
            ? "absolute inset-0 z-10 touch-none"
            : "absolute inset-0 z-10 touch-pan-y"
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      />
      <ViewerOrbitControls
        isLight={isLightBackground}
        rotationEnabled={rotationEnabled}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleRotation={handleToggleRotation}
      />
    </div>
  );
}
