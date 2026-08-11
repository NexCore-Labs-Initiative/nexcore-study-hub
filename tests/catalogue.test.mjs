import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [catalogue, home, arabicHome, catalogueScript] = await Promise.all([
  read("assets/data/catalogue.json").then(JSON.parse),
  read("index.html"),
  read("ar/index.html"),
  read("assets/js/catalogue.js"),
]);

const expectedColleges = [
  [
    "CAMS",
    "College of Agricultural and Marine Sciences",
    "كلية العلوم الزراعية والبحرية",
  ],
  [
    "CASS",
    "College of Arts and Social Sciences",
    "كلية الآداب والعلوم الاجتماعية",
  ],
  [
    "CEPS",
    "College of Economics and Political Science",
    "كلية الاقتصاد والعلوم السياسية",
  ],
  ["CEDU", "College of Education", "كلية التربية"],
  ["CENG", "College of Engineering", "كلية الهندسة"],
  ["CLAW", "College of Law", "كلية الحقوق"],
  [
    "CMHS",
    "College of Medicine and Health Sciences",
    "كلية الطب والعلوم الصحية",
  ],
  ["CON", "College of Nursing", "كلية التمريض"],
  ["COS", "College of Science", "كلية العلوم"],
];
const expectedSemesters = [
  "Summer26",
  "Spring26",
  "Fall25",
  "Summer25",
  "Spring25",
  "Fall24",
  "Summer24",
  "Spring24",
  "Fall23",
  "Summer23",
  "Spring23",
  "Fall22",
  "Summer22",
  "Spring22",
  "Fall21",
  "Summer21",
  "Spring21",
  "Fall20",
  "Summer20",
  "Spring20",
];
const expectedFormats = ["pdf", "word", "powerpoint", "excel", "img", "other"];
const expectedTypes = [
  "Books",
  "Slides",
  "Notes",
  "Practice papers",
  "Exams",
  "Quizzes",
  "Worked examples",
  "Study guide",
];

test("catalogue has the supported bilingual shape", () => {
  assert.equal(catalogue.version, 3);
  assert.deepEqual(catalogue.semesters, expectedSemesters);
  assert.deepEqual(catalogue.formats, expectedFormats);
  assert.deepEqual(catalogue.resourceTypes, expectedTypes);
  assert.ok(Array.isArray(catalogue.courses));
  assert.ok(Array.isArray(catalogue.resources));
  assert.deepEqual(
    catalogue.colleges.map(({ code, name, nameAr }) => [code, name, nameAr]),
    expectedColleges,
  );
});

test("semester values keep the SQU season-year convention", () => {
  assert.ok(
    catalogue.semesters.every((value) =>
      /^(Spring|Summer|Fall)\d{2}$/.test(value),
    ),
  );
  for (const html of [home, arabicHome]) assert.match(html, /id="semFilter"/);
  assert.match(catalogueScript, /function semesterLabel/);
  assert.match(catalogueScript, /ربيع/);
  assert.doesNotMatch(home, /\bSem(?:ester)?\s+[12]\b/);
});

test("canonical IDs and filter values are shared across languages", () => {
  for (const html of [home, arabicHome]) {
    assert.match(html, /id="collegeGrid"/);
    assert.match(html, /id="typeFilter"/);
    assert.match(html, /id="formatFilter"/);
    assert.match(html, /data-catalogue-url=/);
  }
  assert.match(catalogueScript, /typeLabels/);
  assert.match(catalogueScript, /formatLabels/);
  assert.match(catalogueScript, /college\.code/);
});

test("college, course, and resource IDs are unique and linked", () => {
  assert.equal(
    new Set(catalogue.colleges.map((item) => item.id)).size,
    catalogue.colleges.length,
  );
  assert.equal(
    new Set(catalogue.colleges.map((item) => item.code)).size,
    catalogue.colleges.length,
  );
  assert.equal(
    new Set(catalogue.courses.map((item) => item.id)).size,
    catalogue.courses.length,
  );
  assert.equal(
    new Set(catalogue.resources.map((item) => item.id)).size,
    catalogue.resources.length,
  );
  const collegeIds = new Set(catalogue.colleges.map((item) => item.id));
  const courseIds = new Set(catalogue.courses.map((item) => item.id));
  for (const course of catalogue.courses)
    assert.ok(collegeIds.has(course.collegeId));
  for (const resource of catalogue.resources) {
    for (const field of [
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
      "driveUrl",
    ])
      assert.ok(
        Object.hasOwn(resource, field),
        `${resource.id} is missing ${field}`,
      );
    assert.ok(courseIds.has(resource.courseId));
    assert.ok(expectedSemesters.includes(resource.semester));
    assert.ok(expectedTypes.includes(resource.type));
    assert.ok(expectedFormats.includes(resource.format));
    assert.equal(resource.status, "verified");
    assert.match(resource.driveUrl, /^https:\/\/drive\.google\.com\//);
    if (resource.topicsAr) assert.ok(Array.isArray(resource.topicsAr));
    if (resource.translations) {
      for (const translation of Object.values(resource.translations)) {
        assert.equal(typeof translation.title, "string");
        assert.equal(typeof translation.description, "string");
        assert.ok(Array.isArray(translation.topics));
      }
    }
  }
});

test("launch remains truthful and contribution-first", () => {
  assert.match(home, />Lab</);
  assert.match(arabicHome, />Lab</);
  assert.match(home, /contribution-first beta/i);
  assert.match(arabicHome, /مرحلة تجريبية/);
  assert.equal(catalogue.resources.length, 0);
  assert.doesNotMatch(home, /Classical Mechanics|PHYS3101|A\. Al-Balushi/);
  assert.match(home, /assets\/js\/catalogue\.js/);
  assert.match(arabicHome, /assets\/js\/catalogue\.js/);
});
