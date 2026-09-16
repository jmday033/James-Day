---
type: spec
capability: economic-research
engagement: research-paper
date: 2026-09-16
status: draft
---

# Economic research — model specification

## Purpose

Support a decision about Navy primary care physician retention bonuses in San Diego. Compare the gross cash compensation of eligible Navy general pediatricians, general internists, and family physicians with civilian benchmarks, then assess a flat $100,000 annual bonus and a specialty-specific schedule that closes 50% of each current pay gap. Compare those pay policies with assignment predictability and protected specialty practice as plausible nonbonus strategies. The model must show what each policy costs per eligible physician and how much of the modeled pay gap remains. It must also assess the incremental value of pension eligibility, health coverage, and GI Bill rights in the stay-versus-leave decision. It cannot, without retention data, show how many physicians either policy would retain.

This spec implements the question and hypothesis in [the committed research brief](../../docs/briefs/research-brief.md). The four-year agreement is an eligibility and commitment assumption; the amounts below are annual.

## Inputs — the named contract

The main scenario is a board-certified O-4 physician with more than 10 years of service, with dependents, assigned to ZIP 92134 and eligible for a four-year retention bonus. Each input below has a name, value, unit, and source. Dollar amounts from different years are compared as nominal amounts; the civilian series is a benchmark, not a San Diego offer.

