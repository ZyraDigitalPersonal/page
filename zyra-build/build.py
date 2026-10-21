#!/usr/bin/env python3
"""
ZYRA · generador multidioma
---------------------------
Lee las páginas en español de src/ y genera en ../public_html:

  /es-es/...   /en-en/...   /ar-ar/...

Cada versión es HTML real (lo que Google indexa), con su <title>, description,
canonical, hreflang, Open Graph y datos estructurados en su idioma.
Además genera sitemap.xml, robots.txt y la página raíz que redirige por idioma.

Uso:   python3 build.py            (requiere: pip install beautifulsoup4)
"""
import json, os, posixpath, re, shutil, sys
from copy import deepcopy
from bs4 import BeautifulSoup, NavigableString, Comment

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "dict"))
import config as C
from ar_static import AR as AR_LIST
from ar_js import AR_JS, AR_KEYS

SRC = os.path.join(HERE, "src")
OUT = os.path.abspath(os.path.join(HERE, "..", "public_html"))
V = C.VERSION

# ── Diccionarios ────────────────────────────────────────────
with open(os.path.join(HERE, "dict", "en.json"), encoding="utf-8") as f:
    EN = json.load(f)                                   # t123 -> inglés
with open(os.path.join(HERE, "dict", "en_unique.json"), encoding="utf-8") as f:
    EN_UNIQUE = json.load(f)
AR = dict(zip(EN_UNIQUE, AR_LIST))                      # inglés -> árabe
AR.update(AR_JS)

missing = set()


def tr_key(key, lang, es_html):
    if lang == "es":
        return es_html
    en = EN.get(key)
    if en is None:
        missing.add(("key", key))
        return es_html
    if lang == "en":
        return en
    if en not in AR:
        missing.add(("ar", en))
        return en
    return AR[en]


# ── URLs ────────────────────────────────────────────────────
SRC_TO_KEY = {v[0]: k for k, v in C.PAGES.items()}


def slug(key, lang):
    return C.PAGES[key][1] if lang == "es" else C.PAGES[key][2]


def site_path(key, lang):
    """Ruta desde la raíz del sitio, sin barra inicial: 'en-en/services/'"""
    return C.LANGS[lang]["dir_url"] + "/" + slug(key, lang)


def abs_url(key, lang):
    return C.SITE + "/" + site_path(key, lang)


def rel(from_dir, target):
    """Ruta relativa desde un directorio (sin barra final) hasta target (desde la raíz)."""
    depth = len([p for p in from_dir.split("/") if p])
    r = "../" * depth + target
    return r if r else "./"


# ── Utilidades HTML ─────────────────────────────────────────
def set_inner(el, html):
    el.clear()
    frag = BeautifulSoup(html, "html.parser")
    for node in list(frag.contents):
        el.append(node)


def inner(el):
    return "".join(str(c) for c in el.contents)


def svg_icon(name):
    return {
        "instagram": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
        "tiktok": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 3.5v10.9a3.6 3.6 0 1 1-3.1-3.57"/><path d="M14.4 3.5c.5 2.4 2 3.9 4.5 4.2"/></svg>',
        "youtube": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.6" y="5.4" width="18.8" height="13.2" rx="4.2"/><path d="M10.4 9.5l4.6 2.5-4.6 2.5z"/></svg>',
        "linkedin": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3"/><path d="M7.6 10.4v6.2M7.6 7.4v.1M11.4 16.6v-6.2M11.4 13c0-1.6 1-2.7 2.4-2.7s2.2 1 2.2 2.6v3.7"/></svg>',
    }[name]


WA_SVG = ('<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.3 28.8l6.6-1.7A12.7 12.7 0 1 0 16 3.2Zm0 23.2a10.5 10.5 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.5 10.5 0 1 1 16 26.4Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7a.6.6 0 0 0 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.5 6.5 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.4Z"/></svg>')


