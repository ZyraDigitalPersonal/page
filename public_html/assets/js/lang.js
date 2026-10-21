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
  var URLS = {"home":{"es":"es-es/","en":"en-en/","ar":"ar-ar/"},"servicios":{"es":"es-es/servicios/","en":"en-en/services/","ar":"ar-ar/services/"},"web":{"es":"es-es/servicios/desarrollo-web/","en":"en-en/services/web-development/","ar":"ar-ar/services/web-development/"},"soft":{"es":"es-es/servicios/software-a-medida/","en":"en-en/services/custom-software/","ar":"ar-ar/services/custom-software/"},"auto":{"es":"es-es/servicios/automatizacion/","en":"en-en/services/automation/","ar":"ar-ar/services/automation/"},"ia":{"es":"es-es/servicios/agentes-de-ia/","en":"en-en/services/ai-agents/","ar":"ar-ar/services/ai-agents/"},"como":{"es":"es-es/como-trabajamos/","en":"en-en/how-we-work/","ar":"ar-ar/how-we-work/"},"sobre":{"es":"es-es/sobre-nosotros/","en":"en-en/about-us/","ar":"ar-ar/about-us/"},"contacto":{"es":"es-es/contacto/","en":"en-en/contact/","ar":"ar-ar/contact/"},"aviso":{"es":"es-es/legal/aviso-legal/","en":"en-en/legal/legal-notice/","ar":"ar-ar/legal/legal-notice/"},"privacidad":{"es":"es-es/legal/privacidad/","en":"en-en/legal/privacy-policy/","ar":"ar-ar/legal/privacy-policy/"},"proyectos":{"es":"es-es/proyectos/","en":"en-en/projects/","ar":"ar-ar/projects/"},"guias":{"es":"es-es/guias/","en":"es-es/guias/","ar":"es-es/guias/"},"cookies":{"es":"es-es/legal/cookies/","en":"en-en/legal/cookie-policy/","ar":"ar-ar/legal/cookie-policy/"}};

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
