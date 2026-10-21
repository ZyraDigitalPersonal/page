/* Página raíz: lleva a cada persona a su idioma.
   En el hosting lo hace antes el .htaccess; esto cubre el caso sin servidor. */
(function () {
  var map = { es: 'es-es/', en: 'en-en/', ar: 'ar-ar/' };
  var pick = null;
  try { pick = localStorage.getItem('zyra-lang'); } catch (e) {}
  if (!map[pick]) {
    var langs = navigator.languages || [navigator.language || 'es'];
    for (var i = 0; i < langs.length && !pick; i++) {
      var l = String(langs[i]).slice(0, 2).toLowerCase();
      if (l === 'es' || l === 'ca' || l === 'gl' || l === 'eu') pick = 'es';
      else if (l === 'ar') pick = 'ar';
      else if (l === 'en') pick = 'en';
    }
  }
  location.replace(map[pick] || map.es);
})();