# ── JSON-LD ─────────────────────────────────────────────────
def org_node():
    same = [u for u in C.SOCIAL.values() if u]
    if C.GOOGLE_BUSINESS_URL:
        same.append(C.GOOGLE_BUSINESS_URL)
    node = {
        "@type": "Organization",
        "@id": C.SITE + "/#organization",
        "name": "ZYRA",
        "alternateName": "ZYRA Digital",
        "url": C.SITE + "/",
        "logo": {"@type": "ImageObject", "url": C.SITE + "/assets/img/icon-512.png", "width": 512, "height": 512},
        "image": C.SITE + "/assets/img/og-zyra.jpg",
        "email": C.CONTACT["email"],
        "telephone": C.CONTACT["phone"],
        "areaServed": [{"@type": "Country", "name": "España"}, "Worldwide"],
        "knowsLanguage": ["es", "en", "ar"],
        "founder": [{"@type": "Person", "name": n} for n in C.FOUNDERS],
        "contactPoint": [{
            "@type": "ContactPoint", "contactType": "customer service",
            "email": C.CONTACT["email"], "telephone": C.CONTACT["phone"],
            "availableLanguage": ["Spanish", "English", "Arabic"],
            "hoursAvailable": {"@type": "OpeningHoursSpecification",
                               "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                               "opens": "09:00", "closes": "19:00"},
        }],
    }
    if same:
        node["sameAs"] = same
    return node


def jsonld(key, lang, soup, title, desc):
    L = C.LANGS[lang]
    url = abs_url(key, lang)
    graph = [org_node(), {
        "@type": "WebSite", "@id": C.SITE + "/#website", "url": C.SITE + "/",
        "name": "ZYRA", "publisher": {"@id": C.SITE + "/#organization"},
        "inLanguage": ["es-ES", "en", "ar"],
    }]
    page = {
        "@type": C.PAGE_TYPE.get(key, "WebPage"), "@id": url + "#webpage", "url": url,
        "name": title, "description": desc, "inLanguage": L["hreflang"],
        "isPartOf": {"@id": C.SITE + "/#website"},
        "about": {"@id": C.SITE + "/#organization"},
        "primaryImageOfPage": {"@type": "ImageObject", "url": C.SITE + "/assets/img/og-zyra.jpg"},
        "dateModified": C.UPDATED,
    }
    if key != "home":
        items = [{"@type": "ListItem", "position": 1, "name": C.CRUMB["home"][lang], "item": abs_url("home", lang)}]
        if key in C.SERVICE_KEYS:
            items.append({"@type": "ListItem", "position": 2, "name": C.CRUMB["servicios"][lang], "item": abs_url("servicios", lang)})
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": C.CRUMB[key][lang], "item": url})
        graph.append({"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": items})
        page["breadcrumb"] = {"@id": url + "#breadcrumb"}
    graph.append(page)

    if key in C.SERVICE_KEYS:
        lead = soup.select_one(".phero__lead")
        graph.append({
            "@type": "Service", "@id": url + "#service",
            "name": C.CRUMB[key][lang], "serviceType": C.CRUMB[key][lang],
            "description": lead.get_text(" ", strip=True) if lead else desc,
            "provider": {"@id": C.SITE + "/#organization"},
            "areaServed": [{"@type": "Country", "name": "España"}, "Worldwide"],
            "availableLanguage": ["es", "en", "ar"], "url": url,
        })
    if key == "servicios":
        graph.append({
            "@type": "ItemList", "@id": url + "#services",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": abs_url(k, lang), "name": C.CRUMB[k][lang]}
                                for i, k in enumerate(C.SERVICE_KEYS)],
        })
    qas = soup.select(".faq .qa")
    if qas:
        graph.append({
            "@type": "FAQPage", "@id": url + "#faq",
            "mainEntity": [{
                "@type": "Question",
                "name": q.select_one("summary").get_text(" ", strip=True),
                "acceptedAnswer": {"@type": "Answer", "text": q.select_one(".qa__body").get_text(" ", strip=True)},
            } for q in qas],
        })
    data = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


