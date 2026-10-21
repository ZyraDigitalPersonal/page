/* ============================================================
   ZYRA — consentimiento de cookies
   - Aceptar / rechazar con el mismo peso visual (exigencia de la AEPD)
   - Nada de analítica ni marketing hasta que se acepta
   - El consentimiento caduca y se vuelve a pedir
   - API pública: window.ZyraConsent
   ============================================================ */
(() => {
  'use strict';

  const KEY = 'zyra-consent';
  const VERSION = 1;          // súbelo si cambian las categorías: se vuelve a preguntar
  const DAYS = 180;           // el consentimiento caduca a los 6 meses
  const CATS = ['analytics', 'marketing'];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const T = (es, en) => (window.ZT ? window.ZT(es, en) : es);

  /* ── Google Consent Mode v2: todo denegado por defecto ──
     Queda listo por si algún día se añade Analytics o Ads. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (!window.__zyraConsentDefault) {   // gtag.js ya lo pone en las páginas que lo cargan
    gtag('consent', 'default', {
      ad_storage: 'denied', analytics_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
      functionality_storage: 'granted', security_storage: 'granted',
      wait_for_update: 500
    });
  }

  /* ── Estado ─────────────────────────────────────────── */
  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (c.v !== VERSION) return null;
      if (Date.now() - c.ts > DAYS * 864e5) return null;
      return c;
    } catch (e) { return null; }
  };

  const save = state => {
    const c = { v: VERSION, ts: Date.now(), analytics: !!state.analytics, marketing: !!state.marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c);
    return c;
  };

  const apply = c => {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });

    /* Activa los scripts que esperaban permiso:
       <script type="text/plain" data-consent="analytics" data-src="..."></script> */
    CATS.forEach(cat => {
      if (!c[cat]) return;
      $$('script[type="text/plain"][data-consent="' + cat + '"]').forEach(tag => {
        const s = document.createElement('script');
        if (tag.dataset.src) s.src = tag.dataset.src;
        else s.textContent = tag.textContent;
        s.async = true;
        tag.parentNode.insertBefore(s, tag);
        tag.remove();
      });
    });

    document.dispatchEvent(new CustomEvent('zyra:consent', { detail: c }));
  };

  /* ── Interfaz ───────────────────────────────────────── */
  const COPY = {
    title: ['Cookies y datos', 'Cookies and data'],
    body: ['Guardamos tu idioma y tu tema para que la web funcione como la dejaste. La analítica y el marketing solo se activan si nos das permiso, y puedes cambiar de opinión cuando quieras.',
           'We store your language and theme so the site works the way you left it. Analytics and marketing only run if you allow them, and you can change your mind whenever you want.'],
    accept: ['Aceptar todas', 'Accept all'],
    reject: ['Rechazar todas', 'Reject all'],
    custom: ['Personalizar', 'Customise'],
    save: ['Guardar preferencias', 'Save preferences'],
    policy: ['Política de cookies', 'Cookie policy'],
    prefs: ['Preferencias de cookies', 'Cookie preferences'],
    panelTitle: ['Elige qué permites', 'Choose what you allow'],
    close: ['Cerrar', 'Close'],
    cats: {
      necessary: [['Necesarias', 'Necessary'],
                  ['El idioma, el tema claro u oscuro y esta misma decisión sobre cookies. Sin esto la web no puede recordar nada y no se pueden desactivar.',
                   'Your language, light or dark theme, and this very cookie decision. Without these the site cannot remember anything, so they cannot be switched off.']],
      analytics: [['Analíticas', 'Analytics'],
                  ['Nos dicen qué páginas se visitan y desde dónde, de forma agregada, para saber qué mejorar. Hoy no cargamos ninguna: si algún día añadimos medición, este interruptor la controla.',
                   'They tell us which pages get visited and from where, in aggregate, so we know what to improve. We load none today: if we ever add measurement, this switch controls it.']],
      marketing: [['Marketing', 'Marketing'],
                  ['Permiten medir campañas y mostrar anuncios personalizados fuera de esta web. Desactivadas por defecto.',
                   'They allow campaign measurement and personalised ads outside this site. Off by default.']]
    }
  };

  const el = document.createElement('div');
  el.className = 'ck';
  el.innerHTML = `
    <div class="ck__banner" id="ckBanner" role="dialog" aria-labelledby="ckTitle" aria-describedby="ckBody" hidden>
      <h2 class="ck__title" id="ckTitle"></h2>
      <p class="ck__body" id="ckBody"></p>
      <div class="ck__row">
        <button class="btn btn--light ck__accept" type="button" data-ck="accept"></button>
        <button class="btn btn--ghost ck__reject" type="button" data-ck="reject"></button>
      </div>
      <button class="ck__link" type="button" data-ck="custom"></button>
      <a class="ck__link ck__policy" href="#"></a>
    </div>

    <div class="ck__modal" id="ckModal" hidden>
      <div class="ck__scrim" data-ck="close"></div>
      <div class="ck__panel" role="dialog" aria-modal="true" aria-labelledby="ckPanelTitle">
        <div class="ck__head">
          <h2 id="ckPanelTitle"></h2>
          <button class="ck__x" type="button" data-ck="close" aria-label="">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="ck__cats"></div>
        <div class="ck__foot">
          <button class="btn btn--ghost" type="button" data-ck="reject"></button>
          <button class="btn btn--light" type="button" data-ck="save"></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);

  const banner = $('#ckBanner', el);
  const modal = $('#ckModal', el);
  const cats = $('.ck__cats', el);
  let draft = { analytics: false, marketing: false };
  let lastFocus = null;

  const policyHref = () => {
    const css = $('link[href*="zyra.css"]');
    const root = css ? css.getAttribute('href').split('?')[0].replace('assets/css/zyra.css', '') : '';
    return root + 'legal/cookies/index.html';
  };

  const paint = () => {
    $('#ckTitle', el).textContent = T(...COPY.title);
    $('#ckBody', el).textContent = T(...COPY.body);
    $('[data-ck="accept"]', banner).textContent = T(...COPY.accept);
    $('[data-ck="reject"]', banner).textContent = T(...COPY.reject);
    $('[data-ck="custom"]', banner).textContent = T(...COPY.custom);
    const pol = $('.ck__policy', el);
    pol.textContent = T(...COPY.policy);
    pol.href = policyHref();

    $('#ckPanelTitle', el).textContent = T(...COPY.panelTitle);
    $('.ck__x', el).setAttribute('aria-label', T(...COPY.close));
    $('.ck__foot [data-ck="reject"]', el).textContent = T(...COPY.reject);
    $('.ck__foot [data-ck="save"]', el).textContent = T(...COPY.save);

    cats.innerHTML = Object.keys(COPY.cats).map(key => {
      const [name, desc] = COPY.cats[key];
      const fixed = key === 'necessary';
      const on = fixed || draft[key];
      return `<div class="ck__cat">
        <label class="ck__sw${fixed ? ' is-fixed' : ''}">
          <input type="checkbox" data-cat="${key}" ${on ? 'checked' : ''} ${fixed ? 'disabled' : ''}>
          <span class="ck__track" aria-hidden="true"><i></i></span>
          <span class="ck__name">${T(...name)}${fixed ? ' <em>' + T('siempre activas', 'always on') + '</em>' : ''}</span>
        </label>
        <p>${T(...desc)}</p>
      </div>`;
    }).join('');

    $$('input[data-cat]', cats).forEach(i => {
      i.addEventListener('change', () => { draft[i.dataset.cat] = i.checked; });
    });

    const link = $('[data-cookie-prefs]');
    if (link) link.textContent = T(...COPY.prefs);
  };

  const show = node => {
    node.hidden = false;
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(node === banner ? banner : $('.ck__panel', modal),
        { y: 26, opacity: 0, scale: node === banner ? 1 : 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    }
  };

  const hide = node => {
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(node === banner ? banner : $('.ck__panel', modal), {
        y: 18, opacity: 0, duration: 0.28, ease: 'power2.in',
        onComplete: () => { node.hidden = true; gsap.set(node === banner ? banner : $('.ck__panel', modal), { clearProps: 'all' }); }
      });
    } else {
      node.hidden = true;
    }
  };

  const openPanel = () => {
    const c = read();
    draft = { analytics: c ? c.analytics : false, marketing: c ? c.marketing : false };
    lastFocus = document.activeElement;
    paint();
    show(modal);
    document.body.classList.add('ck-open');
    setTimeout(() => { const f = $('.ck__panel input, .ck__panel button', modal); if (f) f.focus(); }, 60);
  };

  const closePanel = () => {
    hide(modal);
    document.body.classList.remove('ck-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  const decide = state => {
    save(state);
    hide(banner);
    document.body.classList.remove('ck-banner');
    if (!modal.hidden) closePanel();
  };

  el.addEventListener('click', e => {
    const b = e.target.closest('[data-ck]');
    if (!b) return;
    const act = b.dataset.ck;
    if (act === 'accept') decide({ analytics: true, marketing: true });
    if (act === 'reject') decide({ analytics: false, marketing: false });
    if (act === 'save') decide(draft);
    if (act === 'custom') openPanel();
    if (act === 'close') closePanel();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closePanel();
  });

  /* Enlace permanente para volver a decidir: en el pie y donde se marque */
  const addPrefsLink = () => {
    const legal = $('.footer__legal');
    if (legal && !$('[data-cookie-prefs]', legal)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'footer__prefs';
      b.setAttribute('data-cookie-prefs', '');
      b.textContent = T(...COPY.prefs);
      b.addEventListener('click', openPanel);
      legal.appendChild(b);
    }
    $$('[data-cookie-prefs]').forEach(n => {
      if (n.dataset.ckBound) return;
      n.dataset.ckBound = '1';
      n.addEventListener('click', openPanel);
    });
  };

  /* ── Arranque ───────────────────────────────────────── */
  const saved = read();
  paint();
  addPrefsLink();

  if (saved) {
    apply(saved);
  } else {
    document.body.classList.add('ck-banner');
    setTimeout(() => { paint(); show(banner); }, 900);
  }

  document.addEventListener('zyra:lang', () => setTimeout(paint, 40));

  /* API pública */
  window.ZyraConsent = {
    get: read,
    granted: cat => { const c = read(); return !!(c && c[cat]); },
    open: openPanel,
    reset: () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  };
})();
