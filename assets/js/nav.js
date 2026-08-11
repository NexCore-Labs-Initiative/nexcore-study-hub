(function () {
  "use strict";

  var isArabic = document.documentElement.lang.toLowerCase().startsWith("ar");
  var labels = isArabic
    ? { open: "فتح القائمة", close: "إغلاق القائمة" }
    : { open: "Open menu", close: "Close menu" };

  document.querySelectorAll(".nav-menu-btn").forEach(function (button, index) {
    var nav = button.closest("nav"),
      menu = nav && nav.querySelector(".nav-links"),
      menuId = "primary-menu-" + index;

    if (!menu) return;

    menu.id = menu.id || menuId;
    button.setAttribute("aria-controls", menu.id);

    function setOpen(open) {
      menu.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? labels.close : labels.open);
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
        button.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) setOpen(false);
    });
  });
})();
