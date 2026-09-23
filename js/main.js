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

  /* ---- Héros ----------------------------------------------------------- */
  var intro = document.getElementById('intro');
  if (intro && window.gsap && !reduce) {
    var media = document.querySelector('#heroMedia img');
    var arriving = /[?&]from=sesame/.test(window.location.search);
    // L'image reste strictement immobile : c'est la page qui glisse dessus.
    // Seule l'ouverture joue un très léger rapprochement, une fois pour toutes.
    var tl = gsap.timeline({ delay: arriving ? 1.15 : 0, defaults: { ease: 'power4.out' } });
    if (media) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 2.5 }, 0);
    tl.to(intro.querySelectorAll('.hero-t'), { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 1.0)
      .add(function () {
        // Le texte du héros s'efface au défilement ; l'image, elle, ne bouge pas.
        ScrollTrigger.create({
          trigger: intro,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          animation: gsap.timeline()
            .to(intro.querySelectorAll('.hero-t, .scroll-cue'), { opacity: 0, ease: 'none' }, 0)
        });
      });
  } else if (intro) {
    gsap.set && gsap.set(intro.querySelectorAll('.hero-t'), { opacity: 1, y: 0 });
  }

  /* ---- Apparitions au défilement --------------------------------------- */
  if (window.gsap && !reduce) {
    gsap.utils.toArray('.rv').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
    gsap.utils.toArray('.rv-img').forEach(function (el) {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });
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
