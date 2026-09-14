# Model specification

## Question

At what recurring frequency is a $5,000, $10,000, or $15,000 used car less expensive than $50 one-way Uber rides?

## Scope

Five years; 10 miles per one-way trip; cash purchase; full ownership cost. Acquisition, taxes/fees, insurance, registration, maintenance, fuel, opportunity cost, and resale proceeds are included. Financing, parking, major repairs, and nonfinancial convenience are editable inputs.

## Equations

`Uber cost = rides × Uber fare`

`Car cost = net fixed ownership cost + rides × car variable cost per ride`

`Break-even rides = net fixed ownership cost ÷ (Uber fare − car variable cost per ride)`

## Acceptance criteria

1. Compare all three prices.
2. Report cumulative rides, rides/month, and round trips/month.
3. Expose every uncertain assumption.
4. Include two figures referenced in the memo.
5. Test the original hypothesis.
6. Identify missing decision inputs.
7. Keep the work reproducible from checked-in files.
