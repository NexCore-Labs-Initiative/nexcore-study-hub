(function () {
  "use strict";

  var storageKey = "nexcore-study-hub.locale";
  var locale = document.body.dataset.locale || "en";

  function readPreference() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function savePreference(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      // Language switching still works when storage is unavailable.
    }
  }

  function withLocationState(href) {
    var target = new URL(href, window.location.href);
    target.search = window.location.search;
    target.hash = window.location.hash;
    return target.href;
  }

  if (
    locale === "en" &&
    document.body.dataset.localeRoot === "true" &&
    readPreference() === "ar-OM"
  ) {
    window.location.replace(withLocationState("ar/"));
    return;
  }

  document
    .querySelectorAll(".language-switch[data-locale]")
    .forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        savePreference(link.dataset.locale);
        window.location.assign(withLocationState(link.href));
      });
    });
})();
