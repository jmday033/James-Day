---
type: spec
capability: marginal-analysis
engagement: perfect-competition
date: 2026-08-23
status: draft
---

# Marginal Analysis — model specification

## Purpose

This model supports the farm's planting decision by selecting the number of tomato, carrot, and mesclun beds that maximizes total profit. Revenue per bed, fertilizer costs, labor costs, and the $20,000 fixed cost determine the objective function:

```text
PROFIT = TOTAL_REVENUE - TOTAL_COST
```

The three crop-bed quantities are the decision variables. Temporary workers are calculated from labor exceeding the farmer's 720 field hours.

## Inputs — the named contract

| Name | Value | Unit | Source |
|---|---:|---|---|
| `WEEKS` | 36 | weeks | Case scenario |
| `FIXED_COST` | $20,000 | dollars/season | Case scenario |
| `TOTAL_BED_CAP` | 64 | beds | Case scenario |
| `FARMER_HOURS` | 720 | hours | Case scenario |
| `FARMER_RATE` | $34.72 | dollars/hour | Case scenario |
| `TEMP_RATE` | $17.36 | dollars/hour | Case scenario |
| `TEMP_HOURS_PER_WORKER` | 1,440 | hours/worker | Case scenario |
| `TEMP_WORKER_CAP` | 4 | workers | Case scenario |
| `TOMATO_PRICE` | $8,800 | dollars/bed | Case scenario |
| `TOMATO_HOURS` | 2.5 | hours/week/bed | Case scenario |
| `TOMATO_FERTILIZER` | $880 | dollars/bed | Case scenario |
| `TOMATO_DIM` | 10% | per additional bed | Case scenario |
| `TOMATO_CAP` | 20 | beds | Case scenario |
| `CARROT_PRICE` | $2,094 | dollars/bed | Case scenario |
| `CARROT_HOURS` | 0.833 | hours/week/bed | Case scenario |
| `CARROT_FERTILIZER` | $440 | dollars/bed | Case scenario |
| `CARROT_DIM` | 2.5% | per additional bed | Case scenario |
| `CARROT_CAP` | 20 | beds | Case scenario |
| `MESCLUN_PRICE` | $2,700 | dollars/bed | Case scenario |
| `MESCLUN_HOURS` | 1.25 | hours/week/bed | Case scenario |
| `MESCLUN_FERTILIZER` | $880 | dollars/bed | Case scenario |
| `MESCLUN_DIM` | 1.25% | per additional bed | Case scenario |
| `MESCLUN_CAP` | 30 | beds | Case scenario |

## Structure

- **Inputs** contains all named assumptions and case data.
- **Cost Structure** calculates labor, fertilizer, variable costs, fixed costs, revenue, and profit.
- **Marginal Cost** shows each crop's cost and marginal cost at every possible bed quantity.
- **Optimization** contains the three bed-count decisions, objective function, and constraints.
- **Checks** compares the workbook results with the required acceptance criteria.

## Calculation logic

```text
CROP_LABOR(q) =
q × CROP_HOURS × WEEKS × (1 + CROP_DIM)^q

TOTAL_LABOR =
TOMATO_LABOR + CARROT_LABOR + MESCLUN_LABOR

FARMER_HOURS_USED =
MIN(TOTAL_LABOR, FARMER_HOURS)

TEMP_HOURS =
MAX(TOTAL_LABOR - FARMER_HOURS, 0)

TEMP_WORKERS =
TEMP_HOURS / TEMP_HOURS_PER_WORKER

LABOR_COST =
(FARMER_HOURS_USED × FARMER_RATE)
+ (TEMP_HOURS × TEMP_RATE)

BLENDED_LABOR_RATE =
IF(TOTAL_LABOR = 0, 0, LABOR_COST / TOTAL_LABOR)

FERTILIZER_COST =
(TOMATO_BEDS × TOMATO_FERTILIZER)
+ (CARROT_BEDS × CARROT_FERTILIZER)
+ (MESCLUN_BEDS × MESCLUN_FERTILIZER)

TOTAL_REVENUE =
(TOMATO_BEDS × TOMATO_PRICE)
+ (CARROT_BEDS × CARROT_PRICE)
+ (MESCLUN_BEDS × MESCLUN_PRICE)

VARIABLE_COST =
LABOR_COST + FERTILIZER_COST

TOTAL_COST =
FIXED_COST + VARIABLE_COST

PROFIT =
TOTAL_REVENUE - TOTAL_COST

CROP_MARGINAL_COST(q) =
CROP_TOTAL_COST(q) - CROP_TOTAL_COST(q - 1)
```

The conditional blended-rate formula prevents division by zero at the 0/0/0 Solver starting point.

Each crop's marginal-cost schedule is calculated independently, with the other two crop quantities set to zero. The schedule includes the crop's fertilizer and allocated labor costs but excludes fixed cost because fixed cost does not change when another bed is planted.

The optimization must enforce:

```text
TOMATO_BEDS + CARROT_BEDS + MESCLUN_BEDS ≤ TOTAL_BED_CAP
TOMATO_BEDS ≤ TOMATO_CAP
CARROT_BEDS ≤ CARROT_CAP
MESCLUN_BEDS ≤ MESCLUN_CAP
TEMP_WORKERS ≤ TEMP_WORKER_CAP
TOMATO_BEDS, CARROT_BEDS, and MESCLUN_BEDS are nonnegative integers
```

## Conventions

- The farmer's available field hours are consumed before temporary labor is purchased.
- Temporary labor covers only the labor requirement above `FARMER_HOURS`.
- Temporary workers are calculated from temporary hours and may be fractional.
- Crop-bed decision quantities are nonnegative whole numbers.
- Labor cost uses the farmer/temporary split above, and `BLENDED_LABOR_RATE` is calculated from total farm labor cost divided by total farm labor hours.
- Fixed cost is included once in total farm cost and profit.
- Each standalone crop marginal-cost schedule sets the other two crop quantities to zero.
- Fixed cost is excluded from standalone crop marginal cost because it does not change with an additional bed.

## Validation rules

The finished workbook must satisfy all of the following acceptance criteria:

- At `q = 1`, tomato labor equals 99 hours.
- At `q = 1`, carrot labor is approximately 30.74 hours.
- At `q = 1`, mesclun labor is approximately 45.56 hours.
- The optimized result is 10 tomato beds, 20 carrot beds, and 30 mesclun beds.
- Optimized profit is approximately $42,762.
- Optimized temporary workers are approximately 3.16.
- Standalone price–marginal-cost crossings occur near 10 tomato beds, 10 carrot beds, and 6 mesclun beds.
- Tomato marginal cost is approximately $8,249 at bed 10 and $9,391 at bed 11.
- Solver is tested from both 0/0/0 and 20/0/0 starting points.
- Every calculated cell contains a formula.
- The workbook contains no error cells.
- Every constraint has a visible status check.

## Outputs

The model must report:

- Recommended beds for each crop
- Total beds used and unused beds
- Total labor hours
- Farmer hours used
- Temporary labor hours
- Temporary workers required
- Blended labor rate
- Revenue by crop and total revenue
- Fertilizer cost
- Labor cost
- Variable cost
- Fixed cost
- Total cost and total profit
- Marginal-cost schedules
- Price-versus-marginal-cost comparisons
- Status of every constraint

## Audit findings

_To be completed after the workbook is built. For each validation check, record what was checked, what was found, what defect the check would have caught, and what was changed._
