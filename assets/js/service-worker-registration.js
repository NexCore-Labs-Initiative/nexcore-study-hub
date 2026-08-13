(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/service-worker.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch(function () {
        // The site remains fully usable when registration is unavailable.
      });
  });
})();
