# 2026-10-04 — Hospitalist note and charge review

Added a separate clinical-informatics capability for structured review of de-identified hospitalist documentation and charge capture. This is professional billing workflow work, separate from the graduate economics projects.

The browser-only tool proposes routine E/M candidates using clinician-confirmed, quoted evidence or documented qualifying time. It checks data categories, two-of-three MDM, discharge thresholds, and Medicare critical-care time boundaries. Special service families and payer-dependent exceptions are referred for coder review.

Private source correspondence and internal education PDFs are excluded from the public repository. A separate private reference pack includes original attachments, complete extracted text, dated workflow caveats, and a file the reviewer can load locally. Importing reference material displays guidance and does not overwrite coding rules. The tool does not transmit or persist note entries.

Validation: synthetic regression tests cover evidence absence, duplicate data, MDM thresholds, exception routing, time mismatch, discharge boundaries, Medicare critical-care boundaries, and prompt-injection text. Clinical classification is user-confirmed; semantic coding validation and EHR integration are not implemented.
