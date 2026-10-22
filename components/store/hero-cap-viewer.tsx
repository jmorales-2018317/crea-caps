"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import type { Texture } from "three";
import {
  LOGO_SIZE_DEFAULT,
  createHeroLogoTextureFromUrl,
} from "@/components/store/hero-cap-logo";
import { HeroCapScene } from "@/components/store/hero-cap-scene";
import { DEFAULT_CAP_PART_COLORS } from "@/types/personalization";

const CANVAS_ARIA_LABEL =
  "Visor 3D de gorra Crea Caps. Arrastra hacia los lados para rotar.";
const INITIAL_ROTATION_Y = -0.45;
const ROTATION_SPEED = 0.008;

type HeroCapViewerProps = {
  logoUrl: string | null;
  onModelReady?: () => void;
};

export function HeroCapViewer({ logoUrl, onModelReady }: HeroCapViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [logoTexture, setLogoTexture] = useState<Texture | null>(null);
  const rotationYRef = useRef(INITIAL_ROTATION_Y);
  const isDraggingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const lastXRef = useRef(0);
  const requestIdRef = useRef(0);
  const logoTextureRef = useRef<Texture | null>(null);
  const onModelReadyRef = useRef(onModelReady ?? null);

  onModelReadyRef.current = onModelReady ?? null;

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    const replaceTexture = (texture: Texture | null) => {
      logoTextureRef.current?.dispose();
      logoTextureRef.current = texture;
      setLogoTexture(texture);
    };

    if (!logoUrl) {
      replaceTexture(null);
      return;
    }

    void (async () => {
      try {
        const texture = await createHeroLogoTextureFromUrl(logoUrl);
        if (cancelled || requestId !== requestIdRef.current) {
          texture.dispose();
          return;
        }
        replaceTexture(texture);
      } catch {
        if (!cancelled && requestId === requestIdRef.current) {
          replaceTexture(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  useEffect(() => {
    return () => {
      logoTextureRef.current?.dispose();
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    userInteractedRef.current = true;
    lastXRef.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    rotationYRef.current += (event.clientX - lastXRef.current) * ROTATION_SPEED;
    lastXRef.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div className="absolute inset-0 animate-hero-enter-up">
      <Canvas
        className="pointer-events-none relative h-full w-full drop-shadow-[0_20px_36px_rgb(0_0_0_/_0.55)] sm:drop-shadow-[0_28px_48px_rgb(0_0_0_/_0.55)]"
        dpr={[1, 2]}
        shadows
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 40, position: [0, 0.12, 2.5], near: 0.01, far: 100 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        role="img"
        aria-label={CANVAS_ARIA_LABEL}
      >
        <HeroCapScene
          rotationYRef={rotationYRef}
          logoTexture={logoTexture}
          logoSize={LOGO_SIZE_DEFAULT}
          partColors={DEFAULT_CAP_PART_COLORS}
          introSpin
          introCancelRef={userInteractedRef}
          onReadyRef={onModelReadyRef}
        />
      </Canvas>
      <div
        className={`absolute inset-0 touch-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
