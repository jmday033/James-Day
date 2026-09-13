# Uber versus used-car decision

This project estimates when buying a used car becomes less expensive than paying $50 per one-way Uber ride. It compares $5,000, $10,000, and $15,000 cash purchases over five years.

## Baseline break-even

| Car price | Five-year one-way rides | One-way rides/month | Round trips/month |
|---:|---:|---:|---:|
| $5,000 | 436 | 7.3 | 3.6 |
| $10,000 | 543 | 9.1 | 4.5 |
| $15,000 | 651 | 10.8 | 5.4 |

Below the relevant threshold, Uber is cheaper. Replace the placeholder inputs before making a purchase.

- [Hypothesis](hypothesis.md)
- [Specification](spec.md)
- [Assumptions](data/assumptions.csv)
- [Reproducible model](model.py)
- [Decision memo](analysis/uber-vs-used-car-analysis.md)

Run `python model.py` from this directory. No third-party packages are required.
