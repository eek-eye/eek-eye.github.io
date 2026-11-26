/**
 * Shared decorative Sources panel — docked DevTools structure, eekseye red accent.
 * Fixed to the viewport on every page. Source text is fetched same-origin and scrubbed.
 *
 * Hidden 2026-11-26 at the owner's request. Flip SITE_DEVTOOLS_ENABLED to true to restore.
 */
(function () {
    'use strict';

    var SITE_DEVTOOLS_ENABLED = false;
    if (!SITE_DEVTOOLS_ENABLED) return;

    var ENV_TS = (
        "export const environment = {\n" +
        "  production: true,\n" +
        "  siteName: 'EEKSEYE',\n" +
        "  origin: 'https://eekseye.com',\n" +
        "  theme: 'dark',\n" +
        "  hero: {\n" +
        "    background: '#000000',\n" +
        "    figureHeight: '80vh',\n" +
        "    alignment: 'left',\n" +
        "    reflection: 'soft-fade'\n" +
        "  },\n" +
        "  grid: {\n" +
        "    pixelSize: 6,\n" +
        "    cloth: true\n" +
        "  },\n" +
        "  // Fictional voice for the decorative panel only.\n" +
        "  stewardship: {\n" +
        "    thesis: 'a little of everything',\n" +
        "    monument: 'the monolith endures',\n" +
        "    letter: 'we are the shareholder'\n" +
        "  },\n" +
        "  XI_RELEASE: '11-11-2026'\n" +
        "};\n" +
        "\n" +
        "// XI\n" +
        "/* 11.11.2026 */\n" +
        "// XI.XI.MMXXVI\n" +
        "// -XI\n" +
        "export const RELEASE = '11-11-2026';\n" +
        "export const XI_MARK = 0x0B0B;\n" +
        "export const XI_YEAR = 0x7EA; // 2026\n" +
        "export const XI_SIG = 'WEkgMTEgMTEgMjAyNg==';\n" +
        "export const XI_BITS = '01011000 01001001 00100000 00110001 00110001 00100000 00110001 00110001 00100000 00110010 00110000 00110010 00110110';\n"
    );

    var CATALOG = {
        'index.html': [
            { id: 'index-grid-float.js', path: 'js/index-grid-float.js', lang: 'js', icon: 'js' },
            { id: 'index-scroll-fade.js', path: 'js/index-scroll-fade.js', lang: 'js', icon: 'js' },
            { id: 'index-hero-reflection.js', path: 'js/index-hero-reflection.js', lang: 'js', icon: 'js' },
            { id: 'index-grid-underwater.css', path: 'css/index-grid-underwater.css', lang: 'css', icon: 'css' },
            { id: 'environment.ts', path: 'environment.ts', lang: 'ts', icon: 'ts', virtual: ENV_TS }
        ],
        'explore.html': [
            { id: 'explore-grid.js', path: 'js/explore-grid.js', lang: 'js', icon: 'js' },
            { id: 'explore-text-glitch.js', path: 'js/explore-text-glitch.js', lang: 'js', icon: 'js' },
            { id: 'explore-dream-blur.js', path: 'js/explore-dream-blur.js', lang: 'js', icon: 'js' },
            { id: 'explore-void-arrival.js', path: 'js/explore-void-arrival.js', lang: 'js', icon: 'js' },
            { id: 'explore-grid.css', path: 'css/explore-grid.css', lang: 'css', icon: 'css' }
        ],
        'designs.html': [
            { id: 'designs.html', path: 'designs.html', lang: 'html', icon: 'html' },
            { id: 'designs-data.js', path: 'js/designs-data.js', lang: 'js', icon: 'js' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'design-detail.html': [
            { id: 'design-detail.html', path: 'design-detail.html', lang: 'html', icon: 'html' },
            { id: 'designs-data.js', path: 'js/designs-data.js', lang: 'js', icon: 'js' }
        ],
        'product.html': [
            { id: 'product.html', path: 'product.html', lang: 'html', icon: 'html' },
            { id: 'product-i18n.js', path: 'js/product-i18n.js', lang: 'js', icon: 'js' },
            { id: 'stripe-checkout.js', path: 'js/stripe-checkout.js', lang: 'js', icon: 'js' },
            { id: 'cart.js', path: 'js/cart.js', lang: 'js', icon: 'js' }
        ],
        'contact.html': [
            { id: 'contact.html', path: 'contact.html', lang: 'html', icon: 'html' },
            { id: 'site-footer.js', path: 'js/site-footer.js', lang: 'js', icon: 'js' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'about.html': [
            { id: 'about.html', path: 'about.html', lang: 'html', icon: 'html' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'legal.html': [
            { id: 'legal.html', path: 'legal.html', lang: 'html', icon: 'html' },
            { id: 'footer-links.js', path: 'js/footer-links.js', lang: 'js', icon: 'js' }
        ],
        'faq.html': [
            { id: 'faq.html', path: 'faq.html', lang: 'html', icon: 'html' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'news.html': [
            { id: 'news.html', path: 'news.html', lang: 'html', icon: 'html' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'what-you-need-to-know.html': [
            { id: 'what-you-need-to-know.html', path: 'what-you-need-to-know.html', lang: 'html', icon: 'html' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'xi.html': [
            { id: 'xi.html', path: 'xi.html', lang: 'html', icon: 'html' },
            { id: 'style.css', path: 'css/style.css', lang: 'css', icon: 'css' }
        ],
        'checkout-success.html': [
            { id: 'checkout-success.html', path: 'checkout-success.html', lang: 'html', icon: 'html' },
            { id: 'stripe-checkout.js', path: 'js/stripe-checkout.js', lang: 'js', icon: 'js' }
        ],
        'checkout-cancel.html': [
            { id: 'checkout-cancel.html', path: 'checkout-cancel.html', lang: 'html', icon: 'html' },
            { id: 'stripe-checkout.js', path: 'js/stripe-checkout.js', lang: 'js', icon: 'js' }
        ]
    };

    function pageKey() {
        var path = (window.location.pathname || '/').split('/').pop() || '';
        path = decodeURIComponent(path);
        if (!path || path === '/') path = 'index.html';
        return path.toLowerCase();
    }

    var FILES = (CATALOG[pageKey()] || CATALOG['index.html']).slice();
    FILES.push({ id: 'corporate-values.js', path: 'js/corporate-values.js', lang: 'js', icon: 'js' });
    var DEFAULT = FILES[0].id;
    var SOURCES = {};
    var root = null;

    function scrub(text) {
        if (!text) return '';
        text = String(text);
        text = text.replace(/emailjs\.init\(\s*['"][^'"]+['"]\s*\)/gi, "emailjs.init('/* omitted */')");
        text = text.replace(/['"]service_[a-zA-Z0-9]+['"]/g, "'/* omitted */'");
        text = text.replace(/['"]template_[a-zA-Z0-9_]+['"]/g, "'/* omitted */'");
        text = text.replace(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g, 'https://buy.stripe.com//* omitted */');
        text = text.replace(/pk_(live|test)_[A-Za-z0-9]+/g, 'pk_omitted');
        text = text.replace(/sk_(live|test)_[A-Za-z0-9]+/g, 'sk_omitted');
        text = text.replace(/AIza[0-9A-Za-z_\-]{20,}/g, '/* omitted */');
        text = text.replace(/(apiKey\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(messagingSenderId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(appId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(measurementId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsPublicKey\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsServiceId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(emailJsTemplateId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(authDomain\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(projectId\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/(storageBucket\s*:\s*)['"][^'"]+['"]/g, "$1'/* omitted */'");
        text = text.replace(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, '/* omitted */');
        return text;
    }

    function langOf(file) {
        if (file.lang) return file.lang;
        if (/\.css$/i.test(file.id)) return 'css';
        if (/\.(html?|xml)$/i.test(file.id)) return 'html';
        return 'js';
    }

    function iconOf(file) {
        return file.icon || (langOf(file) === 'css' ? 'css' : langOf(file) === 'html' ? 'html' : (/\.tsx?$/i.test(file.id) ? 'ts' : 'js'));
    }

    function capText(text, lang) {
        var lines = text.split('\n');
        var max = lang === 'css' || lang === 'html' ? 420 : 900;
        if (lines.length > max) {
            return lines.slice(0, max).join('\n') + '\n/* … */\n';
        }
        return text;
    }

    var FLAVOR = [
        'A little of everything, patiently held. Stewardship at scale.',
        'We are the shareholder. The rest is commentary.',
        'A black monolith does not advertise. It simply remains.',
        'Your retirement is our playground — professionally tended.',
        'Rock-solid, naturally. Joy, in our house, wears a navy suit.',
        'Trillions under management, and a little of everything beneath them.'
    ];

    function flavorBlock(file) {
        if (!file) return '';
        if (file.id === 'corporate-values.js') {
            return '// XI\n/* 11.11.2026 */\n// XI.XI.MMXXVI\n// -XI';
        }
        var lang = langOf(file);
        var i = 0, s = String(file.id), sum = 0;
        for (i = 0; i < s.length; i++) sum += s.charCodeAt(i);
        var line = FLAVOR[sum % FLAVOR.length];
        var XI_EGGS = [
            'XI',
            '11.11.2026',
            'XI.XI.MMXXVI',
            '11:11',
            '0x0B0B / 0x7EA',
            "RELEASE = '11-11-2026'",
            '-XI'
        ];
        var egg = XI_EGGS[sum % XI_EGGS.length];
        if (lang === 'html') {
            return '<!-- Stewardship note (fictional): ' + line + ' -->\n<!-- ' + egg + ' -->';
        }
        if (lang === 'css') {
            return '/* Stewardship note (fictional): ' + line + ' */\n/* ' + egg + ' */';
        }
        var jsEgg = (sum % 2 === 0) ? ('// ' + egg) : ('/* ' + egg + ' */');
        if (egg.indexOf('RELEASE') === 0) jsEgg = 'const ' + egg + '; // XI';
        return '/**\n' +
            ' * Stewardship note (fictional) — decorative voice only, not a real firm.\n' +
            ' * ' + line + '\n' +
            ' */\n' +
            jsEgg;
    }

    function applyFlavor(text, file) {
        var block = flavorBlock(file);
        if (!block) return text;
        var lang = langOf(file);
        if (file.id === 'corporate-values.js') return text + '\n' + block + '\n';
        if (lang === 'html' && /<head[^>]*>/i.test(text)) {
            return text.replace(/<head[^>]*>/i, function (m) { return m + '\n    ' + block; });
        }
        return block + '\n' + text;
    }

    function loadFile(file) {
        return new Promise(function (resolve) {
            if (file.virtual != null) {
                resolve({ text: applyFlavor(scrub(file.virtual), file), lang: langOf(file) });
                return;
            }
            fetch(file.path, { credentials: 'same-origin' }).then(function (res) {
                if (!res.ok) throw new Error('http');
                return res.text();
            }).then(function (text) {
                resolve({ text: applyFlavor(capText(scrub(text), langOf(file)), file), lang: langOf(file) });
            }).catch(function () {
                resolve({ text: '/* source omitted */\n', lang: langOf(file) });
            });
        });
    }

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var activeId = DEFAULT;
    var currentLine = 0;
    var htmlCache = {};
    var scrollTimer = 0;
    var scrollDir = 1;
    var speedMul = 1;
    var holdScroll = false;
    var boostTimer = 0;
    var whisperTimer = 0;
    var shirtTimer = 0;

    function svg(inner, view) {
        return '<svg viewBox="' + (view || '0 0 16 16') + '" aria-hidden="true">' + inner + '</svg>';
    }
    var ICO = {
        inspect: svg('<path d="M3 2.5h4v1H4v8h8v-3h1v4H3z"/><path d="M9 2l5 5-1.2.3-1.5 3.2-1.5-1.5 3.2-1.5z"/>'),
        device: svg('<path d="M4 2.5h8A1.5 1.5 0 0 1 13.5 4v8A1.5 1.5 0 0 1 12 13.5H4A1.5 1.5 0 0 1 2.5 12V4A1.5 1.5 0 0 1 4 2.5zm.5 1.5v8h7V4z"/>'),
        gear: svg('<path d="M8 10.2A2.2 2.2 0 1 0 8 5.8a2.2 2.2 0 0 0 0 4.4zM6.3 1.5h3.4l.3 1.6 1.3.6 1.5-.7 1.7 1.7-.7 1.5.6 1.3 1.6.3v3.4l-1.6.3-.6 1.3.7 1.5-1.7 1.7-1.5-.7-1.3.6-.3 1.6H6.3l-.3-1.6-1.3-.6-1.5.7-1.7-1.7.7-1.5-.6-1.3L1.5 9.7V6.3l1.6-.3.6-1.3-.7-1.5 1.7-1.7 1.5.7 1.3-.6z"/>'),
        kebab: svg('<circle cx="8" cy="3.2" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="12.8" r="1.2"/>'),
        close: svg('<path d="M4.2 3.5 8 7.3l3.8-3.8.7.7L8.7 8l3.8 3.8-.7.7L8 8.7l-3.8 3.8-.7-.7L7.3 8 3.5 4.2z"/>'),
        split: svg('<path d="M2.5 3.5h11v9h-11zm1 1v7h4.2V4.5zm5.2 0v7h4.8V4.5z"/>'),
        more: svg('<path d="M3 7h10v1.4H3zM3 4h10v1.4H3zM3 10h7v1.4H3z"/>'),
        pause: svg('<path d="M5 3.5h2.2v9H5zm3.8 0H11v9H8.8z"/>'),
        stepover: svg('<path d="M4 8.5a4 4 0 1 1 4 4v-1.3a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0-2.7 2.7H7L4 11.2 1 8.5z"/>'),
        stepinto: svg('<path d="M7.2 2.5h1.6v6.2l2.4-2.4.9.9L8 11.3 3.9 7.2l.9-.9 2.4 2.4z"/>'),
        stepout: svg('<path d="M7.2 13.5h1.6V7.3l2.4 2.4.9-.9L8 4.7 3.9 8.8l.9.9 2.4-2.4z"/>'),
        deactivate: svg('<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 12 12 4"/>'),
        brackets: svg('<path d="M5 3.2h-.8v9.6H5V14H2.6V2H5zm6 0h.8v9.6H11V14h2.4V2H11z" fill="currentColor"/>'),
        chev: svg('<path d="M4.5 6.2 8 9.7l3.5-3.5.8.8L8 11.3 3.7 7z"/>'),
        caretRight: svg('<path d="M6 4.2 10.5 8 6 11.8z" fill="currentColor"/>'),
        caretDown: svg('<path d="M4.2 6 8 10.5 11.8 6z" fill="currentColor"/>'),
        cloud: svg('<path fill="#9aa0a6" d="M12.7 10.7H4.2a2.4 2.4 0 0 1-.2-4.8 3.6 3.6 0 0 1 6.9-1.1 2.7 2.7 0 0 1 1.8 5.9z"/>'),
        folder: svg('<path fill="#dcb67a" d="M2.2 4.2h4.1l1.1 1.2h6.4v7.2H2.2z"/>'),
        fileJs: svg('<path fill="#e8ab53" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="5.4" font-family="Segoe UI,sans-serif" font-weight="700" fill="#2a1a00">JS</text>'),
        fileCss: svg('<path fill="#c586c0" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="4.4" font-family="Segoe UI,sans-serif" font-weight="700" fill="#2a0a22">CSS</text>'),
        fileTs: svg('<path fill="#62a8e8" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="4.6" font-family="Segoe UI,sans-serif" font-weight="700" fill="#071828">TS</text>'),
        fileHtml: svg('<path fill="#e88c5a" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="4.2" font-family="Segoe UI,sans-serif" font-weight="700" fill="#2a1000">HT</text>'),
        pages: svg('<path fill="#9aa0a6" d="M3.2 3.2h7.2v9.6H3.2zm1.2 1.2v7.2h4.8V4.4zm7.2 1.2h1.2v8.4H6.8V13H12.8z"/>')
    };

    function fileIcon(kind) {
        if (kind === 'css') return ICO.fileCss;
        if (kind === 'ts') return ICO.fileTs;
        if (kind === 'html') return ICO.fileHtml;
        return ICO.fileJs;
    }

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var KW_RE = /^(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|of|static|get|set|from|as|interface|type|enum|implements|package|public|private|protected|readonly|undefined|null|true|false)$/;

    function highlightJS(src) {
        var out = '';
        var i = 0, n = src.length;
        function take(len, cls) {
            var chunk = esc(src.slice(i, i + len));
            out += cls ? ('<span class="' + cls + '">' + chunk + '</span>') : chunk;
            i += len;
        }
        while (i < n) {
            var ch = src[i];
            var two = src.slice(i, i + 2);
            if (two === '//') {
                var e = src.indexOf('\n', i);
                if (e < 0) e = n;
                take(e - i, 'dt-tok-com');
                continue;
            }
            if (two === '/*') {
                var e2 = src.indexOf('*/', i + 2);
                take((e2 < 0 ? n : e2 + 2) - i, 'dt-tok-com');
                continue;
            }
            if (ch === "'" || ch === '"' || ch === '`') {
                var q = ch, j = i + 1;
                while (j < n) {
                    if (src[j] === '\\') { j += 2; continue; }
                    if (src[j] === q) { j += 1; break; }
                    if (ch !== '`' && src[j] === '\n') break;
                    j += 1;
                }
                take(j - i, 'dt-tok-str');
                continue;
            }
            if (/[0-9]/.test(ch) && (i === 0 || /[^\w$]/.test(src[i - 1]))) {
                var k = i;
                if (src.slice(i, i + 2).toLowerCase() === '0x') k += 2;
                while (k < n && /[0-9a-fA-FeE._]/.test(src[k])) k += 1;
                take(k - i, 'dt-tok-num');
                continue;
            }
            if (/[A-Za-z_$]/.test(ch)) {
                var k2 = i + 1;
                while (k2 < n && /[\w$]/.test(src[k2])) k2 += 1;
                var word = src.slice(i, k2);
                var after = src.slice(k2).match(/^\s*/);
                var sp = after ? after[0].length : 0;
                if (KW_RE.test(word)) take(k2 - i, 'dt-tok-kw');
                else if (src[k2 + sp] === '(') take(k2 - i, 'dt-tok-fn');
                else if (i > 0 && src[i - 1] === '.') take(k2 - i, 'dt-tok-prop');
                else take(k2 - i, 'dt-tok-prop');
                continue;
            }
            out += esc(ch);
            i += 1;
        }
        return out;
    }

    function highlightCSS(src) {
        var out = '';
        var i = 0, n = src.length;
        function take(len, cls) {
            var chunk = esc(src.slice(i, i + len));
            out += cls ? ('<span class="' + cls + '">' + chunk + '</span>') : chunk;
            i += len;
        }
        while (i < n) {
            var two = src.slice(i, i + 2);
            if (two === '/*') {
                var e = src.indexOf('*/', i + 2);
                take((e < 0 ? n : e + 2) - i, 'dt-tok-com');
                continue;
            }
            var ch = src[i];
            if (ch === "'" || ch === '"') {
                var q = ch, j = i + 1;
                while (j < n && src[j] !== q) {
                    if (src[j] === '\\') j += 2;
                    else j += 1;
                }
                take((j < n ? j + 1 : n) - i, 'dt-tok-str');
                continue;
            }
            if (ch === '#') {
                var k = i + 1;
                while (k < n && /[0-9A-Fa-f]/.test(src[k])) k += 1;
                if (k - i === 4 || k - i === 7 || k - i === 9) { take(k - i, 'dt-tok-str'); continue; }
            }
            if (/[0-9]/.test(ch) && (i === 0 || /[^\w-]/.test(src[i - 1]))) {
                var k2 = i;
                while (k2 < n && /[0-9.%]/.test(src[k2])) k2 += 1;
                take(k2 - i, 'dt-tok-num');
                continue;
            }
            if (/[A-Za-z_-]/.test(ch)) {
                var k3 = i + 1;
                while (k3 < n && /[\w-]/.test(src[k3])) k3 += 1;
                var word = src.slice(i, k3);
                var rest = src.slice(k3);
                if (/^\s*:/.test(rest) && src.slice(0, i).lastIndexOf('{') > src.slice(0, i).lastIndexOf('}')) {
                    take(k3 - i, 'dt-tok-prop');
                } else if (word === 'from' || word === 'to' || word === 'important') {
                    take(k3 - i, 'dt-tok-kw');
                } else {
                    take(k3 - i, 'dt-tok-fn');
                }
                continue;
            }
            out += esc(ch);
            i += 1;
        }
        return out;
    }

    function highlighted(id) {
        if (htmlCache[id]) return htmlCache[id];
        var src = SOURCES[id];
        if (!src) return '';
        var html = src.lang === 'css' ? highlightCSS(src.text) : highlightJS(src.text);
        htmlCache[id] = html;
        return html;
    }

    function renderCode(id) {
        var src = SOURCES[id];
        if (!src) return;
        var html = highlighted(id);
        var lines = html.split('\n');
        if (lines.length && lines[lines.length - 1] === '') lines.pop();
        var buf = [];
        var i;
        for (i = 0; i < lines.length; i++) {
            var caret = (i === 0) ? '<span class="dt-caret-blink" aria-hidden="true"></span>' : '';
            buf.push(
                '<div class="dt-code-row' + (i === 0 ? ' is-current' : '') + '" data-line="' + (i + 1) + '">' +
                '<span class="dt-ln">-</span>' +
                '<span class="dt-line">' + (lines[i] || '') + caret + '</span>' +
                '</div>'
            );
        }
        var sc = root.querySelector('.dt-code-scroll');
        sc.innerHTML = buf.join('');
        sc.scrollTop = 0;
        currentLine = 1;
        updateStatus(1, 1);
        activeId = id;
        syncActive();
    }

    function colAtScroll() {
        // Calm, decorative column — slowly drift a little as we scroll.
        var sc = root.querySelector('.dt-code-scroll');
        var y = sc ? sc.scrollTop : 0;
        return 1 + Math.floor(y / 40) % 24;
    }

    function updateStatus(line, col) {
        var el = root.querySelector('.dt-status-pos-text');
        if (el) el.textContent = 'Line ' + line + ', column ' + col;
    }

    function syncActive() {
        var nodes = root.querySelectorAll('[data-file]');
        var i;
        for (i = 0; i < nodes.length; i++) {
            nodes[i].classList.toggle('is-active', nodes[i].getAttribute('data-file') === activeId);
        }
        var tab = root.querySelector('.dt-filetab.is-active');
        if (tab && tab.scrollIntoView) tab.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }

    function openFile(id) {
        if (!SOURCES[id] || id === activeId) {
            if (SOURCES[id]) syncActive();
            return;
        }
        renderCode(id);
    }

    function filetabsHtml() {
        return FILES.map(function (f, i) {
            var x = (i === 0) ? '<span class="dt-filetab-x" aria-hidden="true">×</span>' : '';
            return '<button type="button" class="dt-filetab' + (f.id === DEFAULT ? ' is-active' : '') + '" data-file="' + f.id + '">' +
                (f.label || f.id) + x + '</button>';
        }).join('');
    }

    function row(opts) {
        var pad = opts.depth || 0;
        var caret = opts.leaf
            ? '<span class="dt-caret is-empty"></span>'
            : '<span class="dt-caret">' + (opts.open ? ICO.caretDown : ICO.caretRight) + '</span>';
        var fileAttr = opts.file ? ' data-file="' + opts.file + '"' : '';
        var toggle = opts.leaf ? '' : ' data-toggle="' + (opts.key || '') + '"';
        var active = opts.file === DEFAULT ? ' is-active' : '';
        return '<div class="dt-tree-row' + active + '"' + fileAttr + toggle +
            ' style="padding-left:' + (4 + pad * 12) + 'px">' +
            caret +
            '<span class="dt-tree-icon">' + opts.icon + '</span>' +
            '<span class="dt-tree-label">' + opts.label + '</span>' +
            '</div>';
    }

    function treeHtml() {
        var js = FILES.filter(function (f) { return iconOf(f) === 'js'; });
        var css = FILES.filter(function (f) { return iconOf(f) === 'css'; });
        var other = FILES.filter(function (f) { return iconOf(f) !== 'js' && iconOf(f) !== 'css'; });
        function fileRow(f, depth) {
            return row({ depth: depth, leaf: true, icon: fileIcon(iconOf(f)), label: f.id, file: f.id });
        }
        var jsBlock = '';
        if (js.length) {
            jsBlock = row({ depth: 2, open: true, icon: ICO.folder, label: 'js', key: 'js' }) +
                '<div class="dt-tree-children is-open" data-branch="js">' +
                js.map(function (f) { return fileRow(f, 3); }).join('') +
                '</div>';
        }
        var cssBlock = '';
        if (css.length) {
            cssBlock = row({ depth: 2, open: true, icon: ICO.folder, label: 'css', key: 'css' }) +
                '<div class="dt-tree-children is-open" data-branch="css">' +
                css.map(function (f) { return fileRow(f, 3); }).join('') +
                '</div>';
        }
        var otherBlock = other.map(function (f) { return fileRow(f, 2); }).join('');
        return [
            row({ depth: 0, open: true, icon: ICO.pages, label: 'top', key: 'top' }),
            '<div class="dt-tree-children is-open" data-branch="top">',
                row({ depth: 1, open: true, icon: ICO.cloud, label: 'eekseye.com', key: 'eek' }),
                '<div class="dt-tree-children is-open" data-branch="eek">',
                    jsBlock,
                    cssBlock,
                    otherBlock,
                '</div>',
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'cdn.jsdelivr.net', key: 'cdnjsd' }),
                '<div class="dt-tree-children" data-branch="cdnjsd">',
                    row({ depth: 2, open: false, icon: ICO.folder, label: 'npm', key: 'npm' }),
                '</div>',
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'cdnjs.cloudflare.com', key: 'cdnjs' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'fonts.googleapis.com', key: 'gfonts' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'localhost', key: 'local' }),
            '</div>'
        ].join('');
    }

    var MAIN_TABS = ['Elements', 'Console', 'Sources', 'Network', 'Performance', 'Memory', 'Application', 'Security', 'Lighthouse', 'Recorder'];

                function wreathMarkup() {
        return "<div class=\"dt-wreath\" aria-hidden=\"true\"><svg class=\"dt-wreath-sprite\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\">\n  <defs>\n    <linearGradient id=\"dtw-ivory\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#f6efe2\"/>\n      <stop offset=\"42%\" stop-color=\"#e4d4b8\"/>\n      <stop offset=\"100%\" stop-color=\"#a89270\"/>\n    </linearGradient>\n    <radialGradient id=\"dtw-cranium\" cx=\"36%\" cy=\"26%\" r=\"72%\">\n      <stop offset=\"0%\" stop-color=\"#fbf6ec\"/>\n      <stop offset=\"48%\" stop-color=\"#e6d7be\"/>\n      <stop offset=\"100%\" stop-color=\"#8f7b5c\"/>\n    </radialGradient>\n    <linearGradient id=\"dtw-bone-deep\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#d8c6a6\"/>\n      <stop offset=\"100%\" stop-color=\"#7a684e\"/>\n    </linearGradient>\n    <linearGradient id=\"dtw-shaft\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#f4ebda\"/>\n      <stop offset=\"40%\" stop-color=\"#e2d2b6\"/>\n      <stop offset=\"100%\" stop-color=\"#9a8666\"/>\n    </linearGradient>\n    <radialGradient id=\"dtw-socket\" cx=\"40%\" cy=\"30%\" r=\"70%\">\n      <stop offset=\"0%\" stop-color=\"#3a3026\"/>\n      <stop offset=\"70%\" stop-color=\"#14110e\"/>\n      <stop offset=\"100%\" stop-color=\"#000\"/>\n    </radialGradient>\n    <linearGradient id=\"dtw-redx\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#e24a4a\"/>\n      <stop offset=\"45%\" stop-color=\"#c42828\"/>\n      <stop offset=\"100%\" stop-color=\"#7a1616\"/>\n    </linearGradient>\n    <linearGradient id=\"dtw-whitex\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#fffaf0\"/>\n      <stop offset=\"50%\" stop-color=\"#e8e0d2\"/>\n      <stop offset=\"100%\" stop-color=\"#b2a490\"/>\n    </linearGradient>\n    <linearGradient id=\"dtw-blackx\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#3a3a3a\"/>\n      <stop offset=\"50%\" stop-color=\"#161616\"/>\n      <stop offset=\"100%\" stop-color=\"#000\"/>\n    </linearGradient>\n  </defs>\n\n  <symbol id=\"dtw-skull\" viewBox=\"0 0 80 100\">\n    <ellipse cx=\"40\" cy=\"40\" rx=\"33\" ry=\"35\" fill=\"url(#dtw-cranium)\"/>\n    <path d=\"M15 46c-2 10 2 22 11 29l4 14c2 5 10 8 10 8s8-3 10-8l4-14c9-7 13-19 11-29z\" fill=\"url(#dtw-ivory)\"/>\n    <path d=\"M24 70h32c0 0-2 8-16 9S24 70 24 70z\" fill=\"#c4b394\"/>\n    <ellipse cx=\"27.5\" cy=\"44\" rx=\"9.2\" ry=\"8.4\" fill=\"url(#dtw-socket)\"/>\n    <ellipse cx=\"52.5\" cy=\"44\" rx=\"9.2\" ry=\"8.4\" fill=\"url(#dtw-socket)\"/>\n    <ellipse cx=\"25.8\" cy=\"42.4\" rx=\"2.2\" ry=\"1.5\" fill=\"#5a4c3c\" opacity=\".55\"/>\n    <ellipse cx=\"50.8\" cy=\"42.4\" rx=\"2.2\" ry=\"1.5\" fill=\"#5a4c3c\" opacity=\".55\"/>\n    <path d=\"M40 49l-6.2 14c3.2 3.2 9.2 3.2 12.4 0z\" fill=\"#1a1410\"/>\n    <path d=\"M40 51l-3.6 10c2 1.6 5.2 1.6 7.2 0z\" fill=\"#2c241c\"/>\n    <g fill=\"#f3eadc\" stroke=\"#6e5e48\" stroke-width=\".7\">\n      <rect x=\"26\" y=\"80.2\" width=\"5.2\" height=\"8.2\" rx=\".6\"/>\n      <rect x=\"31.6\" y=\"80.6\" width=\"5.2\" height=\"9\" rx=\".6\"/>\n      <rect x=\"37.2\" y=\"80.8\" width=\"5.6\" height=\"9.4\" rx=\".6\"/>\n      <rect x=\"43.2\" y=\"80.6\" width=\"5.2\" height=\"9\" rx=\".6\"/>\n      <rect x=\"48.8\" y=\"80.2\" width=\"5.2\" height=\"8.2\" rx=\".6\"/>\n    </g>\n    <path d=\"M18 36c8-16 36-16 44 0\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".18\" stroke-width=\"3\"/>\n  </symbol>\n\n  <symbol id=\"dtw-skull-side\" viewBox=\"0 0 90 86\">\n    <path d=\"M18 44c0-22 18-36 40-36 16 0 26 10 26 22 0 8-4 14-12 18 10 2 16 10 14 20-2 10-12 16-24 14l-6 8c-2 3-8 4-8 4s-4-8-6-14c-14-2-24-16-24-36z\" fill=\"url(#dtw-cranium)\"/>\n    <ellipse cx=\"68\" cy=\"32\" rx=\"7.5\" ry=\"7\" fill=\"url(#dtw-socket)\"/>\n    <path d=\"M78 40c4 2 8 8 6 14-6 4-14 2-16-2 2-6 6-10 10-12z\" fill=\"url(#dtw-bone-deep)\"/>\n    <path d=\"M62 44l12 2-4 10-10-4z\" fill=\"#1a1410\"/>\n    <g fill=\"#f3eadc\" stroke=\"#6e5e48\" stroke-width=\".6\">\n      <rect x=\"28\" y=\"66\" width=\"5\" height=\"8\" rx=\".5\" transform=\"rotate(-18 30 70)\"/>\n      <rect x=\"34\" y=\"68\" width=\"5\" height=\"8.5\" rx=\".5\" transform=\"rotate(-12 36 72)\"/>\n      <rect x=\"40\" y=\"69\" width=\"5\" height=\"8.2\" rx=\".5\" transform=\"rotate(-6 42 73)\"/>\n    </g>\n  </symbol>\n\n  <symbol id=\"dtw-bone\" viewBox=\"0 0 140 44\">\n    <circle cx=\"16\" cy=\"13\" r=\"12\" fill=\"url(#dtw-cranium)\"/>\n    <circle cx=\"16\" cy=\"31\" r=\"12\" fill=\"url(#dtw-bone-deep)\"/>\n    <circle cx=\"124\" cy=\"13\" r=\"12\" fill=\"url(#dtw-cranium)\"/>\n    <circle cx=\"124\" cy=\"31\" r=\"12\" fill=\"url(#dtw-bone-deep)\"/>\n    <rect x=\"22\" y=\"14\" width=\"96\" height=\"16\" rx=\"8\" fill=\"url(#dtw-shaft)\"/>\n    <rect x=\"26\" y=\"16.5\" width=\"88\" height=\"5\" rx=\"2.5\" fill=\"#fff\" opacity=\".28\"/>\n  </symbol>\n\n  <symbol id=\"dtw-ribs\" viewBox=\"0 0 120 90\">\n    <g fill=\"none\" stroke=\"url(#dtw-ivory)\" stroke-linecap=\"round\">\n      <path d=\"M58 8c-18 8-38 10-48 8\" stroke-width=\"6\"/>\n      <path d=\"M62 8c18 8 38 10 48 8\" stroke-width=\"6\"/>\n      <path d=\"M58 22c-20 8-42 14-52 16\" stroke-width=\"6.4\"/>\n      <path d=\"M62 22c20 8 42 14 52 16\" stroke-width=\"6.4\"/>\n      <path d=\"M58 36c-20 10-40 20-50 28\" stroke-width=\"6.2\"/>\n      <path d=\"M62 36c20 10 40 20 50 28\" stroke-width=\"6.2\"/>\n      <path d=\"M58 50c-16 10-32 22-40 32\" stroke-width=\"5.6\"/>\n      <path d=\"M62 50c16 10 32 22 40 32\" stroke-width=\"5.6\"/>\n    </g>\n    <g fill=\"none\" stroke=\"#fff\" stroke-opacity=\".22\" stroke-linecap=\"round\">\n      <path d=\"M58 7c-18 8-36 10-46 8\" stroke-width=\"1.6\"/>\n      <path d=\"M62 7c18 8 36 10 46 8\" stroke-width=\"1.6\"/>\n      <path d=\"M58 21c-20 8-40 13-50 15\" stroke-width=\"1.6\"/>\n      <path d=\"M62 21c20 8 40 13 50 15\" stroke-width=\"1.6\"/>\n    </g>\n    <rect x=\"56\" y=\"6\" width=\"8\" height=\"56\" rx=\"3\" fill=\"url(#dtw-bone-deep)\"/>\n    <rect x=\"57.5\" y=\"8\" width=\"3\" height=\"50\" rx=\"1.5\" fill=\"#f3eadc\" opacity=\".35\"/>\n  </symbol>\n\n  <symbol id=\"dtw-hand\" viewBox=\"0 0 90 110\">\n    <ellipse cx=\"40\" cy=\"78\" rx=\"20\" ry=\"16\" fill=\"url(#dtw-ivory)\"/>\n    <g fill=\"url(#dtw-ivory)\" stroke=\"#8a7860\" stroke-width=\".6\">\n      <path d=\"M16 74c-6-18-8-32-4-42 2-2 6-1 7 3-3 8-2 22 3 38z\"/>\n      <rect x=\"22\" y=\"18\" width=\"7.2\" height=\"58\" rx=\"3.6\" transform=\"rotate(-8 26 47)\"/>\n      <rect x=\"34\" y=\"8\" width=\"7.4\" height=\"66\" rx=\"3.6\"/>\n      <rect x=\"46\" y=\"14\" width=\"7\" height=\"60\" rx=\"3.5\" transform=\"rotate(6 50 44)\"/>\n      <rect x=\"56\" y=\"24\" width=\"6.6\" height=\"50\" rx=\"3.3\" transform=\"rotate(14 59 49)\"/>\n      <circle cx=\"26\" cy=\"22\" r=\"3.4\"/>\n      <circle cx=\"37.6\" cy=\"12\" r=\"3.6\"/>\n      <circle cx=\"49.5\" cy=\"18\" r=\"3.4\"/>\n      <circle cx=\"59\" cy=\"28\" r=\"3.2\"/>\n    </g>\n    <ellipse cx=\"42\" cy=\"80\" rx=\"8\" ry=\"6\" fill=\"#c4b394\" opacity=\".5\"/>\n  </symbol>\n\n  <symbol id=\"dtw-jaw\" viewBox=\"0 0 80 44\">\n    <path d=\"M8 10c2 18 16 30 32 30s30-12 32-30c-8 6-20 10-32 10S16 16 8 10z\" fill=\"url(#dtw-ivory)\"/>\n    <g fill=\"#f3eadc\" stroke=\"#6e5e48\" stroke-width=\".6\">\n      <rect x=\"16\" y=\"6\" width=\"6\" height=\"10\" rx=\".6\"/>\n      <rect x=\"24\" y=\"5\" width=\"6.2\" height=\"11\" rx=\".6\"/>\n      <rect x=\"32.2\" y=\"4.5\" width=\"6.4\" height=\"11.5\" rx=\".6\"/>\n      <rect x=\"40.8\" y=\"4.5\" width=\"6.4\" height=\"11.5\" rx=\".6\"/>\n      <rect x=\"49.4\" y=\"5\" width=\"6.2\" height=\"11\" rx=\".6\"/>\n      <rect x=\"57.6\" y=\"6\" width=\"6\" height=\"10\" rx=\".6\"/>\n    </g>\n  </symbol>\n\n  <symbol id=\"dtw-vertebra\" viewBox=\"0 0 56 48\">\n    <ellipse cx=\"28\" cy=\"24\" rx=\"14\" ry=\"12\" fill=\"url(#dtw-ivory)\"/>\n    <ellipse cx=\"28\" cy=\"24\" rx=\"6\" ry=\"5\" fill=\"#2a2218\"/>\n    <path d=\"M14 20 L4 8 16 14 18 6 24 16z\" fill=\"url(#dtw-bone-deep)\"/>\n    <path d=\"M42 20 L52 8 40 14 38 6 32 16z\" fill=\"url(#dtw-bone-deep)\"/>\n    <path d=\"M22 34 L16 46 28 38 40 46 34 34z\" fill=\"url(#dtw-cranium)\"/>\n  </symbol>\n\n  <symbol id=\"dtw-x-red\" viewBox=\"0 0 64 64\">\n    <path d=\"M10 6h14l8 10 8-10h14L39 26l15 20H40l-8-10-8 10H10l15-20z\" fill=\"url(#dtw-redx)\" stroke=\"#5a1010\" stroke-width=\"1\"/>\n    <path d=\"M18 8h8l6 8-3 4z\" fill=\"#f07a7a\" opacity=\".45\"/>\n  </symbol>\n\n  <symbol id=\"dtw-x-white\" viewBox=\"0 0 64 64\">\n    <path d=\"M10 6h14l8 10 8-10h14L39 26l15 20H40l-8-10-8 10H10l15-20z\" fill=\"url(#dtw-whitex)\" stroke=\"#8a7a66\" stroke-width=\"1\"/>\n    <path d=\"M18 8h8l6 8-3 4z\" fill=\"#fff\" opacity=\".4\"/>\n  </symbol>\n\n  <symbol id=\"dtw-x-black\" viewBox=\"0 0 64 64\">\n    <path d=\"M10 6h14l8 10 8-10h14L39 26l15 20H40l-8-10-8 10H10l15-20z\" fill=\"url(#dtw-blackx)\" stroke=\"#000\" stroke-width=\"1\"/>\n    <path d=\"M18 8h8l6 8-3 4z\" fill=\"#666\" opacity=\".35\"/>\n  </symbol>\n\n  <symbol id=\"dtw-xi\" viewBox=\"0 0 72 44\">\n    <text x=\"36\" y=\"34\" text-anchor=\"middle\" font-family=\"Georgia, 'Times New Roman', serif\" font-size=\"34\" font-weight=\"600\" fill=\"url(#dtw-redx)\">XI</text>\n    <text x=\"35.2\" y=\"32.8\" text-anchor=\"middle\" font-family=\"Georgia, 'Times New Roman', serif\" font-size=\"34\" font-weight=\"600\" fill=\"#e24a4a\" opacity=\".3\">XI</text>\n  </symbol>\n\n  <symbol id=\"dtw-crossbones\" viewBox=\"0 0 140 140\">\n    <g transform=\"rotate(38 70 70)\">\n      <circle cx=\"16\" cy=\"63\" r=\"11\" fill=\"url(#dtw-cranium)\"/>\n      <circle cx=\"16\" cy=\"77\" r=\"11\" fill=\"url(#dtw-bone-deep)\"/>\n      <circle cx=\"124\" cy=\"63\" r=\"11\" fill=\"url(#dtw-cranium)\"/>\n      <circle cx=\"124\" cy=\"77\" r=\"11\" fill=\"url(#dtw-bone-deep)\"/>\n      <rect x=\"22\" y=\"64\" width=\"96\" height=\"14\" rx=\"7\" fill=\"url(#dtw-shaft)\"/>\n    </g>\n    <g transform=\"rotate(-38 70 70)\">\n      <circle cx=\"16\" cy=\"63\" r=\"11\" fill=\"url(#dtw-cranium)\"/>\n      <circle cx=\"16\" cy=\"77\" r=\"11\" fill=\"url(#dtw-bone-deep)\"/>\n      <circle cx=\"124\" cy=\"63\" r=\"11\" fill=\"url(#dtw-cranium)\"/>\n      <circle cx=\"124\" cy=\"77\" r=\"11\" fill=\"url(#dtw-bone-deep)\"/>\n      <rect x=\"22\" y=\"64\" width=\"96\" height=\"14\" rx=\"7\" fill=\"url(#dtw-shaft)\"/>\n    </g>\n  </symbol>\n</svg><svg class=\"dt-wreath-piece\" data-depth=\"1.15\" style=\"width:124px;height:124px;--rot:8deg;left:-6%;top:-6%\" viewBox=\"0 0 140 140\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-crossbones\"/></svg><svg class=\"dt-wreath-piece is-mobile is-slim\" data-depth=\"1.35\" style=\"width:84px;height:105px;--rot:-22deg;left:0.4%;top:-0.8%\" viewBox=\"0 0 80 100\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-skull\"/></svg><svg class=\"dt-wreath-piece is-mobile\" data-depth=\"0.9\" style=\"width:30px;height:30px;--rot:22deg;left:13%;top:4.5%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-red\"/></svg><svg class=\"dt-wreath-piece is-mobile\" data-depth=\"1.1\" style=\"width:118px;height:88px;--rot:10deg;left:24%;top:-5.2%\" viewBox=\"0 0 120 90\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-ribs\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.95\" style=\"width:108px;height:34px;--rot:16deg;left:47%;top:-1.6%\" viewBox=\"0 0 140 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-bone\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.0\" style=\"width:34px;height:34px;--rot:-18deg;left:66%;top:-1.4%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-white\"/></svg><svg class=\"dt-wreath-piece is-mobile is-slim\" data-depth=\"1.2\" style=\"width:80px;height:98px;--rot:36deg;top:-2.2%;right:-0.4%\" viewBox=\"0 0 90 110\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-hand\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.0\" style=\"width:74px;height:71px;--rot:18deg;top:5%;right:-2.2%\" viewBox=\"0 0 90 86\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-skull-side\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.8\" style=\"width:28px;height:28px;--rot:40deg;top:13%;right:7%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-red\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.05\" style=\"width:118px;height:37px;--rot:82deg;top:28%;right:-8%\" viewBox=\"0 0 140 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-bone\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.9\" style=\"width:52px;height:32px;--rot:-8deg;top:39%;right:0.2%\" viewBox=\"0 0 72 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-xi\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.7\" style=\"width:42px;height:36px;--rot:24deg;top:51%;right:0.2%\" viewBox=\"0 0 56 48\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-vertebra\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.85\" style=\"width:30px;height:30px;--rot:16deg;top:59%;right:1.2%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-black\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.8\" style=\"width:60px;height:33px;--rot:-26deg;right:0.4%;bottom:13%\" viewBox=\"0 0 80 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-jaw\"/></svg><svg class=\"dt-wreath-piece is-mobile is-slim\" data-depth=\"1.25\" style=\"width:80px;height:100px;--rot:26deg;right:0.2%;bottom:-0.8%\" viewBox=\"0 0 80 100\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-skull\"/></svg><svg class=\"dt-wreath-piece is-slim\" data-depth=\"0.9\" style=\"width:28px;height:28px;--rot:-30deg;right:15%;bottom:7.5%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-red\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.05\" style=\"width:110px;height:82px;--rot:-14deg;left:30%;bottom:-5%\" viewBox=\"0 0 120 90\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-ribs\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.95\" style=\"width:36px;height:36px;--rot:-20deg;left:54%;bottom:0.2%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-white\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.85\" style=\"width:100px;height:31px;--rot:10deg;left:14%;bottom:-1.6%\" viewBox=\"0 0 140 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-bone\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.2\" style=\"width:118px;height:37px;--rot:-54deg;left:-8%;bottom:3%\" viewBox=\"0 0 140 44\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-bone\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.0\" style=\"width:68px;height:83px;--rot:-50deg;left:-1.5%;bottom:13%\" viewBox=\"0 0 90 110\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-hand\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.75\" style=\"width:28px;height:28px;--rot:44deg;left:5.5%;bottom:17%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-red\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"1.15\" style=\"width:70px;height:86px;--rot:-46deg;left:-3.2%;top:36%\" viewBox=\"0 0 90 110\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-hand\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.85\" style=\"width:32px;height:32px;--rot:10deg;left:0.2%;top:60%\" viewBox=\"0 0 64 64\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-x-black\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.7\" style=\"width:40px;height:34px;--rot:-20deg;left:-0.4%;top:22%\" viewBox=\"0 0 56 48\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-vertebra\"/></svg><svg class=\"dt-wreath-piece\" data-depth=\"0.95\" style=\"width:58px;height:55px;--rot:-16deg;left:-4%;top:68%\" viewBox=\"0 0 90 86\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#dtw-skull-side\"/></svg></div>";
    }

    function markup() {
        var tabs = MAIN_TABS.map(function (name) {
            var on = name === 'Sources' ? ' is-active' : '';
            return '<span class="dt-tab' + on + '">' + name + '</span>';
        }).join('');
        return (
            wreathMarkup() +
            '<div class="dt-card">' +
            '<div class="dt-tabbar">' +
                '<div class="dt-tabbar-left">' +
                    '<span class="dt-ico">' + ICO.inspect + '</span>' +
                    '<span class="dt-ico">' + ICO.device + '</span>' +
                '</div>' +
                '<div class="dt-tabs">' + tabs + '</div>' +
                '<div class="dt-tabbar-right">' +
                    '<span class="dt-badge is-error"><span class="dt-badge-dot"></span>2</span>' +
                    '<span class="dt-badge is-warn"><span class="dt-badge-dot"></span>2</span>' +
                    '<span class="dt-ico">' + ICO.gear + '</span>' +
                    '<span class="dt-ico">' + ICO.kebab + '</span>' +
                    '<span class="dt-ico">' + ICO.close + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="dt-subbar">' +
                '<div class="dt-tree-tabs">' +
                    '<span class="dt-tree-tab is-active">Page</span>' +
                    '<span class="dt-tree-tab">Workspace</span>' +
                    '<span class="dt-tree-tab">Overrides</span>' +
                    '<span class="dt-tree-tab">≫</span>' +
                '</div>' +
                '<div class="dt-filetabs">' + filetabsHtml() +
                    '<div class="dt-filetabs-end"><span class="dt-ico">' + ICO.split + '</span><span class="dt-ico">' + ICO.more + '</span></div>' +
                '</div>' +
                '<div class="dt-side-tools">' +
                    '<span class="dt-ico">' + ICO.pause + '</span>' +
                    '<span class="dt-ico">' + ICO.stepover + '</span>' +
                    '<span class="dt-ico">' + ICO.stepinto + '</span>' +
                    '<span class="dt-ico">' + ICO.stepout + '</span>' +
                    '<span class="dt-ico">' + ICO.deactivate + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="dt-panes">' +
                '<div class="dt-tree">' +
                    '<div class="dt-tree-scroll">' + treeHtml() + '</div>' +
                '</div>' +
                '<div class="dt-editor">' +
                    '<div class="dt-code-scroll" tabindex="0"></div>' +
                    '<div class="dt-status">' +
                        '<div class="dt-status-left">' +
                            '<span class="dt-ico" style="width:16px;height:16px">' + ICO.chev + '</span>' +
                            '<span class="dt-status-pos">' +
                                '<span class="dt-ico" style="width:14px;height:14px">' + ICO.brackets + '</span>' +
                                '<span class="dt-status-pos-text">Line 1, column 1</span>' +
                            '</span>' +
                        '</div>' +
                        '<div class="dt-status-right">Coverage: N/A</div>' +
                    '</div>' +
                '</div>' +
                '<aside class="dt-side" aria-hidden="true">' +
                    '<div class="dt-side-scroll">' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Watch</div></div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Breakpoints</div>' +
                            '<div class="dt-sec-body">' +
                                '<label class="dt-check"><input type="checkbox" tabindex="-1"> Pause on uncaught exceptions</label>' +
                                '<label class="dt-check"><input type="checkbox" checked tabindex="-1"> Pause on caught exceptions</label>' +
                            '</div>' +
                        '</div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Scope</div>' +
                            '<div class="dt-paused">Not paused</div>' +
                        '</div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Call Stack</div>' +
                            '<div class="dt-paused">Not paused</div>' +
                        '</div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>XHR/fetch breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>DOM breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Global listeners</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Event listener breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>CSP violation breakpoints</div></div>' +
                    '</div>' +
                '</aside>' +
            '</div>' +
            '</div>'
        );
    }

    function bind() {
        root.addEventListener('click', function (e) {
            var tab = e.target.closest('.dt-filetab, .dt-tree-row[data-file]');
            if (tab && tab.getAttribute('data-file')) {
                e.preventDefault();
                openFile(tab.getAttribute('data-file'));
                return;
            }
            var tog = e.target.closest('[data-toggle]');
            if (tog && tog.getAttribute('data-toggle')) {
                var key = tog.getAttribute('data-toggle');
                var branch = root.querySelector('[data-branch="' + key + '"]');
                if (branch) {
                    var open = !branch.classList.contains('is-open');
                    branch.classList.toggle('is-open', open);
                    var caret = tog.querySelector('.dt-caret');
                    if (caret) caret.innerHTML = open ? ICO.caretDown : ICO.caretRight;
                }
            }
        });
        var sc = root.querySelector('.dt-code-scroll');
        sc.addEventListener('scroll', function () {
            var line = Math.max(1, Math.floor(sc.scrollTop / 16) + 1);
            currentLine = line;
            updateStatus(line, colAtScroll());
            var rows = sc.querySelectorAll('.dt-code-row');
            var idx = Math.min(rows.length - 1, line - 1);
            var i;
            for (i = 0; i < rows.length; i++) rows[i].classList.toggle('is-current', i === idx);
        }, { passive: true });
    }


    var ORDINAL = ['first-product', 'second-product', 'third-product', 'fourth-product', 'fifth-product', 'sixth-product'];
    var SHIRT_SEL = '.explore-hero-section, .explore-grid-placeholder, .product-gallery, .product-image';
    var MANNEQUIN_SEL = '.hero-gone-image, .hero-gone-click-box, .hero-gone-extra-image';
    var WHISPERS = ['eekseye', 'nothing is real', 'next drop soon', 'we are the shareholder', 'your retirement is our playground', 'a little of everything', 'rock-solid, naturally', 'the monolith endures', 'stewardship at scale', 'XI — 11 11 2026', '11:11', 'XI.XI.MMXXVI', '-XI'];

    function clearMarks(cls) {
        if (!root) return;
        var rows = root.querySelectorAll('.dt-code-row.' + cls);
        var i;
        for (i = 0; i < rows.length; i++) rows[i].classList.remove(cls);
    }

    function lightRange(start, count, cls) {
        var sc = root.querySelector('.dt-code-scroll');
        if (!sc) return;
        var rows = sc.querySelectorAll('.dt-code-row');
        if (!rows.length) return;
        var i, from = Math.max(0, start - 1), n = count || 5;
        clearMarks(cls);
        for (i = from; i < Math.min(rows.length, from + n); i++) rows[i].classList.add(cls);
        return rows[Math.min(rows.length - 1, from)];
    }

    function findInSources(needles, preferId) {
        var lists = [];
        if (preferId) {
            var pref = FILES.filter(function (f) { return f.id === preferId; });
            lists = pref.concat(FILES.filter(function (f) { return f.id !== preferId; }));
        } else lists = FILES.slice();
        var f, i, n, src, lines, line;
        for (f = 0; f < lists.length; f++) {
            src = SOURCES[lists[f].id];
            if (!src) continue;
            lines = src.text.split('\n');
            for (i = 0; i < lines.length; i++) {
                line = lines[i];
                for (n = 0; n < needles.length; n++) {
                    if (needles[n] && line.indexOf(needles[n]) !== -1) {
                        return { id: lists[f].id, line: i + 1 };
                    }
                }
            }
        }
        return null;
    }

    function needlesFor(el) {
        var out = [];
        var id = el.id || (el.closest && (el.closest('[id]') || {}).id) || '';
        var host = el.closest ? (el.closest('[data-product-id], .explore-hero-section, .explore-grid-placeholder, .product-gallery') || el) : el;
        if (host.id) id = host.id || id;
        var pid = host.getAttribute && (host.getAttribute('data-product-id') || host.getAttribute('data-id'));
        if (!pid && id) {
            var ix = ORDINAL.indexOf(id);
            if (ix >= 0) pid = String(ix + 1);
        }
        if (id) {
            out.push(id);
            out.push('#' + id);
        }
        if (pid) {
            out.push('data-product-id="' + pid + '"');
            out.push('product-id="' + pid + '"');
            out.push("id: '" + pid + "'");
            out.push('id=' + pid);
            var ord = ORDINAL[parseInt(pid, 10) - 1];
            if (ord) { out.push(ord); out.push('#' + ord); }
        }
        return out;
    }

    function revealTarget(hit, cls, pulse) {
        if (!hit) return;
        function apply() {
            var row = lightRange(hit.line, 6, cls || 'is-lit');
            if (pulse) {
                clearMarks('is-pulse');
                lightRange(hit.line, 8, 'is-pulse');
            }
            if (row && row.scrollIntoView) {
                row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
            }
        }
        if (hit.id !== activeId) {
            openFile(hit.id);
            window.requestAnimationFrame(function () { window.requestAnimationFrame(apply); });
        } else apply();
    }

    function onShirtEnter(el) {
        window.clearTimeout(shirtTimer);
        holdScroll = true;
        var hit = findInSources(needlesFor(el), activeId);
        if (!hit) {
            var fallback = FILES.filter(function (f) { return /grid-float|explore-grid|designs-data|product\.html/.test(f.id); })[0];
            if (fallback && SOURCES[fallback.id]) hit = { id: fallback.id, line: 12 };
        }
        if (hit) revealTarget(hit, 'is-lit', false);
    }

    function onShirtLeave() {
        holdScroll = false;
        window.clearTimeout(shirtTimer);
        shirtTimer = window.setTimeout(function () { clearMarks('is-lit'); clearMarks('is-pulse'); }, 2200);
    }

    function onMannequinEnter() {
        window.clearTimeout(shirtTimer);
        holdScroll = true;
        var hero = FILES.filter(function (f) { return f.id === 'index-hero-reflection.js'; })[0];
        var hit = null;
        if (hero && SOURCES[hero.id]) {
            hit = findInSources(['reflection', 'hero', 'mannequin'], hero.id) || { id: hero.id, line: 1 };
        } else {
            hit = findInSources(['hero-reflection', 'reflection', 'mannequin'], activeId);
        }
        if (hit) revealTarget(hit, 'is-lit', true);
    }

    function bindReactive() {
        function fromEvent(e, sel) {
            var t = e.target;
            if (!t || !t.closest) return null;
            if (root.contains(t)) return null;
            return t.closest(sel);
        }
        document.addEventListener('pointerenter', function (e) {
            var shirt = fromEvent(e, SHIRT_SEL);
            if (shirt) { onShirtEnter(shirt); return; }
            var man = fromEvent(e, MANNEQUIN_SEL);
            if (man) onMannequinEnter();
        }, true);
        document.addEventListener('pointerleave', function (e) {
            var shirt = fromEvent(e, SHIRT_SEL);
            var man = fromEvent(e, MANNEQUIN_SEL);
            if (shirt || man) onShirtLeave();
        }, true);
        document.addEventListener('pointerdown', function (e) {
            var shirt = fromEvent(e, SHIRT_SEL);
            if (shirt) onShirtEnter(shirt);
        }, true);

        window.addEventListener('scroll', function () {
            if (holdScroll) return;
            speedMul = 3.4;
            window.clearTimeout(boostTimer);
            boostTimer = window.setTimeout(function () { speedMul = 1; }, 850);
            var sc = root && root.querySelector('.dt-code-scroll');
            if (!sc) return;
            var rows = sc.querySelectorAll('.dt-code-row');
            if (!rows.length) return;
            var box = sc.getBoundingClientRect();
            var vis = [];
            var i, r;
            for (i = 0; i < rows.length; i++) {
                r = rows[i].getBoundingClientRect();
                if (r.bottom > box.top + 4 && r.top < box.bottom - 4) vis.push(rows[i]);
            }
            clearMarks('is-passing');
            if (!vis.length) return;
            var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            var p = Math.max(0, Math.min(1, window.scrollY / max));
            var mid = Math.floor(p * Math.max(0, vis.length - 1));
            var from = Math.max(0, mid - 2);
            for (i = from; i < Math.min(vis.length, from + 5); i++) vis[i].classList.add('is-passing');
        }, { passive: true });
    }

    function startWhispers() {
        if (reduced) return;
        function schedule() {
            var wait = 10000 + Math.floor(Math.random() * 10000);
            whisperTimer = window.setTimeout(run, wait);
        }
        function run() {
            if (!root || !root.isConnected) return;
            if (holdScroll) { schedule(); return; }
            var sc = root.querySelector('.dt-code-scroll');
            if (!sc) { schedule(); return; }
            var rows = sc.querySelectorAll('.dt-code-row');
            if (!rows.length) { schedule(); return; }
            var vis = [];
            var cr = sc.getBoundingClientRect();
            var i, r;
            for (i = 0; i < rows.length; i++) {
                r = rows[i].getBoundingClientRect();
                if (r.top >= cr.top && r.bottom <= cr.bottom) vis.push(rows[i]);
            }
            var row = vis.length ? vis[Math.floor(Math.random() * vis.length)] : rows[Math.floor(Math.random() * rows.length)];
            var line = row.querySelector('.dt-line');
            if (!line) { schedule(); return; }
            var msg = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
            var whisper = document.createElement('span');
            whisper.className = 'dt-whisper';
            whisper.setAttribute('aria-hidden', 'true');
            line.appendChild(whisper);
            row.classList.add('is-whisper');
            var typed = 0;
            function type() {
                typed += 1;
                whisper.textContent = msg.slice(0, typed);
                if (typed < msg.length) {
                    window.setTimeout(type, 55);
                } else {
                    window.setTimeout(function () {
                        whisper.classList.add('is-fade');
                        window.setTimeout(function () {
                            if (whisper.parentNode) whisper.parentNode.removeChild(whisper);
                            row.classList.remove('is-whisper');
                        }, 900);
                    }, 1600);
                }
            }
            type();
            schedule();
        }
        schedule();
    }

    function startAutoScroll() {
        if (reduced) return;
        var sc = root.querySelector('.dt-code-scroll');
        var acc = 0;
        var started = 0;
        function tick(now) {
            if (!sc || !root.isConnected) return;
            if (!started) started = now;
            if (now - started < 1800) {
                scrollTimer = window.requestAnimationFrame(tick);
                return;
            }
            var max = sc.scrollHeight - sc.clientHeight;
            if (holdScroll) {
                scrollTimer = window.requestAnimationFrame(tick);
                return;
            }
            if (max > 8) {
                acc += 0.28 * scrollDir * speedMul;
                if (acc >= 1 || acc <= -1) {
                    sc.scrollTop += acc;
                    acc = acc - (acc >= 1 ? Math.floor(acc) : Math.ceil(acc));
                }
                if (sc.scrollTop >= max - 0.5) scrollDir = -1;
                if (sc.scrollTop <= 0) scrollDir = 1;
            }
            scrollTimer = window.requestAnimationFrame(tick);
        }
        scrollTimer = window.requestAnimationFrame(tick);
    }


    function mount() {
        document.documentElement.classList.add('has-site-devtools');
        var host = document.documentElement;
        var el = document.getElementById('site-devtools') || document.getElementById('hero-devtools');
        if (!el) {
            el = document.createElement('aside');
            el.id = 'site-devtools';
            el.className = 'site-devtools';
            el.setAttribute('aria-label', 'Decorative sources panel');
            host.appendChild(el);
        } else {
            el.classList.add('site-devtools');
            if (el.parentElement !== host) host.appendChild(el);
        }
        return el;
    }

    function bindWreathMotion() {
        if (!root || !window.matchMedia) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var card = root.querySelector('.dt-card');
        var pieces = root.querySelectorAll('.dt-wreath-piece');
        if (!card || !pieces.length) return;
        var mobile = window.matchMedia('(max-width: 768px)');
        function setTilt(x, y) {
            if (mobile.matches) {
                card.style.removeProperty('--rx');
                card.style.removeProperty('--ry');
                for (var i = 0; i < pieces.length; i++) {
                    pieces[i].style.removeProperty('--tx');
                    pieces[i].style.removeProperty('--ty');
                }
                return;
            }
            card.style.setProperty('--rx', (-y * 2.2) + 'deg');
            card.style.setProperty('--ry', (x * 2.2) + 'deg');
            for (var i = 0; i < pieces.length; i++) {
                var d = parseFloat(pieces[i].getAttribute('data-depth') || '1');
                pieces[i].style.setProperty('--tx', (x * 9 * d) + 'px');
                pieces[i].style.setProperty('--ty', (y * 8 * d) + 'px');
            }
        }
        root.addEventListener('pointermove', function (e) {
            if (e.pointerType === 'touch') return;
            var r = root.getBoundingClientRect();
            if (!r.width || !r.height) return;
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            setTilt(x, y);
        });
        root.addEventListener('pointerleave', function () {
            setTilt(0, 0);
        });
    }

    function boot() {
        root = mount();
        root.innerHTML = markup();
        bind();
        bindWreathMotion();
        Promise.all(FILES.map(function (file) {
            return loadFile(file).then(function (src) {
                SOURCES[file.id] = { path: file.path, lang: src.lang, text: src.text };
            });
        })).then(function () {
            renderCode(DEFAULT);
            startAutoScroll();
            bindReactive();
            startWhispers();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
