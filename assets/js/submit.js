(function () {
  "use strict";
  var config = window.STUDY_HUB_CONFIG || {}, formButton = document.querySelector("#openSubmissionForm"), formState = document.querySelector("#submissionState"), reportAction = document.querySelector("#reportAction"), reportState = document.querySelector("#reportState");
  function validUrl(value) { try { return Boolean(value) && new URL(value).protocol === "https:"; } catch (e) { return false; } }
  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ""); }
  if (validUrl(config.googleFormUrl)) formButton.addEventListener("click", function () { window.open(config.googleFormUrl, "_blank", "noopener,noreferrer"); }); else { formButton.disabled = true; formButton.classList.add("disabled"); formState.textContent = "The contribution form is being configured. Add its public Google Form URL in assets/js/config.js before launch."; }
  if (validEmail(config.reportEmail)) { reportAction.href = "mailto:" + encodeURIComponent(config.reportEmail) + "?subject=" + encodeURIComponent("Study Hub resource report"); reportState.textContent = "This opens an email to the resource-review contact."; } else { reportAction.removeAttribute("href"); reportAction.setAttribute("aria-disabled", "true"); reportAction.classList.add("disabled"); reportState.textContent = "The report contact is being configured. Add the review email in assets/js/config.js before launch."; }
}());
