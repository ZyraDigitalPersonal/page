/* ============================================================
   ZYRA — tema, idioma, menú, formularios e interacción
   v49: GSAP, ScrollTrigger y Lenis ya no se cargan. Las ramas que
   los usaban quedan inactivas (HAS_GSAP es false) y la web usa el
   scroll nativo; las transiciones discretas viven en zyra-pro.css
   y zyra-fx.js.
   ============================================================ */

(() => {
  'use strict';

  const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  const REDUCED  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATE  = HAS_GSAP && !REDUCED;
  const DESKTOP  = window.matchMedia('(min-width: 821px)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;

  if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

  /* ── 1. Tema claro / oscuro ───────────────────────── */
  const themeBtn = $('#themeBtn');
  const setTheme = t => {
    html.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#F6F7FB' : '#07090D');
    try { localStorage.setItem('zyra-theme', t); } catch (e) {}
  };
  if (!html.dataset.theme) setTheme('dark');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    setTheme(html.dataset.theme === 'light' ? 'dark' : 'light');
    if (ANIMATE) gsap.fromTo(themeBtn, { rotate: -35, scale: 0.9 }, { rotate: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' });
  });

  /* ── 2. Idioma: el texto ya viene traducido en el HTML ──
     Cada idioma tiene su propia URL (/es-es/, /en-en/, /ar-ar/).
     El desplegable solo abre y cierra; los enlaces hacen el resto. */
  const T = window.ZT || ((es, en) => (html.lang.slice(0, 2) === 'en' ? en : es));
  const langBtn = $('#langBtn');
  const langDrop = $('#langDrop');
  const openLang = open => {
    if (!langBtn || !langDrop) return;
    langBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      langDrop.hidden = false;
      if (ANIMATE) gsap.fromTo(langDrop, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
    } else if (ANIMATE) {
      gsap.to(langDrop, { y: -6, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => { langDrop.hidden = true; } });
    } else {
      langDrop.hidden = true;
    }
  };
  if (langBtn) langBtn.addEventListener('click', e => {
    e.stopPropagation();
    openLang(langBtn.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', () => { if (langBtn && langBtn.getAttribute('aria-expanded') === 'true') openLang(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openLang(false); });

  /* ── 3. Smooth scroll ─────────────────────────────── */
  let lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.6 });
    if (HAS_GSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const goTo = target => {
    if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
    else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  };

  /* ── 4. Entrada: cortina + hero ───────────────────── */
  const curtain = $('#curtain');
  const isHome = document.body.dataset.page === 'home';

  const fillBars = () => {
    $$('.panel__row').forEach((row, i) => {
      const bar = $('.panel__track i', row);
      if (!bar) return;
      const val = row.dataset.bar || 0;
      if (ANIMATE) gsap.to(bar, { width: val + '%', duration: 1.3, delay: i * 0.14, ease: 'power2.inOut' });
      else bar.style.width = val + '%';
    });
  };

  /* Aviso para zyra-fx.js: la cortina se ha abierto, empieza la entrada */
  const fxIntro = () => {
    window.__zyraIntro = true;
    document.dispatchEvent(new Event('zyra:intro'));
  };

  const introContent = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (isHome) {
      // v44: el titular lo revela zyra-fx.js palabra a palabra (BlurText)
      tl.call(fxIntro, null, 0)
        .from('.hero__glow', { opacity: 0, scale: 0.72, duration: 1.6, ease: 'power2.out' }, 0.1)
        .from('[data-hero="copy"]', { y: 22, opacity: 0, filter: 'blur(8px)', duration: 0.9, clearProps: 'filter' }, 0.75)
        .from('[data-hero="cta"] .btn', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.9)
        .from('.showcase', { y: 90, opacity: 0, duration: 1.4, ease: 'power3.out', clearProps: 'transform' }, 0.55)
        .add(fillBars, 0.95);
    } else {
      // v44: miga, titular y entradilla los revela zyra-fx.js
      tl.call(fxIntro, null, 0)
        .from('.phero .kicker', { y: 16, opacity: 0, duration: 0.6 })
        .from('.phero__glow', { opacity: 0, scale: 0.8, duration: 1.4, ease: 'power2.out' }, 0);
    }
    tl.from('.nav > *', { y: -16, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.15);
    return tl;
  };

  if (ANIMATE && curtain) {
    gsap.set('.curtain__mark', { opacity: 0, scale: 0.94 });
    gsap.timeline()
      .to('.curtain__mark', { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
      .to('.curtain__mark', { opacity: 0, scale: 1.06, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, '+=0.1')
      .to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut', onComplete: () => curtain.remove() }, '-=0.15')
      .add(introContent(), '-=0.5');
  } else {
    if (curtain) curtain.remove();
    fxIntro();
    fillBars();
  }

  /* ── 4b. El vídeo del hero reacciona al cursor ────── */
  const frame = $('.showcase__frame');
  const video = $('.showcase__video');
  const vsrc = video ? $('source[data-src]', video) : null;
  /* v10: el vídeo también se reproduce en móvil. Se descarga solo cuando
     está a punto de verse y se pausa cuando sale de pantalla (batería). */
  const SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);
  if (vsrc && video && !REDUCED && !SAVE_DATA) {
    const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    const load = () => {
      if (vsrc.src) return;
      vsrc.src = vsrc.dataset.src;
      video.muted = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.load();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { load(); play(); } else if (vsrc.src) video.pause();
      }), { rootMargin: '200px 0px' }).observe(video);
    } else { load(); play(); }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && vsrc.src) play(); });
  }
  if (video && REDUCED) video.pause();

  /* v44: el marco ya no sigue al cursor; se endereza con el scroll (ContainerScroll, zyra-fx.js) */
  const FRAME_TILT = false;
  if (FRAME_TILT && frame && ANIMATE && DESKTOP) {
    const ry = gsap.quickTo(frame, 'rotationY', { duration: 1.1, ease: 'power3' });
    const rx = gsap.quickTo(frame, 'rotationX', { duration: 1.1, ease: 'power3' });
    const rz = gsap.quickTo(frame, 'rotation', { duration: 1.1, ease: 'power3' });
    gsap.set(frame, { rotationY: -14, rotationX: 6, rotation: -1.5, transformPerspective: 1600 });
    window.addEventListener('pointermove', e => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      ry(-14 + nx * 5);
      rx(6 - ny * 4);
      rz(-1.5 + nx * 1);
    }, { passive: true });
  }

  /* ── 6. Botones magnéticos ────────────────────────── */
  if (DESKTOP && ANIMATE) {
    $$('[data-magnet]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.26,
          y: (e.clientY - (r.top + r.height / 2)) * 0.26,
          duration: 0.5, ease: 'power3.out'
        });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  /* ── 7. Barra de navegación ───────────────────────── */
  const nav = $('#nav');
  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 520 && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  /* ── 8. Menú a pantalla completa ──────────────────── */
  const menu = $('#menu');
  const burger = $('#burger');
  const burgerText = burger ? $('.burger__text', burger) : null;
  let menuOpen = false;

  const openMenu = () => {
    menu.hidden = false;
    document.body.classList.add('menu-open');
    if (lenis) lenis.stop();
    if (!ANIMATE) return;
    gsap.set('.menu__inner', { opacity: 1 });
    gsap.timeline()
      .fromTo('.menu__bg', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.inOut' })
      .fromTo('.menu__nav .mlabel', { yPercent: 110, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.22)
      .fromTo('.menu__side > *', { y: 26, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.4);
  };

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
    if (!ANIMATE) { menu.hidden = true; return; }
    gsap.timeline({ onComplete: () => { menu.hidden = true; gsap.set('.menu__inner', { opacity: 1 }); } })
      .to('.menu__inner', { opacity: 0, duration: 0.28, ease: 'power2.in' })
      .to('.menu__bg', { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'power4.inOut' }, 0.1);
  };

  const setMenu = open => {
    menuOpen = open;
    ['main', 'footer'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.toggleAttribute('inert', open);
    });
    burger.setAttribute('aria-expanded', String(open));
    if (burgerText) {
      burgerText.textContent = open
        ? T('Cerrar', 'Close')
        : T('Menú', 'Menu');
    }
    open ? openMenu() : closeMenu();
  };

  /* Submenú de Servicios dentro del menú */
  const svcToggle = $('#svcToggle');
  const svcDrop = $('#svcDrop');
  if (svcToggle && svcDrop) {
    svcToggle.addEventListener('click', () => {
      const open = svcToggle.getAttribute('aria-expanded') === 'true';
      svcToggle.setAttribute('aria-expanded', String(!open));
      if (!ANIMATE) { svcDrop.hidden = open; return; }
      if (open) {
        gsap.to(svcDrop, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { svcDrop.hidden = true; } });
      } else {
        svcDrop.hidden = false;
        gsap.fromTo(svcDrop, { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'height' });
        gsap.fromTo($$('a', svcDrop), { x: -14, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'all' }, );
      }
    });
  }

  if (burger) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  }

  /* Anclas de la misma página */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) { setMenu(false); setTimeout(() => goTo(target), 420); }
      else goTo(target);
    });
  });

  /* ── 9. Manifiesto ────────────────────────────────── */
  const manifesto = $('[data-reveal-words]'); // v44: el manifiesto usa data-fx-reveal
  if (manifesto) {
    // Envuelve cada palabra en <span class="word"> conservando <em>, <mark>, etc.
    const wrap = () => {
      const walk = (node) => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(' '); return; }
              const s = document.createElement('span');
              s.className = 'word';
              s.textContent = part;
              frag.append(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) {
            walk(n);
          }
        });
      };
      // Si ya estaba envuelto (cambio de idioma), se deshace antes
      manifesto.querySelectorAll('.word').forEach(w => w.replaceWith(w.textContent));
      manifesto.normalize();
      walk(manifesto);
    };
    wrap();
    if (ANIMATE) {
      gsap.to('.manifesto__text .word', {
        opacity: 1, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 }
      });
    } else {
      $$('.manifesto__text .word').forEach(w => (w.style.opacity = 1));
    }
    document.addEventListener('zyra:lang', () => {
      setTimeout(() => {
        wrap();
        if (ANIMATE) {
          gsap.to('.manifesto__text .word', {
            opacity: 1, stagger: 0.12, ease: 'none',
            scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 }
          });
          ScrollTrigger.refresh();
        } else {
          $$('.manifesto__text .word').forEach(w => (w.style.opacity = 1));
        }
      }, 30);
    });
  }

  /* ── 10. Servicios: recorrido horizontal ──────────── */
  const track = $('#servicesTrack');
  const hint = $('.services__hint');
  const panels = track ? $$('.service', track) : [];
  const setHint = i => {
    if (hint) hint.innerHTML = `<span class="mono">${String(i).padStart(2, '0')}</span> / <span class="mono">${String(panels.length).padStart(2, '0')}</span>`;
  };

  if (ANIMATE && DESKTOP && track) {
    const RTL = html.dir === 'rtl';
    const distance = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track)[RTL ? 'paddingLeft' : 'paddingRight']);
    gsap.to(track, {
      x: () => (RTL ? 1 : -1) * distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.services', start: 'top top', end: () => '+=' + distance() * 1.1,
        pin: '.services__pin', scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => setHint(Math.min(panels.length, Math.floor(self.progress * panels.length) + 1))
      }
    });
  } else if (track) {
    track.parentElement.classList.add('is-swipe');
    track.addEventListener('scroll', () => {
      setHint(Math.min(panels.length, Math.round(track.scrollLeft / (track.scrollWidth / panels.length)) + 1));
    }, { passive: true });
  }

  /* ── 11. Proceso ──────────────────────────────────── */
  if (ANIMATE) {
    if ($('.steps__line i')) {
      gsap.to('.steps__line i', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 62%', end: 'bottom 78%', scrub: 0.5 }
      });
    }
    $$('.step').forEach(step => {
      ScrollTrigger.create({
        trigger: step, start: 'top 68%',
        onEnter: () => step.classList.add('is-lit'),
        onEnterBack: () => step.classList.add('is-lit')
      });
      gsap.from(step, { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 82%' } });
    });
  } else {
    $$('.step').forEach(s => s.classList.add('is-lit'));
  }

  /* ── 12. Revelados discretos ──────────────────────── */
  if (ANIMATE) {
    const reveal = (sel, opts = {}) => $$(sel).forEach(el => {
      gsap.from(el, Object.assign({
        y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      }, opts));
    });
    reveal('.pillar');
    reveal('[data-rate]', { y: 22, duration: 0.7 });
    reveal('.promises li', { y: 18, duration: 0.7 });
    // v44 → zyra-fx.js: reveal('.trust__lead > *');
    reveal('.pending');
    // v44 → zyra-fx.js: reveal('.contact__lead > *');
    reveal('.forms', { y: 40 });
    // v44 → zyra-fx.js: reveal('.shead');
    reveal('.card', { y: 24, duration: 0.7 });
    reveal('.scard', { y: 34 });
    reveal('.member', { y: 28 });
    reveal('.how', { y: 30 });
    reveal('.facts', { y: 34 });
    reveal('.prose__block', { y: 20, duration: 0.7 });
    // v44 → zyra-fx.js: reveal('.band > *', { y: 26 });
    if (isHome) ScrollTrigger.create({ trigger: '.hero', start: 'top 40%', onEnterBack: fillBars });
  }

  /* ── 13. FAQ ──────────────────────────────────────── */
  $$('.qa').forEach(qa => {
    const summary = $('summary', qa);
    const body = $('.qa__body', qa);
    if (!ANIMATE) return;
    gsap.set(body, { height: 0, opacity: 0 });
    summary.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = qa.hasAttribute('open');
      $$('.qa[open]').forEach(other => {
        if (other === qa) return;
        gsap.to($('.qa__body', other), {
          height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut',
          onComplete: () => other.removeAttribute('open')
        });
      });
      if (isOpen) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { qa.removeAttribute('open'); ScrollTrigger.refresh(); } });
      } else {
        qa.setAttribute('open', '');
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ── 14. Formularios ──────────────────────────────── */
  const sw = $('.forms__switch');
  if (sw) {
    const tabs = $$('button', sw);
    const forms = [$('#form-info'), $('#form-cita')];
    const ink = $('.forms__ink', sw);
    let current = 0;

    const fitInk = () => {
      if (!ink) return;
      ink.style.width = tabs[current].offsetWidth + 'px';
      if (ANIMATE) gsap.set(ink, { x: tabs[current].offsetLeft - 5 });
    };
    fitInk();
    window.addEventListener('resize', fitInk);
    document.addEventListener('zyra:lang', () => setTimeout(fitInk, 40));

    const goo = (from, to) => {
      for (let i = 0; i < 7; i++) {
        const dot = document.createElement('i');
        dot.className = 'goo';
        sw.appendChild(dot);
        const dir = to > from ? 1 : -1;
        gsap.set(dot, { x: from + ink.offsetWidth / 2, y: 0, scale: gsap.utils.random(0.5, 1.2) });
        gsap.to(dot, {
          x: to + ink.offsetWidth / 2 + gsap.utils.random(-26, 26) * dir,
          y: gsap.utils.random(-26, 26),
          opacity: 0, scale: 0,
          duration: gsap.utils.random(0.45, 0.75),
          ease: 'power2.out',
          onComplete: () => dot.remove()
        });
      }
    };

    const select = i => {
      if (i === current) return;
      const from = tabs[current].offsetLeft - 5;
      const to = tabs[i].offsetLeft - 5;
      current = i;
      sw.dataset.on = i;
      tabs.forEach((t, j) => { t.classList.toggle('is-on', i === j); t.setAttribute('aria-selected', String(i === j)); });

      if (ANIMATE) {
        gsap.timeline()
          .to(ink, { scaleX: 1.16, scaleY: 0.82, duration: 0.16, ease: 'power2.out' })
          .to(ink, { x: to, duration: 0.5, ease: 'power3.inOut' }, 0)
          .to(ink, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.55)' }, 0.22);
        goo(from, to);

        const out = forms[i === 0 ? 1 : 0];
        gsap.to(out, {
          opacity: 0, y: -10, duration: 0.22, ease: 'power2.in',
          onComplete: () => {
            out.hidden = true;
            gsap.set(out, { opacity: 1, y: 0 });
            forms[i].hidden = false;
            gsap.fromTo(forms[i].children, { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.035, ease: 'power3.out', clearProps: 'all' });
            if (HAS_GSAP) ScrollTrigger.refresh();
          }
        });
      } else {
        forms.forEach((f, j) => { f.hidden = i !== j; });
      }
    };

    tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

    /* La cita no puede pedirse para un día que ya ha pasado */
    const hoy = new Date();
    const iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $$('input[type="date"]').forEach(d => d.setAttribute('min', iso));
    /* Confirmación de envío: sustituye el formulario por un aviso claro
       ("enviado correctamente, te contactamos en menos de 24 h") */
    const showOk = form => {
      const cita = form.id === 'form-cita';
      const err = $('.form__err', form);
      if (err) err.remove();
      const email = (($('input[name="email"]', form) || {}).value || '').trim();
      const nombre = (($('input[name="nombre"]', form) || {}).value || '').trim().split(' ')[0];
      const wa = ($('a[href^="https://wa.me"]') || {}).href || 'https://wa.me/34643412454';
      const home = (window.ZYRA_URL ? (($('link[href*="zyra.css"]') || { getAttribute: () => '' }).getAttribute('href').split('?')[0].replace(/assets\/css\/.*$/, '') + window.ZYRA_URL('home')) : '/');
      const safe = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      let box = $('.form__ok', form);
      if (!box) {
        box = document.createElement('div');
        box.className = 'form__ok';
        form.appendChild(box);
      }
      box.innerHTML = `
        <div class="success" role="status" tabindex="-1">
          <span class="success__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
          <p class="success__kicker">${T('Solicitud enviada', 'Request sent')}</p>
          <h3 class="success__title">${nombre ? T('Gracias, ', 'Thank you, ') + safe(nombre) + '.' : T('¡Gracias!', 'Thank you!')} ${cita ? T('Tu cita está en camino.', 'Your call is on its way.') : T('Hemos recibido tu mensaje.', 'We have your message.')}</h3>
          <p class="success__text">${cita
            ? T('Te contactaremos en menos de 24 horas por email o WhatsApp para confirmar el día y la hora.', 'We will contact you within 24 hours by email or WhatsApp to confirm the day and time.')
            : T('Te contactaremos en menos de 24 horas por email o WhatsApp.', 'We will contact you within 24 hours by email or WhatsApp.')}${email ? ' ' + T('Te hemos enviado una copia a', 'We have sent a copy to') + ' <strong>' + safe(email) + '</strong>.' : ''}</p>
          <p class="success__note">${T('Si no ves nuestro email en unos minutos, revisa la carpeta de spam.', 'If you do not see our email within a few minutes, check your spam folder.')}</p>
          <div class="success__cta">
            <a class="btn btn--light" href="${home}">${T('Volver al inicio', 'Back to home')}</a>
            <a class="btn btn--ghost btn--wa" href="${wa}" target="_blank" rel="noopener"><svg aria-hidden="true" viewBox="0 0 32 32" width="18" height="18"><path fill="currentColor" d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.3 28.8l6.6-1.7A12.7 12.7 0 1 0 16 3.2Zm0 23.2a10.5 10.5 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.5 10.5 0 1 1 16 26.4Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7a.6.6 0 0 0 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.5 6.5 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.4Z"/></svg><span>${T('Hablar por WhatsApp', 'Chat on WhatsApp')}</span></a>
          </div>
          <button type="button" class="success__again">${T('Enviar otra solicitud', 'Send another request')}</button>
        </div>`;
      $('.success__again', box).addEventListener('click', () => {
        form.reset();
        form.classList.remove('is-sent');
        box.hidden = true;
        const send = $('.form__send', form);
        if (send) send.disabled = false;
        const first = $('input:not([type="hidden"]):not([name="website"]), select, textarea', form);
        if (first) first.focus();
      });
      form.classList.add('is-sent');
      box.hidden = false;
      const inner = $('.success', box);
      inner.focus({ preventScroll: true });
      const r = box.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight) box.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      if (ANIMATE) {
        gsap.fromTo(box, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
        gsap.fromTo($('.success__icon', box), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.1, ease: 'back.out(2.2)' });
      }
    };

    /* Vuelta del envío clásico (sin JavaScript o si falló el envío por fetch):
       el servidor redirige con ?enviado=1 y aquí se enseña la confirmación. */
    try {
      const qs = new URLSearchParams(location.search);
      if (qs.get('enviado') === '1' && forms[0]) setTimeout(() => showOk(forms[0]), 300);
    } catch (e) { /* navegadores muy antiguos */ }

    forms.forEach(form => {
      const born = Date.now();
      form.addEventListener('input', e => {
        const f = e.target.closest && e.target.closest('.field');
        if (f && e.target.checkValidity()) f.classList.remove('is-invalid');
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        $$('input:not([type="hidden"]), select, textarea', form).forEach(el => {
          const f = el.closest('.field');
          if (f) f.classList.toggle('is-invalid', !el.checkValidity());
        });
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const done = $('.form__done', form);
        const send = $('.form__send', form);

        /* Antispam: campo trampa relleno o envío en menos de 3 s = robot.
           No se avisa (así el robot no aprende) y no se envía nada. */
        const trap = $('input[name="website"]', form);
        if ((trap && trap.value) || Date.now() - born < 3000) {
          showOk(form);
          return;
        }
        send.disabled = true;
        send.classList.add('is-loading');
        send.setAttribute('aria-busy', 'true');
        const label = send.textContent;
        send.textContent = T('Enviando…', 'Sending…');
        const tField = $('input[name="t"]', form);
        if (tField) tField.value = String(Date.now() - born);
        const fail = code => {
          send.disabled = false;
          send.classList.remove('is-loading');
          send.removeAttribute('aria-busy');
          send.textContent = label;
          let err = $('.form__err', form);
          if (!err) {
            err = document.createElement('p');
            err.className = 'form__err';
            err.setAttribute('role', 'alert');
            done.insertAdjacentElement('beforebegin', err);
          }
          err.innerHTML = (code === 'limit'
            ? T('Has enviado varias solicitudes hoy. Escríbenos por WhatsApp y te atendemos al momento.', 'You have sent several requests today. Message us on WhatsApp and we will help you right away.')
            : T('No se ha podido enviar. Inténtalo de nuevo o escríbenos por WhatsApp.', 'It could not be sent. Try again or message us on WhatsApp.')) +
            ' <a href="' + (($('a[href^="https://wa.me"]') || {}).href || 'https://wa.me/34643412454') + '" target="_blank" rel="noopener">WhatsApp</a>';
        };
        const ok = () => {
          send.textContent = label;
          send.disabled = false;
          send.classList.remove('is-loading');
          send.removeAttribute('aria-busy');
          showOk(form);
        };
        /* En local (sin PHP) se simula el envío para poder ver el diseño */
        if ((location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname)) && !window.ZYRA_API_TEST) {
          setTimeout(ok, 700);
          return;
        }
        const body = new FormData(form);
        body.append('origen', location.pathname);
        fetch(form.getAttribute('action'), {
          method: 'POST', body,
          headers: { 'Accept': 'application/json' }, credentials: 'same-origin'
        })
          .then(r => r.json().catch(() => ({})).then(d => (r.ok && d.ok ? ok() : fail(d.error))))
          .catch(() => fail());
      });
    });
  }

  if (HAS_GSAP) window.addEventListener('load', () => ScrollTrigger.refresh());
})();