| Name | Value | Unit | Source |
| --- | ---: | --- | --- |
| MONTHS | 12 | months/year | Annualization convention |
| BASE_PAY_O4_10 | 9,420 | USD/month | [DFAS 2026 basic pay](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/) |
| BAH_92134_WITH | 5,082 | USD/month | [DTMO 2026 BAH lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/); inputs: 2026, 92134, O-4, with dependents |
| BAH_92134_WITHOUT | 4,440 | USD/month | Same [DTMO lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/); without dependents |
| BAS_OFFICER | 328.48 | USD/month | [DoD 2026 BAS](https://militarypay.defense.gov/Pay/Allowances/BAS/) |
| IP_PRIMARY | 43,000 | USD/year | [Navy FY2026 Medical Corps special pay guidance](https://www.med.navy.mil/Special-Pays/) |
| BCP | 8,000 | USD/year | [Navy FY2026 Medical Corps special pay guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_PEDS | 35,000 | USD/year | Four-year general pediatrics retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_IM | 48,000 | USD/year | Four-year general internal medicine retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| RB_FM | 48,000 | USD/year | Four-year family medicine retention bonus, [Navy FY2026 guidance](https://www.med.navy.mil/Special-Pays/) |
| CIV_PEDS | 273,665 | USD/year | National 2025 survey average, [Doximity 2026 report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| CIV_IM | 339,274 | USD/year | Same national [Doximity report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| CIV_FM | 325,040 | USD/year | Same national [Doximity report](https://www.doximity.com/reports/physician-compensation-report/2026) |
| FLAT_RB | 100,000 | USD/year | Author's proposed test amount in [research brief](../../docs/briefs/research-brief.md); hypothetical, not currently authorized pay |
| GAP_SHARE | 0.50 | share of current gross gap | Author's proposed policy comparison; a design assumption, not an estimated elasticity |
| COMMITMENT | 4 | years | Four-year bonus schedule used for the comparison |

Benefits inputs to collect before assigning dollar values:

| Name | Value | Unit | Source |
| --- | --- | --- | --- |
| RETIREMENT_SYSTEM | Unknown for target cohort: legacy High-36 or BRS | category | Verify personnel record; [DoD retirement overview](https://militarypay.defense.gov/Pay/Retirement/) |
| SERVICE_YEARS_AT_DECISION | Illustrative 10+; exact years unknown | years | Verify personnel record; [DoD active-duty retirement eligibility](https://militarypay.defense.gov/Pay/Retirement/ActiveDuty/) |
| GI_TRANSFER_STATUS | Unknown: no transfer, transfer pending, or obligation completed | category | Verify milConnect record; [VA transfer rules](https://benefits.va.gov/gibill/post911_transfer.asp) |
| FAMILY_COVERAGE | Main profile has dependents; plan and use unknown | category | Verify household and plan; [TRICARE 2026 costs](https://newsroom.tricare.mil/News/TRICARE-News/Article/4328806/learn-your-2026-tricare-health-plan-costs) |
| CIV_HEALTH_OFFER | Unknown | USD/year in premiums and expected out-of-pocket cost | Obtain a comparable civilian offer; do not assume no employer coverage |
| DISCOUNT_RATE | Not yet selected | annual share | Author's stated present-value assumption, if benefits are monetized |

Context sources: [GAO's staffing report](https://www.gao.gov/products/gao-25-106988) provides a DOD-wide personnel trend, not a San Diego Navy physician retention rate; [GAO's incentives report](https://www.gao.gov/products/gao-20-165) explains data limitations; [MCCareer.org's pay-plan account](https://mccareer.org/2024/09/28/fy25-medical-corps-pay-plan/) supplies practitioner context. Verify policy dollar amounts against official Navy guidance. Seek local specialty-specific offers or a reliable San Diego wage series for sensitivity analysis; never relabel national data as local data.

## Structure

1. **Source and assumptions register.** Record each named input, source URL, publication or pay year, lookup choices, and verification date. Keep assumptions distinct from observed figures.
2. **Compensation comparison.** One row per specialty, with current Navy cash pay, national civilian benchmark, gross pay gap, flat-bonus result, 50%-gap schedule result, and annual bonus cost above the current schedule.
3. **Benefits comparison.** Identify which retirement, health, and education benefits change if an eligible physician stays for the proposed agreement rather than leaving now. Show benefit eligibility and direction first; monetize only when the required person-specific inputs are known. Evaluate a separate physician near 20 years of service if discussing the pension cliff; do not apply that value to the main O-4 over-10 profile without changing its pay and service assumptions.
4. **Sensitivity checks.** Recalculate with BAH_92134_WITHOUT and with any credible local civilian benchmark found. Do not silently substitute a different grade, service year, or dependency status.
5. **Figure.** A grouped bar chart in figures/ showing current Navy pay, pay under the 50%-gap schedule, and the civilian benchmark for each specialty. Show the flat $100,000 case in a companion table or figure annotation if legible. Caption the officer profile and source years.
6. **Policy comparison.** Compare the pay cases with the nonbonus options below. For each, state the economic mechanism, practical constraint, observable outcome, and strength of supporting evidence. The source material identifies concerns or institutional priorities; it does not establish that the proposed interventions cause retention.
7. **Paper evidence.** Cite the model and figure in the author's dated draft and finished analysis/research-paper.pdf. Keep the paper's prose, recommendation, and reflection author-written.

### Nonbonus policy options to examine

| Option | Why it might change the decision to stay | Source and evidence limit | What to measure if piloted |
| --- | --- | --- | --- |
| More predictable assignments | Earlier notice and more choice over location could lower the family and career cost of remaining in service, even with unchanged pay. | A [White Coat Investor physician account](https://www.whitecoatinvestor.com/medical-school-and-hpsp/) describes limited autonomy and location stability. It is one person's experience, not an estimate of retention effects. [GAO's 2025 staffing report](https://www.gao.gov/products/gao-25-106988) describes coordination and notification for medical personnel assignments, but does not test a retention guarantee. | Assignment notice time, desired-location matches, unplanned moves, eligible-physician retention; record mission-driven exceptions. |
| Protected specialty practice and clinical development | Reliable time practicing pediatrics, internal medicine, or family medicine may raise the professional value of staying and preserve clinical skills. | [Navy Medical Corps community values, hosted by MCCareer](https://mccareer.org/wp-content/uploads/2025/01/fy26_ac_staff_community_briefs.pdf), emphasize active specialty practice, skill maintenance, education, and balancing clinical with operational service. An older [GAO physician survey](https://www.gao.gov/products/t-hrd-89-10) reports that opportunity to practice one's specialty was an inducement to stay; its 1989 responses should not be treated as current effect sizes. | Clinical days and patient volume by specialty, training access, physician-reported clinical confidence, and retention at the next decision point. |
| Better administrative support, if feasible | More reliable staffing or fewer avoidable administrative tasks could reduce the nonpay cost of Navy practice. | The [1989 GAO survey](https://www.gao.gov/products/t-hrd-89-10) identified inadequate health and administrative support as a concern. This is a hypothesis to retest locally, not a current measured driver. | Administrative hours, support staffing, burnout or job-satisfaction measures, and subsequent retention. |

The strongest policy comparison for the paper is targeted bonus versus predictable assignment, with protected clinical practice as a possible complement. [GAO's physician-gap review](https://www.gao.gov/products/gao-18-77) calls for coordinated recruitment, training, and retention strategies with metrics; it does not prescribe one of these specific local interventions.

## Calculation logic

Use named inputs, not spreadsheet cell positions. Apply the same baseline to all three specialties; substitute RB_s and CIV_s for each specialty s in pediatrics, internal medicine, and family medicine.

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

If showing four-year nominal cost per physician, multiply the annual incremental bonus by COMMITMENT. Do not call this a present value or total program budget. Actual program spending also depends on eligibility, uptake, timing, and number of physicians.

## Conventions

- Compare the *incremental* value of staying with the incremental value of leaving at the same decision date. A benefit already earned under both choices is part of total compensation history but is not a new retention incentive. Do not add the full lifetime value of a pension, TRICARE, or GI Bill to one year of Navy cash pay.
- Active-duty retirement generally requires 20 years of service. Legacy High-36 and BRS use different pension multipliers; BRS also has portable TSP contributions. For any pension estimate, state the retirement system, service years at decision and retirement, projected high-36 basic pay, probability of reaching retirement, discount rate, taxes, and years of benefit payments. Compare the expected present value under stay and leave paths. [DoD retirement overview](https://militarypay.defense.gov/Pay/Retirement/) and [active-duty eligibility](https://militarypay.defense.gov/Pay/Retirement/ActiveDuty/) govern the rule, not a generic pension percentage.
- For health coverage, compare household premiums and expected out-of-pocket spending under TRICARE with an actual or stated civilian employer plan; distinguish active-duty from retiree coverage. The [2026 TRICARE cost tables](https://newsroom.tricare.mil/News/TRICARE-News/Article/4328806/learn-your-2026-tricare-health-plan-costs) report different costs by status and plan.
- For the Post-9/11 GI Bill, distinguish the member's already-earned education entitlement from the possible *incremental* value of transferring unused benefits to dependents. [VA's transfer rules](https://benefits.va.gov/gibill/post911_transfer.asp) generally require an approved transfer while serving, at least six years of service, and a four-year additional commitment; eligibility, transfer status, dependent use, and any remaining obligation must be checked. Do not count the full GI Bill value as lost upon civilian separation when it is already vested.
- Keep full precision in the calculation and round displayed dollars only at output. A policy proposal may round total annual bonuses to practical amounts, but the check figures below use unrounded values.
- A negative gross gap means modeled Navy gross cash pay exceeds the national civilian benchmark. It is not evidence that the specialty is overcompensated.
- “Close 50% of the gap” means add half of a positive current gap to the existing annual retention bonus. It does not mean set Navy pay to 50% of civilian pay. The model's current Navy pay already exceeds that share in all three specialties.
- The civilian averages are survey estimates, not offers to an individual San Diego physician. The comparison excludes tax treatment, pension value, insurance, hours, malpractice costs, deployment, assignment control, and clinical duties.
- Do not infer actual labor-supply elasticity or a causal retention effect from pay gaps. Assignment predictability and clinical practice opportunities change the nonpay value of staying and may complement bonuses. WCI personal accounts and the 1989 GAO survey are hypothesis sources, not contemporary causal estimates. Compare observed retention gains per dollar only if appropriate physician-level data become available.
- The author decides whether the final recommendation favors a flat bonus, a specialty-specific schedule, assignment reform, or a combination. This specification sets comparison cases; it does not decide the policy.

## Validation rules

The benefits layer must either use verified personal inputs and a transparent stay-versus-leave present-value comparison, or mark pension, health, and GI Bill values as unpriced. Check that no already-earned benefit is counted as newly created by a bonus agreement. A four-year contract starting around 10 years of service does not by itself reach the 20-year active-duty retirement threshold.

The main profile must produce NAVY_BASE = $228,965.76. Independent hand arithmetic and the implemented model should agree to the cent before a figure is published.

| Specialty | NAVY_CURRENT | CIV | GAP_CURRENT | NAVY_FLAT | GAP_FLAT | RB_HALF | NAVY_HALF | GAP_HALF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pediatrics | $263,965.76 | $273,665 | $9,699.24 | $328,965.76 | −$55,300.76 | $39,849.62 | $268,815.38 | $4,849.62 |
| Internal medicine | $276,965.76 | $339,274 | $62,308.24 | $328,965.76 | $10,308.24 | $79,154.12 | $308,119.88 | $31,154.12 |
| Family medicine | $276,965.76 | $325,040 | $48,074.24 | $328,965.76 | −$3,925.76 | $72,037.12 | $301,002.88 | $24,037.12 |

For the without-dependents case, lower BAH must lower each Navy cash-pay figure by $7,704 annually and raise each corresponding gross gap by $7,704, holding the bonus fixed. Every figure bar must reconcile to the model table. The chart needs labeled dollars, a zero baseline, a readable legend, source years, and the national-versus-local caveat. No caption may claim measured retention or elasticity.

A finished paper passes the assignment checks when it: identifies why retention is a current problem and who is affected; uses the course concepts of opportunity cost, incentives, labor supply, elasticity, and marginal policy cost correctly; analyzes present implications and conditional future outcomes; makes a recommendation and answers the strongest objection; uses at least one substantive figure; verifies every AI-supplied number; and follows the [research-paper requirements](https://adamwstauffer.github.io/ai-lms/research-paper.html) for length, formatting, citations, anonymity, and submission. The four-page limit excludes title page, graphs, bibliography, and appendix.

## Outputs

- A transparent specialty-level cash-compensation table and sensitivity results supporting the author's analysis.
- A separate benefits table showing eligibility, whether each benefit is already earned, the incremental stay-versus-leave value if estimable, and the missing inputs when it is not.
- A labeled figure saved in figures/ and used as evidence in the paper.
- A concise policy comparison table that states the evidence limit and measurable outcome for each nonbonus option.
- A dated draft chain in drafts/YYYY-MM-DD-draft.md, created by the author as the argument develops.
- The finished paper at analysis/research-paper.pdf, with a separate bibliography and no repository URL or identifying information on body pages.
- An updated prompt-log.md recording AI-assisted research, checks, errors, and the author's final reflection.

## Audit findings

Pending build. After the table and figure exist, record each check performed, the result, and any correction. Retain unresolved source or comparability limits here rather than treating a passed arithmetic check as proof of a retention effect.
