"use client";

import { useLayoutEffect, useMemo } from "react";
import { Center, useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type Object3D,
  type Texture,
} from "three";
import {
  FrontLogoDecal,
  type LogoDecalAxes,
} from "@/components/store/front-logo-decal";
import {
  CROWN_FRONT_NAME,
  LOGO_ANCHOR_NAMES,
  LOGO_FRONT_PAIR_COVERAGE,
  LOGO_PANEL_COVERAGE,
  LOGO_TARGET_MESH_NAMES,
  LOGO_VISOR_PAIR_COVERAGE,
  VISOR_UP_NAME,
} from "@/components/store/hero-cap-logo";
import {
  CAP_PART_HEX_PATTERN,
  CAP_PARTS,
  DEFAULT_CAP_PART_COLOR,
  DEFAULT_CAP_PART_COLORS,
  LOGO_PLACEMENTS,
  resolveExactCapPartId,
  resolveCapPartIdFromName,
  type CapPartColors,
  type CapPartId,
  type LogoPlacement,
} from "@/types/personalization";

export const HERO_CAP_GLB_PATH = "/models/cap/gorra_abierta.glb";
const CAP_ROOT_NAME = "White Linen Mesh Cap";
const TARGET_SIZE = 1.52;
const SELECTED_EMISSIVE = "#b89a55";
const SELECTED_EMISSIVE_INTENSITY = 0.1;
const HOVERED_EMISSIVE_INTENSITY = 0.04;

export function getCapPartIdFromObject(object: Object3D): CapPartId | null {
  let current: Object3D | null = object;
  let strippedMatch: CapPartId | null = null;
  while (current) {
    const exact = resolveExactCapPartId(current.name);
    if (exact) {
      return exact;
    }
    if (!strippedMatch) {
      strippedMatch = resolveCapPartIdFromName(current.name);
    }
    current = current.parent;
  }
  return strippedMatch;
}

function isColorableCapMesh(object: Object3D): boolean {
  return getCapPartIdFromObject(object) !== null;
}

function prepareCapMaterial(material: MeshStandardMaterial) {
  const next = material.clone();
  next.color.set(DEFAULT_CAP_PART_COLOR);
  next.emissive.set("#000000");
  next.emissiveIntensity = 0;
  if (next instanceof MeshPhysicalMaterial) {
    next.specularIntensity = 0;
  }
  return next;
}

function resolvePartColor(
  part: CapPartId,
  partColors: CapPartColors | undefined,
): string | null {
  const candidate = partColors?.[part] ?? DEFAULT_CAP_PART_COLORS[part];
  return CAP_PART_HEX_PATTERN.test(candidate) ? candidate : null;
}

function applyPartAppearance(
  material: MeshStandardMaterial,
  color: string | null,
  highlight: "selected" | "hovered" | "none",
) {
  if (color) {
    material.color.set(color);
  }
  if (highlight === "selected") {
    material.emissive.set(SELECTED_EMISSIVE);
    material.emissiveIntensity = SELECTED_EMISSIVE_INTENSITY;
  } else if (highlight === "hovered") {
    material.emissive.set(SELECTED_EMISSIVE);
    material.emissiveIntensity = HOVERED_EMISSIVE_INTENSITY;
  } else {
    material.emissive.set("#000000");
    material.emissiveIntensity = 0;
  }
}

function applyCapAppearance(
  root: Object3D,
  partColors: CapPartColors | undefined,
  selectedPart: CapPartId | null,
  hoveredPart: CapPartId | null,
) {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const part = getCapPartIdFromObject(child);
    if (!part) {
      return;
    }

    const highlight =
      part === selectedPart
        ? "selected"
        : part === hoveredPart
          ? "hovered"
          : "none";
    const color = resolvePartColor(part, partColors);
    const sourceMaterial = child.material;

    if (Array.isArray(sourceMaterial)) {
      for (const material of sourceMaterial) {
        if (material instanceof MeshStandardMaterial) {
          applyPartAppearance(material, color, highlight);
        }
      }
      return;
    }

    if (sourceMaterial instanceof MeshStandardMaterial) {
      applyPartAppearance(sourceMaterial, color, highlight);
    }
  });
}

function attachOrphanPart(scene: Object3D, clone: Group, name: string) {
  const object = scene.getObjectByName(name);
  if (object && object !== clone && !clone.getObjectByName(name)) {
    clone.add(object.clone(true));
  }
}

