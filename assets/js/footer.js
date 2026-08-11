(function () {
  "use strict";

  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach(function (element) {
    element.textContent = year;
  });
})();
