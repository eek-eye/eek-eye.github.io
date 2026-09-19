/**
 * Simple persistent cart (localStorage). Works signed-out or signed-in.
 * window.EeksCart
 */
(function () {
  'use strict';

  var KEY = 'eeks_cart_v1';

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : { items: [] };
      if (!data || !Array.isArray(data.items)) return { items: [] };
      return data;
    } catch (e) {
      return { items: [] };
    }
  }

  function write(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {}
    emit(cart);
  }

  function emit(cart) {
    try {
      window.dispatchEvent(new CustomEvent('eekscartchange', { detail: cart }));
    } catch (e) {}
  }

  function findProduct(productId) {
    var id = parseInt(productId, 10);
    if (window.EXPLORE_PRODUCTS && window.EXPLORE_PRODUCTS[id]) {
      return window.EXPLORE_PRODUCTS[id];
    }
    return null;
  }

  function addItem(productId, qty) {
    var product = findProduct(productId);
    if (!product) return { ok: false, error: 'Product not found' };
    var cart = read();
    var id = String(product.id);
    var q = Math.max(1, parseInt(qty, 10) || 1);
    var existing = cart.items.find(function (it) { return String(it.productId) === id; });
    if (existing) {
      existing.qty += q;
    } else {
      cart.items.push({
        productId: id,
        title: product.title || ('Product #' + id),
        price: Number(product.price) || 0,
        image: product.image || '',
        qty: q
      });
    }
    write(cart);
    return { ok: true, cart: cart };
  }

  function setQty(productId, qty) {
    var cart = read();
    var id = String(productId);
    var q = parseInt(qty, 10);
    cart.items = cart.items.filter(function (it) {
      if (String(it.productId) !== id) return true;
      if (!q || q <= 0) return false;
      it.qty = q;
      return true;
    });
    write(cart);
    return cart;
  }

  function removeItem(productId) {
    return setQty(productId, 0);
  }

  function clear() {
    write({ items: [] });
  }

  function count() {
    return read().items.reduce(function (n, it) { return n + (it.qty || 0); }, 0);
  }

  function subtotal() {
    return read().items.reduce(function (n, it) {
      return n + (Number(it.price) || 0) * (it.qty || 0);
    }, 0);
  }

  window.EeksCart = {
    get: read,
    addItem: addItem,
    setQty: setQty,
    removeItem: removeItem,
    clear: clear,
    count: count,
    subtotal: subtotal
  };

  // hydrate listeners
  emit(read());
})();
