/**
 * Home page only: "consumerism" sits under the top-right corner box
 * and eases the page down to the shirt grid. Index only.
 */
(function () {
    'use strict';

    if (!document.body || !document.body.classList.contains('index-page')) return;

    var btn = document.getElementById('consumerismButton');
    var hero = document.querySelector('.hero-section');
    var box = document.querySelector('.hero-gone-mini-wrapper');
    if (!btn || !hero || !box) return;

    var gap = 12;
    var animId = 0;

    function place() {
        var hr = hero.getBoundingClientRect();
        var br = box.getBoundingClientRect();
        if (!hr.width || !br.width) return;
        var usedH = br.height;
        /* If the box overflows (reduced-motion scale quirk), measure from
           its top-right origin so the button stays on screen under it. */
        if (usedH > hr.height * 0.4) {
            usedH = Math.min(180, hr.height * 0.28);
        }
        var top = br.top - hr.top + usedH + gap;
        var right = hr.right - br.right;
        var btnH = btn.offsetHeight || 20;
        var maxTop = hr.height - btnH - 8;
        if (top > maxTop) top = maxTop;
        if (top < 8) top = 8;
        if (right < 0) right = 0;
        btn.style.top = Math.round(top) + 'px';
        btn.style.right = Math.round(right) + 'px';
        btn.style.left = 'auto';
    }

    function reducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function targetY() {
        var products = document.getElementById('exploreProducts') || document.getElementById('index-explore-grid');
        if (!products) return 0;
        var vh = window.innerHeight || 1;
        var docTop = products.getBoundingClientRect().top + (window.pageYOffset || window.scrollY || 0);
        /* Land with the shirts just below the top so the first row is fully
           visible and the scroll-linked veil is fully clear (clears at 18vh). */
        var y = docTop - vh * 0.08;
        var max = Math.max(0, (document.documentElement.scrollHeight || 0) - vh);
        if (y < 0) y = 0;
        if (y > max) y = max;
        return y;
    }

    function ease(t) {
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        return t * t * (3 - 2 * t);
    }

    function goToShirts(event) {
        if (event) event.preventDefault();
        var end = targetY();
        if (animId) {
            window.cancelAnimationFrame(animId);
            animId = 0;
        }
        if (reducedMotion()) {
            window.scrollTo(0, end);
            return;
        }
        var start = window.pageYOffset || window.scrollY || 0;
        var dist = end - start;
        if (Math.abs(dist) < 1) return;
        var dur = Math.min(1400, Math.max(900, Math.abs(dist) * 0.85));
        var t0 = performance.now();
        function step(now) {
            var t = (now - t0) / dur;
            if (t >= 1) {
                window.scrollTo(0, end);
                animId = 0;
                return;
            }
            window.scrollTo(0, start + dist * ease(t));
            animId = window.requestAnimationFrame(step);
        }
        animId = window.requestAnimationFrame(step);
    }

    btn.addEventListener('click', goToShirts);

    place();
    window.addEventListener('resize', place);
    window.addEventListener('pageshow', place);
    if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(place);
        ro.observe(hero);
        ro.observe(box);
    }
})();
