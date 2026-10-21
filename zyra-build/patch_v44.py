#!/usr/bin/env python3
"""ZYRA v44 — aplica el rediseño a las páginas ya generadas de public_html.

Solo añade: la hoja zyra-fx.css, el script zyra-fx.js, las cintas/bucles
decorativos (aria-hidden) y el nombre gigante del pie. No toca <title>,
meta, canonical, hreflang, JSON-LD ni el texto indexable.
Es idempotente: si una página ya está parcheada, no la duplica.
"""
import html as H
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "public_html"
OLD_V, NEW_V = "43", "44"

ROW_B = {
    "es": ["Diseño a medida", "Presupuesto cerrado", "Sin permanencia", "Trato directo"],
    "en": ["Bespoke design", "Fixed quotes", "No lock-in", "Direct contact"],
    "ar": ["تصميم مخصص", "عرض سعر نهائي", "دون التزام", "تواصل مباشر"],
}
LOGO_LABEL = {
    "es": "Tecnologías con las que trabajamos cada día",
    "en": "Technologies we work with every day",
    "ar": "التقنيات التي نعمل بها كل يوم",
}
SKILLS = [("html", "HTML"), ("css", "CSS"), ("javascript", "JavaScript"), ("react", "React"),
          ("nodejs", "Node.js"), ("php", "PHP"), ("python", "Python"), ("java", "Java"),
          ("csharp", "C#"), ("sql", "SQL"), ("mysql", "MySQL"), ("wordpress", "WordPress"),
          ("git", "Git"), ("github", "GitHub"), ("vscode", "VS Code"), ("photoshop", "Photoshop")]
DARK_LOGOS = {"github"}
HID = ' aria-hidden="true"'
STAR = ('<svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 0l2.7 9.3L24 12l-9.3 2.7L12 24l-2.7-9.3L0 12l9.3-2.7z"></path></svg>')


def strip_tags(s):
    return H.unescape(re.sub(r"<[^>]+>", " ", s)).split()


def text_of(s):
    return " ".join(strip_tags(s))


def esc(s):
    return H.escape(s, quote=True)


def lang_of(doc):
    m = re.search(r'<body[^>]*data-lang="(es|en|ar)"', doc)
    if m:
        return m.group(1)
    m = re.search(r'<html[^>]*lang="(..)', doc)
    return (m.group(1) if m else "es").lower()


def prefix_of(doc):
    m = re.search(r'href="([^"]*)assets/css/zyra\.css', doc)
    return m.group(1) if m else "../"


def services_of(doc):
    m = re.search(r'<div class="menu__drop"[^>]*>(.*?)</div>', doc, re.S)
    if not m:
        return []
    links = re.findall(r'<a(?![^>]*menu__all)[^>]*>(.*?)</a>', m.group(1), re.S)
    return [text_of(l) for l in links][:4]


def claim_of(doc):
    m = re.search(r'<p class="menu__claim">(.*?)</p>', doc, re.S)
    return text_of(m.group(1)) if m else "ZYRA"


def velo(doc, lang):
    a = services_of(doc) or ["ZYRA"]
    b = ROW_B.get(lang, ROW_B["es"])

    def sett(words, hidden=False):
        inner = "".join(f"<span>{esc(w)}</span>{STAR}" for w in words)
        return f'<div class="fx-velo__set"{HID if hidden else ""}>{inner}</div>'

    return ('<div aria-hidden="true" class="fx-velo">'
            f'<div class="fx-velo__row fx-velo__row--a"><div class="fx-velo__track" data-dir="1" data-speed="70">{sett(a)}{sett(a, True)}</div></div>'
            f'<div class="fx-velo__row fx-velo__row--b"><div class="fx-velo__track" data-dir="-1" data-speed="55">{sett(b)}{sett(b, True)}</div></div>'
            '</div>\n')


def logos(R, lang):
    def track(hidden):
        items = "".join(
            f'<li class="fx-logo{" fx-logo--dark" if k in DARK_LOGOS else ""}">'
            f'<img alt="" decoding="async" height="30" loading="lazy" src="{R}assets/img/skills/{k}.svg" width="30">'
            f'<span>{esc(n)}</span></li>' for k, n in SKILLS)
        return f'<ul class="fx-logos__track"{HID if hidden else ""}>{items}</ul>'

    return ('<div class="fx-logos">'
            f'<p class="fx-logos__label">{esc(LOGO_LABEL.get(lang, LOGO_LABEL["es"]))}</p>'
            f'<div class="fx-logos__viewport">{track(False)}{track(True)}</div>'
            '</div>\n')


_curve_n = [0]


