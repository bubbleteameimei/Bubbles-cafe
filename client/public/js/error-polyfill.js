/**
 * Lightweight error polyfill to report script errors early.
 * Loaded before main bundle to capture cross-origin errors where possible.
 */
(function () {
  function sendError(id, message) {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: id, message: String(message || 'Unknown') })
      }).catch(function () {});
    } catch (e) {}
  }

  // Report uncaught errors
  window.addEventListener('error', function (event) {
    try {
      var msg = event && event.message ? event.message : 'Script error';
      sendError('window-error', msg);
    } catch (_) {}
  });

  // Report unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    try {
      var reason = event && event.reason ? event.reason : 'Unknown';
      var msg = typeof reason === 'string' ? reason : (reason && reason.message) ? reason.message : String(reason);
      sendError('unhandledrejection', msg);
    } catch (_) {}
  });
})();