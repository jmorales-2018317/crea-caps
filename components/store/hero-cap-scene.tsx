"use client";

import {
  Suspense,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import {
  HeroCapModel,
  type CapLogoInstance,
} from "@/components/store/hero-cap-model";
import type {
  CapPartColors,
  CapPartId,
  LogoPlacement,
} from "@/types/personalization";

const CAMERA_LOOK_AT_Y = 0.08;
const CAMERA_BASE_Y = 0.12;
const CAMERA_BASE_Z = 2.5;
const CAMERA_BASE_ELEVATION = Math.atan2(
  CAMERA_BASE_Y - CAMERA_LOOK_AT_Y,
  CAMERA_BASE_Z,
);
const INTRO_SPIN_DURATION_MS = 1600;
const INTRO_SPIN_DURATION_S = INTRO_SPIN_DURATION_MS / 1000;
const INTRO_SPIN_RADIANS = Math.PI * 2;
const IDLE_SPIN_RADIANS_PER_SECOND = 0.2;
const INTRO_START_RADIANS_PER_SECOND =
  IDLE_SPIN_RADIANS_PER_SECOND +
  ((INTRO_SPIN_RADIANS - IDLE_SPIN_RADIANS_PER_SECOND * INTRO_SPIN_DURATION_S) *
    4) /
    INTRO_SPIN_DURATION_S;
const DARK_TONE_EXPOSURE = 1;
const LIGHT_TONE_EXPOSURE = 0.78;

function introSpinSpeed(progress: number) {
  const extra =
    INTRO_START_RADIANS_PER_SECOND - IDLE_SPIN_RADIANS_PER_SECOND;
  return IDLE_SPIN_RADIANS_PER_SECOND + extra * (1 - progress) ** 3;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function CapYTurntable({
  children,
  rotationYRef,
  groupRef,
  introSpin = false,
  introCancelRef,
  onReadyRef,
}: {
  children: ReactNode;
  rotationYRef: RefObject<number>;
  groupRef?: RefObject<Group | null>;
  introSpin?: boolean;
  introCancelRef?: RefObject<boolean>;
  onReadyRef?: RefObject<(() => void) | null>;
}) {
  const innerRef = useRef<Group>(null);
  const readyFiredRef = useRef(false);
  const introRef = useRef<{
    phase: "pending" | "running" | "idle" | "stopped";
    startedAt: number;
  }>({
    phase: introSpin ? "pending" : "stopped",
    startedAt: 0,
  });

  useFrame((_, delta) => {
    const group = innerRef.current;
    if (!group) {
      return;
    }
    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReadyRef?.current?.();
    }
    group.rotation.x = 0;
    group.rotation.z = 0;

    const intro = introRef.current;
    const frameDelta = Math.min(delta, 0.05);

    if (intro.phase === "pending") {
      if (introCancelRef?.current || prefersReducedMotion()) {
        intro.phase = "stopped";
      } else {
        intro.phase = "running";
        intro.startedAt = performance.now();
      }
    }

    if (intro.phase === "running") {
      if (introCancelRef?.current) {
        intro.phase = "stopped";
      } else {
        const progress = Math.min(
          (performance.now() - intro.startedAt) / INTRO_SPIN_DURATION_MS,
          1,
        );
        rotationYRef.current -= introSpinSpeed(progress) * frameDelta;
        if (progress >= 1) {
          intro.phase = "idle";
        }
      }
    } else if (intro.phase === "idle") {
      if (introCancelRef?.current) {
        intro.phase = "stopped";
      } else {
        rotationYRef.current -= IDLE_SPIN_RADIANS_PER_SECOND * frameDelta;
      }
    }

    group.rotation.y = rotationYRef.current;
  });

  return (
    <group
      ref={(node) => {
        innerRef.current = node;
        if (groupRef) {
          groupRef.current = node;
        }
      }}
    >
      {children}
    </group>
  );
}

function CameraRig({
  distanceRef,
  elevationRef,
  lookAtY = CAMERA_LOOK_AT_Y,
}: {
  distanceRef: RefObject<number>;
  elevationRef?: RefObject<number>;
  lookAtY?: number;
}) {
  const target = useRef(new Vector3(0, lookAtY, 0));

  useFrame(({ camera }) => {
    const distance = distanceRef.current;
    const elevation = CAMERA_BASE_ELEVATION + (elevationRef?.current ?? 0);
    camera.up.set(0, 1, 0);
    camera.position.set(
      0,
      lookAtY + Math.sin(elevation) * distance,
      Math.cos(elevation) * distance,
    );
    target.current.set(0, lookAtY, 0);
    camera.lookAt(target.current);
  });
  return null;
}

function SceneExposure({ isLightBackground }: { isLightBackground: boolean }) {
  const { gl } = useThree();

  useLayoutEffect(() => {
    const previous = gl.toneMappingExposure;
    gl.toneMappingExposure = isLightBackground
      ? LIGHT_TONE_EXPOSURE
      : DARK_TONE_EXPOSURE;
    return () => {
      gl.toneMappingExposure = previous;
    };
  }, [gl, isLightBackground]);

  return null;
}

function CapStudioLights({
  isLightBackground,
}: {
  isLightBackground: boolean;
}) {
  if (isLightBackground) {
    return (
      <>
        <ambientLight intensity={0.38} color="#efe8de" />
        <hemisphereLight args={["#d8d2c8", "#8a847a", 0.36]} />
        <directionalLight
          position={[3, 4, 4]}
          intensity={0.28}
          color="#fff4ea"
        />
        <directionalLight
          position={[-2.4, 1.6, 2.2]}
          intensity={0.14}
          color="#ebe4da"
        />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#e4d3a4", "#1a1610", 0.95]} />
      <directionalLight position={[3, 4, 4]} intensity={0.6} />
    </>
  );
}

type HeroCapSceneProps = {
  rotationYRef: RefObject<number>;
  rotationXRef?: RefObject<number>;
  zoomDistanceRef?: RefObject<number>;
  lookAtY?: number;
  logos?: CapLogoInstance[];
  partColors?: CapPartColors;
  selectedPart?: CapPartId | null;
  hoveredPart?: CapPartId | null;
  capRootRef?: RefObject<Group | null>;
  introSpin?: boolean;
  introCancelRef?: RefObject<boolean>;
  onReadyRef?: RefObject<(() => void) | null>;
  isLightBackground?: boolean;
  logoAnchorMarkers?: readonly LogoPlacement[];
};

export function HeroCapScene({
  rotationYRef,
  rotationXRef,
  zoomDistanceRef,
  lookAtY,
  logos = [],
  partColors,
  selectedPart = null,
  hoveredPart = null,
  capRootRef,
  introSpin = false,
  introCancelRef,
  onReadyRef,
  isLightBackground = false,
  logoAnchorMarkers = [],
}: HeroCapSceneProps) {
  return (
    <>
      {zoomDistanceRef ? (
        <CameraRig
          distanceRef={zoomDistanceRef}
          elevationRef={rotationXRef}
          lookAtY={lookAtY}
        />
      ) : null}
      <SceneExposure isLightBackground={isLightBackground} />
      <CapStudioLights isLightBackground={isLightBackground} />
      <Suspense fallback={null}>
        <CapYTurntable
          rotationYRef={rotationYRef}
          groupRef={capRootRef}
          introSpin={introSpin}
          introCancelRef={introCancelRef}
          onReadyRef={onReadyRef}
        >
          <HeroCapModel
            logos={logos}
            partColors={partColors}
            selectedPart={selectedPart}
            hoveredPart={hoveredPart}
            logoAnchorMarkers={logoAnchorMarkers}
          />
        </CapYTurntable>
      </Suspense>
      <ContactShadows
        position={[0, -0.77, 0]}
        opacity={isLightBackground ? 0.16 : 0.38}
        color={isLightBackground ? "#5c564e" : "#000000"}
        scale={6}
        blur={isLightBackground ? 3.4 : 2.4}
        far={3}
      />
    </>
  );
}
