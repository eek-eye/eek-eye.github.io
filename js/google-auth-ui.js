/**
 * Google Auth UI — mounts Continue with Google / signed-in identity + Sign out.
 * Uses js/authService.js (Firebase Auth ES module). Safe if Firebase fails to load.
 */
import authService from './authService.js';

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

  const displayNameEl = document.createElement('span');
  displayNameEl.className = 'google-auth-identity';
  const photoEl = document.createElement('img');
  photoEl.className = 'google-auth-photo';
  photoEl.alt = '';
  photoEl.hidden = true;
  const signOutBtn = document.createElement('button');
  signOutBtn.type = 'button';
  signOutBtn.className = 'google-auth-signout explore-button nav-link';
  signOutBtn.textContent = signOutLabel;
  signedInContainer.replaceChildren(photoEl, displayNameEl, signOutBtn);

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
    button.hidden = false;
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
    if (!button.textContent.trim()) button.textContent = signInLabel;
    signedInContainer.hidden = true;
    photoEl.hidden = true;
    photoEl.removeAttribute('src');
    displayNameEl.textContent = '';
  }

  function renderSignedIn(user) {
    button.hidden = true;
    signedInContainer.hidden = false;
    displayNameEl.textContent = displayLabel(user);
    if (user.photoURL) { photoEl.src = user.photoURL; photoEl.hidden = false; }
    else { photoEl.hidden = true; photoEl.removeAttribute('src'); }
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
  signOutBtn.addEventListener('click', handleSignOut);

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
      signOutBtn.removeEventListener('click', handleSignOut);
      if (typeof unsubscribe === 'function') { try { unsubscribe(); } catch (_) {} }
    }
  };
}

export default initGoogleAuthUI;