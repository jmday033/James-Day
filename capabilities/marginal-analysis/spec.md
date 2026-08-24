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

Every planted bed earns its full stated revenue per bed.

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

Use the published inputs exactly as shown, including 0.833 carrot labor hours, $34.72 farmer labor, and $17.36 temporary labor.

Create workbook-level Excel named ranges for all inputs, decision cells, and major outputs. Name the decision cells `TOMATO_BEDS`, `CARROT_BEDS`, and `MESCLUN_BEDS`.

## Structure

Use five worksheets with these exact names:

1. `Inputs`
2. `Cost Structure`
3. `Marginal Cost`
4. `Optimization`
5. `Checks`

- **Inputs** contains all named assumptions and case data.
- **Cost Structure** calculates crop-level and farm-level labor, fertilizer, variable costs, fixed costs, revenue, marginal cost, price comparisons, and profit.
- **Marginal Cost** shows each crop's standalone cost and marginal cost at every required bed quantity.
- **Optimization** contains the three bed-count decisions, objective function, and constraints.
- **Checks** records both Solver starting-point results, every constraint check, and all acceptance-criteria checks.

Charts are optional. Tables are required. Colors, column widths, and currency presentation are left to the builder because they do not change the model's economic logic.

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

CROP_TOTAL_COST(q) =
CROP_FERTILIZER × q + CROP_LABOR_COST(q)

CROP_MARGINAL_COST(q) =
CROP_TOTAL_COST(q) - CROP_TOTAL_COST(q - 1)

UNUSED_BEDS =
TOTAL_BED_CAP - TOTAL_BEDS
```

The conditional blended-rate formula prevents division by zero at the 0/0/0 Solver starting point.

Each crop's standalone marginal-cost schedule is calculated independently with the other two crops set to zero. Each crop independently uses the first 720 farmer hours before temporary labor begins. Labor cost and the blended labor rate are recalculated at every quantity in each standalone schedule.

Use schedule ranges of 0–20 for tomatoes, 0–20 for carrots, and 0–30 for mesclun. Display marginal cost as blank at `q = 0`.

Standalone crop cost includes that crop's fertilizer and labor cost. `FIXED_COST` is separate from farmer labor compensation. Include it once in total farm profit, but exclude it from marginal-cost calculations because it does not change with production.

Define the price–marginal-cost crossing as the integer quantity `q` satisfying both conditions:

```text
MC(q) ≤ PRICE
MC(q + 1) > PRICE
```

Allocate mixed-model labor cost using the farm-wide blended labor rate:

```text
CROP_LABOR_COST =
CROP_LABOR_HOURS × BLENDED_LABOR_RATE
```

This ensures that the sum of crop-level labor costs equals total farm labor cost.

## Optimization

Use GRG Nonlinear with integer restrictions on the three bed decisions. `TOMATO_BEDS`, `CARROT_BEDS`, and `MESCLUN_BEDS` are nonnegative integers and the only Solver changing cells. Temporary workers remain a calculated value.

Enforce these constraints:

```text
TOTAL_BEDS ≤ TOTAL_BED_CAP
TOMATO_BEDS ≤ TOMATO_CAP
CARROT_BEDS ≤ CARROT_CAP
MESCLUN_BEDS ≤ MESCLUN_CAP
TEMP_WORKERS ≤ TEMP_WORKER_CAP
TOMATO_BEDS, CARROT_BEDS, and MESCLUN_BEDS ≥ 0 and integers
```

The temporary-worker constraint indirectly limits total labor to 6,480 hours.

Run Solver from 0/0/0 and 20/0/0. Record both results on the `Checks` sheet. If the results differ, retain both and select the feasible solution with the higher profit.

Validation failures display `FAIL` but do not prevent Solver from running.

## Conventions

- The farmer's available field hours are consumed before temporary labor is purchased.
- Temporary labor covers only the labor requirement above `FARMER_HOURS`.
- Temporary workers are calculated from temporary hours and may be fractional.
- Crop-bed decision quantities are nonnegative whole numbers.
- Labor cost uses the farmer/temporary split above, and `BLENDED_LABOR_RATE` is recalculated from labor cost divided by labor hours.
- Fixed cost is included once in total farm cost and profit.
- Each standalone crop marginal-cost schedule sets the other two crop quantities to zero.
- Fixed cost is excluded from standalone crop marginal cost.
- Every planted bed earns its full stated revenue per bed.

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

Use these validation tolerances:

- Labor hours: ±0.01 hour
- Temporary workers: ±0.01 worker
- Dollar figures: ±$1
- Marginal-cost figures: ±$1
- Crossing quantities: exact stated integer
- Bed quantities: exact stated integer

Show every constraint in a table with its actual value, limit, slack, and `PASS` or `FAIL` status. Record this table and all acceptance-criteria checks on the `Checks` sheet.

## Outputs

The model must report:

- Recommended beds for each crop
- Total beds used and `UNUSED_BEDS`
- Total labor hours
- Farmer hours used
- Temporary labor hours
- Temporary workers required
- Blended labor rate
- Crop-level revenue, fertilizer, labor, marginal cost, and price comparisons
- Farm totals
- Variable cost
- Fixed cost
- Total cost and total profit
- Standalone marginal-cost schedules
- Price-versus-marginal-cost comparisons
- Status of every constraint
- Both Solver starting-point results
- All acceptance-criteria checks

## Audit findings

- **Optimization defect corrected:** The first workbook displayed the published 10/20/30 result in the Solver decision cells but did not independently derive it. The revised workbook includes a formula-driven exhaustive search of all 13,671 permitted whole-number crop combinations, applies the land and temporary-worker constraints to every row, and reports the highest-profit feasible mix on the `Optimization` sheet. The editable Solver cells remain available for the required GRG Nonlinear test and are reconciled to the independent formula result.
- **Published profit check:** Using the published inputs exactly, the model calculates profit of $42,775.16, which differs from the published check figure of $42,762 by $13.16. A carrot price of approximately $2,093.34 reproduces the check figure, suggesting the published result may use an unrounded underlying input. The published inputs remain unchanged, and the workbook reports the acceptance test as `FAIL` under the specified ±$1 tolerance.
