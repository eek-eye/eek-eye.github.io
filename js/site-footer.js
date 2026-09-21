/**
 * Canonical editorial site footer — injects/replaces footer.site-footer.explore-footer-editorial
 * to match index.html across all pages. Theme classes adapt to page look.
 */
(function () {
    'use strict';

    var CANONICAL_FOOTER_HTML = `<footer class="site-footer explore-footer-editorial">
        <div class="explore-footer-grid">
            <div class="explore-footer-col">
                <h2 class="explore-footer-heading" data-translate="footerNewsletter">Newsletter</h2>
                <p class="explore-footer-note">
                    <a href="contact.html" class="explore-footer-link explore-footer-link--underline" data-translate="footerSubscribeNewsletter">Subscribe to our newsletter</a>
                </p>
            </div>
            <div class="explore-footer-col">
                <h2 class="explore-footer-heading" data-translate="footerClientServices">Client services</h2>
                <ul class="explore-footer-list">
                    <li><a href="faq.html" class="explore-footer-link" data-translate="faq">FAQ</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerTrackOrder">Track order</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerExchanges">Exchanges and returns</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerShipping">Shipping</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerPayment">Payment</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerResell">Re-sell program</a></li>
                </ul>
            </div>
            <div class="explore-footer-col">
                <h2 class="explore-footer-heading" data-translate="footerCompany">The company</h2>
                <ul class="explore-footer-list">
                    <li><a href="#" class="explore-footer-link" data-translate="footerLegal">Legal</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerPrivacy">Privacy policy</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerCookie">Cookie policy</a></li>
                    <li><a href="#" class="explore-footer-link" data-translate="footerCookiesDoNotSell">Cookies settings and do not sell or share</a></li>
                    <li><a href="what-you-need-to-know.html" class="explore-footer-link" data-translate="footerWYNTK">What you need to know</a></li>
                </ul>
            </div>
            <div class="explore-footer-col">
                <h2 class="explore-footer-heading" data-translate="footerFollow">Follow us</h2>
                <ul class="explore-footer-list">
                    <li><a href="#" class="explore-footer-link" target="_blank" rel="noopener noreferrer" data-translate="footerFacebook">Facebook</a></li>
                    <li><a href="https://www.instagram.com/eeks.eye/" class="explore-footer-link" target="_blank" rel="noopener noreferrer" data-translate="footerInstagram">Instagram</a></li>
                    <li><a href="#" class="explore-footer-link" target="_blank" rel="noopener noreferrer" data-translate="footerTikTok">TikTok</a></li>
                    <li><a href="#" class="explore-footer-link" target="_blank" rel="noopener noreferrer" data-translate="footerPinterest">Pinterest</a></li>
                    <li><a href="#" class="explore-footer-link" target="_blank" rel="noopener noreferrer" data-translate="footerLinkedIn">LinkedIn</a></li>
                </ul>
            </div>
            <div class="explore-footer-col">
                <h2 class="explore-footer-heading" data-translate="footerContactUs">Contact us</h2>
                <p class="explore-footer-note" data-translate="footerAdvisorsHours">Our client advisors are available Mon–Fri 9am – 9pm ET &amp; Sat 10am – 7pm ET</p>
                <h3 class="explore-footer-subhead" data-translate="footerLivechat">Livechat</h3>
                <p class="explore-footer-note"><a href="contact.html" class="explore-footer-link explore-footer-link--underline" data-translate="footerUnavailable">Our client advisors are currently unavailable</a></p>
                <h3 class="explore-footer-subhead" data-translate="footerCallUs">Call us</h3>
                <p class="explore-footer-note"><a href="tel:+16468891895" class="explore-footer-link">+1 646 889 1895</a></p>
                <h3 class="explore-footer-subhead" data-translate="footerEmailUs">Email us</h3>
                <p class="explore-footer-note"><a href="contact.html" class="explore-footer-link explore-footer-link--underline" data-translate="footerEmailUs">Email us</a></p>
            </div>
        </div>
        <div class="explore-footer-bottom">
            <a href="#" id="copyright-link" data-translate="copyrightFooter">© 2026 Eeks Eye</a>
        </div>
    </footer>`;

    function themeClassForBody(body) {
        if (!body) {
            return '';
        }
        var cl = body.classList;
        if (cl.contains('explore-page') || cl.contains('about-page')) {
            return '';
        }
        if (cl.contains('news-page')) {
            return 'explore-footer-theme-news';
        }
        if (cl.contains('dark-theme') || cl.contains('designs-page')) {
            return '';
        }
        return 'explore-footer-theme-light';
    }

    function applyTheme(footer) {
        footer.classList.remove(
            'explore-footer-theme-classic',
            'explore-footer-theme-light',
            'explore-footer-theme-news'
        );
        var theme = themeClassForBody(document.body);
        if (theme) {
            footer.classList.add(theme);
        }
        footer.removeAttribute('hidden');
    }

    function buildFooter() {
        var tpl = document.createElement('template');
        tpl.innerHTML = CANONICAL_FOOTER_HTML.trim();
        var footer = tpl.content.querySelector('footer');
        if (!footer) {
            return null;
        }
        applyTheme(footer);
        return footer;
    }

    function pageUsesScaleWrap() {
        return !!document.querySelector('.explore-footer-scale-wrap');
    }

    function insertBeforeLateScripts(node) {
        var body = document.body;
        if (!body) {
            return;
        }
        var scripts = body.querySelectorAll('script');
        var anchor = null;
        for (var i = 0; i < scripts.length; i++) {
            var s = scripts[i];
            // Prefer first script that looks like a late page script (src under js/ or translation)
            var src = s.getAttribute('src') || '';
            if (src && (src.indexOf('js/') !== -1 || src.indexOf('translation') !== -1 || src.indexOf('cdn.') !== -1)) {
                anchor = s;
                break;
            }
            if (!src) {
                // inline script near end — use as anchor if nothing better yet
                if (!anchor) {
                    anchor = s;
                }
            }
        }
        if (anchor) {
            body.insertBefore(node, anchor);
        } else {
            body.appendChild(node);
        }
    }

    function syncFooter() {
        var canonical = buildFooter();
        if (!canonical) {
            return;
        }

        var existing = document.querySelector('footer.site-footer.explore-footer-editorial');
        if (existing) {
            // Parent .explore-footer-scale-wrap (if any) is preserved
            existing.replaceWith(canonical);
        } else {
            if (pageUsesScaleWrap()) {
                var wrap = document.createElement('div');
                wrap.className = 'explore-footer-scale-wrap';
                wrap.appendChild(canonical);
                insertBeforeLateScripts(wrap);
            } else {
                insertBeforeLateScripts(canonical);
            }
        }

        if (window.EeksFooterLinks && typeof window.EeksFooterLinks.init === 'function') {
            window.EeksFooterLinks.init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncFooter);
    } else {
        syncFooter();
    }
})();
