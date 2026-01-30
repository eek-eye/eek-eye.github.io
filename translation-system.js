// Translation and Currency Conversion System
// This script should be included in all HTML pages

(function() {
    'use strict';

    // Currency conversion rates (USD as base)
    const exchangeRates = {
        USD: 1.0,
        CAD: 1.35,
        EUR: 0.92,
        CNY: 7.24,
        JPY: 149.50,
        KRW: 1318.50,
        GBP: 0.79,
        AUD: 1.52,
        NZD: 1.68,
        MXN: 16.85
    };

    // Translation dictionary
    const translations = {
        en: {
            designs: 'Designs',
            aesthetic: 'Aesthetic',
            why: 'Why?',
            contact: 'Contact',
            login: 'Login',
            profile: 'Profile',
            likes: 'Likes',
            address: 'Address',
            orders: 'Orders',
            news: 'News',
            faq: 'FAQ',
            whatYouNeedToKnow: 'What You Need To Know',
            subscribeToUpdates: 'Subscribe to Updates',
            enterEmail: 'Enter your email here',
            subscribeNewsletter: 'Yes, subscribe for newsletter',
            subscribe: 'Subscribe',
            username: 'Username',
            password: 'Password',
            or: 'or',
            signUp: 'Sign up',
            searchPlaceholder: 'What are you looking for...',
            popularSearches: 'Popular Searches:',
            comingSoon: 'coming soon...'
        },
        es: {
            designs: 'Diseños',
            aesthetic: 'Estética',
            why: '¿Por qué?',
            contact: 'Contacto',
            login: 'Iniciar sesión',
            profile: 'Perfil',
            likes: 'Me gusta',
            address: 'Dirección',
            orders: 'Pedidos',
            news: 'Noticias',
            faq: 'Preguntas frecuentes',
            whatYouNeedToKnow: 'Lo que necesitas saber',
            subscribeToUpdates: 'Suscríbete a las actualizaciones',
            enterEmail: 'Ingresa tu correo aquí',
            subscribeNewsletter: 'Sí, suscríbeme al boletín',
            subscribe: 'Suscribirse',
            username: 'Nombre de usuario',
            password: 'Contraseña',
            or: 'o',
            signUp: 'Registrarse',
            searchPlaceholder: '¿Qué estás buscando...',
            popularSearches: 'Búsquedas populares:',
            comingSoon: 'próximamente...'
        },
        fr: {
            designs: 'Designs',
            aesthetic: 'Esthétique',
            why: 'Pourquoi?',
            contact: 'Contact',
            login: 'Connexion',
            profile: 'Profil',
            likes: 'J\'aime',
            address: 'Adresse',
            orders: 'Commandes',
            news: 'Actualités',
            faq: 'FAQ',
            whatYouNeedToKnow: 'Ce que vous devez savoir',
            subscribeToUpdates: 'S\'abonner aux mises à jour',
            enterEmail: 'Entrez votre email ici',
            subscribeNewsletter: 'Oui, s\'abonner à la newsletter',
            subscribe: 'S\'abonner',
            username: 'Nom d\'utilisateur',
            password: 'Mot de passe',
            or: 'ou',
            signUp: 'S\'inscrire',
            searchPlaceholder: 'Que cherchez-vous...',
            popularSearches: 'Recherches populaires:',
            comingSoon: 'bientôt disponible...'
        },
        de: {
            designs: 'Designs',
            aesthetic: 'Ästhetik',
            why: 'Warum?',
            contact: 'Kontakt',
            login: 'Anmelden',
            profile: 'Profil',
            likes: 'Gefällt mir',
            address: 'Adresse',
            orders: 'Bestellungen',
            news: 'Nachrichten',
            faq: 'FAQ',
            whatYouNeedToKnow: 'Was Sie wissen müssen',
            subscribeToUpdates: 'Updates abonnieren',
            enterEmail: 'Geben Sie hier Ihre E-Mail ein',
            subscribeNewsletter: 'Ja, Newsletter abonnieren',
            subscribe: 'Abonnieren',
            username: 'Benutzername',
            password: 'Passwort',
            or: 'oder',
            signUp: 'Registrieren',
            searchPlaceholder: 'Wonach suchen Sie...',
            popularSearches: 'Beliebte Suchen:',
            comingSoon: 'demnächst...'
        },
        it: {
            designs: 'Design',
            aesthetic: 'Estetica',
            why: 'Perché?',
            contact: 'Contatto',
            login: 'Accedi',
            profile: 'Profilo',
            likes: 'Mi piace',
            address: 'Indirizzo',
            orders: 'Ordini',
            news: 'Notizie',
            faq: 'FAQ',
            whatYouNeedToKnow: 'Cosa devi sapere',
            subscribeToUpdates: 'Iscriviti agli aggiornamenti',
            enterEmail: 'Inserisci la tua email qui',
            subscribeNewsletter: 'Sì, iscriviti alla newsletter',
            subscribe: 'Iscriviti',
            username: 'Nome utente',
            password: 'Password',
            or: 'o',
            signUp: 'Registrati',
            searchPlaceholder: 'Cosa stai cercando...',
            popularSearches: 'Ricerche popolari:',
            comingSoon: 'in arrivo...'
        },
        zh: {
            designs: '设计',
            aesthetic: '美学',
            why: '为什么？',
            contact: '联系',
            login: '登录',
            profile: '个人资料',
            likes: '喜欢',
            address: '地址',
            orders: '订单',
            news: '新闻',
            faq: '常见问题',
            whatYouNeedToKnow: '你需要知道的',
            subscribeToUpdates: '订阅更新',
            enterEmail: '在此输入您的电子邮件',
            subscribeNewsletter: '是的，订阅新闻通讯',
            subscribe: '订阅',
            username: '用户名',
            password: '密码',
            or: '或',
            signUp: '注册',
            searchPlaceholder: '你在找什么...',
            popularSearches: '热门搜索:',
            comingSoon: '即将推出...'
        },
        ja: {
            designs: 'デザイン',
            aesthetic: '美学',
            why: 'なぜ？',
            contact: 'お問い合わせ',
            login: 'ログイン',
            profile: 'プロフィール',
            likes: 'いいね',
            address: '住所',
            orders: '注文',
            news: 'ニュース',
            faq: 'よくある質問',
            whatYouNeedToKnow: '知っておくべきこと',
            subscribeToUpdates: 'アップデートを購読',
            enterEmail: 'ここにメールアドレスを入力',
            subscribeNewsletter: 'はい、ニュースレターを購読します',
            subscribe: '購読',
            username: 'ユーザー名',
            password: 'パスワード',
            or: 'または',
            signUp: '登録',
            searchPlaceholder: '何をお探しですか...',
            popularSearches: '人気の検索:',
            comingSoon: '近日公開...'
        },
        ko: {
            designs: '디자인',
            aesthetic: '미학',
            why: '왜?',
            contact: '연락처',
            login: '로그인',
            profile: '프로필',
            likes: '좋아요',
            address: '주소',
            orders: '주문',
            news: '뉴스',
            faq: '자주 묻는 질문',
            whatYouNeedToKnow: '알아야 할 사항',
            subscribeToUpdates: '업데이트 구독',
            enterEmail: '여기에 이메일을 입력하세요',
            subscribeNewsletter: '예, 뉴스레터 구독',
            subscribe: '구독',
            username: '사용자 이름',
            password: '비밀번호',
            or: '또는',
            signUp: '가입',
            searchPlaceholder: '무엇을 찾고 계신가요...',
            popularSearches: '인기 검색:',
            comingSoon: '곧 출시...'
        }
    };

    // Initialize translation and currency conversion on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Get saved language/currency or default to USD/English
        let currentCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        let currentSymbol = localStorage.getItem('selectedSymbol') || '$';
        let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

        // Translate page function
        function translatePage(language) {
            const lang = translations[language] || translations.en;
            
            // Translate elements with data-translate attribute
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (lang[key]) {
                    element.textContent = lang[key];
                }
            });

            // Translate placeholders
            document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
                const key = element.getAttribute('data-translate-placeholder');
                if (lang[key]) {
                    element.placeholder = lang[key];
                }
            });

            // Translate "coming soon" text
            const comingSoonElements = document.querySelectorAll('*');
            comingSoonElements.forEach(element => {
                if (element.textContent && element.textContent.trim().toLowerCase() === 'coming soon...') {
                    element.textContent = lang.comingSoon;
                }
            });
        }

        // Convert prices function
        // Base price is always in USD ($200 = 200 USD)
        function convertPrices() {
            // Convert prices with data-price attribute (base price is in USD)
            const priceElements = document.querySelectorAll('[data-price]');
            priceElements.forEach(element => {
                const basePriceUSD = parseFloat(element.getAttribute('data-price'));
                if (!isNaN(basePriceUSD) && basePriceUSD > 0) {
                    // Convert from USD to selected currency
                    const convertedPrice = basePriceUSD * exchangeRates[currentCurrency];
                    let formattedPrice;
                    
                    if (currentCurrency === 'USD') {
                        formattedPrice = `$${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CAD' || currentCurrency === 'AUD' || currentCurrency === 'NZD') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'MXN') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)} MXN`;
                    } else if (currentCurrency === 'EUR') {
                        formattedPrice = `€${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'GBP') {
                        formattedPrice = `£${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CNY') {
                        formattedPrice = `¥${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'JPY') {
                        formattedPrice = `¥${Math.round(convertedPrice)}`;
                    } else if (currentCurrency === 'KRW') {
                        formattedPrice = `₩${Math.round(convertedPrice)}`;
                    } else {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    }
                    
                    element.textContent = formattedPrice;
                }
            });

            // Also convert prices in .explore-product-price elements (base price is USD)
            const explorePrices = document.querySelectorAll('.explore-product-price');
            explorePrices.forEach(element => {
                // Get base price from data-price attribute, default to 200 USD if not set
                const basePriceUSD = parseFloat(element.getAttribute('data-price')) || 200;
                if (!isNaN(basePriceUSD) && basePriceUSD > 0) {
                    // Convert from USD to selected currency
                    const convertedPrice = basePriceUSD * exchangeRates[currentCurrency];
                    let formattedPrice;
                    
                    if (currentCurrency === 'USD') {
                        formattedPrice = `$${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CAD' || currentCurrency === 'AUD' || currentCurrency === 'NZD') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'MXN') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)} MXN`;
                    } else if (currentCurrency === 'EUR') {
                        formattedPrice = `€${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'GBP') {
                        formattedPrice = `£${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CNY') {
                        formattedPrice = `¥${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'JPY') {
                        formattedPrice = `¥${Math.round(convertedPrice)}`;
                    } else if (currentCurrency === 'KRW') {
                        formattedPrice = `₩${Math.round(convertedPrice)}`;
                    } else {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    }
                    
                    element.textContent = formattedPrice;
                }
            });

            // Convert prices in .product-price elements (base price is USD)
            const productPrices = document.querySelectorAll('.product-price');
            productPrices.forEach(element => {
                // Get base price from data-price attribute, default to 200 USD if not set
                const basePriceUSD = parseFloat(element.getAttribute('data-price')) || 200;
                if (!isNaN(basePriceUSD) && basePriceUSD > 0) {
                    // Convert from USD to selected currency
                    const convertedPrice = basePriceUSD * exchangeRates[currentCurrency];
                    let formattedPrice;
                    
                    if (currentCurrency === 'USD') {
                        formattedPrice = `$${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CAD' || currentCurrency === 'AUD' || currentCurrency === 'NZD') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'MXN') {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)} MXN`;
                    } else if (currentCurrency === 'EUR') {
                        formattedPrice = `€${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'GBP') {
                        formattedPrice = `£${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'CNY') {
                        formattedPrice = `¥${convertedPrice.toFixed(2)}`;
                    } else if (currentCurrency === 'JPY') {
                        formattedPrice = `¥${Math.round(convertedPrice)}`;
                    } else if (currentCurrency === 'KRW') {
                        formattedPrice = `₩${Math.round(convertedPrice)}`;
                    } else {
                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                    }
                    
                    element.textContent = formattedPrice;
                }
            });

            // Convert prices in format $XXX (general price conversion)
            const pricePattern = /\$(\d+)/g;
            const allTextElements = document.querySelectorAll('body *');
            allTextElements.forEach(element => {
                if (element.children.length === 0 && element.textContent) {
                    const text = element.textContent;
                    const match = text.match(pricePattern);
                    if (match && !element.hasAttribute('data-price') && !element.classList.contains('explore-product-price')) {
                        // Check if this looks like a price (not part of a URL or other context)
                        if (text.trim().startsWith('$') || text.includes('$') && /^\$?\d+/.test(text.trim())) {
                            const priceMatch = text.match(/\$(\d+)/);
                            if (priceMatch) {
                                const basePrice = parseFloat(priceMatch[1]);
                                if (!isNaN(basePrice) && basePrice > 0 && basePrice < 10000) {
                                    const convertedPrice = basePrice * exchangeRates[currentCurrency];
                                    let formattedPrice;
                                    
                                    if (currentCurrency === 'USD' || currentCurrency === 'CAD' || currentCurrency === 'AUD' || currentCurrency === 'NZD') {
                                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                                    } else if (currentCurrency === 'MXN') {
                                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)} MXN`;
                                    } else if (currentCurrency === 'EUR') {
                                        formattedPrice = `€${convertedPrice.toFixed(2)}`;
                                    } else if (currentCurrency === 'GBP') {
                                        formattedPrice = `£${convertedPrice.toFixed(2)}`;
                                    } else if (currentCurrency === 'CNY') {
                                        formattedPrice = `¥${convertedPrice.toFixed(2)}`;
                                    } else if (currentCurrency === 'JPY') {
                                        formattedPrice = `¥${Math.round(convertedPrice)}`;
                                    } else if (currentCurrency === 'KRW') {
                                        formattedPrice = `₩${Math.round(convertedPrice)}`;
                                    } else {
                                        formattedPrice = `${currentSymbol}${convertedPrice.toFixed(2)}`;
                                    }
                                    
                                    element.textContent = text.replace(pricePattern, formattedPrice);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Apply translations and price conversions on page load
        translatePage(currentLanguage);
        convertPrices();
    });
})();

