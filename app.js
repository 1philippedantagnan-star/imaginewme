(() => {
  const $ = (sel) => document.querySelector(sel);

  const estado = {
    texto: "",
    marca: "",
    talla: "",
    orden: "nuevos",
    ocultarAgotados: true,
  };

  // ---------- Datos ----------
  const stockTotal = (p) => p.tallas.reduce((n, t) => n + t.stock, 0);
  const tallasDisponibles = (p) => p.tallas.filter((t) => t.stock > 0);

  const PRODUCTOS = INVENTARIO
    .map((p) => {
      const extra = EXTRAS[p.id] || {};
      return {
        ...p,
        nombre: p.modelo,
        fotos: extra.fotos?.length ? extra.fotos : [`img/${p.id}.jpg`],
        descripcion: extra.descripcion || "",
        oculto: Boolean(extra.oculto),
        agotado: stockTotal(p) === 0,
      };
    })
    .filter((p) => !p.oculto);

  // ---------- Utilidades ----------
  const formatoPrecio = (n) =>
    `${TIENDA.moneda}${Number(n).toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;

  const normalizar = (s) =>
    String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "");

  const escapar = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const clasificarTalla = (a, b) =>
    parseFloat(a.replace(",", ".")) - parseFloat(b.replace(",", ".")) || a.localeCompare(b, "es", { numeric: true });

  // Imagen con marcador de respaldo (ver listener de "error" más abajo)
  function imagen(src, producto, cargaDiferida = true) {
    const inicial = escapar((producto.marca || producto.nombre || "?").trim()[0].toUpperCase());
    if (!src) return `<div class="marcador">${inicial}</div>`;
    return `<img src="${escapar(src)}" alt="${escapar(`${producto.marca} ${producto.nombre}`)}" data-inicial="${inicial}" ${cargaDiferida ? 'loading="lazy"' : ""}>`;
  }

  const mensaje = (p, talla) =>
    `¡Hola! Me interesan las ${p.marca} ${p.nombre}${talla ? ` en talla ${talla}` : ""} (${formatoPrecio(p.precio)}). ¿Están disponibles?`;

  function botonesContacto(p, talla) {
    const botones = [];
    if (TIENDA.whatsapp)
      botones.push(`<a class="boton" href="https://wa.me/${encodeURIComponent(TIENDA.whatsapp)}?text=${encodeURIComponent(mensaje(p, talla))}" target="_blank" rel="noopener">Pedir por WhatsApp</a>`);
    if (TIENDA.instagram)
      botones.push(`<a class="boton ${botones.length ? "boton--secundario" : ""}" href="https://ig.me/m/${encodeURIComponent(TIENDA.instagram)}" target="_blank" rel="noopener">Escribir por Instagram</a>`);
    if (!botones.length)
      botones.push(`<a class="boton" href="https://wa.me/?text=${encodeURIComponent(mensaje(p, talla))}" target="_blank" rel="noopener">Consultar</a>`);
    return botones.join("");
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
      redes.push(`<a href="https://instagram.com/${encodeURIComponent(TIENDA.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
    if (TIENDA.whatsapp)
      redes.push(`<a href="https://wa.me/${encodeURIComponent(TIENDA.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
    $("#redes").innerHTML = redes.join("");
  }

  function iniciarControles() {
    const conteoMarcas = {};
    PRODUCTOS.forEach((p) => { conteoMarcas[p.marca] = (conteoMarcas[p.marca] || 0) + 1; });
    const marcas = Object.keys(conteoMarcas).filter(Boolean).sort((a, b) => conteoMarcas[b] - conteoMarcas[a] || a.localeCompare(b));
    $("#marcas").innerHTML = ["", ...marcas]
      .map((m) => `<button class="chip" data-marca="${escapar(m)}" aria-pressed="${m === ""}">${m ? escapar(m) : "Todo"}</button>`)
      .join("");
    $("#marcas").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      estado.marca = chip.dataset.marca;
      document.querySelectorAll("#marcas .chip").forEach((b) => b.setAttribute("aria-pressed", b === chip));
      pintar();
    });

    const tallas = [...new Set(PRODUCTOS.flatMap((p) => tallasDisponibles(p).map((t) => t.talla)))].sort(clasificarTalla);
    $("#filtro-talla").insertAdjacentHTML("beforeend", tallas.map((t) => `<option>${escapar(t)}</option>`).join(""));

    $("#buscar").addEventListener("input", (e) => { estado.texto = normalizar(e.target.value); pintar(); });
    $("#filtro-talla").addEventListener("change", (e) => { estado.talla = e.target.value; pintar(); });
    $("#orden").addEventListener("change", (e) => { estado.orden = e.target.value; pintar(); });
    $("#ocultar-agotados").addEventListener("change", (e) => { estado.ocultarAgotados = e.target.checked; pintar(); });
  }

  // ---------- Listado ----------
  function filtrar() {
    const lista = PRODUCTOS.filter((p) => {
      if (estado.ocultarAgotados && p.agotado) return false;
      if (estado.marca && p.marca !== estado.marca) return false;
      if (estado.talla && !tallasDisponibles(p).some((t) => t.talla === estado.talla)) return false;
      if (estado.texto && !normalizar(`${p.marca} ${p.nombre} ${p.descripcion}`).includes(estado.texto)) return false;
      return true;
    });

    const orden = {
      // Los IDs son marcas de tiempo (p<milisegundos>), así que el mayor es el más reciente
      "nuevos": (a, b) => b.id.localeCompare(a.id, "en", { numeric: true }),
      "precio-asc": (a, b) => a.precio - b.precio,
      "precio-desc": (a, b) => b.precio - a.precio,
      "nombre": (a, b) => `${a.marca} ${a.nombre}`.localeCompare(`${b.marca} ${b.nombre}`, "es", { numeric: true }),
    }[estado.orden];
    return lista.sort((a, b) => (a.agotado - b.agotado) || orden(a, b));
  }

  function tarjeta(p) {
    const disponibles = tallasDisponibles(p).map((t) => t.talla);
    const pocas = !p.agotado && stockTotal(p) <= TIENDA.avisoPocasUnidades;
    return `
      <button class="tarjeta ${p.agotado ? "tarjeta--agotado" : ""}" data-id="${escapar(p.id)}">
        <div class="tarjeta__foto">
          ${imagen(p.fotos[0], p)}
          ${p.agotado ? '<span class="etiqueta etiqueta--agotado">Agotado</span>' : ""}
          ${pocas ? `<span class="etiqueta etiqueta--pocas">${stockTotal(p) === 1 ? "Último par" : "Últimos pares"}</span>` : ""}
        </div>
        <div class="tarjeta__info">
          <span class="tarjeta__marca">${escapar(p.marca)}</span>
          <span class="tarjeta__nombre">${escapar(p.nombre)}</span>
          <span class="tarjeta__meta">${disponibles.length ? `${disponibles.length === 1 ? "Talla" : "Tallas"} ${disponibles.map(escapar).join(" · ")}` : "Sin tallas disponibles"}</span>
          <span class="precio">${formatoPrecio(p.precio)}</span>
        </div>
      </button>`;
  }

  function pintar() {
    const lista = filtrar();
    $("#rejilla").innerHTML = lista.map(tarjeta).join("");
    $("#vacio").hidden = lista.length > 0;
    const disponibles = lista.filter((p) => !p.agotado).length;
    $("#conteo").textContent = `${disponibles} ${disponibles === 1 ? "modelo disponible" : "modelos disponibles"}`;
  }

  // ---------- Detalle ----------
  function abrir(id, actualizarUrl = true) {
    const p = PRODUCTOS.find((x) => x.id === id);
    if (!p) return;

    const mostrarFoto = (i) => {
      $("#foto-principal").innerHTML = imagen(p.fotos[i], p, false);
      document.querySelectorAll("#miniaturas button").forEach((b, j) => b.setAttribute("aria-current", i === j));
    };
    $("#miniaturas").innerHTML = p.fotos.length > 1
      ? p.fotos.map((f, i) => `<button data-i="${i}" aria-label="Foto ${i + 1}">${imagen(f, p)}</button>`).join("")
      : "";
    $("#miniaturas").onclick = (e) => {
      const b = e.target.closest("button");
      if (b) mostrarFoto(Number(b.dataset.i));
    };
    mostrarFoto(0);

    // Si hay un filtro de talla activo y está disponible, viene preseleccionada
    let talla = tallasDisponibles(p).some((t) => t.talla === estado.talla) ? estado.talla : "";

    $("#detalle").innerHTML = `
      <span class="tarjeta__marca">${escapar(p.marca)}</span>
      <h2>${escapar(p.nombre)}</h2>
      <p class="precio">${formatoPrecio(p.precio)}</p>
      ${p.descripcion ? `<p>${escapar(p.descripcion)}</p>` : ""}
      <div>
        <p class="detalle__rotulo">${p.agotado ? "Agotado en todas las tallas" : "Elige tu talla"}</p>
        <div class="tallas" role="group" aria-label="Tallas">
          ${p.tallas.map((t) => `
            <button class="talla" data-talla="${escapar(t.talla)}" ${t.stock > 0 ? "" : "disabled"}
              aria-pressed="${t.talla === talla}">${escapar(t.talla)}</button>`).join("")}
        </div>
      </div>
      <div class="detalle__acciones" id="acciones"></div>
    `;

    const pintarAcciones = () => {
      $("#acciones").innerHTML = p.agotado
        ? '<a class="boton" aria-disabled="true">Agotado</a>'
        : botonesContacto(p, talla);
    };
    $("#detalle .tallas").onclick = (e) => {
      const b = e.target.closest(".talla:not([disabled])");
      if (!b) return;
      talla = talla === b.dataset.talla ? "" : b.dataset.talla;
      document.querySelectorAll("#detalle .talla").forEach((x) => x.setAttribute("aria-pressed", x.dataset.talla === talla));
      pintarAcciones();
    };
    pintarAcciones();

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

    // Enlace directo a un modelo: tusitio.com/#p1790168211393
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
