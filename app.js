const WA = TIENDA.whatsapp, IG = TIENDA.instagram;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clp = n => "$" + Math.round(n).toLocaleString("es-CL");
const num = t => parseFloat(String(t).replace(",", "."));

const P = INVENTARIO.filter(p => !(EXTRAS[p.id] || {}).oculto).map(({ id, marca, modelo, precio, tallas: ts }) => {
  const tallas = ts.map(t => [t.talla, t.stock]);
  const disp = tallas.filter(([, n]) => n > 0).map(([t]) => t);
  const extra = EXTRAS[id] || {};
  return { id, marca, modelo, precio, tallas, disp, total: tallas.reduce((a, [, n]) => a + n, 0),
    foto: (extra.fotos || [])[0] || `img/${id}.jpg`, descripcion: extra.descripcion || "" };
}).filter(p => p.disp.length)
  .sort((a, b) => b.id.localeCompare(a.id, "en", { numeric: true }));

let fMarca = "", fTalla = "";

// Cabecera y contacto desde config.js
(() => {
  const n = TIENDA.nombre, k = Math.ceil(n.length / 2);
  $("#brand").innerHTML = TIENDA.logo
    ? `<img class="logo" src="${esc(TIENDA.logo)}" alt="${esc(n)}">`
    : /^[A-Z]+$/.test(n) && n.length > 5 ? `${esc(n.slice(0, k))}<span>${esc(n.slice(k))}</span>` : esc(n);
  $("#eslogan").textContent = TIENDA.eslogan;
  $("#stamp").textContent = "Stock al " + ACTUALIZADO;
  const links = [];
  if (IG) links.push(`<a href="https://instagram.com/${encodeURIComponent(IG)}" target="_blank" rel="noopener">@${esc(IG)}</a>`);
  if (WA) links.push(`<a href="https://wa.me/${encodeURIComponent(WA)}" target="_blank" rel="noopener">WhatsApp</a>`);
  $("#links").outerHTML = links.join("");
  const tel = WA ? "WhatsApp +" + WA.replace(/^(56)(9)(\d{4})(\d{4})$/, "$1 $2 $3 $4") : "";
  $("#contacto").textContent = [tel, IG && "Instagram @" + IG].filter(Boolean).join(" · ");
  document.title = `${n} · Zapatillas`;
})();

function chips() {
  const cnt = {}; P.forEach(p => cnt[p.marca] = (cnt[p.marca] || 0) + 1);
  const marcas = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || a.localeCompare(b));
  const tallas = [...new Set(P.flatMap(p => p.disp))].sort((a, b) => num(a) - num(b));
  $("#sizes").innerHTML = `<span class="lbl">Talla</span>` +
    ["", ...tallas].map(t => `<button class="chip sz" data-t="${esc(t)}" aria-pressed="${t === fTalla}">${t ? esc(t) : "Todas"}</button>`).join("");
  $("#brands").innerHTML = `<span class="lbl">Marca</span>` +
    ["", ...marcas].map(m => `<button class="chip" data-m="${esc(m)}" aria-pressed="${m === fMarca}">${m ? esc(m) : "Todas"}</button>`).join("");
}

// Si la foto no existe se ve la marca (la imagen se elimina al fallar)
const pic = (p, big) => `<div class="pic"><span class="mark">${esc(p.marca)}</span><img src="${esc(p.foto)}" alt="${esc(p.marca + " " + p.modelo)}" loading="lazy" onerror="this.remove()">${!big && p.total === 1 ? '<span class="tag">Último par</span>' : ""}</div>`;

function render() {
  const r = P.filter(p => (!fMarca || p.marca === fMarca) && (!fTalla || p.disp.includes(fTalla)));
  $("#count").textContent = `${r.length} ${r.length === 1 ? "modelo disponible" : "modelos disponibles"}${fTalla ? " en talla " + fTalla : ""}`;
  $("#empty").hidden = r.length > 0;
  $("#grid").innerHTML = r.map(p => `
    <button class="card" data-id="${esc(p.id)}">
      ${pic(p)}
      <span class="info">
        <span class="mk">${esc(p.marca)}</span>
        <span class="nm">${esc(p.modelo)}</span>
        <span class="szs">${p.disp.map(esc).join(" · ")}</span>
        <span class="pr">${clp(p.precio)}</span>
      </span>
    </button>`).join("");
}

function open(id) {
  const p = P.find(x => x.id === id); if (!p) return;
  let talla = p.disp.includes(fTalla) ? fTalla : (p.disp.length === 1 ? p.disp[0] : "");
  const draw = () => {
    const msg = `¡Hola! Me interesan las ${p.marca} ${p.modelo}${talla ? " en talla " + talla : ""} (${clp(p.precio)}). ¿Están disponibles?`;
    const st = talla ? p.tallas.find(([t]) => t === talla)[1] : 0;
    $("#sheet").innerHTML = `
      ${pic(p, true)}
      <div class="det">
        <span class="mk">${esc(p.marca)}</span>
        <h2>${esc(p.modelo)}</h2>
        <p class="pr">${clp(p.precio)}</p>
        ${p.descripcion ? `<p class="hint">${esc(p.descripcion)}</p>` : ""}
        <div class="box">
          <span class="lbl">Elige tu talla</span>
          <div class="sizes">${p.tallas.map(([t, n]) => `<button data-s="${esc(t)}" ${n > 0 ? "" : "disabled"} aria-pressed="${t === talla}">${esc(t)}</button>`).join("")}</div>
        </div>
        <p class="hint">${talla ? (st === 1 ? `<span class="low">Queda 1 par en talla ${esc(talla)}.</span>` : `Talla ${esc(talla)} disponible.`) : "Elige una talla para que tu mensaje salga completo."}</p>
        <div class="cta">
          ${WA ? `<a class="btn" href="https://wa.me/${encodeURIComponent(WA)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Pedir por WhatsApp</a>` : ""}
          ${IG ? `<a class="btn ${WA ? "alt" : ""}" href="https://ig.me/m/${encodeURIComponent(IG)}" target="_blank" rel="noopener">Escribir por Instagram</a>` : ""}
        </div>
        <div class="num"><span id="msgtxt">${esc($("#contacto").textContent.split(" · ")[0])}</span><button id="copy" data-msg="${esc(msg)}">Copiar mensaje</button></div>
      </div>`;
  };
  draw();
  $("#sheet").onclick = async e => {
    const s = e.target.closest("[data-s]:not(:disabled)");
    if (s) { talla = talla === s.dataset.s ? "" : s.dataset.s; draw(); return; }
    const c = e.target.closest("#copy");
    if (c) {
      try { await navigator.clipboard.writeText(c.dataset.msg); c.textContent = "Copiado"; }
      catch { $("#msgtxt").textContent = c.dataset.msg; c.textContent = "Selecciona y copia"; }
    }
  };
  if (!$("#dlg").open) $("#dlg").showModal();
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-t]"); if (t) { fTalla = t.dataset.t; chips(); render(); return; }
  const m = e.target.closest("[data-m]"); if (m) { fMarca = m.dataset.m; chips(); render(); return; }
  const c = e.target.closest(".card"); if (c) open(c.dataset.id);
});
$("#close").onclick = () => $("#dlg").close();
$("#dlg").addEventListener("click", e => { if (e.target === $("#dlg")) $("#dlg").close(); });

chips(); render();