# ── <head> ──────────────────────────────────────────────────
def build_head(key, lang, out_dir, soup, title, desc):
    L = C.LANGS[lang]
    R = rel(out_dir, "")
    url = abs_url(key, lang)
    alt = "\n".join(
        f'<link rel="alternate" hreflang="{C.LANGS[l]["hreflang"]}" href="{abs_url(key, l)}">' for l in C.LANGS
    ) + f'\n<link rel="alternate" hreflang="x-default" href="{abs_url(key, C.DEFAULT_LANG)}">'
    og_alt = "\n".join(f'<meta property="og:locale:alternate" content="{C.LANGS[l]["og"]}">' for l in C.LANGS if l != lang)
    fonts = "https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap"
    gfonts = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500"
    if L["rtl"]:
        gfonts += "&family=IBM+Plex+Sans+Arabic:wght@400;500;700&family=Noto+Kufi+Arabic:wght@600;700;800"
    gfonts += "&display=swap"
    rtl_css = f'\n<link rel="stylesheet" href="{R}assets/css/rtl.css?v={V}">' if L["rtl"] else ""
    ld = jsonld(key, lang, soup, title, desc)
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
{alt}
<meta name="theme-color" content="#07090D">
<meta name="author" content="ZYRA">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ZYRA">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{C.SITE}/assets/img/og-zyra.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ZYRA">
<meta property="og:locale" content="{L["og"]}">
{og_alt}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{C.SITE}/assets/img/og-zyra.jpg">
<link rel="icon" href="{R}favicon.ico" sizes="48x48">
<link rel="icon" href="{R}assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="{R}assets/img/apple-touch-icon.png">
<link rel="manifest" href="{R}site.webmanifest">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link href="{fonts}" rel="stylesheet">
<link href="{gfonts}" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/zyra.css?v={V}">
<link rel="stylesheet" href="{R}assets/css/resenas.css?v={V}">{rtl_css}
<script src="{R}assets/js/boot.js?v={V}"></script>
<script type="application/ld+json">{ld}</script>
"""


# ── Enlaces ─────────────────────────────────────────────────
def rewrite_links(soup, src_rel, out_dir, lang):
    src_dir = posixpath.dirname(src_rel)
    for tag, attr in (("a", "href"), ("img", "src"), ("source", "src"), ("source", "data-src"),
                      ("video", "poster"), ("link", "href"), ("script", "src"), ("form", "action")):
        for el in soup.find_all(tag):
            v = el.get(attr)
            if not v or re.match(r"^(https?:|mailto:|tel:|#|data:|javascript:)", v):
                continue
            path, _, frag = v.partition("#")
            path, _, query = path.partition("?")
            target = posixpath.normpath(posixpath.join(src_dir, path)) if path else src_rel
            if target.startswith("../"):
                target = target.lstrip("./")
            if target.endswith(".html") or target.endswith("/") or target == ".":
                t = target if target.endswith(".html") else posixpath.join(target, "index.html")
                t = t.lstrip("./")
                if t == "404.html":
                    new = rel(out_dir, C.LANGS[lang]["dir_url"] + "/")
                elif t in SRC_TO_KEY:
                    new = rel(out_dir, site_path(SRC_TO_KEY[t], lang))
                else:
                    print("  ! enlace desconocido:", v, "en", src_rel)
                    continue
            else:
                new = rel(out_dir, target) + (("?" + query) if query else "")
            el[attr] = new + (("#" + frag) if frag else "")


# ── Traducción del cuerpo ───────────────────────────────────
def translate_body(soup, lang, key):
    # 1) elementos con data-i18n
    for el in soup.select("[data-i18n]"):
        k = el["data-i18n"]
        if el.name != "title":
            set_inner(el, tr_key(k, lang, inner(el)))
        del el["data-i18n"]
    # 2) titular del hero
    h = soup.select_one("[data-i18n-lines]")
    if h:
        lines = None
        if lang == "en":
            lines = json.loads(h["data-i18n-lines"])
        elif lang in C.HERO_LINES:
            lines = C.HERO_LINES[lang]
        if lines:
            for span, text in zip(h.select(".line__in"), lines):
                span.string = text
        del h["data-i18n-lines"]
    # 3) data-en sueltos (texto del desplegable de formularios)
    for el in soup.select("[data-en]"):
        es = el.get_text().strip()
        if lang != "es":
            el.string = C.EXTRA.get(es, {}).get(lang) or (el["data-en"] if lang == "en" else AR.get(el["data-en"], el["data-en"]))
        del el["data-en"]
    # 4) nombres de servicio con <br> y textos sueltos
    for el in soup.select(".service__name"):
        k = re.sub(r"<br\s*/?>", "<br>", inner(el)).strip()
        if k in C.EXTRA and lang in C.EXTRA[k]:
            set_inner(el, C.EXTRA[k][lang])
    for t in soup.find_all(string=True):
        if isinstance(t, Comment) or t.parent.name in ("script", "style"):
            continue
        s = t.strip()
        if s in C.EXTRA and lang in C.EXTRA[s]:
            t.replace_with(t.replace(s, C.EXTRA[s][lang]))
    # 5) atributos
    for el in soup.find_all(True):
        for a in ("aria-label", "title", "placeholder"):
            v = el.get(a)
            if v in C.ATTR and lang in C.ATTR[v]:
                el[a] = C.ATTR[v][lang]
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src.endswith("zyra-simbolo.webp"):
            size = "128" if int(img.get("width", "999")) <= 60 else "256"
            img["src"] = src.replace("zyra-simbolo.webp", f"zyra-simbolo-{size}.webp")
        name = posixpath.basename(img.get("src", ""))
        if name in C.ALT:
            img["alt"] = C.ALT[name][lang]
        elif img.get("alt") is None:
            img["alt"] = ""


# ── Ajustes de estructura (iguales en todos los idiomas) ────
def restructure(soup, key, lang, out_dir):
    L = C.LANGS[lang]
    # Selector de idioma: ahora son enlaces reales a la versión equivalente
    drop = soup.select_one("#langDrop")
    if drop:
        drop.clear()
        for l, info in C.LANGS.items():
            a = soup.new_tag("a", href=rel(out_dir, site_path(key, l)))
            a["hreflang"] = info["hreflang"]
            a["lang"] = info["html"]
            a["data-lang-to"] = l
            a["title"] = info["name"]
            if l == lang:
                a["class"] = "is-on"
                a["aria-current"] = "true"
            a.append(info["label"])
            s = soup.new_tag("span", attrs={"class": "lang__name"})
            s.string = info["name"]
            a.append(s)
            drop.append(a)
    lab = soup.select_one("#langLabel")
    if lab:
        lab.string = L["label"]

    # Una sola llamada a la acción por bloque: fuera los botones secundarios
    for a in soup.select("a.btn.btn--ghost"):
        a.decompose()
    for a in soup.select("a.fact__cta"):
        a["class"] = ["alink", "fact__cta"]
        a["target"] = "_blank"
        a["rel"] = "noopener"
        a.attrs.pop("data-magnet", None)

    # Redes sociales del footer: con URL real → icono enlazado;
    # sin URL todavía → icono "Próximamente" (sin href, no es un enlace roto).
    soc = soup.select_one(".footer__social")
    if soc:
        box = soc.select_one(".socials")
        box.clear()
        for name in C.FOOTER_SOCIAL:
            url = C.SOCIAL.get(name, "")
            if url:
                el = soup.new_tag("a", href=url, target="_blank", rel="noopener me")
                el["aria-label"] = name.capitalize()
            else:
                el = soup.new_tag("span", attrs={"class": "social-icon"})
                el["aria-label"] = f"{name.capitalize()} — {C.UI['social_soon'][lang]}"
                el["title"] = C.UI["social_soon"][lang]
            set_inner(el, svg_icon(name))
            box.append(el)
        if not box.contents:
            soc.decompose()

    # Zona de servicio visible (NAP coherente con Google Business Profile)
    base = soup.select_one(".footer__base")
    if base and not base.select_one(".footer__nap"):
        nap = soup.new_tag("span", attrs={"class": "footer__nap"})
        nap.string = C.UI["footer_zone"][lang]
        base.insert(1, nap)

    # Formularios: envío real + casilla de privacidad con enlace
    for form in soup.select("form.form"):
        form["action"] = rel(out_dir, "api/contacto.php")
        form["method"] = "post"
        form["accept-charset"] = "utf-8"
        tipo = "cita" if form.get("id") == "form-cita" else "info"
        for n, v in (("tipo", tipo), ("lang", lang), ("t", "")):
            i = soup.new_tag("input", type="hidden", attrs={"name": n, "value": v})
            form.insert(0, i)
        for opt in form.select("select[name=servicio] option"):
            es_name = opt.get_text().strip()
            for k2, v2 in C.EXTRA.items():
                if v2.get(lang) == es_name:
                    es_name = k2
            if es_name in (C.UI["unsure"]["es"],) or opt.get_text().strip() == C.UI["unsure"][lang]:
                es_name = "Aún no lo tengo claro"
            opt["value"] = es_name
        chk = form.select_one("label.check")
        if chk:
            span = chk.select_one("span")
            cb = chk.select_one("input")
            cb["name"] = "privacidad"
            cb["value"] = "1"
            href = rel(out_dir, site_path("privacidad", lang))
            set_inner(span, f'{C.UI["privacy_pre"][lang]}<a href="{href}" target="_blank" rel="noopener">{C.UI["privacy_link"][lang]}</a>{C.UI["privacy_post"][lang]}')

    # Política de cookies: la cookie de idioma también se declara
    if key == "cookies":
        art = BeautifulSoup(
            f'<article class="prose__block"><h2>{C.UI["cookie_lang_title"][lang]}</h2><p>{C.UI["cookie_lang_body"][lang]}</p></article>',
            "html.parser").article
        anchor = soup.select_one(".prose__cta") or soup.select_one(".prose__note")
        anchor.insert_before(art)

    # Botón flotante de WhatsApp, visible en todas las páginas
    main = soup.select_one("main")
    fab = soup.new_tag("a", attrs={"class": "wa-fab", "href": C.CONTACT["wa"], "target": "_blank", "rel": "noopener"})
    fab["aria-label"] = C.UI["wa_fab"][lang]
    set_inner(fab, WA_SVG + f'<span class="wa-fab__tip">{C.UI["wa_fab"][lang]}</span>')
    main.insert_after(fab)

    # Scripts: fuera i18n.js (el texto ya viene traducido), dentro lang.js
    body = soup.body
    for s in body.find_all("script"):
        src = s.get("src", "")
        if "i18n.js" in src:
            s.decompose()
    first_local = next(s for s in body.find_all("script") if "cookies.js" in s.get("src", ""))
    R = rel(out_dir, "")
    if lang == "ar":
        tag = soup.new_tag("script", src=f"{R}assets/js/i18n-ar.js?v={V}")
        first_local.insert_before(tag)
    tag = soup.new_tag("script", src=f"{R}assets/js/lang.js?v={V}")
    first_local.insert_before(tag)
    for s in body.find_all("script"):
        s["defer"] = ""
        if "?v=" in s.get("src", ""):
            s["src"] = re.sub(r"\?v=\d+", f"?v={V}", s["src"])
    for l in soup.find_all("link"):
        if "?v=" in l.get("href", ""):
            l["href"] = re.sub(r"\?v=\d+", f"?v={V}", l["href"])


# ── Página ──────────────────────────────────────────────────
def build_page(key, lang):
    src_rel = C.PAGES[key][0]
    with open(os.path.join(SRC, src_rel), encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    out_dir = site_path(key, lang).rstrip("/")
    L = C.LANGS[lang]

    rewrite_links(soup, src_rel, out_dir, lang)
    translate_body(soup, lang, key)
    restructure(soup, key, lang, out_dir)

    html = soup.html
    html["lang"] = L["html"]
    if L["rtl"]:
        html["dir"] = "rtl"
    elif "dir" in html.attrs:
        del html["dir"]
    soup.body["data-lang"] = lang

    title, desc = C.META[key][lang]
    head = soup.head
    head.clear()
    set_inner(head, build_head(key, lang, out_dir, soup, title, desc))

    dest = os.path.join(OUT, out_dir, "index.html")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    text = "<!DOCTYPE html>\n" + soup.html.decode(formatter="html5") + "\n"
    text = text.replace(' defer=""', " defer").replace(' hidden=""', " hidden").replace(' required=""', " required") \
               .replace(' crossorigin=""', " crossorigin").replace(' novalidate=""', " novalidate") \
               .replace(' playsinline=""', " playsinline").replace(' muted=""', " muted") \
               .replace(' autoplay=""', " autoplay").replace(' loop=""', " loop").replace(' disabled=""', " disabled") \
               .replace(' async=""', " async")
    with open(dest, "w", encoding="utf-8") as f:
        f.write(text)

    # comprobación: restos en español en las versiones traducidas
    if lang != "es":
        body_text = BeautifulSoup(text, "html.parser").body.get_text(" ")
        for w in ("Cuéntanos", "Servicios", "nosotros", "Solicitar", "empresa", " de la ", "Qué "):
            if w in body_text:
                missing.add(("resto-es", f"{lang}:{key}:{w}"))


# ── 404, raíz, sitemap, robots, JS de idioma ────────────────
def build_404():
    with open(os.path.join(SRC, "404.html"), encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    # rutas absolutas: el 404 se sirve en cualquier profundidad
    for tag, attr in (("a", "href"), ("img", "src"), ("link", "href"), ("script", "src")):
        for el in soup.find_all(tag):
            v = el.get(attr)
            if not v or re.match(r"^(https?:|mailto:|tel:|#|data:)", v):
                continue
            path = posixpath.normpath(v.split("#")[0].split("?")[0]).lstrip("./")
            q = ("?v=" + V) if "?v=" in v else ""
            if path.endswith(".html"):
                el[attr] = "/" + C.LANGS[C.DEFAULT_LANG]["dir_url"] + "/"
                el["data-home"] = ""
            else:
                el[attr] = "/" + path.replace("zyra-simbolo.webp", "zyra-simbolo-256.webp" if el.get("width") and int(el["width"]) > 60 else "zyra-simbolo-128.webp") + q
    for el in soup.select("[data-en]"):
        en = el["data-en"]
        el["data-ar"] = AR.get(en, {"Error 404": "خطأ 404", "This page doesn't exist.": "هذه الصفحة غير موجودة.",
                                     "The link may be old, or we may have moved it. There is nothing to see here — head back and carry on.":
                                         "ربما يكون الرابط قديماً أو نقلنا الصفحة. لا يوجد شيء هنا — عد إلى الرئيسية وتابع.",
                                     "Back home": "العودة إلى الرئيسية", "Skip to content": "الانتقال إلى المحتوى"}.get(en, en))
    for el in soup.select("[data-i18n]"):
        k = el["data-i18n"]
        if el.name == "title":
            el.string = "404 — ZYRA"
        else:
            el["data-es"] = inner(el)
            el["data-en"] = EN.get(k, inner(el))
            el["data-ar"] = AR.get(EN.get(k, ""), el["data-en"])
        del el["data-i18n"]
    drop = soup.select_one("#langDrop")
    if drop:
        drop.clear()
        for l, info in C.LANGS.items():
            a = soup.new_tag("a", href="/" + info["dir_url"] + "/")
            a["hreflang"] = info["hreflang"]
            a["data-lang-to"] = l
            a.append(info["label"])
            s = soup.new_tag("span", attrs={"class": "lang__name"})
            s.string = info["name"]
            a.append(s)
            drop.append(a)
    head = soup.head
    for m in head.select('meta[property^="og:"], meta[name^="twitter"]'):
        m.decompose()
    head.append(BeautifulSoup('<meta name="robots" content="noindex, follow">', "html.parser"))
    for s in soup.body.find_all("script"):
        if "i18n.js" in s.get("src", ""):
            s.decompose()
    p404 = next((s for s in soup.body.find_all("script") if "p404.js" in s.get("src", "")), None)
    ar = soup.new_tag("script", src=f"/assets/js/i18n-ar.js?v={V}")
    lj = soup.new_tag("script", src=f"/assets/js/lang404.js?v={V}")
    first = soup.body.find("script")
    first.insert_before(ar)
    first.insert_before(lj)
    first.insert_before(soup.new_tag("script", src=f"/assets/js/lang.js?v={V}"))
    main = soup.select_one("main")
    if main:
        fab = soup.new_tag("a", attrs={"class": "wa-fab", "href": C.CONTACT["wa"], "target": "_blank", "rel": "noopener"})
        fab["aria-label"] = "WhatsApp"
        set_inner(fab, WA_SVG)
        main.insert_after(fab)
    for s in soup.body.find_all("script"):
        s["defer"] = ""
    text = "<!DOCTYPE html>\n" + soup.html.decode(formatter="html5") + "\n"
    text = text.replace(' defer=""', " defer").replace(' hidden=""', " hidden").replace(' async=""', " async")
    text = re.sub(r"\?v=\d+", f"?v={V}", text)
    with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
        f.write(text)


def build_root():
    links = "\n".join(
        f'    <li><a href="{i["dir_url"]}/" hreflang="{i["hreflang"]}" lang="{i["html"]}">{i["name"]}</a></li>'
        for i in C.LANGS.values())
    alt = "\n".join(f'<link rel="alternate" hreflang="{i["hreflang"]}" href="{C.SITE}/{i["dir_url"]}/">' for i in C.LANGS.values())
    d = C.LANGS[C.DEFAULT_LANG]["dir_url"]
    html = f"""<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZYRA — Elige idioma · Choose language · اختر اللغة</title>
