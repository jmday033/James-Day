# 2026-10-04 — Nocturnist admission capture for the hospitalist note review

At the author's request, extended the hospitalist note and charge review toward maximizing legitimately supported professional charges for overnight admissions, modeled on features common to commercial charge-capture and CDI tools.

**Decision.** Increase capture by finding performed-but-uncredited work, missed add-on services, date-of-service errors, and dropped charges, rather than by lowering evidence standards. Every credited element still requires an exact quote from the note; detectors only prompt.

**Added.** Next-level gap report with element-specific questions and time shortfall; note-text detectors; prolonged services (G0316/99418); advance care planning (99497/99498); E/M followed by same-date critical care with modifier 25; overnight date-of-service and one-E/M-per-group-per-date logic; shift log with work-RVU estimates and CSV export.

**Judgment calls.** Prolonged services are offered only when the top code is selected by time (CMS requirement). ACP with same-date critical care is routed to coder review. The admitting decision as a high-risk element is prompted with a coder-confirmation caveat because interpretation varies. Work RVUs are CY2026 published values and should be checked against the local fee schedule.

**Validation.** Existing 29 regression checks pass unchanged; new synthetic checks cover prolonged thresholds and units, time-quote mismatch, ACP thresholds and confirmation, gap analysis, same-date critical care gating, midnight and same-group logic, detectors, and the shift summary. UI exercised end to end in jsdom with the synthetic example. Visual browser validation not performed.
