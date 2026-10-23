"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { Texture } from "three";
import {
  DEFAULT_HERO_LOGO_PLACEMENT,
  HERO_LOGO_SIZE,
  createHeroLogoTextureFromUrl,
} from "@/components/store/hero-cap-logo";
import type { CapLogoInstance } from "@/components/store/hero-cap-model";
import { HeroCapScene } from "@/components/store/hero-cap-scene";
import { DEFAULT_CAP_PART_COLORS } from "@/types/personalization";

const CANVAS_ARIA_LABEL = "Visor 3D de gorra Crea Caps.";
const INITIAL_ROTATION_Y = -0.45;

type HeroCapViewerProps = {
  logoUrl: string | null;
  onModelReady?: () => void;
};

export function HeroCapViewer({ logoUrl, onModelReady }: HeroCapViewerProps) {
  const [logoTexture, setLogoTexture] = useState<Texture | null>(null);
  const rotationYRef = useRef(INITIAL_ROTATION_Y);
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
          logos={
            logoTexture
              ? [
                  {
                    placement: DEFAULT_HERO_LOGO_PLACEMENT,
                    texture: logoTexture,
                    size: HERO_LOGO_SIZE,
                  } satisfies CapLogoInstance,
                ]
              : []
          }
          partColors={DEFAULT_CAP_PART_COLORS}
          introSpin
          onReadyRef={onModelReadyRef}
        />
      </Canvas>
    </div>
  );
}
