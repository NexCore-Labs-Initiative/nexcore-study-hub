# NexCore Study Hub

The organized academic resource library for the SQU community. This V1 is pure HTML, CSS, and JavaScript: NexCore owns the Resource Library and review workflow, while Google Drive hosts approved files.

NexCore Study Hub is independent and is not an official Sultan Qaboos University service.

## Locales and routes

English remains the default locale and Arabic uses formal Omani-friendly MSA with RTL layout.

- English: `/`, `/contribution.html`, `/terms.html`
- Arabic (Oman): `/ar/`, `/ar/contribution.html`, `/ar/terms.html`

Legacy `/submit.html` and `/ar/submit.html` links redirect to the matching contribution page.

The language switch stores an explicit choice in `nexcore-study-hub.locale`. First-time visitors continue to see English, while visitors who explicitly select Arabic are returned to `/ar/` on future root visits. Direct deep links, query strings, and anchors are preserved.

Both homepages read published resources from the shared NexCore Labs Supabase project through `assets/js/catalogue-data.js`. `assets/js/config.js` contains only public connection settings. `assets/data/catalogue.json` is retained as the legacy college/taxonomy reference; it is no longer fetched by the website and must not be used to publish resources.

Resources are prepared on Labs' `/study-hub-admin.html` (Arabic: `/ar/study-hub-admin.html`). Labs admins assign the Study Hub Editor permission to existing Labs users. Editors prepare shared drafts and submit them for review; only Labs admins publish, return, archive or restore resources. Changes to an existing resource remain private until approved. Google Forms remains the intake channel and Drive files/folders remain the only resource targets.

Metadata uses the original entered text with optional reviewed `translations.ar` and `translations.en` values. Resource languages may contain Arabic, English, or both. Contributor credit is optional and requires permission. Never copy private contributor contacts or review notes into public metadata.

## Coordinated deployment

The schema, permission guard, API and editorial interface belong to the NexCore Labs branch `codex/study-hub-resource-management`. Follow `docs/study-hub-management.md` in that checkout: apply its two reviewed migrations and deploy/verify Labs before deploying this frontend. Public RLS must exclude drafts and archives. Do not deploy this frontend before the tables are ready: it reports database failures as unavailable, not as an empty library.

The current public connection key reuses Labs' existing legacy anon key. It is safe to expose and is not an administrator credential. A publishable key can replace it in `supabasePublishableKey` without changing the renderer. Never add service-role/secret keys to this repository.

## Offline support

`service-worker.js` precaches the English and Arabic app shell. Page navigations use a cached offline fallback, while same-origin static assets use the cache first. Supabase catalogue requests use `no-store` and are not persisted. An offline visitor can use the shell but cannot load a stale catalogue. Already-open pages update on refresh; archiving a resource does not revoke its external Drive URL.

When a precached page, script, stylesheet, data file, or image changes, update its cache-busting URL where applicable and increment `CACHE_VERSION` in `service-worker.js` so existing visitors receive a fresh cache.

## Checks

Run `npm.cmd test` to validate JavaScript syntax, resource library behavior and schema, legal/contribution safeguards, localization coverage, service-worker registration, and every precached path.
