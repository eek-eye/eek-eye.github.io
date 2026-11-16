/**
 * Home Aesthetic grid: requestAnimationFrame buoyancy for each shirt.
 * A damped spring toward a wandering rest point, layered sine/noise
 * currents, and small rotation that follows velocity. Mouse, scroll,
 * and touch push the shirts, then water-like damping brings them back.
 * Index only. Uses transforms only so clicks and buy links stay intact.
 */
(function () {
    'use strict';

    var grid = document.getElementById('index-explore-grid');
    if (!grid) return;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced) return;

    var shirts = [];
    var rafId = 0;
    var running = false;
    var lastTime = 0;
    var inView = true;
    var pageHidden = document.visibilityState === 'hidden';
    var lastScrollY = window.scrollY || 0;
    var scrollImpulse = 0;
    var pointer = {
        x: 0,
        y: 0,
        on: false,
        vx: 0,
        vy: 0,
        lastX: 0,
        lastY: 0,
        lastT: 0
    };

    var SPRING = 4.8;
    var DAMPING = 3.4;
    var ROT_SPRING = 10;
    var ROT_DAMPING = 4.2;
    var ROT_FROM_VX = 0.07;
    var ROT_MAX = 5.2;
    var PUSH_ACCEL = 340;
    var WAKE = 0.12;
    var SCROLL_FORCE = 9.5;
    var MAX_X = 38;
    var MAX_Y = 46;

    function visibleCard(el) {
        if (!el || el.hidden || el.getAttribute('hidden') !== null) return false;
        var cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
    }

    function hash(n) {
        var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    function collect() {
        shirts = [];
        var nodes = grid.querySelectorAll('#exploreProducts > .explore-hero-section, #exploreProducts > .explore-grid-placeholder');
        Array.prototype.forEach.call(nodes, function (el, i) {
            if (!visibleCard(el)) return;
            var img = el.querySelector('.explore-hero-img, .explore-grid-placeholder-img');
            var info = el.querySelector('.explore-hero-info');
            var targets = [];
            if (img) targets.push(img);
            if (info) targets.push(info);
            if (!targets.length) return;
            var s = i + 1.17;
            shirts.push({
                el: el,
                targets: targets,
                mass: 0.78 + hash(s * 3.1) * 0.7,
                ampX: 7 + hash(s * 5.2) * 10,
                ampY: 11 + hash(s * 8.9) * 12,
                w1: 0.26 + hash(s * 2.4) * 0.22,
                w2: 0.52 + hash(s * 4.7) * 0.38,
                w3: 0.95 + hash(s * 6.1) * 0.55,
                p1: hash(s * 1.3) * Math.PI * 2,
                p2: hash(s * 2.8) * Math.PI * 2,
                p3: hash(s * 3.9) * Math.PI * 2,
                p4: hash(s * 4.4) * Math.PI * 2,
                p5: hash(s * 7.6) * Math.PI * 2,
                seed: s * 12.9898,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                rot: 0,
                rotV: 0,
                cx: 0,
                cy: 0,
                inView: true
            });
        });
    }

    function recollect() {
        var i, s, el, found;
        var saved = shirts.slice();
        collect();
        for (i = 0; i < shirts.length; i++) {
            el = shirts[i].el;
            found = null;
            for (s = 0; s < saved.length; s++) {
                if (saved[s].el === el) { found = saved[s]; break; }
            }
            if (found) {
                shirts[i].x = found.x;
                shirts[i].y = found.y;
                shirts[i].vx = found.vx;
                shirts[i].vy = found.vy;
                shirts[i].rot = found.rot;
                shirts[i].rotV = found.rotV;
                shirts[i].ampX = found.ampX;
                shirts[i].ampY = found.ampY;
                shirts[i].mass = found.mass;
                shirts[i].w1 = found.w1;
                shirts[i].w2 = found.w2;
                shirts[i].w3 = found.w3;
                shirts[i].p1 = found.p1;
                shirts[i].p2 = found.p2;
                shirts[i].p3 = found.p3;
                shirts[i].p4 = found.p4;
                shirts[i].p5 = found.p5;
                shirts[i].seed = found.seed;
            }
        }
        if (shirts.length) {
            grid.classList.add('is-float-physics');
            cacheRects();
            start();
        }
    }

    function cacheRects() {
        var i, s, r, t, img;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            img = s.targets[0];
            if (!img) continue;
            r = img.getBoundingClientRect();
            s.cx = r.left + r.width * 0.5 - s.x;
            s.cy = r.top + r.height * 0.5 - s.y;
            s.inView = r.bottom > -80 && r.top < (window.innerHeight + 80);
            for (t = 0; t < s.targets.length; t++) {
                s.targets[t].style.willChange = s.inView ? 'transform' : 'auto';
            }
        }
    }

    function apply(s) {
        var tx = 'translate3d(' + s.x.toFixed(3) + 'px, ' + s.y.toFixed(3) + 'px, 0) rotate(' + s.rot.toFixed(3) + 'deg)';
        var i;
        for (i = 0; i < s.targets.length; i++) {
            s.targets[i].style.transform = tx;
        }
    }

    function clearTransforms() {
        var i, t, s;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            for (t = 0; t < s.targets.length; t++) {
                s.targets[t].style.transform = '';
                s.targets[t].style.willChange = 'auto';
            }
        }
    }

    function passwordOpen() {
        return !!(grid.querySelector && grid.querySelector('.password-overlay.active'));
    }

    function shouldRun() {
        return inView && !pageHidden && !passwordOpen();
    }

    function currents(s, t) {
        var n = Math.sin(t * 0.31 + s.seed) * Math.sin(t * 0.47 + s.p5) * Math.sin(t * 0.17 + s.seed * 0.4);
        return {
            x: s.ampX * (0.64 * Math.sin(t * s.w1 + s.p1) + 0.26 * Math.sin(t * s.w2 + s.p2) + 0.12 * n),
            y: s.ampY * (0.7 * Math.sin(t * s.w1 * 0.86 + s.p3) + 0.22 * Math.sin(t * s.w2 * 1.07 + s.p4) + 0.12 * n) - s.ampY * 0.06
        };
    }

    function step(s, t, dt) {
        var rest = currents(s, t);
        var fx = 0;
        var fy = 0;
        var mass = s.mass;
        var dx, dy, d, fall, inv, pushR;

        fx += -SPRING * (s.x - rest.x);
        fy += -SPRING * (s.y - rest.y);
        fx += -DAMPING * s.vx;
        fy += -DAMPING * s.vy;

        if (pointer.on) {
            dx = s.cx - pointer.x;
            dy = s.cy - pointer.y;
            d = Math.sqrt(dx * dx + dy * dy);
            pushR = 240;
            if (d < pushR && d > 0.001) {
                fall = 1 - d / pushR;
                fall *= fall;
                inv = 1 / d;
                fx += dx * inv * PUSH_ACCEL * fall;
                fy += dy * inv * PUSH_ACCEL * fall;
                fx += pointer.vx * WAKE * fall;
                fy += pointer.vy * WAKE * fall;
            }
        }

        fy += scrollImpulse * SCROLL_FORCE;

        s.vx += (fx / mass) * dt;
        s.vy += (fy / mass) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.x > MAX_X) { s.x = MAX_X; s.vx *= 0.4; }
        else if (s.x < -MAX_X) { s.x = -MAX_X; s.vx *= 0.4; }
        if (s.y > MAX_Y) { s.y = MAX_Y; s.vy *= 0.4; }
        else if (s.y < -MAX_Y) { s.y = -MAX_Y; s.vy *= 0.4; }

        var targetRot = s.vx * ROT_FROM_VX;
        if (targetRot > ROT_MAX) targetRot = ROT_MAX;
        else if (targetRot < -ROT_MAX) targetRot = -ROT_MAX;
        s.rotV += ((targetRot - s.rot) * ROT_SPRING - s.rotV * ROT_DAMPING) * dt;
        s.rot += s.rotV * dt;
        if (s.rot > ROT_MAX) s.rot = ROT_MAX;
        else if (s.rot < -ROT_MAX) s.rot = -ROT_MAX;
    }

    function frame(now) {
        rafId = 0;
        if (!shouldRun()) {
            running = false;
            lastTime = 0;
            return;
        }
        if (!lastTime) lastTime = now;
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.05) dt = 0.05;
        if (dt < 0.001) dt = 0.001;

        var t = now / 1000;
        scrollImpulse *= Math.pow(0.08, dt);
        if (Math.abs(scrollImpulse) < 0.001) scrollImpulse = 0;
        pointer.vx *= Math.pow(0.12, dt);
        pointer.vy *= Math.pow(0.12, dt);

        var i, s;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            step(s, t, dt);
            if (s.inView) apply(s);
        }

        running = true;
        rafId = window.requestAnimationFrame(frame);
    }

    function start() {
        if (running || !shouldRun()) return;
        cacheRects();
        lastTime = 0;
        running = true;
        rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        lastTime = 0;
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function sync() {
        if (shouldRun()) start();
        else stop();
    }

    function boot() {
        recollect();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    window.setTimeout(recollect, 0);
    window.setTimeout(recollect, 250);

    var products = document.getElementById('exploreProducts');
    if (products && typeof MutationObserver === 'function') {
        var mo = new MutationObserver(function () { recollect(); });
        mo.observe(products, { childList: true });
    }

    if (typeof IntersectionObserver === 'function') {
        var io = new IntersectionObserver(function (entries) {
            inView = !!(entries[0] && entries[0].isIntersecting);
            sync();
        }, { root: null, threshold: 0.05 });
        io.observe(grid);
    }

    document.addEventListener('visibilitychange', function () {
        pageHidden = document.visibilityState === 'hidden';
        sync();
    });

    window.addEventListener('scroll', function () {
        var y = window.scrollY || 0;
        var dy = y - lastScrollY;
        lastScrollY = y;
        scrollImpulse += dy * 0.065;
        if (scrollImpulse > 18) scrollImpulse = 18;
        if (scrollImpulse < -18) scrollImpulse = -18;
        cacheRects();
    }, { passive: true });

    window.addEventListener('resize', function () { window.setTimeout(recollect, 60); });

    function onPointer(e) {
        var now = performance.now();
        var dt = pointer.lastT ? (now - pointer.lastT) / 1000 : 0.016;
        if (dt < 0.001) dt = 0.001;
        if (pointer.on) {
            pointer.vx = (e.clientX - pointer.lastX) / dt;
            pointer.vy = (e.clientY - pointer.lastY) / dt;
        }
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
        pointer.lastT = now;
        pointer.on = true;
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') pointer.on = false;
        pointer.vx = 0;
        pointer.vy = 0;
    }, { passive: true });
    window.addEventListener('pointercancel', function () {
        pointer.on = false;
        pointer.vx = 0;
        pointer.vy = 0;
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
        pointer.on = false;
    });

    document.addEventListener('click', function () {
        window.setTimeout(sync, 0);
    }, true);

    start();
})();
