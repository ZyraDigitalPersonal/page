/* Arranque temprano: aplica el tema guardado antes del primer pintado.
   Va en un archivo aparte (y no en línea) para poder aplicar una CSP sin 'unsafe-inline'. */
(function () {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem('zyra-theme');
    if (t) root.dataset.theme = t;
  } catch (e) {}
})();
