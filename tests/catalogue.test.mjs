import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const catalogue = JSON.parse(
  await readFile(
    new URL("../assets/data/catalogue.json", import.meta.url),
    "utf8",
  ),
);
const required = [
  "id",
  "courseId",
  "title",
  "description",
  "semester",
  "topics",
  "type",
  "format",
  "language",
  "status",
  "isDemo",
  "driveUrl",
];
test("catalogue has a supported shape", () => {
  assert.equal(catalogue.version, 3);
  assert.ok(catalogue.semesters.length);
  assert.ok(catalogue.formats.length);
  assert.ok(catalogue.resourceTypes.length);
  assert.ok(catalogue.colleges.length);
  assert.equal(catalogue.courses.length, catalogue.colleges.length);
  assert.equal(catalogue.resources.length, catalogue.colleges.length);
});
test("semesters use the SQU season-year naming convention", () => {
  assert.deepEqual(catalogue.semesters.slice(0, 2), ["Spring26", "Fall25"]);
  assert.ok(catalogue.semesters.every((semester) => /^(Spring|Fall)\d{2}$/.test(semester)));
});
test("resource formats use the supported collection", () => {
  assert.deepEqual(catalogue.formats, ["pdf", "word", "powerpoint", "excel", "img", "other"]);
});
test("resource types use the supported academic collection", () => {
  assert.deepEqual(catalogue.resourceTypes, ["Books", "Notes", "Practice papers", "Exams", "Quizzes", "Worked examples", "Study guide", "Slides"]);
});
test("college, course, and resource IDs are unique", () => {
  assert.equal(
    new Set(catalogue.colleges.map((c) => c.id)).size,
    catalogue.colleges.length,
  );
  assert.equal(
    new Set(catalogue.courses.map((c) => c.id)).size,
    catalogue.courses.length,
  );
  assert.equal(
    new Set(catalogue.resources.map((r) => r.id)).size,
    catalogue.resources.length,
  );
});
test("courses and resources belong to valid catalogue parents", () => {
  const collegeIds = new Set(catalogue.colleges.map((c) => c.id));
  const courseIds = new Set(catalogue.courses.map((c) => c.id));
  for (const course of catalogue.courses)
    assert.ok(
      collegeIds.has(course.collegeId),
      `${course.id} references an unknown college`,
    );
  for (const r of catalogue.resources) {
    for (const field of required)
      assert.ok(Object.hasOwn(r, field), `${r.id} is missing ${field}`);
    assert.ok(
      courseIds.has(r.courseId),
      `${r.id} references an unknown course`,
    );
    assert.ok(
      Array.isArray(r.topics) && r.topics.length,
      `${r.id} needs a topic`,
    );
    assert.ok(catalogue.formats.includes(r.format), `${r.id} has an unsupported format`);
    assert.ok(catalogue.resourceTypes.includes(r.type), `${r.id} has an unsupported resource type`);
    assert.ok(["demo", "verified"].includes(r.status), `${r.id} status is unsupported`);
    if (r.isDemo) {
      assert.equal(r.status, "demo");
      assert.equal(r.driveUrl, "");
    } else {
      assert.equal(r.status, "verified");
      assert.match(r.driveUrl, /^https:\/\/drive\.google\.com\//);
    }
  }
});
