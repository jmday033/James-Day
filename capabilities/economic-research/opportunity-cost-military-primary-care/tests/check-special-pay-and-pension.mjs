import assert from 'node:assert/strict';
import {annualPension, boardCertificationPay, bonusStatusAllowsRate, rbRates} from '../calc-engine.js';

assert.equal(boardCertificationPay, 8000);
assert.deepEqual(rbRates.FY26.im, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.fm, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.peds, {2:15000, 3:25000, 4:35000, 6:40000});
assert.equal(bonusStatusAllowsRate('unknown'), false);
assert.equal(bonusStatusAllowsRate('obligated'), false);
assert.equal(bonusStatusAllowsRate('signed'), true);
assert.equal(bonusStatusAllowsRate('eligible'), true);

// White Coat Investor cites roughly $48,400–$60,500 pretax for a historical
// O-5/20-year example. A $121,000 illustrative High-3 produces those amounts.
// A current scenario must use its own estimated retirement High-3.
assert.equal(annualPension({pensionBase:121000, creditableYears:20, retirement:'brs'}), 48400);
assert.equal(annualPension({pensionBase:121000, creditableYears:20, retirement:'legacy'}), 60500);
console.log('Special-pay and pension checks passed');


// Pension discount rate and stay-to-20 break-even (added 2026-09-29).
import {defaultPensionDiscount, pensionPresentValue, stayToTwentyCurve} from '../calc-engine.js';
assert.equal(defaultPensionDiscount, 0.03);
const near=(a,b,tol=1)=>assert.ok(Math.abs(a-b)<tol, `${a} != ${b}`);
// $48,000 BRS pension, 30 real payments, valued at 10 active years (10 left).
const at5=stayToTwentyCurve({annualCashGap:459057-282585.33, annualPension:48000, pensionDiscount:.05, cashDiscount:.05});
near(at5.rows[0].pensionPV, 452993);
near(at5.rows[0].cashGapPV, 1362667, 1);
near(at5.breakEven, 16.1, 0.05);
const at3=stayToTwentyCurve({annualCashGap:459057-282585.33, annualPension:48000});
near(at3.rows[0].pensionPV, 700059);
near(at3.rows[0].net, -662608, 1);
near(at3.breakEven, 14.7, 0.05);
// A lower pension rate raises pension value; retiree health adds value only before Medicare.
const base={activeYears:10,additionalYears:10,pensionBase:120000,pensionTax:.22,currentAge:40};
assert.ok(pensionPresentValue({...base,discount:.03})>pensionPresentValue({...base,discount:.05}));
const withHealth=pensionPresentValue({...base,discount:.03,retireeHealthAnnual:10000});
const noHealth=pensionPresentValue({...base,discount:.03});
near(withHealth-noHealth, 10000*((1-Math.pow(1.03,-15))/.03)/Math.pow(1.03,10), .01);
assert.equal(pensionPresentValue({...base,currentAge:60,discount:.03,retireeHealthAnnual:10000}), pensionPresentValue({...base,currentAge:60,discount:.03}));
console.log('Pension-rate and break-even checks passed');
