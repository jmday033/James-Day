# Responsive service horizon

The service-horizon slider previously included past years that snapped to the minimum future service. Its label and numeric synchronization also depended on unrelated salary/ZIP validation passing.

Limit the slider to end years 2027-2056 (1-30 additional years under the model's fixed 2026 base year), keep prior service as read-only context, and update the timeline before reference-data and calculation validation. Invalid financial/location inputs still block financial results; they no longer freeze the timeline. Add accessible value text describing additional years, total active service and end year.

Headless Edge verification covers pointer dragging, Home/End/arrow keys, numeric input synchronization, active-start changes, invalid ZIP followed by recovery, changed financial results, and the 20-year pension threshold. Existing duty-station browser checks also pass.
