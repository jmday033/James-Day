# Navy Physician Compensation and Retention Project

This graduate economics project compares the financial value of continued Navy service with a feasible civilian primary-care job. The interactive lab is the current calculator. The written deliverables document the research question, model design, analysis, and decision argument.

## Open the project

- [Quick Look](../quick-lab.html) · [live website](https://jmday033.github.io/James-Day/capabilities/economic-research/quick-lab.html)
- [Full physician pay model](../physician-pay-lab.html) · [live website](https://jmday033.github.io/James-Day/capabilities/economic-research/physician-pay-lab.html)
- [Research brief](research-brief.md)
- [Model specification](physician-retention-model-spec.md)
- [Analysis](physician-retention-analysis.md)
- [Opportunity-cost and retention decision](../../../docs/decisions/physician-retention-economics-memo.md)
- [Four-year comparison data](physician-retention-12-row-comparison.csv)
- [Cumulative-gap figure](physician-retention-cumulative-gap.svg)

## Audit context

The written deliverables are research drafts and may describe earlier versions of the lab. Treat differences between them and the current calculator as findings to flag. In particular, check service-credit and pension assumptions, the treatment of BRS contributions, tax estimates, salary benchmark scope, and whether the conclusions exceed the evidence.

The lab is a conditional planning model. Its output is not a measured retention effect or an individual financial recommendation. Editable pay inputs and cited source values remain exact in the calculations; comparison displays round dollar results to the nearest $100.

Both views use the same [`calc-engine.js`](../calc-engine.js) tables and year-by-year calculation. Quick Look uses six inputs and a stated gross-cash/BRS-pension illustration. The full model exposes tax, benefits, retirement, and offer assumptions for individual sensitivity work. Neither view converts a modeled financial difference into a retention probability.

The [analysis](physician-retention-analysis.md) now includes a fixed-scenario methodology, a nine-cell discount-rate and salary-growth sensitivity, and a literature section connecting the lab's stay-or-leave comparison to ACOL and DRM research. The lab is ACOL-inspired, not a fitted retention model. The paper does not apply an unverified Navy physician pay elasticity.

