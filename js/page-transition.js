/**
 * Smooth page transition: fade current page to black → XI centered → navigate → new page fades in.
 * Used across the whole website (e.g. Season 1 → explore.html).
 */
(function() {
    'use strict';

    var exitInProgress = false;
    var FADE_TO_BLACK_MS = 900;
    var XI_FADE_IN_MS = 500;
    var XI_HOLD_MS = 700;
    var TOTAL_EXIT_MS = FADE_TO_BLACK_MS + XI_FADE_IN_MS + XI_HOLD_MS;

    // Entrance: new page loads under black; overlay fades out so page fades in smoothly
    function initEntrance() {
        var overlay = document.querySelector('.page-transition-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(function() {
                overlay.classList.add('fade-out');
            }, 400);
        }
    }

    /**
     * Smooth exit: fade page to black → show XI centered → navigate. New page then fades in.
     */
    function createTransition(destination) {
        if (exitInProgress) return;
        if (!destination || destination === '#' || destination.indexOf('javascript:') === 0) return;
        var isExternal = destination.indexOf('http') === 0 && destination.indexOf(window.location.origin) !== 0;
        if (isExternal) return;

        var pageOverlay = document.querySelector('.page-transition-overlay');
        if (!pageOverlay) return;

        exitInProgress = true;

        window.scrollTo(0, 0);

        pageOverlay.style.transition = 'opacity ' + (FADE_TO_BLACK_MS / 1000) + 's cubic-bezier(0.4, 0, 0.2, 1)';
        pageOverlay.classList.remove('fade-out');

        /* Host on <html> so fixed centering ignores body zoom/transform (e.g. explore-page 67%). */
        var xiHost = document.createElement('div');
        xiHost.setAttribute('aria-hidden', 'true');
        xiHost.style.cssText =
            'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
            'z-index:10030;margin:0;padding:0;pointer-events:none;';

        var xiText = document.createElement('div');
        xiText.textContent = 'XI';
        xiText.style.cssText =
            'font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700;color:#fff;opacity:0;' +
            'pointer-events:none;transition:opacity ' +
            (XI_FADE_IN_MS / 1000) +
            's cubic-bezier(0.4,0,0.2,1);letter-spacing:0.1em;text-align:center;margin:0;';

        xiHost.appendChild(xiText);
        document.documentElement.appendChild(xiHost);

        setTimeout(function() {
            xiText.style.opacity = '1';
        }, FADE_TO_BLACK_MS);

        setTimeout(function() {
            window.location.href = destination;
        }, TOTAL_EXIT_MS);
    }

    function isInternalLink(link) {
        var href = link.getAttribute('href');
        if (!href || href === '#' || link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return false;
        if (href.indexOf('http') === 0) {
            return href.indexOf(window.location.origin) === 0;
        }
        var pathOnly = href.split('#')[0].split('?')[0];
        return pathOnly.endsWith('.html') || pathOnly === 'index.html' || pathOnly === '/' || href.indexOf('./') === 0;
    }

    /**
     * Capture-phase delegation: catches every internal .html link (including index header/footer/hero),
     * even when other scripts register later or markup is fixed after invalid </body> placement.
     */
    function onDocumentClickCapture(e) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var link = t.closest('a[href]');
        if (!link || !isInternalLink(link)) return;
        e.preventDefault();
        createTransition(link.href);
    }

    function boot() {
        initEntrance();
        document.addEventListener('click', onDocumentClickCapture, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.createTransition = createTransition;
})();
