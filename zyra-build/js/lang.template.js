/* ============================================================
   ZYRA — idioma de la página (generado por build.py)
   El idioma lo decide la URL (/es-es/, /en-en/, /ar-ar/).
   · window.ZYRA_LANG   'es' | 'en' | 'ar'
   · window.ZT(es, en)  devuelve el texto en el idioma actual
                        (el árabe se busca en ZYRA_AR por el texto inglés)
   · window.ZYRA_URL(k) ruta de una página en el idioma actual, desde la raíz
   ============================================================ */
(function () {
  'use strict';
  var h = document.documentElement;
  var L = (h.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
  if (L !== 'en' && L !== 'ar') L = 'es';
  var AR = window.ZYRA_AR || {};
  var URLS = /*URLS*/{};

  window.ZYRA_LANG = L;
  window.ZT = function (es, en) {
    if (L === 'es') return es;
    if (L === 'en') return en;
    return AR[en] !== undefined ? AR[en] : en;
  };
  window.ZYRA_URL = function (key) {
    var u = URLS[key];
    return u ? u[L] : '';
  };

  /* Recordar la elección: localStorage para la web y una cookie técnica
     para que el servidor lleve a la misma versión al entrar por la raíz. */
  var remember = function (l) {
    try { localStorage.setItem('zyra-lang', l); } catch (e) {}
    var secure = location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = 'zyra_lang=' + l + ';path=/;max-age=31536000;SameSite=Lax' + secure;
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-lang-to]') : null;
    if (!a) return;
    remember(a.getAttribute('data-lang-to'));
    /* Mantener la posición del ancla si existe en la otra versión */
    if (location.hash && a.href.indexOf('#') < 0) a.href += location.hash;
  });
})();
