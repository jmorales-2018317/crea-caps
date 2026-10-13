# Administración de productos

CRUD administrativo del catálogo de productos contra Supabase (sin mocks, sin imágenes en esta fase).

## Estructura

| Capa | Archivo |
|------|---------|
| Tipos | `types/products.ts` |
| Schemas Zod | `schemas/products.ts` |
| Servicios | `services/products.ts` |
| Hooks React Query | `hooks/use-products.ts` |
| Listado | `components/dashboard/products-admin.tsx` |
| Formulario | `components/dashboard/product-form.tsx` |
| Categorías (multi) | `components/dashboard/category-multi-select.tsx` |
| Colores por parte | `components/dashboard/product-part-colors-field.tsx` |
| Páginas | `/dashboard/productos`, `/nuevo`, `/[id]` |

## Persistencia

Create, update y delete usan el client de Supabase sobre las tablas del catálogo:

1. `products` (insert/update/delete)
2. `product_attributes` (upsert)
3. `product_categories` (replace: delete + insert)
4. `product_part_colors` (replace: delete + insert)

Si falla la sincronización de relaciones al **crear**, se elimina el producto recién insertado para evitar huérfanos incompletos.

Publicar/archivar desde el listado actualiza solo `products.status`. Al eliminar un producto, las filas hijas se borran por `ON DELETE CASCADE`. Las categorías y colores maestros no se eliminan.

## UI del formulario

Variante “essential first”: secciones siempre visibles (información general, características físicas, colores) y bloques opcionales colapsables con Accordion (detalles adicionales = SKU/descripción, categorías). Cabeceras del accordion muestran resumen en vivo. `is_featured` se controla con un toggle de estrella y un tooltip de info. Barra fija inferior con Cancelar/Guardar (`lg:left-64` para alinear con el sidebar).

## Reglas

- Estados: `draft`, `published`, `archived` (UI en español; valores en inglés en DB). El estado por defecto al crear un producto es `published`.
- Categorías: combobox con búsqueda por nombre (`searchCategoriesByName`), badges multi-selección y alta rápida con `CategoryFormDialog`. Incluye activas e inactivas. Cerrado por defecto si no hay categorías; se abre al editar si ya hay asignadas.
- Cincho: si `has_strap` es true, se muestra `strap_type` (obligatorio); si es false, el campo se oculta y `strap_type` queda `null`.
- Partes de color aplicables:
  - Siempre: `all`, `crown`, `front_panel`, `side_panels`, `back_panels`, `visor`, `button`
  - `mesh` solo con construcción `mesh` o `mixed`
  - `strap` solo con `has_strap`
- Resolución visual: color de parte > color general (`all`). Sin hex hardcodeado de respaldo.
- Color general: si hay colores activos y no hay selección, se asigna el primero de la lista (sin opción Auto). Auto solo en partes específicas = color general.
- Alta rápida de color con `ColorFormDialog` (mismo patrón que categorías). Sin colores activos, las partes quedan sin color hasta crear uno.

## Listado

Búsqueda (nombre, SKU, slug), filtro por estado y paginación server-side (10 por página). Columna de checkboxes para seleccionar filas de la página actual (incl. “seleccionar todos” con estado indeterminado). Con selección, una barra contextual entre filtros y tabla permite Publicar, Archivar, Eliminar (con confirmación) o Limpiar. Las operaciones masivas usan `.in("id", ids)` en Supabase. La selección se limpia al cambiar página, búsqueda o filtro, y tras una acción masiva exitosa. Las mutaciones invalidan la lista admin y las estadísticas del dashboard.
