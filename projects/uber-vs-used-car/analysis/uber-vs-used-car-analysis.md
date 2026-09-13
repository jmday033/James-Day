# Uber versus used car — preliminary decision memo

## Recommendation

Continue Uber if expected use remains below roughly **7–11 one-way rides per month**, depending on car price. Baseline break-even is 7.3 monthly rides for a $5,000 car, 9.1 for a $10,000 car, and 10.8 for a $15,000 car (`model.py`; `data/assumptions.csv`). These equal about 3.6–5.4 round trips monthly.

## Why

The baseline five-year net fixed ownership costs are about $20,286, $25,271, and $30,257. A 10-mile car ride costs an estimated $3.50: $2 fuel at 25 mpg and $5/gallon plus $1.50 mileage-linked wear. Each avoided $50 Uber ride therefore contributes $46.50 toward fixed ownership costs.

Figure 1 shows the cost relationship: Uber starts at zero and rises quickly; cars begin with fixed costs but rise slowly.

![Five-year cost curves](figures/five-year-cost-curves.svg)

*Figure 1. Five-year cost structure under baseline assumptions.*

Figure 2 translates the crossings into monthly decision thresholds.

![Break-even rides](figures/break-even-rides-per-month.svg)

*Figure 2. One-way rides per month required for buying to beat Uber.*

## Inputs still needed

The most important input is your actual monthly one-way ride count, ideally from three months of Uber history. Next are vehicle-specific insurance quotes, likely repairs, registration, resale value, parking, and cash versus financing. Also confirm whether $50 includes tip and whether routes vary materially.

Track nonfinancial factors separately: wait time, surge availability, toddler car-seat logistics, immediate access, reliability, and breakdown risk.

## Hypothesis check

The hypothesis is conditionally supported. At four round trips per month, Uber likely beats the $10,000 and $15,000 cars and is near the $5,000 threshold. At six round trips per month, purchasing is likely cheaper in all three baseline scenarios. The initial “Uber is cheaper” claim therefore needs the qualifier: **only when rides remain infrequent**.
