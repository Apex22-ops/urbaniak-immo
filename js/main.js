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
     Une classe bascule, la transition CSS fait le reste. Les groupes
     marqués data-stagger cadencent leurs enfants (sur-titre → titre →
     texte) ; les colonnes d'une rangée se décalent légèrement. */
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-animation]'));
  function show(el) { el.classList.add('a1'); }

  if (reduce || !('IntersectionObserver' in window)) {
    blocks.forEach(show);
  } else {
    blocks.forEach(function (el) {
      var p = el.parentNode, d = 0;
      if (p && p.hasAttribute && p.hasAttribute('data-stagger')) {
        d = Array.prototype.indexOf.call(p.children, el) * 0.11;
      } else if (p && p.classList && p.classList.contains('bl')) {
        d = Array.prototype.indexOf.call(p.children, el) * 0.14;
      }
      if (d) el.style.transitionDelay = d + 's';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);   // une seule fois : rien ne rejoue au retour
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.04 });
    blocks.forEach(function (el) { io.observe(el); });
  }

  /* ---- Mouvements liés au défilement ------------------------------------
     Un seul rAF pour le héros et les quelques grandes images. Rien n'est
     calculé dans l'écouteur de défilement lui-même. */
  var heroImg = document.querySelector('#heroMedia img');
  var pars = Array.prototype.slice.call(document.querySelectorAll('.picture.par .par-in'));

  if (!reduce && (heroImg || pars.length)) {
    var vh = window.innerHeight, queued = false;

    function frame() {
      queued = false;
      if (heroImg) {
        // 1.03 → 1 sur la hauteur du héros : on doit le sentir, pas le voir.
        var t = Math.min(1, Math.max(0, (window.pageYOffset || 0) / vh));
        heroImg.style.transform = 'scale(' + (1.03 - 0.03 * t).toFixed(4) + ')';
      }
      for (var i = 0; i < pars.length; i++) {
        var el = pars[i], r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) continue;
        var p = (r.top + r.height / 2 - vh / 2) / vh;      // -1 … 1
        el.style.transform = 'translate3d(0,' + (p * 4.5).toFixed(2) + '%,0)';
      }
    }
    function onMove() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', function () { vh = window.innerHeight; onMove(); }, { passive: true });
    frame();
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
