"use strict";

const CACHE_PREFIX = "nexcore-study-hub-";
const CACHE_VERSION = "v2";
const PRECACHE_NAME = `${CACHE_PREFIX}precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;
const CATALOGUE_PATH = "/assets/data/catalogue.json";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/submit.html",
  "/terms.html",
  "/ar/",
  "/ar/index.html",
  "/ar/submit.html",
  "/ar/terms.html",
  "/assets/css/home.css?v=locale-8",
  "/assets/css/site-pages.css?v=locale-8",
  "/assets/js/catalogue.js?v=1",
  "/assets/js/config.js?v=2",
  "/assets/js/footer.js?v=1",
  "/assets/js/language.js?v=1",
  "/assets/js/nav.js",
  "/assets/js/service-worker-registration.js?v=1",
  "/assets/js/submit.js?v=2",
  CATALOGUE_PATH,
  "/assets/imgs/brand/apple-touch-icon.webp",
  "/assets/imgs/brand/favicon-32.webp",
  "/assets/imgs/brand/favicon.webp",
  "/assets/imgs/brand/icon.webp",
];

const canCache = (response) => response && response.ok && response.type !== "opaque";

async function cacheResponse(cacheName, request, response) {
  if (canCache(response)) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function matchStudyHubCache(request, options) {
  const precache = await caches.open(PRECACHE_NAME);
  const precached = await precache.match(request, options);
  if (precached) return precached;

  const runtime = await caches.open(RUNTIME_NAME);
  return runtime.match(request, options);
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    return await cacheResponse(RUNTIME_NAME, request, response);
  } catch (error) {
    const cached = await matchStudyHubCache(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) {
      return matchStudyHubCache(fallbackUrl, { ignoreSearch: true });
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await matchStudyHubCache(request);
  if (cached) return cached;

  const response = await fetch(request);
  return cacheResponse(RUNTIME_NAME, request, response);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) =>
                name.startsWith(CACHE_PREFIX) &&
                name !== PRECACHE_NAME &&
                name !== RUNTIME_NAME,
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const fallbackUrl = url.pathname.startsWith("/ar/")
      ? "/ar/index.html"
      : "/index.html";
    event.respondWith(networkFirst(request, fallbackUrl));
    return;
  }

  if (url.pathname === CATALOGUE_PATH) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
