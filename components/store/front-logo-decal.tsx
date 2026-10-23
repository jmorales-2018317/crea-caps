"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  FrontSide,
  Matrix4,
  Mesh,
  Raycaster,
  Vector3,
  type Intersection,
  type Texture,
} from "three";
import { getLogoAspect } from "@/components/store/hero-cap-logo";

const MIN_OUTWARD_DOT = 0.28;
const SURFACE_OFFSET = 0.00028;
const ENVELOPE_CELL = 0.001;
const GRID_SEGMENTS = 24;
const MAX_RIDGE_LIFT = 0.0007;
const RAY_SAMPLE_GRID = 16;
const RAY_START = 0.02;
const RAY_FAR = 0.08;
const CURVE_SMALL_EXTENT = 0.02;
const CURVE_LARGE_EXTENT = 0.09;
const CURVE_KEEP_AT_LARGE = 0.68;
const MAX_EDGE_SAG = 0.0052;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type LogoDecalAxes = {
  x: [number, number, number];
  y: [number, number, number];
  z: [number, number, number];
};

const IDENTITY_AXES: LogoDecalAxes = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};

type FrontLogoDecalProps = {
  map: Texture;
  position: [number, number, number];
  axes?: LogoDecalAxes;
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

function toLocal(
  x: number,
  y: number,
  z: number,
  origin: Vector3,
  axisX: Vector3,
  axisY: Vector3,
  axisZ: Vector3,
) {
  const dx = x - origin.x;
  const dy = y - origin.y;
  const dz = z - origin.z;
  return {
    x: dx * axisX.x + dy * axisX.y + dz * axisX.z,
    y: dx * axisY.x + dy * axisY.y + dz * axisY.z,
    z: dx * axisZ.x + dy * axisZ.y + dz * axisZ.z,
  };
}

function collectOuterSamples(
  mesh: Mesh,
  origin: Vector3,
  axisX: Vector3,
  axisY: Vector3,
  axisZ: Vector3,
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
    if (normal) {
      const outward =
        normal.getX(i) * axisZ.x +
        normal.getY(i) * axisZ.y +
        normal.getZ(i) * axisZ.z;
      if (outward < MIN_OUTWARD_DOT) {
        continue;
      }
    }
    const local = toLocal(
      position.getX(i),
      position.getY(i),
      position.getZ(i),
      origin,
      axisX,
      axisY,
      axisZ,
    );
    if (Math.abs(local.x) > width / 2 + pad || Math.abs(local.y) > height / 2 + pad) {
      continue;
    }
    const key = `${Math.round(local.x / ENVELOPE_CELL)}:${Math.round(local.y / ENVELOPE_CELL)}`;
    const current = maxZ.get(key);
    if (!current || local.z > current.z) {
      maxZ.set(key, local);
    }
  }
  return [...maxZ.values()];
}

function collectRaySamples(
  mesh: Mesh,
  origin: Vector3,
  axisX: Vector3,
  axisY: Vector3,
  axisZ: Vector3,
  width: number,
  height: number,
): Array<{ x: number; y: number; z: number }> {
  mesh.updateMatrixWorld(true);
  const raycaster = new Raycaster();
  const invWorld = new Matrix4().copy(mesh.matrixWorld).invert();
  const worldDir = axisZ.clone().negate().transformDirection(mesh.matrixWorld);
  const localPoint = new Vector3();
  const worldOrigin = new Vector3();
  const hits: Intersection[] = [];
  const samples: Array<{ x: number; y: number; z: number }> = [];
  const pad = 1.06;

  for (let row = 0; row <= RAY_SAMPLE_GRID; row += 1) {
    for (let col = 0; col <= RAY_SAMPLE_GRID; col += 1) {
      const lx = (col / RAY_SAMPLE_GRID - 0.5) * width * pad;
      const ly = (row / RAY_SAMPLE_GRID - 0.5) * height * pad;
      localPoint
        .copy(origin)
        .addScaledVector(axisX, lx)
        .addScaledVector(axisY, ly)
        .addScaledVector(axisZ, RAY_START);
      worldOrigin.copy(localPoint).applyMatrix4(mesh.matrixWorld);
      raycaster.set(worldOrigin, worldDir);
      raycaster.near = 0;
      raycaster.far = RAY_START + RAY_FAR;
      hits.length = 0;
      mesh.raycast(raycaster, hits);
      if (hits.length === 0) {
        continue;
      }
      hits.sort((a, b) => a.distance - b.distance);
      const hit = hits[0];
      if (!hit) {
        continue;
      }
      const localHit = hit.point.clone().applyMatrix4(invWorld);
      samples.push(
        toLocal(
          localHit.x,
          localHit.y,
          localHit.z,
          origin,
          axisX,
          axisY,
          axisZ,
        ),
      );
    }
  }

  return samples;
}

