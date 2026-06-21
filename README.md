# NexCore Study Hub

The organised academic resource library for the SQU community. This V1 is pure HTML, CSS, and JavaScript: NexCore owns the resource catalogue and review workflow, while Google Drive hosts approved files.

## Run locally

Run any static-file server from the repository root, for example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Before publishing

1. Create the Google Form used for contribution submissions and paste its public URL into `assets/js/config.js`.
2. Add the report/takedown email address to the same file.
3. Replace every `isDemo: true` record in `assets/data/catalogue.json` with an approved Google Drive resource.
4. Run `npm.cmd test`.
5. Import the Git repository into Vercel and deploy the repository root. No build command or custom domain is needed for this V1.

Google Form responses are reviewed manually in Google Sheets. Approved resources are added to the JSON catalogue, set to `verified`, checked, and deployed.

See [the launch checklist](docs/LAUNCH_CHECKLIST.md) for the exact Google Form fields, review rules, resource JSON example, and Vercel steps.

NexCore Study Hub is independent and is not an official Sultan Qaboos University service.
