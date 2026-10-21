#!/usr/bin/env python3
"""ZYRA · versión 10 — cambios de texto sobre las páginas ya publicadas.

Se ejecuta DESPUÉS de patch_v44.py (que añade el rediseño):
  · "Opiniones" pasa a llamarse "Reseñas" en la cabecera de la sección.
  · "Tecnologías con las que construimos" → "…con las que trabajamos cada día".
  · Sube la versión de caché (?v=44 → ?v=45) para que los navegadores
    descarguen el CSS y el JS nuevos.
Es idempotente: ejecutarlo dos veces no duplica nada.
Uso:  python3 patch_v10.py ../public_html
"""
import os
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "../public_html"
OLD_V, NEW_V = "44", "45"

REPLACE = [
    # Cabecera estática de la sección de reseñas (la reescribe resenas.js, pero
    # así también la ve quien navega sin JavaScript y los buscadores).
    ('<p class="kicker">Opiniones</p>\n<h2 class="h-section">Lo que dicen<br><em>quienes ya trabajan con nosotros.</em></h2>',
     '<p class="kicker">Reseñas</p>\n<h2 class="h-section">Reseñas de quienes<br><em>ya trabajan con nosotros.</em></h2>'),
    ('<p class="kicker">Reviews</p>\n<h2 class="h-section">What the people<br><em>who work with us</em> say.</h2>',
     '<p class="kicker">Reviews</p>\n<h2 class="h-section">Reviews from the people<br><em>who already work with us.</em></h2>'),
    ('<p class="kicker">آراء العملاء</p>\n<h2 class="h-section">ماذا يقول<br>من يعملون معنا.</h2>',
     '<p class="kicker">التقييمات</p>\n<h2 class="h-section">تقييمات من<br><em>يعملون معنا بالفعل.</em></h2>'),
    # Texto del carrusel de tecnologías
    ('fx-logos__label">Tecnologías con las que construimos<', 'fx-logos__label">Tecnologías con las que trabajamos cada día<'),
    ('fx-logos__label">Technologies we build with<', 'fx-logos__label">Technologies we work with every day<'),
    ('fx-logos__label">التقنيات التي نبني بها<', 'fx-logos__label">التقنيات التي نعمل بها كل يوم<'),
]


def patch(path):
    with open(path, encoding="utf-8") as f:
        doc = f.read()
    new = doc.replace(f"?v={OLD_V}", f"?v={NEW_V}")
    hits = 0
    for a, b in REPLACE:
        if a in new:
            new = new.replace(a, b)
            hits += 1
    if new != doc:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
    return hits


def main():
    files = []
    for d in ("es-es", "en-en", "ar-ar"):
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            files += [os.path.join(base, n) for n in names if n.endswith(".html")]
    files += [os.path.join(ROOT, "404.html"), os.path.join(ROOT, "index.html")]
    for f in sorted(files):
        print(f"{os.path.relpath(f, ROOT):50s} textos cambiados: {patch(f)}")


if __name__ == "__main__":
    main()
