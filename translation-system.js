// Translation and Currency Conversion System
// Load js/eeks-translations.js before this file for full site copy.

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

    const translations = typeof window.EeksTranslations !== 'undefined'
        ? window.EeksTranslations
        : {
              en: { designs: 'Designs', contact: 'Contact', home: 'Home' },
              es: {},
              fr: {},
              de: {},
              it: {},
              zh: {},
              ja: {},
              ko: {}
          };

    // Initialize translation and currency conversion on page load
    document.addEventListener('DOMContentLoaded', function() {
        var p =
            typeof window.EeksCookies !== 'undefined' && window.EeksCookies.syncEffectiveToLocalStorage
                ? window.EeksCookies.syncEffectiveToLocalStorage()
                : {
                      currency: localStorage.getItem('selectedCurrency') || 'USD',
                      symbol: localStorage.getItem('selectedSymbol') || '$',
                      language: localStorage.getItem('selectedLanguage') || 'en'
                  };

        let currentCurrency = p.currency;
        let currentSymbol = p.symbol;
        let currentLanguage = p.language;

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

            document.querySelectorAll('[data-translate-aria]').forEach(function (element) {
                const key = element.getAttribute('data-translate-aria');
                if (lang[key]) {
                    element.setAttribute('aria-label', lang[key]);
                }
            });

            document.querySelectorAll('[data-translate-title]').forEach(function (element) {
                const key = element.getAttribute('data-translate-title');
                if (lang[key]) {
                    element.setAttribute('title', lang[key]);
                }
            });

            if (typeof window.applyProductI18n === 'function') {
                window.applyProductI18n(language);
            }
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

        window.EeksConvertPrices = convertPrices;
        window.EeksApplyTranslations = function (language) {
            translatePage(language || currentLanguage);
        };
    });
})();

