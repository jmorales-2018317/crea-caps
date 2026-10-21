export const CAP_PARTS = [
  "crown_front",
  "crown_left",
  "crown_right",
  "crown_back_left",
  "crown_back_right",
  "visor_up",
  "visor_stitch",
  "visor_under",
  "squatchee",
  "snapback",
] as const;

export type CapPartId = (typeof CAP_PARTS)[number];

export const CAP_PART_LABELS: Record<CapPartId, string> = {
  crown_front: "Panel frontal",
  crown_left: "Corona izquierda",
  crown_right: "Corona derecha",
  crown_back_left: "Corona trasera izquierda",
  crown_back_right: "Corona trasera derecha",
  visor_up: "Visera (arriba)",
  visor_stitch: "Hilos",
  visor_under: "Visera (debajo)",
  squatchee: "Botón",
  snapback: "Cincho",
};

export const VISOR_STITCH_MESH_NAMES = [
  "visor_stitch_01",
  "visor_stitch_02",
  "visor_stitch_03",
  "visor_stitch_04",
  "visor_stitch_05",
  "visor_stitch_06",
] as const;

export const DEFAULT_CAP_PART_COLOR = "#333333";
export const DEFAULT_VISOR_STITCH_COLOR = "#555555";

export const CAP_PART_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export type CapPartColors = Record<CapPartId, string>;

export const DEFAULT_CAP_PART_COLORS: CapPartColors = {
  crown_front: DEFAULT_CAP_PART_COLOR,
  crown_left: DEFAULT_CAP_PART_COLOR,
  crown_right: DEFAULT_CAP_PART_COLOR,
  crown_back_left: DEFAULT_CAP_PART_COLOR,
  crown_back_right: DEFAULT_CAP_PART_COLOR,
  visor_up: DEFAULT_CAP_PART_COLOR,
  visor_stitch: DEFAULT_VISOR_STITCH_COLOR,
  visor_under: DEFAULT_CAP_PART_COLOR,
  squatchee: DEFAULT_CAP_PART_COLOR,
  snapback: DEFAULT_CAP_PART_COLOR,
};

export const PERSONALIZATION_STORAGE_KEY = "caps-store-personalization-v1";

export const LOGO_SIZE_PX_MIN = 40;
export const LOGO_SIZE_PX_MAX = 140;
export const LOGO_SIZE_PX_DEFAULT = 80;

export function isCapPartId(value: string): value is CapPartId {
  return (CAP_PARTS as readonly string[]).includes(value);
}

export function resolveCapPartIdFromName(name: string): CapPartId | null {
  const normalized = name.toLowerCase().replace(/\.\d+$/, "");
  if (isCapPartId(normalized)) {
    return normalized;
  }
  if (
    (VISOR_STITCH_MESH_NAMES as readonly string[]).includes(normalized) ||
    normalized.startsWith("visor_stitch_")
  ) {
    return "visor_stitch";
  }
  return null;
}

export function sanitizePartColors(value: unknown): CapPartColors {
  const next: CapPartColors = { ...DEFAULT_CAP_PART_COLORS };
  if (!value || typeof value !== "object") {
    return next;
  }

  const record = value as Record<string, unknown>;
  for (const part of CAP_PARTS) {
    const hex = record[part];
    if (typeof hex === "string" && CAP_PART_HEX_PATTERN.test(hex)) {
      next[part] = hex.toUpperCase();
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
  resetDesign: () => void;
};

export type PersonalizationStore = PersonalizationState &
  PersonalizationActions & {
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
  };
