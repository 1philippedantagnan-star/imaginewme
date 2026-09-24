# Catálogo web — Imagine W Me

Catálogo estático para una tienda de reventa. No necesita servidor, base de datos ni instalación: son archivos HTML/CSS/JS.

## Cómo verlo
Abre `index.html` en tu navegador (doble clic).

## Cómo editarlo
Todo el contenido está en **`productos.js`**:

1. **Datos de la tienda** (`TIENDA`): nombre, eslogan, moneda, número de WhatsApp (con código de país, sin `+`) e Instagram.
2. **Productos** (`PRODUCTOS`): copia un bloque `{ ... }`, cambia el `id` y los datos.
   - Para marcar algo como vendido: `vendido: true` (se muestra en gris, al final, o se oculta).
   - Para mostrar descuento: agrega `precioAntes`.
3. **Fotos**: guárdalas en `img/` con el nombre que pusiste en `fotos` (ver `img/LEEME.txt`).

## Qué incluye
- Búsqueda (ignora acentos), filtro por categoría y talla, orden por novedad o precio.
- Ficha de producto con galería de fotos.
- Botón **"Lo quiero · WhatsApp"** con mensaje prellenado (producto, talla y precio).
- Enlace directo a cada producto: `tusitio.com/#p001` (útil para compartir en redes).
- Diseño adaptable a celular y modo oscuro automático.

## Publicarlo gratis
En GitHub: **Settings → Pages → Deploy from a branch → `main` / root**. Quedará en
`https://<usuario>.github.io/imaginewme/`. También sirve Netlify o Vercel arrastrando la carpeta.
