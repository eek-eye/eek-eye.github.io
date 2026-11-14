/**
 * Home page arrival after scrolling up from the Aesthetic page void.
 * Direct visits are left alone. Lands at the footer / void edge.
 */
(function () {
    'use strict';

    function boot(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function placeAtFooter() {
        var voidEl = document.getElementById('index-void');
        var footer = document.querySelector('footer.site-footer') || document.querySelector('.explore-footer-scale-wrap');
        var y = 0;
        if (voidEl) {
            var top = voidEl.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
            y = Math.max(0, top - (window.innerHeight || 0) + 8);
        } else if (footer) {
            var ft = footer.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
            y = Math.max(0, ft - 24);
        } else {
            y = Math.max(0, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
        }
        window.scrollTo(0, y);
    }

    function releaseForwardLock() {
        window.setTimeout(function () {
            window.EEKSEYE_voidForwardLock = false;
        }, 900);
    }

    boot(function () {
        var root = document.documentElement;
        if (!root.classList.contains('void-returning')) return;

        window.EEKSEYE_voidForwardLock = true;
        placeAtFooter();
        window.setTimeout(placeAtFooter, 0);
        window.addEventListener('load', placeAtFooter, { once: true });

        var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        var overlay = document.querySelector('.page-transition-overlay');

        if (reduced) root.classList.add('void-arrival-reduced');
        root.classList.add('void-arrival-armed');

        var holdMs = reduced ? 80 : 260;
        window.setTimeout(function () {
            placeAtFooter();
            window.requestAnimationFrame(function () {
                root.classList.add('is-void-emerging');
                if (overlay) overlay.classList.add('void-arrival-release', 'fade-out');
                var doneAt = reduced ? 620 : 1300;
                window.setTimeout(function () {
                    root.classList.remove(
                        'void-returning',
                        'void-arrival-armed',
                        'is-void-emerging',
                        'void-arrival-reduced'
                    );
                    releaseForwardLock();
                }, doneAt);
            });
        }, holdMs);
    });
})();
