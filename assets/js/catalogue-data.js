(function (root) {
  "use strict";
  function validDriveUrl(value) {
    try {
      var u = new URL(value);
      return (
        u.protocol === "https:" &&
        u.hostname === "drive.google.com" &&
        !u.username &&
        !u.password &&
        !u.port &&
        /^\/(?:file\/d\/[\w-]{5,200}\/view|drive\/folders\/[\w-]{5,200})\/?$/.test(
          u.pathname,
        )
      );
    } catch {
      return false;
    }
  }
  function normalize(rows, courses) {
    var ids = new Set(courses.map((c) => c.id));
    return rows
      .filter((r) => r.status === "published")
      .map(function (r) {
        var c = r.content;
        if (
          !c ||
          !ids.has(r.course_id) ||
          !c.title ||
          typeof c.title !== "string" ||
          !c.description ||
          typeof c.description !== "string" ||
          !Array.isArray(c.topics) ||
          !c.topics.length ||
          !c.topics.every((t) => typeof t === "string") ||
          !Array.isArray(c.languages) ||
          !c.languages.length ||
          !c.languages.every((l) => ["ar", "en"].includes(l)) ||
          !["pdf", "word", "powerpoint", "excel", "img", "other"].includes(
            c.format,
          ) ||
          typeof c.type !== "string" ||
          typeof c.semester !== "string" ||
          !validDriveUrl(c.drive_url)
        ) {
          throw new Error("Invalid published resource");
        }
        return {
          id: r.id,
          slug: r.slug,
          courseId: r.course_id,
          title: c.title,
          description: c.description,
          semester: c.semester,
          topics: c.topics,
          type: c.type,
          format: c.format,
          languages: c.languages,
          language: c.languages
            .map((l) => (l === "ar" ? "Arabic" : "English"))
            .join(" / "),
          translations: c.translations || {},
          credit: typeof c.credit === "string" ? c.credit : "",
          status: "published",
          driveUrl: c.drive_url,
        };
      });
  }
  async function load(config, fetcher) {
    fetcher = fetcher || root.fetch.bind(root);
    if (!config?.supabaseUrl || !config?.supabasePublishableKey)
      throw new Error("Catalogue is not configured");
    var base = config.supabaseUrl.replace(/\/$/, "") + "/rest/v1/";
    async function page(table, select, after) {
      var query = new URLSearchParams({
        select: select,
        order: "id.asc",
        limit: "200",
      });
      if (table === "study_hub_resources") query.set("status", "eq.published");
      if (after) query.set("id", "gt." + after);
      var response = await fetcher(base + table + "?" + query.toString(), {
        cache: "no-store",
        headers: { apikey: config.supabasePublishableKey },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Catalogue request failed");
      var rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Invalid catalogue response");
      return rows;
    }
    async function all(table, select) {
      var result = [],
        after = "";
      // Keyset paging continues until empty even when the project's row cap is below 200.
      for (;;) {
        var rows = await page(table, select, after);
        if (!rows.length) return result;
        var next = rows[rows.length - 1].id;
        if (!next || next === after)
          throw new Error("Invalid catalogue cursor");
        result.push(...rows);
        after = next;
      }
    }
    var [settings, colleges, courses, resources] = await Promise.all([
      page("study_hub_settings", "semesters,resource_types,formats"),
      all("study_hub_colleges", "id,code,name,name_ar"),
      all("study_hub_courses", "id,code,title,title_ar,college_id"),
      all("study_hub_resources", "id,slug,status,course_id,content"),
    ]);
    var cfg = settings[0];
    if (!cfg) throw new Error("Missing catalogue settings");
    return {
      version: 4,
      semesters: cfg.semesters,
      resourceTypes: cfg.resource_types,
      formats: cfg.formats,
      colleges: colleges.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        nameAr: c.name_ar,
      })),
      courses: courses.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        titleAr: c.title_ar,
        collegeId: c.college_id,
      })),
      resources: normalize(resources, courses),
    };
  }
  const api = { load, normalize, validDriveUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.StudyHubCatalogueData = api;
})(typeof window === "undefined" ? globalThis : window);
