/**
 * Stripe checkout client — open the product's Payment Link.
 * Region is detected automatically (Cloudflare country, then timezone/locale).
 * US links are free shipping (US addresses only). International links include
 * a $35 USD shipping line and exclude the United States, so buyers cannot
 * take free shipping to a non-US address.
 */
(function () {
    'use strict';

    var GEO_URL = 'https://eekseye-orders.pages.dev/geo';
    var STORAGE_KEY = 'eeks_ship_region';
    var US_TIMEZONES = {
        'America/Adak': 1,
        'America/Anchorage': 1,
        'America/Boise': 1,
        'America/Chicago': 1,
        'America/Denver': 1,
        'America/Detroit': 1,
        'America/Indiana/Indianapolis': 1,
        'America/Indiana/Knox': 1,
        'America/Indiana/Marengo': 1,
        'America/Indiana/Petersburg': 1,
        'America/Indiana/Tell_City': 1,
        'America/Indiana/Vevay': 1,
        'America/Indiana/Vincennes': 1,
        'America/Indiana/Winamac': 1,
        'America/Juneau': 1,
        'America/Kentucky/Louisville': 1,
        'America/Kentucky/Monticello': 1,
        'America/Los_Angeles': 1,
        'America/Menominee': 1,
        'America/Metlakatla': 1,
        'America/New_York': 1,
        'America/Nome': 1,
        'America/North_Dakota/Beulah': 1,
        'America/North_Dakota/Center': 1,
        'America/North_Dakota/New_Salem': 1,
        'America/Phoenix': 1,
        'America/Sitka': 1,
        'America/Yakutat': 1,
        'Pacific/Honolulu': 1
    };

    var detectedRegion = '';
    var detectPromise = null;

    function getProduct(productId) {
        var id = parseInt(productId, 10);
        if (!id || !window.EXPLORE_PRODUCTS || !window.EXPLORE_PRODUCTS[id]) {
            return null;
        }
        return window.EXPLORE_PRODUCTS[id];
    }

    function setButtonState(btn, state) {
        if (!btn) return;
        if (state === 'loading') {
            btn.disabled = true;
            btn.dataset.stripeOriginalText = btn.textContent;
            btn.textContent = 'Redirecting to checkout…';
            btn.setAttribute('aria-busy', 'true');
        } else if (state === 'idle') {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            if (btn.dataset.stripeOriginalText) {
                btn.textContent = btn.dataset.stripeOriginalText;
            }
        }
    }

    function showError(message) {
        if (typeof window.alert === 'function') {
            window.alert(message);
        }
    }

    function readOverride() {
        try {
            var value = sessionStorage.getItem(STORAGE_KEY);
            if (value === 'us' || value === 'intl') return value;
        } catch (err) {}
        return '';
    }

    function writeOverride(region) {
        try {
            sessionStorage.setItem(STORAGE_KEY, region);
        } catch (err) {}
    }

    function prefersReducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (err) {
            return false;
        }
    }

    function regionFromTimezone() {
        try {
            var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').trim();
            if (!tz || tz === 'UTC' || tz.indexOf('Etc/') === 0) return '';
            if (US_TIMEZONES[tz]) return 'us';
            return 'intl';
        } catch (err) {
            return '';
        }
    }

    function regionFromLocale() {
        var langs = [];
        try {
            if (navigator.languages && navigator.languages.length) {
                langs = Array.prototype.slice.call(navigator.languages);
            } else if (navigator.language) {
                langs = [navigator.language];
            }
        } catch (err) {
            return '';
        }
        for (var i = 0; i < langs.length; i++) {
            var match = String(langs[i] || '').match(/[-_]([A-Za-z]{2})$/);
            if (!match) continue;
            var code = match[1].toUpperCase();
            if (code === 'US') continue;
            return 'intl';
        }
        return '';
    }

    function regionFromWorker() {
        var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = setTimeout(function () {
            if (ctrl) ctrl.abort();
        }, 2500);
        return fetch(GEO_URL, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            signal: ctrl ? ctrl.signal : undefined
        }).then(function (res) {
            if (!res.ok) return '';
            return res.json();
        }).then(function (data) {
            if (data && (data.region === 'us' || data.region === 'intl')) return data.region;
            return '';
        }).catch(function () {
            return '';
        }).then(function (region) {
            clearTimeout(timer);
            return region;
        });
    }

    function detectRegion() {
        var override = readOverride();
        if (override) return Promise.resolve(override);
        if (detectedRegion) return Promise.resolve(detectedRegion);
        if (detectPromise) return detectPromise;
        detectPromise = regionFromWorker().then(function (fromWorker) {
            if (fromWorker) return fromWorker;
            var fromTz = regionFromTimezone();
            if (fromTz) return fromTz;
            var fromLocale = regionFromLocale();
            if (fromLocale) return fromLocale;
            return 'us';
        }).then(function (region) {
            if (!readOverride()) detectedRegion = region;
            return readOverride() || region;
        });
        return detectPromise;
    }

    function statusCopy(region) {
        return region === 'intl'
            ? 'Shipping to International · $35'
            : 'Shipping to United States · free';
    }

    function ensureShipStyles() {
        if (document.getElementById('eeks-ship-status-styles')) return;
        var style = document.createElement('style');
        style.id = 'eeks-ship-status-styles';
        style.textContent =
            '.ship-to{display:flex;align-items:baseline;justify-content:center;flex-wrap:wrap;gap:.15rem .55rem;width:100%;margin:0;font-size:.8rem;color:#777;line-height:1.45;text-align:center;min-height:1.45em;}' +
            '.ship-to-text{display:inline-block;transition:opacity .28s ease;}' +
            '.ship-to.is-pending .ship-to-text,.ship-to.is-updating .ship-to-text{opacity:0;}' +
            '.ship-to-change{background:none;border:none;padding:0;margin:0;font:inherit;font-size:.8rem;color:#777;text-decoration:underline;text-underline-offset:.15em;cursor:pointer;letter-spacing:.02em;}' +
            '.ship-to-change:hover,.ship-to-change:focus-visible{color:#111;}' +
            '@media (prefers-reduced-motion: reduce){.ship-to-text{transition:none;}}' +
            'body.dark-theme .ship-to,body.dark-theme .ship-to-change{color:#aaa;}' +
            'body.dark-theme .ship-to-change:hover,body.dark-theme .ship-to-change:focus-visible{color:#f5f5f5;}';
        document.head.appendChild(style);
    }

    function buildStatusEl() {
        var el = document.createElement('p');
        el.className = 'ship-to is-pending';
        el.setAttribute('aria-live', 'polite');
        el.innerHTML =
            '<span class="ship-to-text">Detecting shipping…</span>' +
            '<button type="button" class="ship-to-change">change</button>';
        return el;
    }

    function paintStatus(el, region, animate) {
        var textEl = el.querySelector('.ship-to-text');
        var changeEl = el.querySelector('.ship-to-change');
        var next = statusCopy(region);
        el.setAttribute('data-region', region);
        if (changeEl) changeEl.hidden = false;
        if (!textEl) return;
        if (!animate || prefersReducedMotion() || textEl.textContent === next) {
            textEl.textContent = next;
            el.classList.remove('is-pending', 'is-updating');
            return;
        }
        el.classList.add('is-updating');
        window.setTimeout(function () {
            textEl.textContent = next;
            el.classList.remove('is-pending', 'is-updating');
        }, 200);
    }

    function syncStatus(region, animate) {
        var nodes = document.querySelectorAll('.ship-to');
        for (var i = 0; i < nodes.length; i++) paintStatus(nodes[i], region, animate);
    }

    function toggleRegion() {
        detectRegion().then(function (current) {
            var next = current === 'intl' ? 'us' : 'intl';
            writeOverride(next);
            detectedRegion = next;
            syncStatus(next, true);
        });
    }

    function bindStatus(el) {
        var changeEl = el.querySelector('.ship-to-change');
        if (!changeEl || changeEl.dataset.bound === '1') return;
        changeEl.dataset.bound = '1';
        changeEl.addEventListener('click', function (e) {
            e.preventDefault();
            toggleRegion();
        });
    }

    function mountShipTo(target) {
        if (!target) return;
        ensureShipStyles();
        var el = target.classList && target.classList.contains('ship-to')
            ? target
            : (target.querySelector && target.querySelector('.ship-to'));
        if (!el) {
            el = buildStatusEl();
            target.appendChild(el);
        }
        bindStatus(el);
        detectRegion().then(function (region) {
            paintStatus(el, region, true);
        });
    }

    function paymentLinkFor(product, destination) {
        if (destination === 'intl') {
            return (product && product.stripePaymentLinkIntl) ? String(product.stripePaymentLinkIntl).trim() : '';
        }
        return (product && product.stripePaymentLink) ? String(product.stripePaymentLink).trim() : '';
    }

    async function runCheckout(productId, buttonEl, customerEmail, destination) {
        var product = getProduct(productId);
        if (!product) {
            showError('This product is not available for checkout.');
            return;
        }

        var link = paymentLinkFor(product, destination);
        if (!link) {
            showError(destination === 'intl'
                ? 'International checkout is not available for this product yet.'
                : 'Checkout is not available for this product yet.');
            return;
        }

        if (customerEmail && link.indexOf('prefilled_email') === -1) {
            link += (link.indexOf('?') >= 0 ? '&' : '?') + 'prefilled_email=' + encodeURIComponent(customerEmail);
        }
        setButtonState(buttonEl, 'loading');
        window.location.href = link;
    }

    async function startCheckout(productId, buttonEl, destination) {
        var product = getProduct(productId);
        if (!product) {
            showError('This product is not available for checkout.');
            return;
        }

        var dest = (destination === 'intl' || destination === 'us') ? destination : await detectRegion();
        if (!dest) dest = 'us';

        var productInfo = {
            id: productId,
            title: product.title || product.name || ('Product #' + productId)
        };

        if (window.EeksAbandonedCheckout && typeof window.EeksAbandonedCheckout.captureAndProceed === 'function') {
            await window.EeksAbandonedCheckout.captureAndProceed(productInfo, function (email) {
                return runCheckout(productId, buttonEl, email, dest);
            });
            return;
        }

        await runCheckout(productId, buttonEl, null, dest);
    }

    function bindPurchaseButton(buttonEl, productId) {
        if (!buttonEl) return;
        buttonEl.addEventListener('click', function (e) {
            e.preventDefault();
            startCheckout(productId, buttonEl);
        });
    }

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        var existing = document.getElementById('ship-to-status');
        if (existing) mountShipTo(existing);
    });

    window.EeksStripeCheckout = {
        startCheckout: startCheckout,
        bindPurchaseButton: bindPurchaseButton,
        mountShipTo: mountShipTo
    };
})();
