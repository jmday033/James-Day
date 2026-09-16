---
type: spec
capability: economic-research
engagement: research-paper
date: 2026-09-16
status: draft
---

# Economic research specification: Navy primary care physician retention in San Diego

## Decision and scope

Test whether a larger annual retention bonus is a plausible way to improve retention of eligible Navy physicians serving in the San Diego area. Compare general pediatrics, general internal medicine, and family medicine separately. The policy case is an illustrative four-year agreement paying a $100,000 annual retention bonus. The comparison is a more predictable assignment program. The finished paper should recommend whether to pursue a targeted bonus, and under what conditions.

The decision concerns the next retention contract for a physician who can choose between remaining in Navy service and pursuing civilian work. This is a prospective economic argument, not an estimate of how many San Diego physicians have already left.

## Economic mechanism and predictions

The relevant course concepts are opportunity cost, labor supply, incentives, elasticity, and marginal analysis. A civilian job offers an outside option whose value includes pay, location control, working conditions, and flexibility. A Navy retention bonus raises the reward for staying. If physicians are responsive to the pay gap, a larger bonus should increase retention. The response may differ across specialties because their civilian opportunities and current Navy bonuses differ.

A separate assignment policy can also raise the value of staying by reducing the expected cost of moves and uncertainty. Compare these policies on expected retention gained per dollar, including program costs, and recognize that assignment predictability may complement pay.

Prediction: A meaningful increase in annual retention bonuses will improve retention among eligible San Diego Navy primary care physicians more than assignment predictability alone when pay is the binding reason for exit. The effect should be largest in specialties with the largest remaining civilian pay opportunity, holding other job attributes constant. An observation of little or no retention change after a substantial, well-targeted bonus increase, especially alongside better results from assignment reform, would weaken this prediction.

## Data sources and extraction plan

