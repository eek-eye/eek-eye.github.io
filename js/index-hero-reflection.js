/**
 * Home hero water reflection: a flipped, darkened copy of the mannequin
 * is painted onto a 1x canvas under a faint horizon, with a light ripple.
 * Pauses when the tab is hidden or the hero is off-screen. Reduced motion
 * keeps a still reflection (no ripple animation).
 */
(function () {
    'use strict';

    var canvas = document.getElementById('hero-reflection-canvas');
    var water = canvas && canvas.closest('.hero-water');
    var hero = document.querySelector('.hero-section');
    if (!canvas || !water || !hero) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var rafId = 0;
    var paintUntil = 0;
    var inView = true;
    var pageHidden = false;

    if (reduced) {
        var anim = document.querySelector('#heroWaterTurbulence animate');
        if (anim) anim.remove();
        var disp = document.querySelector('#heroWaterRipple feDisplacementMap');
        if (disp) disp.setAttribute('scale', '0');
    }

    function cssNumber(el, prop) {
        var v = parseFloat((window.getComputedStyle(el)[prop] || '0').toString());
        return isFinite(v) ? v : 0;
    }

    function shouldPaint() {
        return inView && !pageHidden;
    }

    function paint() {
        rafId = 0;
        if (!shouldPaint()) return;

        var wr = water.getBoundingClientRect();
        var hr = hero.getBoundingClientRect();
        if (wr.width < 2 || wr.height < 2) return;

        var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
        var dpr = window.devicePixelRatio || 1;
        if (coarse) dpr = Math.min(dpr, 1.25);
        else dpr = Math.min(dpr, 2);
        var scale = coarse ? 0.7 : 1;
        var bw = Math.max(1, Math.floor(wr.width * dpr * scale));
        var bh = Math.max(1, Math.floor(wr.height * dpr * scale));
        if (canvas.width !== bw || canvas.height !== bh) {
            canvas.width = bw;
            canvas.height = bh;
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, bw, bh);
        var sx = bw / wr.width;
        var sy = bh / wr.height;
        ctx.setTransform(sx, 0, 0, sy, 0, 0);

        var imgs = hero.querySelectorAll('.hero-mannequin-air .hero-gone-image');
        var i, img, op, r, destX, destY;

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = coarse ? 'low' : 'medium';
        // Flip around the horizon (y = 0 in water space) so the figure
        // meets the water line feet-to-feet and reads upside down.
        ctx.scale(1, -1);

        for (i = 0; i < imgs.length; i++) {
            img = imgs[i];
            if (!img.complete || img.naturalWidth < 1) continue;
            op = cssNumber(img, 'opacity');
            if (op < 0.04) continue;
            r = img.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            destX = r.left - wr.left;
            destY = r.top - wr.top;
            ctx.globalAlpha = op * 0.95;
            /* Past asset is darker; apply the same lift as the on-page figure
               before the reflection's own dim/tint. */
            ctx.filter = (img.classList.contains('hero-gone-image-1')
                ? 'brightness(2.7) contrast(1.1) '
                : '') + 'brightness(0.8) saturate(0.8) hue-rotate(196deg)';
            try {
                /* Crop to the body in the 4000² art so the reflection
                   matches the left-aligned on-page figure box. */
                var nw = img.naturalWidth;
                var nh = img.naturalHeight;
                ctx.drawImage(
                    img,
                    nw * 0.401, nh * 0.110, nw * 0.190, nh * 0.740,
                    destX, destY, r.width, r.height
                );
            } catch (err) {}
        }

        ctx.restore();

        /* Fade the flipped figure itself: brightest at the feet (y = 0),
           smoothly gone by the bottom. Same soft look as the visible
           fading feet, stretched over the whole reflected body. */
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var fade = ctx.createLinearGradient(0, 0, 0, bh);
        fade.addColorStop(0, 'rgba(0,0,0,1)');
        fade.addColorStop(0.18, 'rgba(0,0,0,0.88)');
        fade.addColorStop(0.48, 'rgba(0,0,0,0.58)');
        fade.addColorStop(0.78, 'rgba(0,0,0,0.22)');
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, bw, bh);
        ctx.globalCompositeOperation = 'source-over';

        if (Date.now() < paintUntil && shouldPaint()) {
            rafId = window.requestAnimationFrame(paint);
        }
    }

    function requestPaint(durationMs) {
        if (durationMs) paintUntil = Math.max(paintUntil, Date.now() + durationMs);
        if (rafId) return;
        rafId = window.requestAnimationFrame(paint);
    }

    function onSourceChange() {
        // Cover the 2.5s clip/fade plus a short tail.
        requestPaint(2800);
    }

    var sources = hero.querySelectorAll('.hero-mannequin-air .hero-gone-image');
    sources.forEach(function (img) {
        if (!img.complete) img.addEventListener('load', function () { requestPaint(0); }, { once: true });
        if (typeof MutationObserver === 'function') {
            var mo = new MutationObserver(onSourceChange);
            mo.observe(img, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    });

    window.addEventListener('resize', function () { requestPaint(0); });
    window.addEventListener('orientationchange', function () { requestPaint(200); });

    document.addEventListener('visibilitychange', function () {
        pageHidden = document.visibilityState === 'hidden';
        if (!pageHidden) requestPaint(0);
    });

    if (typeof IntersectionObserver === 'function') {
        var io = new IntersectionObserver(function (entries) {
            inView = !!(entries[0] && entries[0].isIntersecting);
            if (inView) requestPaint(0);
        }, { root: null, threshold: 0.05 });
        io.observe(hero);
    }

    if (document.readyState === 'complete') requestPaint(0);
    else window.addEventListener('load', function () { requestPaint(400); });
    requestPaint(0);
})();