<meta name="robots" content="noindex, follow">
{alt}
<link rel="alternate" hreflang="x-default" href="{C.SITE}/{d}/">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="stylesheet" href="assets/css/zyra.css?v={V}">
<script src="assets/js/boot.js?v={V}"></script>
<script src="assets/js/root.js?v={V}" defer></script>
</head>
<body class="pick">
<main class="pick__box">
  <img src="assets/img/zyra-simbolo-128.webp" alt="ZYRA" width="64" height="60">
  <ul class="pick__list">
{links}
  </ul>
</main>
</body>
</html>
"""
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)


def build_sitemap():
    rows = []
    for key in C.PAGES:
        alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{C.LANGS[l]["hreflang"]}" href="{abs_url(key, l)}"/>' for l in C.LANGS)
        alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{abs_url(key, C.DEFAULT_LANG)}"/>'
        for l in C.LANGS:
            rows.append(f"""  <url>
    <loc>{abs_url(key, l)}</loc>
    <lastmod>{C.UPDATED}</lastmod>
    <priority>{C.SITEMAP_PRIORITY[key]}</priority>{alts}
  </url>""")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
           + "\n".join(rows) + "\n</urlset>\n")
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /data/

Sitemap: {C.SITE}/sitemap.xml
""")


def build_lang_js():
    urls = {k: {"es": site_path(k, "es"), "en": site_path(k, "en"), "ar": site_path(k, "ar")} for k in C.PAGES}
    with open(os.path.join(HERE, "js", "lang.template.js"), encoding="utf-8") as f:
        tpl = f.read()
    js = tpl.replace("/*URLS*/{}", json.dumps(urls, ensure_ascii=False, separators=(",", ":")))
    with open(os.path.join(OUT, "assets", "js", "lang.js"), "w", encoding="utf-8") as f:
        f.write(js)
    ar = ("/* Textos en árabe de la interfaz que genera JavaScript (clave = texto inglés). Generado por build.py */\n"
          "window.ZYRA_AR = " + json.dumps(AR, ensure_ascii=False, indent=0) + ";\n"
          "window.ZYRA_AR_KEYS = " + json.dumps(AR_KEYS, ensure_ascii=False) + ";\n")
    with open(os.path.join(OUT, "assets", "js", "i18n-ar.js"), "w", encoding="utf-8") as f:
        f.write(ar)


def main():
    # limpia las carpetas generadas (nunca toca assets, api, admin ni data)
    for i in C.LANGS.values():
        shutil.rmtree(os.path.join(OUT, i["dir_url"]), ignore_errors=True)
    for key in C.PAGES:
        for lang in C.LANGS:
            build_page(key, lang)
    build_404()
    build_root()
    build_sitemap()
    build_lang_js()
    n = len(C.PAGES) * len(C.LANGS)
    print(f"OK · {n} páginas generadas en {OUT}")
    for m in sorted(missing):
        print("  ! revisar:", m)


if __name__ == "__main__":
    main()
