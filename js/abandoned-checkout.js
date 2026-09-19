/**
 * Abandoned checkout recovery (email capture + return-based EmailJS).
 * Timed recovery is handled by .github/workflows/abandoned-checkout-reminders.yml
 * using Firestore docs written here.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'eeks_checkout_intent';
    var cfg = function () {
        return window.EeksAbandonedCheckoutConfig || {};
    };

    function firebaseConfig() {
        return {
            apiKey: 'AIzaSyApukJavUSSOKPHlyA3kTP1ZTWvQpBOmAc',
            authDomain: 'eeks-eye-2efd9.firebaseapp.com',
            projectId: 'eeks-eye-2efd9',
            storageBucket: 'eeks-eye-2efd9.firebasestorage.app',
            messagingSenderId: '203145718971',
            appId: '1:203145718971:web:e4d7314fe6bdd211168d9e'
        };
    }

    function readIntent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function writeIntent(intent) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
        } catch (e) {}
    }

    function clearIntent() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
    }

    function productUrl(productId) {
        var base = (cfg().siteUrl || 'https://eekseye.com').replace(/\/$/, '');
        return base + '/product.html?id=' + encodeURIComponent(String(productId));
    }

    function ensureStyles() {
        if (document.getElementById('abandoned-checkout-styles')) return;
        var style = document.createElement('style');
        style.id = 'abandoned-checkout-styles';
        style.textContent =
            '.ac-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:1rem;pointer-events:auto;}' +
            '.ac-card{background:#111;color:#fff;max-width:420px;width:100%;padding:1.5rem;border-radius:10px;border:1px solid #333;font-family:inherit;position:relative;pointer-events:auto;box-shadow:0 12px 40px rgba(0,0,0,.55);}' +
            '.ac-card h3{margin:0 0 .5rem;font-size:1.15rem;letter-spacing:.04em;text-transform:uppercase;}' +
            '.ac-card p{margin:0 0 1rem;color:#ccc;font-size:.92rem;line-height:1.5;}' +
            '.ac-card label{display:block;font-size:.8rem;margin-bottom:.35rem;color:#aaa;}' +
            '.ac-card input[type=email]{width:100%;box-sizing:border-box;padding:.7rem .8rem;border-radius:6px;border:1px solid #444;background:#1a1a1a;color:#fff;margin-bottom:.75rem;font-size:1rem;pointer-events:auto;}' +
            '.ac-actions{display:flex;gap:.6rem;flex-wrap:wrap;}' +
            '.ac-actions button{border:none;padding:.7rem 1.15rem;border-radius:6px;cursor:pointer;font-weight:600;font-size:.9rem;pointer-events:auto;}' +
            '.ac-primary{background:#fff;color:#000;}' +
            '.ac-secondary{background:transparent;color:#fff;border:1px solid #555 !important;}' +
            '.ac-close{position:absolute;top:.4rem;right:.45rem;background:none;border:none;color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;padding:.45rem .6rem;pointer-events:auto;z-index:1;}' +
            '.ac-error{color:#ff8a80;font-size:.85rem;margin:0 0 .75rem;min-height:1.1em;}';
        document.head.appendChild(style);
    }

    function askEmail(defaults) {
        ensureStyles();
        return new Promise(function (resolve) {
            var existing = document.getElementById('ac-overlay');
            if (existing) existing.remove();

            // Cart/profile panel sits at a high z-index and would block this dialog.
            try {
                if (window.EeksProfilePanel && typeof window.EeksProfilePanel.close === 'function') {
                    window.EeksProfilePanel.close();
                }
            } catch (e) {}

            var settled = false;
            var overlay = document.createElement('div');
            overlay.id = 'ac-overlay';
            overlay.className = 'ac-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Email for order updates');
            overlay.innerHTML =
                '<div class="ac-card">' +
                '<button type="button" class="ac-close" id="ac-close" aria-label="Close">&times;</button>' +
                '<h3>Almost there</h3>' +
                '<p>Enter your email so we can send order updates — and a reminder if checkout is left unfinished.</p>' +
                '<form id="ac-form" action="#" method="post" novalidate>' +
                '<label for="ac-email">Email</label>' +
                '<input id="ac-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@email.com" required />' +
                '<div class="ac-error" id="ac-error" aria-live="polite"></div>' +
                '<div class="ac-actions">' +
                '<button type="submit" class="ac-primary" id="ac-continue">Continue to checkout</button>' +
                '<button type="button" class="ac-secondary" id="ac-cancel">Cancel</button>' +
                '</div></form></div>';
            document.body.appendChild(overlay);

            var form = document.getElementById('ac-form');
            var input = document.getElementById('ac-email');
            var err = document.getElementById('ac-error');
            var card = overlay.querySelector('.ac-card');
            if (defaults && defaults.email) input.value = defaults.email;

            function done(value) {
                if (settled) return;
                settled = true;
                document.removeEventListener('keydown', onDocKey, true);
                if (overlay.parentNode) overlay.remove();
                resolve(value);
            }

            function submitEmail() {
                var email = String(input.value || '').trim();
                if (!validEmail(email)) {
                    err.textContent = 'Please enter a valid email.';
                    input.focus();
                    return;
                }
                err.textContent = '';
                done(email);
            }

            function onDocKey(e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    e.preventDefault();
                    e.stopPropagation();
                    done(null);
                    return;
                }
                if ((e.key === 'Enter' || e.keyCode === 13) && document.activeElement === input) {
                    e.preventDefault();
                    e.stopPropagation();
                    submitEmail();
                }
            }

            document.addEventListener('keydown', onDocKey, true);

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                e.stopPropagation();
                submitEmail();
            });

            document.getElementById('ac-close').addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                done(null);
            });
            document.getElementById('ac-cancel').addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                done(null);
            });
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) done(null);
            });
            if (card) {
                card.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            }

            setTimeout(function () {
                try { input.focus(); input.select(); } catch (e) {}
            }, 30);
        });
    }

    function ensureEmailJs() {
        var c = cfg();
        return new Promise(function (resolve, reject) {
            function initAndResolve() {
                if (!window.emailjs) {
                    reject(new Error('EmailJS missing'));
                    return;
                }
                try {
                    window.emailjs.init(c.emailJsPublicKey);
                } catch (e) {}
                resolve(window.emailjs);
            }
            if (window.emailjs) {
                initAndResolve();
                return;
            }
            var s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            s.onload = initAndResolve;
            s.onerror = function () { reject(new Error('EmailJS failed to load')); };
            document.head.appendChild(s);
        });
    }

    function sendRecoveryEmail(intent) {
        var c = cfg();
        if (!c.emailJsTemplateId || c.emailJsTemplateId === 'template_abandoned_checkout') {
            // Still attempt — user may have created that exact id; if not, catch below
        }
        var name = intent.productTitle || ('Product #' + intent.productId);
        var url = intent.productUrl || productUrl(intent.productId);
        return ensureEmailJs().then(function (emailjs) {
            return emailjs.send(c.emailJsServiceId, c.emailJsTemplateId, {
                to_email: intent.email,
                to_name: intent.email,
                product_name: name,
                product_url: url,
                subject: 'You left something behind — eekseye',
                message:
                    'Hey — you started checkout for "' +
                    name +
                    '" but didn’t finish. Your items are still waiting: ' +
                    url,
                reply_to: c.replyTo || 'fuchendeonze@gmail.com'
            });
        });
    }

    function loadFirestore() {
        return new Promise(function (resolve) {
            if (window.firebase && window.firebase.firestore) {
                resolve(window.firebase);
                return;
            }
            function add(src) {
                return new Promise(function (res, rej) {
                    var s = document.createElement('script');
                    s.src = src;
                    s.onload = res;
                    s.onerror = rej;
                    document.head.appendChild(s);
                });
            }
            add('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js')
                .then(function () {
                    return add('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js');
                })
                .then(function () {
                    if (!window.firebase.apps.length) {
                        window.firebase.initializeApp(firebaseConfig());
                    }
                    resolve(window.firebase);
                })
                .catch(function () {
                    resolve(null);
                });
        });
    }

    function queueTimedRecovery(intent) {
        return loadFirestore().then(function (firebase) {
            if (!firebase) return null;
            var db = firebase.firestore();
            var col = cfg().firestoreCollection || 'abandoned_checkouts';
            return db.collection(col).add({
                email: intent.email,
                productId: String(intent.productId),
                productTitle: intent.productTitle || '',
                productUrl: intent.productUrl || productUrl(intent.productId),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdAtMs: intent.createdAt || Date.now(),
                purchased: false,
                returnEmailSent: !!intent.returnEmailSent,
                timedEmailSent: false
            });
        }).catch(function (err) {
            console.warn('[abandoned-checkout] Firestore queue skipped', err);
            return null;
        });
    }

    function markPurchased() {
        var intent = readIntent();
        clearIntent();
        if (!intent || !intent.email) return Promise.resolve();
        return loadFirestore().then(function (firebase) {
            if (!firebase) return;
            var db = firebase.firestore();
            var col = cfg().firestoreCollection || 'abandoned_checkouts';
            if (intent.firestoreId) {
                return db.collection(col).doc(intent.firestoreId).set({ purchased: true }, { merge: true });
            }
            return db
                .collection(col)
                .where('email', '==', intent.email)
                .where('purchased', '==', false)
                .limit(5)
                .get()
                .then(function (snap) {
                    if (snap.empty) return;
                    var batch = db.batch();
                    snap.forEach(function (doc) {
                        batch.update(doc.ref, { purchased: true });
                    });
                    return batch.commit();
                });
        }).catch(function () {});
    }

    function maybeSendReturnBased() {
        var intent = readIntent();
        if (!intent || !intent.email || !intent.productId) return;
        if (intent.purchased || intent.returnEmailSent) return;
        var delay = cfg().delayMs || 60 * 60 * 1000;
        if (Date.now() - (intent.createdAt || 0) < delay) return;

        sendRecoveryEmail(intent)
            .then(function () {
                intent.returnEmailSent = true;
                intent.returnEmailSentAt = Date.now();
                writeIntent(intent);
            })
            .catch(function (err) {
                console.warn('[abandoned-checkout] return email failed', err);
            });
    }

    /**
     * Capture email, store intent, queue timed recovery, then run proceed(email).
     */
    function captureAndProceed(product, proceed) {
        var productId = product && (product.id || product.productId);
        var title = (product && (product.title || product.name)) || ('Product #' + productId);
        var existing = readIntent();
        var knownEmail = (existing && existing.email) || '';

        // Prefill from Firebase Auth if available
        try {
            if (window.firebase && window.firebase.auth) {
                var u = window.firebase.auth().currentUser;
                if (u && u.email) knownEmail = u.email;
            }
        } catch (e) {}

        return askEmail({ email: knownEmail }).then(function (email) {
            if (!email) return null;
            var intent = {
                email: email,
                productId: String(productId),
                productTitle: title,
                productUrl: productUrl(productId),
                createdAt: Date.now(),
                returnEmailSent: false,
                purchased: false
            };
            writeIntent(intent);
            // Queue timed reminder in the background — never block checkout or the dialog.
            queueTimedRecovery(intent).then(function (ref) {
                if (ref && ref.id) {
                    intent.firestoreId = ref.id;
                    writeIntent(intent);
                }
            }).catch(function () {});
            return proceed(email);
        });
    }

    // Auto-check return-based recovery on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maybeSendReturnBased);
    } else {
        maybeSendReturnBased();
    }

    window.EeksAbandonedCheckout = {
        captureAndProceed: captureAndProceed,
        markPurchased: markPurchased,
        clearIntent: clearIntent,
        readIntent: readIntent,
        maybeSendReturnBased: maybeSendReturnBased,
        sendRecoveryEmail: sendRecoveryEmail
    };
})();
