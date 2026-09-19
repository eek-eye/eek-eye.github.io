/**
 * Product copy per language (Explore + product.html).
 * English (en) matches js/explore-data.js as the default catalog language.
 */
(function () {
    'use strict';

    var SHIRT_SUFFIX = {
        en: ' T-shirt',
        es: ' Camiseta',
        fr: ' T-shirt',
        de: ' T-Shirt',
        it: ' T-shirt',
        zh: ' T恤',
        ja: ' Tシャツ',
        ko: ' 티셔츠'
    };

    window.PRODUCT_I18N = {
        1: {
            en: {
                title: 'I Eeks Eye I 2026',
                category: 'Runway',
                description: 'EEKSEYE | Yīkèxī Collection oversized T-shirt in black.'
            },
            es: {
                title: 'I Eeks Eye I 2026',
                category: 'Pasarela',
                description: 'EEKSEYE | Colección Yīkèxī camiseta oversize en negro.'
            },
            fr: {
                title: 'I Eeks Eye I 2026',
                category: 'Défilé',
                description: 'EEKSEYE | Collection Yīkèxī — T-shirt oversize noir.'
            },
            de: {
                title: 'I Eeks Eye I 2026',
                category: 'Laufsteg',
                description: 'EEKSEYE | Yīkèxī-Kollektion — Oversized-T-Shirt in Schwarz.'
            },
            it: {
                title: 'I Eeks Eye I 2026',
                category: 'Sfilata',
                description: 'EEKSEYE | Collezione Yīkèxī — T-shirt oversize nera.'
            },
            zh: {
                title: 'I 伊克西 I Eeks Eye I 2026',
                category: '秀场',
                description: 'EEKSEYE | 伊克西系列黑色宽松T恤。'
            },
            ja: {
                title: 'I イークス・アイ I 2026',
                category: 'ランウェイ',
                description: 'EEKSEYE | 伊克西コレクション ブラックのオーバーサイズTシャツ。'
            },
            ko: {
                title: 'I 이크스 아이 I 2026',
                category: '런웨이',
                description: 'EEKSEYE | 이커시 컬렉션 블랙 오버사이즈 티셔츠.'
            }
        },
        2: {
            en: {
                title: 'I Full Moon I eekseye I 2026',
                category: 'Runway',
                description: 'Exclusive design from the Eeks Eye collection — contemporary art and fashion.'
            },
            es: {
                title: 'I Luna Llena I eekseye I 2026',
                category: 'Pasarela',
                description: 'Diseño exclusivo de la colección Eeks Eye — arte y moda contemporáneos.'
            },
            fr: {
                title: 'I Pleine lune I eekseye I 2026',
                category: 'Défilé',
                description: 'Création exclusive de la collection Eeks Eye — art et mode contemporains.'
            },
            de: {
                title: 'I Vollmond I eekseye I 2026',
                category: 'Laufsteg',
                description: 'Exklusives Design aus der Eeks-Eye-Kollektion — zeitgenössische Kunst und Mode.'
            },
            it: {
                title: 'I Luna piena I eekseye I 2026',
                category: 'Sfilata',
                description: 'Design esclusivo della collezione Eeks Eye — arte e moda contemporanea.'
            },
            zh: {
                title: 'I 满月 I eekseye I 2026',
                category: '秀场',
                description: 'Eeks Eye 系列独家设计——当代艺术与时尚融合。'
            },
            ja: {
                title: 'I 満月 I eekseye I 2026',
                category: 'ランウェイ',
                description: 'Eeks Eye コレクションの限定デザイン——現代アートとファッション。'
            },
            ko: {
                title: 'I 보름달 I eekseye I 2026',
                category: '런웨이',
                description: 'Eeks Eye 컬렉션 독점 디자인 — 현대 미술과 패션의 결합.'
            }
        },
        3: {
            en: {
                title: 'I Multiple Personality I eekseye I 2026',
                category: 'Runway',
                description: 'Exclusive design from the Eeks Eye collection — contemporary art and fashion.'
            },
            es: {
                title: 'I Personalidad múltiple I eekseye I 2026',
                category: 'Pasarela',
                description: 'Diseño exclusivo de la colección Eeks Eye — arte y moda contemporáneos.'
            },
            fr: {
                title: 'I Personnalités multiples I eekseye I 2026',
                category: 'Défilé',
                description: 'Création exclusive de la collection Eeks Eye — art et mode contemporains.'
            },
            de: {
                title: 'I Multiple Persönlichkeit I eekseye I 2026',
                category: 'Laufsteg',
                description: 'Exklusives Design aus der Eeks-Eye-Kollektion — zeitgenössische Kunst und Mode.'
            },
            it: {
                title: 'I Personalità multiple I eekseye I 2026',
                category: 'Sfilata',
                description: 'Design esclusivo della collezione Eeks Eye — arte e moda contemporanea.'
            },
            zh: {
                title: 'I 多重人格 I eekseye I 2026',
                category: '秀场',
                description: 'Eeks Eye 系列独家设计——当代艺术与时尚融合。'
            },
            ja: {
                title: 'I 多重人格 I eekseye I 2026',
                category: 'ランウェイ',
                description: 'Eeks Eye コレクションの限定デザイン——現代アートとファッション。'
            },
            ko: {
                title: 'I 다중 인격 I eekseye I 2026',
                category: '런웨이',
                description: 'Eeks Eye 컬렉션 독점 디자인 — 현대 미술과 패션의 결합.'
            }
        },
        4: {
            en: {
                title: 'I Meta I eekseye I 2026',
                category: 'Runway',
                description: 'Eeks Eye signature design — oversized T-shirt in premium dry jersey.'
            },
            es: {
                title: 'I Meta I eekseye I 2026',
                category: 'Pasarela',
                description: 'Diseño insignia Eeks Eye — camiseta oversize en jersey premium.'
            },
            fr: {
                title: 'I Meta I eekseye I 2026',
                category: 'Défilé',
                description: 'Signature Eeks Eye — T-shirt oversize en jersey premium.'
            },
            de: {
                title: 'I Meta I eekseye I 2026',
                category: 'Laufsteg',
                description: 'Eeks-Eye-Signatur — Oversized-T-Shirt aus Premium-Trikot.'
            },
            it: {
                title: 'I Meta I eekseye I 2026',
                category: 'Sfilata',
                description: 'Design signature Eeks Eye — T-shirt oversize in jersey premium.'
            },
            zh: {
                title: 'I メタ I eekseye I 2026',
                category: '秀场',
                description: 'Eeks Eye 标志性设计——高支干感 jersey 宽松T恤。'
            },
            ja: {
                title: 'I メタ I eekseye I 2026',
                category: 'ランウェイ',
                description: 'Eeks Eye シグネチャー — プレミアムドライジャージーのオーバーサイズTシャツ。'
            },
            ko: {
                title: 'I 메타 I eekseye I 2026',
                category: '런웨이',
                description: 'Eeks Eye 시그니처 — 프리미엄 드라이 저지 오버사이즈 티셔츠.'
            }
        },
        5: {
            en: {
                title: 'I Cold Smile Ideology I eekseye I 2029',
                category: 'Runway',
                description: 'Eeks Eye collection — future-facing graphic capturing the cold smile ideology of 2029.'
            },
            es: {
                title: 'I Ideología de la sonrisa fría I eekseye I 2029',
                category: 'Pasarela',
                description: 'Colección Eeks Eye — gráfico futurista que captura la ideología de la sonrisa fría de 2029.'
            },
            fr: {
                title: 'I Idéologie du sourire froid I eekseye I 2029',
                category: 'Défilé',
                description: 'Collection Eeks Eye — graphisme tourné vers l’avenir, idéologie du sourire froid 2029.'
            },
            de: {
                title: 'I Kaltes-Lächeln-Ideologie I eekseye I 2029',
                category: 'Laufsteg',
                description: 'Eeks-Eye-Kollektion — zukunftsweisendes Motiv, Ideologie des kalten Lächelns 2029.'
            },
            it: {
                title: 'I Ideologia del sorriso freddo I eekseye I 2029',
                category: 'Sfilata',
                description: 'Collezione Eeks Eye — grafica futurista sull’ideologia del sorriso freddo 2029.'
            },
            zh: {
                title: 'I 冷笑主义 I eekseye I 2029',
                category: '秀场',
                description: 'Eeks Eye 系列——面向未来的图形，诠释2029冷笑主义。'
            },
            ja: {
                title: 'I 冷笑主義 I eekseye I 2029',
                category: 'ランウェイ',
                description: 'Eeks Eye コレクション——2029年の冷笑主義を映すグラフィック。'
            },
            ko: {
                title: 'I 냉소 이데올로기 I eekseye I 2029',
                category: '런웨이',
                description: 'Eeks Eye 컬렉션 — 2029년 냉소 이데올로기를 담은 그래픽.'
            }
        },
        6: {
            en: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'Runway',
                description: 'Exclusive design from the Eeks Eye collection — contemporary art and fashion.'
            },
            es: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'Pasarela',
                description: 'Diseño exclusivo de la colección Eeks Eye — arte y moda contemporáneos.'
            },
            fr: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'Défilé',
                description: 'Création exclusive de la collection Eeks Eye — art et mode contemporains.'
            },
            de: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'Laufsteg',
                description: 'Exklusives Design aus der Eeks-Eye-Kollektion — zeitgenössische Kunst und Mode.'
            },
            it: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'Sfilata',
                description: 'Design esclusivo della collezione Eeks Eye — arte e moda contemporanea.'
            },
            zh: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: '秀场',
                description: 'Eeks Eye 系列独家设计——当代艺术与时尚融合。'
            },
            ja: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: 'ランウェイ',
                description: 'Eeks Eye コレクションの限定デザイン——現代アートとファッション。'
            },
            ko: {
                title: 'I x I eekseye I 2026 · I y I eekseye I 2026',
                category: '런웨이',
                description: 'Eeks Eye 컬렉션 독점 디자인 — 현대 미술과 패션의 결합.'
            }
        }
    };

    window.PRODUCT_I18N[7] = window.PRODUCT_I18N[6];

    function pickFields(id, lang) {
        var base = window.EXPLORE_PRODUCTS && window.EXPLORE_PRODUCTS[id];
        var bag = window.PRODUCT_I18N && window.PRODUCT_I18N[id];
        var loc = bag && bag[lang];
        var fallbackEn = bag && bag.en;
        if (!base && !loc && !fallbackEn) return null;
        return {
            title: (loc && loc.title) || (fallbackEn && fallbackEn.title) || (base && base.title),
            category: (loc && loc.category) || (fallbackEn && fallbackEn.category) || (base && base.category),
            description: (loc && loc.description) || (fallbackEn && fallbackEn.description) || (base && base.description)
        };
    }

    function shirtSuffix(lang) {
        return SHIRT_SUFFIX[lang] || SHIRT_SUFFIX.en;
    }

    /**
     * Apply product titles/categories/descriptions for the current language.
     * @param {string} lang — same codes as currency selector (en, es, fr, …)
     */
    window.applyProductI18n = function (lang) {
        lang = lang || (typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || 'en';

        document.querySelectorAll('[data-product-id]').forEach(function (section) {
            var id = parseInt(section.getAttribute('data-product-id'), 10);
            if (!id) return;
            var fields = pickFields(id, lang);
            if (!fields) return;
            var t = section.querySelector('.explore-hero-title');
            var c = section.querySelector('.explore-hero-category');
            if (t) t.textContent = fields.title;
            if (c) c.textContent = fields.category;
        });

        var pageId = document.body.getAttribute('data-product-page-id');
        if (pageId) {
            var pid = parseInt(pageId, 10);
            var fields = pickFields(pid, lang);
            if (fields) {
                var titleEl = document.getElementById('product-title');
                var catEl = document.getElementById('product-category');
                var descEl = document.getElementById('product-description');
                var suf = shirtSuffix(lang);
                if (titleEl) titleEl.textContent = fields.title + suf;
                if (catEl) catEl.textContent = fields.category;
                if (descEl) descEl.textContent = fields.description;
                var meta = document.querySelector('title');
                if (meta && titleEl) {
                    meta.textContent = fields.title + suf + ' - Eeks.Eye Official Store';
                }
            }
        }
    };
})();
