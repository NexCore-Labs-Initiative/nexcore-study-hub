(function () {
  "use strict";

  var isArabic = document.documentElement.lang.toLowerCase().startsWith("ar");
  var localeKey = isArabic ? "ar" : "en";
  var copy = {
    en: {
      allSemesters: "All semesters",
      allTypes: "All resource types",
      allFormats: "All formats",
      collectionPhase: "Collection phase",
      noApproved: "No approved resources yet",
      noPublished: "No approved resources published yet",
      catalogueUnavailable: "The catalogue is temporarily unavailable.",
      tryAgain: "Please refresh the page and try again.",
      contribute: "Contribute a resource",
      collegeOpen:
        "{college} is open for contributions. Submit a resource and NexCore will review it before publishing.",
      catalogueGrowing:
        "The catalogue will grow as student submissions are reviewed. You can still browse colleges and contribute now.",
      resource: "resource",
      resources: "resources",
      openForContributions: "Open for contributions",
      verified: "Verified",
      underReview: "Under review",
      view: "View",
      searchResults: "Search results",
      noMatches: "No approved resources match these filters.",
      clearFilters: "Clear filters",
      college: "College",
      course: "Course",
      semester: "Semester",
      type: "Type",
      format: "Format",
      language: "Language",
      topics: "Topics",
      description: "Description",
      openResource: "Open resource ↗",
      close: "Close",
      loading: "Loading catalogue…",
    },
    ar: {
      allSemesters: "جميع الفصول الدراسية",
      allTypes: "جميع أنواع الموارد",
      allFormats: "جميع الصيغ",
      collectionPhase: "مرحلة جمع الموارد",
      noApproved: "لا توجد موارد معتمدة بعد",
      noPublished: "لم تُنشر موارد معتمدة بعد",
      catalogueUnavailable: "يتعذر تحميل الفهرس مؤقتًا.",
      tryAgain: "يرجى تحديث الصفحة والمحاولة مرة أخرى.",
      contribute: "ساهم بمورد دراسي",
      collegeOpen:
        "تستقبل {college} المساهمات حاليًا. أرسل موردًا وسيراجعه NexCore قبل نشره.",
      catalogueGrowing:
        "سينمو الفهرس مع مراجعة مساهمات الطلبة. يمكنك استعراض الكليات والمساهمة من الآن.",
      resource: "مورد",
      resources: "موارد",
      openForContributions: "متاحة للمساهمات",
      verified: "معتمد",
      underReview: "قيد المراجعة",
      view: "عرض",
      searchResults: "نتائج البحث",
      noMatches: "لا توجد موارد معتمدة مطابقة لهذه المرشحات.",
      clearFilters: "مسح المرشحات",
      college: "الكلية",
      course: "المقرر",
      semester: "الفصل الدراسي",
      type: "نوع المورد",
      format: "الصيغة",
      language: "لغة المورد",
      topics: "الموضوعات",
      description: "الوصف",
      openResource: "فتح المورد ↗",
      close: "إغلاق",
      loading: "جارٍ تحميل الفهرس…",
    },
  }[localeKey];

  var typeLabels = {
    Books: { en: "Books", ar: "كتب" },
    Slides: { en: "Slides", ar: "عروض تقديمية" },
    Notes: { en: "Notes", ar: "مذكرات" },
    "Practice papers": { en: "Practice papers", ar: "أوراق تدريبية" },
    Exams: { en: "Exams", ar: "اختبارات" },
    Quizzes: { en: "Quizzes", ar: "اختبارات قصيرة" },
    "Worked examples": { en: "Worked examples", ar: "أمثلة محلولة" },
    "Study guide": { en: "Study guide", ar: "دليل دراسي" },
  };
  var formatLabels = {
    pdf: "PDF",
    word: "Word",
    powerpoint: "PowerPoint",
    excel: "Excel",
    img: isArabic ? "صورة" : "Image",
    other: isArabic ? "أخرى" : "Other",
  };
  var collegeVisuals = {
    CAMS: ["🌊", "#ecfdf5"],
    CASS: ["🎨", "#fff7ed"],
    CEPS: ["📊", "#fefce8"],
    CEDU: ["📚", "#f0f9ff"],
    CENG: ["⚙️", "#eef2ff"],
    CLAW: ["⚖️", "#f5f3ff"],
    CMHS: ["🏥", "#fdf2f8"],
    CON: ["🩺", "#f0fdfa"],
    COS: ["🔬", "#f0fdf4"],
  };

  var state = {
    data: null,
    courses: new Map(),
    colleges: new Map(),
    activeCollege: "",
    q: "",
    semester: "",
    type: "",
    format: "",
  };
  var lastTrigger = null;
  var elements = {
    colleges: document.querySelector("#collegeGrid"),
    reset: document.querySelector("#resetBtn"),
    search: document.querySelector("#searchInput"),
    semester: document.querySelector("#semFilter"),
    type: document.querySelector("#typeFilter"),
    format: document.querySelector("#formatFilter"),
    clear: document.querySelector("#clearFilters"),
    grid: document.querySelector("#resourceGrid"),
    modal: document.querySelector("#modalOverlay"),
    modalBox: document.querySelector("#modalBox"),
    modalBadge: document.querySelector("#modalBadge"),
    modalTitle: document.querySelector("#modalTitle"),
    modalMeta: document.querySelector("#modalMeta"),
    modalDetails: document.querySelector("#modalDetails"),
    modalOpen: document.querySelector("#modalOpenLink"),
    modalClose: document.querySelector("#modalClose"),
    modalCloseButton: document.querySelector("#modalCloseButton"),
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(
      /[&<>'"]/g,
      function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#039;",
          '"': "&quot;",
        }[character];
      },
    );
  }

  function validDriveUrl(value) {
    try {
      var url = new URL(value);
      return (
        url.protocol === "https:" && url.hostname.endsWith("drive.google.com")
      );
    } catch (error) {
      return false;
    }
  }

  function localized(item, field) {
    if (!item) return "";
    var directArabic = item[field + "Ar"];
    if (isArabic && directArabic) return directArabic;
    var translations = item.translations && item.translations[localeKey];
    return (translations && translations[field]) || item[field] || "";
  }

  function localizedTopics(resource) {
    var topics = localized(resource, "topics");
    return Array.isArray(topics) ? topics : resource.topics || [];
  }

  function collegeName(college) {
    return isArabic ? college.nameAr || college.name : college.name;
  }

  function typeLabel(value) {
    return typeLabels[value] ? typeLabels[value][localeKey] : value;
  }

  function semesterLabel(value) {
    if (!isArabic) return value;
    var match = /^(Spring|Summer|Fall)(\d{2})$/.exec(value);
    if (!match) return value;
    var season = { Spring: "ربيع", Summer: "صيف", Fall: "خريف" }[match[1]];
    return season + " 20" + match[2];
  }

  function languageLabel(value) {
    var normalized = String(value || "").toLowerCase();
    if (normalized === "arabic") return isArabic ? "العربية" : "Arabic";
    if (normalized === "english") return isArabic ? "الإنجليزية" : "English";
    return value || "—";
  }

  function replaceToken(template, value) {
    return template.replace("{college}", value);
  }

  function setOptions(select, values, firstLabel, formatter) {
    select.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = firstLabel;
    select.appendChild(first);
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = formatter ? formatter(value) : value;
      select.appendChild(option);
    });
  }

  function prepare(data) {
    if (
      !data ||
      !Array.isArray(data.colleges) ||
      !Array.isArray(data.courses) ||
      !Array.isArray(data.resources) ||
      !Array.isArray(data.semesters) ||
      !Array.isArray(data.resourceTypes) ||
      !Array.isArray(data.formats)
    ) {
      throw new Error("Invalid catalogue");
    }
    state.data = data;
    state.colleges = new Map(
      data.colleges.map(function (college) {
        return [college.id, college];
      }),
    );
    state.courses = new Map(
      data.courses.map(function (course) {
        return [course.id, course];
      }),
    );
    setOptions(
      elements.semester,
      data.semesters,
      copy.allSemesters,
      semesterLabel,
    );
    setOptions(elements.type, data.resourceTypes, copy.allTypes, typeLabel);
    setOptions(
      elements.format,
      data.formats,
      copy.allFormats,
      function (format) {
        return formatLabels[format] || format.toUpperCase();
      },
    );
  }

  function restoreState() {
    var params = new URLSearchParams(window.location.search);
    state.activeCollege = params.get("college") || "";
    state.q = params.get("q") || "";
    state.semester = params.get("semester") || "";
    state.type = params.get("type") || "";
    state.format = params.get("format") || "";
    if (!state.colleges.has(state.activeCollege)) state.activeCollege = "";
    if (!state.data.semesters.includes(state.semester)) state.semester = "";
    if (!state.data.resourceTypes.includes(state.type)) state.type = "";
    if (!state.data.formats.includes(state.format)) state.format = "";
    elements.search.value = state.q;
    elements.semester.value = state.semester;
    elements.type.value = state.type;
    elements.format.value = state.format;
  }

  function updateUrl() {
    var params = new URLSearchParams();
    if (state.activeCollege) params.set("college", state.activeCollege);
    if (state.q) params.set("q", state.q);
    if (state.semester) params.set("semester", state.semester);
    if (state.type) params.set("type", state.type);
    if (state.format) params.set("format", state.format);
    history.replaceState(
      null,
      "",
      window.location.pathname +
        (params.toString() ? "?" + params.toString() : "") +
        window.location.hash,
    );
  }

  function resourceCollege(resource) {
    var course = state.courses.get(resource.courseId);
    return course ? state.colleges.get(course.collegeId) : null;
  }

  function searchableText(resource) {
    var course = state.courses.get(resource.courseId) || {};
    var college = resourceCollege(resource) || {};
    var parts = [
      resource.title,
      resource.titleAr,
      resource.description,
      resource.descriptionAr,
      course.code,
      course.title,
      course.titleAr,
      college.name,
      college.nameAr,
      resource.type,
      resource.format,
      resource.semester,
      resource.language,
    ]
      .concat(resource.topics || [])
      .concat(resource.topicsAr || []);
    if (resource.translations) {
      Object.keys(resource.translations).forEach(function (key) {
        var translation = resource.translations[key] || {};
        parts.push(translation.title, translation.description);
        parts = parts.concat(translation.topics || []);
      });
    }
    return parts.filter(Boolean).join(" ").toLocaleLowerCase();
  }

  function filteredResources() {
    var query = state.q.toLocaleLowerCase();
    return state.data.resources.filter(function (resource) {
      var college = resourceCollege(resource);
      return (
        (!state.activeCollege ||
          (college && college.id === state.activeCollege)) &&
        (!query || searchableText(resource).includes(query)) &&
        (!state.semester || resource.semester === state.semester) &&
        (!state.type || resource.type === state.type) &&
        (!state.format || resource.format === state.format)
      );
    });
  }

  function renderColleges() {
    elements.colleges.innerHTML = state.data.colleges
      .map(function (college) {
        var count = state.data.resources.filter(function (resource) {
          var resourceParent = resourceCollege(resource);
          return resourceParent && resourceParent.id === college.id;
        }).length;
        var visual = collegeVisuals[college.code] || ["📘", "#f4f4f8"];
        var status = count
          ? count + " " + (count === 1 ? copy.resource : copy.resources)
          : copy.openForContributions;
        return (
          '<button class="college-btn' +
          (state.activeCollege === college.id ? " active" : "") +
          '" type="button" data-college="' +
          esc(college.id) +
          '" aria-pressed="' +
          String(state.activeCollege === college.id) +
          '"><div class="college-icon" style="background:' +
          esc(visual[1]) +
          '">' +
          visual[0] +
          '</div><div class="college-btn-text"><div class="college-btn-name">' +
          esc(collegeName(college)) +
          '</div><div class="college-btn-abbr"><bdi>' +
          esc(college.code) +
          "</bdi> · " +
          esc(status) +
          "</div></div></button>"
        );
      })
      .join("");
    elements.reset.style.display = state.activeCollege ? "" : "none";
  }

  function emptyMarkup(hasFilters) {
    var college = state.colleges.get(state.activeCollege);
    var title = college
      ? copy.noApproved
      : hasFilters
        ? copy.noMatches
        : copy.noPublished;
    var description = college
      ? replaceToken(copy.collegeOpen, collegeName(college))
      : copy.catalogueGrowing;
    return (
      '<div class="empty-state"><div class="empty-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      "</div><h3>" +
      esc(title) +
      "</h3><p>" +
      esc(description) +
      '</p><br /><a href="' +
      esc(document.body.dataset.submitUrl || "submit.html") +
      '" class="btn btn-secondary" style="margin:0 auto">' +
      esc(copy.contribute) +
      "</a></div>"
    );
  }

  function renderResources(resources) {
    var hasFilters = Boolean(
      state.q || state.semester || state.type || state.format,
    );
    if (!resources.length) {
      elements.grid.innerHTML = emptyMarkup(hasFilters);
      return;
    }
    elements.grid.innerHTML = resources
      .map(function (resource) {
        var course = state.courses.get(resource.courseId) || {};
        var topics = localizedTopics(resource);
        return (
          '<article class="resource-card" data-resource="' +
          esc(resource.id) +
          '" role="button" tabindex="0"><div class="resource-card-top"><span class="status-badge verified">' +
          '<svg viewBox="0 0 10 10"><path d="M2 5l2 2L8 3"/></svg>' +
          esc(copy.verified) +
          '</span><span class="format-tag">' +
          esc(formatLabels[resource.format] || resource.format.toUpperCase()) +
          "</span></div><h3>" +
          esc(localized(resource, "title")) +
          '</h3><div class="resource-card-meta"><span class="meta-chip"><bdi>' +
          esc(course.code || "") +
          '</bdi></span><span class="meta-chip">' +
          esc(semesterLabel(resource.semester)) +
          '</span><span class="meta-chip">' +
          esc(topics[0] || typeLabel(resource.type)) +
          '</span></div><div class="resource-card-footer"><span class="contributor">' +
          esc(languageLabel(resource.language)) +
          '</span><span class="open-link">' +
          esc(copy.view) +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></div></article>'
        );
      })
      .join("");
  }

  function render() {
    updateUrl();
    renderColleges();
    renderResources(filteredResources());
  }

  function detailRow(label, value) {
    return (
      '<div class="modal-detail-row"><span class="modal-detail-label">' +
      esc(label) +
      '</span><span class="modal-detail-value">' +
      esc(value || "—") +
      "</span></div>"
    );
  }

  function openModal(id, trigger) {
    var resource = state.data.resources.find(function (item) {
      return String(item.id) === String(id);
    });
    if (!resource) return;
    var course = state.courses.get(resource.courseId) || {};
    var college = resourceCollege(resource) || {};
    var topics = localizedTopics(resource);
    lastTrigger = trigger || null;
    elements.modalBadge.innerHTML =
      '<span class="status-badge verified"><svg viewBox="0 0 10 10" width="9" height="9"><path d="M2 5l2 2L8 3"/></svg>' +
      esc(copy.verified) +
      "</span>";
    elements.modalTitle.textContent = localized(resource, "title");
    elements.modalMeta.innerHTML =
      '<span class="meta-chip"><bdi>' +
      esc(course.code || "") +
      '</bdi></span><span class="meta-chip">' +
      esc(semesterLabel(resource.semester)) +
      '</span><span class="meta-chip">' +
      esc(typeLabel(resource.type)) +
      '</span><span class="meta-chip">' +
      esc(formatLabels[resource.format] || resource.format.toUpperCase()) +
      "</span>";
    elements.modalDetails.innerHTML =
      detailRow(copy.college, collegeName(college)) +
      detailRow(
        copy.course,
        (course.code || "") +
          (localized(course, "title")
            ? " · " + localized(course, "title")
            : ""),
      ) +
      detailRow(copy.description, localized(resource, "description")) +
      detailRow(copy.topics, topics.join("، ")) +
      detailRow(copy.language, languageLabel(resource.language));
    elements.modalOpen.textContent = copy.openResource;
    if (validDriveUrl(resource.driveUrl)) {
      elements.modalOpen.href = resource.driveUrl;
      elements.modalOpen.classList.remove("disabled");
      elements.modalOpen.removeAttribute("aria-disabled");
    } else {
      elements.modalOpen.removeAttribute("href");
      elements.modalOpen.classList.add("disabled");
      elements.modalOpen.setAttribute("aria-disabled", "true");
    }
    elements.modalClose.setAttribute("aria-label", copy.close);
    elements.modalCloseButton.textContent = copy.close;
    elements.modal.hidden = false;
    elements.modal.classList.add("open");
    document.body.style.overflow = "hidden";
    elements.modalClose.focus();
  }

  function closeModal() {
    if (elements.modal.hidden) return;
    elements.modal.classList.remove("open");
    elements.modal.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  }

  function clearFilters() {
    state.q = "";
    state.semester = "";
    state.type = "";
    state.format = "";
    elements.search.value = "";
    elements.semester.value = "";
    elements.type.value = "";
    elements.format.value = "";
    render();
  }

  function bind() {
    elements.colleges.addEventListener("click", function (event) {
      var button = event.target.closest("[data-college]");
      if (!button) return;
      state.activeCollege = button.dataset.college;
      render();
    });
    elements.reset.addEventListener("click", function () {
      state.activeCollege = "";
      render();
    });
    elements.search.addEventListener("input", function () {
      state.q = elements.search.value.trim();
      render();
    });
    [
      [elements.semester, "semester"],
      [elements.type, "type"],
      [elements.format, "format"],
    ].forEach(function (entry) {
      entry[0].addEventListener("change", function () {
        state[entry[1]] = entry[0].value;
        render();
      });
    });
    elements.clear.addEventListener("click", clearFilters);
    elements.grid.addEventListener("click", function (event) {
      var card = event.target.closest("[data-resource]");
      if (card) openModal(card.dataset.resource, card);
    });
    elements.grid.addEventListener("keydown", function (event) {
      var card = event.target.closest("[data-resource]");
      if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openModal(card.dataset.resource, card);
      }
    });
    elements.modal.addEventListener("click", function (event) {
      if (event.target === elements.modal) closeModal();
    });
    elements.modalClose.addEventListener("click", closeModal);
    elements.modalCloseButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });
  }

  function showLoadError() {
    elements.colleges.innerHTML = "";
    elements.grid.innerHTML =
      '<div class="empty-state"><h3>' +
      esc(copy.catalogueUnavailable) +
      "</h3><p>" +
      esc(copy.tryAgain) +
      "</p></div>";
  }

  function load() {
    elements.grid.setAttribute("aria-busy", "true");
    fetch(document.body.dataset.catalogueUrl || "assets/data/catalogue.json", {
      cache: "no-store",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Catalogue load failed");
        return response.json();
      })
      .then(function (data) {
        prepare(data);
        restoreState();
        bind();
        render();
      })
      .catch(showLoadError)
      .finally(function () {
        elements.grid.setAttribute("aria-busy", "false");
      });
  }

  load();
})();
