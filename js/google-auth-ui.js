/**
 * Google Auth UI — mounts Continue with Google / signed-in identity + Sign out.
 * Uses js/authService.js (Firebase Auth ES module). Safe if Firebase fails to load.
 */
import authService from './authService.js';
try { window.__eeksAuthService = authService; window.authService = authService; } catch (e) {}

export function initGoogleAuthUI(options = {}) {
  const resolveEl = (ref) => {
    if (!ref) return null;
    if (typeof ref === 'string') return document.querySelector(ref);
    return ref instanceof HTMLElement ? ref : null;
  };

  const button = resolveEl(options.button);
  if (!button) {
    console.warn('[google-auth-ui] Sign-in button not found; skipping init.');
    return null;
  }

  let signedInContainer = resolveEl(options.signedInContainer);
  let errorEl = resolveEl(options.errorEl);
  const signInLabel = options.signInLabel || 'Continue with Google';
  const signOutLabel = options.signOutLabel || 'Sign out';

  if (!signedInContainer) {
    signedInContainer = document.createElement('div');
    signedInContainer.id = 'googleAuthSignedIn';
    signedInContainer.className = 'google-auth-signed-in';
    signedInContainer.hidden = true;
    signedInContainer.setAttribute('aria-live', 'polite');
    button.insertAdjacentElement('afterend', signedInContainer);
  }

  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'googleAuthError';
    errorEl.className = 'google-auth-error';
    errorEl.hidden = true;
    errorEl.setAttribute('role', 'alert');
    (signedInContainer.parentElement || button.parentElement || document.body).appendChild(errorEl);
  }

  const photoEl = document.createElement('img');
  photoEl.className = 'google-auth-photo';
  photoEl.alt = 'Your profile';
  photoEl.hidden = true;
  const fallbackEl = document.createElement('span');
  fallbackEl.className = 'google-auth-photo-fallback';
  fallbackEl.hidden = true;
  fallbackEl.setAttribute('aria-hidden', 'true');
  signedInContainer.replaceChildren(photoEl, fallbackEl);
  signedInContainer.classList.add('google-auth-signed-in--avatar-only');
  signedInContainer.setAttribute('role', 'button');
  signedInContainer.setAttribute('tabindex', '0');
  signedInContainer.setAttribute('aria-label', 'Open profile and cart');
  signedInContainer.title = 'Profile';

  let busy = false;
  let unsubscribe = null;

  function showError(message) {
    if (!errorEl) return;
    if (!message) { errorEl.hidden = true; errorEl.textContent = ''; return; }
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function displayLabel(user) {
    if (!user) return '';
    const full = (user.displayName || '').trim();
    if (full) { const first = full.split(/\s+/)[0]; return first || full; }
    return user.email || 'Signed in';
  }

  function renderSignedOut() {
    try {
      if (window.EeksProfilePanel && window.EeksProfilePanel.setUser) {
        window.EeksProfilePanel.setUser(null);
      }
    } catch (e) {}
    button.hidden = false;
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
    if (!button.textContent.trim()) button.textContent = signInLabel;
    signedInContainer.hidden = true;
    photoEl.hidden = true;
    photoEl.removeAttribute('src');
    fallbackEl.hidden = true;
    fallbackEl.textContent = '';
  }

  function renderSignedIn(user) {
    button.hidden = true;
    signedInContainer.hidden = false;
    var label = displayLabel(user) || 'Profile';
    photoEl.alt = label;
    signedInContainer.setAttribute('aria-label', 'Open profile for ' + label);
    if (user.photoURL) {
      photoEl.src = user.photoURL;
      photoEl.hidden = false;
      fallbackEl.hidden = true;
      fallbackEl.textContent = '';
    } else {
      photoEl.hidden = true;
      photoEl.removeAttribute('src');
      fallbackEl.textContent = (label.charAt(0) || '?').toUpperCase();
      fallbackEl.hidden = false;
    }
    try {
      if (window.EeksProfilePanel && window.EeksProfilePanel.setUser) {
        window.EeksProfilePanel.setUser(user);
      }
    } catch (e) {}
  }

  async function handleSignIn(event) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    showError('');
    try {
      if (!authService || typeof authService.signInWithGoogle !== 'function') {
        showError('Sign-in is temporarily unavailable.');
        return;
      }
      const result = await authService.signInWithGoogle();
      if (!result || !result.success) {
        showError((result && result.error) || 'Sign-in failed. Please try again.');
      }
    } catch (err) {
      console.warn('[google-auth-ui] sign-in error', err);
      showError('Sign-in failed. Please try again.');
    } finally {
      busy = false;
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
    }
  }

  async function handleSignOut(event) {
    event.preventDefault();
    showError('');
    try {
      if (!authService || typeof authService.signOut !== 'function') {
        showError('Sign-out is temporarily unavailable.');
        return;
      }
      const result = await authService.signOut();
      if (!result || !result.success) {
        showError((result && result.error) || 'Sign-out failed. Please try again.');
      }
    } catch (err) {
      console.warn('[google-auth-ui] sign-out error', err);
      showError('Sign-out failed. Please try again.');
    }
  }

  button.addEventListener('click', handleSignIn);
  function openProfile(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (window.EeksProfilePanel && window.EeksProfilePanel.open) {
      window.EeksProfilePanel.open();
    }
  }
  signedInContainer.addEventListener('click', openProfile);
  signedInContainer.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      openProfile(event);
    }
  });

  try {
    if (authService && typeof authService.onAuthStateChanged === 'function') {
      unsubscribe = authService.onAuthStateChanged((user) => {
        showError('');
        if (user) renderSignedIn(user); else renderSignedOut();
      });
    } else { renderSignedOut(); }
  } catch (err) {
    console.warn('[google-auth-ui] auth listener failed; leaving signed-out UI', err);
    renderSignedOut();
  }

  return {
    destroy() {
      button.removeEventListener('click', handleSignIn);
      signedInContainer.removeEventListener('click', openProfile);
      if (typeof unsubscribe === 'function') { try { unsubscribe(); } catch (_) {} }
    }
  };
}

export default initGoogleAuthUI;