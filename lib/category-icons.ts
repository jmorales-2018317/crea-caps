import { iconNames, type IconName } from "lucide-react/dynamic";

const ICON_NAME_SET = new Set<string>(iconNames);

export const LUCIDE_ICON_NAMES = iconNames;

export function isLucideIconName(value: string): value is IconName {
  return ICON_NAME_SET.has(value);
}

export function filterLucideIconNames(
  query: string,
  options?: { limit?: number; include?: string | null },
): IconName[] {
  const limit = options?.limit ?? 40;
  const normalized = query.trim().toLowerCase().replace(/\s+/g, "-");
  const compact = normalized.replace(/-/g, "");

  const matched = normalized
    ? iconNames.filter((name) => {
        if (name.includes(normalized)) {
          return true;
        }
        return name.replace(/-/g, "").includes(compact);
      })
    : iconNames;

  const results = matched.slice(0, limit);

  const include = options?.include?.trim();
  if (
    include &&
    isLucideIconName(include) &&
    !results.includes(include)
  ) {
    return [include, ...results.slice(0, Math.max(0, limit - 1))];
  }

  return results;
}

export function formatLucideIconLabel(name: string): string {
  return name.replace(/-/g, " ");
}
