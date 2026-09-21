/**
 * Keep the site visually at ~100% size when the browser is zoomed
 * with Ctrl+scroll / Ctrl+/- (down to ~25%).
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var busy = false;
  var timer = null;
  var lastApplied = 1;

  function readBrowserZoom() {
    // Chromium Ctrl+/- : outer/inner tracks zoom while our CSS zoom is cleared
    if (window.outerWidth > 0 && window.innerWidth > 0) {
      var z = window.outerWidth / window.innerWidth;
      if (isFinite(z) && z >= 0.15 && z <= 5) return z;
    }
    if (window.visualViewport && window.visualViewport.scale > 0) {
      return window.visualViewport.scale;
    }
    return 1;
  }

  function apply() {
    if (busy) return;
    busy = true;
    try {
      // Clear so measurement is not skewed by our own compensation
      root.style.zoom = '';
      void root.offsetWidth;

      var browserZoom = readBrowserZoom();
      var compensate = 1 / browserZoom;
      if (!isFinite(compensate) || compensate < 0.5 || compensate > 8) {
        compensate = 1;
      }
      if (Math.abs(compensate - 1) < 0.04) {
        if (lastApplied !== 1) {
          root.style.zoom = '';
          lastApplied = 1;
        }
        return;
      }
      // Snap to common zoom steps to reduce jitter
      compensate = Math.round(compensate * 100) / 100;
      if (compensate !== lastApplied) {
        root.style.zoom = String(compensate);
        lastApplied = compensate;
      } else {
        root.style.zoom = String(compensate);
      }
    } finally {
      busy = false;
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(apply, 16);
  }

  // Prefer blocking Ctrl+scroll zoom so size never changes
  function blockZoomWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }
  function blockZoomKeys(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    var k = e.key;
    if (k === '+' || k === '-' || k === '=' || k === '_' || k === '0' ||
        e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 48) {
      e.preventDefault();
    }
  }

  window.addEventListener('wheel', blockZoomWheel, { passive: false, capture: true });
  window.addEventListener('keydown', blockZoomKeys, true);

  // Fallback if zoom still changes (browser UI, trackpad gestures, etc.)
  apply();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule);
    window.visualViewport.addEventListener('scroll', schedule);
  }
})();