def curve(doc, flip=False):
    _curve_n[0] += 1
    cid = f"fx-curve-{_curve_n[0]}"
    unit = claim_of(doc)
    d = "M-240,70 Q720,250 1680,70" if not flip else "M-240,190 Q720,10 1680,190"
    static = esc(unit + "  ✦  ") * 3
    return ('<div aria-hidden="true" class="fx-curve" data-speed="70">'
            '<svg preserveaspectratio="xMidYMid slice" viewbox="0 0 1440 260">'
            f'<defs><path d="{d}" id="{cid}"></path></defs>'
            f'<text class="fx-curve__text"><textPath data-unit="{esc(unit)}" href="#{cid}" startOffset="0">{static}</textPath></text>'
            '</svg></div>\n')


def insert_before(doc, marker, block, count=1):
    i = doc.find(marker)
    if i < 0:
        return doc, False
    return doc[:i] + block + doc[i:], True


def insert_after_section(doc, start_marker, block):
    i = doc.find(start_marker)
    if i < 0:
        return doc, False
    j = doc.find("</section>", i)
    if j < 0:
        return doc, False
    j += len("</section>")
    return doc[:j] + "\n" + block + doc[j:], True


def patch(path):
    with open(path, encoding="utf-8") as f:
        doc = f.read()
    orig = doc
    doc = doc.replace(f"?v={OLD_V}", f"?v={NEW_V}")
    if "zyra-fx.css" in doc or 'class="pick"' in doc:
        if doc != orig:
            open(path, "w", encoding="utf-8").write(doc)
        return "solo versión"

    R = prefix_of(doc)
    lang = lang_of(doc)
    notes = []

    # 1. Hoja de estilos: la última del <head>, para que mande sobre las anteriores
    css = f'<link href="{R}assets/css/zyra-fx.css?v={NEW_V}" rel="stylesheet">'
    last_css = list(re.finditer(r'<link href="[^"]*assets/css/(?:zyra|resenas|rtl)\.css\?v=\d+" rel="stylesheet">', doc))
    if last_css:
        k = last_css[-1].end()
        doc = doc[:k] + "\n" + css + doc[k:]
        notes.append("css")

    # 2. Script: justo después de zyra.js
    m = re.search(r'<script defer src="[^"]*assets/js/zyra\.js\?v=\d+"></script>', doc)
    if m:
        doc = doc[:m.end()] + f'\n<script defer src="{R}assets/js/zyra-fx.js?v={NEW_V}"></script>' + doc[m.end():]
        notes.append("js")
    else:
        m = re.search(r'<script defer src="[^"]*assets/js/p404\.js\?v=\d+"></script>', doc)
        if m:
            doc = doc[:m.end()] + f'\n<script defer src="{R}assets/js/zyra-fx.js?v={NEW_V}"></script>' + doc[m.end():]
            notes.append("js404")

    page = (re.search(r'<body[^>]*data-page="([^"]+)"', doc) or [None, ""])[1]
    is_home = 'class="hero"' in doc and 'class="manifesto"' in doc

    if is_home:
        doc = doc.replace("data-reveal-words", "data-fx-reveal")
        doc, ok = insert_before(doc, '<section class="manifesto"', velo(doc, lang)); ok and notes.append("cintas")
        doc, ok = insert_before(doc, '<section class="why"', logos(R, lang)); ok and notes.append("logos")
        doc, ok = insert_before(doc, '<section class="faq"', curve(doc)); ok and notes.append("curva")
    else:
        # Hub de servicios: cintas tras la cabecera
        if 'class="scards"' in doc:
            doc, ok = insert_after_section(doc, '<section class="phero"', velo(doc, lang)); ok and notes.append("cintas")
        # Sobre nosotros: tecnologías tras el equipo
        if 'class="team"' in doc:
            doc, ok = insert_after_section(doc, 'class="team"', logos(R, lang)); ok and notes.append("logos")
        # Cierre de página: frase en curva antes de la banda final
        if '<section class="band">' in doc:
            doc, ok = insert_before(doc, '<section class="band">', curve(doc)); ok and notes.append("curva")

    # 3. Nombre gigante en el pie
    if "</footer>" in doc and "fx-wordmark" not in doc:
        doc = doc.replace("</footer>", '<div aria-hidden="true" class="fx-wordmark">ZYRA</div>\n</footer>', 1)
        notes.append("pie")

    with open(path, "w", encoding="utf-8") as f:
        f.write(doc)
    return ",".join(notes)


def main():
    files = []
    for d in ("es-es", "en-en", "ar-ar"):
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            files += [os.path.join(base, n) for n in names if n.endswith(".html")]
    files.sort()
    files += [os.path.join(ROOT, "404.html"), os.path.join(ROOT, "index.html")]
    for f in files:
        print(f"{os.path.relpath(f, ROOT):55s} {patch(f)}")


if __name__ == "__main__":
    main()
