# Catálogo web — Eurodrip

Catálogo de zapatillas generado desde el respaldo de inventario en Excel. Son archivos HTML/CSS/JS
estáticos: no necesita servidor ni base de datos.

## Actualizar el stock
Cada vez que exportes un respaldo nuevo:

```bash
python3 actualizar_catalogo.py inventario_respaldo_AAAA-MM-DD.xlsx
```

Esto reescribe `inventario.js` con modelos, precios, tallas y stock. Usa la hoja **Inventario**
(columnas ID, Marca, Modelo, Precio, Talla, Stock). **No se publican** la hoja *Pedidos*
ni las columnas *Código* y *Notas*. El Excel en sí está excluido de git (`.gitignore`).

## Configurar
En **`config.js`**:
- `TIENDA`: nombre, eslogan, WhatsApp (con código de país, sin `+`), Instagram.
- `EXTRAS`: por ID de modelo, fotos adicionales, descripción u `oculto: true`.

## Fotos
Guarda la foto de cada modelo como `img/<ID>.jpg` (ver `img/LEEME.txt`).

## Qué hace el catálogo
- Muestra solo tallas con stock; los modelos sin stock salen como **Agotado** (ocultos por defecto).
- Filtros por marca y talla, búsqueda (ignora acentos) y orden por novedad, precio o nombre.
- Aviso de **Último par** cuando queda una unidad (configurable).
- En la ficha el cliente elige talla y el botón abre WhatsApp con el mensaje listo
  ("Me interesan las Jordan Retro 4 Oreo en talla 42 ($85.000)…").
- Enlace directo a cada modelo: `tusitio.com/#<ID>`.
- Adaptado a celular y modo oscuro.

## Publicarlo gratis
GitHub: **Settings → Pages → Deploy from a branch → `main` / root**. Queda en
`https://<usuario>.github.io/imaginewme/`. Luego, cada actualización de stock es:
correr el script → commit → push.
