/* =========================================================================
   Urbaniak — comportement de page
   Reprend la mécanique de passalacqua.it : défilement lissé, en-tête collant,
   panneau de navigation en expo.inOut, apparitions au défilement.
   ========================================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---- Défilement lissé (Lenis remplace Locomotive Scroll) ------------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  window.__lenis = lenis;

  /* ---- En-tête collant ------------------------------------------------- */
  var header = document.getElementById('header');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('sticky', y > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Panneau de navigation ------------------------------------------ */
  var burger = document.getElementById('burger');
  var panel  = document.getElementById('panel');
  var pushed = '#heroMedia, #intro, main, #footer';

  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');

      if (reduce || !window.gsap) {
        panel.style.transform = open ? 'translateY(0)' : 'translateY(-150%)';
        return;
      }
      var tl = gsap.timeline({ defaults: { duration: 1.25, ease: 'expo.inOut' } });
      if (open) {
        tl.fromTo(panel, { y: '-150%' }, { y: 0 })
          .to(pushed, { y: panel.offsetHeight }, '-=1.25');
      } else {
        tl.to(panel, { y: '-150%' })
          .to(pushed, { y: 0 }, '-=1.25');
      }
    });
  }

  /* ---- Héros -----------------------------------------------------------
     L'image est fixe et reste telle quelle. Seul le titre entre, puis
     s'efface quand la page glisse par-dessus. */
  var intro = document.getElementById('intro');
  if (intro && window.gsap && !reduce) {
    var arriving = /[?&]from=sesame/.test(window.location.search);
    gsap.timeline({ delay: arriving ? 1.15 : 0.15 })
      .to(intro.querySelectorAll('.hero-t'),
          { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out', stagger: 0.12 })
      .add(function () {
        ScrollTrigger.create({
          trigger: intro, start: 'top top', end: 'bottom top', scrub: true,
          animation: gsap.timeline()
            .to(intro.querySelectorAll('.hero-t'), { opacity: 0, ease: 'none' }, 0)
        });
      });
  } else if (intro && window.gsap) {
    gsap.set(intro.querySelectorAll('.hero-t'), { opacity: 1, y: 0 });
  }

  /* ---- Apparitions au défilement --------------------------------------
     Même mécanique que passalacqua.it : une simple classe qui bascule et
     laisse la transition CSS de .75s faire le travail. Les colonnes d'une
     même rangée sont décalées, comme leur data-animation-delay. */
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-animation]'));
  if (reduce) {
    blocks.forEach(function (el) { el.classList.add('a1'); });
  } else if ('IntersectionObserver' in window) {
    blocks.forEach(function (el) {
      var row = el.parentNode;
      var rank = row ? Array.prototype.indexOf.call(row.children, el) : 0;
      el.style.transitionDelay = rank > 0 ? (rank * 0.15) + 's' : '';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('a1');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    blocks.forEach(function (el) { io.observe(el); });
  } else {
    blocks.forEach(function (el) { el.classList.add('a1'); });
  }

  /* ---- Ancres ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + (window.scrollY || 0) - 130;
      if (lenis) lenis.scrollTo(top); else window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- Année courante -------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
