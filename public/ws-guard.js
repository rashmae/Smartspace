// Suppress Vite HMR WebSocket connection errors per AI Studio environment constraints
(function () {
  function isWsError(msg) {
    return (
      typeof msg === 'string' &&
      (msg.indexOf('WebSocket') !== -1 ||
        msg.indexOf('vite:ws') !== -1 ||
        msg.indexOf('closed without opened') !== -1 ||
        msg.indexOf('@vite/client') !== -1)
    );
  }

  window.addEventListener(
    'unhandledrejection',
    function (e) {
      var reason = (e && e.reason && (e.reason.message || String(e.reason))) || '';
      if (isWsError(reason)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    function (e) {
      var msg = (e && e.message) || '';
      var src = (e && e.filename) || '';
      if (isWsError(msg) || isWsError(src)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );
})();
