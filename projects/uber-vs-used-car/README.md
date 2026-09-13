# Uber versus used-car decision

This project estimates when buying a used car becomes less expensive than paying $50 per one-way ride. It compares $5,000, $10,000, and $15,000 cash purchases over five years.

## Baseline break-even

| Car price | Five-year one-way rides | One-way rides/month | Round trips/month |
|---:|---:|---:|---:|
| $5,000 | 436 | 7.3 | 3.6 |
| $10,000 | 543 | 9.1 | 4.5 |
| $15,000 | 651 | 10.8 | 5.4 |

## Observed 2026 use

January through July statements plus six documented friend-provided rides show **25 rides over seven complete months**, or **3.6 rides per month**. Total ride spending was **$810.30**, an average of **$32.41 per ride**. August data are partial through August 20.

Observed use is below even the $5,000 car's baseline break-even point, supporting continued ride-hailing.

- [Hypothesis](hypothesis.md)
- [Specification](spec.md)
- [Assumptions](data/assumptions.csv)
- [Observed rides](data/observed-rides-2026.csv)
- [Reproducible model](model.py)
- [Decision memo](analysis/uber-vs-used-car-analysis.md)

Run `python model.py` from this directory. No third-party packages are required.
