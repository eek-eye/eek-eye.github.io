/**
 * Home page only: scroll-linked black fade between the shirt grid
 * (first) and the mannequin hero (below). As you scroll down the shirts
 * ease out to #000 and the mannequin eases in from #000; the reverse on
 * the way up. Driven by scroll position, updated on rAF. Index only.
 */
(function () {
    'use strict';

    if (!document.body || !document.body.classList.contains('index-page')) return;

    var hero = document.querySelector('.hero-section');
    var grid = document.getElementById('index-explore-grid');
    if (!hero || !grid) return;

    var heroVeil = hero.querySelector('.hero-scroll-veil');
    var gridVeil = grid.querySelector('.index-grid-scroll-veil');
    if (!heroVeil || !gridVeil) return;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced) {
        heroVeil.style.opacity = '0';
        gridVeil.style.opacity = '0';
        return;
    }

    var rafId = 0;

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function ease(t) {
        t = clamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function update() {
        rafId = 0;
        var vh = window.innerHeight || 1;
        if (vh < 1) vh = 1;

        /* Shirts are first: fully clear at the top of the page; ease to
           black as the grid leaves, done once only a sliver remains. */
        var gridBottom = grid.getBoundingClientRect().bottom;
        var gridT = (gridBottom - vh * 0.20) / (vh * 0.55);
        var gridOp = 1 - ease(gridT);

        /* Mannequin is second: start revealing as the hero enters, and
           be fully clear once a good portion of the figure is on screen. */
        var heroTop = hero.getBoundingClientRect().top;
        var heroT = (vh * 0.95 - heroTop) / (vh * 0.35);
        var heroOp = 1 - ease(heroT);

        heroVeil.style.opacity = clamp(heroOp, 0, 1).toFixed(4);
        gridVeil.style.opacity = clamp(gridOp, 0, 1).toFixed(4);
    }

    function requestTick() {
        if (!rafId) rafId = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    window.addEventListener('pageshow', requestTick);
    update();
})();
