import type { PaletteColor } from "@/types/colors";

export type { PaletteColor };

export const CAP_PART_GROUPS = [
  {
    id: "panels",
    label: "Paneles y corona",
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
    id: "visor",
    label: "Visera y costuras",
    parts: ["visor_up", "visor_under", "visor_stitch_up", "visor_stitch_under"],
  },
  {
    id: "crown_stitches",
    label: "Costuras de corona",
    parts: [
      "crown_stitch_front",
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
    parts: ["squatchee", "sweatband", "snapback"],
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
  crown_stitch_front: "Costura frontal",
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
  crown_front_stitch: "crown_stitch_front",
  crown_stitch_front_001: "crown_stitch_front",
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
  crown_stitch_front: DEFAULT_VISOR_STITCH_COLOR,
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
export const LOGO_SIZE_PX_MAX = 110;
export const LOGO_SIZE_PX_DEFAULT = 80;
export const LOGO_SIZE_PX_MAX_COMPACT = 70;
export const LOGO_SIZE_PX_DEFAULT_COMPACT = 55;
export const LOGO_SIZE_PX_MAX_SWEATBAND = 50;
export const LOGO_SIZE_PX_DEFAULT_SWEATBAND = 50;

export const LOGO_PLACEMENTS = [
  "front_left",
  "front_center",
  "front_right",
  "visor_left",
  "visor_right",
  "sweatband_left",
  "sweatband_right",
] as const;

export type LogoPlacement = (typeof LOGO_PLACEMENTS)[number];

export const DEFAULT_LOGO_PLACEMENT: LogoPlacement = "front_center";

export const LOGO_PLACEMENT_LABELS: Record<LogoPlacement, string> = {
  front_left: "Izquierda",
  front_center: "Centro",
  front_right: "Derecha",
  visor_left: "Izquierda",
  visor_right: "Derecha",
  sweatband_left: "Izquierda",
  sweatband_right: "Derecha",
};

export const LOGO_PLACEMENT_FULL_LABELS: Record<LogoPlacement, string> = {
  front_left: "Panel frontal · izquierda",
  front_center: "Panel frontal · centro",
  front_right: "Panel frontal · derecha",
  visor_left: "Visera · izquierda",
  visor_right: "Visera · derecha",
  sweatband_left: "Banda interior · izquierda",
  sweatband_right: "Banda interior · derecha",
};

export const LOGO_PLACEMENT_GROUPS = [
  {
    id: "front",
    label: "Panel frontal",
    placements: ["front_left", "front_center", "front_right"],
  },
  {
    id: "visor",
    label: "Visera",
    placements: ["visor_left", "visor_right"],
  },
  {
    id: "sweatband",
    label: "Banda interior",
    placements: ["sweatband_left", "sweatband_right"],
  },
] as const;

export type LogoPlacementGroupId = (typeof LOGO_PLACEMENT_GROUPS)[number]["id"];

export const MAX_PERSONALIZATION_LOGOS = LOGO_PLACEMENTS.length;

export type PersonalizationLogoDraft = {
  id: string;
  url: string;
  placement: LogoPlacement;
  sizePx: number;
};

export type SerializableLogo = {
  placement: LogoPlacement;
  size: number;
};

export const LOGO_ASSIGNMENT_ORDER: readonly LogoPlacement[] = [
  "front_center",
  "front_left",
  "front_right",
  "visor_left",
  "visor_right",
  "sweatband_left",
  "sweatband_right",
];

export function isLogoPlacement(value: unknown): value is LogoPlacement {
  return (
    typeof value === "string" &&
    (LOGO_PLACEMENTS as readonly string[]).includes(value)
  );
}

export function nextAvailableLogoPlacement(
  used: readonly LogoPlacement[],
): LogoPlacement | null {
  return (
    LOGO_ASSIGNMENT_ORDER.find((placement) => !used.includes(placement)) ?? null
  );
}

export function takeAvailableLogoPlacements(
  used: readonly LogoPlacement[],
  count: number,
): LogoPlacement[] {
  if (count <= 0) {
    return [];
  }
  return LOGO_ASSIGNMENT_ORDER.filter(
    (placement) => !used.includes(placement),
  ).slice(0, count);
}

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

export function isSweatbandLogoPlacement(placement: LogoPlacement): boolean {
  return placement === "sweatband_left" || placement === "sweatband_right";
}

export function getLogoSizePxMax(placement: LogoPlacement): number {
  if (placement === "front_center") {
    return LOGO_SIZE_PX_MAX;
  }
  if (isSweatbandLogoPlacement(placement)) {
    return LOGO_SIZE_PX_MAX_SWEATBAND;
  }
  return LOGO_SIZE_PX_MAX_COMPACT;
}

export function getLogoSizePxDefault(placement: LogoPlacement): number {
  if (placement === "front_center") {
    return LOGO_SIZE_PX_DEFAULT;
  }
  if (isSweatbandLogoPlacement(placement)) {
    return LOGO_SIZE_PX_DEFAULT_SWEATBAND;
  }
  return LOGO_SIZE_PX_DEFAULT_COMPACT;
}

export function sanitizeLogoSizePx(
  value: unknown,
  placement?: LogoPlacement,
): number {
  const max = placement ? getLogoSizePxMax(placement) : LOGO_SIZE_PX_MAX;
  const fallback = placement
    ? getLogoSizePxDefault(placement)
    : LOGO_SIZE_PX_DEFAULT;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.round(Math.min(max, Math.max(LOGO_SIZE_PX_MIN, value)));
}

export function serializeDesign(
  colors: CapPartColors,
  logos: readonly SerializableLogo[],
): string {
  const ordered: Record<string, string | SerializableLogo[]> = {};
  for (const part of CAP_PARTS) {
    ordered[part] = colors[part].toUpperCase();
  }
  ordered.logos = logos.map((logo) => ({
    placement: logo.placement,
    size: sanitizeLogoSizePx(logo.size, logo.placement),
  }));
  return JSON.stringify(ordered, null, 2);
}

export type PersonalizationState = {
  partColors: CapPartColors;
  selectedPart: CapPartId | null;
};

export type PersonalizationActions = {
  setPartColor: (part: CapPartId, color: string) => void;
  selectPart: (part: CapPartId | null) => void;
  constrainToPalette: (palette: readonly PaletteColor[]) => void;
  resetDesign: () => void;
};

export type PersonalizationStore = PersonalizationState &
  PersonalizationActions & {
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
  };
