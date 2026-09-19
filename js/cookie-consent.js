/**
 * Cookie consent + preference storage (currency, country, symbol, language).
 * After "Accept", choices are stored in the eeks_prefs cookie and mirrored from localStorage.
 * window.EeksCookies — use on any page after this script loads.
 */
(function () {
    'use strict';

    var CONSENT_NAME = 'cookie_consent';
    var CONSENT_VALUE = 'accepted';
    var PREF_NAME = 'eeks_prefs';
    var CONSENT_STORAGE_KEY = 'eeks_cookie_consent';
    var COOKIE_DAYS = 365;

    function getCookie(name) {
        var match = document.cookie.match(
            new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
        );
        return match ? decodeURIComponent(match[1]) : null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var d = new Date();
            d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + d.toUTCString();
        }
        var secure = window.location.protocol === 'https:' ? '; Secure' : '';
        var maxAgeSec = days ? Math.floor(days * 24 * 60 * 60) : '';
        var maxAgePart = maxAgeSec !== '' ? '; max-age=' + maxAgeSec : '';
        document.cookie =
            name +
            '=' +
            encodeURIComponent(value) +
            expires +
            maxAgePart +
            '; path=/; SameSite=Lax' +
            secure;
    }

    function hasLocalConsentFlag() {
        try {
            return localStorage.getItem(CONSENT_STORAGE_KEY) === CONSENT_VALUE;
        } catch (e) {
            return false;
        }
    }

    function setLocalConsentFlag() {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_VALUE);
        } catch (e) {}
    }

    /** True after first Accept — cookie and/or localStorage so the banner stays hidden */
    function hasConsent() {
        return getCookie(CONSENT_NAME) === CONSENT_VALUE || hasLocalConsentFlag();
    }

    function loadPreferences() {
        var raw = getCookie(PREF_NAME);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function savePreferences(prefs) {
        if (!hasConsent() || !prefs) {
            return;
        }
        try {
            var payload = {
                currency: prefs.currency || 'USD',
                country: prefs.country || 'US',
                symbol: prefs.symbol || '$',
                language: prefs.language || 'en'
            };
            setCookie(PREF_NAME, JSON.stringify(payload), COOKIE_DAYS);
        } catch (e) {}
    }

    function readLocalPrefs() {
        return {
            currency: localStorage.getItem('selectedCurrency') || 'USD',
            country: localStorage.getItem('selectedCountry') || 'US',
            symbol: localStorage.getItem('selectedSymbol') || '$',
            language: localStorage.getItem('selectedLanguage') || 'en'
        };
    }

    function writeLocalPrefs(p) {
        try {
            localStorage.setItem('selectedCurrency', p.currency);
            localStorage.setItem('selectedCountry', p.country);
            localStorage.setItem('selectedSymbol', p.symbol);
            localStorage.setItem('selectedLanguage', p.language);
        } catch (e) {}
    }

    /** Prefer cookie (if consented + valid); else localStorage defaults */
    function getEffectivePreferences() {
        if (hasConsent()) {
            var c = loadPreferences();
            if (c && c.currency) {
                return {
                    currency: c.currency,
                    country: c.country || 'US',
                    symbol: c.symbol || '$',
                    language: c.language || 'en'
                };
            }
        }
        return readLocalPrefs();
    }

    function syncEffectiveToLocalStorage() {
        var p = getEffectivePreferences();
        writeLocalPrefs(p);
        return p;
    }

    function migrateLocalStorageToCookie() {
        savePreferences(readLocalPrefs());
    }

    function clearConsent() {
        setCookie(CONSENT_NAME, '', -1);
        setCookie(PREF_NAME, '', -1);
        try {
            localStorage.removeItem(CONSENT_STORAGE_KEY);
        } catch (e) {}
    }

    function openSettings() {
        var existing = document.getElementById('cookie-settings-panel');
        if (existing) {
            existing.remove();
        }

        if (!document.getElementById('cookie-settings-inline-styles')) {
            var panelStyle = document.createElement('style');
            panelStyle.id = 'cookie-settings-inline-styles';
            panelStyle.textContent =
                '.cookie-settings-panel{position:fixed;inset:0;z-index:10060;background:rgba(0,0,0,0.85);' +
                'display:flex;align-items:center;justify-content:center;padding:1rem;}' +
                '.cookie-settings-panel__card{background:#111;color:#fff;max-width:420px;width:100%;' +
                'padding:1.5rem;border-radius:8px;border:1px solid #333;font-family:inherit;}' +
                '.cookie-settings-panel__card h3{margin:0 0 0.75rem;font-size:1.1rem;}' +
                '.cookie-settings-panel__card p{margin:0 0 1rem;font-size:0.9rem;line-height:1.5;color:#ccc;}' +
                '.cookie-settings-panel__actions{display:flex;gap:0.75rem;flex-wrap:wrap;}' +
                '.cookie-settings-panel__actions button{border:none;padding:0.5rem 1rem;border-radius:4px;' +
                'cursor:pointer;font-weight:600;font-size:0.9rem;}' +
                '.cookie-settings-panel__accept{background:#fff;color:#000;}' +
                '.cookie-settings-panel__reset{background:transparent;color:#fff;border:1px solid #555 !important;}' +
                '.cookie-settings-panel__close{position:absolute;top:0.75rem;right:0.75rem;background:none;' +
                'border:none;color:#fff;font-size:1.25rem;cursor:pointer;}';
            document.head.appendChild(panelStyle);
        }

        var overlay = document.createElement('div');
        overlay.id = 'cookie-settings-panel';
        overlay.className = 'cookie-settings-panel';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Cookie settings');
        overlay.innerHTML =
            '<div class="cookie-settings-panel__card" style="position:relative">' +
            '<button type="button" class="cookie-settings-panel__close" aria-label="Close">&times;</button>' +
            '<h3>Cookie settings</h3>' +
            '<p>We use cookies to remember your language, currency, and region. ' +
            'Read our <a href="legal.html#cookies" style="color:#fff">cookie policy</a>.</p>' +
            '<div class="cookie-settings-panel__actions">' +
            '<button type="button" class="cookie-settings-panel__accept">Keep current settings</button>' +
            '<button type="button" class="cookie-settings-panel__reset">Reset preferences</button>' +
            '</div></div>';

        document.body.appendChild(overlay);

        function closePanel() {
            overlay.remove();
        }

        overlay.querySelector('.cookie-settings-panel__close').addEventListener('click', closePanel);
        overlay.querySelector('.cookie-settings-panel__accept').addEventListener('click', closePanel);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closePanel();
            }
        });
        overlay.querySelector('.cookie-settings-panel__reset').addEventListener('click', function () {
            clearConsent();
            closePanel();
            var banner = document.querySelector('.cookie-consent-banner');
            if (banner) {
                banner.remove();
            }
            createBanner();
        });
    }

    window.EeksCookies = {
        getCookie: getCookie,
        setCookie: setCookie,
        hasConsent: hasConsent,
        loadPreferences: loadPreferences,
        savePreferences: savePreferences,
        getEffectivePreferences: getEffectivePreferences,
        syncEffectiveToLocalStorage: syncEffectiveToLocalStorage,
        openSettings: openSettings,
        clearConsent: clearConsent
    };

    function createBanner() {
        if (hasConsent() || document.querySelector('.cookie-consent-banner')) {
            return;
        }

        if (!document.getElementById('cookie-consent-inline-styles')) {
            var style = document.createElement('style');
            style.id = 'cookie-consent-inline-styles';
            style.textContent =
            '.cookie-consent-banner{position:fixed;left:0;right:0;bottom:0;top:auto;width:100%;max-width:100%;box-sizing:border-box;' +
            'z-index:10050;margin:0;background:rgba(0,0,0,0.92);color:#fff;padding:1rem 1.5rem;' +
            'padding-bottom:max(1rem,env(safe-area-inset-bottom,0px));display:flex;align-items:center;justify-content:space-between;' +
            'flex-wrap:wrap;gap:1rem;box-shadow:0 -2px 12px rgba(0,0,0,0.3);font-family:inherit;font-size:0.95rem;}' +
            '.cookie-consent-banner p{margin:0;flex:1;min-width:200px;}' +
            '.cookie-consent-banner button{background:#fff;color:#000;border:none;padding:0.5rem 1.25rem;cursor:pointer;' +
            'font-weight:600;border-radius:4px;font-size:0.9rem;}' +
            '.cookie-consent-banner button:hover{background:#eee;}';
            document.head.appendChild(style);
        }

        var banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie notice');
        banner.innerHTML =
            '<p>This website uses cookies to remember your language, currency, and region. By accepting, you agree to our use of cookies for these preferences.</p>' +
            '<button type="button" id="cookie-consent-accept">Accept</button>';
        document.documentElement.appendChild(banner);

        document.getElementById('cookie-consent-accept').addEventListener('click', function () {
            setLocalConsentFlag();
            setCookie(CONSENT_NAME, CONSENT_VALUE, COOKIE_DAYS);
            migrateLocalStorageToCookie();
            banner.remove();
        });
    }

    if (hasConsent()) {
        syncEffectiveToLocalStorage();
        if (getCookie(CONSENT_NAME) !== CONSENT_VALUE && hasLocalConsentFlag()) {
            setCookie(CONSENT_NAME, CONSENT_VALUE, COOKIE_DAYS);
        }
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }
})();
