/**
 * Home Aesthetic grid underwater layer: pause ripples and particles
 * when the section is off-screen or the tab is hidden, and freeze the
 * SVG turbulence when the visitor prefers reduced motion.
 */
(function () {
    'use strict';

    var grid = document.getElementById('index-explore-grid');
    if (!grid) return;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var inView = true;
    var pageHidden = document.visibilityState === 'hidden';

    function sync() {
        grid.classList.toggle('is-water-active', inView && !pageHidden && !reduced);
    }

    if (reduced) {
        grid.querySelectorAll('.index-grid-water animate').forEach(function (anim) {
            anim.remove();
        });
        var disp = document.querySelector('#indexGridWaterRipple feDisplacementMap');
        if (disp) disp.setAttribute('scale', '0');
        grid.classList.add('is-reduced-motion');
    }

    document.addEventListener('visibilitychange', function () {
        pageHidden = document.visibilityState === 'hidden';
        sync();
    });

    if (typeof IntersectionObserver === 'function') {
        var io = new IntersectionObserver(function (entries) {
            inView = !!(entries[0] && entries[0].isIntersecting);
            sync();
        }, { root: null, threshold: 0.05 });
        io.observe(grid);
    }

    sync();
})();
