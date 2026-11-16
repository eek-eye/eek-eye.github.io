/**
 * Home page only: scroll-linked black fade between the mannequin hero
 * and the shirt grid. As you scroll down the hero eases out to #000 and
 * the shirts ease in from #000; the reverse on the way up. Driven by
 * scroll position, updated on rAF. Index only.
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

    var products = document.getElementById('exploreProducts') || grid;
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

        var heroBottom = hero.getBoundingClientRect().bottom;
        /* Fully clear near the top of the page; solid black once the hero
           has receded to about mid-viewport, before the shirts arrive. */
        var heroT = (heroBottom - vh * 0.55) / (vh * 0.40);
        var heroOp = 1 - ease(heroT);

        var shirtsTop = products.getBoundingClientRect().top;
        /* Stay black until the product row is well into the viewport, then
           ease the shirts in. Leaves a pure-black beat between the two. */
        var gridT = (vh * 0.52 - shirtsTop) / (vh * 0.34);
        var gridOp = 1 - ease(gridT);

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
