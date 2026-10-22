import type { PaletteColor } from "@/types/colors";

export type { PaletteColor };

export const CAP_PART_GROUPS = [
  {
    id: "panels",
    label: "Paneles",
    parts: [
      "crown_front_outside",
      "crown_front_inside",
      "crown_left",
      "crown_right",
      "crown_back_left",
      "crown_back_right",
    ],
  },
  {
    id: "stitches",
    label: "Costuras",
    parts: [
      "visor_stitch_up",
      "visor_stitch_under",
      "crown_stitch_front_001",
      "crown_stitch_left_001",
      "crown_stitch_left_002",
      "crown_stitch_right_001",
      "crown_stitch_right_002",
      "crown_stitch_back_001",
      "crown_stitch_back_002",
    ],
  },
  {
    id: "details",
    label: "Detalles",
    parts: [
      "visor_up",
      "visor_under",
      "squatchee",
      "sweatband",
      "snapback",
    ],
  },
] as const;

type CapPartGroup = (typeof CAP_PART_GROUPS)[number];
export type CapPartId = CapPartGroup["parts"][number];
export type CapPartGroupId = CapPartGroup["id"];

export const CAP_PARTS: readonly CapPartId[] = CAP_PART_GROUPS.flatMap(
  (group) => [...group.parts],
);

export function isCapPartGroupId(value: unknown): value is CapPartGroupId {
  return CAP_PART_GROUPS.some((group) => group.id === value);
}

export function getCapPartGroupId(part: CapPartId): CapPartGroupId {
  const group = CAP_PART_GROUPS.find((item) =>
    (item.parts as readonly CapPartId[]).includes(part),
  );
  return group?.id ?? CAP_PART_GROUPS[0].id;
}

export const CAP_PART_LABELS: Record<CapPartId, string> = {
  crown_front_outside: "Panel frontal (exterior)",
  crown_front_inside: "Panel frontal (interior)",
  crown_left: "Corona izquierda",
  crown_right: "Corona derecha",
  crown_back_left: "Corona trasera izquierda",
  crown_back_right: "Corona trasera derecha",
  crown_stitch_front_001: "Costura frontal",
  crown_stitch_left_001: "Costura izquierda 1",
  crown_stitch_left_002: "Costura izquierda 2",
  crown_stitch_right_001: "Costura derecha 1",
  crown_stitch_right_002: "Costura derecha 2",
  crown_stitch_back_001: "Costura trasera 1",
  crown_stitch_back_002: "Costura trasera 2",
  visor_stitch_up: "Costura visera (superior)",
  visor_stitch_under: "Costura visera (inferior)",
  visor_up: "Visera (superior)",
  visor_under: "Visera (inferior)",
  squatchee: "Botón",
  sweatband: "Banda interior",
  snapback: "Cierre",
};

const LEGACY_PART_ALIASES: Record<string, CapPartId> = {
  crown_front: "crown_front_outside",
  crown_front_stitch: "crown_stitch_front_001",
  visor_stitch: "visor_stitch_up",
};

export const DEFAULT_CAP_PART_COLOR = "#333333";
export const DEFAULT_VISOR_STITCH_COLOR = "#555555";
export const BLACK_WHITE_PART_BLACK = "#000000";
export const BLACK_WHITE_PART_WHITE = "#FFFFFF";

export const BLACK_WHITE_CAP_PARTS = [
  "crown_front_inside",
  "sweatband",
] as const;

export type BlackWhiteCapPartId = (typeof BLACK_WHITE_CAP_PARTS)[number];

export const BLACK_WHITE_COLOR_OPTIONS = [
  { value: BLACK_WHITE_PART_BLACK, label: "Negro" },
  { value: BLACK_WHITE_PART_WHITE, label: "Blanco" },
] as const;

export const CAP_PART_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export type CapPartColors = Record<CapPartId, string>;

export const DEFAULT_CAP_PART_COLORS: CapPartColors = {
  crown_front_outside: DEFAULT_CAP_PART_COLOR,
  crown_front_inside: BLACK_WHITE_PART_BLACK,
  crown_left: DEFAULT_CAP_PART_COLOR,
  crown_right: DEFAULT_CAP_PART_COLOR,
  crown_back_left: DEFAULT_CAP_PART_COLOR,
  crown_back_right: DEFAULT_CAP_PART_COLOR,
  crown_stitch_front_001: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_left_001: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_left_002: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_right_001: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_right_002: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_back_001: DEFAULT_VISOR_STITCH_COLOR,
  crown_stitch_back_002: DEFAULT_VISOR_STITCH_COLOR,
  visor_stitch_up: DEFAULT_VISOR_STITCH_COLOR,
  visor_stitch_under: DEFAULT_VISOR_STITCH_COLOR,
  visor_up: DEFAULT_CAP_PART_COLOR,
  visor_under: DEFAULT_CAP_PART_COLOR,
  squatchee: DEFAULT_CAP_PART_COLOR,
  sweatband: BLACK_WHITE_PART_BLACK,
  snapback: DEFAULT_CAP_PART_COLOR,
};

export const PERSONALIZATION_STORAGE_KEY = "caps-store-personalization-v2";

export const LOGO_SIZE_PX_MIN = 40;
export const LOGO_SIZE_PX_MAX = 140;
export const LOGO_SIZE_PX_DEFAULT = 80;

export function isCapPartId(value: string): value is CapPartId {
  return (CAP_PARTS as readonly string[]).includes(value);
}

export function normalizeCapMeshName(name: string): string {
  return name.toLowerCase().replace(/\.\d+$/, "");
}

