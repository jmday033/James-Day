# Navy Physician Compensation, Opportunity Cost, and Retention

One project for the compensation model, research paper, and retention-policy decision record.

## Start here

- [Quick Look lab](quick-lab.html) · [Full compensation lab](physician-pay-lab.html)
- [Research brief](research-brief.md) · [Model specification](spec.md)
- [Paper draft](paper/navy-primary-care-physician-retention-draft.md) · [Source review](paper/navy-physician-source-review.md)
- [Consolidated decision record](decisions/physician-retention-economics-memo.md)
- [Analysis](analysis/physician-retention-analysis.md) · [Comparison data](data/physician-retention-12-row-comparison.csv) · [Figure](figures/physician-retention-cumulative-gap.svg)
- [Course economics crosswalk](course-economics-crosswalk.md) · [Repository AI log](../../../prompt-log.md)

## Reading the versions

The paper's provisional O-5 scenario at 4% differs from the earlier O-4 analysis at 5%. The lab explores user-selected scenarios. Folder consolidation does not reconcile those assumptions or validate the paper's pay inputs. The decision record explains the distinction.

[Earlier package versions](archive/pre-consolidation/README.md) preserve nonidentical material that was previously duplicated in this folder. They are historical references, not alternate current deliverables. Canonical files are linked above.

## Working on the lab

Keep the HTML pages, calculation modules, reference data, tests, and PDF library together in this project. Run the existing checks from the project folder:

```sh
node tests/check-calculation-engine.mjs
node tests/check-special-pay-and-pension.mjs
```

The older `economic-research/quick-lab.html` and `economic-research/physician-pay-lab.html` addresses redirect here. Course-required brief/spec entry points outside the project are links only. The root prompt log remains the course-wide session record.

`build_comparison.py` retains the earlier bonus-comparison scenarios and writes generated files into this project's `outputs/` directory; those outputs do not replace the paper's fixed scenario.

## Project background

This capability studies Navy primary-care physician retention in San Diego as a local labor-market case within a Pacific medical-readiness challenge. Naval Medical Forces Pacific is headquartered in San Diego and supports commands across the region. The project compares current compensation for general pediatrics, general internal medicine, and family medicine while keeping pay gaps, retention behavior, and readiness outcomes distinct.

**Exercised in:** [research brief](research-brief.md) · [model specification](spec.md) · [12-row analysis](analysis/physician-retention-analysis.md) · [cumulative-gap figure](figures/physician-retention-cumulative-gap.svg) · [opportunity-cost and retention decision](decisions/physician-retention-economics-memo.md) · [author-supplied paper draft](paper/navy-primary-care-physician-retention-draft.md). The finished research-paper PDF will be linked when available.

The [course economics crosswalk](course-economics-crosswalk.md) maps relevant chapters of Frank et al.'s *Principles of Economics* (4th ed.) to the paper and model. It separates textbook decision rules from empirical Navy pay and retention evidence.

The brief records the author's opportunity-cost research question and validation approach. The spec defines sources, named inputs, calculations, figure requirements, and acceptance checks. The September 2026 paper draft estimates the cash-compensation component of financial opportunity cost for a fixed O-5 scenario across all three specialties. Its tables show annual gaps, four-year present values, and discount-rate sensitivity. It treats larger bonuses and targeted communication of existing nonfinancial benefits as possible applications, not established retention solutions. The paper uses a 4% discount rate and a provisional $239,000 Navy cash figure, which differ from the interactive lab's default scenario. Exact civilian-input citations and an itemized Navy-pay reconciliation remain necessary before empirical use. No retention elasticity or optimal bonus is inferred from the cash gap.

The [interactive Physician Pay Gap Lab](physician-pay-lab.html) is a supplemental sensitivity tool. It accepts rank, physician, civilian-pay, and benefit assumptions and calculates a present-value financial gap and year-by-year cash comparison under current compensation. Its San Diego Marit benchmarks are citywide, not ZIP-specific. The lab maps any duty-station ZIP in the 2026 DoD BAH crosswalk to the relevant housing area and fills BAH for O-4 through O-6; unmapped ZIPs require a verified manual amount. It can also compare a conditional active-duty pension with an optional Reserve pension, using projected points and pay-start age. The lab does not estimate retention or operational-readiness effects.

The [Quick Look](quick-lab.html) now includes a separate GMO-to-residency illustration for family medicine, pediatrics, and internal medicine. It compares national PGY-level civilian stipends with Navy resident cash, then compares national specialty attending benchmarks over a selected post-training service horizon. A completed intern year may leave two residency years rather than three; the user selects whether PGY-1 credit is granted. The selected horizon illustrates a possible service path and is not a determination of individual obligated service. [Navy GME policy](https://www.med.navy.mil/Portals/62/Documents/BUMED/Directives/Instructions/1524.1D.pdf?ver=eVEhcqPIO1Neu4s7m4Xskw%3D%3D) requires BUMED to calculate it before training. The illustration excludes taxes, pension, TSP, health benefits, certification pay, and retention bonuses.

The operational link is documented in the [Naval Medical Forces Pacific region](https://www.med.navy.mil/Naval-Medical-Forces-Pacific/Region/) and [mission](https://www.med.navy.mil/Naval-Medical-Forces-Pacific/Region/Mission/) pages; the project still needs specialty-level staffing and deployment outcomes before claiming a readiness effect.

The [consolidated decision record](decisions/physician-retention-economics-memo.md) connects the pay-gap analysis to opportunity cost, incentives, marginal analysis, present value, compensating wage differentials, and labor-supply elasticity.
