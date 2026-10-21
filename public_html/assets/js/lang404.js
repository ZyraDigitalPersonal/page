/* 404: una sola página para todo el sitio. El idioma sale de la URL pedida. */
(function () {
  var h = document.documentElement;
  var m = location.pathname.match(/^\/(es-es|en-en|ar-ar)(\/|$)/i);
  var dir = m ? m[1].toLowerCase() : null;
  if (!dir) {
    try { var s = localStorage.getItem('zyra-lang'); dir = { es: 'es-es', en: 'en-en', ar: 'ar-ar' }[s] || null; } catch (e) {}
  }
  dir = dir || 'es-es';
  var L = dir.slice(0, 2);
  h.setAttribute('lang', { es: 'es-ES', en: 'en', ar: 'ar' }[L]);
  if (L === 'ar') {
    h.setAttribute('dir', 'rtl');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/rtl.css';
    document.head.appendChild(link);
  }
  var label = document.getElementById('langLabel');
  if (label) label.textContent = L.toUpperCase();
  var ready = function () {
    document.querySelectorAll('[data-home]').forEach(function (a) { a.setAttribute('href', '/' + dir + '/'); });
    if (L === 'es') return;
    document.querySelectorAll('[data-' + L + ']').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + L);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
