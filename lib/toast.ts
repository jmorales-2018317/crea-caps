import { toast } from "sonner";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import type { ProductStatus } from "@/types/products";

type ErrorContext = Parameters<typeof getSupabaseErrorMessage>[1];

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}

export function toastMutationError(error: unknown, context?: ErrorContext) {
  toast.error(getSupabaseErrorMessage(error, context));
}

export function productStatusToastMessage(
  status: ProductStatus,
  count = 1,
): string {
  const plural = count > 1;

  switch (status) {
    case "published":
      return plural ? "Productos publicados" : "Producto publicado";
    case "archived":
      return plural ? "Productos archivados" : "Producto archivado";
    case "draft":
      return plural
        ? "Productos marcados como borrador"
        : "Producto marcado como borrador";
  }
}

export function activeToggleToastMessage(
  entity: "categoría" | "categorías" | "color" | "colores",
  isActive: boolean,
): string {
  if (entity === "categoría") {
    return isActive ? "Categoría activada" : "Categoría desactivada";
  }
  if (entity === "categorías") {
    return isActive ? "Categorías activadas" : "Categorías desactivadas";
  }
  if (entity === "color") {
    return isActive ? "Color activado" : "Color desactivado";
  }
  return isActive ? "Colores activados" : "Colores desactivados";
}

/** True when the update payload only toggles `is_active`. */
export function isOnlyActiveToggle(
  input: object,
): input is { is_active: boolean } {
  const record = input as Record<string, unknown>;
  const definedKeys = Object.keys(record).filter(
    (key) => record[key] !== undefined,
  );
  return (
    definedKeys.length === 1 &&
    definedKeys[0] === "is_active" &&
    typeof record.is_active === "boolean"
  );
}
