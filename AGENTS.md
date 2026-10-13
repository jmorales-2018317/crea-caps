# AGENTS.md — Caps Store

## Contexto del proyecto

Caps Store es una aplicación web para una tienda de gorras personalizadas.

El MVP consiste exclusivamente en:

1. Tienda pública que funciona como catálogo de productos.
2. Dashboard administrativo para gestionar el catálogo.
3. Simulador visual 2D de gorras en la página de inicio.

NO implementar:
- Carrito de compras.
- Checkout.
- Pagos.
- Pedidos.
- Cotizaciones.
- Formularios de solicitud de productos.
- Cuentas de clientes.
- Inventario complejo.
- Técnicas de personalización.
- Subida de logos por visitantes como requisito del MVP.

El simulador es puramente demostrativo y no guarda información en Supabase.

## Stack

- Next.js con App Router.
- TypeScript.
- pnpm como gestor exclusivo de paquetes.
- Tailwind CSS.
- shadcn/ui.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- @supabase/ssr.
- TanStack React Query.
- React Hook Form + Zod.
- Zustand para el simulador visual.

## Arquitectura

Usar arquitectura feature-based.

Separar:
- Componentes UI.
- Hooks de React Query.
- Servicios de acceso a Supabase.
- Esquemas de validación.
- Tipos TypeScript.
- Estado local del simulador.

Usar directamente la API de Supabase mediante su SDK para el CRUD ordinario, sin desarrollar un backend REST adicional.

Utilizar Server Components cuando aporten ventajas para SEO y renderizado inicial, y Client Components para formularios e interacciones.

No colocar claves secretas de Supabase en código del navegador.

## Base de datos

El modelo inicial contempla estas tablas:

1. products
2. categories
3. product_categories
4. colors
5. product_part_colors
6. product_attributes
7. product_images
8. store_settings

Los usuarios administrativos se gestionan exclusivamente mediante Supabase Authentication (auth.users).

Cada producto:
- Puede pertenecer a múltiples categorías.
- Puede contener múltiples imágenes.
- Tiene características físicas estructuradas.
- Puede tener diferentes colores por parte.
- Tiene un estado de publicación.

Características físicas:
- Tipo de visera.
- Construcción: malla, cerrada o mixta.
- Tiene cincho.
- Tipo de cincho.
- Tiene logo frontal.

Colores por parte:
- all
- crown
- front_panel
- side_panels
- back_panels
- visor
- mesh
- strap
- button

"all" representa el color general, no una parte física. Los colores específicos sobrescriben el color general.

Antes de modificar el esquema, inspeccionar las migraciones existentes. No asumir que el esquema real coincide exactamente con esta descripción.

No crear variantes de productos sin una necesidad explícita. Durante el MVP, cada producto publicado representa una configuración física concreta.

## Seguridad

- Usar Supabase Auth.
- No crear una tabla pública users.
- No ofrecer registro público.
- Administradores creados mediante un proceso controlado.
- Autorizar administradores mediante app_metadata.role = "admin".
- Aplicar RLS a todas las tablas públicas.
- Permitir lectura anónima solo de información publicable.
- Restringir modificaciones a administradores.
- Mantener archivos privados fuera de buckets públicos.
- Utilizar mecanismos de sesión compatibles con @supabase/ssr.

## Simulador SVG

El simulador:
- Estará integrado en la home.
- Utilizará distintas plantillas SVG según construcción y visera.
- Permitirá personalizar colores por parte.
- Utilizará Zustand con persistencia en localStorage.
- No necesitará Supabase ni React Query.
- No creará pedidos ni cotizaciones.

Las plantillas SVG deben mantener una estructura consistente y permitir cambiar colores mediante propiedades React o variables CSS.

## Reglas de desarrollo

1. Inspeccionar el código existente antes de modificarlo.
2. No reescribir módulos que ya funcionan sin necesidad.
3. Respetar las convenciones del repositorio.
4. Usar pnpm exclusivamente.
5. Evitar dependencias innecesarias.
6. Mantener TypeScript estricto; evitar any.
7. Incorporar estados loading, empty y error.
8. Validar formularios con Zod.
9. Gestionar errores de Supabase.
10. Crear componentes reutilizables sin sobreingeniería.
11. Utilizar migraciones SQL para cambios de base de datos.
12. No ejecutar acciones destructivas sobre producción sin autorización.
13. No añadir funcionalidades fuera del MVP.
14. Ejecutar lint, typecheck y build cuando corresponda.
15. Documentar los cambios realizados.

Antes de implementar cada tarea, presentar un plan breve. Después de implementar, indicar archivos modificados, pruebas realizadas y cualquier limitación pendiente.