| Input | Source | Use and limitation |
| --- | --- | --- |
| FY2026 Navy Medical Corps incentive pay, board certification pay, and four-year retention bonus schedule | [Navy Medical Corps special pay guidance](https://www.med.navy.mil/Special-Pays/) and [DFAS health professions pay table](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/HPO4/) | Confirm eligibility and current specialty-specific amounts. General pediatrics has a $35,000 annual four-year bonus; general internal medicine and family medicine each have $48,000. All three have $43,000 incentive pay and $8,000 board certification pay. |
| 2026 O-4 basic pay, over 10 years of service | [DFAS basic pay](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/) | $9,420 per month in the illustrative profile. Verify the member's actual grade and years of service before applying the estimate to a real person. |
| 2026 San Diego housing allowance | [Defense Travel Management Office BAH lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/) | Query year 2026, ZIP 92134, O-4: $5,082 per month with dependents; $4,440 without dependents. The ZIP and dependency status are assumptions, not a single rate for all San Diego physicians. |
| 2026 officer subsistence allowance | [DoD BAS rate](https://militarypay.defense.gov/Pay/Allowances/BAS/) | $328.48 per month. |
| Civilian physician compensation | [Doximity 2026 Physician Compensation Report](https://www.doximity.com/reports/physician-compensation-report/2026) | National 2025 survey averages: pediatrics $273,665; internal medicine $339,274; family medicine $325,040. Use as transparent benchmarks, not San Diego-specific offers. If credible local specialty offers or wage data are found, add them as a sensitivity case rather than silently replacing the national series. |
| Staffing context and data quality | [GAO military medical personnel report](https://www.gao.gov/products/gao-25-106988) and [GAO incentive oversight report](https://www.gao.gov/products/gao-20-165) | The reported FY2015–2023 personnel decline covers all DOD military medical occupations, not San Diego Navy primary care. GAO identifies data gaps that prevent a reliable public estimate of the retention response to bonuses. |
| Current policy explanation | [MCCareer FY25 Medical Corps pay plan](https://mccareer.org/2024/09/28/fy25-medical-corps-pay-plan/) | Practitioner context for pay changes; verify dollar amounts against official FY2026 tables. |

## Model and calculation checks

Use one stated illustrative profile for the main figure: board-certified O-4 with more than 10 years of service, with dependents, based at ZIP 92134, eligible for a four-year retention bonus. All amounts are annual gross cash compensation. The model does not value tax treatment, retirement benefits, insurance, hours worked, deployment, malpractice costs, or differences in clinical duties.

    Baseline Navy cash pay before retention bonus
      = 12 × (monthly basic pay + monthly BAH + monthly BAS)
        + incentive pay + board certification pay

    Current Navy cash pay = baseline Navy cash pay + current specialty retention bonus
    Proposed Navy cash pay = baseline Navy cash pay + $100,000
    Gross pay gap = national civilian benchmark − Navy cash pay
    Bonus for gross cash parity = national civilian benchmark − baseline Navy cash pay

For the stated profile, baseline Navy cash pay before the retention bonus is $228,965.76. Reproduce these checks before publishing a figure:

| Specialty | Current Navy cash | National civilian benchmark | Current gap | Navy cash with $100,000 bonus | Gap after proposal | Bonus for gross parity |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Pediatrics | $263,965.76 | $273,665 | $9,699.24 | $328,965.76 | −$55,300.76 | $44,699.24 |
| Internal medicine | $276,965.76 | $339,274 | $62,308.24 | $328,965.76 | $10,308.24 | $110,308.24 |
| Family medicine | $276,965.76 | $325,040 | $48,074.24 | $328,965.76 | −$3,925.76 | $96,074.24 |

A flat $100,000 bonus nearly reaches the national internal medicine benchmark, roughly reaches the family medicine benchmark, and exceeds the national pediatrics benchmark in gross cash terms. That result supports analyzing specialty-specific bonus levels. It does not establish the bonus needed to induce an individual to stay. Repeat the arithmetic using the without-dependents BAH rate and, if obtained, local civilian pay estimates.

## Figures to build

1. A grouped bar chart by specialty with three bars: current Navy gross cash pay, Navy gross cash pay under a $100,000 annual bonus, and the national civilian benchmark. State the O-4 profile, 2026 military pay year, civilian survey year, and national-versus-local caveat in the caption. Label dollars clearly and include a zero baseline.
2. If space permits, a small sensitivity table showing how the pay gap changes under without-dependents BAH and at plausible lower bonus levels. Do not imply that these scenarios measure actual retention elasticity.

## Evidence needed for a causal retention claim

If the Navy provides de-identified eligible-physician records, define retention as remaining through the next contract decision or another stated horizon. For each specialty, compare retention rates before and after a bonus change, ideally against a suitable group facing a different bonus change, while checking assignment policy, location, service obligation, rank, and career stage. Report group sizes, time windows, and uncertainty. If such data are unavailable, label the work a compensation-gap and incentive analysis, and make the retention effect a testable hypothesis rather than a measured result.

## Policy comparison and objection

Evaluate a targeted bonus schedule rather than assuming the same $100,000 level is efficient for all three specialties. Compare its expected cost and retention effect with assignment predictability. The obvious objection is that higher bonuses may pay physicians who would have stayed anyway and leave nonpay reasons for departure untouched. Respond by making eligibility and amounts specialty-sensitive, measuring retention among those at an actual decision point, and revising the schedule if the observed effect is small. The paper should also acknowledge that civilian pay is only one part of the outside option.

## Success criteria for the finished paper

- The challenge is specific to Navy primary care retention in San Diego, with pediatrics, internal medicine, and family medicine treated separately.
- At least one course concept explains the choice mechanism correctly; the paper distinguishes pay gaps from an estimated elasticity.
- Every numeric claim has an attributable source, year, unit, and stated assumption. GAO's DOD-wide staffing measure is not presented as a San Diego Navy physician retention rate.
- At least one substantive figure passes the arithmetic checks above and has a readable caption.
- A policy recommendation states when targeted bonuses should work, addresses the cost and assignment-program objection, and names an observation that would overturn the prediction.
- The submitted paper follows the assignment's four-page body limit, double-spaced 12-point Times New Roman, one-inch margins, title page, anonymous body, and consistent citations and bibliography.
- The author writes and reviews the final paper prose; the research workflow and AI assistance are recorded in the prompt log.

## Open items

Confirm the applicable rank, service years, dependent status, and special-pay eligibility for the intended physician population. Find local civilian offers or a defensible San Diego wage series if available. Request Navy retention data if the argument needs an observed effect instead of a prediction.
