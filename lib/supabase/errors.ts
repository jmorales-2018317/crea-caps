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
  context?: "categories" | "colors",
): string {
  if (!isSupabaseLikeError(error)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }

  const code = error.code;
  const message = error.message ?? "";

  if (code === "23505") {
    if (context === "categories" || message.includes("categories_slug")) {
      return "Ya existe una categoría con ese slug.";
    }
    if (context === "colors" || message.includes("colors_name")) {
      return "Ya existe un color con ese nombre.";
    }
    return "Ya existe un registro con esos datos.";
  }

  if (code === "23503") {
    if (context === "categories") {
      return "No se puede eliminar: la categoría está asociada a uno o más productos.";
    }
    if (context === "colors") {
      return "No se puede eliminar: el color está en uso en uno o más productos.";
    }
    return "No se puede eliminar: hay registros que dependen de este elemento.";
  }

  if (code === "23514") {
    if (context === "colors" || message.includes("hex_code")) {
      return "El código hexadecimal no es válido. Usa el formato #RRGGBB.";
    }
    if (context === "categories" || message.includes("slug")) {
      return "El slug no es válido. Usa solo minúsculas, números y guiones.";
    }
    return "Los datos no cumplen las reglas de validación.";
  }

  if (message.trim()) {
    return message;
  }

  return "Ocurrió un error al comunicarse con la base de datos.";
}
