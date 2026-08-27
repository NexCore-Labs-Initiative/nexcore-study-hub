(function () {
  "use strict";
  var config = window.STUDY_HUB_CONFIG || {},
    isArabic = document.documentElement.lang.toLowerCase().startsWith("ar"),
    copy = isArabic
      ? {
          ready: "سيفتح نموذج المساهمة عند المتابعة.",
          accept: "راجع شروط المساهمة ووافق عليها قبل المتابعة.",
          formUnavailable: "يجري إعداد نموذج المساهمة حاليًا.",
          formVisible: "نموذج المساهمة ظاهر الآن في هذه الصفحة.",
          reportSubject: "بلاغ عن مورد في NexCore Study Hub",
          reportReady:
            "سيفتح هذا الخيار رسالة بريد إلكتروني إلى جهة مراجعة الموارد.",
          reportUnavailable:
            "يجري إعداد وسيلة التواصل الخاصة بالبلاغات حاليًا.",
        }
      : {
          ready: "The contribution form will open when you continue.",
          accept: "Review and accept the contribution terms before continuing.",
          formUnavailable: "The contribution form is being configured.",
          formVisible: "The contribution form is now available on this page.",
          reportSubject: "Study Hub resource report",
          reportReady: "This opens an email to the resource-review contact.",
          reportUnavailable: "The report contact is being configured.",
        },
    formButton = document.querySelector("#openSubmissionForm"),
    formState = document.querySelector("#submissionState"),
    termsCheckbox = document.querySelector("#acceptContributionTerms"),
    formPanel = document.querySelector("#submissionFormPanel"),
    formFrame = document.querySelector("#submissionFormFrame"),
    formDirectLink = document.querySelector("#submissionFormDirectLink"),
    formButtonDefaultLabel = formButton ? formButton.textContent : "",
    reportAction = document.querySelector("#reportAction"),
    reportState = document.querySelector("#reportState");
  function validUrl(value) {
    try {
      return Boolean(value) && new URL(value).protocol === "https:";
    } catch (e) {
      return false;
    }
  }
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
  }
  function revealForm() {
    if (!termsCheckbox.checked || !formPanel || !formFrame) return;
    if (validUrl(config.googleFormEmbedUrl) && !formFrame.src) {
      formFrame.src = config.googleFormEmbedUrl;
    }
    formPanel.hidden = false;
    formState.textContent = copy.formVisible;
    formButton.textContent = isArabic ? "عرض النموذج أدناه" : "View form below";
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    formFrame.focus({ preventScroll: true });
  }
  if (validUrl(config.googleFormUrl) && validUrl(config.googleFormEmbedUrl)) {
    if (formDirectLink) formDirectLink.href = config.googleFormUrl;
    function updateFormButton() {
      formButton.disabled = !termsCheckbox.checked;
      formButton.classList.toggle("disabled", !termsCheckbox.checked);
      formState.textContent = termsCheckbox.checked ? copy.ready : copy.accept;
      if (!termsCheckbox.checked && formPanel) {
        formPanel.hidden = true;
        formButton.textContent = formButtonDefaultLabel;
        if (formFrame) formFrame.removeAttribute("src");
      }
    }
    termsCheckbox.addEventListener("change", updateFormButton);
    formButton.addEventListener("click", revealForm);
    updateFormButton();
  } else {
    formButton.disabled = true;
    formButton.classList.add("disabled");
    termsCheckbox.disabled = true;
    formState.textContent = copy.formUnavailable;
  }
  if (validEmail(config.reportEmail)) {
    reportAction.href =
      "mailto:" +
      encodeURIComponent(config.reportEmail) +
      "?subject=" +
      encodeURIComponent(copy.reportSubject);
    reportState.textContent = copy.reportReady;
  } else {
    reportAction.removeAttribute("href");
    reportAction.setAttribute("aria-disabled", "true");
    reportAction.classList.add("disabled");
    reportState.textContent = copy.reportUnavailable;
  }
})();
