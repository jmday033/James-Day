# Hospitalist Note & Charge Review

A browser-only structured assistant for reviewing de-identified hospitalist notes, supported E/M candidates, documentation questions, and payment blockers. Open `index.html` locally; no installation or account is required. Keep `engine.js` next to it. Run tests with `node test-engine.js`.

## Nocturnist admission capture (v2)

Built for night-shift admitters, where revenue usually leaks through missed add-ons, date-of-service errors, and charges that never drop, not through under-coding alone. The features follow what commercial charge-capture and CDI products do (real-time documentation nudges, next-level gap reports, missed-charge reconciliation), kept to work the physician actually performed:

- **Next-level gap report.** For the current candidate, shows the MDM level the next code needs, how many elements are short, and a specific question for each one (e.g. decision regarding hospitalization or escalation, your own ECG/CXR read, an interactive ED-physician discussion, an independent historian). Also shows how many documented minutes the time path would need.
- **Uncredited-work detectors.** Scans note text for work that appears performed but is not credited: tracings/images without an interpretation, clinician discussions, collateral historians, goals-of-care content, escalation language, intensive-monitoring drugs, and critical-illness markers. Detectors prompt; they never credit.
- **Add-on capture.** Prolonged services (G0316 for Medicare, 99418 otherwise) when 99223/99233 is selected by time (thresholds 90 and 65 minutes, then each full 15). Advance care planning 99497/99498 (16+ and 46+ minutes, time separate from the E/M). Critical care after the admission E/M on the same date, with modifier 25 and non-overlapping time.
- **Overnight date logic.** A continuous service through midnight is reported on the start date with all of its time. Non-continuous work on both sides of midnight is two dates. One hospital E/M per group per patient per date, so a post-midnight admission plus a same-date day-team visit is one charge; a pre-midnight admission leaves the morning visit separately reportable if performed.
- **Shift log.** Adds each reviewed encounter to an in-memory table with codes, estimated work RVUs (CY2026 published values), the open next-level question, blocker count, and whether the charge is confirmed in billing. CSV export carries labels and codes only, not note text.

## Workflow

1. Paste a synthetic or properly de-identified note. Choose the encounter and payer.
2. Select problem and management-risk levels, enumerate unique qualifying data, and paste exact supporting excerpts.
3. Enter encounter start/end times and continuity across midnight. If using time, enter the documented qualifying minutes and paste the time statement. The number must match the statement.
4. Enter any separately documented ACP or same-date critical care. Identify exceptions and verify signature, charge capture, interface, enrollment, and duplicate-charge status.
5. Review the candidate, add-ons, and next-level gaps. Add the encounter to the shift log. Clarify only work actually performed, then use the approved billing workflow. Download the review if appropriate.

To read private email/attachment guidance alongside the tool, load `private-guidance.json` from the separately supplied private reference pack. The GitHub project deliberately excludes internal attachments, correspondence, account details, patient data, and payment reports. The private pack also includes original source PDFs. File import is browser-local, text-only, and does not alter coding rules.

## Scope and limitations

Routine initial/subsequent inpatient or observation E/M, discharge management, Medicare critical-care candidates, prolonged services, advance care planning, and E/M followed by same-date critical care are implemented. Overall MDM uses two of three elements. Data credit uses qualifying categories and deduplicated user-entered items. Users must validate uniqueness, eligibility, level classification, and whether a quote actually supports their selection. Exact matching is a guard against absent evidence, not semantic verification. The tool does not automatically infer MDM from prose, assign ICD-10 diagnoses, rewrite notes, or submit claims.

Same-day admission/discharge, consultations, split/shared services, teaching physicians, global surgery, multiple same-day services, telehealth, and other settings are routed to coder review. Prolonged-service payment by non-Medicare payers varies. Whether the admitting physician's decision to hospitalize counts as high risk is interpreted differently by payers and auditors; the tool asks the clinician to document their own decision and flags it for coder confirmation. No code is guaranteed payable. Medical necessity and payer policy govern. Facility CDI improvements may not increase professional collections. Never treat a cosign alone as permission to bill under another physician.

There are no external scripts, analytics, API calls, browser storage, or service workers. Entries remain in browser memory until cleared or the page closes; downloads are explicit. This is not a HIPAA compliance certification or approval for real patient data. Use an institution-approved environment for PHI and do not commit notes or reports to GitHub.

## Sources and versioning

Rules reviewed 2026-10-04. Public references:

- [CMS E/M Services, May 2026](https://www.cms.gov/files/document/mln006764-evaluation-management-services.pdf), including qualifying time, Medicare critical care, consultation policy, and service-family exceptions.
- [Noridian, Prolonged service code](https://med.noridianmedicare.com/web/jfb/specialties/em/prolonged-service-code) — G0316 thresholds.
- [Coalition to Transform Advanced Care, ACP codes FAQ (Oct 2023)](https://coalitionccc.org/common/Uploaded%20files/PDFs/ACP%20CodesFAQs_CCCC_Oct2023c.pdf) — ACP time and same-day rules.
- [ACP summary of the CY2026 PFS final rule](https://www.acponline.org/sites/default/files/documents/advocacy/where_we_stand/assets/acp_summary_of_2026_physician_fee_schedule_medicare_final_rule_2025.pdf) — time-based codes exempt from the efficiency adjustment.
- [AMA E/M resources](https://www.ama-assn.org/practice-management/cpt/cpt-evaluation-and-management).
- [AMA 2023 E/M descriptors and guidelines](https://www.ama-assn.org/system/files/2023-e-m-descriptors-guidelines.pdf), the underlying hospital E/M thresholds and MDM framework. Check the current licensed CPT code set and payer guidance before production use.

CPT® is a registered trademark of the American Medical Association. This original implementation is a limited aid, not a reproduction of the complete CPT code set.

Future work: coder-validated classification, payer-specific policy versions, institution-approved note integration, and encounter-to-collections reconciliation. These are not implemented in this version.
