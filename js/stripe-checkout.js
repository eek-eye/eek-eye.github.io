/**
 * Stripe checkout client — open the product's Payment Link.
 * US links are free shipping (US addresses only). International links
 * include a $35 USD shipping line and exclude the United States, so
 * buyers cannot take free shipping to a non-US address.
 */
(function () {
    'use strict';

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

    function destFromPage() {
        var el = document.querySelector('input[name="ship-to"]:checked');
        if (el && el.value === 'intl') return 'intl';
        if (el && el.value === 'us') return 'us';
        return '';
    }

    function ensureShipStyles() {
        if (document.getElementById('eeks-ship-styles')) return;
        var style = document.createElement('style');
        style.id = 'eeks-ship-styles';
        style.textContent =
            '.eeks-ship-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1.25rem;}' +
            '.eeks-ship-dialog{background:#fff;color:#111;max-width:22rem;width:100%;padding:1.4rem 1.35rem 1.25rem;border-radius:4px;font-family:inherit;}' +
            '.eeks-ship-dialog h2{margin:0 0 .6rem;font-size:1rem;letter-spacing:.08em;text-transform:uppercase;}' +
            '.eeks-ship-dialog p{margin:0 0 1rem;font-size:.9rem;line-height:1.45;color:#444;}' +
            '.eeks-ship-actions{display:flex;flex-direction:column;gap:.5rem;}' +
            '.eeks-ship-actions button{width:100%;padding:.8rem 1rem;border:1px solid #111;background:#111;color:#fff;font:inherit;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}' +
            '.eeks-ship-actions button.eeks-ship-alt{background:#fff;color:#111;}' +
            '.eeks-ship-actions button.eeks-ship-cancel{border-color:transparent;background:transparent;color:#666;text-transform:none;letter-spacing:0;}';
        document.head.appendChild(style);
    }

    function promptDestination() {
        return new Promise(function (resolve) {
            ensureShipStyles();
            var wrap = document.createElement('div');
            wrap.className = 'eeks-ship-overlay';
            wrap.setAttribute('role', 'dialog');
            wrap.setAttribute('aria-label', 'Choose shipping destination');
            wrap.innerHTML =
                '<div class="eeks-ship-dialog">' +
                '<h2>Ship to</h2>' +
                '<p>Free US shipping · $35 international. The checkout page only accepts the destination you choose here.</p>' +
                '<div class="eeks-ship-actions">' +
                '<button type="button" class="eeks-ship-us">United States · free</button>' +
                '<button type="button" class="eeks-ship-alt eeks-ship-intl">International · $35</button>' +
                '<button type="button" class="eeks-ship-cancel">Cancel</button>' +
                '</div></div>';
            function finish(value) {
                if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
                resolve(value);
            }
            wrap.querySelector('.eeks-ship-us').onclick = function () { finish('us'); };
            wrap.querySelector('.eeks-ship-intl').onclick = function () { finish('intl'); };
            wrap.querySelector('.eeks-ship-cancel').onclick = function () { finish(''); };
            wrap.addEventListener('click', function (e) {
                if (e.target === wrap) finish('');
            });
            document.body.appendChild(wrap);
            wrap.querySelector('.eeks-ship-us').focus();
        });
    }

    async function resolveDestination(explicit) {
        if (explicit === 'intl' || explicit === 'us') return explicit;
        var fromPage = destFromPage();
        if (fromPage) return fromPage;
        return promptDestination();
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

        var dest = await resolveDestination(destination);
        if (!dest) return;

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

    window.EeksStripeCheckout = {
        startCheckout: startCheckout,
        bindPurchaseButton: bindPurchaseButton
    };
})();
