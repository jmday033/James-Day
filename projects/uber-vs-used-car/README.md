# Uber versus used-car decision

This project estimates when buying a used car becomes less expensive than paying $50 per one-way ride. It compares $5,000, $10,000, and $15,000 cash purchases over five years.

## Minimum whole rides needed to favor buying

| Car price | Five-year one-way rides | One-way rides/month | Round trips/month |
|---:|---:|---:|---:|
| $5,000 | 437 | 8 | 4 |
| $10,000 | 544 | 10 | 5 |
| $15,000 | 651 | 11 | 6 |

Whole-ride thresholds are rounded up because a partial ride cannot make buying cheaper.

## Observed 2026 use

January through July statements plus six documented friend-provided rides show **25 rides over seven complete months**, or approximately **4 rides per month**. Total ride spending was **$810.30**, averaging $32.41 per ride. August data are partial through August 20.

Observed use is below even the $5,000 car's threshold, supporting continued ride-hailing.

- [View charts and visual summary](VISUALS.md)
- [Hypothesis](hypothesis.md)
- [Specification](spec.md)
- [Assumptions](data/assumptions.csv)
- [Observed rides](data/observed-rides-2026.csv)
- [Reproducible model](model.py)
- [Decision memo](analysis/uber-vs-used-car-analysis.md)

Run `python model.py` from this directory. The model retains decimal precision internally.
