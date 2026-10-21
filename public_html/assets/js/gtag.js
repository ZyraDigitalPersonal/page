/* ZYRA — Google Ads (gtag.js) respetando el consentimiento de cookies
   - Va en un archivo propio (no en línea) para cumplir la CSP del .htaccess.
   - Consent Mode v2: todo denegado por defecto.
   - La etiqueta de Google y AdSense solo se descargan si la persona acepta
     "Marketing" en el banner (cookies.js), o si ya lo había aceptado antes.
   - AdSense solo se carga en las guías. */
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

(function () {
  'use strict';
  var ID = 'AW-18455095579';
  var ADS_CLIENT = 'ca-pub-9293246097390358';
  var loaded = false, adsLoaded = false;

  /* Google AdSense: solo en las guías (contenido editorial) y solo con
     el consentimiento de marketing, igual que la etiqueta de Google Ads.
     Las páginas de servicios, contacto y legales nunca cargan anuncios. */
  function loadAds() {
    if (adsLoaded || !/\/guias\//.test(location.pathname)) return;
    adsLoaded = true;
    var a = document.createElement('script');
    a.async = true;
    a.crossOrigin = 'anonymous';
    a.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADS_CLIENT;
    document.head.appendChild(a);
  }

  gtag('consent', 'default', {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });
  window.__zyraConsentDefault = true;   // cookies.js ya no repite el "default"

  function load() {
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  /* Consentimiento guardado de otra visita (mismo formato que cookies.js) */
  try {
    var c = JSON.parse(localStorage.getItem('zyra-consent'));
    if (c && c.v === 1 && Date.now() - c.ts < 180 * 864e5 && c.marketing) {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
        analytics_storage: c.analytics ? 'granted' : 'denied'
      });
      load();
      loadAds();
    }
  } catch (e) {}

  /* Consentimiento dado ahora en el banner */
  document.addEventListener('zyra:consent', function (e) {
    if (e.detail && e.detail.marketing) { load(); loadAds(); }
  });
})();
