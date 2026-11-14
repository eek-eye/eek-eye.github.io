/**
 * Aesthetic grid: on touch / coarse pointers, bring the card closest
 * to the viewport center into focus. Fine-pointer desktops use :hover.
 * Skips updates during the void arrival so that animation is left alone.
 */
(function () {
    'use strict';

    var FOCUS = 'is-dream-focus';
    var CARD = '.explore-hero-section, .explore-grid-placeholder';
    var FINE = '(hover: hover) and (pointer: fine)';
    var current = null;
    var rafId = 0;

    function isFinePointer() {
        return !!(window.matchMedia && window.matchMedia(FINE).matches);
    }

    function arriving() {
        try {
            return document.documentElement.classList.contains('void-arriving');
        } catch (err) {
            return false;
        }
    }

    function clearFocus() {
        if (current) {
            current.classList.remove(FOCUS);
            current = null;
        }
        document.querySelectorAll('.' + FOCUS).forEach(function (el) {
            el.classList.remove(FOCUS);
        });
    }

    function pick() {
        rafId = 0;
        if (arriving() || isFinePointer()) {
            clearFocus();
            return;
        }
        var cx = (window.innerWidth || 0) / 2;
        var cy = (window.innerHeight || 0) / 2;
        var nodes = document.querySelectorAll(CARD);
        var best = null;
        var bestDist = Infinity;
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > (window.innerHeight || 0) || r.right < 0 || r.left > (window.innerWidth || 0)) {
                continue;
            }
            var dx = r.left + r.width / 2 - cx;
            var dy = r.top + r.height / 2 - cy;
            var d = dx * dx + dy * dy;
            if (d < bestDist) {
                bestDist = d;
                best = el;
            }
        }
        if (best === current) return;
        if (current) current.classList.remove(FOCUS);
        current = best;
        if (current) current.classList.add(FOCUS);
    }

    function requestPick() {
        if (rafId) return;
        rafId = window.requestAnimationFrame(pick);
    }

    function init() {
        window.addEventListener('scroll', requestPick, { passive: true });
        window.addEventListener('resize', requestPick);
        window.addEventListener('orientationchange', requestPick);
        if (window.matchMedia) {
            var mq = window.matchMedia(FINE);
            if (mq.addEventListener) mq.addEventListener('change', requestPick);
            else if (mq.addListener) mq.addListener(requestPick);
        }
        var wrap = document.getElementById('exploreProducts');
        if (wrap && typeof MutationObserver === 'function') {
            var mo = new MutationObserver(requestPick);
            mo.observe(wrap, { childList: true });
        }
        if (arriving() && typeof MutationObserver === 'function') {
            var vo = new MutationObserver(function () {
                if (!arriving()) {
                    vo.disconnect();
                    requestPick();
                }
            });
            vo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
        requestPick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
