#!/bin/bash
# ZYRA · une y minifica las hojas de estilo en un solo archivo por dirección.
#   Fuente (lo que se edita):  public_html/assets/css/{fonts,fonts-ar,zyra,resenas,rtl,zyra-fx,zyra-pro}.css
#   Resultado (lo que se sirve): public_html/assets/css/build/ltr/zyra.css
#                                public_html/assets/css/build/rtl/zyra.css   (árabe)
# Uso: bash herramientas/build-css.sh     (necesita Node.js; descarga lightningcss la primera vez)
# Después de cambiar el CSS, sube también el número ?v= de las páginas para vaciar la caché.
set -euo pipefail
cd "$(dirname "$0")/../public_html/assets/css"
mkdir -p build/ltr build/rtl
cat fonts.css zyra.css resenas.css zyra-fx.css zyra-pro.css > build/ltr/_all.css
cat fonts.css fonts-ar.css zyra.css resenas.css rtl.css zyra-fx.css zyra-pro.css > build/rtl/_all.css
for d in ltr rtl; do
  npx --yes lightningcss-cli@1.30.1 --minify --targets ">= 0.5%, last 2 versions, not dead" build/$d/_all.css -o build/$d/zyra.css
  rm build/$d/_all.css
done
ls -l build/ltr/zyra.css build/rtl/zyra.css
