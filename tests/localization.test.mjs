import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = Object.fromEntries(
  await Promise.all(
    [
      "index.html",
      "submit.html",
      "terms.html",
      "ar/index.html",
      "ar/submit.html",
      "ar/terms.html",
    ].map(async (path) => [path, await read(path)]),
  ),
);
const [languageScript, catalogueScript, homeCss, pageCss] = await Promise.all([
  read("assets/js/language.js"),
  read("assets/js/catalogue.js"),
  read("assets/css/home.css"),
  read("assets/css/site-pages.css"),
]);

test("all Arabic routes declare Arabic-Oman and RTL", () => {
  for (const path of ["ar/index.html", "ar/submit.html", "ar/terms.html"]) {
    assert.match(pages[path], /<html lang="ar-OM" dir="rtl">/);
    assert.match(
      pages[path],
      /<nav[^>]+dir="ltr"/,
      `${path} should preserve the English navigation direction`,
    );
    assert.match(pages[path], /Noto\+Sans\+Arabic/);
    assert.match(pages[path], /data-locale="ar-OM"/);
  }
});

test("every page exposes a reciprocal language switch and hreflang", () => {
  const pairs = [
    [
      "index.html",
      /href="ar\/"[^>]*data-locale="ar-OM"/,
      "ar/index.html",
      /href="\.\.\/index\.html"[^>]*data-locale="en"/,
    ],
    [
      "submit.html",
      /href="ar\/submit\.html"[^>]*data-locale="ar-OM"/,
      "ar/submit.html",
      /href="\.\.\/submit\.html"[^>]*data-locale="en"/,
    ],
    [
      "terms.html",
      /href="ar\/terms\.html"[^>]*data-locale="ar-OM"/,
      "ar/terms.html",
      /href="\.\.\/terms\.html"[^>]*data-locale="en"/,
    ],
  ];
  for (const [englishPath, englishSwitch, arabicPath, arabicSwitch] of pairs) {
    assert.match(pages[englishPath], englishSwitch);
    assert.match(pages[arabicPath], arabicSwitch);
    for (const html of [pages[englishPath], pages[arabicPath]]) {
      assert.match(html, /hreflang="en"/);
      assert.match(html, /hreflang="ar-OM"/);
      assert.match(html, /hreflang="x-default"/);
      assert.match(html, /rel="canonical"/);
    }
  }
});

test("every page exposes the optional contribution and MIT license footer", () => {
  for (const [path, html] of Object.entries(pages)) {
    assert.match(html, /https:\/\/www\.paypal\.me\/nexcorelabs/);
    assert.match(html, /NexCore-Labs-Initiative\/NexCore\/blob\/main\/LICENSE/);
    assert.match(html, /data-current-year/);
    assert.match(html, /assets\/js\/footer\.js\?v=1/);
    assert.match(html, /class="fa-brands fa-paypal"/);
    assert.doesNotMatch(html, /paypal-mark/);
    assert.match(html, /mailto:nexcorelabs@outlook\.com/);
    assert.match(html, /api\.whatsapp\.com\/send\?phone=\+96892154811/);
    assert.match(html, /https:\/\/x\.com\/nexcorelabs/);
    assert.match(html, /https:\/\/discord\.gg\/ExtGSwy5Pn/);
    assert.match(html, /fi-rr-envelope/);
    assert.match(html, /fi-brands-whatsapp/);
    assert.match(html, /fi-brands-twitter-alt/);
    assert.match(html, /fi-brands-discord/);
    assert.match(html, /UIcons by Flaticon/i);
    if (path.startsWith("ar/")) {
      assert.match(html, /مساهمة اختيارية/);
    } else {
      assert.match(html, /Optional contribution/);
    }
  }
});

test("remembered locale preserves location state without browser detection", () => {
  assert.match(languageScript, /nexcore-study-hub\.locale/);
  assert.match(languageScript, /window\.location\.search/);
  assert.match(languageScript, /window\.location\.hash/);
  assert.match(languageScript, /readPreference\(\) === "ar-OM"/);
  assert.doesNotMatch(languageScript, /navigator\.language/);
});

test("dynamic catalogue copy and RTL styles are localized", () => {
  assert.match(catalogueScript, /لا توجد موارد معتمدة بعد/);
  assert.match(catalogueScript, /function localized/);
  assert.match(catalogueScript, /translations/);
  assert.match(catalogueScript, /searchableText/);
  assert.match(homeCss, /html\[dir="rtl"\]/);
  assert.match(pageCss, /html\[dir="rtl"\]/);
  assert.match(homeCss, /prefers-reduced-motion/);
  assert.match(pageCss, /prefers-reduced-motion/);
});

test("Arabic contribution and legal experiences are complete", () => {
  assert.match(pages["ar/submit.html"], /id="acceptContributionTerms"/);
  assert.match(pages["ar/submit.html"], /شروط المساهمة/);
  assert.match(pages["ar/submit.html"], /معلومات\s+شخصية\s+أو\s+سرية/);
  for (const id of [
    "terms-of-use",
    "acceptable-use",
    "contribution-terms",
    "academic-integrity",
    "moderation",
    "privacy",
    "changes",
    "contact",
  ])
    assert.match(pages["ar/terms.html"], new RegExp(`id="${id}"`));
  assert.match(pages["ar/terms.html"], /النسخة الإنجليزية/);
  assert.match(pages["ar/terms.html"], /قوانين\s+سلطنة\s+عمان/);
});
