# Uber versus used car — preliminary decision memo

## Recommendation

Continue using Uber and paid rides from friends. From January through July 2026, observed use averaged **3.6 one-way rides per month**, below the model's lowest purchase threshold of 7.3 rides per month for a $5,000 car (`data/observed-rides-2026.csv`; `model.py`).

The baseline break-even points remain 7.3 monthly rides for a $5,000 car, 9.1 for a $10,000 car, and 10.8 for a $15,000 car. These equal about 3.6–5.4 round trips monthly.

## Observed 2026 rides

The statements identify 20 Uber-platform rides through August 9. Six additional $50 payments to a friend were documented as transportation: March 25; April 8, 17, and 23; May 31; and August 20. Uber Eats, Uber One, and Lyft were excluded.

Across the seven complete months January–July, there were **25 rides costing $810.30**, averaging 3.57 rides per month and $32.41 per ride. August is incomplete but contains two rides totaling $102.70 through August 20. The year-to-date observed total is therefore **26 rides and $913.00** through August 20 (`data/observed-rides-2026.csv`).

At the January–July pace, five years would produce about 214 rides—less than half of the 436 rides needed for the $5,000 car to break even under the conservative $50 model. Because the actual observed average cost is only $32.41 per ride, continued rides are more favorable than the original $50 assumption suggests.

## Cost logic

The baseline five-year net fixed ownership costs are about $20,286, $25,271, and $30,257. A 10-mile car ride costs an estimated $3.50 in fuel and mileage-linked wear. Each avoided $50 ride contributes $46.50 toward fixed ownership costs.

![Five-year cost curves](figures/five-year-cost-curves.svg)

*Figure 1. Five-year cost structure under baseline assumptions.*

![Break-even rides](figures/break-even-rides-per-month.svg)

*Figure 2. One-way rides per month required for buying to beat Uber.*

## Inputs still needed

The ride-frequency question is now substantially answered. The remaining high-value inputs are vehicle-specific insurance quotes, likely repairs, registration, resale value, parking, and cash versus financing. A complete August statement and later 2026 statements should be added as they become available.

Nonfinancial factors remain separate: wait time, surge availability, toddler car-seat logistics, immediate access, reliability, and breakdown risk.

## Hypothesis check

The initial hypothesis is supported by observed behavior. Current use is about 3.6 one-way rides per month, roughly half the cheapest-car threshold. Even before accounting for the lower observed average fare, purchasing a used car would not minimize cost at the current pace.
