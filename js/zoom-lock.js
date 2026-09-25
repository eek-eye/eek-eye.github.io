/**
 * Pin page visual size. Blocks Ctrl+scroll zoom when possible;
 * otherwise scales the document back so it matches the size at first load (~100%).
 * 
 * MOBILE: This script is disabled on touch/mobile devices to preserve
 * native pinch-zoom accessibility and avoid layout issues.
 */
(function () {
  'use strict';

  // Detect mobile/touch devices and skip zoom-lock entirely
  function isMobileOrTouch() {
    // Check for touch capability
    var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // Check viewport width (phones are typically <768px)
    var isNarrow = window.innerWidth <= 768;
    // Check user agent for mobile keywords
    var mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return hasTouch && (isNarrow || mobileUA);
  }

  // Exit early on mobile - do not apply zoom lock
  if (isMobileOrTouch()) {
    return;
  }

  var root = document.documentElement;
  var body = null;
  var baselineDpr = window.devicePixelRatio || 1;
  var busy = false;
  var timer = null;

  function pageRoot() {
    return document.body || root;
  }

  function browserZoomFactor() {
    var dpr = window.devicePixelRatio || 1;
    var fromDpr = dpr / baselineDpr;
    var fromOuter = 1;
    if (window.outerWidth > 40 && window.innerWidth > 40) {
      fromOuter = window.outerWidth / window.innerWidth;
    }
    // Prefer DPR ratio (tracks Ctrl+/- in Chromium). Fall back to outer/inner.
    var z = fromDpr;
    if (!isFinite(z) || z < 0.1 || z > 5) z = fromOuter;
    // If outer/inner says we're zoomed but DPR baseline matched (refresh at zoom), trust outer
    if (Math.abs(fromOuter - 1) > 0.12 && Math.abs(fromDpr - 1) < 0.08) {
      z = fromOuter;
      // Recalibrate baseline so further steps work
      baselineDpr = dpr / fromOuter;
    }
    if (!isFinite(z) || z < 0.15) z = 0.15;
    if (z > 5) z = 5;
    return z;
  }

  function clearPin(el) {
    el.style.transform = '';
    el.style.transformOrigin = '';
    el.style.width = '';
    el.style.minHeight = '';
    el.style.zoom = '';
  }

  function apply() {
    if (busy) return;
    busy = true;
    try {
      var el = pageRoot();
      clearPin(el);
      clearPin(root);
      void root.offsetWidth;

      var z = browserZoomFactor();
      var compensate = 1 / z;
      if (Math.abs(compensate - 1) < 0.05) {
        return;
      }
      if (compensate > 8) compensate = 8;
      if (compensate < 0.5) compensate = 0.5;

      // Prefer CSS zoom where supported (Chrome/Edge/Safari); transform fallback
      el.style.transformOrigin = 'top left';
      el.style.zoom = String(compensate);
      // Transform backup for engines that ignore zoom on body
      if (!('zoom' in root.style) || /firefox/i.test(navigator.userAgent)) {
        el.style.zoom = '';
        el.style.transform = 'scale(' + compensate + ')';
        el.style.width = 100 / compensate + '%';
        el.style.minHeight = 100 / compensate + 'vh';
      }
    } finally {
      busy = false;
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(apply, 0);
  }

  function blockWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  function blockGesture(e) {
    e.preventDefault();
  }
  function blockKeys(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    var code = e.keyCode || e.which;
    var key = e.key;
    if (
      key === '+' || key === '-' || key === '=' || key === '_' || key === '0' ||
      code === 187 || code === 189 || code === 48 || code === 107 || code === 109 || code === 61
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  var opts = { passive: false, capture: true };
  window.addEventListener('wheel', blockWheel, opts);
  window.addEventListener('mousewheel', blockWheel, opts);
  document.addEventListener('wheel', blockWheel, opts);
  window.addEventListener('keydown', blockKeys, true);
  document.addEventListener('keydown', blockKeys, true);
  window.addEventListener('gesturestart', blockGesture, opts);
  window.addEventListener('gesturechange', blockGesture, opts);
  window.addEventListener('gestureend', blockGesture, opts);

  function boot() {
    body = document.body;
    baselineDpr = window.devicePixelRatio || 1;
    apply();
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule);
    window.visualViewport.addEventListener('scroll', schedule);
  }
  // Catch zoom that only changes DPR
  try {
    matchMedia('screen and (min-resolution: 1dppx)').addEventListener('change', schedule);
  } catch (e) {}
  setInterval(apply, 500);
})();
