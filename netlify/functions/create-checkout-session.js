'use strict';

const Stripe = require('stripe');
const {
    createCheckoutSession,
    parsePriceMap,
    getOriginFromRequest
} = require('../../lib/stripe-checkout');

exports.handler = async function (event) {
    var headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    var secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return {
            statusCode: 503,
            headers: headers,
            body: JSON.stringify({ error: 'Stripe is not configured on the server yet.' })
        };
    }

    var body = {};
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
        return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    if (!body.productId) {
        return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'productId is required' }) };
    }

    var priceMap = parsePriceMap();
    if (!Object.keys(priceMap).length) {
        return {
            statusCode: 503,
            headers: headers,
            body: JSON.stringify({ error: 'No Stripe prices configured. Set STRIPE_PRICE_IDS.' })
        };
    }

    try {
        var stripe = new Stripe(secretKey);
        var session = await createCheckoutSession(stripe, {
            productId: body.productId,
            customerEmail: body.customerEmail || body.email || null,
            origin: getOriginFromRequest({ headers: event.headers }),
            priceMap: priceMap
        });
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ url: session.url, sessionId: session.id })
        };
    } catch (err) {
        var status = err.statusCode || 500;
        return {
            statusCode: status,
            headers: headers,
            body: JSON.stringify({ error: err.message || 'Checkout failed' })
        };
    }
};
