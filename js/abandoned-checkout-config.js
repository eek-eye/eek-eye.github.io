/**
 * Abandoned checkout recovery config (safe to commit — EmailJS public key only).
 * Create the EmailJS template, then set emailJsTemplateId (see ABANDONED_CHECKOUT_SETUP.md).
 */
window.EeksAbandonedCheckoutConfig = {
    emailJsPublicKey: '4NNKONRfDtWHf7PIK',
    emailJsServiceId: 'service_ty390sa',
    /** Replace after creating the template in EmailJS */
    emailJsTemplateId: 'template_abandoned_checkout',
    replyTo: 'fuchendeonze@gmail.com',
    /** Return-based: send when visitor comes back after this delay */
    delayMs: 60 * 60 * 1000,
    /** Timed job (GitHub Action) looks for intents older than this */
    timedDelayMs: 60 * 60 * 1000,
    siteUrl: 'https://eekseye.com',
    firestoreCollection: 'abandoned_checkouts'
};
