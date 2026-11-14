/**
 * Aesthetic page: a deliberate upward overscroll at the very top
 * fades into the black void and returns to the home-page footer.
 * Disabled during the downward arrival and for a short time after load.
 */
(function () {
    'use strict';

    var WHEEL_THRESHOLD = 200;
    var TOUCH_THRESHOLD = 130;
    var armed = false;
    var triggered = false;
    var acc = 0;
    var controlling = false;
    var decayTimer = 0;
    var touchStartY = 0;
    var touching = false;

    function overlay() {
        return document.querySelector('.page-transition-overlay');
    }

    function atTop() {
        var y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        return y <= 1;
    }

    function blocked() {
        if (!armed || triggered) return true;
        var root = document.documentElement;
        if (root.classList.contains('void-arriving')) return true;
        return false;
    }

    function paint(p) {
        var ov = overlay();
        if (!ov) return;
        if (p <= 0) {
            if (controlling) {
                ov.style.transition = 'opacity 0.3s linear';
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
        ov.style.opacity = String(Math.min(1, p));
    }

    function resetAcc() {
        acc = 0;
        paint(0);
    }

    function scheduleDecay() {
        if (decayTimer) window.clearTimeout(decayTimer);
        decayTimer = window.setTimeout(function () {
            decayTimer = 0;
            if (!triggered) resetAcc();
        }, 480);
    }

    function bump(amount, threshold) {
        if (blocked() || !atTop()) {
            resetAcc();
            return;
        }
        acc += amount;
        var p = Math.min(1, acc / threshold);
        paint(p);
        scheduleDecay();
        if (acc >= threshold) go();
    }

    function go() {
        if (triggered) return;
        triggered = true;
        if (decayTimer) window.clearTimeout(decayTimer);
        try {
            sessionStorage.setItem('eekseyeVoidReturn', '1');
        } catch (err) {}
        var ov = overlay();
        if (ov) {
            ov.classList.remove('fade-out');
            ov.style.transition = 'opacity 0.18s linear';
            ov.style.opacity = '1';
        }
        var dest = new URL('index.html', window.location.href);
        dest.searchParams.set('from', 'void-up');
        window.setTimeout(function () {
            window.location.href = dest.href;
        }, 140);
    }

    function onWheel(e) {
        if (blocked()) return;
        if (!atTop()) {
            resetAcc();
            return;
        }
        if (e.deltaY >= 0) {
            if (acc > 0) {
                acc = Math.max(0, acc - e.deltaY);
                paint(acc / WHEEL_THRESHOLD);
                if (acc === 0) resetAcc();
                else scheduleDecay();
            }
            return;
        }
        bump(-e.deltaY, WHEEL_THRESHOLD);
    }

    function onTouchStart(e) {
        if (blocked() || !e.touches || !e.touches.length) return;
        touchStartY = e.touches[0].clientY;
        touching = atTop();
        if (touching) acc = 0;
    }

    function onTouchMove(e) {
        if (!touching || blocked()) return;
        if (!atTop()) {
            touching = false;
            resetAcc();
            return;
        }
        var y = e.touches[0].clientY;
        var dy = y - touchStartY;
        if (dy <= 0) {
            acc = 0;
            paint(0);
            return;
        }
        acc = dy;
        paint(Math.min(1, acc / TOUCH_THRESHOLD));
        if (dy > 24 && e.cancelable) e.preventDefault();
        if (acc >= TOUCH_THRESHOLD) go();
    }

    function onTouchEnd() {
        touching = false;
        if (!triggered) scheduleDecay();
    }

    function arm() {
        armed = true;
    }

    function init() {
        window.setTimeout(function () {
            if (!document.documentElement.classList.contains('void-arriving')) {
                arm();
                return;
            }
            var tries = 0;
            var t = window.setInterval(function () {
                tries += 1;
                if (!document.documentElement.classList.contains('void-arriving') || tries > 40) {
                    window.clearInterval(t);
                    window.setTimeout(arm, 400);
                }
            }, 100);
        }, 700);

        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('touchcancel', onTouchEnd, { passive: true });
        window.addEventListener('scroll', function () {
            if (!atTop() && !triggered) resetAcc();
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
