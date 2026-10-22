"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  FrontSide,
  Mesh,
  Vector3,
  type Texture,
} from "three";
import { getLogoAspect } from "@/components/store/hero-cap-logo";

const MIN_OUTWARD_DOT = 0.35;
const SURFACE_OFFSET = 0.00022;
const ENVELOPE_CELL = 0.0012;
const GRID_SEGMENTS = 18;
const MAX_RIDGE_LIFT = 0.00028;
const FIT_SAMPLE_EXTENT = 0.022;
const CURVE_SMALL_EXTENT = 0.018;
const CURVE_LARGE_EXTENT = 0.054;
const CURVE_KEEP_AT_LARGE = 0.1;
const MAX_EDGE_SAG = 0.0016;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

type FrontLogoDecalProps = {
  map: Texture;
  position: [number, number, number];
  size: number;
};

type Quadric = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

function heightAt(q: Quadric, x: number, y: number): number {
  return q.a + q.b * x + q.c * y + q.d * x * x + q.e * y * y + q.f * x * y;
}

function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i] ?? 0]);

  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let pivotAbs = Math.abs(a[pivotRow]?.[col] ?? 0);
    for (let row = col + 1; row < n; row += 1) {
      const value = Math.abs(a[row]?.[col] ?? 0);
      if (value > pivotAbs) {
        pivotRow = row;
        pivotAbs = value;
      }
    }
    if (pivotAbs < 1e-12) {
      return null;
    }
    const pivot = a[col];
    const swap = a[pivotRow];
    if (!pivot || !swap) {
      return null;
    }
    a[col] = swap;
    a[pivotRow] = pivot;

    const divisor = a[col]?.[col];
    if (!divisor) {
      return null;
    }
    for (let j = col; j <= n; j += 1) {
      const current = a[col];
      if (current) {
        current[j] = (current[j] ?? 0) / divisor;
      }
    }
    for (let row = 0; row < n; row += 1) {
      if (row === col) {
        continue;
      }
      const factor = a[row]?.[col] ?? 0;
      for (let j = col; j <= n; j += 1) {
        const current = a[row];
        const source = a[col];
        if (current && source) {
          current[j] = (current[j] ?? 0) - factor * (source[j] ?? 0);
        }
      }
    }
  }

  return a.map((row) => row[n] ?? 0);
}

function flattenQuadric(q: Quadric, width: number, height: number): Quadric {
  const extent = Math.max(width, height);
  const flatten = smoothstep(CURVE_SMALL_EXTENT, CURVE_LARGE_EXTENT, extent);
  const keep = 1 - flatten * (1 - CURVE_KEEP_AT_LARGE);
  let d = q.d * keep;
  let e = q.e * keep;
  let f = q.f * keep;
  const hx = width / 2;
  const hy = height / 2;
  const sag = Math.abs(d * hx * hx + e * hy * hy) + Math.abs(f * hx * hy) * 0.5;
  if (sag > MAX_EDGE_SAG && sag > 1e-12) {
    const scale = MAX_EDGE_SAG / sag;
    d *= scale;
    e *= scale;
    f *= scale;
  }
  return { ...q, d, e, f };
}

function fitQuadric(samples: Array<{ x: number; y: number; z: number }>): Quadric | null {
  if (samples.length < 8) {
    return null;
  }

  const ata = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 0));
  const atb = Array.from({ length: 6 }, () => 0);

  for (const sample of samples) {
    const terms = [
      1,
      sample.x,
      sample.y,
      sample.x * sample.x,
      sample.y * sample.y,
      sample.x * sample.y,
    ];
    for (let i = 0; i < 6; i += 1) {
      atb[i] = (atb[i] ?? 0) + (terms[i] ?? 0) * sample.z;
      const row = ata[i];
      if (!row) {
        continue;
      }
      for (let j = 0; j < 6; j += 1) {
        row[j] = (row[j] ?? 0) + (terms[i] ?? 0) * (terms[j] ?? 0);
      }
    }
  }

  const solved = solveLinearSystem(ata, atb);
  if (!solved) {
    return null;
  }
  return {
    a: solved[0] ?? 0,
    b: solved[1] ?? 0,
    c: solved[2] ?? 0,
    d: solved[3] ?? 0,
    e: solved[4] ?? 0,
    f: solved[5] ?? 0,
  };
}

