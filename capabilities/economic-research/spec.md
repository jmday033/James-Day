---
type: spec
capability: economic-research
engagement: research-paper
date: 2026-09-16
status: built
built_with: "Python reproducible comparison script and interactive HTML lab"
---

# Economic research — model specification

## Purpose

Support a decision about Navy primary care physician retention bonuses in San Diego. Compare the gross cash compensation of eligible Navy general pediatricians, general internists, and family physicians with published San Diego city and national compensation benchmarks, then assess a flat $100,000 annual bonus and a specialty-specific schedule that closes 50% of each current pay gap. Compare those pay policies with assignment predictability and protected specialty practice as plausible nonbonus strategies. The model must show what each policy costs per eligible physician and how much of the modeled pay gap remains. It must also assess the incremental value of pension eligibility, health coverage, and GI Bill rights in the stay-versus-leave decision. It cannot, without retention data, show how many physicians either policy would retain.

This spec implements the question and hypothesis in [the committed research brief](../../docs/briefs/research-brief.md). The comparison horizon is the next four calendar years, 2027–2030, for a hypothetical agreement beginning January 2027. The four-year agreement is an eligibility and commitment assumption; the amounts below are annual.

## Inputs — the named contract

The main scenario is a board-certified O-4 physician just past 10 years of service at the start of 2027, with dependents, assigned to ZIP 92134 and eligible for a four-year retention bonus. The profile reaches the over-12 basic-pay step at the start of Year 3, while remaining O-4 throughout. This is an illustrative timing assumption, not a claim about a particular physician's service date. Each input below has a name, value, unit, and source. The Marit series is a San Diego city benchmark, not a ZIP 92134 estimate or an individual civilian offer. The Doximity series is national. Neither is a verified civilian-only cohort.

