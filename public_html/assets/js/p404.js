/* Contador animado de la página 404 */
(() => {
  const html = document.documentElement;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATE = !!window.gsap && !REDUCED;
  const SETS = 4;                       // vueltas completas antes de parar

  /* Contador: cada cifra gira 0→9 varias veces y frena en la suya.
     Se mide en píxeles reales (y después de cargar la fuente) para que
     el dígito final quede siempre justo en la ventana. */
  const rolls = Array.from(document.querySelectorAll('.roll')).map((slot, i) => {
    const target = +slot.dataset.digit;
    const items = [];
    for (let s = 0; s < SETS; s++) for (let n = 0; n <= 9; n++) items.push(n);
    items.push(target);
    slot.innerHTML = '<span class="roll__col">' + items.map(n => '<i>' + n + '</i>').join('') + '</span>';
    return { slot, col: slot.firstChild, count: items.length, i };
  });

  const place = animate => {
    rolls.forEach(r => {
      const step = r.col.firstChild.getBoundingClientRect().height;
      const end = -(r.count - 1) * step;
      if (animate && ANIMATE) {
        gsap.fromTo(r.col, { y: 0 }, { y: end, duration: 1.5 + r.i * 0.22, ease: 'power4.out', delay: 0.15 });
      } else {
        if (window.gsap) gsap.set(r.col, { y: end });
        else r.col.style.transform = 'translateY(' + end + 'px)';
      }
    });
  };

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => place(true));
  window.addEventListener('resize', () => place(false));

  if (ANIMATE) {
    gsap.from('.lost__tag', { y: 14, opacity: 0, duration: 0.6, ease: 'power3.out' });
    gsap.from('.lost__line, .lost__lead, .lost__cta',
      { y: 22, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', delay: 1.15 });
    gsap.from('.lost__glow', { opacity: 0, scale: 0.7, duration: 1.8, ease: 'power2.out' });
  }

  /* La traducción la hace lang404.js según la URL pedida */
})();
