# Bilingual Google Form handoff

The public contribution form must remain a single Google Form with one response spreadsheet and the existing public URL:

<https://forms.gle/H9EBvisJQ3hfAuxW7>

The currently available Google account can submit the form but does not own it. Apply this specification from the account that owns the form before production launch.

## Form title and description

**Title**

NexCore Study Hub — Resource contribution | المساهمة بمورد دراسي

**Description**

Share a useful SQU study resource for review. NexCore Study Hub is in its contribution-first beta: the public catalogue grows only after submissions are checked. Only submit material you created or have permission to share.

شارك موردًا دراسيًا مفيدًا لطلبة SQU ليخضع للمراجعة. لا ينمو الفهرس العام في هذه المرحلة التجريبية إلا بعد مراجعة المساهمات. أرسل فقط المواد التي أنشأتها أو لديك إذن بمشاركتها.

## Questions

All questions are required except **Notes for reviewers | ملاحظات للمراجعين**.

1. **Your SQU email address | بريدك الإلكتروني في SQU** — short answer with email validation.
2. **Course code | رمز المقرر** — short answer. Keep codes such as `PHYS2101` in Latin characters.
3. **Course title | اسم المقرر** — short answer.
4. **Semester | الفصل الدراسي** — dropdown using the canonical semester values from `assets/data/catalogue.json`. Display each value bilingually without changing its stored value, for example `Spring26 | ربيع 2026`.
5. **Resource title | عنوان المورد** — short answer.
6. **Resource type | نوع المورد** — dropdown aligned with the catalogue:
   - `Book | كتاب`
   - `Presentation | عرض تقديمي`
   - `Notes | مذكرات`
   - `Worksheet | ورقة تدريبية`
   - `Exam | اختبار`
   - `Quiz | اختبار قصير`
   - `Worked examples | أمثلة محلولة`
   - `Study guide | دليل دراسي`
7. **Resource format | صيغة المورد** — dropdown aligned with the catalogue:
   - `PDF`
   - `Word`
   - `PowerPoint`
   - `Excel`
   - `Image | صورة`
   - `Other | أخرى`
8. **Main topics | الموضوعات الرئيسية** — short answer. Ask contributors to separate topics with commas.
9. **Google Drive link | رابط Google Drive** — short answer with URL validation. Keep Drive-link submission; do not replace it with file upload.
10. **Description | الوصف** — paragraph.
11. **Contribution confirmations | تأكيدات المساهمة** — required checkboxes. Require all five choices:
    - I created this resource or have clear permission to share it publicly. | أنشأت هذا المورد أو لدي إذن واضح بمشاركته علنًا.
    - It contains no active or leaked assessment, restricted answer key, instructor-only material, unauthorised textbook copy, confidential information, or unnecessary personal data. | لا يحتوي على اختبار جارٍ أو مسرّب، أو مفتاح إجابة مقيّد، أو مادة خاصة بالمدرسين، أو نسخة كتاب غير مصرح بها، أو معلومات سرية، أو بيانات شخصية غير ضرورية.
    - NexCore may review it and publicly list its approved metadata and public Drive viewer link. | يجوز لـNexCore مراجعته ونشر بياناته الوصفية المعتمدة ورابط عرضه العام في Drive.
    - The contribution follows academic-integrity rules. | تلتزم المساهمة بقواعد النزاهة الأكاديمية.
    - I have read and accept the Contribution Terms and Privacy Notice; English controls if versions differ. | قرأت شروط المساهمة وإشعار الخصوصية وأوافق عليهما؛ وتكون النسخة الإنجليزية معتمدة عند الاختلاف.
12. **Notes for reviewers | ملاحظات للمراجعين** — optional paragraph for private review context.

In the confirmations question description, link both versions of the terms:

- <https://nexcore-study-hub.vercel.app/terms.html>
- <https://nexcore-study-hub.vercel.app/ar/terms.html>

## Confirmation message

Thanks. NexCore will review your submission before publishing any catalogue entry. | شكرًا لك. سيراجع NexCore مساهمتك قبل نشر أي سجل في الفهرس.

## Owner verification

- Confirm all five contribution confirmations are mandatory.
- Confirm the email and URL fields use real Google Forms validation rather than instructional placeholder text.
- Confirm the same response spreadsheet remains connected.
- Submit one English and one Arabic test response, then remove those test rows.
- Reopen the public form in a signed-out window and confirm the bilingual wording, validation, and confirmation message.
