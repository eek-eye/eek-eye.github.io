/**
 * Wire editorial footer placeholder links to real destinations.
 * Works with data-translate keys (index, designs) and plain text (explore, about).
 */
(function () {
    'use strict';

    var LINKS = {
        footerTrackOrder: 'contact.html?subject=Track%20order',
        footerExchanges: 'faq.html#returns',
        footerShipping: 'what-you-need-to-know.html#shopping',
        footerPayment: 'what-you-need-to-know.html#shopping',
        footerResell: 'contact.html?subject=Re-sell%20program',
        footerLegal: 'legal.html',
        footerPrivacy: 'legal.html#privacy',
        footerCookie: 'legal.html#cookies',
        footerFacebook: 'https://www.facebook.com/eeks.eye',
        footerInstagram: 'https://www.instagram.com/eeks.eye/',
        footerTikTok: 'https://www.tiktok.com/@eeks.eye',
        footerPinterest: 'https://www.pinterest.com/eeks_eye/',
        footerLinkedIn: 'https://www.artstation.com/eekseye',
        footerStoreAppointment: 'contact.html?subject=Store%20appointment',
        footerFindStore: 'designs.html',
        footerSubscribeNewsletter: 'contact.html?subject=Newsletter%20subscription',
        'Track order': 'contact.html?subject=Track%20order',
        'Exchanges and returns': 'faq.html#returns',
        Shipping: 'what-you-need-to-know.html#shopping',
        Payment: 'what-you-need-to-know.html#shopping',
        'Re-sell program': 'contact.html?subject=Re-sell%20program',
        Legal: 'legal.html',
        'Privacy policy': 'legal.html#privacy',
        'Cookie policy': 'legal.html#cookies',
        'Cookies settings and do not sell or share': '#cookie-settings',
        Facebook: 'https://www.facebook.com/eeks.eye',
        TikTok: 'https://www.tiktok.com/@eeks.eye',
        Pinterest: 'https://www.pinterest.com/eeks_eye/',
        LinkedIn: 'https://www.artstation.com/eekseye',
        'Subscribe to our newsletter': 'contact.html?subject=Newsletter%20subscription'
    };

    function resolveHref(link) {
        var key = link.getAttribute('data-translate');
        if (key && LINKS[key]) {
            return LINKS[key];
        }
        var text = (link.textContent || '').trim();
        return LINKS[text] || null;
    }

    function bindCookieSettings(link) {
        link.setAttribute('href', 'legal.html#cookies');
        link.addEventListener('click', function (e) {
            if (window.EeksCookies && window.EeksCookies.openSettings) {
                e.preventDefault();
                window.EeksCookies.openSettings();
            }
        });
    }

    function initFooterLinks() {
        document.querySelectorAll('.explore-footer-link[href="#"]').forEach(function (link) {
            var href = resolveHref(link);
            if (!href) {
                return;
            }
            if (href === '#cookie-settings') {
                bindCookieSettings(link);
                return;
            }
            link.setAttribute('href', href);
        });
    }

    window.EeksFooterLinks = { init: initFooterLinks };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooterLinks);
    } else {
        initFooterLinks();
    }
})();
