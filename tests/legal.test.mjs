import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [home, submit, terms, submitScript, configScript] = await Promise.all([
  read("index.html"),
  read("submit.html"),
  read("terms.html"),
  read("assets/js/submit.js"),
  read("assets/js/config.js"),
]);

test("every public page links to the terms", () => {
  for (const [name, html] of Object.entries({ home, submit, terms })) {
    assert.match(html, /href="terms\.html(?:#[^"]+)?"/, `${name} needs a terms link`);
  }
});

test("contribution form is gated by explicit acceptance", () => {
  assert.match(submit, /id="acceptContributionTerms"[^>]*type="checkbox"/);
  assert.match(submit, /id="openSubmissionForm"[\s\S]*?disabled/);
  assert.match(submitScript, /if \(!termsCheckbox\.checked\) return;/);
  assert.match(submitScript, /window\.location\.assign\(config\.googleFormUrl\)/);
  assert.match(configScript, /https:\/\/forms\.gle\/H9EBvisJQ3hfAuxW7/);
});

test("terms cover the core contribution and privacy risks", () => {
  for (const id of [
    "terms-of-use",
    "acceptable-use",
    "contribution-terms",
    "academic-integrity",
    "moderation",
    "privacy",
    "contact",
  ]) {
    assert.match(terms, new RegExp(`id="${id}"`), `missing ${id} section`);
  }
  assert.match(terms, /nexcorelabs@outlook\.com/);
  assert.match(terms, /9 August 2026/);
});
