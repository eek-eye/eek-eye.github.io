'use strict';

/**
 * Stripe webhook → FedEx PDF label.
 * Configure endpoint: /.netlify/functions/stripe-fedex-webhook
 * Events: checkout.session.completed
 *
 * Requires STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FedEx env (see FEDEX_SETUP.md).
 * Until FedEx credentials are set, responds with a clear 503 so Stripe retries after setup.
 */

const Stripe = require('stripe');
const { createLabelPdf } = require('../../lib/fedex-ship');

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    var secretKey = process.env.STRIPE_SECRET_KEY;
    var whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !whSecret) {
        return { statusCode: 503, body: 'Stripe webhook is not configured.' };
    }

    var stripe = new Stripe(secretKey);
    var sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    var stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, whSecret);
    } catch (err) {
        return { statusCode: 400, body: 'Webhook signature verification failed: ' + err.message };
    }

    if (stripeEvent.type !== 'checkout.session.completed') {
        return { statusCode: 200, body: JSON.stringify({ received: true, ignored: stripeEvent.type }) };
    }

    var session = stripeEvent.data.object;
    if (session.payment_status && session.payment_status !== 'paid') {
        return { statusCode: 200, body: JSON.stringify({ received: true, skipped: 'not_paid' }) };
    }

    // Prefer Stripe shipping details collected at Checkout
    var ship = session.shipping_details || session.collected_information && session.collected_information.shipping_details || {};
    var addr = ship.address || {};
    var recipient = {
        name: ship.name || session.customer_details && session.customer_details.name || 'Customer',
        phone: (session.customer_details && session.customer_details.phone) || '0000000000',
        email: (session.customer_details && session.customer_details.email) || session.customer_email || null,
        streetLines: [addr.line1, addr.line2].filter(Boolean),
        line1: addr.line1,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postal_code,
        country: addr.country || 'US',
        residential: true
    };

    if (!process.env.FEDEX_CLIENT_ID || !process.env.FEDEX_CLIENT_SECRET) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                error: 'FedEx credentials not configured yet',
                sessionId: session.id,
                hint: 'See FEDEX_SETUP.md'
            })
        };
    }

    try {
        var label = await createLabelPdf({
            recipient: recipient,
            orderId: session.id,
            weightLb: process.env.DEFAULT_PACKAGE_WEIGHT_LB || 1
        });

        // Optional: email notify (PDF as link/notice — attach via your mail provider later)
        var notify = process.env.LABEL_NOTIFY_EMAIL;
        if (notify && process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID_LABEL) {
            try {
                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: process.env.EMAILJS_PUBLIC_KEY,
                        service_id: process.env.EMAILJS_SERVICE_ID,
                        template_id: process.env.EMAILJS_TEMPLATE_ID_LABEL,
                        template_params: {
                            to_email: notify,
                            tracking_number: label.trackingNumber || '',
                            order_id: session.id,
                            subject: 'FedEx label ready — ' + (label.trackingNumber || session.id),
                            message:
                                'A FedEx label was created for Stripe session ' +
                                session.id +
                                '. Tracking: ' +
                                (label.trackingNumber || 'pending') +
                                '. Open your Netlify function logs or labels drop folder to print the PDF.'
                        }
                    })
                });
            } catch (mailErr) {
                console.warn('Label email notify failed', mailErr);
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ok: true,
                sessionId: session.id,
                trackingNumber: label.trackingNumber,
                hasLabelPdf: Boolean(label.labelPdfBase64)
            })
        };
    } catch (err) {
        console.error('FedEx label error', err.details || err);
        return {
            statusCode: err.statusCode || 500,
            body: JSON.stringify({ error: err.message || 'FedEx failed', details: err.details || null })
        };
    }
};
