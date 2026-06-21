import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const catalogue = JSON.parse(await readFile(new URL("../assets/data/catalogue.json", import.meta.url), "utf8"));
const required = ["id", "courseId", "title", "description", "semester", "topics", "type", "language", "status", "isDemo", "driveUrl"];
test("catalogue has a supported shape", () => { assert.equal(catalogue.version, 2); assert.ok(catalogue.colleges.length); assert.ok(catalogue.courses.length); assert.ok(catalogue.resources.length); });
test("college, course, and resource IDs are unique", () => { assert.equal(new Set(catalogue.colleges.map(c => c.id)).size, catalogue.colleges.length); assert.equal(new Set(catalogue.courses.map(c => c.id)).size, catalogue.courses.length); assert.equal(new Set(catalogue.resources.map(r => r.id)).size, catalogue.resources.length); });
test("courses and resources belong to valid catalogue parents", () => { const collegeIds = new Set(catalogue.colleges.map(c => c.id)); const courseIds = new Set(catalogue.courses.map(c => c.id)); for (const course of catalogue.courses) assert.ok(collegeIds.has(course.collegeId), `${course.id} references an unknown college`); for (const r of catalogue.resources) { for (const field of required) assert.ok(Object.hasOwn(r, field), `${r.id} is missing ${field}`); assert.ok(courseIds.has(r.courseId), `${r.id} references an unknown course`); assert.ok(Array.isArray(r.topics) && r.topics.length, `${r.id} needs a topic`); assert.ok(["demo", "verified"].includes(r.status), `${r.id} status is unsupported`); if (r.isDemo) { assert.equal(r.status, "demo"); assert.equal(r.driveUrl, ""); } else { assert.equal(r.status, "verified"); assert.match(r.driveUrl, /^https:\/\/drive\.google\.com\//); } } });
