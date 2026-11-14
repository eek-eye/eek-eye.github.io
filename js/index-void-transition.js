/**
 * Home page: scrolling past the footer into a black void silently
 * hands off to the Aesthetic (explore) page. No XI logo — the
 * visitor should feel like they kept scrolling into darkness.
 */
(function () {
    'use strict';

    var TRIGGER = 0.9;
    var triggered = false;
    var controlling = false;
    var rafId = 0;

    function overlay() {
        return document.querySelector('.page-transition-overlay');
    }

    function voidProgress() {
        var el = document.getElementById('index-void');
        if (!el) return 0;
        var vh = window.innerHeight || 1;
        var top = el.getBoundingClientRect().top;
        var p = (vh - top) / vh;
        if (p < 0) return 0;
        if (p > 1) return 1;
        return p;
    }

    function paintOverlay(p) {
        var ov = overlay();
        if (!ov) return;
        if (p <= 0) {
            if (controlling) {
                ov.style.transition = 'opacity 0.35s linear';
                ov.style.opacity = '0';
                ov.classList.add('fade-out');
                controlling = false;
            }
            return;
        }
        if (!controlling) {
            ov.classList.remove('fade-out');
            ov.style.transition = 'none';
            controlling = true;
        }
        var eased = Math.min(1, Math.max(0, (p - 0.08) / 0.72));
        ov.style.opacity = String(eased);
    }

    function go() {
        if (triggered) return;
        triggered = true;
        try {
            sessionStorage.setItem('eekseyeVoidArrival', '1');
        } catch (err) {}
        var ov = overlay();
        if (ov) {
            ov.classList.remove('fade-out');
            ov.style.transition = 'opacity 0.18s linear';
            ov.style.opacity = '1';
        }
        var dest = new URL('explore.html', window.location.href);
        dest.searchParams.set('from', 'void');
        window.setTimeout(function () {
            window.location.href = dest.href;
        }, 140);
    }

    function tick() {
        rafId = 0;
        if (triggered) return;
        var p = voidProgress();
        paintOverlay(p);
        if (p >= TRIGGER) go();
    }

    function requestTick() {
        if (triggered || rafId) return;
        rafId = window.requestAnimationFrame(tick);
    }

    function init() {
        if (!document.getElementById('index-void')) return;
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick);
        window.addEventListener('wheel', requestTick, { passive: true });
        window.addEventListener('touchmove', requestTick, { passive: true });
        requestTick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
