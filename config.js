// ============================================================
//  CONFIGURACIÓN — edita este archivo a mano.
//  (El inventario se actualiza solo con actualizar_catalogo.py)
// ============================================================

const TIENDA = {
  nombre: "EURODRIP",
  eslogan: "Zapatillas · Chile",
  moneda: "$",
  // Número de WhatsApp con código de país, sin "+" ni espacios (ej. 56912345678)
  whatsapp: "56962694268",
  instagram: "eurodrip_chile", // sin @. Vacío = oculto.
};

// Datos opcionales por modelo, usando el ID del Excel.
//
// Por defecto el catálogo busca la foto en img/<ID>.jpg
// (ej. img/p1790168211393.jpg). Aquí puedes:
//   fotos:        varias fotos (la primera es la portada)
//   descripcion:  texto que aparece en la ficha
//   oculto:       true para no mostrar el modelo en la web
//
// Ejemplo:
//   "p1790169011436": {
//     fotos: ["img/af1-1.jpg", "img/af1-2.jpg"],
//     descripcion: "Clásicas, cuero blanco.",
//   },
const EXTRAS = {
};
