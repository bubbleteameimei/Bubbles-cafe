/**
 * Lightweight client-side error reporter to avoid noisy browser logs and record early script errors.
 * Sends minimal payloads to the backend and never throws.
 */
(function () {
  try {
    var report = function (id, message) {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, message: String(message || 'Unknown error') }),
          credentials: 'include'
        }).catch(function () { /* swallow */ });
      } catch (e) { /* swallow */ }
    };

    // Early JS runtime errors
    window.addEventListener('error', function (ev) {
      try {
        var msg = ev && ev.message ? String(ev.message) : (ev && ev.error && ev.error.message ? String(ev.error.message) : 'Script error');
        report('script-error', msg);
      } catch (e) { /* swallow */ }
    });

    // Resource loading errors (e.g., missing assets)
    window.addEventListener('error', function (ev) {
      try {
        var target = ev && ev.target;
        if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')) {
          var src = target.src || (target.href || '');
          report('resource-error', 'Failed to load: ' + String(src));
        }
      } catch (e) { /* swallow */ }
    }, true);
  } catch (e) { /* swallow */ }
})();