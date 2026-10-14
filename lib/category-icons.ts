import { iconNames, type IconName } from "lucide-react/dynamic";

const ICON_NAME_SET = new Set<string>(iconNames);

export const LUCIDE_ICON_NAMES = iconNames;

/** Fallback visual / default al crear categorías sin icono elegido. */
export const DEFAULT_CATEGORY_ICON: IconName = "tag";

export function isLucideIconName(value: string): value is IconName {
  return ICON_NAME_SET.has(value);
}

export function resolveCategoryIconName(
  value: string | null | undefined,
): IconName {
  if (value && isLucideIconName(value)) {
    return value;
  }
  return DEFAULT_CATEGORY_ICON;
}

export function filterLucideIconNames(
  query: string,
  options?: { limit?: number; include?: string | null },
): IconName[] {
  const limit = options?.limit;
  const normalized = query.trim().toLowerCase().replace(/\s+/g, "-");
  const compact = normalized.replace(/-/g, "");

  const matched = normalized
    ? iconNames.filter((name) => {
        if (name.includes(normalized)) {
          return true;
        }
        return name.replace(/-/g, "").includes(compact);
      })
    : [...iconNames];

  const results =
    typeof limit === "number" ? matched.slice(0, limit) : matched;

  const include = options?.include?.trim();
  if (
    include &&
    isLucideIconName(include) &&
    !results.includes(include)
  ) {
    if (typeof limit === "number") {
      return [include, ...results.slice(0, Math.max(0, limit - 1))];
    }
    return [include, ...results];
  }

  return results;
}

export function formatLucideIconLabel(name: string): string {
  return name.replace(/-/g, " ");
}
