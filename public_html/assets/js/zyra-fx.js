/* ============================================================
   ZYRA FX · v44 — capa de animación del rediseño
   Efectos inspirados en React Bits (BlurText, ScrollReveal,
   ScrollVelocity, LogoLoop, CurvedLoop, MagicBento/Spotlight,
   Aurora, ContainerScroll) portados a JavaScript sin dependencias.

   · No necesita React ni librerías: funciona aunque GSAP o Lenis
     no carguen, y convive con ellos (Lenis mueve el scroll nativo).
   · Todo el texto sigue en el HTML: Google indexa lo mismo que antes.
   · Respeta prefers-reduced-motion, el tema claro y el árabe (RTL).
   ============================================================ */
(() => {
  'use strict';

  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const RTL = html.dir === 'rtl';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const vh = () => window.innerHeight || html.clientHeight;

  html.classList.add('fx-on');
  html.classList.remove('fx-pending');

  /* ── Bucle único de animación ─────────────────────────
     Un solo requestAnimationFrame para todo; se para con la
     pestaña oculta. Cada efecto registra su función. */
  const tasks = new Set();
  let last = performance.now();
  let scrollY = window.scrollY;
  let velocity = 0;               // px/s suavizado
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;
    const y = window.scrollY;
    const raw = (y - scrollY) / dt;
    scrollY = y;
    velocity += (raw - velocity) * Math.min(1, dt * 6);
    tasks.forEach(fn => fn(dt, now));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* Visibilidad: solo se anima lo que está en pantalla */
  const visible = new WeakSet();
  const seen = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
  }, { rootMargin: '120px 0px' });

  /* ══ 1. BlurText / SplitText: titulares palabra a palabra ══
     Envuelve cada palabra en <span class="fx-w"> conservando
     <em>, <mark> y <br>. Nunca parte letras: el árabe se une. */
  const split = el => {
    if (el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';
    let i = 0;
    let lastWord = null;      // última palabra creada, por si la puntuación va pegada
    const walk = (node, accent) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); lastWord = null; return; }
            /* "verdad</em>:" → los dos puntos viajan con su palabra y no saltan de línea */
            if (lastWord && /^[.,:;!?…)\]»”"'’%]+$/.test(part)) {
              const p = document.createElement('span');
              p.className = 'fx-punct';
              p.textContent = part;
              lastWord.append(p);
              return;
            }
            const s = document.createElement('span');
            s.className = 'fx-w' + (accent ? ' fx-w--em' : '');
            s.style.setProperty('--i', i++);
            s.textContent = part;
            frag.append(s);
            lastWord = s;
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName === 'BR') {
          lastWord = null;
        } else if (n.nodeType === 1) {
          walk(n, accent || n.tagName === 'EM');
        }
      });
    };
    walk(el, false);
    el.classList.add('fx-split');
    el.style.setProperty('--n', i);
  };

  const HEADINGS = '.hero__title, .phero__title, .h-section, .h-display, .lost__line';
  const heads = $$(HEADINGS).filter(h => !h.closest('.menu, .quiz, .reviews, .forms, .form'));
  heads.forEach(split);

  /* ══ 2. FadeContent: entrada suave con desenfoque ══ */
  const FADES = [
    '.shead__lead', '.process__note', '.process__sticky > .alink',
    '.trust__lead > p:not(.kicker)', '.trust__lead > .alink',
    '.contact__lead > p:not(.kicker)', '.contact__direct', '.contact__lead .facts',
    '.band > p', '.band__cta', '.phero__lead', '.phero .crumb',
    '.split__main > .lead', '.split__main > .ticks', '.fx-logos__label', '.services__hint'
  ].join(',');
  const fades = $$(FADES).filter(el => !el.closest('.menu, .quiz, .reviews'));
  fades.forEach(el => el.classList.add('fx-fade'));

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      reveal.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  /* El hero espera a que se abra la cortina de entrada */
  const heroHeads = heads.filter(h => h.matches('.hero__title, .phero__title'));
  const heroFades = $$('.phero__lead, .phero .crumb');
  const startIntro = () => {
    heroHeads.forEach(h => h.classList.add('is-in'));
    heroFades.forEach((f, k) => setTimeout(() => f.classList.add('is-in'), 260 + k * 120));
  };
  if (REDUCED) {
    heads.concat(fades).forEach(el => el.classList.add('is-in'));
  } else {
    heads.concat(fades).forEach(el => {
      if (heroHeads.includes(el) || heroFades.includes(el)) return;
      reveal.observe(el);
    });
    if (window.__zyraIntro || !document.getElementById('curtain')) startIntro();
    else {
      document.addEventListener('zyra:intro', startIntro, { once: true });
      setTimeout(startIntro, 3600);            // red de seguridad
    }
  }

  /* ══ 3. ScrollReveal: el manifiesto se enfoca al leerlo ══ */
  $$('[data-fx-reveal]').forEach(el => {
    split(el);
    el.classList.add('fx-scrollreveal');
    const words = $$('.fx-w', el);
    if (REDUCED) { el.classList.add('is-static'); return; }
    const n = words.length;
    const state = new Float32Array(n).fill(-1);
    seen.observe(el);
    tasks.add(() => {
      if (!visible.has(el)) return;
      const r = el.getBoundingClientRect();
      const h = vh();
      const p = clamp((h * 0.9 - r.top) / (r.height + h * 0.35));
      el.style.setProperty('--p', p.toFixed(3));
      const span = 7;
      for (let k = 0; k < n; k++) {
        const w = clamp((p * (n + span) - k) / span);
        const q = Math.round(w * 40) / 40;
        if (q === state[k]) continue;
        state[k] = q;
        const s = words[k].style;
        s.opacity = (0.14 + 0.86 * q).toFixed(3);
        s.filter = q > 0.98 ? 'none' : `blur(${((1 - q) * 7).toFixed(1)}px)`;
        s.transform = q > 0.98 ? 'none' : `translateY(${((1 - q) * 0.18).toFixed(3)}em)`;
      }
    });
  });

  /* ══ 4. ScrollVelocity: cintas que corren con el scroll ══ */
  $$('.fx-velo__track').forEach(track => {
    const dir = Number(track.dataset.dir || 1) * (RTL ? -1 : 1);
    const base = Number(track.dataset.speed || 60);           // px/s
    const set = track.firstElementChild;
    if (!set) return;
    // Copias suficientes para cubrir el ancho de la pantalla dos veces
    const fill = () => {
      $$('.fx-velo__set[data-clone]', track).forEach(c => c.remove());
      const w = set.getBoundingClientRect().width || 1;
      const copies = Math.ceil((window.innerWidth * 2) / w) + 1;
      for (let k = 0; k < copies; k++) {
        const c = set.cloneNode(true);
        c.setAttribute('data-clone', '');
        c.setAttribute('aria-hidden', 'true');
        track.append(c);
      }
      return w;
    };
    let width = fill();
    let x = 0;
    let flip = 1;
    window.addEventListener('resize', () => { width = fill(); }, { passive: true });
    if (REDUCED) return;
    seen.observe(track);
    tasks.add(dt => {
      if (!visible.has(track)) return;
      const f = clamp(velocity / 900, -6, 6);              // factor de velocidad
      if (f < -0.05) flip = -1; else if (f > 0.05) flip = 1;
      x += dir * flip * base * (1 + Math.abs(f)) * dt;
      x = ((x % width) + width) % width;
      track.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
    });
  });

  /* ══ 5. CurvedLoop: texto que viaja por una curva ══ */
  $$('.fx-curve').forEach(box => {
    const tp = $('textPath', box);
    const unit = tp && tp.dataset.unit;
    if (!tp || !unit) return;
    const svg = $('svg', box);
    let spacing = 0, offset = 0;
    const NS = 'http://www.w3.org/2000/svg';
    const SEP = '  ✦  ';
    const measure = () => {
      const probe = document.createElementNS(NS, 'text');
      probe.setAttribute('class', 'fx-curve__text');
      probe.textContent = unit + SEP;
      probe.style.visibility = 'hidden';
      svg.append(probe);
      spacing = probe.getComputedTextLength() || 0;
      probe.remove();
      if (!spacing) return;
      const reps = Math.ceil(3200 / spacing) + 2;
      tp.textContent = '';
      for (let k = 0; k < reps; k++) {
        tp.append(document.createTextNode(unit + '  '));
        const star = document.createElementNS(NS, 'tspan');
        star.setAttribute('class', 'fx-curve__star');
        star.textContent = '✦';
        tp.append(star, document.createTextNode('  '));
      }
      offset = -spacing;
      tp.setAttribute('startOffset', offset + 'px');
    };
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(measure);
    window.addEventListener('resize', measure, { passive: true });
    if (REDUCED) return;
    seen.observe(box);
    const speed = Number(box.dataset.speed || 70) * (RTL ? 1 : -1);
    tasks.add(dt => {
      if (!spacing || !visible.has(box)) return;
      const f = 1 + Math.min(4, Math.abs(velocity) / 700);
      offset += speed * f * dt * (velocity < -40 ? -1 : 1);
      if (offset <= -spacing * 2) offset += spacing;
      if (offset > 0) offset -= spacing;
      tp.setAttribute('startOffset', offset.toFixed(1) + 'px');
    });
  });

  /* ══ 6. MagicBento / SpotlightCard: luz que sigue al cursor ══ */
  const GLOW = '.service, .scard, .card, .pillar, .rate, .how, .facts:not(.facts--flat), .forms, .member, .promises li, .fx-logo';
  const cards = $$(GLOW).filter(c => !c.closest('.menu'));
  cards.forEach(c => {
    c.classList.add('fx-glow');
    const s = document.createElement('span');
    s.className = 'fx-spot';
    s.setAttribute('aria-hidden', 'true');
    c.prepend(s);
    seen.observe(c);
  });
  if (FINE && !REDUCED && cards.length) {
    let px = -9999, py = -9999, queued = false;
    const RADIUS = 260;
    const paint = () => {
      queued = false;
      cards.forEach(c => {
        if (!visible.has(c)) return;
        const r = c.getBoundingClientRect();
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const d = Math.hypot(dx, dy);
        const o = d === 0 ? 1 : clamp(1 - d / RADIUS);
        c.style.setProperty('--mx', (px - r.left).toFixed(0) + 'px');
        c.style.setProperty('--my', (py - r.top).toFixed(0) + 'px');
        c.style.setProperty('--glow', o.toFixed(3));
        c.classList.toggle('is-lit', d === 0);
      });
    };
    window.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { px = py = -9999; paint(); });
  }

  /* ══ 7. ContainerScroll: el vídeo se endereza al bajar ══ */
  const show = $('.showcase');
  if (show && !REDUCED) {
    seen.observe(show);
    let prev = -1;
    tasks.add(() => {
      if (!visible.has(show)) return;
      const r = show.getBoundingClientRect();
      const h = vh();
      const p = clamp((h - r.top) / (h * 0.75));
      const q = Math.round(p * 500) / 500;
      if (q === prev) return;
      prev = q;
      show.style.setProperty('--cs', q);
    });
  }

  /* ══ 8. Barra de progreso de lectura ══ */
  const bar = document.createElement('div');
  bar.className = 'fx-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  tasks.add(() => {
    const max = html.scrollHeight - vh();
    const p = max > 0 ? clamp(window.scrollY / max) : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  });

  /* ══ 9. Aurora (WebGL): luz violeta líquida detrás del hero ══
     Sin librerías. Se dibuja a baja resolución, a 30 fps como
     máximo y solo mientras está en pantalla. */
  const AURORA_HOSTS = [
    ['.hero', 0.82], ['.phero', 0.7], ['.band', 0.6], ['.lost', 0.5]
  ];
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
uniform vec2 r;uniform float t;uniform float a;uniform vec2 m;uniform float lt;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,w=.5;for(int k=0;k<5;k++){v+=w*n(p);p=p*2.03+vec2(1.7,9.2);w*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/r;vec2 p=uv;p.x*=r.x/r.y;
float s=t*.045;
vec2 q=vec2(fbm(p*1.3+vec2(s,-s*.6)),fbm(p*1.3+vec2(-s*.8,s)+3.1));
vec2 w=vec2(fbm(p*1.7+q*1.8+vec2(s*1.6,0.)),fbm(p*1.7+q*1.8-vec2(0.,s*1.2)+7.3));
float f=fbm(p*1.25+w*1.4+(m-.5)*.25);
float rib=smoothstep(.15,.0,abs(fract(f*2.2+uv.y*.6-s*.3)-.5)-.18);
vec3 deep=vec3(.165,.06,.36);vec3 vio=vec3(.486,.227,.929);vec3 lil=vec3(.66,.33,.97);vec3 ice=vec3(.77,.71,.99);
vec3 col=mix(deep,vio,smoothstep(.25,.7,f));
col=mix(col,lil,smoothstep(.55,.85,f)*.9);
col+=ice*rib*.12*smoothstep(.4,.8,f);
float v=smoothstep(1.,.08,length((uv-vec2(.5,.74))*vec2(.95,1.45)));v*=v;
float al=clamp(pow(f,1.9)*1.6,0.,1.)*v*a;
al*=mix(1.,.55,lt);
gl_FragColor=vec4(col*al,al);
}`;

  const makeAurora = (host, amount) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-aurora';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k);
    const uR = U('r'), uT = U('t'), uA = U('a'), uM = U('m'), uL = U('lt');
    host.classList.add('fx-aurora-host');
    host.prepend(canvas);
    seen.observe(canvas);

    const SCALE = window.innerWidth < 760 ? 0.32 : 0.45;
    const size = () => {
      const w = Math.max(2, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(2, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    if (FINE) window.addEventListener('pointermove', e => {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    }, { passive: true });
    const seed = Math.random() * 100;
    const draw = now => {
      size();
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, seed + now / 1000);
      gl.uniform1f(uA, amount);
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uL, html.dataset.theme === 'light' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    window.addEventListener('resize', size, { passive: true });
    if (REDUCED) { requestAnimationFrame(() => draw(0)); return; }
    let acc = 0;
    tasks.add((dt, now) => {
      if (!visible.has(canvas) || document.hidden) return;
      acc += dt;
      if (acc < 1 / 30) return;              // 30 fps bastan para una luz lenta
      acc = 0;
      draw(now);
    });
    requestAnimationFrame(() => draw(performance.now()));
    host.classList.add('has-aurora');
  };
  AURORA_HOSTS.forEach(([sel, amount]) => $$(sel).forEach(h => makeAurora(h, amount)));

  /* ══ 10. LogoLoop: pausa al pasar el ratón / tocar ══ */
  $$('.fx-logos').forEach(box => {
    box.addEventListener('pointerenter', () => box.classList.add('is-paused'));
    box.addEventListener('pointerleave', () => box.classList.remove('is-paused'));
  });

  /* ══ 11. ZYRA del pie: entra al verse y la luz sigue al cursor ══ */
  $$('.fx-wordmark').forEach(wm => {
    if (REDUCED) { wm.classList.add('is-in'); return; }
    new IntersectionObserver((entries, io) => entries.forEach(e => {
      if (e.isIntersecting) { wm.classList.add('is-in'); io.disconnect(); }
    }), { threshold: 0.25 }).observe(wm);
    const foot = wm.closest('footer') || wm.parentElement;
    if (!FINE || !foot) return;
    let raf = 0, ex = 0, ey = 0;
    foot.addEventListener('pointermove', e => {
      ex = e.clientX; ey = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = wm.getBoundingClientRect();
        wm.style.setProperty('--mx', (ex - r.left).toFixed(0) + 'px');
        wm.style.setProperty('--my', (ey - r.top).toFixed(0) + 'px');
        wm.style.setProperty('--spot', '1');
      });
    }, { passive: true });
    foot.addEventListener('pointerleave', () => wm.style.setProperty('--spot', '0'));
  });

  /* Si una sección cambia de alto (FAQ, formularios) GSAP lo recalcula;
     aquí no hay nada que medir de antemano. */
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

  /* ── Aparición escalonada al entrar en pantalla ── */
  const rvs = $$('.rv');
  if (rvs.length && 'IntersectionObserver' in window && !REDUCED) {
    html.classList.add('js-rv');
    const groups = new Map();
    rvs.forEach(el => {
      const p = el.parentElement;
      const i = groups.get(p) || 0;
      groups.set(p, i + 1);
      el.style.setProperty('--rv-d', Math.min(i * 0.08, 0.4) + 's');
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    rvs.forEach(el => io.observe(el));
  }

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
    /* En móvil el índice se cierra al elegir una sección */
    const box = $('.toc__box');
    if (box && matchMedia('(max-width:1080px)').matches) {
      box.open = false;
      tocLinks.forEach(a => a.addEventListener('click', () => { box.open = false; }));
    }
  }

  /* ── Luz que sigue al puntero en las tarjetas de guía ── */
  if (FINE && !REDUCED) {
    $$('.gcard__link').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
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

/* ── v47 · ZYRA del pie: entrada escalonada + proximidad del cursor ── */
(() => {
  'use strict';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('.zy-wm').forEach(wm => {
    const letters = Array.from(wm.querySelectorAll('span'));
    if (REDUCED || !('IntersectionObserver' in window)) return;
    wm.classList.add('is-ready');
    new IntersectionObserver((entries, io) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(() => { wm.classList.add('is-in'); wm.classList.remove('is-ready'); });
      setTimeout(() => wm.classList.add('is-live'), 1600);
    }), { threshold: 0.3 }).observe(wm);
    if (!FINE) return;
    const foot = wm.closest('footer') || wm.parentElement;
    let raf = 0, x = 0, y = 0;
    const update = () => {
      raf = 0;
      letters.forEach(l => {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        const p = Math.max(0, 1 - d / (r.width * 2.2));
        l.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3));
      });
    };
    foot.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    foot.addEventListener('pointerleave', () => letters.forEach(l => l.style.setProperty('--p', 0)));
  });
})();
