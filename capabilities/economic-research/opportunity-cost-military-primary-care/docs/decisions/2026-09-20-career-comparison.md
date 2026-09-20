# Career comparison and accounting conventions

The lab now compares leaving now, staying through the selected service period, and reaching 20 active years over one shared work horizon. It includes civilian work after separation until the entered work-end age. Paths below the entered minimum remaining obligation are labeled infeasible; the lab does not determine legal service eligibility.

## Accounting

- Discount annual cash flows at year-end. The cumulative chart uses the calculation engine's discounted rows.
- Keep lifetime pension present value separate from annual cash and employer benefits. Subtract the stay-minus-leave pension PV exactly once from the selected-period cash gap. The annual equivalent divides this combined PV by an ordinary, year-end annuity factor.
- Include earned pensions on both paths when already retirement-eligible. Longer service changes accrual and High-3 while delaying pension receipt. A current High-3 override supports retiring now; otherwise use the current grade/pay-longevity estimate.
- The career table includes pension cash when received, but its total value adds full lifetime pension PV only once. Show pension value after the work-horizon endpoint separately. All paths use the same endpoint for work, not necessarily the same pension payment duration.
- Reuse the existing simplified 2026 tax schedules each year as wages change. Manual mode anchors first-year taxes and applies separately entered marginal rates to wage changes. Salary/bonus sensitivity uses the same original tax anchors. No external tax engine or new tax-law assumptions were introduced.
- Show work cash per hour separately from retirement contributions and pensions. Job type describes the salary assumption; changing the label does not invent a new salary benchmark. 1099 requires manual total-tax estimates and net business compensation.
- Career paths count the entered tail once when civilian work ends, if that year lies within the shared horizon. The shorter existing comparison retains annualized tail. Spread the entered total incremental GI Bill value across each stay path's service years, conditional on verified eligibility, rather than multiplying a short-period annual equivalent indefinitely.

## Decision tools and reproducibility

Salary and annual-bonus break-even values use bracketed numerical searches with explicit limits and a no-crossing result. Deterministic sensitivity varies salary, discount, bonus, service years, and workload. These are conditional comparisons, not forecast probabilities or recommendations to separate.

Local saves and JSON exports record model/schema version, inputs, source links and vintages, user-entered salary date, timestamps, and results. Import requires the matching model version and recalculates results. CSV exports contain annual career cash flows. No LES file is saved or exported; pay amounts already applied to the form are included. New scenario features do not send inputs to a server.

## Limits

The tax schedule is not household tax preparation: spouse income, credits, retirement deferrals, special residency treatment, and a full self-employment tax calculation are absent. Pension uses flat assumed tax, annual timing, and either fixed or life-table payment years; it does not survival-weight each payment. Reserve pension applies only to the leave-now alternative. Promotions, career availability, future benefits, GI Bill eligibility, post-service health changes, and retirement ages need user verification. Monte Carlo, investment-account depletion, and Social Security remain outside this change.

## Validation

Existing calculation and special-pay tests, new independent pension/discount reconciliation tests, tax/bonus/promotion checks, shared-horizon and post-retirement checks, threshold and workload checks, and one-time cost checks pass. Browser checks cover save/load, JSON round-trip, CSV, invalid-result clearing, 1099 manual mode, post-20 retirement, mobile container width, Quick/full parity under identical inputs, and page errors. No paper prose, paper analysis, or empirical retention estimates were changed.
