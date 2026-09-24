#!/usr/bin/env python3
"""Genera inventario.js a partir del respaldo de inventario en Excel.

Uso:
    python3 actualizar_catalogo.py inventario_respaldo_AAAA-MM-DD.xlsx

Lee la hoja "Inventario" (columnas ID, Marca, Modelo, Precio, Talla, Stock),
agrupa las filas por ID y escribe inventario.js. No necesita instalar nada:
solo usa la biblioteca estándar de Python.

La hoja "Pedidos" y las columnas Código y Notas NO se publican.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}
HOJA = "Inventario"
SALIDA = Path(__file__).with_name("inventario.js")

# Corrige variantes de escritura de una misma marca en el Excel.
MARCAS = {
    "louis vuiton": "Louis Vuitton",
    "louis vuitton": "Louis Vuitton",
}


def leer_hoja(ruta, nombre):
    with zipfile.ZipFile(ruta) as z:
        libro = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        destinos = {r.get("Id"): r.get("Target") for r in rels.findall("pr:Relationship", NS)}
        rid = next(
            (h.get(f"{{{NS['r']}}}id") for h in libro.find("m:sheets", NS) if h.get("name") == nombre),
            None,
        )
        if rid is None:
            sys.exit(f'No se encontró la hoja "{nombre}" en {ruta}')
        destino = destinos[rid].lstrip("/")
        destino = destino if destino.startswith("xl/") else f"xl/{destino}"

        compartidos = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss = ET.fromstring(z.read("xl/sharedStrings.xml"))
            compartidos = ["".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")) for si in ss.findall("m:si", NS)]

        hoja = ET.fromstring(z.read(destino))
        filas = []
        for fila in hoja.iter(f"{{{NS['m']}}}row"):
            valores = {}
            for c in fila.findall("m:c", NS):
                col = re.match(r"[A-Z]+", c.get("r")).group()
                tipo = c.get("t")
                v = c.find("m:v", NS)
                if tipo == "inlineStr":
                    valor = "".join(t.text or "" for t in c.iter(f"{{{NS['m']}}}t"))
                elif v is None:
                    valor = None
                elif tipo == "s":
                    valor = compartidos[int(v.text)]
                elif tipo in ("str", "e"):
                    valor = v.text or ""
                else:
                    valor = float(v.text) if v.text else None
                valores[col] = valor
            filas.append(valores)
        return filas


def numero(v):
    if v is None or v == "":
        return 0
    if isinstance(v, str):
        v = v.replace(".", "").replace(",", ".").replace("$", "").strip() or 0
    n = float(v)
    return int(n) if n.is_integer() else n


def texto(v):
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).strip() if v is not None else ""


def clave_talla(t):
    try:
        return (0, float(t.replace(",", ".")))
    except ValueError:
        return (1, t)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    filas = leer_hoja(sys.argv[1], HOJA)
    if not filas:
        sys.exit("La hoja está vacía.")

    encabezado = {texto(v).lower(): col for col, v in filas[0].items()}
    faltan = [c for c in ("id", "marca", "modelo", "precio", "talla", "stock") if c not in encabezado]
    if faltan:
        sys.exit(f"Faltan columnas en la hoja: {', '.join(faltan)}")
    col = lambda fila, nombre: fila.get(encabezado[nombre])

    productos = {}
    for fila in filas[1:]:
        id_ = texto(col(fila, "id"))
        if not id_:
            continue
        marca = texto(col(fila, "marca"))
        marca = MARCAS.get(marca.lower(), marca)
        p = productos.setdefault(id_, {
            "id": id_,
            "marca": marca,
            "modelo": texto(col(fila, "modelo")),
            "precio": numero(col(fila, "precio")),
            "tallas": {},
        })
        talla = texto(col(fila, "talla"))
        if talla:
            p["tallas"][talla] = p["tallas"].get(talla, 0) + max(0, int(numero(col(fila, "stock"))))

    lista = []
    for p in productos.values():
        p["tallas"] = [{"talla": t, "stock": s} for t, s in sorted(p["tallas"].items(), key=lambda x: clave_talla(x[0]))]
        lista.append(p)

    contenido = (
        "// ARCHIVO GENERADO por actualizar_catalogo.py — no lo edites a mano.\n"
        f"// Origen: {Path(sys.argv[1]).name} · {datetime.now():%Y-%m-%d %H:%M}\n"
        f"const ACTUALIZADO = \"{datetime.now():%d-%m-%Y}\";\n"
        "const INVENTARIO = [\n"
        + "".join(f"  {json.dumps(p, ensure_ascii=False)},\n" for p in lista)
        + "];\n"
    )
    SALIDA.write_text(contenido, encoding="utf-8")

    con_stock = sum(1 for p in lista if any(t["stock"] for t in p["tallas"]))
    pares = sum(t["stock"] for p in lista for t in p["tallas"])
    print(f"Listo: {len(lista)} modelos ({con_stock} con stock, {pares} pares) → {SALIDA.name}")


if __name__ == "__main__":
    main()
