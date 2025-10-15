// Minimal error polyfill to reduce noisy cross-origin "Script error" reports.
// This does not suppress real errors from our own scripts; it only prevents
// default handling when the browser reports generic script errors with no details.
(function () {
  try {
    // Compute API base for split frontend/backend domains
    var API_BASE = (function () {
      try {
        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        if (/^localhost$|^127\\./.test(hostname)) return '';
        if (hostname.startsWith('api.')) return protocol + '//' + hostname;
        var host = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
        return protocol + '//' + 'api.' + host;
      } catch (e) {
        return '';
      }
    })();

    window.addEventListener(
      "error",
      function (event) {
        // Some browsers emit "Script error." for cross-origin failures without details.
        if (event && event.message === "Script error.") {
          event.preventDefault();
          // Optionally, report a sanitized event to the backend
          try {
            var url = (API_BASE ? (API_BASE + "/api/errors") : "/api/errors");
            fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: "script-error-generic", message: "Cross-origin script error" }),
              credentials: "include"
            }).catch(function () {});
          } catch {}
        }
      },
      true
    );
  } catch {}
})();