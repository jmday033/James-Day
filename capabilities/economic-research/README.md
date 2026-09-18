---
type: capability
capability: economic-research
engagement: research-paper
date: 2026-09-16
status: in-progress
---

# Economic research

This capability studies Navy primary-care physician retention in San Diego as a local labor-market case within a Pacific medical-readiness challenge. Naval Medical Forces Pacific is headquartered in San Diego and supports commands across the region. The project compares current compensation for general pediatrics, general internal medicine, and family medicine while keeping pay gaps, retention behavior, and readiness outcomes distinct.

**Exercised in:** [research brief](../../docs/briefs/research-brief.md) · [model specification](spec.md) · [12-row analysis](../../analysis/physician-retention-analysis.md) · [cumulative-gap figure](../../figures/physician-retention-cumulative-gap.svg) · [working decision memo](../../docs/decisions/physician-retention-economics-memo.md) · [author-supplied paper draft](../../docs/papers/navy-primary-care-physician-retention-draft.md). The finished research-paper PDF will be linked when available.

The [course economics crosswalk](course-economics-crosswalk.md) maps relevant chapters of Frank et al.'s *Principles of Economics* (4th ed.) to the paper and model. It separates textbook decision rules from empirical Navy pay and retention evidence.

The brief records the author's question and falsifiable hypothesis. The spec defines sources, named inputs, calculations, figure requirements, and acceptance checks. The September 2026 paper draft preserves the author's fixed O-5 scenario and recommendation. Its embedded cash-pay figure is transcribed as an accessible table in the GitHub version. The draft uses a 4% discount rate and $239,000 Navy cash figure, which differ from the interactive lab's default scenario. Its source citations, retention-elasticity application, and present-value timing still need checking before submission; one reference remains a placeholder. It is a draft, not a verified output of the live lab.

The [interactive Physician Pay Gap Lab](physician-pay-lab.html) is a supplemental sensitivity tool. It accepts rank, physician, civilian-pay, and benefit assumptions and calculates a present-value financial gap and year-by-year cash comparison under current compensation. Its San Diego Marit benchmarks are citywide, not ZIP-specific. The lab maps any duty-station ZIP in the 2026 DoD BAH crosswalk to the relevant housing area and fills BAH for O-4 through O-6; unmapped ZIPs require a verified manual amount. It can also compare a conditional active-duty pension with an optional Reserve pension, using projected points and pay-start age. The lab does not estimate retention or operational-readiness effects.

The [Quick Look](quick-lab.html) now includes a separate GMO-to-residency illustration for family medicine, pediatrics, and internal medicine. It compares national PGY-level civilian stipends with Navy resident cash, then compares national specialty attending benchmarks with three years of Navy service. A completed intern year may leave two residency years rather than three; the user selects whether PGY-1 credit is granted. The three-year post-training obligation is an illustration, not a determination of individual obligated service. [Navy GME policy](https://www.med.navy.mil/Portals/62/Documents/BUMED/Directives/Instructions/1524.1D.pdf?ver=eVEhcqPIO1Neu4s7m4Xskw%3D%3D) requires BUMED to calculate it before training. The illustration excludes taxes, pension, TSP, health benefits, certification pay, and retention bonuses.

The operational link is documented in the [Naval Medical Forces Pacific region](https://www.med.navy.mil/Naval-Medical-Forces-Pacific/Region/) and [mission](https://www.med.navy.mil/Naval-Medical-Forces-Pacific/Region/Mission/) pages; the project still needs specialty-level staffing and deployment outcomes before claiming a readiness effect.

The [working economics memo](../../docs/decisions/physician-retention-economics-memo.md) connects the pay-gap analysis to opportunity cost, incentives, marginal analysis, present value, compensating wage differentials, and labor-supply elasticity.
