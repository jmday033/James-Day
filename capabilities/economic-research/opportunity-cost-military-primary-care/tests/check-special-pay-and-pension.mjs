import assert from 'node:assert/strict';
import {annualPension, boardCertificationPay, bonusStatusAllowsRate, rbRates} from '../calc-engine.js';

assert.equal(boardCertificationPay, 8000);
assert.deepEqual(rbRates.FY26.im, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.fm, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.peds, {2:15000, 3:25000, 4:35000, 6:40000});
assert.deepEqual(rbRates.FY27.im, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY27.peds, {2:15000, 3:25000, 4:35000, 6:40000});
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

// VA disability, retiree TRICARE averages, and SBP (added 2026-09-29).
import {vaAnnualFor, averageVaRating, retireeTricareValue, calculateScenario} from '../calc-engine.js';
near(vaAnnualFor(100,true), 12*4158.17, .01);
near(vaAnnualFor(50,false), 12*1132.90, .01);
near(vaAnnualFor(20,true), 12*356.66, .01);
assert.equal(vaAnnualFor(0,true), 0);
assert.equal(averageVaRating, 60);
assert.throws(()=>vaAnnualFor(25,true), RangeError);
assert.equal(retireeTricareValue({family:true,mode:'employer',group:'A'}), 6850-765);
assert.equal(retireeTricareValue({family:true,mode:'full',group:'A'}), 26993-765);
near(retireeTricareValue({family:false,mode:'employer',group:'B'}), 1440-462.96, .01);
assert.equal(retireeTricareValue({mode:'none'}), 0);
{
  const b={activeYears:10,additionalYears:10,pensionBase:120000,pensionTax:.22,currentAge:40,discount:.03,paymentYears:30};
  const plain=pensionPresentValue(b);
  // Below 50%, VA offsets retired pay; at 50%+, no offset.
  const off=pensionPresentValue({...b,vaOffsetAnnual:vaAnnualFor(30,true)});
  near(plain-off, vaAnnualFor(30,true)*.78*((1-Math.pow(1.03,-30))/.03)/Math.pow(1.03,10), .01);
  // SBP: premium 6.5% for 30 years, 55% annuity for survivor years after payments end.
  const withSbp=pensionPresentValue({...b,sbp:true,survivorYears:7});
  const A=n=>(1-Math.pow(1.03,-n))/.03, P=48000*.78;
  near(withSbp-plain, (-.065*P*A(30)+.55*P*A(7)/Math.pow(1.03,30))/Math.pow(1.03,10), .01);
  assert.equal(pensionPresentValue({...b,sbp:true,survivorYears:0})<plain, true);
}
{
  const base={rank:'O4',commissionYear:2016,promotionOn:false,payYos:10,base:9420,bah:5082,civilianSalary:339274,years:4,discount:.05};
  const noVa=calculateScenario(base), va=calculateScenario({...base,civilianVa:vaAnnualFor(60,true)});
  near(va.pv-noVa.pv, vaAnnualFor(60,true)*noVa.annuity, .01);
}
console.log('VA, retiree TRICARE, and SBP checks passed');

// Leave-path VA (FERS) pension with military buyback (added 2026-10-13).
import {fersLeavePathValue} from '../calc-engine.js';
const f0={vaStartAge:40,currentAge:40,high3:315000,pensionRate:.03,cashRate:.05,inflation:.025,pensionTax:.22,paymentYearsAt:()=>25};
// 5 VA + 4 academy + 5 active = 14 creditable years: deferred to 62, 1.0%.
const fa=fersLeavePathValue({...f0,vaYears:5,academyYears:4,activeYearsCredited:5,deposit:9300});
assert.equal(fa.creditYears,14); assert.equal(fa.startAge,62); assert.equal(fa.multiplier,.01);
near(fa.annualAtSeparation,44100); near(fa.annualAtStart,44100/Math.pow(1.025,17));
// Deferred annuity loses real value between leaving the VA and payment start.
assert.ok(fa.annualAtStart<fa.annualAtSeparation);
// 20 creditable years moves the start to 60.
const fb=fersLeavePathValue({...f0,vaYears:11,academyYears:4,activeYearsCredited:5});
assert.equal(fb.creditYears,20); assert.equal(fb.startAge,60);
// Fewer than five VA years: no annuity, only FERS employee contributions as a cost.
const fc=fersLeavePathValue({...f0,vaYears:4,academyYears:4,activeYearsCredited:10});
assert.equal(fc.vested,false); assert.equal(fc.pensionValue,0); assert.ok(fc.net<0);
// Leaving at 62+ with 20 years earns the 1.1% multiplier at once.
const fd=fersLeavePathValue({...f0,vaStartAge:52,vaYears:10,activeYearsCredited:10});
assert.equal(fd.startAge,62); assert.equal(fd.multiplier,.011); near(fd.annualAtStart,fd.annualAtSeparation);
console.log('FERS leave-path checks passed');
