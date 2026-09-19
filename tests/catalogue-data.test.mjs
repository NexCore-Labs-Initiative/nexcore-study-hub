import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { load, normalize, validDriveUrl } = createRequire(import.meta.url)(
  "../assets/js/catalogue-data.js",
);
const resource = {
  id: "r1",
  slug: "guide",
  status: "published",
  course_id: "c1",
  content: {
    title: "Guide",
    description: "Description",
    topics: ["Topic"],
    languages: ["ar", "en"],
    type: "Study plan",
    format: "pdf",
    semester: "Fall27",
    drive_url: "https://drive.google.com/drive/folders/abcde_123",
    credit: "Team",
  },
};

test("private intake bookkeeping and submitter identity are not card fields", () => {
  const privateData = { submitter_name: "PRIVATE STUDENT", submitter_email: "PRIVATE EMAIL", submitter_note: "PRIVATE NOTE", review_notes: "PRIVATE REVIEW", source_spreadsheet_id: "PRIVATE SHEET" };
  const result = normalize([{ ...resource, ...privateData, content: { ...resource.content, ...privateData } }], [{ id: "c1" }]);
  assert.equal(result[0].credit, "Team");
  assert.ok(!JSON.stringify(result).includes("PRIVATE"));
});
test("published records adapt to existing cards; unpublished records are excluded", () => {
  const result = normalize(
    [resource, { ...resource, id: "r2", status: "draft" }],
    [{ id: "c1" }],
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].courseId, "c1");
  assert.equal(result[0].language, "Arabic / English");
  assert.equal(result[0].credit, "Team");
  assert.equal(result[0].driveUrl, resource.content.drive_url);
  assert.throws(() => normalize([resource], []));
  assert.throws(() =>
    normalize(
      [{ ...resource, content: { ...resource.content, topics: "invalid" } }],
      [{ id: "c1" }],
    ),
  );
});
test("Drive links cannot use spoofed hosts or active URL schemes", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://evildrive.google.com/file/d/abcde/view",
    "https://drive.google.com.evil.test/file/d/abcde/view",
    "https://user@drive.google.com/file/d/abcde/view",
  ])
    assert.equal(validDriveUrl(url), false);
  assert.equal(validDriveUrl(resource.content.drive_url), true);
});
test("all pages are fetched even when server row limits are smaller than requested", async () => {
  const calls = [];
  const rows = {
    study_hub_settings: [
      {
        semesters: ["Fall27"],
        formats: ["pdf"],
        resource_types: ["Study plan"],
      },
    ],
    study_hub_colleges: [
      { id: "college", code: "COS", name: "Science", name_ar: "العلوم" },
    ],
    study_hub_courses: [
      { id: "c1", code: "COMP1", title: "Course", college_id: "college" },
    ],
    study_hub_resources: [resource, { ...resource, id: "r2" }],
  };
  const data = await load(
    {
      supabaseUrl: "https://example.test",
      supabasePublishableKey: "public-test-key",
    },
    async (url, options) => {
      calls.push({ url, options });
      const u = new URL(url),
        table = u.pathname.split("/").pop(),
        after = u.searchParams.get("id")?.slice(3);
      const page = rows[table]
        .filter((r) => !after || r.id > after)
        .slice(0, 1);
      return { ok: true, json: async () => page };
    },
  );
  assert.equal(data.resources.length, 2);
  assert.equal(data.courses[0].collegeId, "college");
  assert.ok(calls.every((c) => c.options.cache === "no-store"));
  assert.ok(calls.every((c) => !c.options.headers.Authorization));
  assert.ok(
    calls
      .filter((c) => c.url.includes("study_hub_resources"))
      .every(
        (c) => new URL(c.url).searchParams.get("status") === "eq.published",
      ),
  );
});
test("request failures are errors, not an empty library or stale JSON fallback", async () => {
  await assert.rejects(
    load(
      { supabaseUrl: "https://example.test", supabasePublishableKey: "test" },
      async () => ({ ok: false }),
    ),
    /request failed/,
  );
  await assert.rejects(load({}), /not configured/);
});
