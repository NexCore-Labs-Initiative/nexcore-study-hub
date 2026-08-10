import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const catalogue = JSON.parse(
  await readFile(
    new URL("../assets/data/catalogue.json", import.meta.url),
    "utf8",
  ),
);
const indexHtml = await readFile(
  new URL("../index.html", import.meta.url),
  "utf8",
);
const expectedColleges = [
  "College of Agricultural and Marine Sciences",
  "College of Arts and Social Sciences",
  "College of Economics and Political Science",
  "College of Education",
  "College of Engineering",
  "College of Law",
  "College of Medicine and Health Sciences",
  "College of Nursing",
  "College of Science",
];
const expectedCollegeCodes = [
  "CAMS",
  "CASS",
  "CEPS",
  "CEDU",
  "CENG",
  "CLAW",
  "CMHS",
  "CON",
  "COS",
];
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
  const expectedSemesters = [
    "Spring26",
    "Fall25",
    "Spring25",
    "Fall24",
    "Spring24",
    "Fall23",
    "Spring23",
    "Fall22",
    "Spring22",
    "Fall21",
    "Spring21",
    "Fall20",
    "Spring20",
  ];
  assert.deepEqual(catalogue.semesters, expectedSemesters);
  assert.ok(
    catalogue.semesters.every((semester) =>
      /^(Spring|Fall)\d{2}$/.test(semester),
    ),
  );
  const semesterSelect = indexHtml.match(
    /<select[^>]*id="semFilter"[^>]*>[\s\S]*?<\/select>/,
  )?.[0];
  assert.ok(semesterSelect, "visible semester filter is missing");
  assert.deepEqual(
    [
      ...semesterSelect.matchAll(/<option value="((?:Spring|Fall)\d{2})">/g),
    ].map((match) => match[1]),
    expectedSemesters,
  );
  for (const match of indexHtml.matchAll(/semester:\s*["']([^"']+)["']/g)) {
    assert.ok(
      expectedSemesters.includes(match[1]),
      `sample resource uses unknown semester ${match[1]}`,
    );
  }
  assert.doesNotMatch(indexHtml, /\bSem(?:ester)?\s+[12]\b/);
});
test("resource formats use the supported collection", () => {
  const expectedFormats = [
    "pdf",
    "word",
    "powerpoint",
    "excel",
    "img",
    "other",
  ];
  assert.deepEqual(catalogue.formats, expectedFormats);
  const formatSelect = indexHtml.match(
    /<select[^>]*id="formatFilter"[^>]*>[\s\S]*?<\/select>/,
  )?.[0];
  assert.ok(formatSelect, "visible resource format filter is missing");
  assert.deepEqual(
    [...formatSelect.matchAll(/<option value="([a-z]+)">/g)].map(
      (match) => match[1],
    ),
    expectedFormats,
  );
  for (const match of indexHtml.matchAll(/format:\s*["']([^"']+)["']/g)) {
    assert.ok(
      expectedFormats.includes(match[1]),
      `sample resource uses unknown format ${match[1]}`,
    );
  }
  assert.match(
    indexHtml,
    /const format = document\.getElementById\(["']formatFilter["']\)\.value;/,
  );
  assert.match(
    indexHtml,
    /if \(format && r\.format !== format\) return false;/,
  );
});
test("catalogue data and visible college selector match the supported colleges", () => {
  assert.deepEqual(
    catalogue.colleges.map((college) => college.name),
    expectedColleges,
  );
  assert.deepEqual(
    [
      ...indexHtml.matchAll(/<div class="college-btn-name">([^<]+)<\/div>/g),
    ].map((match) => match[1].trim()),
    expectedColleges,
  );
  assert.deepEqual(
    [...indexHtml.matchAll(/data-college="([A-Z]+)"/g)].map(
      (match) => match[1],
    ),
    expectedCollegeCodes,
  );
  const visibleCodes = new Set(expectedCollegeCodes);
  for (const match of indexHtml.matchAll(/college:\s*["']([A-Z]+)["']/g)) {
    assert.ok(
      visibleCodes.has(match[1]),
      `sample resource uses unknown college ${match[1]}`,
    );
  }
});
test("resource types use the supported academic collection", () => {
  const expectedResourceTypes = [
    "Books",
    "Slides",
    "Notes",
    "Practice papers",
    "Exams",
    "Quizzes",
    "Worked examples",
    "Study guide",
  ];
  assert.deepEqual(catalogue.resourceTypes, expectedResourceTypes);
  const typeSelect = indexHtml.match(
    /<select[^>]*id="typeFilter"[^>]*>[\s\S]*?<\/select>/,
  )?.[0];
  assert.ok(typeSelect, "visible resource type filter is missing");
  assert.deepEqual(
    [...typeSelect.matchAll(/<option value="([^"]+)">/g)].map(
      (match) => match[1],
    ),
    expectedResourceTypes,
  );
  for (const match of indexHtml.matchAll(/type:\s*["']([^"']+)["']/g)) {
    assert.ok(
      expectedResourceTypes.includes(match[1]),
      `sample resource uses unknown type ${match[1]}`,
    );
  }
  assert.match(
    indexHtml,
    /const type = document\.getElementById\(["']typeFilter["']\)\.value;/,
  );
  assert.match(indexHtml, /if \(type && r\.type !== type\) return false;/);
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
    assert.ok(
      catalogue.formats.includes(r.format),
      `${r.id} has an unsupported format`,
    );
    assert.ok(
      catalogue.resourceTypes.includes(r.type),
      `${r.id} has an unsupported resource type`,
    );
    assert.ok(
      ["demo", "verified"].includes(r.status),
      `${r.id} status is unsupported`,
    );
    if (r.isDemo) {
      assert.equal(r.status, "demo");
      assert.equal(r.driveUrl, "");
    } else {
      assert.equal(r.status, "verified");
      assert.match(r.driveUrl, /^https:\/\/drive\.google\.com\//);
    }
  }
});
