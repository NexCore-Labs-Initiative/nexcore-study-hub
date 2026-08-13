# NexCore Study Hub

The organized academic resource library for the SQU community. This V1 is pure HTML, CSS, and JavaScript: NexCore owns the resource catalogue and review workflow, while Google Drive hosts approved files.

NexCore Study Hub is independent and is not an official Sultan Qaboos University service.

## Locales and routes

English remains the default locale and Arabic uses formal Omani-friendly MSA with RTL layout.

- English: `/`, `/submit.html`, `/terms.html`
- Arabic (Oman): `/ar/`, `/ar/submit.html`, `/ar/terms.html`

The language switch stores an explicit choice in `nexcore-study-hub.locale`. First-time visitors continue to see English, while visitors who explicitly select Arabic are returned to `/ar/` on future root visits. Direct deep links, query strings, and anchors are preserved.

`assets/data/catalogue.json` is the single catalogue source for both homepages. Catalogue records may include reviewed Arabic metadata (`titleAr`, `descriptionAr`, and `topicsAr`) while their codes, filters, and canonical values remain language-neutral.

## Offline support

`service-worker.js` precaches the English and Arabic app shell. Page navigations and catalogue data use the network first with a cached offline fallback, while same-origin static assets use the cache first. The worker is registered from every public route with root scope.

When a precached page, script, stylesheet, data file, or image changes, update its cache-busting URL where applicable and increment `CACHE_VERSION` in `service-worker.js` so existing visitors receive a fresh cache.

## Checks

Run `npm.cmd test` to validate JavaScript syntax, catalogue behavior and schema, legal/contribution safeguards, localization coverage, service-worker registration, and every precached path.
