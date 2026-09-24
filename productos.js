// ============================================================
//  CATÁLOGO — edita solo este archivo para agregar productos.
// ============================================================
//
//  Campos de cada producto:
//    id         texto único (ej. "p001")
//    nombre     nombre visible
//    categoria  ej. "Ropa", "Calzado", "Accesorios", "Bolsos"
//    marca      opcional
//    talla      opcional (ej. "M", "38", "Única")
//    precio     número, sin símbolo
//    precioAntes  opcional: precio original para mostrar descuento
//    estado     "Nuevo con etiqueta" | "Como nuevo" | "Muy buen estado" | "Buen estado"
//    vendido    true / false
//    fotos      lista de rutas dentro de /img (la primera es la portada)
//    descripcion  texto libre (medidas, detalles, defectos…)
//    agregado   fecha "AAAA-MM-DD" (para ordenar por "más nuevos")

const TIENDA = {
  nombre: "Imagine W Me",
  eslogan: "Reventa curada · piezas únicas",
  moneda: "$",
  // Número de WhatsApp con código de país, sin "+" ni espacios (ej. 5215512345678)
  whatsapp: "5210000000000",
  instagram: "", // ej. "imaginewme" (sin @). Déjalo vacío para ocultarlo.
};

const PRODUCTOS = [
  {
    id: "p001",
    nombre: "Chaqueta de mezclilla vintage",
    categoria: "Ropa",
    marca: "Levi's",
    talla: "M",
    precio: 650,
    precioAntes: 1800,
    estado: "Muy buen estado",
    vendido: false,
    fotos: ["img/p001-1.jpg", "img/p001-2.jpg"],
    descripcion: "Lavado claro, corte clásico. Largo 62 cm, hombro 46 cm. Sin detalles.",
    agregado: "2026-09-20",
  },
  {
    id: "p002",
    nombre: "Tenis blancos de piel",
    categoria: "Calzado",
    marca: "Adidas",
    talla: "25",
    precio: 900,
    estado: "Como nuevo",
    vendido: false,
    fotos: ["img/p002-1.jpg"],
    descripcion: "Usados dos veces. Incluye caja.",
    agregado: "2026-09-18",
  },
  {
    id: "p003",
    nombre: "Bolso de hombro negro",
    categoria: "Bolsos",
    marca: "Zara",
    talla: "Única",
    precio: 420,
    precioAntes: 999,
    estado: "Nuevo con etiqueta",
    vendido: false,
    fotos: ["img/p003-1.jpg"],
    descripcion: "Piel sintética, cierre magnético, correa ajustable.",
    agregado: "2026-09-22",
  },
  {
    id: "p004",
    nombre: "Vestido midi floral",
    categoria: "Ropa",
    marca: "H&M",
    talla: "S",
    precio: 280,
    estado: "Buen estado",
    vendido: true,
    fotos: ["img/p004-1.jpg"],
    descripcion: "Tela ligera, ideal para primavera. Pequeño hilo suelto en el dobladillo.",
    agregado: "2026-09-10",
  },
  {
    id: "p005",
    nombre: "Lentes de sol carey",
    categoria: "Accesorios",
    marca: "",
    talla: "Única",
    precio: 180,
    estado: "Como nuevo",
    vendido: false,
    fotos: ["img/p005-1.jpg"],
    descripcion: "Protección UV400. Incluye funda.",
    agregado: "2026-09-15",
  },
  {
    id: "p006",
    nombre: "Suéter de punto crema",
    categoria: "Ropa",
    marca: "Mango",
    talla: "L",
    precio: 380,
    estado: "Muy buen estado",
    vendido: false,
    fotos: ["img/p006-1.jpg"],
    descripcion: "Oversize, muy suave. Sin bolitas.",
    agregado: "2026-09-21",
  },
];
