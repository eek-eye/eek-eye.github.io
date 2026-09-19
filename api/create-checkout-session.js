'use strict';

const Stripe = require('stripe');
const {
    createCheckoutSession,
    parsePriceMap,
    getOriginFromRequest
} = require('../lib/stripe-checkout');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    var secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return res.status(503).json({ error: 'Stripe is not configured on the server yet.' });
    }

    var body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
    }

    var productId = body && body.productId;
    if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
    }

    var priceMap = parsePriceMap();
    if (!Object.keys(priceMap).length) {
        return res.status(503).json({ error: 'No Stripe prices configured. Set STRIPE_PRICE_IDS.' });
    }

    try {
        var stripe = new Stripe(secretKey);
        var session = await createCheckoutSession(stripe, {
            productId: productId,
            customerEmail: (body && (body.customerEmail || body.email)) || null,
            origin: getOriginFromRequest(req),
            priceMap: priceMap
        });
        return res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (err) {
        var status = err.statusCode || 500;
        return res.status(status).json({ error: err.message || 'Checkout failed' });
    }
};
