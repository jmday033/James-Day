# EV replacement break-even: Oʻahu, September 2026

**Decision:** Replace our fully owned 2020 gasoline car now with an EV, or keep it until at least 2030?

## Known inputs

| Input | Value | Basis |
|---|---:|---|
| Current gas spending | $50/week | Household estimate; use actual spend rather than inferred mpg |
| Gas cost | $2,600/year | $50 × 52 |
| Current car loan balance | $0 | Household |
| Earliest planned replacement | 2030 | Household |
| EV charging on base | $0 out of pocket | Household assumption; verify charging access, eligibility, availability, and whether it remains free |
| Honolulu regular gasoline | $5.5063/gallon | AAA, September 27, 2026 [source](https://gasprices.aaa.com/?state=HI); for context only because actual $50/week is stronger input |

At that pump price, $50 buys about 9.08 gallons each week. Exact car mileage and trim are unnecessary to calculate the current fuel bill.

## Fuel-only break-even

If **all EV charging stays free**, savings are at most **$2,600 per year**, before any changes in insurance, maintenance, tires, registration, charging equipment, or travel charging.

- From September 27, 2026 through January 1, 2030: about **$8,500** of avoided gas.
- Through December 31, 2030: about **$11,100**.
- Fuel-only payback on an incremental outlay of $10,000 is **3.85 years**; $20,000 is **7.69 years**; $30,000 is **11.54 years**. This is a cash recovery metric, **not** a full car ROI, because cars retain resale value.

If charging is free for fraction `f` of miles and other charging costs `C` per year, annual fuel savings = `$2,600 − C`. Do not treat free charging as guaranteed over the entire holding period.

## The right 2030 comparison

Compare **depreciation from today to the same 2030 sale date**, plus transaction and operating costs:

```
EV benefit by 2030 =
  gas avoided
  + (gas-car maintenance/insurance/tire/registration costs
     − EV maintenance/insurance/tire/registration costs)
  − [EV purchase price − EV resale value in 2030
     − (Kona sale value now − Kona sale value in 2030)]
  − EV transaction costs / charger costs / financing costs
```

The 2020 car's original purchase price is sunk. Its **current resale value** is relevant because switching today gives up the option to keep using it. Taxes and fees on the EV purchase and the time value of a large up-front payment matter. Compare the EV and Kona at the **same** date; do not subtract the full EV purchase price without crediting the EV's eventual resale value.

With unchanged nonfuel operating costs and no transaction costs, the EV can incur at most **$8,500 more depreciation** than the current car and still break even by January 2030 (or **$11,100** by the end of 2030).

| Incremental depreciation of EV versus current car, plus transaction costs | Net by January 2030 | Net by end of 2030 |
|---:|---:|---:|
| $5,000 | +$3,500 | +$6,100 |
| $10,000 | −$1,500 | +$1,100 |
| $15,000 | −$6,500 | −$3,900 |
| $20,000 | −$11,500 | −$8,900 |

These rows are thresholds, **not EV price quotes**.

### Worked example (illustrative only)

Suppose an EV costs $35,000 all in except $2,000 of purchase tax/fees; the current car could sell for $12,000 today. At January 2030, suppose the EV is worth $22,000 and the current car would be worth $7,000. Then EV depreciation is $13,000; current-car depreciation is $5,000. Incremental depreciation plus fees is $10,000. Free charging saves about $8,500, so switching is **about $1,500 behind** by January 2030 before any operating differences or cost of capital.

Under those same assumptions, the EV needs a January 2030 resale value of about **$23,500** to break even. This number changes dollar for dollar with actual purchase price, resale offers, insurance, repair expectations, and fees.

## Sensitivities

| Change | Approximate impact through January 2030 |
|---|---:|
| Gas spend is $40 rather than $50/week | $1,700 less savings |
| Gas spend is $60 rather than $50/week | $1,700 more savings |
| EV costs $500/year more to insure/maintain | $1,630 worse |
| EV saves $500/year on insurance/maintenance | $1,630 better |
| Paid charging costs $500/year | $1,630 worse |
| $20,000 of cash tied up in the EV at 5% simple opportunity cost | roughly $3,260 worse (illustrative; principal exposure declines with depreciation) |

A 5% discount-rate calculation would reduce the present value of the $2,600 annual fuel savings to roughly $7,800 through January 2030. This is a sensitivity, not a guaranteed investment return.

## Decision rule

**Keep the current car until 2030** if it is reliable and the EV's incremental depreciation, transaction costs, and other operating costs exceed the projected fuel savings. **Switch sooner** if a specific EV purchase/resale scenario and verified free charging make the full comparison positive, or if a repair, safety, utility, or lifestyle benefit justifies paying more.

For a precise quote-based version, fill in: EV model and out-the-door price; current car VIN/trim/mileage and trade or private-sale offers; annual insurance quotes for both; expected 2030 resale values; anticipated repairs; whether free charging is available for all miles and remains available after a PCS. Re-run with current gas prices and charging terms at purchase. No tax credit is assumed.

## Sources and date

- [AAA Hawaii gasoline prices](https://gasprices.aaa.com/?state=HI), viewed September 27, 2026 (Honolulu regular $5.5063/gallon).
- [Hawaiian Electric average electricity price](https://www.hawaiianelectric.com/billing-and-payment/rates-and-regulations/average-price-of-electricity), 2025 Oʻahu residential average 40.54¢/kWh. **Not used in the base case** because the household reports free on-base charging; relevant if that assumption changes.
- Household inputs from September 27, 2026. Values for vehicle prices and resale in the worked example are hypothetical.
