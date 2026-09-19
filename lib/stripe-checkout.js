'use strict';

/**
 * Shared Stripe Checkout session creation (Vercel + Netlify).
 * @param {import('stripe').Stripe} stripe
 * @param {{ productId: string|number, origin: string, priceMap: Record<string, string> }} opts
 */
async function createCheckoutSession(stripe, opts) {
    var productId = String(opts.productId || '').trim();
    var origin = (opts.origin || '').replace(/\/$/, '');
    var priceMap = opts.priceMap || {};

    if (!productId || !priceMap[productId]) {
        var err = new Error('Unknown or unavailable product.');
        err.statusCode = 400;
        throw err;
    }

    var priceId = priceMap[productId];

    var sessionParams = {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: origin + '/checkout-success.html?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: origin + '/checkout-cancel.html',
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'JP'] },
        metadata: { productId: productId }
    };
    if (opts.customerEmail) {
        sessionParams.customer_email = String(opts.customerEmail).trim();
    }
    return stripe.checkout.sessions.create(sessionParams);
}

function parsePriceMap() {
    var raw = process.env.STRIPE_PRICE_IDS;
    if (!raw) {
        return {};
    }
    try {
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        console.error('Invalid STRIPE_PRICE_IDS JSON');
        return {};
    }
}

function getOriginFromRequest(req) {
    var proto = req.headers['x-forwarded-proto'] || 'https';
    var host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host) {
        return proto + '://' + host;
    }
    return process.env.SITE_URL || 'https://eekseye.com';
}

module.exports = {
    createCheckoutSession: createCheckoutSession,
    parsePriceMap: parsePriceMap,
    getOriginFromRequest: getOriginFromRequest
};
