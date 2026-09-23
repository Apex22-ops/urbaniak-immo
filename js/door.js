/* =========================================================================
   Le passage — Urbaniak → Sesame Stays
   Les vantaux s'ouvrent, l'enfilade dorée apparaît, la lumière chaude
   envahit l'écran, et l'on arrive de l'autre côté de la porte.
   ========================================================================= */
(function () {
  'use strict';

  // --- Adresse du site jumeau -------------------------------------------
  // Préproduction GitHub Pages. À remettre sur https://sesamestays.com
  // dès que le domaine sera branché : c'est le seul endroit à changer.
  var PARTNER = 'https://apex22-ops.github.io/sesame-stays';
  var DEST    = PARTNER + '/?from=urbaniak';

  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var passage = document.getElementById('passage');
  var arrival = document.getElementById('arrival');
  var going   = false;

  /* ---- L'arrivée depuis Sesame Stays ----------------------------------- */
  var params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'sesame' && arrival && window.gsap && !reduce) {
    document.body.classList.add('arriving');
    gsap.set(arrival, { opacity: 1, scale: 4.2 });
    if (window.__lenis) window.__lenis.stop();

    gsap.timeline({
      onComplete: function () {
        document.body.classList.remove('arriving');
        arrival.style.display = 'none';
        if (window.__lenis) window.__lenis.start();
      }
    })
      .to(arrival, { scale: 0.3, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to(arrival, { opacity: 0, duration: 1.2, ease: 'power2.in' }, 0.7);
  }

  if (params.has('from')) {
    params.delete('from');
    var q = params.toString();
    history.replaceState(null, '', window.location.pathname + (q ? '?' + q : ''));
  }

  function traverse(dest) {
    if (going) return;
    going = true;

    if (reduce || !window.gsap || !passage) { window.location.href = dest; return; }

    if (window.__lenis) window.__lenis.stop();
    passage.classList.add('on');

    var btn   = document.getElementById('doorBtn');
    var svg   = btn ? btn.querySelector('svg') : null;
    var tl    = gsap.timeline({ onComplete: function () { window.location.href = dest; } });

    if (svg) {
      // Les vantaux s'effacent — plus vif qu'au survol, on franchit vraiment.
      gsap.set(svg.querySelectorAll('.leaf'), { transition: 'none' });
      gsap.set(svg.querySelector('.depth'),  { transition: 'none' });

      tl.to(svg.querySelector('.leaf-l'), { scaleX: 0.06, svgOrigin: '38 70', duration: 1.0, ease: 'power3.inOut' }, 0)
        .to(svg.querySelector('.leaf-r'), { scaleX: 0.06, svgOrigin: '88 70', duration: 1.0, ease: 'power3.inOut' }, 0)
        .to(svg.querySelector('.depth'),  { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.15)
        // on entre dans l'enfilade
        .to(svg, { scale: 1.6, duration: 1.6, ease: 'power2.in' }, 0.5);
    }

    // La lumière chaude envahit l'écran.
    tl.to(passage, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.55)
      .to(passage, { scale: 4.2, duration: 1.5, ease: 'power2.in' }, 0.55)
      .to('#header, main, #footer', { opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.9)
      .to(passage, { backgroundColor: '#FFF6E2', duration: 0.45, ease: 'power2.in' }, 1.6);

    return tl;
  }

  var btn = document.getElementById('doorBtn');
  if (btn) {
    btn.addEventListener('click', function () { traverse(DEST); });
  }

  document.querySelectorAll('a[data-door]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      traverse(DEST);
    });
  });
})();
