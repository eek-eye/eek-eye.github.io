/**
 * Stripe public config (safe to commit — no secret keys).
 * See STRIPE_SETUP.md for full setup steps.
 */
window.EeksStripeConfig = {
    /**
     * Serverless checkout endpoint.
     * Vercel:  '/api/create-checkout-session'
     * Netlify: '/.netlify/functions/create-checkout-session'
     */
    checkoutApiUrl: '/api/create-checkout-session',

    /** Optional — for future Stripe.js features (Payment Element, etc.) */
    publishableKey: 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY'
};
