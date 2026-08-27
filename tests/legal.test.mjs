import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  home,
  submit,
  terms,
  arabicHome,
  arabicSubmit,
  arabicTerms,
  submitScript,
  configScript,
] = await Promise.all([
  read("index.html"),
  read("contribution.html"),
  read("terms.html"),
  read("ar/index.html"),
  read("ar/contribution.html"),
  read("ar/terms.html"),
  read("assets/js/submit.js"),
  read("assets/js/config.js"),
]);

test("every public page links to the terms", () => {
  for (const [name, html] of Object.entries({
    home,
    submit,
    terms,
    arabicHome,
    arabicSubmit,
    arabicTerms,
  })) {
    assert.match(
      html,
      /href="terms\.html(?:#[^"]+)?"/,
      `${name} needs a terms link`,
    );
  }
});

test("Arabic contribution form is gated by the same explicit acceptance", () => {
  assert.match(
    arabicSubmit,
    /id="acceptContributionTerms"[^>]*type="checkbox"/,
  );
  assert.match(arabicSubmit, /id="openSubmissionForm"[\s\S]*?disabled/);
  assert.match(arabicSubmit, /href="terms\.html#contribution-terms"/);
});

test("contribution form is gated by explicit acceptance", () => {
  assert.match(submit, /id="acceptContributionTerms"[^>]*type="checkbox"/);
  assert.match(submit, /id="openSubmissionForm"[\s\S]*?disabled/);
  assert.match(submit, /id="submissionFormPanel"[\s\S]*?hidden/);
  assert.match(submit, /id="submissionFormFrame"/);
  assert.match(submit, /id="submissionFormDirectLink"/);
  assert.match(
    submitScript,
    /if \(!termsCheckbox\.checked \|\| !formPanel \|\| !formFrame\) return;/,
  );
  assert.match(submitScript, /formPanel\.hidden = false/);
  assert.match(submitScript, /formFrame\.src = config\.googleFormEmbedUrl/);
  assert.match(configScript, /googleFormUrl/);
  assert.match(configScript, /googleFormEmbedUrl/);
  assert.match(
    configScript,
    /1FAIpQLSdM7F9wcsuuX2zmQ5jJ3hg6qmvrCFQh82hSZdJfQG6P-B8wxQ/,
  );
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
  assert.match(arabicTerms, /9 أغسطس 2026/);
  assert.match(arabicTerms, /nexcorelabs@outlook\.com/);
});
