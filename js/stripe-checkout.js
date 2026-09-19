/**
 * Stripe checkout client — call serverless API or open a Payment Link.
 */
(function () {
    'use strict';

    function getConfig() {
        return window.EeksStripeConfig || {};
    }

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

    async function runCheckout(productId, buttonEl, customerEmail) {
        var product = getProduct(productId);
        if (!product) {
            showError('This product is not available for checkout.');
            return;
        }

        if (product.stripePaymentLink) {
            var link = product.stripePaymentLink;
            if (customerEmail && link.indexOf('prefilled_email') === -1) {
                link += (link.indexOf('?') >= 0 ? '&' : '?') + 'prefilled_email=' + encodeURIComponent(customerEmail);
            }
            window.location.href = link;
            return;
        }

        var config = getConfig();
        var apiUrl = config.checkoutApiUrl;
        if (!apiUrl) {
            showError('Stripe checkout is not configured yet. Add your API URL in js/stripe-config.js.');
            return;
        }

        setButtonState(buttonEl, 'loading');

        try {
            var payload = { productId: String(productId) };
            if (customerEmail) payload.customerEmail = customerEmail;
            var res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            var data = await res.json().catch(function () {
                return {};
            });

            if (!res.ok) {
                throw new Error(data.error || 'Could not start checkout.');
            }

            if (data.url) {
                window.location.href = data.url;
                return;
            }

            throw new Error('Checkout URL missing from server response.');
        } catch (err) {
            setButtonState(buttonEl, 'idle');
            showError(err.message || 'Checkout failed. Please try again.');
        }
    }

    async function startCheckout(productId, buttonEl) {
        var product = getProduct(productId);
        if (!product) {
            showError('This product is not available for checkout.');
            return;
        }

        var productInfo = {
            id: productId,
            title: product.title || product.name || ('Product #' + productId)
        };

        if (window.EeksAbandonedCheckout && typeof window.EeksAbandonedCheckout.captureAndProceed === 'function') {
            await window.EeksAbandonedCheckout.captureAndProceed(productInfo, function (email) {
                return runCheckout(productId, buttonEl, email);
            });
            return;
        }

        await runCheckout(productId, buttonEl, null);
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
