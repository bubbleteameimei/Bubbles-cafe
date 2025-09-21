/*!
 * Lightweight client error polyfill
 * Suppresses noisy cross-origin "Script error." reports while keeping real errors visible.
 */
(function () {
  function shouldIgnore(ev) {
    try {
      const msg = (ev && (ev.message || ev.reason && ev.reason.message)) || '';
      if (!msg) return false;
      // Classic cross-origin script error message
      if (msg === 'Script error.' || msg === 'Script error') return true;
      // Other common cross-origin noise
      return /cross[- ]origin|script error/i.test(msg);
    } catch {
      return false;
    }
  }

  // Capture errors early in the bubble/capture phase
  window.addEventListener('error', function (ev) {
    if (shouldIgnore(ev)) {
      // Prevent noisy console/error reporting for cross-origin script errors
      if (typeof ev.preventDefault === 'function') ev.preventDefault();
      return false;
    }
    return undefined;
  }, true);

  // Optionally observe unhandled rejections; do not suppress by default
  window.addEventListener('unhandledrejection', function (_ev) {
    // Intentionally left as a no-op to avoid masking real errors
  });
})();