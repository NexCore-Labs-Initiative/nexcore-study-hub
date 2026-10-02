(function () {
  "use strict";

  var storageKey = "nexcore-study-hub.welcome-video-seen";
  var card = document.getElementById("welcomeVideo");
  if (!card) return;

  var player = card.querySelector("[data-welcome-player]");
  var closeButton = card.querySelector("[data-welcome-close]");
  var lastTrigger = null;
  var isArabic = document.documentElement.lang.indexOf("ar") === 0;

  function hasSeen() {
    try {
      return window.localStorage.getItem(storageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function remember() {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch (error) {
      // The welcome prompt remains dismissible if storage is unavailable.
    }
  }

  function resetPlayer() {
    player.replaceChildren();
    var play = document.createElement("button");
    play.type = "button";
    play.className = "welcome-play";
    play.setAttribute(
      "aria-label",
      isArabic ? "تشغيل مقدمة Study Hub" : "Play the Study Hub introduction",
    );
    var icon = document.createElement("span");
    icon.className = "welcome-play-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▶";
    var label = document.createElement("span");
    label.textContent = isArabic ? "تشغيل المقدمة" : "Play introduction";
    play.append(icon, label);
    play.addEventListener("click", startPlayback);
    player.append(play);
  }

  function startPlayback() {
    remember();
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/VLnWGcx1aho?autoplay=1&mute=1&playsinline=1&rel=0";
    frame.title = isArabic
      ? "مقدمة NexCore Study Hub على YouTube"
      : "NexCore Study Hub introduction on YouTube";
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    player.replaceChildren(frame);
  }

  function open(trigger) {
    lastTrigger = trigger || null;
    card.hidden = false;
    resetPlayer();
    closeButton.focus();
  }

  function close() {
    if (card.hidden) return;
    remember();
    card.hidden = true;
    resetPlayer();
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
    lastTrigger = null;
  }

  closeButton.addEventListener("click", close);
  document.querySelectorAll("[data-welcome-replay]").forEach(function (button) {
    button.addEventListener("click", function () {
      open(button);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !card.hidden) close();
  });

  resetPlayer();
  if (!hasSeen()) card.hidden = false;
})();
