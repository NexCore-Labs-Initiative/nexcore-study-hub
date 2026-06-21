# Study Hub launch checklist

## 1. Create the contribution Google Form

Create a blank Google Form named **NexCore Study Hub — Resource contribution**. Use this description:

> Share a useful SQU study resource for review. NexCore reviews every submission before it appears in the public catalogue. Only submit material you created or have permission to share.

Add these questions in this order:

| Question | Type | Required | Notes |
| --- | --- | --- | --- |
| Your SQU email address | Short answer | Yes | Enable email validation. |
| Course code | Short answer | Yes | Example: `CS101`. |
| Course title | Short answer | Yes | Use the course’s published name. |
| Semester | Dropdown | Yes | Semester 1, Semester 2, Summer, Other. |
| Resource title | Short answer | Yes | A clear title students can recognise. |
| Resource type | Dropdown | Yes | Notes, Study guide, Practice material, Worked examples, Past paper, Other. |
| Main topics | Short answer | Yes | Separate topics with commas. |
| Google Drive link | Short answer | Yes | Enable URL validation. |
| Description | Paragraph | Yes | Ask what the resource covers and why it is useful. |
| Rights confirmation | Checkboxes | Yes | Single required option: `I created this resource or have permission to share it publicly.` |
| Notes for reviewers | Paragraph | No | For context that should not appear publicly. |

Form settings:

- Do not allow file uploads; contributors should submit a Drive link instead.
- Keep responses editable only if that matches your review process; the recommended default is off.
- Create a linked response spreadsheet named **NexCore Study Hub — Review queue**.
- Use this confirmation text: `Thanks. NexCore will review your submission before publishing any catalogue entry.`

Copy the form’s public URL after creating it. It must begin with `https://`.

## 2. Configure public contact paths

Choose an inbox that is monitored by the person responsible for moderation. It can be a NexCore mailbox or a dedicated Study Hub address.

In `assets/js/config.js`, replace the empty strings:

```js
window.STUDY_HUB_CONFIG = Object.freeze({
  googleFormUrl: "https://forms.gle/your-public-form-id",
  reportEmail: "study@nexcorelabs.com"
});
```

Never place passwords, API keys, or Google Drive editing links in this file.

## 3. Review and publish resources

For every Google Form response, verify:

1. The Drive link opens in an incognito browser as a viewer.
2. The material is appropriate to share and does not include restricted textbooks, answer keys, personal data, or copyrighted material without permission.
3. The course, semester, title, type, and topic information are clear.

Add only approved records to `assets/data/catalogue.json`. A live entry must have:

```json
{
  "id": "cs101-arrays-revision-guide",
  "courseId": "cs101",
  "title": "Arrays and loops revision guide",
  "description": "A concise revision guide for array traversal and loop patterns.",
  "semester": "Semester 1",
  "topics": ["Arrays", "Loops"],
  "type": "Study guide",
  "language": "English",
  "status": "verified",
  "isDemo": false,
  "driveUrl": "https://drive.google.com/file/d/your-file-id/view"
}
```

Remove the demo records before public launch unless you intentionally want the catalogue to show sample entries.

## 4. Validate and deploy

Run:

```powershell
npm.cmd test
```

Then:

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Leave the framework preset as **Other** and the build command blank.
4. Deploy from the repository root.
5. Test the generated `*.vercel.app` URL on desktop and mobile before sharing it.

The future `study.nexcorelabs.com` domain is intentionally not part of this launch checklist.
