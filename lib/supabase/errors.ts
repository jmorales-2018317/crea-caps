type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isSupabaseLikeError(error: unknown): error is SupabaseLikeError {
  return typeof error === "object" && error !== null;
}

export function getSupabaseErrorMessage(
  error: unknown,
  context?:
    | "categories"
    | "colors"
    | "products"
    | "product_images"
    | "store_settings",
): string {
  if (error instanceof Error) {
    const local = error.message;
    if (
      local.includes("Formato no permitido") ||
      local.includes("tamaño máximo") ||
      local.includes("archivo está vacío")
    ) {
      return local;
    }
  }

  if (!isSupabaseLikeError(error)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }

  const code = error.code;
  const message = error.message ?? "";
  const lower = message.toLowerCase();

  if (code === "42501" || lower.includes("not authorized")) {
    return "No tienes permisos de administrador para esta acción.";
  }

  if (
    context === "product_images" ||
    lower.includes("storage") ||
    lower.includes("payload too large") ||
    lower.includes("mime type") ||
    (lower.includes("invalid") && lower.includes("type"))
  ) {
    if (lower.includes("payload too large") || lower.includes("maximum allowed size")) {
      return "La imagen supera el tamaño máximo de 5 MB.";
    }
    if (lower.includes("mime") || lower.includes("not supported")) {
      return "Formato no permitido. Usa JPEG, PNG, WebP o AVIF.";
    }
    if (lower.includes("not authorized") || lower.includes("row-level security")) {
      return "No tienes permisos de administrador para gestionar imágenes.";
    }
  }

  if (code === "P0002" || message.toLowerCase().includes("product not found")) {
    return "El producto no existe o ya fue eliminado.";
  }

  if (code === "23505") {
    if (
      context === "categories" ||
      message.includes("categories_code") ||
      message.includes("categories_slug")
    ) {
      return "Ya existe una categoría con ese código.";
    }
    if (context === "colors" || message.includes("colors_name")) {
      return "Ya existe un color con ese nombre.";
    }
    if (
      context === "products" ||
      message.includes("products_code") ||
      message.includes("products_slug")
    ) {
      return "Ya existe un producto con ese código.";
    }
    return "Ya existe un registro con esos datos.";
  }

  if (code === "23503") {
    if (context === "categories") {
      return "No se puede eliminar la categoría por una referencia inválida.";
    }
    if (context === "colors") {
      return "No se puede eliminar: el color está en uso en uno o más productos.";
    }
    if (context === "products") {
      return "Hay una referencia inválida a una categoría o color.";
    }
    return "No se puede eliminar: hay registros que dependen de este elemento.";
  }

  if (code === "23514") {
    if (context === "colors" || message.includes("hex_code")) {
      return "El código hexadecimal no es válido. Usa el formato #RRGGBB.";
    }
    if (
      context === "categories" &&
      (message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("slug"))
    ) {
      return "El código no es válido. Usa solo minúsculas, números y guiones.";
    }
    if (
      context === "products" &&
      (message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("slug"))
    ) {
      return "El código no es válido. Usa solo minúsculas, números y guiones.";
    }
    if (context === "products") {
      if (message.toLowerCase().includes("strap")) {
        return "La configuración del cincho no es válida.";
      }
      if (message.toLowerCase().includes("part")) {
        return "Hay un color asignado a una parte que no aplica a este producto.";
      }
      return "Los datos del producto no cumplen las reglas de validación.";
    }
    return "Los datos no cumplen las reglas de validación.";
  }

  if (message.trim()) {
    return message;
  }

  return "Ocurrió un error al comunicarse con la base de datos.";
}
