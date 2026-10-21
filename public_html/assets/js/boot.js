/* Arranque temprano: tema antes del primer pintado y red de seguridad de la cortina.
   Va en un archivo aparte (y no en línea) para poder aplicar una CSP sin 'unsafe-inline'. */
(function () {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem('zyra-theme');
    if (t) root.dataset.theme = t;
  } catch (e) {}
  /* v44: los titulares del hero esperan a zyra-fx.js para entrar palabra a palabra.
     Si ese archivo no llegara a cargar, se muestran igualmente a los 3,5 s. */
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm) root.classList.add('fx-pending');
  setTimeout(function () {
    root.classList.remove('fx-pending');
    var c = document.getElementById('curtain');
    if (c && c.parentNode) c.parentNode.removeChild(c);
  }, 3500);
})();
