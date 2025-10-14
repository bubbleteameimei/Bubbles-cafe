// Minimal error polyfill to reduce noisy cross-origin "Script error" reports.
// This does not suppress real errors from our own scripts; it only prevents
// default handling when the browser reports generic script errors with no details.
(function () {
  try {
    window.addEventListener(
      "error",
      function (event) {
        // Some browsers emit "Script error." for cross-origin failures without details.
        if (event && event.message === "Script error.") {
          event.preventDefault();
          // Optionally, report a sanitized event to the backend
          try {
            fetch("/api/errors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: "script-error-generic", message: "Cross-origin script error" }),
            }).catch(function () {});
          } catch {}
        }
      },
      true
    );
  } catch {}
})();