---
type: brief
engagement: perfect-competition
capability: marginal-analysis
date: 2026-08-22
status: committed
hypothesis: "I expect 14 tomato beds, 20 carrot beds, and 30 mesclun beds because tomatoes' diminishing returns cause labor requirements and marginal costs to rise, while the other crops' diminishing-return rates allow them to reach their caps."
---

# Perfect Competition — engagement brief

## The problem

- **What decision must be made?** Maximize profit.
- **What quantities can the farmer choose?** The farm has 64 total beds. Max tomatoes is 20, carrots is 20, mesclun is 30.
- **What is fixed?** 720 hours of farm labor time and $20k in fixed costs. The number of temporary workers is variable, up to four.
- **What could go wrong if the mix is poorly chosen?** Opportunity cost: assigning scarce beds and labor to a lower-value crop means giving up the profit those beds and hours could have earned in a better mix.

### Model constraints

The model maximizes total profit by selecting the number of tomato, carrot, and mesclun beds. The number of temporary workers is then calculated from the labor required by the selected crop mix.

The model is subject to these constraints:

1. Tomato beds + carrot beds + mesclun beds ≤ 64
2. Tomato beds ≤ 20
3. Carrot beds ≤ 20
4. Mesclun beds ≤ 30
5. Total labor required ≤ 720 + (1,440 × temporary workers)
6. Temporary workers ≤ 4
7. Crop-bed quantities must be nonnegative whole numbers
8. Temporary workers must be nonnegative but may be fractional to represent partial-season employment

With four temporary workers, the maximum labor available is:

`720 + (1,440 × 4) = 6,480 hours`

Profit is calculated using market prices, fertilizer costs, wage rates, the $20,000 fixed cost, diminishing-return percentages, and the 36-week growing season. These values affect the objective function but are not constraints.

## What I am assuming

The model assumes stable prices and wages, good weather, no significant pest losses, and that each planted bed produces a harvestable crop. It does not assume that all 64 beds will be planted; Solver determines whether using every bed or leaving some beds idle maximizes profit.

## Hypothesis

More beds of the same crop require progressively more labor, causing the marginal cost of each additional bed to rise. Because tomatoes have the highest diminishing-return rate, I expect their marginal cost to rise faster than that of carrots and mesclun.

Tomatoes stop at 14 because their labor requirement increases at 10% per additional bed, much faster than carrots' 2.5% and mesclun's 1.25%. Later tomato beds become increasingly expensive to operate. Tomato marginal cost will approach or exceed the fixed market price, stopping tomato production before its 20-bed cap.

Carrots reach 20 and mesclun reaches 30 because it is worthwhile to keep planting until they reach their crop caps, given their lower labor requirements and more slowly rising marginal costs.

### Decision rule: P = MC

Not every crop stops at P = MC. A crop can also stop early because it hits its bed cap, or because the farm runs out of land or labor. Which one applies depends on the crop: for tomatoes, I think rising marginal cost will hit the price first. For carrots and mesclun, I think they'll hit their bed caps first.

### Labor relationship

```text
Labor(q) = q × weekly hours per bed × 36 × (1 + diminishing-return rate)^q
```

## How I would know I was wrong

I would know I was wrong under any of these outcomes:

- Carrots finish below 20 beds. Their diminishing-return rate is a fixed number in the case, so this wouldn't mean the rate is wrong. It would mean I misjudged its effect, or that another real constraint (total beds or the temporary-labor limit) ran out first.
- Mesclun finishes below 30 beds, for the same reason: something other than the rate itself would have to explain it—either my read on its effect was off, or another constraint bound first.
- Tomatoes reach their 20-bed cap, or land far from 14 in either direction. This wouldn't mean the 10% rate is wrong—it's also a fixed number. It would mean I misjudged how fast that rate pushes marginal cost up to price.

