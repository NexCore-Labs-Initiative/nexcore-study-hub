# Study Hub launch checklist

## 1. Create the contribution Google Form

Maintain one bilingual Google Form named **NexCore Study Hub — Resource contribution | المساهمة بمورد دراسي**. Put English and Arabic together in every title, description, option, validation message, and confirmation so both site routes use the same review queue. Use this description:

> Share a useful SQU study resource for review. NexCore Study Hub is in its contribution-first beta: the public Resource Library grows only after submissions are checked. Only submit material you created or have permission to share.
>
> شارك موردًا دراسيًا مفيدًا لطلبة SQU ليخضع للمراجعة. لا تنمو مكتبة الموارد العامة في هذه المرحلة التجريبية إلا بعد مراجعة المساهمات. أرسل فقط المواد التي أنشأتها أو لديك إذن بمشاركتها.

Add these questions in this order:

| Question               | Type         | Required | Notes                                                                                |
| ---------------------- | ------------ | -------- | ------------------------------------------------------------------------------------ |
| Your SQU email address | Short answer | Yes      | Enable email validation.                                                             |
| Course code            | Short answer | Yes      | Example: `CS101`.                                                                    |
| Course title           | Short answer | Yes      | Use the course’s published name.                                                     |
| Semester               | Dropdown     | Yes      | Use the published collection: Spring26, Fall25, Spring25, and earlier terms.         |
| Resource title         | Short answer | Yes      | A clear title students can recognise.                                                |
| Resource type          | Dropdown     | Yes      | Books, Notes, Practice papers, Exams, Quizzes, Worked examples, Study guide, Slides. |
| Resource format        | Dropdown     | Yes      | PDF, Word, PowerPoint, Excel, Image, Other.                                          |
| Main topics            | Short answer | Yes      | Separate topics with commas.                                                         |
| Google Drive link      | Short answer | Yes      | Enable URL validation.                                                               |
| Description            | Paragraph    | Yes      | Ask what the resource covers and why it is useful.                                   |
| Consent confirmation   | Checkboxes   | Yes      | Require every confirmation listed below.                                             |
| Notes for reviewers    | Paragraph    | No       | For context that should not appear publicly.                                         |

Form settings:

- Do not allow file uploads; contributors should submit a Drive link instead.
- Keep responses editable only if that matches your review process; the recommended default is off.
- Create a linked response spreadsheet named **NexCore Study Hub — Review queue**.
- Require contributors to confirm all of the following in both languages:
  - they created the resource or have clear permission to share it publicly;
  - the resource contains no active or leaked assessment, restricted answer key, instructor-only material, unauthorised textbook copy, confidential information, or unnecessary personal data;
  - NexCore may review the resource and publish its approved Resource Library metadata and public Drive viewer link;
  - the contribution follows academic-integrity rules; and
  - they have read and accept the English-controlled Contribution Terms and Privacy Notice.
- Use this bilingual confirmation text: `Thanks. NexCore will review your submission before publishing any resource library entry. | شكرًا لك. سيراجع NexCore مساهمتك قبل نشر أي سجل في مكتبة الموارد.`

Copy the form’s public URL after creating it. It must begin with `https://`.

## 2. Configure public contact paths

Choose an inbox that is monitored by the person responsible for moderation. It can be a NexCore mailbox or a dedicated Study Hub address.

In `assets/js/config.js`, replace the empty strings:

```js
window.STUDY_HUB_CONFIG = Object.freeze({
  googleFormUrl: "https://forms.gle/your-public-form-id",
  reportEmail: "study@nexcorelabs.com",
});
```

Never place passwords, API keys, or Google Drive editing links in this file.

## 3. Review and publish resources

For every Google Form response, verify:

1. The Drive link opens in an incognito browser as a viewer.
2. The material is appropriate to share and does not include restricted textbooks, answer keys, personal data, or copyrighted material without permission.
3. The course, semester, title, type, and topic information are clear.

Index selected contributions in the dedicated NexCore Labs Study Hub workspace. An assigned Study Hub Editor saves a draft, completes the required metadata and submits it for review. A Labs administrator checks the link, sharing rights and metadata, then approves publication. New-course proposals are approved or matched to an existing course during that review.

The public catalogue reads published resources from Supabase. Do not add resources to the retired local JSON file. Published resources can be revised without exposing the proposed changes, and admins can archive or restore them.

Optional Arabic/English metadata translations must be reviewed. Both languages may be selected for bilingual files or folders. Show optional contributor credit only with permission, and retain contact information in the Google Form review process.

Apply and verify the Labs migrations and management API before deploying the matching Study Hub frontend; follow the coordinated deployment section in README.md and Labs' docs/study-hub-management.md.

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
