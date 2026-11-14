/**
 * Aesthetic page arrival after the home-page void handoff.
 * Direct loads are left alone. Reduced motion gets a short fade.
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

    boot(function () {
        var root = document.documentElement;
        if (!root.classList.contains('void-arriving')) return;

        var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        var overlay = document.querySelector('.page-transition-overlay');
        var cards = document.querySelectorAll('.explore-hero-section');
        var i;
        for (i = 0; i < cards.length; i++) {
            cards[i].style.setProperty('--void-i', String(i));
        }

        var staticEl = document.createElement('div');
        staticEl.className = 'void-arrival-static';
        staticEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(staticEl);

        if (reduced) root.classList.add('void-arrival-reduced');
        root.classList.add('void-arrival-armed');

        var holdMs = reduced ? 80 : 280;
        window.setTimeout(function () {
            window.requestAnimationFrame(function () {
                root.classList.add('is-void-emerging');
                if (overlay) {
                    overlay.classList.add('void-arrival-release', 'fade-out');
                }
                if (!reduced) {
                    window.setTimeout(function () {
                        staticEl.classList.add('is-burst');
                    }, 80);
                    window.setTimeout(function () {
                        staticEl.classList.remove('is-burst');
                    }, 620);
                }
                var doneAt = reduced ? 620 : 1520;
                window.setTimeout(function () {
                    root.classList.remove(
                        'void-arriving',
                        'void-arrival-armed',
                        'is-void-emerging',
                        'void-arrival-reduced'
                    );
                    if (staticEl.parentNode) staticEl.parentNode.removeChild(staticEl);
                    for (i = 0; i < cards.length; i++) {
                        cards[i].style.removeProperty('--void-i');
                    }
                }, doneAt);
            });
        }, holdMs);
    });
})();