function collectOuterSamples(
  mesh: Mesh,
  origin: Vector3,
  width: number,
  height: number,
): Array<{ x: number; y: number; z: number }> {
  const position = mesh.geometry.getAttribute("position");
  const normal = mesh.geometry.getAttribute("normal");
  if (!position) {
    return [];
  }

  const maxZ = new Map<string, { x: number; y: number; z: number }>();
  const pad = Math.max(width, height) * 0.12;
  for (let i = 0; i < position.count; i += 1) {
    if (normal && normal.getZ(i) < MIN_OUTWARD_DOT) {
      continue;
    }
    const x = position.getX(i);
    const y = position.getY(i);
    if (
      Math.abs(x - origin.x) > width / 2 + pad ||
      Math.abs(y - origin.y) > height / 2 + pad
    ) {
      continue;
    }
    const z = position.getZ(i);
    const key = `${Math.round(x / ENVELOPE_CELL)}:${Math.round(y / ENVELOPE_CELL)}`;
    const current = maxZ.get(key);
    if (!current || z > current.z) {
      maxZ.set(key, { x, y, z });
    }
  }
  return [...maxZ.values()];
}

function createSmoothLogoGeometry(
  mesh: Mesh,
  origin: Vector3,
  width: number,
  height: number,
): BufferGeometry {
  const samples = collectOuterSamples(
    mesh,
    origin,
    Math.min(width, FIT_SAMPLE_EXTENT),
    Math.min(height, FIT_SAMPLE_EXTENT),
  );
  const relativeSamples = samples.map((sample) => ({
    x: sample.x - origin.x,
    y: sample.y - origin.y,
    z: sample.z,
  }));
  const fitted =
    fitQuadric(relativeSamples) ?? {
      a: origin.z,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
    };
  const quadric = flattenQuadric(fitted, width, height);
  let maxAbove = 0;
  for (const sample of relativeSamples) {
    maxAbove = Math.max(maxAbove, sample.z - heightAt(quadric, sample.x, sample.y));
  }
  const lift = SURFACE_OFFSET + Math.min(Math.max(maxAbove, 0), MAX_RIDGE_LIFT);

  const segments = GRID_SEGMENTS;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const pushVertex = (u: number, v: number) => {
    const x = origin.x + (u - 0.5) * width;
    const y = origin.y + (v - 0.5) * height;
    const lx = x - origin.x;
    const ly = y - origin.y;
    const z = heightAt(quadric, lx, ly);
    const dzdx = quadric.b + 2 * quadric.d * lx + quadric.f * ly;
    const dzdy = quadric.c + 2 * quadric.e * ly + quadric.f * lx;
    const nx = -dzdx;
    const ny = -dzdy;
    const nz = 1;
    const length = Math.hypot(nx, ny, nz) || 1;
    positions.push(
      x + (nx / length) * lift,
      y + (ny / length) * lift,
      z + (nz / length) * lift,
    );
    normals.push(nx / length, ny / length, nz / length);
    uvs.push(u, v);
  };

  for (let row = 0; row < segments; row += 1) {
    for (let col = 0; col < segments; col += 1) {
      const u0 = col / segments;
      const v0 = row / segments;
      const u1 = (col + 1) / segments;
      const v1 = (row + 1) / segments;
      pushVertex(u0, v0);
      pushVertex(u1, v0);
      pushVertex(u0, v1);
      pushVertex(u1, v0);
      pushVertex(u1, v1);
      pushVertex(u0, v1);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  return geometry;
}

export function FrontLogoDecal({ map, position, size }: FrontLogoDecalProps) {
  const meshRef = useRef<Mesh>(null);
  const aspect = getLogoAspect(map);
  const width = aspect >= 1 ? size : size * aspect;
  const height = aspect >= 1 ? size / aspect : size;
  const origin = useMemo(
    () => new Vector3(position[0], position[1], position[2]),
    [position],
  );

  useLayoutEffect(() => {
    const decalMesh = meshRef.current;
    const parent = decalMesh?.parent;
    if (!decalMesh || !(parent instanceof Mesh)) {
      return;
    }

    const nextGeometry = createSmoothLogoGeometry(parent, origin, width, height);
    const previous = decalMesh.geometry;
    decalMesh.geometry = nextGeometry;
    previous.dispose();

    return () => {
      nextGeometry.dispose();
    };
  }, [height, origin, width]);

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={2}>
      <meshStandardMaterial
        map={map}
        transparent
        depthTest
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-6}
        polygonOffsetUnits={-6}
        roughness={0.82}
        metalness={0}
        toneMapped={false}
        side={FrontSide}
      />
    </mesh>
  );
}
