/**
 * Aesthetic shirt-grid behavior for the home page: glitch-text inject,
 * password gate that continues to product.html (Stripe buy lives there),
 * and 3-column placeholders. Matches the Aesthetic (explore) cards.
 */
(function () {
    'use strict';

    var currentProductNumber = null;
    var passwordAttempts = 0;
    var maxPasswordAttempts = 3;
    var explorePasswordIgnoreHeroClickUntil = 0;
    var PLACEHOLDER_UNAVAILABLE_SRC = 'eekseye.png/I%20Unavailable%20I%20EEKSEYE%20I%20XXX.png';

    function injectExploreHeroText() {
        var tpl = document.getElementById('explore-hero-text-template');
        if (!tpl || !tpl.content) return;
        document.querySelectorAll('.explore-hero-section').forEach(function (section) {
            if (section.querySelector('.explore-hero-text-fill')) return;
            var bg = section.querySelector('.explore-hero-bg');
            var node = tpl.content.firstElementChild.cloneNode(true);
            if (bg && bg.parentNode) {
                bg.parentNode.insertBefore(node, bg.nextSibling);
            } else {
                section.insertBefore(node, section.firstChild);
            }
        });
        if (window.EEKSEYE_textGlitch && typeof window.EEKSEYE_textGlitch.refresh === 'function') {
            window.EEKSEYE_textGlitch.refresh();
        }
    }

    function colsForWidth() {
        var w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 900) return 2;
        return 3;
    }

    function updateGridPlaceholders() {
        var wrap = document.getElementById('exploreProducts');
        if (!wrap || !wrap.classList.contains('explore-products--columns-3')) return;
        wrap.querySelectorAll(':scope > .explore-grid-placeholder').forEach(function (el) {
            el.remove();
        });
        var cols = colsForWidth();
        var singles = Array.prototype.filter.call(
            wrap.querySelectorAll(':scope > .explore-hero-section'),
            function (s) {
                return !s.classList.contains('explore-hero-section--pair');
            }
        );
        if (singles.length === 0 || cols <= 1) return;
        var rem = singles.length % cols;
        var need = rem === 0 ? 0 : cols - rem;
        if (need === 0) return;
        var pair = wrap.querySelector(':scope > .explore-hero-section--pair');
        for (var i = 0; i < need; i++) {
            var ph = document.createElement('div');
            ph.className = 'explore-grid-placeholder';
            ph.innerHTML =
                '<img src="' + PLACEHOLDER_UNAVAILABLE_SRC + '" alt="" class="explore-grid-placeholder-img" decoding="async">' +
                '<div class="explore-hero-info">' +
                '<div class="explore-hero-title">I Unavailable I EEKSEYE I X/X/X</div>' +
                '<div class="explore-hero-category">Coming Soon...</div>' +
                '</div>';
            if (pair) wrap.insertBefore(ph, pair);
            else wrap.appendChild(ph);
        }
    }

    function handleExploreProductClick(e, productNumber, el) {
        if (Date.now() < explorePasswordIgnoreHeroClickUntil) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            return;
        }
        if (e && e.target && e.target.closest && e.target.closest('.password-overlay')) {
            return;
        }
        showPasswordModal(productNumber, el);
    }

    function showPasswordModal(productNumber, el) {
        currentProductNumber = Number(productNumber);
        var pool = document.getElementById('explore-password-pool');
        var passwordOverlay = document.querySelector('.password-overlay');
        var passwordModal = passwordOverlay ? passwordOverlay.querySelector('.password-modal') : null;
        var passwordInput = passwordOverlay ? passwordOverlay.querySelector('.password-input') : null;
        var passwordCloseBtn = passwordOverlay ? passwordOverlay.querySelector('.password-close-btn') : null;
        if (!passwordOverlay || !passwordModal || !pool) return;

        var sectionIdMap = {
            1: 'first-product',
            2: 'second-product',
            3: 'third-product',
            4: 'fourth-product',
            5: 'fifth-product',
            6: 'sixth-product',
            7: 'sixth-product'
        };
        var targetId = sectionIdMap[currentProductNumber] || sectionIdMap[1];
        var targetSection = document.getElementById(targetId);
        var host = targetSection;
        if (el && el.classList) {
            if (el.classList.contains('explore-hero-pair-col') || el.classList.contains('explore-hero-section')) {
                host = el;
            }
        }
        if (!host) return;

        host.appendChild(passwordOverlay);
        passwordOverlay.classList.add('password-overlay--docked');
        passwordOverlay.style.top = '';
        passwordOverlay.style.left = '';
        passwordOverlay.style.width = '';
        passwordOverlay.style.height = '';
        passwordModal.style.top = '';
        passwordModal.style.left = '';
        passwordOverlay.classList.remove('success', 'shake');
        passwordModal.classList.remove('success');
        if (passwordInput) passwordInput.classList.remove('success');

        passwordOverlay.classList.add('active');
        passwordModal.classList.add('active');
        if (passwordInput) passwordInput.removeAttribute('aria-hidden');
        if (passwordCloseBtn) {
            passwordCloseBtn.style.opacity = '1';
            passwordCloseBtn.style.pointerEvents = 'auto';
        }
        if (passwordInput) {
            passwordInput.value = '';
            setTimeout(function () {
                passwordInput.focus();
            }, 100);
            passwordInput.onkeypress = function (e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    checkPassword();
                }
            };
            passwordInput.onkeydown = function (e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    checkPassword();
                }
            };
        }
    }

    function closePasswordModal() {
        explorePasswordIgnoreHeroClickUntil = Date.now() + 450;
        var pool = document.getElementById('explore-password-pool');
        var passwordOverlay = document.querySelector('.password-overlay');
        var passwordModal = passwordOverlay ? passwordOverlay.querySelector('.password-modal') : document.querySelector('.password-modal');
        var passwordInput = passwordOverlay ? passwordOverlay.querySelector('.password-input') : document.querySelector('.password-input');
        var passwordCloseBtn = passwordOverlay ? passwordOverlay.querySelector('.password-close-btn') : document.querySelector('.password-close-btn');

        if (passwordOverlay) {
            passwordOverlay.classList.remove('active', 'success', 'shake', 'password-overlay--docked');
            passwordOverlay.style.top = '';
            passwordOverlay.style.left = '';
            passwordOverlay.style.width = '';
            passwordOverlay.style.height = '';
            if (pool) pool.appendChild(passwordOverlay);
        }
        if (passwordModal) {
            passwordModal.classList.remove('active', 'success');
            passwordModal.style.top = '';
            passwordModal.style.left = '';
        }
        if (passwordCloseBtn) {
            passwordCloseBtn.style.opacity = '0';
            passwordCloseBtn.style.pointerEvents = 'none';
        }
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.blur();
            passwordInput.setAttribute('aria-hidden', 'true');
        }
    }

    function checkPassword() {
        var passwordInput = document.querySelector('.password-input');
        var passwordOverlay = document.querySelector('.password-overlay');
        var correctPassword = 'overlay';
        if (!passwordInput) return;
        if (passwordAttempts >= maxPasswordAttempts) {
            alert('Maximum password attempts reached. Please refresh the page to try again.');
            return;
        }
        var input = (passwordInput.value || '').trim();
        if (input === correctPassword) {
            if (passwordOverlay) passwordOverlay.classList.add('success');
            var passwordModal = document.querySelector('.password-modal');
            if (passwordModal) passwordModal.classList.add('success');
            passwordInput.classList.add('success');
            setTimeout(function () {
                closePasswordModal();
                setTimeout(function () {
                    var productNum = currentProductNumber || 1;
                    window.location.href = 'product.html?id=' + encodeURIComponent(productNum);
                }, 300);
            }, 500);
        } else {
            passwordAttempts++;
            if (passwordOverlay) {
                passwordOverlay.classList.add('shake');
                setTimeout(function () {
                    passwordOverlay.classList.remove('shake');
                }, 500);
            }
            document.body.classList.add('shake');
            setTimeout(function () {
                document.body.classList.remove('shake');
            }, 500);
            passwordInput.style.borderBottomColor = '#ff0000';
            passwordInput.value = '';
            setTimeout(function () {
                passwordInput.style.borderBottomColor = '#fff';
            }, 2000);
        }
    }

    function bindPasswordChrome() {
        var passwordOverlay = document.querySelector('.password-overlay');
        var passwordModal = passwordOverlay ? passwordOverlay.querySelector('.password-modal') : null;
        var passwordCloseBtn = passwordOverlay ? passwordOverlay.querySelector('.password-close-btn') : null;
        if (passwordOverlay) {
            passwordOverlay.addEventListener('click', function (e) {
                if (e.target === passwordOverlay) {
                    e.stopPropagation();
                    closePasswordModal();
                }
            });
        }
        if (passwordModal) {
            passwordModal.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
        if (passwordCloseBtn) {
            passwordCloseBtn.addEventListener('mousedown', function (e) {
                e.stopPropagation();
            }, true);
            passwordCloseBtn.addEventListener('touchend', function (e) {
                e.stopPropagation();
                e.preventDefault();
                closePasswordModal();
            }, { passive: false });
        }
        document.addEventListener('keydown', function (e) {
            var isEsc = e.key === 'Escape' || e.key === 'Esc' || e.code === 'Escape' || e.keyCode === 27;
            if (!isEsc) return;
            if (!document.querySelector('.password-overlay.active')) return;
            closePasswordModal();
        });
    }

    function init() {
        injectExploreHeroText();
        updateGridPlaceholders();
        bindPasswordChrome();
        window.addEventListener('resize', updateGridPlaceholders);
    }

    window.handleExploreProductClick = handleExploreProductClick;
    window.closePasswordModal = closePasswordModal;
    window.checkPassword = checkPassword;
    window.refreshExploreProductGridPlaceholders = updateGridPlaceholders;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
