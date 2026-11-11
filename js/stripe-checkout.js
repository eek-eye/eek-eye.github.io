/**
 * Stripe checkout client — open the product's Payment Link.
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

    function paymentLinkFor(product) {
        return (product && product.stripePaymentLink) ? String(product.stripePaymentLink).trim() : '';
    }

    async function runCheckout(productId, buttonEl, customerEmail) {
        var product = getProduct(productId);
        if (!product) {
            showError('This product is not available for checkout.');
            return;
        }

        var link = paymentLinkFor(product);
        if (!link) {
            showError('Checkout is not available for this product yet.');
            return;
        }

        if (customerEmail && link.indexOf('prefilled_email') === -1) {
            link += (link.indexOf('?') >= 0 ? '&' : '?') + 'prefilled_email=' + encodeURIComponent(customerEmail);
        }
        setButtonState(buttonEl, 'loading');
        window.location.href = link;
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
