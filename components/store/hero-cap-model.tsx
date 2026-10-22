"use client";

import { useLayoutEffect, useMemo } from "react";
import { Center, useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
  type Texture,
} from "three";
import { FrontLogoDecal } from "@/components/store/front-logo-decal";
import {
  CROWN_FRONT_NAME,
  LOGO_ANCHOR_NAME,
  LOGO_PANEL_COVERAGE,
} from "@/components/store/hero-cap-logo";
import {
  CAP_PART_HEX_PATTERN,
  CAP_PARTS,
  DEFAULT_CAP_PART_COLOR,
  DEFAULT_CAP_PART_COLORS,
  resolveExactCapPartId,
  resolveCapPartIdFromName,
  type CapPartColors,
  type CapPartId,
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

function getAnchorPosition(scene: Object3D, frontMesh: Mesh): Vector3 {
  const anchor = scene.getObjectByName(LOGO_ANCHOR_NAME);
  const sourceFront =
    findMesh(scene.getObjectByName(CROWN_FRONT_NAME)) ?? frontMesh;
  scene.updateMatrixWorld(true);
  if (!anchor) {
    sourceFront.geometry.computeBoundingBox();
    const center = new Vector3();
    sourceFront.geometry.boundingBox?.getCenter(center);
    return center;
  }
  return sourceFront.worldToLocal(anchor.getWorldPosition(new Vector3()));
}

function getProjectorSize(anchor: Object3D | undefined, frontMesh: Mesh): number {
  if (anchor) {
    const scale = new Vector3();
    anchor.getWorldScale(scale);
    const anchorSize = Math.max(Math.abs(scale.x), Math.abs(scale.y));
    if (anchorSize > 0.002 && Math.abs(anchorSize - 1) > 0.02) {
      return anchorSize;
    }
  }

  frontMesh.geometry.computeBoundingBox();
  const size =
    frontMesh.geometry.boundingBox?.getSize(new Vector3()) ??
    new Vector3(0.08, 0.08, 0.08);
  return Math.min(size.x, size.y) * LOGO_PANEL_COVERAGE;
}

type HeroCapModelProps = {
  logoTexture: Texture | null;
  logoSize: number;
  partColors?: CapPartColors;
  selectedPart?: CapPartId | null;
  hoveredPart?: CapPartId | null;
};

export function HeroCapModel({
  logoTexture,
  logoSize,
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

    const frontMesh = findMesh(clone.getObjectByName(CROWN_FRONT_NAME));
    if (frontMesh) {
      frontMesh.name = CROWN_FRONT_NAME;
      clone.remove(frontMesh);
    }

    const anchor = scene.getObjectByName(LOGO_ANCHOR_NAME);
    const projectorSize = frontMesh
      ? getProjectorSize(anchor, frontMesh)
      : 0.05;
    const anchorPosition = frontMesh
      ? getAnchorPosition(scene, frontMesh)
      : new Vector3();

    return {
      body: clone,
      frontMesh,
      capScale,
      projectorSize,
      anchorPosition: [
        anchorPosition.x,
        anchorPosition.y,
        anchorPosition.z,
      ] as [number, number, number],
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
  }, [hoveredPart, partColors, prepared, selectedPart]);

  return (
    <Center>
      <group scale={prepared.capScale}>
        <primitive object={prepared.body} />
        {prepared.frontMesh ? (
          <mesh
            name={CROWN_FRONT_NAME}
            geometry={prepared.frontMesh.geometry}
            material={prepared.frontMesh.material}
            position={prepared.frontMesh.position}
            rotation={prepared.frontMesh.rotation}
            scale={prepared.frontMesh.scale}
            castShadow
            receiveShadow
          >
            {logoTexture ? (
              <FrontLogoDecal
                map={logoTexture}
                position={prepared.anchorPosition}
                size={prepared.projectorSize * logoSize}
              />
            ) : null}
          </mesh>
        ) : null}
      </group>
    </Center>
  );
}

useGLTF.preload(HERO_CAP_GLB_PATH);