export function resolveExactCapPartId(name: string): CapPartId | null {
  const lower = name.toLowerCase();
  if (isCapPartId(lower)) {
    return lower;
  }
  return LEGACY_PART_ALIASES[lower] ?? null;
}

export function resolveCapPartIdFromName(name: string): CapPartId | null {
  const exact = resolveExactCapPartId(name);
  if (exact) {
    return exact;
  }
  const normalized = normalizeCapMeshName(name);
  if (normalized === name.toLowerCase()) {
    return null;
  }
  return resolveExactCapPartId(normalized);
}

export function isBlackWhiteCapPart(
  part: CapPartId,
): part is BlackWhiteCapPartId {
  return (BLACK_WHITE_CAP_PARTS as readonly CapPartId[]).includes(part);
}

export function normalizeCapHex(color: string): string | null {
  const hex = color.trim().toUpperCase();
  return CAP_PART_HEX_PATTERN.test(hex) ? hex : null;
}

export function sanitizeColorForPart(
  part: CapPartId,
  color: string,
): string | null {
  const hex = normalizeCapHex(color);
  if (!hex) {
    return null;
  }
  if (isBlackWhiteCapPart(part)) {
    return hex === BLACK_WHITE_PART_BLACK || hex === BLACK_WHITE_PART_WHITE
      ? hex
      : null;
  }
  return hex;
}

export function getSelectableColorsForPart(
  part: CapPartId,
  palette: readonly PaletteColor[],
): PaletteColor[] {
  const seen = new Set<string>();
  const options: PaletteColor[] = [];

  for (const color of palette) {
    const hex = normalizeCapHex(color.hex_code);
    if (!hex) {
      continue;
    }
    if (isBlackWhiteCapPart(part)) {
      if (hex !== BLACK_WHITE_PART_BLACK && hex !== BLACK_WHITE_PART_WHITE) {
        continue;
      }
    }
    if (seen.has(hex)) {
      continue;
    }
    seen.add(hex);
    options.push({
      id: color.id,
      name: color.name,
      hex_code: hex,
    });
  }

  return options;
}

export function isPaletteColorForPart(
  part: CapPartId,
  color: string,
  palette: readonly PaletteColor[],
): boolean {
  const hex = sanitizeColorForPart(part, color);
  if (!hex) {
    return false;
  }
  return getSelectableColorsForPart(part, palette).some(
    (option) => option.hex_code === hex,
  );
}

export function isAllowedPersistedPartColor(
  part: CapPartId,
  color: string,
  palette: readonly PaletteColor[],
): boolean {
  const hex = sanitizeColorForPart(part, color);
  if (!hex) {
    return false;
  }
  return (
    hex === DEFAULT_CAP_PART_COLORS[part] ||
    isPaletteColorForPart(part, hex, palette)
  );
}

export function constrainPartColorsToPalette(
  colors: CapPartColors,
  palette: readonly PaletteColor[],
): CapPartColors {
  const next: CapPartColors = { ...colors };
  let changed = false;

  for (const part of CAP_PARTS) {
    if (isAllowedPersistedPartColor(part, colors[part], palette)) {
      continue;
    }
    next[part] = DEFAULT_CAP_PART_COLORS[part];
    changed = true;
  }

  return changed ? next : colors;
}

export function sanitizePartColors(value: unknown): CapPartColors {
  const next: CapPartColors = { ...DEFAULT_CAP_PART_COLORS };
  if (!value || typeof value !== "object") {
    return next;
  }

  const record = value as Record<string, unknown>;
  for (const part of CAP_PARTS) {
    const hex = record[part];
    if (typeof hex !== "string") {
      continue;
    }
    const sanitized = sanitizeColorForPart(part, hex);
    if (sanitized) {
      next[part] = sanitized;
    }
  }

  for (const [legacyKey, part] of Object.entries(LEGACY_PART_ALIASES)) {
    if (next[part] !== DEFAULT_CAP_PART_COLORS[part]) {
      continue;
    }
    const legacyColor = record[legacyKey];
    if (typeof legacyColor !== "string") {
      continue;
    }
    const sanitized = sanitizeColorForPart(part, legacyColor);
    if (sanitized) {
      next[part] = sanitized;
    }
  }

  return next;
}

export function isDefaultPartColors(colors: CapPartColors): boolean {
  return CAP_PARTS.every(
    (part) => colors[part] === DEFAULT_CAP_PART_COLORS[part],
  );
}

export function sanitizeLogoSizePx(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return LOGO_SIZE_PX_DEFAULT;
  }
  return Math.round(
    Math.min(LOGO_SIZE_PX_MAX, Math.max(LOGO_SIZE_PX_MIN, value)),
  );
}

export function serializeDesign(
  colors: CapPartColors,
  sizePx: number,
): string {
  const ordered: Record<string, string | number> = {};
  for (const part of CAP_PARTS) {
    ordered[part] = colors[part].toUpperCase();
  }
  ordered.size = sanitizeLogoSizePx(sizePx);
  return JSON.stringify(ordered, null, 2);
}

export type PersonalizationState = {
  partColors: CapPartColors;
  selectedPart: CapPartId | null;
  logoSizePx: number;
};

export type PersonalizationActions = {
  setPartColor: (part: CapPartId, color: string) => void;
  selectPart: (part: CapPartId | null) => void;
  setLogoSizePx: (sizePx: number) => void;
  constrainToPalette: (palette: readonly PaletteColor[]) => void;
  resetDesign: () => void;
};

export type PersonalizationStore = PersonalizationState &
  PersonalizationActions & {
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
  };
