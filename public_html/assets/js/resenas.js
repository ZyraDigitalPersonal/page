/* ============================================================
   ZYRA — Reseñas de clientes (v10: se publican al momento)
   · Pinta las reseñas publicadas en la home
   · Formulario en ventana emergente, con Google o sin cuenta
   · Si no hay PHP (o se abre el archivo en local) entra en
     modo demostración para poder ver el diseño igualmente.
   ============================================================ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATE = !!window.gsap && !REDUCED;
  const LANG = () => window.ZYRA_LANG || 'es';
  const ES = () => LANG() === 'es';
  const T = (es, en) => (window.ZT ? window.ZT(es, en) : es);
  const PAGE = k => ROOT + (window.ZYRA_URL ? window.ZYRA_URL(k) : '');

  /* Raíz del sitio, igual que en zyra.js: funciona en subpáginas */
  const cssLink = $('link[href*="zyra.css"]');
  const ROOT = cssLink
    ? cssLink.getAttribute('href').split('?')[0].replace('assets/css/zyra.css', '')
    : '';
  const API = ROOT + 'api/resenas.php';
  const DEMO = location.protocol === 'file:' ||
               ['localhost', '127.0.0.1', ''].includes(location.hostname);

  /* ── Textos ──────────────────────────────────────────────── */
  const TX = {
    kicker:   ['Reseñas', 'Reviews'],
    titulo:   ['Reseñas de quienes<br><em>ya trabajan con nosotros.</em>', 'Reviews from the people<br><em>who already work with us.</em>'],
    escribir: ['Escribir una reseña', 'Write a review'],
    tituloVacio:['Reseñas', 'Reviews'],
    vacio:    ['Todavía no hay reseñas publicadas. Si ya has trabajado con nosotros, escribe la primera: sale en esta página al momento.',
               'There are no reviews yet. If you have already worked with us, write the first one: it appears on this page straight away.'],
    de5:      ['de 5', 'out of 5'],
    opinion:  ['reseña', 'review'],
    opiniones:['reseñas', 'reviews'],
    verificada:['Verificada con Google', 'Verified with Google'],
    vertodas: ['Ver todas las reseñas', 'See all reviews'],
    /* Formulario */
    fTitulo:  ['Cuéntanos qué tal fue', 'Tell us how it went'],
    fIntro:   ['Tu reseña se publica al momento en la sección de reseñas y la ve cualquiera que visite la web.',
               'Your review is published straight away in the reviews section, for every visitor to see.'],
    fNota:    ['Valoración', 'Rating'],
    fGoogle:  ['Entra con Google y tu reseña saldrá con tu nombre y tu foto reales.',
               'Sign in with Google and your review will show your real name and photo.'],
    fSinGoogle:['Prefiero escribir mi nombre', 'I would rather type my name'],
    fConGoogle:['Usar mi cuenta de Google', 'Use my Google account'],
    fNombre:  ['Nombre', 'Name'],
    fEmpresa: ['Empresa o puesto (opcional)', 'Company or role (optional)'],
    fServicio:['Servicio', 'Service'],
    fTexto:   ['Tu reseña', 'Your review'],
    fLegal:   ['He leído y acepto la política de privacidad.', 'I have read and accept the privacy policy.'],
    fEnviar:  ['Publicar reseña', 'Post review'],
    fEnviando:['Enviando…', 'Sending…'],
    fCerrar:  ['Cerrar', 'Close'],
    fSalir:   ['Cambiar de cuenta', 'Use another account'],
    okEspera: ['Gracias. Tu reseña está pendiente de una revisión rápida y la publicamos en breve.',
               'Thank you. Your review is waiting for a quick check and will be published shortly.'],
    okYa:     ['¡Gracias! Tu reseña ya está publicada en la web.', 'Thank you! Your review is now live on the website.'],
    errCorto: ['Escribe un poco más: al menos 25 caracteres.', 'Write a bit more: at least 25 characters.'],
    errNota:  ['Elige cuántas estrellas nos pones.', 'Choose how many stars you give us.'],
    errNombre:['Escribe tu nombre o entra con Google.', 'Type your name or sign in with Google.'],
    errLimite:['Ya has enviado varias reseñas hoy. Inténtalo mañana.', 'You have already sent several reviews today. Try again tomorrow.'],
    errGoogle:['No hemos podido comprobar tu cuenta de Google. Prueba otra vez.', 'We could not verify your Google account. Please try again.'],
    errRed:   ['No se ha podido enviar. Revisa la conexión e inténtalo de nuevo.', 'It could not be sent. Check your connection and try again.'],
    demo:     ['Modo demostración: estás viendo el diseño en local, nada se envía al servidor.',
               'Demo mode: you are previewing the design locally, nothing is sent to the server.']
  };
  const t = k => T(TX[k][0], TX[k][1]);

  const SERVICIOS = [
    ['Desarrollo web', 'Web development'],
    ['Software a medida', 'Custom software'],
    ['Automatización', 'Automation'],
    ['Agentes de IA', 'AI agents'],
    ['Varios servicios', 'Several services']
  ];

  /* ── Iconos ──────────────────────────────────────────────── */
  const svgEstrella = llena =>
    `<svg viewBox="0 0 24 24" class="star${llena ? ' is-on' : ''}" aria-hidden="true">
       <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45 6.19 20.5 7.3 14.03 2.6 9.45l6.5-.95z"/>
     </svg>`;

  const svgGoogle = `
    <svg viewBox="0 0 24 24" class="gmark" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.27c0-.82-.07-1.6-.21-2.36H12v4.47h6.17a5.28 5.28 0 0 1-2.29 3.46v2.88h3.7C21.74 18.7 23 15.76 23 12.27Z"/>
      <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.6-2.78l-3.7-2.88c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.540-2.02-6.45-4.74H1.72v2.97A11.49 11.49 0 0 0 12 23.5Z"/>
      <path fill="#FBBC05" d="M5.55 14.2a6.9 6.9 0 0 1 0-4.4V6.83H1.72a11.5 11.5 0 0 0 0 10.34l3.83-2.97Z"/>
      <path fill="#EA4335" d="M12 5.06c1.69 0 3.2.58 4.4 1.72l3.28-3.28C17.7 1.6 15.1.5 12 .5 7.53.5 3.67 3.07 1.72 6.83L5.55 9.8C6.46 7.08 9 5.06 12 5.06Z"/>
    </svg>`;

  /* ── Menú: enlace a las opiniones en todas las páginas ───── */
  const menuNav = $('.menu__nav');
  if (menuNav && !$('[data-rv-menu]', menuNav)) {
    const a = document.createElement('a');
    a.className = 'menu__item';
    a.href = PAGE('home') + '#opiniones';
    a.dataset.rvMenu = '';
    a.innerHTML = '<span class="mlabel">' + t('kicker') + '</span>';
    const contacto = $$('.menu__item', menuNav).find(el => (el.getAttribute('href') || '').includes('contact'));
    menuNav.insertBefore(a, contacto || null);
    document.addEventListener('zyra:lang', () => {
      $('.mlabel', a).textContent = t('kicker');
    });
  }

  /* ── Sección de opiniones (solo donde exista) ────────────── */
  const seccion = $('[data-reviews]');
  if (!seccion) return;

  let datos = { total: 0, media: 0, google: false, resenas: [] };
  let todas = false;

  /* Almacén local para el modo demostración */
  const demoKey = 'zyra-resenas-demo';
  const demoLeer = () => {
    try { return JSON.parse(localStorage.getItem(demoKey) || '[]'); } catch (e) { return []; }
  };
  const demoGuardar = lista => {
    try { localStorage.setItem(demoKey, JSON.stringify(lista)); } catch (e) {}
  };

  const cargar = async () => {
    if (DEMO) {
      const lista = demoLeer();
      const suma = lista.reduce((s, r) => s + r.estrellas, 0);
      datos = {
        total: lista.length,
        media: lista.length ? Math.round((suma / lista.length) * 10) / 10 : 0,
        google: false,
        resenas: lista
      };
      return;
    }
    try {
      const res = await fetch(API + '?_=' + Date.now(), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http');
      const d = await res.json();
      if (d && d.ok) datos = d;
    } catch (e) {
      /* Sin PHP la sección se queda con su mensaje de "aún no hay" */
    }
  };

  /* ── Pintar ──────────────────────────────────────────────── */
  const fecha = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString({ es: 'es-ES', en: 'en-GB', ar: 'ar' }[LANG()], { year: 'numeric', month: 'long' });
  };

  const ficha = r => {
    const li = document.createElement('li');
    li.className = 'review';

    const top = document.createElement('div');
    top.className = 'review__top';

    if (r.avatar) {
      const img = document.createElement('img');
      img.className = 'review__ava';
      img.src = (r.avatar.startsWith('http') ? '' : ROOT) + r.avatar;
      img.alt = '';
      img.width = 52; img.height = 52;
      img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', () => {
        const ini = document.createElement('span');
        ini.className = 'review__ava review__ava--ini';
        ini.textContent = r.iniciales || 'Z';
        img.replaceWith(ini);
      });
      top.appendChild(img);
    } else {
      const ini = document.createElement('span');
      ini.className = 'review__ava review__ava--ini';
      ini.textContent = r.iniciales || 'Z';
      top.appendChild(ini);
    }

    const who = document.createElement('div');
    who.className = 'review__who';
    const nombre = document.createElement('p');
    nombre.className = 'review__name';
    nombre.textContent = r.nombre || '';
    who.appendChild(nombre);

    const meta = document.createElement('p');
    meta.className = 'review__meta';
    meta.textContent = [r.empresa, r.servicio].filter(Boolean).join(' · ');
    if (meta.textContent) who.appendChild(meta);
    top.appendChild(who);

    if (r.verificada) {
      const g = document.createElement('span');
      g.className = 'review__g';
      g.title = t('verificada');
      g.setAttribute('aria-label', t('verificada'));
      g.innerHTML = svgGoogle;
      top.appendChild(g);
    }
    li.appendChild(top);

    const stars = document.createElement('div');
    stars.className = 'review__stars';
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${r.estrellas} ${t('de5')}`);
    stars.innerHTML = [1, 2, 3, 4, 5].map(i => svgEstrella(i <= r.estrellas)).join('');
    li.appendChild(stars);

    const p = document.createElement('p');
    p.className = 'review__text';
    p.textContent = r.texto || '';
    li.appendChild(p);

    const f = fecha(r.fecha);
    if (f) {
      const d = document.createElement('p');
      d.className = 'review__date';
      d.textContent = f;
      li.appendChild(d);
    }

    return li;
  };

  const pintar = () => {
    seccion.innerHTML = '';

    const head = document.createElement('header');
    head.className = 'shead reviews__head';
    /* Sin reseñas todavía: bloque compacto y honesto en vez de un titular
       grande ("lo que dicen…") seguido de un hueco vacío. */
    seccion.classList.toggle('reviews--empty', !datos.total);
    head.innerHTML = `<p class="kicker">${t('kicker')}</p><h2 class="h-section">${datos.total ? t('titulo') : t('tituloVacio')}</h2>`;
    seccion.appendChild(head);
    if (!datos.total) {
      const vacio = document.createElement('p');
      vacio.className = 'reviews__empty';
      vacio.textContent = t('vacio');
      seccion.appendChild(vacio);
    }

    const barra = document.createElement('div');
    barra.className = 'reviews__bar';

    if (datos.total > 0) {
      const score = document.createElement('div');
      score.className = 'rscore';
      const n = Math.round(datos.media);
      score.innerHTML =
        `<span class="rscore__num">${String(datos.media).replace('.', LANG() === 'en' ? '.' : ',')}</span>
         <span class="rscore__stars" role="img" aria-label="${datos.media} ${t('de5')}">${[1,2,3,4,5].map(i => svgEstrella(i <= n)).join('')}</span>
         <span class="rscore__n">${datos.total} ${datos.total === 1 ? t('opinion') : t('opiniones')}</span>`;
      barra.appendChild(score);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--light reviews__cta';
    btn.dataset.magnet = '';
    btn.textContent = t('escribir');
    btn.addEventListener('click', () => abrir());
    barra.appendChild(btn);
    seccion.appendChild(barra);

    if (datos.total) {
      const ul = document.createElement('ul');
      ul.className = 'reviews__list';
      const visibles = todas ? datos.resenas : datos.resenas.slice(0, 6);
      visibles.forEach(r => ul.appendChild(ficha(r)));
      seccion.appendChild(ul);

      if (!todas && datos.resenas.length > 6) {
        const mas = document.createElement('button');
        mas.type = 'button';
        mas.className = 'alink reviews__more';
        mas.textContent = t('vertodas');
        mas.addEventListener('click', () => { todas = true; pintar(); });
        seccion.appendChild(mas);
      }
    }

    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };

  /* ── Ventana del formulario ──────────────────────────────── */
  let modal = null, cuenta = null, nacido = 0, previo = null;

  const cerrar = () => {
    if (!modal) return;
    modal.remove();
    modal = null;
    document.body.style.removeProperty('overflow');
    if (previo && previo.focus) previo.focus();
  };

  const construir = () => {
    const wrap = document.createElement('div');
    wrap.className = 'rvmodal';
    wrap.innerHTML = `
      <div class="rvmodal__scrim" data-rv-cerrar></div>
      <div class="rvmodal__panel" role="dialog" aria-modal="true" aria-labelledby="rvTitulo">
        <button class="rvmodal__x" type="button" data-rv-cerrar aria-label="${t('fCerrar')}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p class="kicker">${t('kicker')}</p>
        <h3 id="rvTitulo">${t('fTitulo')}</h3>
        <p class="rvmodal__intro">${t('fIntro')}</p>
        ${DEMO ? `<p class="form__warn">${t('demo')}</p>` : ''}

        <form class="rvform" novalidate>
          <div class="hp" aria-hidden="true"><label>No rellenar este campo<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

          <fieldset class="rvstars">
            <legend>${t('fNota')}</legend>
            <div class="rvstars__row" data-rv-stars>
              ${[1,2,3,4,5].map(i => `
                <label class="rvstar">
                  <input type="radio" name="estrellas" value="${i}">
                  <span>${svgEstrella(true)}</span>
                  <em>${i}</em>
                </label>`).join('')}
            </div>
          </fieldset>

          <div class="rvauth" data-rv-auth></div>

          <div class="field rvname" data-rv-name>
            <label for="rv-nombre">${t('fNombre')}</label>
            <input id="rv-nombre" name="nombre" maxlength="60" autocomplete="name">
          </div>

          <div class="field">
            <label for="rv-empresa">${t('fEmpresa')}</label>
            <input id="rv-empresa" name="empresa" maxlength="60" autocomplete="organization">
          </div>

          <div class="field">
            <label for="rv-servicio">${t('fServicio')}</label>
            <select id="rv-servicio" name="servicio">
              ${SERVICIOS.map(s => `<option>${T(s[0], s[1])}</option>`).join('')}
            </select>
          </div>

          <div class="field field--full">
            <label for="rv-texto">${t('fTexto')}</label>
            <textarea id="rv-texto" name="texto" rows="5" maxlength="900" required></textarea>
          </div>

          <label class="check field--full">
            <input type="checkbox" required>
            <span>${T('He leído y acepto la', 'I have read and accept the')}
              <a href="${PAGE('privacidad')}" target="_blank" rel="noopener">${T('política de privacidad', 'privacy policy')}</a>.
            </span>
          </label>

          <p class="rvform__err" role="alert" hidden></p>
          <button class="btn btn--light form__send" type="submit">${t('fEnviar')}</button>
          <p class="form__done" hidden></p>
        </form>
      </div>`;
    return wrap;
  };

  /* Estrellas: se rellenan hasta donde apunta el cursor */
  const pintarEstrellas = fila => {
    const val = Number((($('input:checked', fila) || {}).value) || 0);
    $$('.rvstar', fila).forEach((l, i) => l.classList.toggle('is-on', i < val));
  };

  const montarGoogle = () => {
    const caja = $('[data-rv-auth]', modal);
    const campoNombre = $('[data-rv-name]', modal);
    if (!caja) return;

    if (cuenta) {
      caja.innerHTML = `
        <div class="rvuser">
          ${cuenta.picture ? `<img class="rvuser__ava" src="${cuenta.picture}" alt="" width="46" height="46" referrerpolicy="no-referrer">` : ''}
          <div>
            <p class="rvuser__name">${cuenta.name || ''}</p>
            <p class="rvuser__meta">${svgGoogle}<span>${t('verificada')}</span></p>
          </div>
          <button type="button" class="rvuser__out" data-rv-salir>${t('fSalir')}</button>
        </div>`;
      campoNombre.hidden = true;
      $('[data-rv-salir]', caja).addEventListener('click', () => { cuenta = null; montarGoogle(); });
      return;
    }

    campoNombre.hidden = false;

    if (!datos.google) { caja.innerHTML = ''; return; }

    caja.innerHTML = `<p class="rvauth__hint">${t('fGoogle')}</p><div class="rvauth__btn" data-rv-gbtn></div>`;

    const render = () => {
      if (!window.google || !google.accounts || !google.accounts.id) return;
      google.accounts.id.initialize({
        client_id: datos.client_id,
        callback: res => {
          try {
            const p = JSON.parse(decodeURIComponent(escape(atob(res.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
            cuenta = { name: p.name, picture: p.picture, token: res.credential };
          } catch (e) {
            cuenta = { name: '', picture: '', token: res.credential };
          }
          montarGoogle();
        }
      });
      google.accounts.id.renderButton($('[data-rv-gbtn]', caja), {
        theme: html.dataset.theme === 'light' ? 'outline' : 'filled_black',
        size: 'large', shape: 'pill', text: 'continue_with',
        locale: LANG(), width: 280
      });
    };

    if (window.google && window.google.accounts) { render(); return; }
    if (!$('#gsiScript')) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true; s.id = 'gsiScript';
      s.onload = render;
      document.head.appendChild(s);
    } else {
      $('#gsiScript').addEventListener('load', render);
    }
  };

  const enviar = async form => {
    const err  = $('.rvform__err', form);
    const done = $('.form__done', form);
    const send = $('.form__send', form);
    const fallo = msg => {
      err.textContent = msg;
      err.hidden = false;
      send.disabled = false;
      send.textContent = t('fEnviar');
    };
    err.hidden = true;

    const estrellas = Number((($('input[name="estrellas"]:checked', form) || {}).value) || 0);
    const texto = $('#rv-texto', form).value.trim();
    const nombre = $('#rv-nombre', form).value.trim();

    if (!estrellas) return fallo(t('errNota'));
    if (texto.length < 25) return fallo(t('errCorto'));
    if (!cuenta && !nombre) return fallo(t('errNombre'));
    if (!$('.check input', form).checked) { $('.check input', form).reportValidity(); return; }

    send.disabled = true;
    send.textContent = t('fEnviando');

    const cuerpo = {
      estrellas,
      texto,
      nombre: cuenta ? '' : nombre,
      empresa: $('#rv-empresa', form).value.trim(),
      servicio: $('#rv-servicio', form).value,
      google: cuenta ? cuenta.token : '',
      website: $('input[name="website"]', form).value,
      t: Date.now() - nacido
    };

    /* Modo demostración: se queda en este navegador */
    if (DEMO) {
      const lista = demoLeer();
      lista.unshift({
        id: 'demo-' + Date.now(),
        nombre: cuenta ? cuenta.name : nombre,
        iniciales: (cuenta ? cuenta.name : nombre).trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join(''),
        avatar: cuenta ? cuenta.picture : '',
        estrellas, texto,
        servicio: cuerpo.servicio,
        empresa: cuerpo.empresa,
        verificada: !!cuenta,
        fecha: new Date().toISOString()
      });
      demoGuardar(lista);
      done.textContent = t('okYa');
      done.hidden = false;
      send.textContent = t('fEnviar');
      await cargar();
      pintar();
      setTimeout(cerrar, 1600);
      return;
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      });
      const d = await res.json().catch(() => ({}));

      if (!res.ok || !d.ok) {
        if (d.error === 'limite') return fallo(t('errLimite'));
        if (d.error === 'corto')  return fallo(t('errCorto'));
        if (d.error === 'google') return fallo(t('errGoogle'));
        if (d.error === 'nombre') return fallo(t('errNombre'));
        return fallo(t('errRed'));
      }

      done.textContent = d.estado === 'publicada' ? t('okYa') : t('okEspera');
      done.hidden = false;
      send.textContent = t('fEnviar');
      $$('.rvform > *:not(.form__done)', form).forEach(el => { el.hidden = true; });
      if (d.estado === 'publicada') { await cargar(); pintar(); }
      setTimeout(cerrar, 2600);
    } catch (e) {
      fallo(t('errRed'));
    }
  };

  const abrir = () => {
    if (modal) return;
    previo = document.activeElement;
    modal = construir();
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    nacido = Date.now();

    $$('[data-rv-cerrar]', modal).forEach(b => b.addEventListener('click', cerrar));
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', esc); }
    });

    const fila = $('[data-rv-stars]', modal);
    fila.addEventListener('change', () => pintarEstrellas(fila));
    $$('.rvstar', fila).forEach((l, i) => {
      l.addEventListener('mouseenter', () => $$('.rvstar', fila).forEach((x, j) => x.classList.toggle('is-hot', j <= i)));
      l.addEventListener('mouseleave', () => $$('.rvstar', fila).forEach(x => x.classList.remove('is-hot')));
    });

    montarGoogle();

    $('.rvform', modal).addEventListener('submit', e => {
      e.preventDefault();
      enviar(e.currentTarget);
    });

    if (ANIMATE) {
      gsap.from($('.rvmodal__panel', modal), { y: 26, scale: 0.96, opacity: 0, duration: 0.45, ease: 'power3.out' });
      gsap.from($('.rvmodal__scrim', modal), { opacity: 0, duration: 0.3 });
    }
    setTimeout(() => { const f = $('.rvmodal__x', modal); if (f) f.focus(); }, 60);
  };

  /* ── Arranque ────────────────────────────────────────────── */
  cargar().then(pintar);
  document.addEventListener('zyra:lang', () => { if (!modal) pintar(); });

  /* Enlace directo con #opiniones desde otras páginas */
  if (location.hash === '#opiniones') {
    setTimeout(() => seccion.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }), 400);
  }
})();
