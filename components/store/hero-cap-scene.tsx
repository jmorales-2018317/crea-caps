"use client";

import { Suspense, useRef, type ReactNode, type RefObject } from "react";
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group, type Texture } from "three";
import { HeroCapModel } from "@/components/store/hero-cap-model";
import type { CapPartColors, CapPartId } from "@/types/personalization";

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

type HeroCapSceneProps = {
  rotationYRef: RefObject<number>;
  rotationXRef?: RefObject<number>;
  zoomDistanceRef?: RefObject<number>;
  lookAtY?: number;
  logoTexture: Texture | null;
  logoSize: number;
  partColors?: CapPartColors;
  selectedPart?: CapPartId | null;
  hoveredPart?: CapPartId | null;
  capRootRef?: RefObject<Group | null>;
  introSpin?: boolean;
  introCancelRef?: RefObject<boolean>;
  onReadyRef?: RefObject<(() => void) | null>;
};

export function HeroCapScene({
  rotationYRef,
  rotationXRef,
  zoomDistanceRef,
  lookAtY,
  logoTexture,
  logoSize,
  partColors,
  selectedPart = null,
  hoveredPart = null,
  capRootRef,
  introSpin = false,
  introCancelRef,
  onReadyRef,
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
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#e4d3a4", "#1a1610", 0.95]} />
      <directionalLight position={[3, 4, 4]} intensity={0.6} />
      <Suspense fallback={null}>
        <CapYTurntable
          rotationYRef={rotationYRef}
          groupRef={capRootRef}
          introSpin={introSpin}
          introCancelRef={introCancelRef}
          onReadyRef={onReadyRef}
        >
          <HeroCapModel
            logoTexture={logoTexture}
            logoSize={logoSize}
            partColors={partColors}
            selectedPart={selectedPart}
            hoveredPart={hoveredPart}
          />
        </CapYTurntable>
      </Suspense>
      <ContactShadows
        position={[0, -0.77, 0]}
        opacity={0.38}
        scale={6}
        blur={2.4}
        far={3}
      />
    </>
  );
}
