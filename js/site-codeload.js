/**
 * Command-prompt page load + scroll code-reveal.
 * Types a short build for the current page, then compiles the site in.
 * As major blocks first enter the viewport they briefly appear as code.
 * Visual only. Secrets are scrubbed. Does not wrap or transform shirts.
 */
(function () {
    'use strict';

    if (window.__EEKSEYE_CODELOAD__) return;
    window.__EEKSEYE_CODELOAD__ = true;

    var html = document.documentElement;
    var reduced = false;
    try {
        reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (err) {}

    var params = {};
    try { params = new URLSearchParams(window.location.search); } catch (err) {}
    var forceOff = params.get('codeload') === 'off' || html.classList.contains('eeks-codeload-skip');
    var hold = params.get('codeload') === 'hold' || !!window.EEKSEYE_CODELOAD_HOLD;
    var skipFlag = reduced || forceOff || html.classList.contains('void-arriving') || html.classList.contains('void-returning');

    /* Take over the plain black entrance so this terminal is the load. */
    window.EEKSEYE_skipEntrance = true;

    var INTRO_TYPE_MS = 1280;
    var COMPILE_MS = 560;
    var FAILSAFE_MS = 2500;
    var REVEAL_TYPE_MS = 380;
    var REVEAL_RESOLVE_MS = 480;
    var MAX_CONCURRENT = 2;

    var finished = false;
    var overlay = null;
    var bodyEl = null;
    var cursorEl = null;
    var failsafeTimer = 0;
    var rafId = 0;

    function pageFile() {
        var path = (window.location.pathname || '/').split('/').pop() || '';
        if (!path || path === '/') return 'index.html';
        return path;
    }

    function scrub(text) {
        if (!text) return '';
        text = String(text);
        text = text.replace(/emailjs\.init\(\s*['"][^'"]+['"]\s*\)/gi, "emailjs.init('/* omitted */')");
        text = text.replace(/['"]service_[a-zA-Z0-9]+['"]/g, "'/* omitted */'");
        text = text.replace(/['"]template_[a-zA-Z0-9_]+['"]/g, "'/* omitted */'");
        text = text.replace(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g, 'https://buy.stripe.com//* omitted */');
        text = text.replace(/pk_(live|test)_[A-Za-z0-9]+/g, 'pk_omitted');
        text = text.replace(/sk_(live|test)_[A-Za-z0-9]+/g, 'sk_omitted');
        text = text.replace(/AIza[0-9A-Za-z_\-]{20,}/g, '/* omitted */');
        text = text.replace(/(apiKey\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(messagingSenderId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(appId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(measurementId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsPublicKey\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsServiceId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsTemplateId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(authDomain\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(projectId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(storageBucket\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, '/* omitted */');
        return text;
    }

    function hideEntranceOverlay() {
        var entrance = document.querySelector('.page-transition-overlay');
        if (!entrance) return;
        entrance.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        entrance.classList.add('fade-out');
        entrance.style.opacity = '0';
        entrance.style.pointerEvents = 'none';
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function snippetLines(limit) {
        var raw = '';
        try { raw = document.documentElement.innerHTML || ''; } catch (err) {}
        raw = scrub(raw);
        var lines = raw.split('\n');
        var out = [];
        var i, t;
        for (i = 0; i < lines.length && out.length < (limit || 8); i++) {
            t = lines[i].replace(/\s+/g, ' ').trim();
            if (t.length < 12 || t.length > 140) continue;
            if (t.indexOf('<script') !== -1 || t.indexOf('<style') !== -1) continue;
            if (t.indexOf('omitted') !== -1) continue;
            if (/^<!--/.test(t)) continue;
            if (/<(link|meta|div|section|main|footer|nav|h1|title|button|img)\b/i.test(t) || /class=|id=/.test(t)) {
                out.push(t);
            }
        }
        if (!out.length) {
            out = [
                '<!DOCTYPE html>',
                '<html lang="en">',
                '  <head><title>EEKSEYE</title></head>',
                '  <body class="booting">'
            ];
        }
        return out;
    }

    function flavorFor(file) {
        var map = {
            'index.html': [
                '  compiling cloth.physics --pixelate --amp 2x ........ ok',
                '  mounting mannequin.reflect --center ............... ok',
                '  linking sources.panel --width 10% ................. ok'
            ],
            'explore.html': [
                '  compiling runway.grid --seasons 1..5 .............. ok',
                '  mounting product.tiles --click-to-buy ............. ok'
            ],
            'designs.html': [
                '  compiling designs.catalog ......................... ok',
                '  mounting carousel.track ........................... ok'
            ],
            'design-detail.html': [
                '  resolving design from querystring ................. ok',
                '  compiling detail.view ............................. ok'
            ],
            'product.html': [
                '  resolving sku from querystring .................... ok',
                '  mounting checkout --public-only ................... ok'
            ],
            'contact.html': [
                '  compiling contact.form ............................ ok',
                '  linking outbound channels ......................... ok'
            ],
            'about.html': [
                '  compiling about.statement ......................... ok',
                '  linking stewardship notes ......................... ok'
            ],
            'legal.html': [
                '  compiling legal.privacy cookies ................... ok'
            ],
            'faq.html': [
                '  compiling faq.items ............................... ok'
            ],
            'news.html': [
                '  compiling news.flyers --paste-up .................. ok'
            ],
            'what-you-need-to-know.html': [
                '  compiling briefing.md ............................. ok'
            ],
            'xi.html': [
                '  XI_RELEASE = 11-11-2026',
                '  compiling xi.gate ................................. ok'
            ],
            'checkout-success.html': [
                '  confirming order.session .......................... ok'
            ],
            'checkout-cancel.html': [
                '  restoring cart.session ............................ ok'
            ]
        };
        return map[file] || ['  compiling page.modules ............................. ok'];
    }

    function buildProgram(file) {
        var snippets = snippetLines(6);
        var flavor = flavorFor(file);
        var lines = [];
        function add(kind, text) {
            lines.push({ kind: kind, text: text });
        }
        add('dim', 'EEKSEYE [Version XI 11.11.2026]');
        add('dim', '(c) XI. All rights reserved.');
        add('blank', '');
        add('prompt', 'C:\\eekseye> boot --page ' + file);
        add('ok', '[XI] kernel ready   release 11.11.2026');
        add('prompt', 'C:\\eekseye> type ' + file);
        snippets.forEach(function (s) { add('code', '  ' + s); });
        add('prompt', 'C:\\eekseye> compile --release');
        flavor.forEach(function (s) { add('ok', s); });
        add('ok', '  0 errors. 11 warnings suppressed.');
        add('blank', '');
        add('prompt', 'C:\\eekseye> ');
        return lines;
    }

    function lineClass(kind) {
        if (kind === 'prompt') return 'eeks-codeload-line eeks-codeload-prompt';
        if (kind === 'ok') return 'eeks-codeload-line eeks-codeload-ok';
        if (kind === 'dim') return 'eeks-codeload-line eeks-codeload-dim';
        if (kind === 'code') return 'eeks-codeload-line eeks-codeload-code';
        return 'eeks-codeload-line';
    }

    function mountOverlay(file) {
        overlay = document.createElement('div');
        overlay.id = 'eeks-codeload';
        overlay.setAttribute('role', 'presentation');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML =
            '<div class="eeks-codeload-bar">' +
                '<div class="eeks-codeload-dots" aria-hidden="true"><span></span><span></span><span></span></div>' +
                '<div class="eeks-codeload-title">C:\\eekseye\\cmd.exe  —  ' + file + '</div>' +
                '<div class="eeks-codeload-skip-hint">click / key / scroll to skip</div>' +
            '</div>' +
            '<div class="eeks-codeload-body"></div>' +
            '<div class="eeks-codeload-sweep" aria-hidden="true"></div>';
        html.appendChild(overlay);
        bodyEl = overlay.querySelector('.eeks-codeload-body');
        html.classList.remove('eeks-codeload-boot');
        html.classList.add('eeks-codeload-active');
    }

    function attachCursor(node) {
        if (cursorEl && cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
        cursorEl = document.createElement('span');
        cursorEl.className = 'eeks-codeload-cursor';
        if (node) node.appendChild(cursorEl);
    }

    function finishIntro(immediate) {
        if (finished) return;
        finished = true;
        if (failsafeTimer) {
            clearTimeout(failsafeTimer);
            failsafeTimer = 0;
        }
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        detachSkip();
        hideEntranceOverlay();
        html.classList.remove('eeks-codeload-boot');
        html.classList.add('eeks-codeload-done');
        html.classList.remove('eeks-codeload-active');

        function clearOverlay() {
            if (overlay) {
                overlay.classList.add('eeks-codeload--gone');
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                overlay = null;
            }
            initScrollReveal();
        }

        if (!overlay) {
            clearOverlay();
            return;
        }
        if (immediate || reduced) {
            clearOverlay();
            return;
        }
        overlay.classList.add('eeks-codeload--compile');
        setTimeout(clearOverlay, COMPILE_MS + 40);
    }

    function onSkip(e) {
        if (finished) return;
        if (e) {
            if (e.type === 'wheel' || e.type === 'touchmove') {
                try { e.preventDefault(); } catch (err) {}
            }
        }
        finishIntro(false);
    }

    function attachSkip() {
        document.addEventListener('click', onSkip, true);
        document.addEventListener('keydown', onSkip, true);
        document.addEventListener('wheel', onSkip, { capture: true, passive: false });
        document.addEventListener('touchmove', onSkip, { capture: true, passive: false });
    }

    function detachSkip() {
        document.removeEventListener('click', onSkip, true);
        document.removeEventListener('keydown', onSkip, true);
        document.removeEventListener('wheel', onSkip, true);
        document.removeEventListener('touchmove', onSkip, true);
    }

    function runIntro() {
        var file = pageFile();
        var program = buildProgram(file);
        mountOverlay(file);
        attachSkip();

        var nodes = [];
        var i;
        for (i = 0; i < program.length; i++) {
            var row = document.createElement('div');
            row.className = lineClass(program[i].kind);
            bodyEl.appendChild(row);
            nodes.push(row);
        }

        var totalChars = 0;
        for (i = 0; i < program.length; i++) totalChars += (program[i].text || '').length;
        if (totalChars < 1) totalChars = 1;

        var started = performance.now();
        var lastShown = -1;

        function frame(now) {
            if (finished) return;
            var t = Math.min(1, (now - started) / INTRO_TYPE_MS);
            /* Ease slightly so early header lines land fast, then code streams. */
            var eased = t < 0.15 ? (t / 0.15) * 0.22 : 0.22 + Math.pow((t - 0.15) / 0.85, 0.85) * 0.78;
            var budget = Math.floor(eased * totalChars);
            var used = 0;
            var lineIndex = 0;
            var col = 0;
            for (i = 0; i < program.length; i++) {
                var len = (program[i].text || '').length;
                if (used + len <= budget) {
                    used += len;
                    lineIndex = i;
                    col = len;
                } else {
                    lineIndex = i;
                    col = Math.max(0, budget - used);
                    break;
                }
            }
            for (i = 0; i <= lineIndex; i++) {
                var full = program[i].text || '';
                var shown = (i < lineIndex) ? full : full.slice(0, col);
                if (i !== lastShown || i === lineIndex) {
                    nodes[i].textContent = shown;
                }
            }
            lastShown = lineIndex;
            attachCursor(nodes[lineIndex]);
            if (bodyEl && nodes[lineIndex] && nodes[lineIndex].offsetTop > bodyEl.clientHeight - 36) {
                bodyEl.scrollTop = bodyEl.scrollHeight;
            }
            if (t >= 1) {
                if (hold) return;
                finishIntro(false);
                return;
            }
            rafId = requestAnimationFrame(frame);
        }

        rafId = requestAnimationFrame(frame);
        failsafeTimer = setTimeout(function () {
            if (!hold) finishIntro(true);
        }, FAILSAFE_MS);
    }

    /* ---------- scroll reveals ---------- */

    var revealSelector = [
        '.hero-section',
        '#index-explore-grid .explore-hero-section',
        '#exploreProducts > .explore-hero-section',
        '.about-content',
        '.product-image-column',
        '.product-info-column',
        '.checkout-result',
        '.faq-item',
        '.legal-section',
        'article.flyer',
        '.designs-category',
        '.design-card',
        '.content-section',
        '.contact-info',
        '.contact-form',
        'main > section:not([hidden])',
        'main > article',
        '.site-footer.explore-footer-editorial'
    ].join(',');

    var skipClosest = [
        '#eeks-codeload',
        '.site-devtools',
        '.page-transition-overlay',
        '.cookie-consent-banner',
        '.cookie-settings-panel',
        '.eeks-profile-overlay',
        '.hero-gone-image-modal',
        '.contact-dropdown',
        '.contact-dropdown-overlay',
        '.currency-dropdown',
        'script',
        'style',
        'template',
        '[hidden]'
    ].join(',');

    var revealed = new WeakSet();
    var activeCount = 0;
    var queue = [];

    function isSkipped(el) {
        if (!el || el.nodeType !== 1) return true;
        if (revealed.has(el)) return true;
        if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return true;
        if (el.classList.contains('eeks-codereveal-mask')) return true;
        try {
            if (el.closest(skipClosest)) return true;
        } catch (err) {}
        var cs = window.getComputedStyle(el);
        if (!cs || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return true;
        return false;
    }

    function bigEnough(el) {
        var r = el.getBoundingClientRect();
        return r.width >= 64 && r.height >= 48;
    }

    function inFirstView(el) {
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        return visible > Math.min(r.height, vh) * 0.35 && r.top < vh * 0.88;
    }

    function sourceLinesFor(el, fillHeight) {
        var raw = '';
        try { raw = el.outerHTML || ''; } catch (err) {}
        raw = scrub(raw).replace(/\s+/g, ' ').trim();
        var parts = [];
        var tag = (el.tagName || 'div').toLowerCase();
        var id = el.id ? '#' + el.id : '';
        var cls = (el.className && typeof el.className === 'string')
            ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
            : '';
        parts.push('<span class="eeks-codereveal-k">C:\\eekseye&gt;</span> compile ' + escapeHtml(tag + id));
        if (cls) parts.push('  mount ' + escapeHtml(cls));
        if (raw) {
            var chunks = raw.slice(0, 1200).match(/.{1,78}/g) || [raw];
            var n;
            for (n = 0; n < Math.min(12, chunks.length); n++) {
                parts.push('  ' + escapeHtml(chunks[n]));
            }
        }
        parts.push('<span class="eeks-codereveal-k">  ok</span>  —  XI 11 11 2026');
        /* Tile enough lines that a tall section still looks like code in the viewport. */
        var need = Math.max(16, Math.ceil((Math.min(fillHeight || 400, window.innerHeight || 800) + 80) / 18));
        var tiled = parts.slice();
        var i = 0;
        while (tiled.length < need) {
            tiled.push(parts[i % parts.length]);
            i += 1;
        }
        return tiled.join('\n');
    }

    function placeMask(mask, el) {
        var r = el.getBoundingClientRect();
        mask.style.top = Math.round(r.top) + 'px';
        mask.style.left = Math.round(r.left) + 'px';
        mask.style.width = Math.max(0, Math.round(r.width)) + 'px';
        mask.style.height = Math.max(0, Math.round(r.height)) + 'px';
        /* Keep the typed lines in the visible slice of a tall section. */
        var linesEl = mask.querySelector('.eeks-codereveal-lines');
        if (linesEl) {
            var offset = Math.max(0, Math.round(-r.top + 8));
            linesEl.style.transform = 'translateY(' + offset + 'px)';
        }
    }

    function playReveal(el) {
        if (finished === false) return;
        if (isSkipped(el) || !bigEnough(el)) return;
        revealed.add(el);
        activeCount += 1;

        var mask = document.createElement('div');
        mask.className = 'eeks-codereveal-mask';
        mask.setAttribute('aria-hidden', 'true');
        var lines = document.createElement('div');
        lines.className = 'eeks-codereveal-lines';
        mask.appendChild(lines);
        document.body.appendChild(mask);
        placeMask(mask, el);

        var htmlLines = sourceLinesFor(el, Math.min(el.getBoundingClientRect().height, window.innerHeight || 800));
        var parts = htmlLines.split('\n');
        var moveRaf = 0;

        function follow() {
            if (!mask.parentNode) return;
            placeMask(mask, el);
            moveRaf = requestAnimationFrame(follow);
        }
        moveRaf = requestAnimationFrame(follow);

        function showLines(n) {
            lines.innerHTML = parts.slice(0, n).join('\n');
        }

        function finishReveal() {
            showLines(parts.length);
            mask.classList.add('is-resolving');
            setTimeout(function () {
                if (moveRaf) cancelAnimationFrame(moveRaf);
                if (mask.parentNode) mask.parentNode.removeChild(mask);
                activeCount = Math.max(0, activeCount - 1);
                flushQueue();
            }, REVEAL_RESOLVE_MS + 40);
        }

        /* A few lines type in, then the rest of the wall appears, then it compiles away. */
        showLines(Math.min(4, parts.length));
        setTimeout(function () { showLines(parts.length); }, 90);
        setTimeout(finishReveal, REVEAL_TYPE_MS);
    }

    function flushQueue() {
        while (activeCount < MAX_CONCURRENT && queue.length) {
            var next = queue.shift();
            if (!isSkipped(next) && bigEnough(next)) playReveal(next);
        }
    }

    function requestReveal(el) {
        if (isSkipped(el) || !bigEnough(el)) return;
        if (activeCount >= MAX_CONCURRENT) {
            queue.push(el);
            return;
        }
        playReveal(el);
    }

    function initScrollReveal() {
        if (reduced || forceOff) return;
        if (!('IntersectionObserver' in window)) return;

        var nodes = [];
        try { nodes = document.querySelectorAll(revealSelector); } catch (err) { return; }
        var targets = [];
        var i, el;
        for (i = 0; i < nodes.length; i++) {
            el = nodes[i];
            if (isSkipped(el) || !bigEnough(el)) continue;
            /* Nested matches: keep the outer block, drop children already covered. */
            var covered = false;
            var j;
            for (j = 0; j < targets.length; j++) {
                if (targets[j] !== el && targets[j].contains(el)) { covered = true; break; }
            }
            if (covered) continue;
            /* If this new node contains a previous target, drop the child. */
            targets = targets.filter(function (t) { return t === el || !el.contains(t); });
            targets.push(el);
        }

        for (i = 0; i < targets.length; i++) {
            if (inFirstView(targets[i])) revealed.add(targets[i]);
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                if (entry.intersectionRatio < 0.16) return;
                io.unobserve(entry.target);
                requestReveal(entry.target);
            });
        }, { threshold: [0.16, 0.32, 0.5], rootMargin: '0px 0px -8% 0px' });

        for (i = 0; i < targets.length; i++) {
            if (!revealed.has(targets[i])) io.observe(targets[i]);
        }
    }

    function start() {
        if (skipFlag) {
            html.classList.remove('eeks-codeload-boot', 'eeks-codeload-active');
            html.classList.add('eeks-codeload-done', 'eeks-codeload-skip');
            hideEntranceOverlay();
            if (!reduced && !forceOff) initScrollReveal();
            return;
        }
        runIntro();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