| Name | Value | Unit | Source |
| --- | ---: | --- | --- |
| MONTHS | 12 | months/year | Annualization convention |
| BASE_PAY_O4_10 | 9,420 | USD/month, contract years 1–2 | [DFAS 2026 basic pay](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/) |
| BASE_PAY_O4_12 | 9,888.30 | USD/month, contract years 3–4 | Same [DFAS 2026 O-4 pay table](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/) |
| BAH_92134_WITH | 5,082 | USD/month | [DTMO 2026 BAH lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/); inputs: 2026, 92134, O-4, with dependents |
| BAH_92134_WITHOUT | 4,440 | USD/month | Same [DTMO lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/); without dependents |
| BAS_OFFICER | 328.48 | USD/month | [DoD 2026 BAS](https://militarypay.defense.gov/Pay/Allowances/BAS/) |
| IP_PRIMARY | 43,000 | USD/year | [Navy FY2026 Medical Corps special pay guidance](https://www.med.navy.mil/Special-Pays/) |
| BCP | 8,000 | USD/year | [Navy FY2026 Medical Corps special pay guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_PEDS | 35,000 | USD/year | Four-year general pediatrics retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_IM | 48,000 | USD/year | Four-year general internal medicine retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_FM | 48,000 | USD/year | Four-year family medicine retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| MARIT_PEDS_SD | 303,974 | USD/year, published San Diego benchmark | [Marit pediatrician page](https://www.marithealth.com/o/-/pediatrician/salary/san-diego-ca), updated Aug 28, 2026 |
| MARIT_IM_SD | 459,057 | USD/year, published San Diego benchmark | [Marit internist page](https://www.marithealth.com/o/-/internist/salary/san-diego-ca), updated Apr 30, 2026 |
| MARIT_FM_SD | 373,038 | USD/year, published San Diego benchmark | [Marit family medicine page](https://www.marithealth.com/o/-/family-medicine-physician/salary/san-diego-ca), updated Jun 5, 2026 |
| CIV_PEDS | 273,665 | USD/year | National 2025 survey average, [Doximity 2026 report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| CIV_IM | 339,274 | USD/year | Same national [Doximity report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| CIV_FM | 325,040 | USD/year | Same national [Doximity report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| FLAT_RB | 100,000 | USD/year | Author's proposed test amount in [research brief](../../docs/briefs/research-brief.md); hypothetical, not currently authorized pay |
| GAP_SHARE | 0.50 | share of current gross gap | Author's proposed policy comparison; a design assumption, not an estimated elasticity |
| FULL_GAP_SHARE | 1.00 | share of current gross gap | Analytical full cash-gap closure benchmark, not an evidence-based retention threshold |
| COMMITMENT | 4 | years | Four-year bonus schedule used for the comparison |

Benefits inputs to collect before assigning dollar values:

| Name | Value | Unit | Source |
| --- | --- | --- | --- |
| RETIREMENT_SYSTEM | Unknown for target cohort: legacy High-36 or BRS | category | Verify personnel record; [DoD retirement overview](https://militarypay.defense.gov/Pay/Retirement/) |
| SERVICE_YEARS_AT_DECISION | Just over 10 at January 2027 in main scenario; exact years for real physicians unknown | years | Verify personnel record; [DoD active-duty retirement eligibility](https://militarypay.defense.gov/Pay/Retirement/ActiveDuty/) |
| GI_TRANSFER_STATUS | Unknown: no transfer, transfer pending, or obligation completed | category | Verify milConnect record; [VA transfer rules](https://benefits.va.gov/gibill/post911_transfer.asp) |
| FAMILY_COVERAGE | Main profile has dependents; plan and use unknown | category | Verify household and plan; [TRICARE 2026 costs](https://newsroom.tricare.mil/News/TRICARE-News/Article/4328806/learn-your-2026-tricare-health-plan-costs) |
| CIV_HEALTH_OFFER | Unknown | USD/year in premiums and expected out-of-pocket cost | Obtain a comparable civilian offer; do not assume no employer coverage |
| DISCOUNT_RATE | Not yet selected | annual share | Author's stated present-value assumption, if benefits are monetized |

Context sources: [GAO's staffing report](https://www.gao.gov/products/gao-25-106988) provides a DOD-wide personnel trend, not a San Diego Navy physician retention rate; [GAO's incentives report](https://www.gao.gov/products/gao-20-165) explains data limitations; [MCCareer.org's pay-plan account](https://mccareer.org/2024/09/28/fy25-medical-corps-pay-plan/) supplies practitioner context. Verify policy dollar amounts against official Navy guidance. Marit supplies city-level specialty figures, but the public pages do not provide a ZIP-level filter, and their all-employer cohorts include military entries. Seek civilian-only San Diego offers or a filtered cohort for validation; never relabel city data as ZIP data or mixed-employer data as civilian-only.

## Structure

1. **Source and assumptions register.** Record each named input, source URL, publication or pay year, lookup choices, and verification date. Keep assumptions distinct from observed figures.
2. **Compensation comparison.** One row per specialty using the published Marit San Diego city figure, with current Navy cash pay, gross benchmark gap, flat-bonus result, 50%-gap schedule result, and annual bonus cost above the current schedule. Keep the Doximity national series as a separate sensitivity comparison, not a blended average.
3. **Benefits comparison.** Identify which retirement, health, and education benefits change if an eligible physician stays for the proposed agreement rather than leaving now. Show benefit eligibility and direction first; monetize only when the required person-specific inputs are known. Evaluate a separate physician near 20 years of service if discussing the pension cliff; do not apply that value to the main O-4 over-10 profile without changing its pay and service assumptions.
4. **Sensitivity checks.** Recalculate with BAH_92134_WITHOUT, the national Doximity series, and any credible civilian-only local offers. Do not silently substitute a different grade, service year, or dependency status.
5. **Year-by-year table and figure.** Build a 12-row table: four contract years for each of the three specialties. For each year show the Marit city benchmark, Navy pay under the current bonus, flat $100,000 bonus, and 50%-gap bonus, plus cumulative gross cash gap and cumulative added Navy bonus cost. Years 1–2 use the 2026 O-4 over-10 basic-pay rate; Years 3–4 use the over-12 rate. Build one figure with three specialty panels and contract year on the x-axis, plotting cumulative gross cash gap under the three bonus cases. A horizontal zero line shows modeled cash parity. Caption the frozen-2026-dollar assumption, Marit update dates, city rather than ZIP geography, and mixed-employer caveat.
6. **Policy comparison.** Compare the pay cases with the nonbonus options below. For each, state the economic mechanism, practical constraint, observable outcome, and strength of supporting evidence. The source material identifies concerns or institutional priorities; it does not establish that the proposed interventions cause retention.
7. **Paper evidence.** Cite the model and figure in the author's dated draft and finished analysis/research-paper.pdf. Keep the paper's prose, recommendation, and reflection author-written.

### Nonbonus policy options to examine

| Option | Why it might change the decision to stay | Source and evidence limit | What to measure if piloted |
| --- | --- | --- | --- |
| More predictable assignments | Earlier notice and more choice over location could lower the family and career cost of remaining in service, even with unchanged pay. | A [White Coat Investor physician account](https://www.whitecoatinvestor.com/medical-school-and-hpsp/) describes limited autonomy and location stability. It is one person's experience, not an estimate of retention effects. [GAO's 2025 staffing report](https://www.gao.gov/products/gao-25-106988) describes coordination and notification for medical personnel assignments, but does not test a retention guarantee. | Assignment notice time, desired-location matches, unplanned moves, eligible-physician retention; record mission-driven exceptions. |
| Protected specialty practice and clinical development | Reliable time practicing pediatrics, internal medicine, or family medicine may raise the professional value of staying and preserve clinical skills. | [Navy Medical Corps community values, hosted by MCCareer](https://mccareer.org/wp-content/uploads/2025/01/fy26_ac_staff_community_briefs.pdf), emphasize active specialty practice, skill maintenance, education, and balancing clinical with operational service. An older [GAO physician survey](https://www.gao.gov/products/t-hrd-89-10) reports that opportunity to practice one's specialty was an inducement to stay; its 1989 responses should not be treated as current effect sizes. | Clinical days and patient volume by specialty, training access, physician-reported clinical confidence, and retention at the next decision point. |
| Better administrative support, if feasible | More reliable staffing or fewer avoidable administrative tasks could reduce the nonpay cost of Navy practice. | The [1989 GAO survey](https://www.gao.gov/products/t-hrd-89-10) identified inadequate health and administrative support as a concern. This is a hypothesis to retest locally, not a current measured driver. | Administrative hours, support staffing, burnout or job-satisfaction measures, and subsequent retention. |

The strongest policy comparison for the paper is targeted bonus versus predictable assignment, with protected clinical practice as a possible complement. [GAO's physician-gap review](https://www.gao.gov/products/gao-18-77) calls for coordinated recruitment, training, and retention strategies with metrics; it does not prescribe one of these specific local interventions.

## Additional public-source context and variables

Public [Medical Corps community values](https://mccareer.org/wp-content/uploads/2025/01/fy26_ac_staff_community_briefs.pdf) emphasize maintaining specialty practice, clinical skill competency, operational experience, and professional growth. A [2026 GAO review of military-civilian clinical partnerships](https://www.gao.gov/products/gao-26-107677) finds that such partnerships can provide clinical-readiness opportunities, but DOD does not yet have complete activity data to assess their contributions. These sources justify measuring the clinical value of service alongside pay; they do not establish a causal retention effect.

For any future physician-level test, collect the following **noncash covariates** at the decision date and during the agreement: preferred versus assigned duty location, assignment notice and moves, days practicing the primary specialty, clinical workload and partnership activity where applicable, training access, promotion timing and grade, and the physician's stated intention to stay. Match them to bonus eligibility, acceptance, actual separation, and post-obligation retention. Record promotion timing because the fixed table assumes O-4 throughout 2027–2030; a real O-5 promotion changes basic pay and may change BAH. Do not infer a promotion rate or claim that any clinical opportunity caused retention from the public sources alone.

## Calculation logic

Use named inputs, not spreadsheet cell positions. Apply the same baseline to all three specialties; substitute RB_s, CIV_s, and MARIT_s from the named specialty rows above. For the year-by-year table, policy means current (NAVY_CURRENT_s, RB_s), flat (NAVY_FLAT_s, FLAT_RB), or half-gap (MARIT_NAVY_HALF_s, MARIT_RB_HALF_s).

    NAVY_BASE = MONTHS × (BASE_PAY_O4_10 + BAH_92134_WITH + BAS_OFFICER)
                + IP_PRIMARY + BCP
    NAVY_CURRENT_s = NAVY_BASE + RB_s
    GAP_CURRENT_s = CIV_s − NAVY_CURRENT_s
    NAVY_FLAT_s = NAVY_BASE + FLAT_RB
    GAP_FLAT_s = CIV_s − NAVY_FLAT_s
    RB_HALF_s = RB_s + GAP_SHARE × MAX(0, GAP_CURRENT_s)
    NAVY_HALF_s = NAVY_BASE + RB_HALF_s
    GAP_HALF_s = CIV_s − NAVY_HALF_s
    INCREMENT_FLAT_s = FLAT_RB − RB_s
    INCREMENT_HALF_s = RB_HALF_s − RB_s
    RB_PARITY_s = CIV_s − NAVY_BASE
    MARIT_GAP_CURRENT_s = MARIT_s − NAVY_CURRENT_s
    MARIT_RB_HALF_s = RB_s + GAP_SHARE × MAX(0, MARIT_GAP_CURRENT_s)
    MARIT_NAVY_HALF_s = NAVY_BASE + MARIT_RB_HALF_s
    MARIT_GAP_FLAT_s = MARIT_s − NAVY_FLAT_s
    MARIT_RB_PARITY_s = RB_s + FULL_GAP_SHARE × MAX(0, MARIT_GAP_CURRENT_s)
    BASE_PAY_y = BASE_PAY_O4_10 for y = 1, 2; BASE_PAY_O4_12 for y = 3, 4
    NAVY_BASE_y = MONTHS × (BASE_PAY_y + BAH_92134_WITH + BAS_OFFICER)
                  + IP_PRIMARY + BCP
    NAVY_s,policy,y = NAVY_BASE_y + RB_s,policy
    CUM_GAP_s,policy,y = SUM over t = 1...y of (MARIT_s − NAVY_s,policy,t)
    CUM_ADDED_COST_s,policy,y = y × (RB_s,policy − RB_s)

The year-by-year table is an illustrative 2027–2030 comparison in constant 2026 dollars. It holds rank at O-4; promotion timing is a person-specific sensitivity that must be added before individual application. Apply the 2026 O-4 pay-table step at over 12 years, but hold 2026 BAH, BAS, specialty pays, and the latest 2026 Marit benchmark fixed. Lock each proposed four-year bonus amount at its Year 1 value. This is not a historical salary trend or a forecast of raises, promotion, BAH changes, civilian wage growth, or inflation. If a full forecast is later built, define future annual pay tables, grade, BAH, civilian growth, and discounting before replacing this convention.

If showing four-year nominal cost per physician, multiply the annual incremental bonus by COMMITMENT. Do not call this a present value or total program budget. Actual program spending also depends on eligibility, uptake, timing, and number of physicians.

## Conventions

- Compare the *incremental* value of staying with the incremental value of leaving at the same decision date. A benefit already earned under both choices is part of total compensation history but is not a new retention incentive. Do not add the full lifetime value of a pension, TRICARE, or GI Bill to one year of Navy cash pay.
- Active-duty retirement generally requires 20 years of service. Legacy High-36 and BRS use different pension multipliers; BRS also has portable TSP contributions. For any pension estimate, state the retirement system, service years at decision and retirement, projected high-36 basic pay, probability of reaching retirement, discount rate, taxes, and years of benefit payments. Compare the expected present value under stay and leave paths. [DoD retirement overview](https://militarypay.defense.gov/Pay/Retirement/) and [active-duty eligibility](https://militarypay.defense.gov/Pay/Retirement/ActiveDuty/) govern the rule, not a generic pension percentage.
- For health coverage, compare household premiums and expected out-of-pocket spending under TRICARE with an actual or stated civilian employer plan; distinguish active-duty from retiree coverage. The [2026 TRICARE cost tables](https://newsroom.tricare.mil/News/TRICARE-News/Article/4328806/learn-your-2026-tricare-health-plan-costs) report different costs by status and plan.
- For the Post-9/11 GI Bill, distinguish the member's already-earned education entitlement from the possible *incremental* value of transferring unused benefits to dependents. [VA's transfer rules](https://benefits.va.gov/gibill/post911_transfer.asp) generally require an approved transfer while serving, at least six years of service, and a four-year additional commitment; eligibility, transfer status, dependent use, and any remaining obligation must be checked. Do not count the full GI Bill value as lost upon civilian separation when it is already vested.
- Keep full precision in the calculation and round displayed dollars only at output. A policy proposal may round total annual bonuses to practical amounts, but the check figures below use unrounded values.
- A negative gross gap means modeled Navy gross cash pay exceeds the selected published benchmark. It is not evidence that the specialty is overcompensated.
- The 50% share is a scenario, not a research-derived point at which retention becomes likely. Full gross cash-gap closure is an analytical comparator, not proof of financial indifference, because pensions, healthcare, GI Bill rights, taxes, and civilian benefits may differ. Under a strict financial-only model, the relevant threshold is equality of expected present value of total financial compensation under stay and leave choices, not equality of one year's cash salary. “Close 50% of the gap” means add half of a positive current gap to the existing annual retention bonus. It does not mean set Navy pay to 50% of civilian pay. The model's current Navy pay already exceeds that share in all three specialties.
- Marit pages call the displayed figures averages, while [Marit's methodology](https://www.marithealth.com/salary/methodology) says weighted medians and percentiles are its primary measures. Label the numbers as published Marit benchmarks until the statistic is clarified; do not recalculate a median from the limited public preview. The city cohorts are small (the public pages show seven pediatricians and 14 family physicians) and include military entries. These self-reported benchmarks are not verified civilian-only offers. The comparison excludes tax treatment, pension value, insurance, hours, malpractice costs, deployment, assignment control, and clinical duties.
- Do not infer actual labor-supply elasticity or a causal retention effect from pay gaps. Assignment predictability and clinical practice opportunities change the nonpay value of staying and may complement bonuses. WCI personal accounts and the 1989 GAO survey are hypothesis sources, not contemporary causal estimates. Compare observed retention gains per dollar only if appropriate physician-level data become available.
- After reviewing the modeled comparisons, the author selected **specialty-targeted bonuses** as the policy to test in the working decision memo. The $100,000 flat bonus remains the precommitted brief hypothesis and a comparison case; the 50% schedule is the provisional targeted design, not a measured retention threshold. The final course-paper recommendation remains subject to the author's own source review and judgment.


### Evidence on pay responsiveness, not a universal threshold

[Gray and Grefer's military-physician study](https://www.tandfonline.com/doi/abs/10.1080/10242694.2011.562371) finds retention more responsive to compensation differences at the first unobligated decision than later in the career. A [Naval Postgraduate School thesis](https://calhoun.nps.edu/server/api/core/bitstreams/37692b4f-1ecd-4eab-a03c-72c7bcb12159/content) estimates a relationship between pay gaps and Navy Medical Corps retention using FY2002–FY2011 data. Neither establishes that closing 50% or 100% of a current San Diego primary-care cash gap is necessary or sufficient. An older [GAO physician survey](https://www.gao.gov/products/t-hrd-89-10) found many respondents said comparable civilian pay would increase their likelihood of staying, but that was a hypothetical response, not an observed parity threshold. [GAO's 2020 incentives review](https://www.gao.gov/products/gao-20-165) reports that DOD still lacked consistent bonus acceptance, replacement cost, and civilian wage data needed to set incentives empirically. Use these studies to motivate a positive pay-response hypothesis and a test across bonus amounts, not to assign an unsupported retention probability to the 50% scenario.


## Interactive compensation lab

The companion [Physician Pay Gap Lab](physician-pay-lab.html) lets a reader change specialty, duty ZIP, O-4 years of service, expected additional years, dependent status, current and proposed annual retention bonus, published civilian benchmark or actual offer, and optional retirement, health, and GI Bill assumptions. The live result is an **annual financial break-even bonus**, not an estimated retention probability. It also displays current and proposed Navy cash, the civilian benchmark, and a 2027–2030 constant-2026-dollar comparison.

Calculation for the active-year cash comparison:

    NAVY_CASH = 12 × (MONTHLY_BASIC_PAY + MONTHLY_BAH + BAS_OFFICER)
                + IP_PRIMARY + BCP + CURRENT_RB
    BENEFIT_ADJUSTMENT = HEALTH_COST_DIFFERENCE
                         + INCREMENTAL_GI_BILL_VALUE / EXPECTED_ADDITIONAL_YEARS
                         + CONDITIONAL_PENSION_ANNUITY
    EXTRA_BONUS_FOR_FINANCIAL_BREAK_EVEN =
        MAX(0, CIVILIAN_COMPENSATION − NAVY_CASH − BENEFIT_ADJUSTMENT)
    TOTAL_RB_FOR_FINANCIAL_BREAK_EVEN = CURRENT_RB + EXTRA_BONUS_FOR_FINANCIAL_BREAK_EVEN

The proposed bonus replaces the current bonus in the live comparison. The pension switch uses an intentionally simplified scenario: projected annual retirement pay is High-3 basic pay × years at retirement × 2.0% for BRS or 2.5% for legacy High-36; it then discounts a selected number of pension payments to the decision date and annualizes that present value over the expected additional service. It activates only when expected total service reaches 20 years and current service is still below 20; at 20 years or more, this simple lab assigns zero incremental pension value because accrued retirement rights are already vested and additional accrual is not modeled. This conditional estimate omits the probability of reaching retirement, TSP, taxes, survivor benefits, and COLA, so it is for sensitivity analysis only. The health field compares annual household costs under a civilian plan with TRICARE. The GI Bill field counts only dependent-transfer value that would actually be lost on separation, not an already-earned personal entitlement.

ZIP 92134 has a verified 2026 O-4 BAH amount with and without dependents. For any other ZIP, the user must enter an official BAH amount manually. The Marit compensation numbers are San Diego **citywide** benchmarks and do not change with ZIP; users should replace them with a comparable offer for another labor market. The public Marit samples are small and include mixed employer types. The lab fixes rank at O-4, uses 2026 basic-pay steps, and assumes board certification and eligibility for the cited special pays; individual eligibility must be checked. The four-year illustration is a fixed-dollar scenario, not a forecast or a guarantee of a future bonus contract.

**Figure workflow.** Use the lab to inspect sensitivity to pay, service time, and benefits. Freeze one explicitly named scenario for the graded paper's static, labeled figure and reproduce the results in the 12-row research table. The interactive page is a supplemental repository artifact; the anonymous PDF must stand on its own and contain no repository URL. Do not claim that the break-even bonus is the amount that will cause retention. That causal claim requires observed retention by bonus level or a credible estimate of the physician labor-supply response.

## Validation rules

The benefits layer must either use verified personal inputs and a transparent stay-versus-leave present-value comparison, or mark pension, health, and GI Bill values as unpriced. Check that no already-earned benefit is counted as newly created by a bonus agreement. A four-year contract starting around 10 years of service does not by itself reach the 20-year active-duty retirement threshold.

The main profile must produce NAVY_BASE = $228,965.76 in Years 1–2 and NAVY_BASE_y = $234,585.36 in Years 3–4. The $5,619.60 annual increase comes solely from the 2026 O-4 over-12 basic-pay step. These are fixed-dollar scenario checks, not actual 2029–2030 pay predictions. The existing Doximity check table below remains a national sensitivity case; it is not the main local comparison. Independent hand arithmetic and the implemented model should agree to the cent before a figure is published.

| Specialty | NAVY_CURRENT | CIV | GAP_CURRENT | NAVY_FLAT | GAP_FLAT | RB_HALF | NAVY_HALF | GAP_HALF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pediatrics | $263,965.76 | $273,665 | $9,699.24 | $328,965.76 | −$55,300.76 | $39,849.62 | $268,815.38 | $4,849.62 |
| Internal medicine | $276,965.76 | $339,274 | $62,308.24 | $328,965.76 | $10,308.24 | $79,154.12 | $308,119.88 | $31,154.12 |
| Family medicine | $276,965.76 | $325,040 | $48,074.24 | $328,965.76 | −$3,925.76 | $72,037.12 | $301,002.88 | $24,037.12 |


For a full Year 1 Marit cash-gap closure comparator, MARIT_RB_PARITY must be $75,008.24 for pediatrics, $230,091.24 for internal medicine, and $144,072.24 for family medicine. These are arithmetic amounts, not recommended or necessarily authorized bonuses.

The published Marit city scenario must also reproduce these checks before a year-by-year table or figure is published:

| Specialty | Marit city benchmark | Current Navy gap | Total bonus closing 50% of this gap | Remaining gap under flat $100,000 | Remaining gap under 50% schedule |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pediatrics | $303,974 | $40,008.24 | $55,004.12 | −$24,991.76 | $20,004.12 |
| Internal medicine | $459,057 | $182,091.24 | $139,045.62 | $130,091.24 | $91,045.62 |
| Family medicine | $373,038 | $96,072.24 | $96,036.12 | $44,072.24 | $48,036.12 |

The Marit internal medicine result differs sharply from the national sensitivity case. Treat it as a source-quality and comparability question, especially because the public local preview includes a military-contractor entry and does not disclose a clear local cohort count. Do not use the $459,057 figure as proof that a typical civilian internist in ZIP 92134 receives that pay.

With the Marit scenario and fixed Year 1 bonus choices, cumulative four-year gross cash gaps must be: pediatrics $148,793.76 current, −$111,206.24 flat, $68,777.28 half-gap; internal medicine $717,125.76 current, $509,125.76 flat, $352,943.28 half-gap; and family medicine $373,049.76 current, $165,049.76 flat, $180,905.28 half-gap. A negative gap means Navy modeled cash pay exceeds the Marit benchmark over four years.

For the without-dependents case, lower BAH must lower each Navy cash-pay figure by $7,704 annually and raise each corresponding gross gap by $7,704, holding the bonus fixed. Every plotted year and line must reconcile to the 12-row table. The chart needs labeled dollars, a zero line, a readable legend, 2027–2030 year labels, a constant-2026-dollar caption, source years, and the city-versus-ZIP and mixed-employer caveats. No caption may claim measured retention or elasticity.

A finished paper passes the assignment checks when it: identifies why retention is a current problem and who is affected; uses the course concepts of opportunity cost, incentives, labor supply, elasticity, and marginal policy cost correctly; analyzes present implications and conditional future outcomes; makes a recommendation and answers the strongest objection; uses at least one substantive figure; verifies every AI-supplied number; and follows the [research-paper requirements](https://adamwstauffer.github.io/ai-lms/research-paper.html) for length, formatting, citations, anonymity, and submission. The four-page limit excludes title page, graphs, bibliography, and appendix.

## Outputs

- A 12-row year-by-year cash comparison and a separate specialty-level source and sensitivity table supporting the author's analysis.
- A separate benefits table showing eligibility, whether each benefit is already earned, the incremental stay-versus-leave value if estimable, and the missing inputs when it is not.
- A labeled cumulative-gap-by-year figure saved in figures/ and used as evidence in the paper.
- A concise policy comparison table that states the evidence limit and measurable outcome for each nonbonus option.
- A dated draft chain in drafts/YYYY-MM-DD-draft.md, created by the author as the argument develops.
- The finished paper at analysis/research-paper.pdf, with a separate bibliography and no repository URL or identifying information on body pages.
- An updated prompt-log.md recording AI-assisted research, checks, errors, and the author's final reflection.

## Audit findings

The fixed cash model was built from this specification as [build_comparison.py](build_comparison.py). It generated the [12-row data table](../../data/physician-retention-12-row-comparison.csv), [technical analysis](../../analysis/physician-retention-analysis.md), and [cumulative-gap figure](../../figures/physician-retention-cumulative-gap.svg). The [interactive lab](physician-pay-lab.html) remains a separate sensitivity tool with user-entered benefit adjustments; it is not the static evidence figure.

| Check | Result | Follow-up |
| --- | --- | --- |
| Year 1–2 O-4 base cash: $228,965.76 | Passed to the cent | 2026 pay and allowance inputs held fixed |
| Year 3–4 O-4 base cash: $234,585.36 | Passed to the cent | Only the 2026 over-12 basic-pay step changes |
| Three cumulative four-year gap triplets in Validation rules | All passed to the cent | Values reconcile to the 12-row CSV and figure |
| Exactly three specialties × four years | Passed: 12 rows | Each policy uses the same baseline and benchmark within specialty |
| Without-dependents BAH sensitivity | Passed: Navy cash falls $7,704/year | The published figure uses with-dependents BAH |
| Source definitions | DFAS, DoD BAS, Navy special-pays guidance, Marit, and Doximity values are named and linked | Verify individual eligibility and any actual civilian offer before applying the model to a person |

**Open comparability limits.** Marit publishes a San Diego citywide, self-reported, all-employer figure; its internist public preview includes a military contractor and very different career stages. It is not an observed civilian-only offer or ZIP-specific median. Doximity is a national average and is shown only as a sensitivity check. Neither source supplies a measured Navy retention response. The model therefore calculates cash gaps and marginal bonus cost, not labor-supply elasticity, causal retention, total program cost, or cost per physician retained. Pension, health, and GI Bill values remain unpriced in the fixed base table because the person-specific stay-versus-leave inputs are missing.

**Corrections during build.** The figure labels negative gaps as values below zero and states that each specialty panel has its own dollar scale. The first chart draft formatted negative ticks as “$-100k”; the regenerated figure uses “-$100k.” A later table review found the same sign placement in negative dollar cells; the regenerated analysis displays “-$24,991.76” rather than “$-24,991.76.” These presentation corrections did not alter any calculation.
