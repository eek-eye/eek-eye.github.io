/**
 * Profile / cart panel. Opens from signed-in profile or cart badge.
 * Requires: js/cart.js, optional authService / google-auth-ui
 */
(function () {
  'use strict';

  var panelEl = null;
  var currentUser = null;

  function ensureStyles() {
    if (document.getElementById('eeks-profile-panel-styles')) return;
    var s = document.createElement('style');
    s.id = 'eeks-profile-panel-styles';
    s.textContent =
      '.eeks-cart-badge{display:inline-flex;align-items:center;justify-content:center;min-width:1.1rem;height:1.1rem;padding:0 .28rem;margin-left:.3rem;border-radius:999px;background:transparent;color:inherit;border:1px solid currentColor;font-size:.65rem;font-weight:700;line-height:1;opacity:.9;}.eeks-cart-launch,.google-auth-signout{font:inherit;font-family:inherit;font-size:inherit;color:inherit;text-transform:uppercase;letter-spacing:inherit;font-weight:inherit;padding:inherit;border:none;border-radius:inherit;background:transparent;cursor:pointer;text-decoration:none;display:inline-block;appearance:none;-webkit-appearance:none;}.eeks-profile-trigger{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;background:transparent;border:none;color:inherit;padding:0;font:inherit;}' +
      '.eeks-profile-trigger{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;background:transparent;border:none;color:inherit;padding:0;font:inherit;}' +
      '.eeks-profile-overlay{position:fixed;inset:0;z-index:10090;background:rgba(0,0,0,.72);display:flex;justify-content:flex-end;}' +
      '.eeks-profile-panel{width:min(420px,100%);height:100%;background:#0f0f0f;color:#f5f5f5;border-left:1px solid #333;padding:1.25rem;overflow:auto;font-family:inherit;box-sizing:border-box;}' +
      '.eeks-profile-panel h2{margin:0 0 .25rem;font-size:1.1rem;letter-spacing:.06em;text-transform:uppercase;}' +
      '.eeks-profile-panel .eeks-profile-email{color:#aaa;font-size:.85rem;margin:0 0 1.25rem;}' +
      '.eeks-profile-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;}' +
      '.eeks-profile-close{background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1;}' +
      '.eeks-profile-user{display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;}' +
      '.eeks-profile-user img{width:40px;height:40px;border-radius:50%;object-fit:cover;}' +
      '.eeks-cart-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.85rem;}' +
      '.eeks-cart-item{display:grid;grid-template-columns:56px 1fr auto;gap:.75rem;align-items:center;padding:.65rem;border:1px solid #2a2a2a;border-radius:8px;background:#161616;}' +
      '.eeks-cart-item img{width:56px;height:56px;object-fit:cover;border-radius:6px;background:#222;}' +
      '.eeks-cart-item h3{margin:0 0 .25rem;font-size:.88rem;line-height:1.3;}' +
      '.eeks-cart-item .meta{color:#aaa;font-size:.8rem;}' +
      '.eeks-cart-qty{display:flex;align-items:center;gap:.35rem;margin-top:.4rem;}' +
      '.eeks-cart-qty button{width:1.6rem;height:1.6rem;border:1px solid #444;background:#222;color:#fff;border-radius:4px;cursor:pointer;}' +
      '.eeks-cart-remove{background:none;border:none;color:#ff8a80;font-size:.75rem;cursor:pointer;margin-top:.35rem;padding:0;}' +
      '.eeks-cart-empty{color:#888;font-size:.95rem;padding:1rem 0;}' +
      '.eeks-cart-footer{margin-top:1.25rem;padding-top:1rem;border-top:1px solid #2a2a2a;}' +
      '.eeks-cart-subtotal{display:flex;justify-content:space-between;font-weight:600;margin-bottom:1rem;}' +
      '.eeks-profile-actions{display:flex;flex-direction:column;gap:.55rem;}' +
      '.eeks-profile-actions a,.eeks-profile-actions button{display:block;text-align:center;padding:.75rem 1rem;border-radius:6px;font-weight:600;text-decoration:none;cursor:pointer;border:none;font:inherit;}' +
      '.eeks-btn-primary{background:#fff;color:#111;}' +
      '.eeks-btn-secondary{background:transparent;color:#fff;border:1px solid #555;}' +
      '.eeks-guest-note{color:#aaa;font-size:.85rem;margin:0 0 1rem;line-height:1.45;}' ;
    document.head.appendChild(s);
  }

  function money(n) {
    return '$' + (Number(n) || 0).toFixed(2);
  }

  function closePanel() {
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
  }

  function renderCartList(listEl) {
    if (!window.EeksCart) {
      listEl.innerHTML = '<p class="eeks-cart-empty">Cart unavailable.</p>';
      return;
    }
    var cart = window.EeksCart.get();
    if (!cart.items.length) {
      listEl.innerHTML = '<p class="eeks-cart-empty">Your cart is empty. Add something from Explore.</p>';
      return;
    }
    listEl.innerHTML = '';
    var ul = document.createElement('ul');
    ul.className = 'eeks-cart-list';
    cart.items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'eeks-cart-item';
      li.innerHTML =
        '<img src="' + (it.image || 'images/tags.png') + '" alt="">' +
        '<div>' +
        '<h3></h3>' +
        '<div class="meta"></div>' +
        '<div class="eeks-cart-qty">' +
        '<button type="button" data-act="dec" aria-label="Decrease">−</button>' +
        '<span data-qty></span>' +
        '<button type="button" data-act="inc" aria-label="Increase">+</button>' +
        '</div>' +
        '<button type="button" class="eeks-cart-remove" data-act="rm">Remove</button>' +
        '</div>' +
        '<div class="meta" data-line></div>';
      li.querySelector('h3').textContent = it.title;
      li.querySelector('.meta').textContent = money(it.price) + ' each';
      li.querySelector('[data-qty]').textContent = String(it.qty);
      li.querySelector('[data-line]').textContent = money(it.price * it.qty);
      li.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var act = btn.getAttribute('data-act');
          if (act === 'inc') window.EeksCart.setQty(it.productId, it.qty + 1);
          if (act === 'dec') window.EeksCart.setQty(it.productId, it.qty - 1);
          if (act === 'rm') window.EeksCart.removeItem(it.productId);
          openPanel(); // refresh
        });
      });
      // open product
      li.querySelector('h3').style.cursor = 'pointer';
      li.querySelector('h3').addEventListener('click', function () {
        window.location.href = 'product.html?id=' + encodeURIComponent(it.productId);
      });
      ul.appendChild(li);
    });
    listEl.appendChild(ul);
  }

  function checkoutFirstItem() {
    if (!window.EeksCart) return;
    var items = window.EeksCart.get().items;
    if (!items.length) return;
    // Current Stripe flow is one product per checkout — start with first line item.
    var id = items[0].productId;
    if (window.EeksStripeCheckout && window.EeksStripeCheckout.startCheckout) {
      window.EeksStripeCheckout.startCheckout(id, null);
    } else {
      window.location.href = 'product.html?id=' + encodeURIComponent(id);
    }
  }

  function openPanel() {
    ensureStyles();
    closePanel();
    panelEl = document.createElement('div');
    panelEl.className = 'eeks-profile-overlay';
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Profile and cart');

    var name = currentUser && (currentUser.displayName || currentUser.email) || 'Guest';
    var email = currentUser && currentUser.email || '';
    var photo = currentUser && currentUser.photoURL || '';

    panelEl.innerHTML =
      '<div class="eeks-profile-panel">' +
      '<div class="eeks-profile-head"><h2>Your profile</h2><button type="button" class="eeks-profile-close" aria-label="Close">&times;</button></div>' +
      '<div class="eeks-profile-user"></div>' +
      (currentUser ? '' : '<p class="eeks-guest-note">Sign in with Google to save your profile. Your cart is stored on this device either way.</p>') +
      '<h2 style="font-size:.95rem;margin:0 0 .75rem;">Cart</h2>' +
      '<div id="eeks-cart-mount"></div>' +
      '<div class="eeks-cart-footer">' +
      '<div class="eeks-cart-subtotal"><span>Subtotal</span><span id="eeks-cart-subtotal">$0.00</span></div>' +
      '<div class="eeks-profile-actions">' +
      '<button type="button" class="eeks-btn-primary" id="eeks-checkout-btn">Checkout</button>' +
      '<a class="eeks-btn-secondary" href="explore.html">Continue shopping</a>' +
      (currentUser ? '<button type="button" class="eeks-btn-secondary" id="eeks-signout-btn">Sign out</button>' : '<a class="eeks-btn-secondary" href="index.html">Sign in on Home</a>') +
      '</div></div></div>';

    var userRow = panelEl.querySelector('.eeks-profile-user');
    if (photo) {
      var img = document.createElement('img');
      img.src = photo;
      img.alt = '';
      userRow.appendChild(img);
    }
    var info = document.createElement('div');
    info.innerHTML = '<strong></strong><p class="eeks-profile-email"></p>';
    info.querySelector('strong').textContent = name;
    info.querySelector('p').textContent = email || (currentUser ? '' : 'Not signed in');
    userRow.appendChild(info);

    document.body.appendChild(panelEl);
    renderCartList(panelEl.querySelector('#eeks-cart-mount'));
    var sub = window.EeksCart ? window.EeksCart.subtotal() : 0;
    panelEl.querySelector('#eeks-cart-subtotal').textContent = money(sub);

    panelEl.querySelector('.eeks-profile-close').onclick = closePanel;
    panelEl.addEventListener('click', function (e) {
      if (e.target === panelEl) closePanel();
    });
    panelEl.querySelector('#eeks-checkout-btn').onclick = function () {
      checkoutFirstItem();
    };
    var so = panelEl.querySelector('#eeks-signout-btn');
    if (so) {
      so.onclick = async function () {
        try {
          var svc = window.__eeksAuthService || window.authService;
          if (svc && svc.signOut) await svc.signOut();
        } catch (e) {}
        currentUser = null;
        closePanel();
        window.location.reload();
      };
    }
  }

  function updateBadges() {
    var n = window.EeksCart ? window.EeksCart.count() : 0;
    document.querySelectorAll('[data-eeks-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      el.hidden = n <= 0;
    });
  }

  function ensureCartButton(nearEl) {
    if (!nearEl || !nearEl.parentElement) return;
    if (nearEl.parentElement.querySelector('.eeks-cart-launch')) return;
    ensureStyles();
    var btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'explore-button nav-link eeks-cart-launch';
    btn.setAttribute('role', 'button');
    btn.innerHTML = 'Cart <span class="eeks-cart-badge" data-eeks-cart-count hidden>0</span>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openPanel();
    });
    // insert after signed-in container / google button area
    nearEl.insertAdjacentElement('afterend', btn);
    updateBadges();
  }

  function wireProfileTriggers() {
    // Make signed-in identity open profile
    document.querySelectorAll('#googleAuthSignedIn, .google-auth-signed-in').forEach(function (el) {
      if (el.dataset.eeksProfileWired) return;
      el.dataset.eeksProfileWired = '1';
      el.style.cursor = 'pointer';
      el.title = 'Open profile & cart';
      el.addEventListener('click', function (e) {
        // ignore clicks on nested sign-out if present
        if (e.target && e.target.closest && e.target.closest('.google-auth-signout')) return;
        e.preventDefault();
        openPanel();
      });
      ensureCartButton(el);
    });
    // Also cart near google sign-in button when signed out
    var signIn = document.getElementById('googleSignInButton');
    if (signIn) ensureCartButton(signIn);
    updateBadges();
  }

  function setUser(user) {
    currentUser = user || null;
    wireProfileTriggers();
  }

  // Listen for auth if available
  function watchAuth() {
    try {
      if (window.authService && typeof window.authService.onAuthStateChanged === 'function') {
        window.authService.onAuthStateChanged(function (user) {
          setUser(user);
        });
        return;
      }
    } catch (e) {}
    // fallback: poll DOM / wait for google-auth-ui
    setTimeout(wireProfileTriggers, 300);
    setTimeout(wireProfileTriggers, 1200);
  }

  window.addEventListener('eekscartchange', updateBadges);

  // Expose for google-auth-ui integration
  window.EeksProfilePanel = {
    open: openPanel,
    close: closePanel,
    setUser: setUser,
    refresh: wireProfileTriggers
  };

  // Sign out helper used by panel — google-auth-ui exports default authService module;
  // also try dynamic import bridge
  window.EeksAuthSignOut = async function () {
    if (window.__eeksAuthService && window.__eeksAuthService.signOut) {
      return window.__eeksAuthService.signOut();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      watchAuth();
      wireProfileTriggers();
      updateBadges();
    });
  } else {
    watchAuth();
    wireProfileTriggers();
    updateBadges();
  }
})();
