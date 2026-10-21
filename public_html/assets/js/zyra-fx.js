/* ============================================================
   ZYRA · movimiento (v49)
   Sustituye a la capa de efectos anterior (GSAP, Lenis, aurora,
   texto con desenfoque, cintas y chispas). Criterio:
   · Solo transiciones cortas de opacidad y desplazamiento, una vez.
   · Nada se mueve solo ni sigue al cursor; el scroll es el nativo.
   · Con "reducir movimiento" no hay ninguna animación.
   · El contenido está siempre en el HTML: si este archivo no carga,
     todo se ve igual, solo que sin transiciones.
   ============================================================ */
(() => {
  'use strict';
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ── Aparición al entrar en pantalla ── */
  const SEL = ['.shead', '.gcard', '.card', '.pillar', '.step', '.qa', '.rate', '.fact', '.promises li',
               '.service', '.split__media', '.svc-guides__list li', '.proj-teaser__media', '.case__block',
               '.editorial__body', '.why .cards', '.trust__lead', '.faq__list', '.tool', '.related .h-section'].join(',');
  const els = $$(SEL).filter(el => !el.closest('.menu, .footer, .bot, .ck, .doc, [hidden]') && !el.parentElement.closest('.m-rv'));
  if (!REDUCED && 'IntersectionObserver' in window && els.length) {
    html.classList.add('m-ready');
    const order = new Map();
    els.forEach(el => {
      const p = el.parentElement;
      const i = order.get(p) || 0;
      order.set(p, i + 1);
      el.style.setProperty('--m-d', Math.min(i * 60, 300) + 'ms');
      el.classList.add('m-rv');
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('m-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    els.forEach(el => io.observe(el));
    /* Red de seguridad: si algo no llega a observarse, se muestra igual */
    setTimeout(() => els.forEach(el => el.classList.add('m-in')), 4000);
  }

  /* ── Guías: filtro por categoría ──
     Los botones se crean aquí, así que sin JavaScript no hay botones
     que no funcionen: se ven todas las guías. */
  $$('.guides .glist').forEach(list => {
    const cards = $$(':scope > .gcard', list);
    const cat = c => (c.querySelector('.gcard__cat') || {}).textContent || '';
    const cats = [...new Set(cards.map(cat).filter(Boolean))];
    if (cats.length < 2) return;
    const lang = (html.lang || 'es').slice(0, 2);
    const ALL = lang === 'en' ? 'All' : lang === 'ar' ? 'الكل' : 'Todas';
    const bar = document.createElement('div');
    bar.className = 'gfilter';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', lang === 'en' ? 'Filter guides by topic' : 'Filtrar guías por tema');
    const count = c => (c === ALL ? cards.length : cards.filter(x => cat(x) === c).length);
    [ALL, ...cats].forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gfilter__btn';
      b.setAttribute('aria-pressed', String(i === 0));
      b.innerHTML = `<span></span><small>${count(c)}</small>`;
      b.firstChild.textContent = c;
      b.addEventListener('click', () => {
        $$('.gfilter__btn', bar).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        cards.forEach(card => {
          const show = c === ALL || cat(card) === c;
          card.hidden = !show;
          if (show) card.classList.add('m-in');
        });
        list.classList.toggle('is-filtered', c !== ALL);
      });
      bar.appendChild(b);
    });
    list.parentElement.insertBefore(bar, list);
  });
})();

/* ============================================================
   ZYRA v46 · lectura, guías y herramientas
   Sin dependencias. Todo el contenido está en el HTML: si este
   código no carga, las guías se leen igual y los formularios de
   las herramientas simplemente no calculan.
   ============================================================ */
(() => {
  'use strict';
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ── Barra de lectura: CSS la mueve si el navegador soporta
        animaciones ligadas al scroll; si no, un rAF sin trabajo extra ── */
  const bar = $('.readbar');
  if (bar && !(window.CSS && CSS.supports('animation-timeline: scroll()'))) {
    let ticking = false;
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--read', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ── Índice: marca la sección que se está leyendo ── */
  const tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map(a => [decodeURIComponent(a.hash.slice(1)), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        tocLinks.forEach(a => a.classList.remove('is-on'));
        const a = map.get(e.target.id);
        if (a) a.classList.add('is-on');
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    $$('.doc h2[id]').forEach(h => io.observe(h));
    /* El índice viene cerrado en el HTML (en móvil va encima del texto y
       abrirlo al cargar desplazaría la página). En escritorio, donde va en
       una columna lateral, se abre; en móvil se cierra al elegir sección. */
    const box = $('.toc__box');
    if (box) {
      if (matchMedia('(min-width:1081px)').matches) box.open = true;
      else tocLinks.forEach(a => a.addEventListener('click', () => { box.open = false; }));
    }
  }

  /* ── Lista de comprobación ── */
  $$('[data-checklist]').forEach(box => {
    const KEY = 'zyra-check-' + box.dataset.checklist;
    const boxes = $$('input[type="checkbox"]', box);
    const total = boxes.length;
    const out = { score: $('[data-score]', box), total: $('[data-total]', box), bar: $('[data-bar]', box), verdict: $('[data-verdict]', box) };
    const saved = store.get(KEY) || [];
    boxes.forEach(b => { b.checked = saved.includes(b.value); });
    const verdict = n => {
      const p = n / total;
      if (n === 0) return 'Marca los puntos que tu web ya cumple.';
      if (p < 0.4) return 'Hay bastante margen. Empieza por el contacto, el formulario y la ficha de Google: son los cambios que antes se notan.';
      if (p < 0.75) return 'Buena base. Revisa los puntos sin marcar de velocidad y confianza: suelen ser los que más clientes hacen perder.';
      if (p < 1) return 'Muy bien. Te quedan pocos detalles para tener una web completa.';
      return 'Todo en orden. Vuelve a pasar la lista cada pocos meses o tras cualquier cambio grande.';
    };
    const render = () => {
      const n = boxes.filter(b => b.checked).length;
      if (out.score) out.score.textContent = n;
      if (out.total) out.total.textContent = total;
      if (out.bar) out.bar.parentElement.style.setProperty('--p', (n / total).toFixed(3));
      if (out.bar) out.bar.style.setProperty('--p', (n / total).toFixed(3));
      if (out.verdict) out.verdict.textContent = verdict(n);
    };
    box.addEventListener('change', () => {
      store.set(KEY, boxes.filter(b => b.checked).map(b => b.value));
      render();
    });
    const reset = $('[data-reset]', box);
    if (reset) reset.addEventListener('click', () => { boxes.forEach(b => { b.checked = false; }); store.del(KEY); render(); });
    const pr = $('[data-print]', box);
    if (pr) pr.addEventListener('click', () => window.print());
    render();
  });

  /* ── Calculadora de automatización ── */
  $$('[data-calc]').forEach(form => {
    const lang = (html.lang || 'es').slice(0, 2);
    const nf = new Intl.NumberFormat(lang === 'es' ? 'es-ES' : lang, { maximumFractionDigits: 0 });
    const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    const val = n => { const v = parseFloat(String(form.elements[n].value).replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };
    const set = (k, t) => { const el = $(`[data-out="${k}"]`, form); if (el) el.textContent = t; };
    const run = () => {
      const pct = val('pct') / 100;
      const horas = val('min') * val('veces') * Math.min(52, val('semanas')) / 60;
      const ahorro = horas * pct;
      const valorAnual = ahorro * val('hora');
      const netoMes = valorAnual / 12 - val('cuota');
      set('pct', Math.round(pct * 100) + ' %');
      set('horas', nf.format(horas) + ' h');
      set('ahorro', nf.format(ahorro) + ' h');
      set('valor', eur.format(valorAnual));
      let msg;
      if (netoMes <= 0) {
        set('payback', 'No se recupera');
        msg = 'Con estos datos, las cuotas cuestan más que el tiempo que ahorras. Prueba con una tarea más frecuente o una herramienta más barata.';
      } else {
        const meses = val('montaje') / netoMes;
        set('payback', meses < 1 ? 'Menos de 1 mes' : nf.format(Math.ceil(meses)) + (Math.ceil(meses) === 1 ? ' mes' : ' meses'));
        msg = meses <= 12 ? 'Buena candidata: la inversión se recupera en menos de un año.'
            : meses <= 24 ? 'Puede tener sentido, pero compara con otras tareas antes de decidir.'
            : 'Tarda mucho en recuperarse. Busca una tarea con más repeticiones o una versión más simple.';
      }
      set('verdict', '');
      const v = $('[data-verdict]', form); if (v) v.textContent = msg;
    };
    form.addEventListener('input', run);
    form.addEventListener('submit', e => e.preventDefault());
    run();
  });
})();
