import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pagePaths = [
  "index.html",
  "submit.html",
  "terms.html",
  "ar/index.html",
  "ar/submit.html",
  "ar/terms.html",
];

const [worker, registration, ...pageContents] = await Promise.all([
  read("service-worker.js"),
  read("assets/js/service-worker-registration.js"),
  ...pagePaths.map(read),
]);

test("every public route loads the root-scoped service worker registration", () => {
  pagePaths.forEach((path, index) => {
    const prefix = path.startsWith("ar/") ? "../" : "";
    assert.match(
      pageContents[index],
      new RegExp(
        `src="${prefix}assets/js/service-worker-registration\\.js\\?v=1"`,
      ),
      `${path} should load the registration script`,
    );
  });

  assert.match(registration, /register\("\/service-worker\.js"/);
  assert.match(registration, /scope: "\/"/);
  assert.match(registration, /updateViaCache: "none"/);
  assert.match(registration, /\.catch\(/);
});

test("the worker precaches only files that exist in the repository", async () => {
  const list = worker.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
  assert.ok(list, "PRECACHE_URLS should be declared");

  const cataloguePath = worker.match(/const CATALOGUE_PATH = "([^"]+)";/)?.[1];
  const urls = [...list[1].matchAll(/"(\/[^\"]+)"/g)].map(
    (match) => match[1],
  );
  if (list[1].includes("CATALOGUE_PATH") && cataloguePath) urls.push(cataloguePath);

  assert.ok(urls.length > 0, "the precache should not be empty");

  await Promise.all(
    urls.map(async (url) => {
      const path = url.split("?")[0];
      const filePath =
        path === "/"
          ? "index.html"
          : path.endsWith("/")
            ? `${path.slice(1)}index.html`
            : path.slice(1);
      await assert.doesNotReject(
        access(new URL(`../${filePath}`, import.meta.url)),
        `${url} should resolve to a real file`,
      );
    }),
  );
});

test("the worker keeps documents and catalogue data fresh with offline fallbacks", () => {
  assert.match(worker, /self\.addEventListener\("install"/);
  assert.match(worker, /self\.addEventListener\("activate"/);
  assert.match(worker, /self\.addEventListener\("fetch"/);
  assert.match(worker, /self\.skipWaiting\(\)/);
  assert.match(worker, /self\.clients\.claim\(\)/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /url\.pathname === CATALOGUE_PATH/);
  assert.match(worker, /networkFirst\(request, fallbackUrl\)/);
  assert.match(worker, /networkFirst\(request\)/);
  assert.match(worker, /cacheFirst\(request\)/);
  assert.match(worker, /name\.startsWith\(CACHE_PREFIX\)/);
  assert.match(worker, /matchStudyHubCache\(request/);
  assert.doesNotMatch(
    worker,
    /caches\.match\(/,
    "cache lookups should never leak into caches owned by another app",
  );
});
