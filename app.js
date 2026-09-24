(() => {
  const $ = (sel) => document.querySelector(sel);

  const estado = {
    texto: "",
    categoria: "",
    talla: "",
    orden: "nuevos",
    ocultarVendidos: true,
  };

  const formatoPrecio = (n) =>
    `${TIENDA.moneda}${Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

  const normalizar = (s) =>
    String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "");

  const escapar = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Imagen con marcador de respaldo si la foto no existe todavía
  function imagen(src, producto, cargaDiferida = true) {
    const inicial = escapar((producto.nombre || "?").trim()[0].toUpperCase());
    if (!src) return `<div class="marcador">${inicial}</div>`;
    return `<img src="${escapar(src)}" alt="${escapar(producto.nombre)}" data-inicial="${inicial}" ${cargaDiferida ? 'loading="lazy"' : ""}>`;
  }

  const descuento = (p) =>
    p.precioAntes > p.precio ? Math.round((1 - p.precio / p.precioAntes) * 100) : 0;

  function enlaceWhatsApp(p) {
    const msg = `¡Hola! Me interesa "${p.nombre}"${p.talla ? ` (talla ${p.talla})` : ""} de ${formatoPrecio(p.precio)}. ¿Sigue disponible?`;
    return `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  // ---------- Cabecera y controles ----------
  function iniciarCabecera() {
    document.title = `${TIENDA.nombre} · Catálogo`;
    $("#nombre-tienda").textContent = TIENDA.nombre;
    $("#nombre-pie").textContent = TIENDA.nombre;
    $("#eslogan").textContent = TIENDA.eslogan;
    $("#anio").textContent = new Date().getFullYear();

    const redes = [];
    if (TIENDA.instagram)
      redes.push(`<a href="https://instagram.com/${escapar(TIENDA.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
    if (TIENDA.whatsapp)
      redes.push(`<a href="https://wa.me/${escapar(TIENDA.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
    $("#redes").innerHTML = redes.join("");
  }

  function iniciarControles() {
    const categorias = [...new Set(PRODUCTOS.map((p) => p.categoria).filter(Boolean))].sort();
    $("#categorias").innerHTML = ["", ...categorias]
      .map((c) => `<button class="chip" data-cat="${escapar(c)}" aria-pressed="${c === ""}">${c ? escapar(c) : "Todo"}</button>`)
      .join("");
    $("#categorias").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      estado.categoria = chip.dataset.cat;
      document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b === chip));
      pintar();
    });

    const tallas = [...new Set(PRODUCTOS.map((p) => p.talla).filter(Boolean))];
    const ordenTallas = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
    tallas.sort((a, b) => {
      const ia = ordenTallas.indexOf(a), ib = ordenTallas.indexOf(b);
      if (ia > -1 || ib > -1) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      return a.localeCompare(b, "es", { numeric: true });
    });
    $("#filtro-talla").insertAdjacentHTML("beforeend", tallas.map((t) => `<option>${escapar(t)}</option>`).join(""));

    $("#buscar").addEventListener("input", (e) => { estado.texto = normalizar(e.target.value); pintar(); });
    $("#filtro-talla").addEventListener("change", (e) => { estado.talla = e.target.value; pintar(); });
    $("#orden").addEventListener("change", (e) => { estado.orden = e.target.value; pintar(); });
    $("#ocultar-vendidos").addEventListener("change", (e) => { estado.ocultarVendidos = e.target.checked; pintar(); });
  }

  // ---------- Listado ----------
  function filtrar() {
    const lista = PRODUCTOS.filter((p) => {
      if (estado.ocultarVendidos && p.vendido) return false;
      if (estado.categoria && p.categoria !== estado.categoria) return false;
      if (estado.talla && p.talla !== estado.talla) return false;
      if (estado.texto) {
        const pajar = normalizar([p.nombre, p.marca, p.categoria, p.descripcion].join(" "));
        if (!pajar.includes(estado.texto)) return false;
      }
      return true;
    });

    const orden = {
      "nuevos": (a, b) => String(b.agregado || "").localeCompare(String(a.agregado || "")),
      "precio-asc": (a, b) => a.precio - b.precio,
      "precio-desc": (a, b) => b.precio - a.precio,
    }[estado.orden];
    // Los vendidos siempre al final
    return lista.sort((a, b) => (a.vendido - b.vendido) || orden(a, b));
  }

  function tarjeta(p) {
    const d = descuento(p);
    const meta = [p.talla && `Talla ${p.talla}`, p.estado].filter(Boolean).map(escapar).join(" · ");
    return `
      <button class="tarjeta ${p.vendido ? "tarjeta--vendido" : ""}" data-id="${escapar(p.id)}">
        <div class="tarjeta__foto">
          ${imagen(p.fotos?.[0], p)}
          ${p.vendido ? '<span class="etiqueta etiqueta--vendido">Vendido</span>' : ""}
          ${!p.vendido && d ? `<span class="etiqueta etiqueta--descuento">−${d}%</span>` : ""}
        </div>
        <div class="tarjeta__info">
          ${p.marca ? `<span class="tarjeta__marca">${escapar(p.marca)}</span>` : ""}
          <span class="tarjeta__nombre">${escapar(p.nombre)}</span>
          <span class="tarjeta__meta">${meta}</span>
          <span class="precio">${formatoPrecio(p.precio)}${d ? `<s>${formatoPrecio(p.precioAntes)}</s>` : ""}</span>
        </div>
      </button>`;
  }

  function pintar() {
    const lista = filtrar();
    $("#rejilla").innerHTML = lista.map(tarjeta).join("");
    $("#vacio").hidden = lista.length > 0;
    const disponibles = lista.filter((p) => !p.vendido).length;
    $("#conteo").textContent = `${disponibles} ${disponibles === 1 ? "pieza disponible" : "piezas disponibles"}`;
  }

  // ---------- Detalle ----------
  function abrir(id, actualizarUrl = true) {
    const p = PRODUCTOS.find((x) => x.id === id);
    if (!p) return;
    const fotos = p.fotos?.length ? p.fotos : [null];

    const mostrarFoto = (i) => {
      $("#foto-principal").innerHTML = imagen(fotos[i], p, false);
      document.querySelectorAll("#miniaturas button").forEach((b, j) => b.setAttribute("aria-current", i === j));
    };
    $("#miniaturas").innerHTML = fotos.length > 1
      ? fotos.map((f, i) => `<button data-i="${i}" aria-label="Foto ${i + 1}">${imagen(f, p)}</button>`).join("")
      : "";
    $("#miniaturas").onclick = (e) => {
      const b = e.target.closest("button");
      if (b) mostrarFoto(Number(b.dataset.i));
    };
    mostrarFoto(0);

    const d = descuento(p);
    const datos = [
      ["Marca", p.marca], ["Categoría", p.categoria], ["Talla", p.talla], ["Estado", p.estado],
    ].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${escapar(v)}</dd>`).join("");

    $("#detalle").innerHTML = `
      <h2>${escapar(p.nombre)}</h2>
      <p class="precio">${formatoPrecio(p.precio)}${d ? `<s>${formatoPrecio(p.precioAntes)}</s>` : ""}</p>
      <dl class="datos">${datos}</dl>
      ${p.descripcion ? `<p>${escapar(p.descripcion)}</p>` : ""}
      ${p.vendido
        ? '<a class="boton" aria-disabled="true">Vendido</a>'
        : `<a class="boton" href="${enlaceWhatsApp(p)}" target="_blank" rel="noopener">Lo quiero · WhatsApp</a>`}
    `;

    if (actualizarUrl) history.replaceState(null, "", `#${encodeURIComponent(p.id)}`);
    if (!$("#modal").open) $("#modal").showModal();
  }

  function iniciarModal() {
    const modal = $("#modal");
    $("#rejilla").addEventListener("click", (e) => {
      const t = e.target.closest(".tarjeta");
      if (t) abrir(t.dataset.id);
    });
    $("#cerrar").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));

    // Enlace directo a un producto: tusitio.com/#p001
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) abrir(id, false);
  }

  // Si una foto no carga, se reemplaza por el marcador con la inicial
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.inicial) return;
    const div = document.createElement("div");
    div.className = "marcador";
    div.textContent = img.dataset.inicial;
    img.replaceWith(div);
  }, true);

  iniciarCabecera();
  iniciarControles();
  pintar();
  iniciarModal();
})();
