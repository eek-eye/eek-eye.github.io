/**
 * Continuous corrupted-data glitch for Aesthetic shirt-card background text.
 * Characters keep changing; original copy is never shown. Viewport-only,
 * paused when the tab is hidden, slower under prefers-reduced-motion.
 */
(function () {
    'use strict';

    var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+-=[]{}|;:\'",.<>/?`';
    var CHARSET_LEN = CHARSET.length;

    var metas = [];
    var visible = [];
    var observer = null;
    var mutationObserver = null;
    var rafId = 0;
    var running = false;
    var tabHidden = false;
    var reduced = false;
    var started = false;

    function rand() {
        return Math.random();
    }

    function randChar() {
        return CHARSET.charAt((Math.random() * CHARSET_LEN) | 0);
    }

    function intervalRange() {
        if (reduced) return { min: 280, span: 180 };
        return { min: 42, span: 48 };
    }

    function nextInterval() {
        var r = intervalRange();
        return r.min + rand() * r.span;
    }

    function scramble(meta) {
        var out = '';
        var spaces = meta.spaces;
        var len = meta.len;
        var i;
        for (i = 0; i < len; i++) {
            out += spaces[i] ? ' ' : randChar();
        }
        return out;
    }

    function clearAccents(el) {
        el.classList.remove('is-rgb', 'is-jitter', 'is-flicker');
    }

    function flashAccent(meta, now) {
        if (reduced) return;
        if (now < meta.accentUntil) return;
        if (rand() > 0.14) return;
        var el = meta.el;
        clearAccents(el);
        var roll = rand();
        if (roll < 0.5) el.classList.add('is-rgb');
        else if (roll < 0.8) el.classList.add('is-rgb', 'is-jitter');
        else el.classList.add('is-flicker');
        var hold = 70 + rand() * 110;
        meta.accentUntil = now + hold;
        window.setTimeout(function () {
            if (el.isConnected) clearAccents(el);
        }, hold);
    }

    function rebuildVisible() {
        visible = [];
        var i, meta;
        for (i = 0; i < metas.length; i++) {
            meta = metas[i];
            if (meta.inView && meta.el.isConnected) visible.push(meta);
        }
    }

    function tick(now) {
        rafId = 0;
        if (!running || tabHidden) return;
        var i, meta;
        for (i = 0; i < visible.length; i++) {
            meta = visible[i];
            if (now < meta.nextTick) continue;
            meta.el.textContent = scramble(meta);
            meta.nextTick = now + nextInterval();
            flashAccent(meta, now);
        }
        rafId = window.requestAnimationFrame(tick);
    }

    function startLoop() {
        if (running) return;
        running = true;
        if (!tabHidden) rafId = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
        running = false;
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function syncLoop() {
        if (visible.length && !tabHidden) startLoop();
        else stopLoop();
    }

    function registerLine(el) {
        if (!el || el.nodeType !== 1) return;
        if (el.getAttribute('data-glitch-bound') === '1') return;
        var original = el.textContent || '';
        if (!original.length) return;
        el.setAttribute('data-glitch-bound', '1');
        el.classList.add('explore-text-glitch');
        var spaces = new Array(original.length);
        var i;
        for (i = 0; i < original.length; i++) {
            spaces[i] = original.charAt(i) === ' ' || original.charAt(i) === '\u00A0';
        }
        var meta = {
            el: el,
            len: original.length,
            spaces: spaces,
            inView: false,
            nextTick: 0,
            accentUntil: 0
        };
        el.textContent = scramble(meta);
        metas.push(meta);
        if (observer) observer.observe(el.closest('.explore-hero-section') || el);
    }

    function registerAll() {
        var nodes = document.querySelectorAll('.explore-hero-text-line');
        var i;
        for (i = 0; i < nodes.length; i++) registerLine(nodes[i]);
        var fills = document.querySelectorAll('.explore-hero-text-fill');
        for (i = 0; i < fills.length; i++) fills[i].classList.add('is-glitch-ready');
        rebuildVisible();
        syncLoop();
    }

    function onIntersect(entries) {
        var i, entry, section, lines, j, el, k, meta;
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            section = entry.target;
            lines = section.classList && section.classList.contains('explore-hero-text-line')
                ? [section]
                : section.querySelectorAll('.explore-hero-text-line');
            for (j = 0; j < lines.length; j++) {
                el = lines[j];
                for (k = 0; k < metas.length; k++) {
                    meta = metas[k];
                    if (meta.el === el) {
                        meta.inView = entry.isIntersecting;
                        if (meta.inView) meta.nextTick = 0;
                        break;
                    }
                }
            }
        }
        rebuildVisible();
        syncLoop();
    }

    function onVisibility() {
        tabHidden = document.hidden;
        if (tabHidden) {
            stopLoop();
        } else {
            var now = performance.now();
            var i;
            for (i = 0; i < visible.length; i++) visible[i].nextTick = now;
            syncLoop();
        }
    }

    function onMotionChange(event) {
        reduced = !!(event && event.matches);
        var i;
        for (i = 0; i < metas.length; i++) {
            clearAccents(metas[i].el);
            metas[i].nextTick = 0;
        }
    }

    function watchNewLines() {
        var root = document.getElementById('exploreProducts') || document.body;
        if (!root || mutationObserver) return;
        mutationObserver = new MutationObserver(function () {
            registerAll();
        });
        mutationObserver.observe(root, { childList: true, subtree: true });
    }

    function init() {
        if (started) {
            registerAll();
            return;
        }
        started = true;
        var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        reduced = !!(motion && motion.matches);
        if (motion) {
            if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
            else if (motion.addListener) motion.addListener(onMotionChange);
        }
        tabHidden = document.hidden;
        observer = new IntersectionObserver(onIntersect, {
            root: null,
            rootMargin: '80px 0px',
            threshold: 0.01
        });
        document.addEventListener('visibilitychange', onVisibility);
        registerAll();
        watchNewLines();
    }

    window.EEKSEYE_textGlitch = { refresh: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
