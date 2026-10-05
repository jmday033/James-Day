# Hospitalist Note & Charge Review

A browser-only structured assistant for reviewing de-identified hospitalist notes, supported E/M candidates, documentation questions, and payment blockers. Open `index.html` locally; no installation or account is required. Keep `engine.js` next to it. Run tests with `node test-engine.js`.

## Workflow

1. Paste a synthetic or properly de-identified note. Choose the encounter and payer.
2. Select problem and management-risk levels, enumerate unique qualifying data, and paste exact supporting excerpts.
3. If using time, enter the documented qualifying minutes and paste the time statement. The number must match the statement.
4. Identify exceptions and verify signature, charge capture, interface, enrollment, and duplicate-charge status.
5. Review the candidate and gaps. Clarify only work actually performed, then use the approved billing workflow. Download the review if appropriate.

To read private email/attachment guidance alongside the tool, load `private-guidance.json` from the separately supplied private reference pack. The GitHub project deliberately excludes internal attachments, correspondence, account details, patient data, and payment reports. The private pack also includes original source PDFs. File import is browser-local, text-only, and does not alter coding rules.

## Scope and limitations

Routine initial/subsequent inpatient or observation E/M, discharge management, and Medicare critical-care candidates are implemented. Overall MDM uses two of three elements. Data credit uses qualifying categories and deduplicated user-entered items. Users must validate uniqueness, eligibility, level classification, and whether a quote actually supports their selection. Exact matching is a guard against absent evidence, not semantic verification. The tool does not automatically infer MDM from prose, assign ICD-10 diagnoses, rewrite notes, or submit claims.

Same-day admission/discharge, consultations, split/shared services, teaching physicians, global surgery, multiple same-day services, telehealth, and other settings are routed to coder review. Prolonged services require separate review. No code is guaranteed payable. Medical necessity and payer policy govern. Facility CDI improvements may not increase professional collections. Never treat a cosign alone as permission to bill under another physician.

There are no external scripts, analytics, API calls, browser storage, or service workers. Entries remain in browser memory until cleared or the page closes; downloads are explicit. This is not a HIPAA compliance certification or approval for real patient data. Use an institution-approved environment for PHI and do not commit notes or reports to GitHub.

## Sources and versioning

Rules reviewed 2026-10-04. Public references:

- [CMS E/M Services, May 2026](https://www.cms.gov/files/document/mln006764-evaluation-management-services.pdf), including qualifying time, Medicare critical care, consultation policy, and service-family exceptions.
- [AMA E/M resources](https://www.ama-assn.org/practice-management/cpt/cpt-evaluation-and-management).
- [AMA 2023 E/M descriptors and guidelines](https://www.ama-assn.org/system/files/2023-e-m-descriptors-guidelines.pdf), the underlying hospital E/M thresholds and MDM framework. Check the current licensed CPT code set and payer guidance before production use.

CPT® is a registered trademark of the American Medical Association. This original implementation is a limited aid, not a reproduction of the complete CPT code set.

Future work: coder-validated classification, payer-specific policy versions, institution-approved note integration, and encounter-to-collections reconciliation. These are not implemented in this version.
