# Administración de categorías y colores

Listados administrativos con la misma UX del catálogo de productos: búsqueda, paginación, selección múltiple y tooltips en acciones.

## Categorías

| Capa | Archivo |
|------|---------|
| Servicios | `services/categories.ts` |
| Hooks | `hooks/use-categories.ts` |
| Listado | `components/dashboard/categories-admin.tsx` |
| Diálogo delete | `components/dashboard/delete-category-dialog.tsx` |
| Página | `/dashboard/categorias` |

- Búsqueda (debounce 300 ms) por nombre, slug o descripción.
- Paginación client-side: 10 por página.
- Selección de filas de la página actual; barra contextual: Activar, Desactivar, Eliminar, Limpiar.
- Activar solo si algún seleccionado está inactivo; Desactivar solo si alguno está activo. El update masivo limita los IDs a los que cambian.
- Operaciones masivas: `updateCategoriesActive`, `deleteCategories`.
- Tooltips en Editar / Eliminar. Card de tabla con `py-0` para alinear espaciado.

## Colores

| Capa | Archivo |
|------|---------|
| Servicios | `services/colors.ts` |
| Hooks | `hooks/use-colors.ts` |
| Listado | `components/dashboard/colors-admin.tsx` |
| Diálogo delete | `components/dashboard/delete-color-dialog.tsx` |
| Página | `/dashboard/colores` |

- Búsqueda (debounce 300 ms) por nombre o hex (con o sin `#`).
- Paginación client-side: 10 por página.
- Selección de filas y acciones masivas: Activar, Desactivar, Eliminar, Limpiar.
- Activar solo si algún seleccionado está inactivo; Desactivar solo si alguno está activo. El update masivo limita los IDs a los que cambian.
- Operaciones masivas: `updateColorsActive`, `deleteColors`.
- Tooltips en Editar / Eliminar. Card de tabla con `py-0`.

Si un color o categoría está asociado a productos, Supabase bloquea el borrado (FK).