function createSmoothLogoGeometry(
  mesh: Mesh,
  origin: Vector3,
  axisX: Vector3,
  axisY: Vector3,
  axisZ: Vector3,
  width: number,
  height: number,
): BufferGeometry {
  const vertexSamples = collectOuterSamples(
    mesh,
    origin,
    axisX,
    axisY,
    axisZ,
    width,
    height,
  );
  const raySamples = collectRaySamples(
    mesh,
    origin,
    axisX,
    axisY,
    axisZ,
    width,
    height,
  );
  const samples = raySamples.length >= 8 ? raySamples : vertexSamples;
  const envelope = vertexSamples.length >= 8 ? vertexSamples : samples;
  const fitted =
    fitQuadric(samples) ?? {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
    };
  const quadric = flattenQuadric(fitted, width, height);
  let maxAbove = 0;
  for (const sample of envelope) {
    maxAbove = Math.max(maxAbove, sample.z - heightAt(quadric, sample.x, sample.y));
  }
  const lift = SURFACE_OFFSET + Math.min(Math.max(maxAbove, 0), MAX_RIDGE_LIFT);

  const segments = GRID_SEGMENTS;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const pushVertex = (u: number, v: number) => {
    const lx = (u - 0.5) * width;
    const ly = (v - 0.5) * height;
    const lz = heightAt(quadric, lx, ly);
    const dzdx = quadric.b + 2 * quadric.d * lx + quadric.f * ly;
    const dzdy = quadric.c + 2 * quadric.e * ly + quadric.f * lx;
    const localNx = -dzdx;
    const localNy = -dzdy;
    const localNz = 1;
    const localLength = Math.hypot(localNx, localNy, localNz) || 1;
    const nnx = localNx / localLength;
    const nny = localNy / localLength;
    const nnz = localNz / localLength;
    const wx = nnx * axisX.x + nny * axisY.x + nnz * axisZ.x;
    const wy = nnx * axisX.y + nny * axisY.y + nnz * axisZ.y;
    const wz = nnx * axisX.z + nny * axisY.z + nnz * axisZ.z;
    const worldLength = Math.hypot(wx, wy, wz) || 1;
    const nx = wx / worldLength;
    const ny = wy / worldLength;
    const nz = wz / worldLength;
    const x = origin.x + lx * axisX.x + ly * axisY.x + lz * axisZ.x;
    const y = origin.y + lx * axisX.y + ly * axisY.y + lz * axisZ.y;
    const z = origin.z + lx * axisX.z + ly * axisY.z + lz * axisZ.z;
    positions.push(x + nx * lift, y + ny * lift, z + nz * lift);
    normals.push(nx, ny, nz);
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

export function FrontLogoDecal({
  map,
  position,
  axes = IDENTITY_AXES,
  size,
}: FrontLogoDecalProps) {
  const meshRef = useRef<Mesh>(null);
  const aspect = getLogoAspect(map);
  const width = aspect >= 1 ? size : size * aspect;
  const height = aspect >= 1 ? size / aspect : size;
  const origin = useMemo(
    () => new Vector3(position[0], position[1], position[2]),
    [position],
  );
  const axisX = useMemo(() => new Vector3(...axes.x).normalize(), [axes.x]);
  const axisY = useMemo(() => new Vector3(...axes.y).normalize(), [axes.y]);
  const axisZ = useMemo(() => new Vector3(...axes.z).normalize(), [axes.z]);

  useLayoutEffect(() => {
    const decalMesh = meshRef.current;
    const parent = decalMesh?.parent;
    if (!decalMesh || !(parent instanceof Mesh)) {
      return;
    }

    const nextGeometry = createSmoothLogoGeometry(
      parent,
      origin,
      axisX,
      axisY,
      axisZ,
      width,
      height,
    );
    const previous = decalMesh.geometry;
    decalMesh.geometry = nextGeometry;
    previous.dispose();

    return () => {
      nextGeometry.dispose();
    };
  }, [axisX, axisY, axisZ, height, origin, width]);

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