/* ============================================================
   ZYRA v12 — mockups en perspectiva, recomendador y asistente
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const HAS_GSAP = !!window.gsap;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATE = HAS_GSAP && !REDUCED;
  const DESKTOP = window.matchMedia('(min-width: 821px)').matches;
  if (window.ScrollTrigger) ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
  const css = $('link[href*="zyra.css"]');
  const root = css ? css.getAttribute('href').split('?')[0].replace(/assets\/css\/.*$/, '') : '';
  const WA = ($('a[href^="https://wa.me"]') || {}).href || 'https://wa.me/34643412454';

  /* ── 1. Los mockups se inclinan con el cursor ─────── */
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  const WEAK = (navigator.hardwareConcurrency || 8) < 4;

  const tilt = (card, img, base) => {
    if (!ANIMATE || !DESKTOP || COARSE || WEAK) return;
    const ry = gsap.quickTo(img, 'rotationY', { duration: 0.9, ease: 'power3' });
    const rx = gsap.quickTo(img, 'rotationX', { duration: 0.9, ease: 'power3' });
    gsap.set(img, { rotationY: base.y, rotationX: base.x, rotation: base.z, transformPerspective: 1500 });

    let rect = null, queued = false, px = 0, py = 0;
    const apply = () => {
      queued = false;
      if (!rect) return;
      const nx = ((px - rect.left) / rect.width) * 2 - 1;
      const ny = ((py - rect.top) / rect.height) * 2 - 1;
      ry(base.y + nx * 8);
      rx(base.x - ny * 6);
    };
    card.addEventListener('pointerenter', () => {
      rect = card.getBoundingClientRect();
      img.classList.add('is-tilting');
    });
    card.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      rect = null;
      ry(base.y); rx(base.x);
      setTimeout(() => img.classList.remove('is-tilting'), 900);
    });
  };

  $$('.service').forEach(card => {
    const img = $('.service__media img', card);
    if (img) tilt(card, img, { y: -14, x: 6, z: -1.5 });
  });
  const splitImg = $('.split__media img');
  if (splitImg) tilt($('.split') || splitImg.parentElement, splitImg, { y: -12, x: 5, z: -1.5 });

  /* ── 2. Recomendador (stepper) ────────────────────── */
  const T = window.ZT || ((es, en) => es);
  const URL_OF = k => root + (window.ZYRA_URL ? window.ZYRA_URL(k) : '');

  const STEPS = [
    {
      q: ['¿Qué quieres resolver?', 'What do you want to solve?'],
      o: [
        ['web', 'Tener o renovar mi web', 'Get or renew my website'],
        ['auto', 'Dejar de repetir tareas a mano', 'Stop repeating manual tasks'],
        ['soft', 'Gestionar mi operación con una app', 'Run my operation with an app'],
        ['ia', 'Atender consultas automáticamente', 'Answer enquiries automatically'],
        ['duda', 'Todavía no lo tengo claro', "I'm not sure yet"]
      ]
    },
    {
      q: ['¿De qué partes ahora mismo?', 'Where are you starting from?'],
      o: [
        ['cero', 'Desde cero, no tengo nada', 'From scratch, nothing yet'],
        ['viejo', 'Tengo algo, pero se ha quedado antiguo', 'I have something, but it feels dated'],
        ['suelto', 'Uso varias herramientas sin conectar', 'Several tools that do not talk to each other'],
        ['crecer', 'Funciona, pero se me queda corto', 'It works, but it falls short now']
      ]
    },
    {
      q: ['¿Qué presupuesto manejas?', 'What budget are you working with?'],
      o: [
        ['bajo', 'Menos de 500 €', 'Under €500'],
        ['medio', 'Entre 500 € y 1.500 €', '€500 to €1,500'],
        ['alto', 'Más de 1.500 €', 'Over €1,500'],
        ['abierto', 'Depende de lo que aporte', 'Depends on the return']
      ]
    },
    {
      q: ['¿Para cuándo lo necesitas?', 'When do you need it?'],
      o: [
        ['ya', 'Cuanto antes', 'As soon as possible'],
        ['mes', 'Este mes', 'This month'],
        ['trim', 'En los próximos meses', 'In the next few months'],
        ['mirando', 'Estoy explorando opciones', "I'm just exploring"]
      ]
    }
  ];

  const SERVICES = {
    web:  { name: ['Desarrollo web', 'Web development'], url: 'web',
            why: ['Tu punto de partida es la web: es lo que ve todo el mundo antes de escribirte y lo que más rápido cambia la primera impresión del negocio.',
                  'Your starting point is the website: it is what everyone sees before contacting you, and the fastest way to change that first impression.'],
            time: ['1–2 semanas la esencial · 3–5 la avanzada', '1–2 weeks for the essential one · 3–5 for the advanced'] },
    auto: { name: ['Automatización', 'Automation'], url: 'auto',
            why: ['Lo tuyo no es construir algo nuevo, es dejar de repetir: conectamos las herramientas que ya usas para que el trabajo pase solo.',
                  'You do not need something new, you need to stop repeating: we connect the tools you already use so the work happens on its own.'],
            time: ['1–3 semanas', '1–3 weeks'] },
    soft: { name: ['Software a medida', 'Custom software'], url: 'soft',
            why: ['Tu proceso ya existe y funciona; lo que falta es una aplicación construida a su alrededor en vez de estirar hojas de cálculo.',
                  'Your process already exists and works; what is missing is an app built around it instead of stretching spreadsheets.'],
            time: ['Desde 4 semanas según alcance', 'From 4 weeks depending on scope'] },
    ia:   { name: ['Agentes de IA', 'AI agents'], url: 'ia',
            why: ['Recibes las mismas preguntas una y otra vez: un agente entrenado con tu información responde al momento y deriva a una persona cuando toca.',
                  'You get the same questions over and over: an agent trained on your information answers instantly and hands off to a person when needed.'],
            time: ['2–4 semanas', '2–4 weeks'] }
  };

  const decide = a => {
    let key = a[0];
    if (key === 'duda') key = a[1] === 'suelto' ? 'auto' : a[1] === 'crecer' ? 'soft' : 'web';
    if (key === 'web' && a[1] === 'suelto') key = 'auto';
    const s = SERVICES[key];
    const start = {
      bajo:   ['Empezaríamos por lo esencial y ampliamos por fases.', 'We would start with the essentials and grow in phases.'],
      medio:  ['Da para una primera versión completa y bien acabada.', 'Enough for a complete, well-finished first version.'],
      alto:   ['Hay margen para hacerlo a medida y dejarlo preparado para crecer.', 'There is room to build it properly and leave it ready to grow.'],
      abierto:['Te pasamos dos alcances, uno mínimo y uno completo, para que compares.', 'We will send two scopes, minimal and complete, so you can compare.']
    }[a[2]];
    const when = {
      ya:      ['Se puede arrancar esta misma semana.', 'We can start this very week.'],
      mes:     ['Entra de sobra dentro del mes.', 'It fits comfortably within the month.'],
      trim:    ['Con margen, sale mejor y más barato.', 'With time to spare it turns out better and cheaper.'],
      mirando: ['Sin prisa: te dejamos la información y decides cuando quieras.', 'No rush: we send the information and you decide when you want.']
    }[a[3]];
    return { s, start, when };
  };

  const buildQuiz = host => {
    let step = 0;
    const answers = [];
    let introST = null;

    /* El titular arranca centrado y, al scrollear, se va a la izquierda
       mientras el cuestionario sale de detrás de las letras hacia la derecha. */
    const setupIntro = () => {
      if (introST) { introST.kill(); introST = null; }
      if (!ANIMATE || !window.matchMedia('(min-width: 901px)').matches) return;
      const grid = $('.quiz__grid', host);
      const lead = $('.quiz__lead', host);
      const stepper = $('.stepper', host);
      if (!grid || !lead || !stepper) return;

      const centerX = () => {
        const g = grid.getBoundingClientRect();
        const l = lead.getBoundingClientRect();
        return (g.width - l.width) / 2 - (l.left - g.left);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: host, start: 'top 76%', end: 'top 24%',
          scrub: 0.6, invalidateOnRefresh: true
        }
      });
      tl.fromTo(lead, { x: centerX }, { x: 0, ease: 'none' }, 0)
        .fromTo(stepper,
          { clipPath: 'inset(0% 100% 0% 0% round 26px)', x: -70, opacity: 0.2 },
          { clipPath: 'inset(0% 0% 0% 0% round 26px)', x: 0, opacity: 1, ease: 'none' }, 0);
      introST = tl.scrollTrigger;
    };

    /* Estado del final del cuestionario: datos del formulario y envío */
    const draft = { nombre: '', email: '', telefono: '', mensaje: '', privacidad: false };
    const MAIN_FORM = $('#form-info');   // v10: si la página tiene formulario de contacto, el cuestionario termina en él
    let sent = false, sending = false, bornAt = 0;
    const API = root + 'api/contacto.php';
    const LOCAL = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ICON_WA = '<svg aria-hidden="true" viewBox="0 0 32 32" width="18" height="18"><path fill="currentColor" d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.3 28.8l6.6-1.7A12.7 12.7 0 1 0 16 3.2Zm0 23.2a10.5 10.5 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.5 10.5 0 1 1 16 26.4Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7a.6.6 0 0 0 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.5 6.5 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.4Z"/></svg>';

    const render = () => {
      const done = step >= STEPS.length;
      const total = STEPS.length;
      host.innerHTML = `
        <div class="quiz__grid">
        <div class="quiz__lead">
          <p class="kicker">${T('Diagnóstico gratuito', 'Free assessment')}</p>
          <h2 class="h-display">${T('¿No sabes<br>qué necesitas?', 'Not sure<br>what you need?')}</h2>
          <p>${T('Cuatro preguntas rápidas y te decimos por dónde empezaríamos. Al final, si quieres, nos dejas tu contacto y te enviamos una propuesta para tu caso.', 'Four quick questions and we tell you where we would start. At the end, if you like, leave your contact details and we will send you a proposal for your case.')}</p>
          <a class="alink" href="${WA}" target="_blank" rel="noopener">${T('Prefiero contarlo por WhatsApp', 'I would rather explain it on WhatsApp')}</a>
        </div>
        <div class="stepper ${done ? 'is-final' : ''} ${sent ? 'is-sent' : ''}">
          <ol class="stepper__rail" aria-hidden="true">
            <span class="stepper__fill"></span>
            ${STEPS.map((_, i) => `<li class="stepper__dot ${i < step ? 'is-done' : ''} ${i === step ? 'is-on' : ''}"><span>${i + 1}</span></li>`).join('')}
            <li class="stepper__dot ${sent ? 'is-done' : done ? 'is-on' : ''}"><span>★</span></li>
          </ol>
          <div class="stepper__view" aria-live="polite"></div>
          <div class="stepper__nav" ${sent ? 'hidden' : ''}>
            <button type="button" class="btn btn--ghost" data-back ${step === 0 ? 'disabled' : ''}>${T('Atrás', 'Back')}</button>
            <span class="stepper__count mono">${done ? T('Último paso', 'Last step') : String(step + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')}</span>
            ${done
              ? `<button type="button" class="stepper__restart" data-reset>${T('Empezar de nuevo', 'Start over')}</button>`
              : `<button type="button" class="btn btn--light" data-next ${answers[step] ? '' : 'disabled'}>${T('Continuar', 'Continue')}</button>`}
          </div>
        </div>
        </div>`;

      const view = $('.stepper__view', host);
      const fill = $('.stepper__fill', host);
      fill.style.width = `calc((100% - 32px) * ${sent ? 1 : Math.min(step, total) / total})`;

      if (sent) {
        /* ── Pantalla de éxito ── */
        const home = URL_OF('home') || root;
        view.innerHTML = `
          <div class="success" role="status" tabindex="-1">
            <span class="success__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
            <p class="success__kicker">${T('Solicitud recibida', 'Request received')}</p>
            <h3 class="success__title">${T('Gracias, ', 'Thank you, ') + esc(draft.nombre.split(' ')[0])}. ${T('Ya tenemos tu proyecto.', 'We have your project.')}</h3>
            <p class="success__text">${T('El equipo de ZYRA revisará tus respuestas y te escribirá en menos de 24 horas laborables a', 'The ZYRA team will review your answers and write to you within 24 working hours at')} <strong>${esc(draft.email)}</strong>.</p>
            <p class="success__note">${T('Te hemos enviado una copia a tu correo. Si no la ves en unos minutos, revisa la carpeta de spam.', 'We have sent a copy to your inbox. If you do not see it in a few minutes, check your spam folder.')}</p>
            <div class="success__cta">
              <a class="btn btn--light" href="${home}" data-home>${T('Volver al inicio', 'Back to home')}</a>
              <a class="btn btn--ghost btn--wa" href="${WA}" target="_blank" rel="noopener">${ICON_WA}<span>${T('Hablar por WhatsApp', 'Chat on WhatsApp')}</span></a>
            </div>
          </div>`;
        const homeLink = $('[data-home]', view);
        const onHome = location.pathname.replace(/index\.html$/, '').endsWith('/' + (URL_OF('home') || '').replace(root, ''));
        if (homeLink && onHome) homeLink.addEventListener('click', e => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
        });
      } else if (done && MAIN_FORM) {
        /* ── v10 · Resultado + paso al formulario de contacto de la página ──
           Un solo formulario: las respuestas se copian al de "Hablemos de tu
           proyecto" y la persona solo añade su nombre y su email. */
        const { s } = decide(answers);
        const { start, when } = decide(answers);
        view.innerHTML = `
          <div class="result">
            <span class="result__tag">${T('Te recomendamos', 'We recommend')}</span>
            <h3>${T(s.name[0], s.name[1])}</h3>
            <p>${T(s.why[0], s.why[1])}</p>
            <dl class="result__meta">
              <div><dt>${T('Plazo orientativo', 'Typical timeline')}</dt><dd>${T(s.time[0], s.time[1])}</dd></div>
              <div><dt>${T('Alcance', 'Scope')}</dt><dd>${T(start[0], start[1])}</dd></div>
              <div><dt>${T('Arranque', 'Kick-off')}</dt><dd>${T(when[0], when[1])}</dd></div>
            </dl>
            <a class="alink result__more" href="${URL_OF(s.url)}">${T('Ver el servicio', 'See the service')}</a>
          </div>
          <div class="qnext">
            <p class="qform__title">${T('Recibe una propuesta para tu caso', 'Get a proposal for your case')}</p>
            <p class="qform__lead">${T('Pasamos tus respuestas al formulario de contacto: solo faltan tu nombre y tu email. Sin compromiso.', 'We pass your answers to the contact form: only your name and email are missing. No commitment.')}</p>
            <button type="button" class="btn btn--light qnext__go" data-qgo>
              <span>${T('Continuar con mis datos', 'Continue with my details')}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5v14M5.5 12l6.5 6.5L18.5 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>`;
        $('[data-qgo]', view).addEventListener('click', () => toMainForm(s));
      } else if (done) {
        /* ── Resultado + datos de contacto ── */
        const { s, start, when } = decide(answers);
        if (!bornAt) bornAt = Date.now();
        view.innerHTML = `
          <div class="result">
            <span class="result__tag">${T('Te recomendamos', 'We recommend')}</span>
            <h3>${T(s.name[0], s.name[1])}</h3>
            <p>${T(s.why[0], s.why[1])}</p>
            <dl class="result__meta">
              <div><dt>${T('Plazo orientativo', 'Typical timeline')}</dt><dd>${T(s.time[0], s.time[1])}</dd></div>
              <div><dt>${T('Alcance', 'Scope')}</dt><dd>${T(start[0], start[1])}</dd></div>
              <div><dt>${T('Arranque', 'Kick-off')}</dt><dd>${T(when[0], when[1])}</dd></div>
            </dl>
            <a class="alink result__more" href="${URL_OF(s.url)}">${T('Ver el servicio', 'See the service')}</a>
          </div>
          <form class="qform" novalidate>
            <div class="qform__head">
              <p class="qform__title">${T('Recibe una propuesta para tu caso', 'Get a proposal for your case')}</p>
              <p class="qform__lead">${T('Déjanos tus datos y te escribimos en menos de 24 horas laborables. Sin compromiso.', 'Leave your details and we will write to you within 24 working hours. No commitment.')}</p>
            </div>
            <div class="hp" aria-hidden="true"><label>No rellenar<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
            <div class="field"><label for="q-nombre">${T('Nombre o empresa', 'Name or company')}</label><input id="q-nombre" name="nombre" autocomplete="name" required value="${esc(draft.nombre)}"></div>
            <div class="field"><label for="q-email">Email</label><input id="q-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${esc(draft.email)}"></div>
            <div class="field field--full"><label for="q-tel">${T('Teléfono o WhatsApp', 'Phone or WhatsApp')} <span class="field__opt">${T('(opcional)', '(optional)')}</span></label><input id="q-tel" name="telefono" type="tel" autocomplete="tel" value="${esc(draft.telefono)}"></div>
            <div class="field field--full"><label for="q-msg">${T('¿Algo más que debamos saber?', 'Anything else we should know?')} <span class="field__opt">${T('(opcional)', '(optional)')}</span></label><textarea id="q-msg" name="mensaje" rows="3" placeholder="${T('Qué problema quieres resolver, qué herramientas usas hoy…', 'What problem you want to solve, which tools you use today…')}">${esc(draft.mensaje)}</textarea></div>
            <label class="check field--full"><input type="checkbox" name="privacidad" value="1" required ${draft.privacidad ? 'checked' : ''}><span>${T('He leído y acepto la', 'I have read and accept the')} <a href="${URL_OF('privacidad')}" target="_blank" rel="noopener">${T('política de privacidad', 'privacy policy')}</a>.</span></label>
            <p class="qform__err field--full" role="alert" hidden></p>
            <button type="submit" class="btn btn--light qform__send" data-magnet>${T('Enviar y recibir propuesta', 'Send and get a proposal')}</button>
          </form>`;
      } else {
        const st = STEPS[step];
        view.innerHTML = `
          <p class="stepper__q" id="q-${step}">${T(st.q[0], st.q[1])}</p>
          <div class="opts" role="group" aria-labelledby="q-${step}">
            ${st.o.map(([v, es, en]) => `<button type="button" class="opt ${answers[step] === v ? 'is-on' : ''}" aria-pressed="${answers[step] === v}" data-v="${v}">${T(es, en)}</button>`).join('')}
          </div>`;
      }

      const near = host.getBoundingClientRect().top < window.innerHeight * 1.1;
      if (ANIMATE && near) {
        gsap.from($$('.opt, .result > *, .qform > *, .success > *', view), { y: 16, opacity: 0, duration: 0.45, stagger: 0.035, ease: 'power3.out', clearProps: 'transform,opacity' });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();

      $$('.opt', view).forEach(b => b.addEventListener('click', () => {
        answers[step] = b.dataset.v;
        $$('.opt', view).forEach(o => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', String(o === b)); });
        const nx = $('[data-next]', host); if (nx) nx.removeAttribute('disabled');
        setTimeout(() => { step++; render(); focusView(); }, 260);
      }));
      const back = $('[data-back]', host), next = $('[data-next]', host);
      if (back) back.addEventListener('click', () => { if (step > 0) { step--; render(); focusView(); } });
      if (next) next.addEventListener('click', () => { if (answers[step]) { step++; render(); focusView(); } });
      const reset = $('[data-reset]', host);
      if (reset) reset.addEventListener('click', () => { step = 0; answers.length = 0; render(); focusView(); });
      setupIntro();

      const form = $('.qform', view);
      if (form) wireForm(form);
      if (sent) {
        const box = $('.success', view);
        if (box) {
          box.focus({ preventScroll: true });
          const r = box.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight) box.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
        }
      }
    };

    /* Tras cambiar de paso, el foco va a la pregunta (teclado y lector de pantalla)
       y, en móvil, la tarjeta vuelve a quedar a la vista. */
    /* Copia el diagnóstico al formulario principal y lleva hasta él */
    const toMainForm = s => {
      const f = MAIN_FORM;
      const tab = $('#tab-info');
      if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
      const key = Object.keys(SERVICES).find(k => SERVICES[k] === s);
      const sel = $('select[name="servicio"]', f);
      if (sel && key) {
        const opt = Array.from(sel.options).find(o => o.value === SERVICES[key].name[0]);
        if (opt) sel.value = opt.value;
      }
      const LBL = [['Quiero', 'I want'], ['Parto de', 'Starting point'], ['Presupuesto', 'Budget'], ['Plazo', 'Timeline']];
      const pick = (i, es) => {
        const o = STEPS[i].o.find(x => x[0] === answers[i]);
        return o ? (es ? o[1] : T(o[1], o[2])) : '';
      };
      const lines = es => LBL.map((l, i) => '• ' + (es ? l[0] : T(l[0], l[1])) + ': ' + pick(i, es));
      const human = [T('Hola, he hecho el diagnóstico de la web:', 'Hi, I have done the assessment on the website:')]
        .concat(lines(false), [T('Recomendación', 'Recommendation') + ': ' + T(s.name[0], s.name[1])]).join('\n');
      const team = lines(true).concat(['• Recomendación: ' + s.name[0]]).join('\n');

      const msg = $('textarea[name="mensaje"]', f);
      if (msg) {
        const prev = msg.dataset.diag || '';
        const own = msg.value.replace(prev, '').trim();
        msg.value = own ? own + '\n\n' + human : human;
        msg.dataset.diag = human;
        msg.dispatchEvent(new Event('input', { bubbles: true }));
      }
      let hid = $('input[name="diagnostico"]', f);
      if (!hid) {
        hid = document.createElement('input');
        hid.type = 'hidden';
        hid.name = 'diagnostico';
        f.insertBefore(hid, f.firstChild);
        f.addEventListener('reset', () => { hid.remove(); if (msg) delete msg.dataset.diag; }, { once: true });
      }
      hid.value = team;

      const box = f.closest('.forms') || f;
      box.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      box.classList.remove('is-prefilled');
      void box.offsetWidth;
      box.classList.add('is-prefilled');
      setTimeout(() => {
        const first = $('input[name="nombre"]', f);
        if (first && !first.value) first.focus({ preventScroll: true });
      }, REDUCED ? 50 : 1100);
      setTimeout(() => box.classList.remove('is-prefilled'), 3200);
    };

    const focusView = () => {
      const q = $('.stepper__q, .result h3', host);
      if (q) { q.setAttribute('tabindex', '-1'); q.focus({ preventScroll: true }); }
      const card = $('.stepper', host);
      if (card) {
        const r = card.getBoundingClientRect();
        if (r.top < 0) window.scrollBy({ top: r.top - 90, behavior: REDUCED ? 'auto' : 'smooth' });
      }
    };

    const wireForm = form => {
      const err = $('.qform__err', form);
      const btn = $('.qform__send', form);
      const sync = () => {
        draft.nombre = form.nombre.value.trim();
        draft.email = form.email.value.trim();
        draft.telefono = form.telefono.value.trim();
        draft.mensaje = form.mensaje.value.trim();
        draft.privacidad = form.privacidad.checked;
      };
      form.addEventListener('input', () => {
        sync();
        $$('.is-invalid', form).forEach(f => { if (f.querySelector('input,textarea').checkValidity()) f.classList.remove('is-invalid'); });
      });
      const showErr = html => { err.innerHTML = html; err.hidden = false; };
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (sending) return;
        sync();
        err.hidden = true;
        /* Validación con mensajes claros, campo a campo */
        let first = null;
        [['nombre', draft.nombre.length >= 2], ['email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email)]].forEach(([n, ok]) => {
          const f = form[n].closest('.field');
          f.classList.toggle('is-invalid', !ok);
          if (!ok && !first) first = form[n];
        });
        if (first) {
          showErr(T('Revisa tu nombre y un email válido para poder responderte.', 'Please check your name and a valid email so we can reply.'));
          first.focus();
          return;
        }
        if (!draft.privacidad) {
          showErr(T('Para enviarlo, acepta la política de privacidad.', 'To send it, please accept the privacy policy.'));
          form.privacidad.focus();
          return;
        }
        const { s } = decide(answers);
        const key = Object.keys(SERVICES).find(k => SERVICES[k] === s);
        const data = new FormData();
        data.append('tipo', 'diagnostico');
        data.append('lang', (window.ZYRA_LANG || html.lang.slice(0, 2) || 'es'));
        data.append('nombre', draft.nombre);
        data.append('email', draft.email);
        data.append('telefono', draft.telefono);
        data.append('mensaje', draft.mensaje);
        data.append('privacidad', '1');
        data.append('website', form.website.value);
        data.append('t', String(Date.now() - bornAt));
        ['necesidad', 'situacion', 'presupuesto', 'plazo'].forEach((k, i) => data.append('q_' + k, answers[i]));
        data.append('recomendado', key);
        data.append('origen', location.pathname);

        sending = true;
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.setAttribute('aria-busy', 'true');
        btn.textContent = T('Enviando…', 'Sending…');
        const fail = code => {
          sending = false;
          btn.disabled = false;
          btn.classList.remove('is-loading');
          btn.removeAttribute('aria-busy');
          btn.textContent = T('Enviar y recibir propuesta', 'Send and get a proposal');
          const msg = code === 'limit'
            ? T('Has enviado varias solicitudes hoy. Escríbenos por WhatsApp y te atendemos al momento.', 'You have sent several requests today. Message us on WhatsApp and we will help you right away.')
            : T('No se ha podido enviar. Inténtalo de nuevo o escríbenos por WhatsApp.', 'It could not be sent. Try again or message us on WhatsApp.');
          showErr(esc(msg) + ` <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>`);
        };
        const ok = () => { sending = false; sent = true; step = STEPS.length; render(); };

        /* Antispam: si el envío es inhumanamente rápido o el campo trampa
           está relleno, se muestra el éxito pero no se envía nada. */
        if (form.website.value || Date.now() - bornAt < 3000) { setTimeout(ok, 600); return; }
        if (LOCAL && !window.ZYRA_API_TEST) { setTimeout(ok, 700); return; }
        fetch(API, { method: 'POST', body: data, headers: { Accept: 'application/json' }, credentials: 'same-origin' })
          .then(r => r.json().catch(() => ({})).then(d => (r.ok && d.ok ? ok() : fail(d.error))))
          .catch(() => fail());
      });
    };

    render();
    document.addEventListener('zyra:lang', () => setTimeout(render, 40));
  };

  const quizHost = $('#recomendador');
  if (quizHost) buildQuiz(quizHost);

  /* ── 3. Asistente: chat con texto libre (v10) ─────────
     · Entiende palabras completas (antes "Kilian" contenía "ia" y
       respondía sobre agentes de IA), raíces ("automatiz…") y erratas.
     · Sabe de servicios, precios, plazos, proceso, el equipo
       (Kilian, Ahmednah e Iker), contacto, idiomas, horario, SEO…
     · Cada respuesta va en español, inglés y árabe. */
  const norm = s => String(s).toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')            // tildes
    .replace(/[ً-ٰٟـ]/g, '') // marcas árabes (hamza, madda, tashkil, tatweel)
    .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي');
  const L3 = a => (window.ZYRA_LANG === 'ar' && a[2] ? a[2] : T(a[0], a[1]));
  const SOCIAL = $$('.footer .socials a[href]').map(a => [a.getAttribute('aria-label') || a.title || 'Link', a.href]);

  const BOT = {
    hello: ['Hola 👋 Soy el asistente de ZYRA. Pregúntame lo que quieras: servicios, precios, plazos, el equipo… o toca una sugerencia.',
            'Hi 👋 I am the ZYRA assistant. Ask me anything: services, prices, timings, the team… or tap a suggestion.',
            'مرحباً 👋 أنا مساعد ZYRA. اسألني ما تشاء: الخدمات، الأسعار، المدد، الفريق… أو اختر أحد الاقتراحات.'],
    lost: ['¿Me lo explicas con otras palabras? Puedo contarte qué hacemos, precios, plazos, quiénes somos o cómo trabajamos. Y si lo prefieres, te paso con una persona del equipo por WhatsApp.',
           'Could you put it another way? I can tell you what we do, prices, timings, who we are or how we work. Or, if you prefer, I can put you through to someone on the team via WhatsApp.',
           'هل يمكنك صياغتها بطريقة أخرى؟ أستطيع أن أخبرك بما نقدمه والأسعار والمدد ومن نحن وكيف نعمل. وإن أردت، أوصلك بأحد أعضاء الفريق عبر واتساب.'],
    placeholder: ['Escribe tu pregunta…', 'Type your question…', 'اكتب سؤالك…']
  };

  const INTENTS = [
    /* ── Equipo ── */
    { id: 'kilian', boost: 3, q: ['Quién es Kilian', 'Who is Kilian', 'من هو Kilian'],
      k: ['kilian', 'killian', 'kylian', 'barreto', 'kilian abraham', 'كيليان', 'كليان'],
      a: ['Kilian Abraham Barreto Mendoza es <b>cofundador de ZYRA</b> y se encarga de <b>Desarrollo y Producto</b>. Es desarrollador Full Stack: diseña y desarrolla productos digitales de principio a fin, de la idea a la puesta en producción. Ha creado digitalzyra.com y ahora desarrolla <b>Zyra</b>, una app para comprar directamente en comercios locales. Es Técnico Superior en DAW y Técnico en SMR, y trabaja con HTML, CSS, JavaScript, React, MySQL, C# y Photoshop.',
          'Kilian Abraham Barreto Mendoza is a <b>co-founder of ZYRA</b> and leads <b>Development & Product</b>. He is a full-stack developer who designs and builds digital products end to end, from the idea to going live. He built digitalzyra.com and is now developing <b>Zyra</b>, an app for buying directly from local shops. He holds diplomas in Web App Development (DAW) and IT Systems & Networks (SMR), and works with HTML, CSS, JavaScript, React, MySQL, C# and Photoshop.',
          'Kilian Abraham Barreto Mendoza هو <b>شريك مؤسس في ZYRA</b> ومسؤول عن <b>التطوير والمنتج</b>. مطوّر Full Stack يصمّم المنتجات الرقمية ويطوّرها من البداية إلى النهاية، من الفكرة حتى الإطلاق. أنشأ موقع digitalzyra.com ويعمل الآن على <b>Zyra</b>، تطبيق للشراء مباشرة من المتاجر المحلية. حاصل على شهادة تطوير تطبيقات الويب (DAW) وشهادة أنظمة الحاسوب والشبكات (SMR)، ويعمل بـ HTML وCSS وJavaScript وReact وMySQL وC# وPhotoshop.'],
      url: ['https://portfolio.kilianbarreto3.workers.dev', ['Ver el portfolio de Kilian', "See Kilian's portfolio", 'عرض أعمال Kilian']],
      next: ['ahmednah', 'iker', 'equipo', 'humano'] },
    { id: 'ahmednah', boost: 3, q: ['Quién es Ahmednah', 'Who is Ahmednah', 'من هو Ahmednah'],
      k: ['ahmednah', 'ahmedna', 'ahmed', 'ahmet', 'saleh', 'mohamed saleh', 'احمدناه', 'احمد'],
      a: ['Ahmednah Mohamed Saleh es <b>cofundador de ZYRA</b> y lleva <b>Diseño y Experiencia</b>. Es desarrollador full-stack con ojo para el diseño y la experiencia de usuario: construye webs y software a medida, y lleva esa mirada de producto a automatizaciones y agentes de IA que resuelven tareas de principio a fin. Es Técnico Superior en DAW y Técnico en SMR, y trabaja con HTML, CSS, JavaScript, Java, PHP, SQL y Git, en frontend, backend y UI/UX.',
          'Ahmednah Mohamed Saleh is a <b>co-founder of ZYRA</b> and leads <b>Design & Experience</b>. A full-stack developer with an eye for design and user experience, he builds websites and custom software and brings that product mindset to automations and AI agents that handle tasks end to end. He holds diplomas in DAW and SMR and works with HTML, CSS, JavaScript, Java, PHP, SQL and Git, across frontend, backend and UI/UX.',
          'Ahmednah Mohamed Saleh هو <b>شريك مؤسس في ZYRA</b> ومسؤول عن <b>التصميم والتجربة</b>. مطوّر full-stack بعين خبيرة في التصميم وتجربة المستخدم: يبني المواقع والبرمجيات المخصصة، وينقل الرؤية نفسها إلى الأتمتة ووكلاء الذكاء الاصطناعي الذين ينجزون المهام من البداية إلى النهاية. حاصل على شهادتي DAW وSMR، ويعمل بـ HTML وCSS وJavaScript وJava وPHP وSQL وGit في الواجهة الأمامية والخلفية وتصميم الواجهات وتجربة المستخدم.'],
      url: ['https://ahmednahdevui.github.io/', ['Ver el portfolio de Ahmednah', "See Ahmednah's portfolio", 'عرض أعمال Ahmednah']],
      next: ['kilian', 'iker', 'equipo', 'humano'] },
    { id: 'iker', boost: 3, q: ['Quién es Iker', 'Who is Iker', 'من هو Iker'],
      k: ['iker', 'ikker', 'alonso', 'armas', 'iker alonso', 'ايكر'],
      a: ['Iker Alonso Armas es <b>cofundador de ZYRA</b> y lleva <b>Automatización e IA</b>. Es desarrollador web especializado en soluciones impulsadas por inteligencia artificial: ha diseñado y desarrollado webs, aplicaciones con automatización inteligente y herramientas de búsqueda con IA para negocios, inmobiliarias, asesorías, academias de idiomas y sistemas de reserva de citas. Es Técnico Superior en DAW y Técnico en SMR, y trabaja con React, Node.js, Python, WordPress, Git y GitHub, entre otros.',
          'Iker Alonso Armas is a <b>co-founder of ZYRA</b> and leads <b>Automation & AI</b>. He is a web developer specialising in AI-powered solutions: he has designed and built websites, apps with intelligent automation and AI-based search tools for businesses, real estate agencies, consultancies, language academies and appointment booking systems. He holds diplomas in DAW and SMR and works with React, Node.js, Python, WordPress, Git and GitHub, among others.',
          'Iker Alonso Armas هو <b>شريك مؤسس في ZYRA</b> ومسؤول عن <b>الأتمتة والذكاء الاصطناعي</b>. مطوّر ويب متخصص في الحلول المدعومة بالذكاء الاصطناعي: صمّم وطوّر مواقع وتطبيقات بأتمتة ذكية وأدوات بحث تعتمد على الذكاء الاصطناعي للشركات والوكالات العقارية والاستشارات وأكاديميات اللغات وأنظمة حجز المواعيد. حاصل على شهادتي DAW وSMR، ويعمل بـ React وNode.js وPython وWordPress وGit وGitHub وغيرها.'],
      url: ['https://alons23.vercel.app/', ['Ver el portfolio de Iker', "See Iker's portfolio", 'عرض أعمال Iker']],
      next: ['kilian', 'ahmednah', 'equipo', 'humano'] },
    { id: 'equipo', boost: 1.6, q: ['Quiénes sois', 'Who you are', 'من أنتم'],
      k: ['quienes sois', 'quien sois', 'equipo', 'team', 'fundador', 'fundadores', 'socios', 'dueno', 'duenos', 'propietario', 'owner', 'ceo', 'jefe', 'quien esta detras', 'who are you guys', 'founders', 'who runs', 'من انتم', 'الفريق', 'فريق', 'المؤسس', 'المالك', 'المدير'],
      a: ['Somos tres, y siempre hablas directamente con quien desarrolla:<br>• <b>Ahmednah Mohamed Saleh</b> — Cofundador · Diseño y Experiencia<br>• <b>Kilian Abraham Barreto Mendoza</b> — Cofundador · Desarrollo y Producto<br>• <b>Iker Alonso Armas</b> — Cofundador · Automatización e IA<br>Pregúntame por cualquiera de ellos.',
          'There are three of us, and you always talk directly to the people who build it:<br>• <b>Ahmednah Mohamed Saleh</b> — Co-founder · Design & Experience<br>• <b>Kilian Abraham Barreto Mendoza</b> — Co-founder · Development & Product<br>• <b>Iker Alonso Armas</b> — Co-founder · Automation & AI<br>Ask me about any of them.',
          'نحن ثلاثة، وتتحدث دائماً مباشرة مع من يطوّر مشروعك:<br>• <b>Ahmednah Mohamed Saleh</b> — شريك مؤسس · التصميم والتجربة<br>• <b>Kilian Abraham Barreto Mendoza</b> — شريك مؤسس · التطوير والمنتج<br>• <b>Iker Alonso Armas</b> — شريك مؤسس · الأتمتة والذكاء الاصطناعي<br>اسألني عن أي واحد منهم.'],
      links: [['sobre', ['Conocer al equipo', 'Meet the team', 'تعرّف على الفريق']]],
      next: ['kilian', 'ahmednah', 'iker', 'humano'] },
    { id: 'about', q: ['Qué es ZYRA', 'What ZYRA is', 'ما هي ZYRA'],
      k: ['que es zyra', 'que es digital zyra', 'zyra', 'cira', 'zira', 'digital zyra', 'digitalzyra', 'vuestra agencia', 'la agencia', 'empresa', 'about you', 'what is zyra', 'زيرا', 'ما هي', 'الوكالة', 'الشركة'],
      a: ['<b>Digital Zyra (ZYRA)</b> es una agencia tecnológica especializada en desarrollo web, software a medida, automatización e inteligencia artificial. Ayudamos a pequeños y medianos negocios a resolver problemas reales con tecnología, sin venderles más de lo que necesitan: contratos claros, comunicación directa y presupuesto cerrado. Somos una agencia nueva y preferimos decirlo antes que inventar cifras.',
          '<b>Digital Zyra (ZYRA)</b> is a technology agency focused on web development, custom software, automation and artificial intelligence. We help small and medium businesses solve real problems with technology, without selling them more than they need: clear contracts, direct communication and fixed quotes. We are a new agency and would rather say so than make up numbers.',
          '<b>Digital Zyra (ZYRA)</b> وكالة تقنية متخصصة في تطوير المواقع والبرمجيات المخصصة والأتمتة والذكاء الاصطناعي. نساعد الشركات الصغيرة والمتوسطة على حل مشكلات حقيقية بالتكنولوجيا دون أن نبيعها أكثر مما تحتاج: عقود واضحة وتواصل مباشر وعرض سعر نهائي. نحن وكالة جديدة ونفضّل قول ذلك بدلاً من اختلاق الأرقام.'],
      next: ['equipo', 'serv', 'proceso', 'humano'] },
    { id: 'zyraapp', boost: 1.5, q: null,
      k: ['app zyra', 'zyra app', 'aplicacion zyra', 'app de zyra', 'comercios locales', 'comercio local', 'local shops', 'تطبيق زيرا', 'المتاجر المحلية'],
      a: ['<b>Zyra</b> es una app que está desarrollando Kilian, del equipo, para comprar directamente en comercios locales. Si tienes un negocio y te interesa estar en ella, escríbenos y te contamos.',
          '<b>Zyra</b> is an app that Kilian, from our team, is developing for buying directly from local shops. If you run a business and want to be on it, message us and we will tell you more.',
          '<b>Zyra</b> تطبيق يطوّره Kilian من فريقنا للشراء مباشرة من المتاجر المحلية. إن كان لديك نشاط تجاري وتهمّك المشاركة فيه، راسلنا وسنخبرك بالمزيد.'],
      wa: true, next: ['kilian', 'serv', 'humano'] },

    /* ── Servicios ── */
    { id: 'saludo', q: null,
      k: ['hola', 'buenas', 'hey', 'hello', 'hi', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'saludos'],
      a: ['¡Hola! Cuéntame qué necesitas para tu negocio y te oriento.',
          'Hi! Tell me what your business needs and I will point you in the right direction.'] },
    { id: 'gracias', q: null, k: ['gracias', 'thanks', 'thank you', 'genial', 'perfecto', 'vale', 'ok', 'okey'],
      a: ['A mandar 🙂 Si quieres seguir, dime qué parte te interesa más.',
          'Any time 🙂 If you want to keep going, tell me which part interests you most.'] },
    { id: 'despedida', q: null, k: ['adios', 'hasta luego', 'chao', 'chau', 'bye', 'goodbye', 'nos vemos', 'مع السلامة', 'وداعا', 'الى اللقاء'],
      a: ['¡Hasta pronto! Si te surge cualquier duda, aquí estaré 👋', 'See you soon! If anything comes up, I will be right here 👋', 'إلى اللقاء! إن خطر لك أي سؤال، سأكون هنا 👋'] },
    { id: 'serv', q: ['Qué hacéis', 'What you do'],
      k: ['que haceis', 'servicios', 'servicio', 'que ofreceis', 'a que os dedicais', 'que hacen', 'services', 'what do you do', 'offer'],
      a: ['Cuatro cosas: <b>webs</b>, <b>software a medida</b>, <b>automatización</b> de tareas y <b>agentes de IA</b> que atienden consultas. Suelen combinarse: una web con un agente detrás, o una app con sus procesos ya automatizados.',
          'Four things: <b>websites</b>, <b>custom software</b>, task <b>automation</b> and <b>AI agents</b> that handle enquiries. They usually combine: a site with an agent behind it, or an app with its processes automated.'],
      links: [['servicios', ['Ver todos los servicios', 'See all services', 'عرض جميع الخدمات']]] },
    { id: 'web', q: ['Quiero una web', 'I want a website'],
      k: ['web', 'webs', 'pagina', 'paginas', 'landing', 'website', 'site', 'rediseno', 'renovar mi web', 'corporativa'],
      a: ['Hacemos webs corporativas, páginas para negocios locales, landings y rediseños. Diseño a medida, responsive, SEO básico, dominio y SSL. Una esencial suele estar en 1–2 semanas y una avanzada en 3–5.',
          'We build corporate sites, local business pages, landings and redesigns. Custom design, responsive, basic SEO, domain and SSL. An essential one takes 1–2 weeks, an advanced one 3–5.'],
      link: 'web' },
    { id: 'tienda', boost: 1.3, q: null,
      k: ['tienda online', 'tienda', 'ecommerce', 'e-commerce', 'vender online', 'vender por internet', 'catalogo', 'carrito', 'online shop', 'sell online', 'متجر الكتروني', 'بيع', 'كتالوج', 'منتجات'],
      a: ['Sí. Con la <b>Web Avanzada</b> añadimos funcionalidades a medida: catálogos, reservas, áreas privadas… Si quieres vender online, cuéntanos qué productos tienes y cómo cobras, y te proponemos la mejor opción para tu caso.',
          'Yes. With the <b>Advanced Website</b> we add custom features: catalogues, bookings, private areas… If you want to sell online, tell us what you sell and how you take payments, and we will propose the best option for your case.',
          'نعم. مع <b>الموقع المتقدم</b> نضيف وظائف مخصصة: كتالوجات وحجوزات ومناطق خاصة… وإن أردت البيع عبر الإنترنت، أخبرنا بما تبيعه وكيف تستلم المدفوعات، وسنقترح عليك الخيار الأنسب لحالتك.'],
      link: 'web', next: ['precio', 'plazo', 'humano'] },
    { id: 'auto', boost: 1.3, q: ['Automatizar tareas', 'Automate tasks'],
      k: ['automatiz', 'automation', 'automate', 'zapier', 'make', 'n8n', 'integrar', 'integration', 'conectar', 'repetitiv', 'flujos'],
      a: ['Mapeamos las tareas que repetís, conectamos las herramientas que ya usáis y dejamos el flujo probado con datos reales antes de activarlo. Suele llevar de 1 a 3 semanas.',
          'We map the tasks you repeat, connect the tools you already use and test the flow with real data before switching it on. It usually takes 1 to 3 weeks.'],
      link: 'auto' },
    { id: 'voz', boost: 1.4, q: null,
      k: ['agente de voz', 'agentes de voz', 'voz', 'llamadas', 'atender llamadas', 'coger el telefono', 'contestar llamadas', 'centralita', 'voice', 'calls', 'phone agent', 'مكالمات', 'صوتي', 'يرد على المكالمات'],
      a: ['Sí: además de chatbots para web y WhatsApp, montamos <b>agentes de voz</b> que atienden llamadas, responden las preguntas habituales y gestionan reservas, con reglas claras de cuándo pasar la llamada a una persona.',
          'Yes: besides chatbots for your website and WhatsApp, we build <b>voice agents</b> that answer calls, handle the usual questions and manage bookings, with clear rules for when to pass the call to a person.',
          'نعم: إلى جانب روبوتات المحادثة للموقع وواتساب، نبني <b>وكلاء صوتيين</b> يردّون على المكالمات ويجيبون عن الأسئلة المعتادة ويديرون الحجوزات، مع قواعد واضحة لتحويل المكالمة إلى شخص عند الحاجة.'],
      link: 'ia', next: ['precio', 'plazo', 'humano'] },
    { id: 'ia', q: ['Agentes de IA', 'AI agents'],
      k: ['ia', 'inteligencia artificial', 'chatbot', 'chatbots', 'bot', 'agente', 'agentes', 'ai', 'gpt', 'chatgpt', 'whatsapp bot', 'asistente virtual'],
      a: ['Montamos agentes entrenados con tu información real, integrados en web y WhatsApp, con reglas claras de cuándo derivar a una persona. De 2 a 4 semanas.',
          'We build agents trained on your real information, integrated into your site and WhatsApp, with clear rules for handing off to a person. 2 to 4 weeks.'],
      link: 'ia', next: ['voz', 'precio', 'humano'] },
    { id: 'soft', q: ['Software a medida', 'Custom software'],
      k: ['software', 'aplicacion', 'aplicaciones', 'app', 'apps', 'crm', 'erp', 'gestion', 'programa', 'interno', 'inventario'],
      a: ['Aplicaciones construidas alrededor de tu proceso: gestión, clientes, reservas, inventario. Se desarrolla por fases para que puedas usar lo primero antes de tener lo último. Desde 4 semanas.',
          'Apps built around your process: management, clients, bookings, inventory. Developed in phases so you can use the first part before the last one exists. From 4 weeks.'],
      link: 'soft' },
    { id: 'reservas', boost: 1.3, q: null,
      k: ['reservas', 'reserva', 'citas', 'cita previa', 'booking', 'bookings', 'appointments', 'agenda', 'حجز', 'حجوزات', 'مواعيد'],
      a: ['Lo resolvemos de varias formas: reservas o citas en tu web (Web Avanzada), una app a medida para gestionarlas, o un <b>agente de IA</b> que atiende y reserva solo, por web, WhatsApp o teléfono.',
          'We solve it in several ways: bookings or appointments on your website (Advanced Website), a custom app to manage them, or an <b>AI agent</b> that answers and books on its own, via your site, WhatsApp or phone.',
          'نحلّها بعدة طرق: حجوزات أو مواعيد على موقعك (الموقع المتقدم)، أو تطبيق مخصص لإدارتها، أو <b>وكيل ذكاء اصطناعي</b> يرد ويحجز وحده عبر الموقع أو واتساب أو الهاتف.'],
      link: 'ia', next: ['web', 'soft', 'precio'] },
    { id: 'sectores', q: null,
      k: ['restaurante', 'restaurantes', 'bar', 'cafeteria', 'peluqueria', 'barberia', 'clinica', 'dentista', 'gimnasio', 'inmobiliaria', 'asesoria', 'academia', 'hotel', 'negocio local', 'mi negocio', 'pyme', 'autonomo', 'sector', 'restaurant', 'salon', 'clinic', 'small business', 'مطعم', 'صالون', 'عيادة', 'عقار', 'اكاديمية', 'قطاع'],
      a: ['Trabajamos con negocios de todo tipo: restaurantes, peluquerías, clínicas, tiendas, asesorías, inmobiliarias, academias… Lo importante no es el sector, sino qué problema quieres resolver: más clientes, menos tareas a mano o atender mejor. Cuéntamelo y te digo por dónde empezaríamos.',
          'We work with all kinds of businesses: restaurants, hair salons, clinics, shops, consultancies, real estate agencies, academies… What matters is not the sector but the problem you want to solve: more customers, fewer manual tasks or better service. Tell me and I will say where we would start.',
          'نعمل مع جميع أنواع الأعمال: مطاعم وصالونات تجميل وعيادات ومتاجر واستشارات ووكالات عقارية وأكاديميات… المهم ليس القطاع بل المشكلة التي تريد حلها: عملاء أكثر، أو مهام يدوية أقل، أو خدمة أفضل. أخبرني وسأقول لك من أين نبدأ.'],
      next: ['quiz', 'serv', 'humano'] },

    /* ── Dinero, plazos y condiciones ── */
    { id: 'precio', q: ['Cuánto cuesta', 'How much it costs'],
      k: ['precio', 'precios', 'cuesta', 'cuestan', 'cuanto vale', 'cuanto sale', 'presupuesto', 'tarifa', 'tarifas', 'coste', 'barato', 'caro', 'price', 'prices', 'cost', 'budget', 'quote'],
      a: ['No publicamos tarifas cerradas porque el precio depende del alcance real. Nos cuentas qué necesitas y te pasamos un presupuesto cerrado, sin partidas abiertas ni sorpresas.',
          'We do not publish fixed rates because the price depends on the real scope. Tell us what you need and we send a closed quote, with no open items and no surprises.'], wa: true },
    { id: 'pago', boost: 1, q: null,
      k: ['pagar', 'pago', 'pagos', 'forma de pago', 'como se paga', 'factura', 'facturas', 'a plazos', 'mensualidad', 'payment', 'pay', 'invoice', 'دفع', 'الدفع', 'فاتورة', 'اقساط'],
      a: ['Depende del servicio: los proyectos cerrados suelen dividirse en un pago inicial y otro a la entrega; el mantenimiento y la automatización recurrente se facturan mensualmente.',
          'It depends on the service: fixed projects are usually split into an upfront payment and one on delivery; maintenance and recurring automation are billed monthly.',
          'يعتمد ذلك على الخدمة: المشاريع المغلقة تُقسَّم عادةً إلى دفعة أولى ودفعة عند التسليم، أما الصيانة والأتمتة المستمرة فتُفوتَر شهرياً.'],
      next: ['precio', 'perma', 'humano'] },
    { id: 'plazo', q: ['Cuánto tarda', 'How long it takes'],
      k: ['tarda', 'tardais', 'plazo', 'plazos', 'tiempo', 'cuando', 'rapido', 'urgente', 'semanas', 'how long', 'timeline', 'deadline'],
      a: ['Web esencial 1–2 semanas · web avanzada 3–5 · automatización 1–3 · agente de IA 2–4 · software a medida desde 4, según alcance.',
          'Essential website 1–2 weeks · advanced 3–5 · automation 1–3 · AI agent 2–4 · custom software from 4, depending on scope.'] },
    { id: 'cambios', boost: 1.2, q: null,
      k: ['cambios', 'cambiar', 'modificar', 'modificaciones', 'revisiones', 'alcance cambia', 'cambia el alcance', 'changes', 'revisions', 'scope', 'تغيير', 'تعديل', 'تعديلات'],
      a: ['Si el alcance cambia a mitad de proyecto, lo hablamos y ajustamos presupuesto y plazos antes de seguir: nunca se añade trabajo extra sin que lo sepas de antemano.',
          'If the scope changes mid-project, we talk it through and adjust the quote and timeline before going on: extra work is never added without you knowing beforehand.',
          'إذا تغيّر نطاق المشروع في منتصفه، نتحدث ونعدّل السعر والمدة قبل المتابعة: لا يُضاف أي عمل إضافي دون علمك المسبق.'] },
    { id: 'perma', q: ['Hay permanencia', 'Any lock-in'],
      k: ['permanencia', 'contrato', 'cancelar', 'baja', 'mantenimiento', 'lock', 'cancel', 'maintenance'],
      a: ['Ninguna permanencia. El mantenimiento es mensual y se deja cuando quieras, y el dominio y el hosting quedan siempre a tu nombre.',
          'No lock-in. Maintenance is monthly and you can stop whenever you want, and the domain and hosting are always in your name.'] },
    { id: 'soporte', boost: 1.2, q: null,
      k: ['soporte', 'despues de entregar', 'tras la entrega', 'garantia', 'incidencia', 'incidencias', 'error', 'fallo', 'se rompe', 'support', 'after delivery', 'warranty', 'bug', 'بعد التسليم', 'ضمان', 'مشكلة', 'عطل'],
      a: ['Sí, damos soporte después de entregar con los planes de mantenimiento (sin permanencia). Sin plan, seguimos disponibles para incidencias puntuales, que se facturan aparte.',
          'Yes, we provide support after delivery with our maintenance plans (no lock-in). Without a plan, we are still available for one-off issues, billed separately.',
          'نعم، نقدّم الدعم بعد التسليم عبر خطط الصيانة (دون التزام). ومن دون خطة، نبقى متاحين للأعطال العرضية التي تُفوتَر بشكل منفصل.'] },
    { id: 'dominio', q: null,
      k: ['dominio', 'hosting', 'alojamiento', 'servidor', 'domain', 'server'],
      a: ['Podemos configurarlo nosotros o trabajar sobre el que ya tengas. En ambos casos las cuentas quedan a tu nombre: la web es tuya, no nuestra.',
          'We can set it up or work with what you already have. Either way the accounts are in your name: the site is yours, not ours.'] },
    { id: 'seo', boost: 1.2, q: null,
      k: ['seo', 'google', 'posicionamiento', 'posicionar', 'aparecer en google', 'buscadores', 'search engine', 'ranking', 'جوجل', 'غوغل', 'محركات البحث'],
      a: ['Todas nuestras webs salen con <b>rendimiento y SEO básico</b>: carga rápida, estructura y títulos correctos, metadatos, sitemap y datos estructurados para Google. Esta misma web está hecha así, y en tres idiomas.',
          'Every website we build ships with <b>performance and basic SEO</b>: fast loading, proper structure and headings, metadata, a sitemap and structured data for Google. This very site is built that way, in three languages.',
          'كل المواقع التي نبنيها تأتي مع <b>أداء عالٍ وتحسين أساسي لمحركات البحث (SEO)</b>: تحميل سريع، وبنية وعناوين صحيحة، وبيانات وصفية، وخريطة موقع، وبيانات منظَّمة لـ Google. وهذا الموقع نفسه مبني بهذه الطريقة وبثلاث لغات.'],
      link: 'web' },
    { id: 'tecno', boost: 1.2, q: ['Con qué tecnologías', 'Which technologies', 'ما التقنيات'],
      k: ['tecnologia', 'tecnologias', 'lenguaje', 'lenguajes', 'stack', 'framework', 'react', 'next', 'nextjs', 'wordpress', 'php', 'python', 'javascript', 'node', 'nodejs', 'figma', 'technology', 'technologies', 'تقنيات', 'تقنية', 'لغات البرمجة', 'برمجة'],
      a: ['Elegimos la tecnología según el proyecto, no al revés. El equipo trabaja con HTML, CSS, JavaScript, React, Node.js, PHP, Python, Java, C#, SQL/MySQL, WordPress, Git y GitHub, y diseña con Figma y Photoshop. En webs solemos usar HTML/CSS/JS, o React y Next.js cuando el proyecto lo pide.',
          'We pick the technology for the project, not the other way round. The team works with HTML, CSS, JavaScript, React, Node.js, PHP, Python, Java, C#, SQL/MySQL, WordPress, Git and GitHub, and designs in Figma and Photoshop. For websites we usually use HTML/CSS/JS, or React and Next.js when the project calls for it.',
          'نختار التقنية بحسب المشروع وليس العكس. يعمل الفريق بـ HTML وCSS وJavaScript وReact وNode.js وPHP وPython وJava وC# وSQL/MySQL وWordPress وGit وGitHub، ويصمّم بـ Figma وPhotoshop. في المواقع نستخدم عادةً HTML/CSS/JS، أو React وNext.js عندما يتطلب المشروع ذلك.'] },
    { id: 'diseno', q: null,
      k: ['diseno', 'disenos', 'logo', 'logotipo', 'branding', 'identidad', 'plantilla', 'plantillas', 'design', 'template', 'تصميم', 'شعار', 'لوجو', 'هوية'],
      a: ['Diseñamos cada web a medida, sin plantillas cerradas, cuidando la imagen de tu marca y que funcione igual de bien en móvil. Si además necesitas logo o identidad visual, coméntanoslo y vemos cómo encajarlo en el proyecto.',
          'We design every website from scratch, with no locked templates, looking after your brand image and making sure it works just as well on mobile. If you also need a logo or visual identity, let us know and we will see how to fit it into the project.',
          'نصمّم كل موقع حسب الطلب دون قوالب جاهزة، مع الاهتمام بصورة علامتك التجارية وبأن يعمل بالجودة نفسها على الهاتف. وإن احتجت أيضاً إلى شعار أو هوية بصرية، أخبرنا وسنرى كيف ندمجها في المشروع.'],
      link: 'web' },
    { id: 'proceso', boost: 1.2, q: ['Cómo trabajáis', 'How you work', 'كيف تعملون'],
      k: ['como trabajais', 'como trabajan', 'proceso', 'pasos', 'metodologia', 'fases', 'como funciona', 'how do you work', 'process', 'steps', 'كيف تعملون', 'العملية', 'خطوات', 'مراحل', 'طريقة العمل'],
      a: ['Siempre el mismo camino, en cuatro pasos:<br><b>1. Cuéntanos</b> qué falla hoy y qué quieres cambiar.<br><b>2. Analizamos</b> alcance, tecnología y plazos, y te lo contamos antes de empezar.<br><b>3. Diseñamos y desarrollamos</b> por fases, enseñándote avances.<br><b>4. Lanzamos y mejoramos</b> con el uso real.',
          'Always the same path, in four steps:<br><b>1. Tell us</b> what is not working and what you want to change.<br><b>2. We analyse</b> scope, technology and timings, and share it before anything starts.<br><b>3. We design and build</b> in phases, showing you progress.<br><b>4. We launch and improve</b> based on real use.',
          'دائماً الطريق نفسه، في أربع خطوات:<br><b>1. أخبرنا</b> بما لا يعمل اليوم وما تريد تغييره.<br><b>2. نحلّل</b> النطاق والتقنية والمدة ونشاركك ذلك قبل البدء.<br><b>3. نصمّم ونطوّر</b> على مراحل ونعرض عليك التقدم.<br><b>4. نطلق ونحسّن</b> بناءً على الاستخدام الحقيقي.'],
      links: [['como', ['Ver el proceso al detalle', 'See the process in detail', 'عرض العملية بالتفصيل']]] },
    { id: 'portfolio', q: null,
      k: ['portfolio', 'portafolio', 'proyectos', 'trabajos', 'ejemplos', 'experiencia', 'clientes', 'confianza', 'fiable', 'projects', 'examples', 'experience', 'اعمال', 'مشاريع', 'خبرة', 'امثلة'],
      a: ['Somos una agencia nueva y preferimos ser claros: no inflamos cifras. Puedes ver nuestro trabajo en esta misma web, en la app Zyra que estamos desarrollando y en los portfolios de cada miembro del equipo, enlazados en «Sobre nosotros».',
          'We are a new agency and would rather be upfront: we do not inflate numbers. You can see our work in this very website, in the Zyra app we are developing and in each team member\'s portfolio, linked on the "About us" page.',
          'نحن وكالة جديدة ونفضّل الوضوح: لا نضخّم الأرقام. يمكنك رؤية عملنا في هذا الموقع نفسه، وفي تطبيق Zyra الذي نطوّره، وفي أعمال كل عضو في الفريق المرتبطة في صفحة «من نحن».'],
      links: [['sobre', ['Ver el equipo y sus portfolios', 'See the team and their portfolios', 'عرض الفريق وأعمالهم']]], next: ['resenas', 'equipo', 'humano'] },
    { id: 'resenas', boost: 1.2, q: ['Ver reseñas', 'See reviews', 'عرض التقييمات'],
      k: ['resena', 'resenas', 'opinion', 'opiniones', 'valoracion', 'valoraciones', 'testimonios', 'review', 'reviews', 'تقييم', 'تقييمات', 'اراء'],
      a: ['Las reseñas de nuestros clientes están en la sección <b>Reseñas</b> de la página de inicio. Si ya has trabajado con nosotros, puedes escribir la tuya allí y se publica al momento. Te llevo.',
          'Our clients\' reviews are in the <b>Reviews</b> section of the home page. If you have already worked with us, you can write yours there and it is published straight away. Let me take you there.',
          'تقييمات عملائنا موجودة في قسم <b>التقييمات</b> في الصفحة الرئيسية. إن كنت قد عملت معنا، يمكنك كتابة تقييمك هناك ويُنشر فوراً. سآخذك إليه.'],
      go: 'reviews' },

    /* ── Contacto y datos prácticos ── */
    { id: 'quiz', q: ['No sé qué necesito', 'I do not know what I need'],
      k: ['no se', 'no lo tengo claro', 'ayuda', 'ayudame', 'recomienda', 'recomiendas', 'recomendacion', 'orientar', 'not sure', 'help me choose', 'recommend'],
      a: ['Para eso está el recomendador: cuatro preguntas y te decimos por dónde empezaríamos. Te llevo.',
          'That is what the recommender is for: four questions and we tell you where we would start. Let me take you there.'], go: 'quiz' },
    { id: 'cita', boost: 1.3, q: null,
      k: ['agendar', 'cita', 'reunion', 'llamada', 'videollamada', 'quedar', 'meeting', 'appointment', 'schedule a call', 'book a call', 'موعد', 'اجتماع', 'مكالمة فيديو'],
      a: ['Puedes pedir una llamada en el formulario de contacto, en la pestaña <b>Agendar cita</b>: eliges día y franja y te confirmamos por WhatsApp o email. Si lo prefieres, escríbenos directamente por WhatsApp. Te llevo al formulario.',
          'You can request a call in the contact form, on the <b>Book a call</b> tab: pick a day and time slot and we confirm by WhatsApp or email. If you prefer, message us directly on WhatsApp. Let me take you to the form.',
          'يمكنك طلب مكالمة من نموذج التواصل، في تبويب <b>حجز موعد</b>: تختار اليوم والفترة ونؤكد لك عبر واتساب أو البريد. وإن فضّلت، راسلنا مباشرة على واتساب. سآخذك إلى النموذج.'],
      go: 'cita', wa: true },
    { id: 'donde', q: null,
      k: ['donde estais', 'donde estan', 'ubicacion', 'ubicados', 'direccion', 'oficina', 'ciudad', 'espana', 'canarias', 'tenerife', 'remoto', 'presencial', 'where are you', 'location', 'based', 'office', 'اين', 'مكان', 'موقعكم', 'اسبانيا', 'عن بعد'],
      a: ['Somos una agencia digital con sede en España y trabajamos en remoto, así que atendemos a negocios de cualquier lugar. Las reuniones son por videollamada, teléfono o WhatsApp.',
          'We are a digital agency based in Spain and we work remotely, so we serve businesses anywhere. Meetings happen by video call, phone or WhatsApp.',
          'نحن وكالة رقمية مقرها إسبانيا ونعمل عن بُعد، لذلك نخدم الأعمال في أي مكان. تكون الاجتماعات عبر مكالمة فيديو أو الهاتف أو واتساب.'] },
    { id: 'horario', q: null,
      k: ['horario', 'horarios', 'a que hora', 'hora', 'abierto', 'abris', 'atendeis', 'fin de semana', 'opening hours', 'hours', 'open', 'ساعات', 'الدوام', 'مفتوح', 'اوقات'],
      a: ['Atendemos de lunes a viernes, de 9:00 a 19:00. WhatsApp y el formulario están abiertos siempre y respondemos en menos de 24 horas laborables.',
          'We are available Monday to Friday, 9:00 to 19:00. WhatsApp and the form are always open, and we reply within 24 working hours.',
          'نعمل من الاثنين إلى الجمعة، من 9:00 إلى 19:00. واتساب والنموذج متاحان دائماً ونرد خلال 24 ساعة عمل.'] },
    { id: 'idiomas', q: null,
      k: ['idioma', 'idiomas', 'ingles', 'arabe', 'espanol', 'english', 'arabic', 'spanish', 'language', 'languages', 'لغة', 'لغات', 'العربية', 'الانجليزية', 'الاسبانية'],
      a: ['Atendemos en <b>español, inglés y árabe</b>, y la web también está en los tres idiomas. Si tu proyecto necesita varios idiomas, lo montamos igual que esta.',
          'We work in <b>Spanish, English and Arabic</b>, and this website is in all three languages too. If your project needs several languages, we build it the same way.',
          'نتعامل باللغات <b>الإسبانية والإنجليزية والعربية</b>، والموقع أيضاً متوفر باللغات الثلاث. وإن احتاج مشروعك إلى عدة لغات، نبنيه بالطريقة نفسها.'] },
    { id: 'redes', q: null,
      k: ['redes', 'redes sociales', 'instagram', 'insta', 'tiktok', 'linkedin', 'social', 'انستغرام', 'تيك توك', 'لينكدان', 'شبكات'],
      a: ['Nos encuentras en Instagram, TikTok y LinkedIn. Para hablar de un proyecto, lo más rápido es WhatsApp.',
          'You can find us on Instagram, TikTok and LinkedIn. To talk about a project, WhatsApp is the fastest way.',
          'تجدنا على Instagram وTikTok وLinkedIn. وللحديث عن مشروع، فإن واتساب هو الأسرع.'],
      social: true },
    { id: 'legal', q: null,
      k: ['privacidad', 'datos personales', 'rgpd', 'lopd', 'cookies', 'aviso legal', 'privacy', 'gdpr', 'خصوصية', 'الخصوصية', 'بيانات', 'كوكيز'],
      a: ['Todo lo relativo a tus datos y a las cookies está explicado en la política de privacidad y en la de cookies.',
          'Everything about your data and cookies is explained in our privacy and cookie policies.',
          'كل ما يتعلق ببياناتك وملفات تعريف الارتباط موضّح في سياسة الخصوصية وسياسة ملفات تعريف الارتباط.'],
      links: [['privacidad', ['Política de privacidad', 'Privacy policy', 'سياسة الخصوصية']], ['cookies', ['Política de cookies', 'Cookie policy', 'سياسة ملفات تعريف الارتباط']]] },
    { id: 'bot', boost: 1.5, q: null,
      k: ['quien eres', 'que eres', 'eres un bot', 'eres una ia', 'eres humano', 'eres real', 'como te llamas', 'who are you', 'are you a bot', 'are you human', 'من انت', 'هل انت بوت', 'هل انت روبوت'],
      a: ['Soy el asistente de ZYRA. Conozco los servicios, precios y plazos, cómo trabajamos y al equipo. Si algo no lo sé, te paso con una persona por WhatsApp.',
          'I am the ZYRA assistant. I know our services, prices and timings, how we work and the team. If there is something I do not know, I will put you through to a person on WhatsApp.',
          'أنا مساعد ZYRA. أعرف خدماتنا وأسعارنا ومددنا وطريقة عملنا والفريق. وإن لم أعرف شيئاً، أوصلك بشخص من الفريق عبر واتساب.'] },
    { id: 'humano', q: ['Hablar con una persona', 'Talk to a person'],
      k: ['persona', 'humano', 'hablar', 'llamar', 'telefono', 'numero', 'whatsapp', 'contacto', 'contactar', 'email', 'correo', 'mail', 'human', 'call', 'contact', 'phone'],
      a: ['Claro. Por WhatsApp es lo más rápido y te contesta uno de los tres, no un formulario: <b>+34 643 41 24 54</b>. También puedes escribirnos a <a href="mailto:zyradigitalpersonal@gmail.com">zyradigitalpersonal@gmail.com</a>.',
          'Of course. WhatsApp is fastest, and one of the three of us replies, not a form: <b>+34 643 41 24 54</b>. You can also email us at <a href="mailto:zyradigitalpersonal@gmail.com">zyradigitalpersonal@gmail.com</a>.',
          'بالتأكيد. واتساب هو الأسرع ويرد عليك أحدنا الثلاثة وليس نموذجاً: <b dir="ltr">+34 643 41 24 54</b>. ويمكنك أيضاً مراسلتنا على <a href="mailto:zyradigitalpersonal@gmail.com">zyradigitalpersonal@gmail.com</a>.'],
      wa: true }
  ];

  if (window.ZYRA_AR_KEYS) INTENTS.forEach(n => { (window.ZYRA_AR_KEYS[n.id] || []).forEach(k => n.k.push(k)); });
  INTENTS.forEach(n => { n.kn = n.k.map(norm); });

  const CHIPS = ['serv', 'precio', 'plazo', 'equipo', 'quiz', 'humano'];

  const bot = document.createElement('div');
  bot.className = 'bot';
  bot.innerHTML = `
    <div class="bot__panel" id="botPanel" hidden>
      <div class="bot__head">
        <span class="bot__avatar"><img src="${root}assets/img/zyra-simbolo-128.webp" alt="" width="18" height="17"></span>
        <span class="bot__who"><strong>${T('Asistente de ZYRA', 'ZYRA assistant')}</strong><span>${T('Responde al momento', 'Replies instantly')}</span></span>
        <button class="bot__x" type="button" id="botClose" aria-label="${T('Cerrar', 'Close')}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="bot__log" id="botLog" role="log" aria-live="polite"></div>
      <div class="bot__quick" id="botQuick"></div>
      <form class="bot__form" id="botForm" autocomplete="off">
        <input class="bot__input" id="botInput" type="text" placeholder="${L3(BOT.placeholder)}" aria-label="${T('Mensaje', 'Message')}">
        <button class="bot__send" type="submit" aria-label="${T('Enviar', 'Send')}" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h13M11.5 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>
    <button class="bot__btn" id="botBtn" type="button" aria-expanded="false" aria-label="${T('Abrir el asistente', 'Open the assistant')}">
      <span class="bot__dot" aria-hidden="true"></span>
      <svg class="bot__ring" viewBox="0 0 100 100" aria-hidden="true">
        <defs><path id="botCircle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"></path></defs>
        <text><textPath href="#botCircle" xlink:href="#botCircle" startOffset="0%">${T('ZYRA · PREGÚNTAME · ', 'ZYRA · ASK ME · ').repeat(2)}</textPath></text>
      </svg>
      <svg class="bot__ico bot__ico--chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2a2.6 2.6 0 0 1-2.6 2.6H8.4L4 21V6.4A2.6 2.6 0 0 1 6.6 3.8h10.8A2.6 2.6 0 0 1 20 6.4Z"/></svg>
      <svg class="bot__ico bot__ico--close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>`;
  document.body.appendChild(bot);

  const panel = $('#botPanel', bot), log = $('#botLog', bot), quick = $('#botQuick', bot);
  const btn = $('#botBtn', bot), form = $('#botForm', bot), input = $('#botInput', bot);
  const send = $('.bot__send', bot);
  let botOpen = false, started = false;

  const toBottom = () => { log.scrollTo({ top: log.scrollHeight, behavior: REDUCED ? 'auto' : 'smooth' }); };

  const bubble = (text, who) => {
    const row = document.createElement('div');
    row.className = 'msg-row msg-row--' + who;
    row.innerHTML = who === 'bot'
      ? `<span class="msg-av" aria-hidden="true"><img src="${root}assets/img/zyra-simbolo-128.webp" alt="" width="13" height="12"></span><div class="msg msg--bot">${text}</div>`
      : `<div class="msg msg--me">${text}</div>`;
    log.appendChild(row);
    if (ANIMATE) gsap.from(row, { y: 14, scale: 0.94, opacity: 0, duration: 0.42, ease: 'back.out(1.6)' });
    toBottom();
    return row;
  };

  const typing = () => {
    const row = document.createElement('div');
    row.className = 'msg-row msg-row--bot';
    row.innerHTML = `<span class="msg-av" aria-hidden="true"><img src="${root}assets/img/zyra-simbolo-128.webp" alt="" width="13" height="12"></span><div class="msg msg--bot msg--typing"><i></i><i></i><i></i></div>`;
    log.appendChild(row);
    toBottom();
    return row;
  };

  /* Icono de cada sugerencia (mismo trazo que el resto de iconos de la web) */
  const CHIP_ICO = {
    serv:   '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    precio: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.7 6.7a1.4 1.4 0 0 1-2 0Z"/><circle cx="8.2" cy="8.2" r="1.4"/>',
    plazo:  '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    quiz:   '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.6M12 16.6v.1"/>',
    perma:  '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 6.8-1.2"/>',
    humano: '<path d="M20 15.2a2.6 2.6 0 0 1-2.6 2.6H8.4L4 21V6.4A2.6 2.6 0 0 1 6.6 3.8h10.8A2.6 2.6 0 0 1 20 6.4Z"/>',
    _:      '<path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5"/>'
  };

  const setChips = ids => {
    quick.innerHTML = '';
    const nodes = ids.map(id => INTENTS.find(n => n.id === id)).filter(n => n && n.q);
    /* WhatsApp siempre al final y a todo el ancho; si el resto queda impar,
       la última también ocupa la fila entera para que no quede un hueco */
    nodes.sort((a, b) => (a.wa && a.id === 'humano') - (b.wa && b.id === 'humano'));
    const normal = nodes.filter(n => n.id !== 'humano');
    nodes.forEach(n => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<span class="bq__ico" aria-hidden="true"><svg viewBox="0 0 24 24">${CHIP_ICO[n.id] || CHIP_ICO._}</svg></span><span class="bq__txt"></span>`;
      $('.bq__txt', b).textContent = L3(n.q);
      if (n.id === 'humano') b.classList.add('is-wa');
      else if (normal.length % 2 && n === normal[normal.length - 1]) b.classList.add('is-wide');
      b.addEventListener('click', () => { bubble(L3(n.q), 'me'); reply(n); });
      quick.appendChild(b);
    });
    if (ANIMATE) gsap.from($$('button', quick), { y: 10, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power3.out' });
    /* Las sugerencias quitan alto al chat: se recoloca para que la última
       pregunta y su respuesta se lean desde el principio */
    requestAnimationFrame(() => {
      const mine = $$('.msg-row--me', log);
      const last = mine[mine.length - 1];
      if (!last) { toBottom(); return; }
      const top = last.getBoundingClientRect().top - log.getBoundingClientRect().top + log.scrollTop - 10;
      log.scrollTo({ top: Math.min(top, log.scrollHeight), behavior: REDUCED ? 'auto' : 'smooth' });
    });
  };

  /* Lleva a una sección (en esta página si existe; si no, a la página que la tiene) */
  const goSection = (sel, page, hash, before) => {
    const el = $(sel);
    setTimeout(() => {
      if (el) {
        toggle(false);
        if (before) before();
        el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      } else {
        window.location.href = URL_OF(page) + hash;
      }
    }, 900);
  };

  const reply = (node, extra) => {
    quick.innerHTML = '';
    const t = typing();
    const wait = 380 + Math.min(L3(node.a).length * 3, 700);
    setTimeout(() => {
      t.remove();
      bubble(L3(node.a), 'bot');
      /* Si la pregunta también pedía precio o plazo ("¿cuánto cuesta un agente?"), se añade */
      if (extra) bubble(L3(extra.a), 'bot');
      if (node.link) {
        bubble(`<a href="${URL_OF(node.link)}">${T('Ver la página del servicio', 'See the service page')}</a>`, 'bot');
      }
      (node.links || []).forEach(([k, label]) => bubble(`<a href="${URL_OF(k)}">${L3(label)}</a>`, 'bot'));
      if (node.url) bubble(`<a href="${node.url[0]}" target="_blank" rel="noopener">${L3(node.url[1])}</a>`, 'bot');
      if (node.social && SOCIAL.length) {
        bubble(SOCIAL.map(([n, h]) => `<a href="${h}" target="_blank" rel="noopener">${n}</a>`).join(' · '), 'bot');
      }
      if (node.wa || (extra && extra.wa)) {
        bubble(`<a href="${WA}" target="_blank" rel="noopener">${T('Abrir WhatsApp', 'Open WhatsApp')}</a>`, 'bot');
      }
      if (node.go === 'quiz') goSection('#recomendador', 'contacto', '#recomendador');
      if (node.go === 'reviews') goSection('[data-reviews]', 'home', '#opiniones');
      if (node.go === 'cita') goSection('.forms', 'contacto', '#formulario', () => { const tab = $('#tab-cita'); if (tab) tab.click(); });
      const nextIds = (node.next || CHIPS).filter(id => id !== node.id);
      setChips(nextIds.slice(0, 5));
    }, wait);
  };

  /* ── Comprensión: palabras completas, raíces y erratas ── */
  const lev = (a, b) => {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = d[0]; d[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    let dist = d[b.length];
    /* "kilain" → "kilian": dos letras cambiadas de sitio cuentan como una errata */
    if (dist === 2 && a.length === b.length) {
      const diff = [];
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
      if (diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]) dist = 1;
    }
    return dist;
  };
  const LATIN = /^[\x00-\x7f]+$/;
  /* Devuelve [puntos, palabra que coincide]: así dos claves parecidas
     ("factura" y "facturas") no cuentan dos veces la misma palabra */
  const hit = (k, toks, flat) => {
    if (!k) return [0];
    if (!LATIN.test(k)) return flat.includes(k) ? [k.includes(' ') ? 3 : 2, 'ar:' + k] : [0];   // árabe: por subcadena (prefijos ال، و، ب…)
    if (k.includes(' ')) return flat.includes(' ' + k + ' ') ? [3, 'ph:' + k] : [0];            // frases
    const w = k.length > 4 ? 2 : 1;
    for (const t of toks) {
      if (t === k || t === k + 's' || t === k + 'es') return [w, t];
      if (k.length >= 4 && t.startsWith(k)) return [w, t];                              // raíces: automatiz → automatizar
      if (k.length >= 5 && t.length >= 5 && lev(t, k) <= (k.length >= 8 ? 2 : 1)) return [w * 0.8, t];   // erratas
    }
    return [0];
  };
  const rank = text => {
    const toks = norm(text).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    const flat = ' ' + toks.join(' ') + ' ';
    return INTENTS.map(n => {
      const best = {};
      n.kn.forEach(k => {
        const [p, tok] = hit(k, toks, flat);
        if (p && (!best[tok] || p > best[tok])) best[tok] = p;
      });
      const s = Object.values(best).reduce((a, b) => a + b, 0);
      return { n, s: s * (n.boost || 1) };
    }).filter(r => r.s > 0).sort((x, y) => y.s - x.s);
  };

  const submit = text => {
    const clean = text.trim();
    if (!clean) return;
    bubble(clean.replace(/[<>]/g, ''), 'me');
    input.value = '';
    send.disabled = true;
    const r = rank(clean);
    if (r.length) {
      const best = r[0].n;
      const ask = r.slice(1).find(x => (x.n.id === 'precio' || x.n.id === 'plazo') && x.s >= 1);
      reply(best, ask && best.id !== 'pago' ? ask.n : null);
      return;
    }
    quick.innerHTML = '';
    const t = typing();
    setTimeout(() => {
      t.remove();
      bubble(L3(BOT.lost), 'bot');
      setChips(CHIPS);
    }, 600);
  };

  form.addEventListener('submit', e => { e.preventDefault(); submit(input.value); });
  input.addEventListener('input', () => { send.disabled = !input.value.trim(); });

  const start = () => {
    if (started) return;
    started = true;
    const t = typing();
    setTimeout(() => { t.remove(); bubble(L3(BOT.hello), 'bot'); setChips(CHIPS); }, 520);
  };

  const toggle = open => {
    botOpen = open;
    bot.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      bot.classList.add('is-seen');
      start();
      if (ANIMATE) {
        gsap.fromTo(panel,
          { y: 24, scale: 0.86, opacity: 0, clipPath: 'inset(0% 0% 100% 0% round 22px)' },
          { y: 0, scale: 1, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 0.55, ease: 'power3.out' });
        gsap.from($$('.bot__head > *, .bot__form > *', panel),
          { y: 10, opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.12, ease: 'power3.out' });
      }
      if (window.matchMedia('(min-width: 821px)').matches) setTimeout(() => input.focus(), 420);
    } else if (ANIMATE) {
      gsap.to(panel, {
        y: 18, scale: 0.9, opacity: 0, duration: 0.26, ease: 'power2.in',
        onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'all' }); }
      });
    } else {
      panel.hidden = true;
    }
  };

  btn.addEventListener('click', () => toggle(!botOpen));
  $('#botClose', bot).addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && botOpen) toggle(false); });
  document.addEventListener('zyra:lang', () => {
    $('.bot__who strong', bot).textContent = T('Asistente de ZYRA', 'ZYRA assistant');
    $('.bot__who span', bot).textContent = T('Responde al momento', 'Replies instantly');
    $('textPath', bot).textContent = T('ZYRA · PREGÚNTAME · ', 'ZYRA · ASK ME · ').repeat(2);
    input.placeholder = L3(BOT.placeholder);
    log.innerHTML = ''; quick.innerHTML = ''; started = false;
    if (botOpen) start();
  });
})();

/* ── El bloque de formularios se despliega con el scroll ── */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATE = !!(window.gsap && window.ScrollTrigger) && !REDUCED;

  $$('[data-unfold]').forEach(wrap => {
    const panel = $('.unfold__panel', wrap);
    const cue = $('[data-unfold-cue]', wrap);
    const text = $('.unfold__text', wrap);

    if (cue) cue.addEventListener('click', () => {
      panel.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    });

    if (!ANIMATE) return;

    /* La pastilla se abre hasta convertirse en el panel completo */
    gsap.fromTo(panel,
      { clipPath: 'inset(48% 22% 48% 22% round 999px)', scale: 0.88, opacity: 0.1 },
      {
        clipPath: 'inset(0% 0% 0% 0% round 24px)', scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top 80%', end: 'top 26%', scrub: 0.5,
          onToggle: self => panel.classList.toggle('is-unfolding', self.isActive)
        }
      });

    /* El texto y la flecha ceden el protagonismo al abrirse */
    gsap.to(cue, {
      opacity: 0.12, y: -28, scale: 0.86, ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'top 66%', end: 'top 34%', scrub: 0.5,
        onUpdate: self => wrap.classList.toggle('is-open', self.progress > 0.5),
        onToggle: self => cue.setAttribute('aria-expanded', String(self.progress > 0.5))
      }
    });
  });
})();


/* ── Equipo: entrada de las tarjetas (fondo → retrato → cargo) ── */
(() => {
  const cards = document.querySelectorAll('.member__card');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('team-anim');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = [...cards].indexOf(e.target);
      setTimeout(() => e.target.classList.add('is-in'), i * 140);
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  cards.forEach((c) => io.observe(c));
})();

/* ── Móvil: los botones flotantes (WhatsApp y asistente) se apartan
      mientras hay un formulario o el cuestionario en pantalla, para no
      tapar botones como "Continuar" o "Enviar". Esas secciones ya
      incluyen su propio acceso a WhatsApp. ── */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const mq = window.matchMedia('(max-width: 720px)');
  const zones = Array.from(document.querySelectorAll('#recomendador .stepper, .forms, .unfold__panel'));
  if (!zones.length) return;
  const visible = new Set();
  const apply = () => document.body.classList.toggle('fab-quiet', mq.matches && visible.size > 0);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    apply();
  }, { rootMargin: '-12% 0px -12% 0px' });
  zones.forEach(z => io.observe(z));
  if (mq.addEventListener) mq.addEventListener('change', apply);
})();