function findMesh(object: Object3D | undefined): Mesh | null {
  if (!object) {
    return null;
  }
  if (object instanceof Mesh) {
    return object;
  }
  let found: Mesh | null = null;
  object.traverse((child) => {
    if (!found && child instanceof Mesh) {
      found = child;
    }
  });
  return found;
}

const IDENTITY_AXES: LogoDecalAxes = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};

type LogoSlotFrame = {
  placement: LogoPlacement;
  target: "front" | "visor";
  position: [number, number, number];
  axes: LogoDecalAxes;
  projectorSize: number;
};

export type CapLogoInstance = {
  id?: string;
  placement: LogoPlacement;
  texture: Texture;
  size: number;
};

function tuple3(vector: Vector3): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

function meshFallbackSize(mesh: Mesh): number {
  mesh.geometry.computeBoundingBox();
  const size =
    mesh.geometry.boundingBox?.getSize(new Vector3()) ??
    new Vector3(0.08, 0.08, 0.08);
  return Math.min(size.x, size.y) * LOGO_PANEL_COVERAGE;
}

function pairDistance(scene: Object3D, first: string, second: string): number {
  const a = scene.getObjectByName(first);
  const b = scene.getObjectByName(second);
  if (!a || !b) {
    return 0;
  }
  return a
    .getWorldPosition(new Vector3())
    .distanceTo(b.getWorldPosition(new Vector3()));
}

function getAnchorFrame(
  scene: Object3D,
  targetMesh: Mesh,
  anchorName: string,
): { position: Vector3; axes: LogoDecalAxes } {
  const sourceMesh = findMesh(scene.getObjectByName(targetMesh.name)) ?? targetMesh;
  scene.updateMatrixWorld(true);
  sourceMesh.updateMatrixWorld(true);

  const anchor = scene.getObjectByName(anchorName);
  if (!anchor) {
    sourceMesh.geometry.computeBoundingBox();
    const center = new Vector3();
    sourceMesh.geometry.boundingBox?.getCenter(center);
    return { position: center, axes: IDENTITY_AXES };
  }

  const local = new Matrix4()
    .copy(sourceMesh.matrixWorld)
    .invert()
    .multiply(anchor.matrixWorld);
  const position = new Vector3();
  const quaternion = new Quaternion();
  local.decompose(position, quaternion, new Vector3());
  return {
    position,
    axes: {
      x: tuple3(new Vector3(1, 0, 0).applyQuaternion(quaternion).normalize()),
      y: tuple3(new Vector3(0, 1, 0).applyQuaternion(quaternion).normalize()),
      z: tuple3(new Vector3(0, 0, 1).applyQuaternion(quaternion).normalize()),
    },
  };
}

function buildLogoSlots(
  scene: Object3D,
  frontMesh: Mesh | null,
  visorMesh: Mesh | null,
): LogoSlotFrame[] {
  const frontFallback = frontMesh ? meshFallbackSize(frontMesh) : 0.05;
  const visorFallback = visorMesh ? meshFallbackSize(visorMesh) : frontFallback;
  const frontPair = pairDistance(
    scene,
    LOGO_ANCHOR_NAMES.front_left,
    LOGO_ANCHOR_NAMES.front_right,
  );
  const visorPair = pairDistance(
    scene,
    LOGO_ANCHOR_NAMES.visor_left,
    LOGO_ANCHOR_NAMES.visor_right,
  );
  const frontSize =
    frontPair > 0.002 ? frontPair * LOGO_FRONT_PAIR_COVERAGE : frontFallback;
  const visorSize =
    visorPair > 0.002 ? visorPair * LOGO_VISOR_PAIR_COVERAGE : visorFallback;

  return LOGO_PLACEMENTS.flatMap((placement) => {
    const targetName = LOGO_TARGET_MESH_NAMES[placement];
    const targetMesh = targetName === VISOR_UP_NAME ? visorMesh : frontMesh;
    if (!targetMesh) {
      return [];
    }
    const frame = getAnchorFrame(scene, targetMesh, LOGO_ANCHOR_NAMES[placement]);
    return [
      {
        placement,
        target: targetName === VISOR_UP_NAME ? "visor" : "front",
        position: tuple3(frame.position),
        axes: frame.axes,
        projectorSize: targetName === VISOR_UP_NAME ? visorSize : frontSize,
      },
    ];
  });
}

type HeroCapModelProps = {
  logos?: CapLogoInstance[];
  partColors?: CapPartColors;
  selectedPart?: CapPartId | null;
  hoveredPart?: CapPartId | null;
};

function extractNamedMesh(clone: Group, name: string): Mesh | null {
  const mesh = findMesh(clone.getObjectByName(name));
  if (!mesh) {
    return null;
  }
  mesh.name = name;
  mesh.removeFromParent();
  return mesh;
}

function LogoTargetMesh({
  mesh,
  logos,
  slots,
}: {
  mesh: Mesh;
  logos: CapLogoInstance[];
  slots: LogoSlotFrame[];
}) {
  return (
    <mesh
      name={mesh.name}
      geometry={mesh.geometry}
      material={mesh.material}
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
      castShadow
      receiveShadow
    >
      {logos.map((logo) => {
        const slot = slots.find((item) => item.placement === logo.placement);
        if (!slot) {
          return null;
        }
        return (
          <FrontLogoDecal
            key={logo.id ?? logo.placement}
            map={logo.texture}
            position={slot.position}
            axes={slot.axes}
            size={slot.projectorSize * logo.size}
          />
        );
      })}
    </mesh>
  );
}

export function HeroCapModel({
  logos = [],
  partColors,
  selectedPart = null,
  hoveredPart = null,
}: HeroCapModelProps) {
  const { scene } = useGLTF(HERO_CAP_GLB_PATH);

  const prepared = useMemo(() => {
    const capRoot = scene.getObjectByName(CAP_ROOT_NAME) ?? scene;
    const clone = capRoot.clone(true) as Group;
    for (const part of CAP_PARTS) {
      attachOrphanPart(scene, clone, part);
    }

    clone.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      if (!isColorableCapMesh(child)) {
        return;
      }

      const sourceMaterial = child.material;
      if (Array.isArray(sourceMaterial)) {
        child.material = sourceMaterial.map((material) =>
          material instanceof MeshStandardMaterial
            ? prepareCapMaterial(material)
            : material,
        );
        return;
      }

      if (sourceMaterial instanceof MeshStandardMaterial) {
        child.material = prepareCapMaterial(sourceMaterial);
      }
    });

    clone.updateMatrixWorld(true);
    const size = new Box3().setFromObject(clone).getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const capScale = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    const frontMesh = extractNamedMesh(clone, CROWN_FRONT_NAME);
    const visorMesh = extractNamedMesh(clone, VISOR_UP_NAME);
    const slots = buildLogoSlots(scene, frontMesh, visorMesh);

    return {
      body: clone,
      frontMesh,
      visorMesh,
      capScale,
      slots,
    };
  }, [scene]);

  useLayoutEffect(() => {
    applyCapAppearance(
      prepared.body,
      partColors,
      selectedPart,
      hoveredPart,
    );
    if (prepared.frontMesh) {
      applyCapAppearance(
        prepared.frontMesh,
        partColors,
        selectedPart,
        hoveredPart,
      );
    }
    if (prepared.visorMesh) {
      applyCapAppearance(
        prepared.visorMesh,
        partColors,
        selectedPart,
        hoveredPart,
      );
    }
  }, [hoveredPart, partColors, prepared, selectedPart]);

  const frontLogos = logos.filter(
    (logo) => LOGO_TARGET_MESH_NAMES[logo.placement] === CROWN_FRONT_NAME,
  );
  const visorLogos = logos.filter(
    (logo) => LOGO_TARGET_MESH_NAMES[logo.placement] === VISOR_UP_NAME,
  );
  const frontSlots = prepared.slots.filter((slot) => slot.target === "front");
  const visorSlots = prepared.slots.filter((slot) => slot.target === "visor");

  return (
    <Center>
      <group scale={prepared.capScale}>
        <primitive object={prepared.body} />
        {prepared.frontMesh ? (
          <LogoTargetMesh
            mesh={prepared.frontMesh}
            logos={frontLogos}
            slots={frontSlots}
          />
        ) : null}
        {prepared.visorMesh ? (
          <LogoTargetMesh
            mesh={prepared.visorMesh}
            logos={visorLogos}
            slots={visorSlots}
          />
        ) : null}
      </group>
    </Center>
  );
}

useGLTF.preload(HERO_CAP_GLB_PATH);
