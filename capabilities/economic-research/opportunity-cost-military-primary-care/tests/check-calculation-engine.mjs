import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {bahFor,calculateScenario,loadReferenceData,payFor,pensionPresentValue,spendingAdjustment} from '../calc-engine.js';

// Load the published JSON in Node, using the same URL paths as the browser.
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(url,'utf8'))});
await loadReferenceData();
const bah=bahFor('92134','O4','yes');
assert.equal(bah.monthly,5082);
assert.equal(bahFor('00000','O4','yes'),null);

const base=payFor('O4',10);
const shared={rank:'O4',commissionYear:2016,promotionOn:false,payYos:10,base,
  bah:bah.monthly,bahLookup:bah,zip:'92134',deps:'yes',civilianSalary:339274,
  years:4,discount:.05};
const noBonus=calculateScenario({...shared,rbRemaining:0,currentBonus:0});
const signedBonus=calculateScenario({...shared,rbRemaining:4,currentBonus:48000});
assert.ok(Math.abs(noBonus.pv-381669.87864521466)<.01);
assert.ok(Math.abs(signedBonus.pv-211464.2544454214)<.01);
assert.equal(signedBonus.navyCash,276965.76);
assert.equal(noBonus.rows.length,4);
assert.equal(signedBonus.rows[0].bonus,48000);
assert.ok(Math.abs((noBonus.pv-signedBonus.pv)-48000*signedBonus.annuity)<.01);

const promoted=calculateScenario({...shared,commissionYear:2012,promotionOn:true,payYos:14});
assert.equal(promoted.rows[0].grade,'O5');
assert.ok(promoted.rows[0].navyCash>noBonus.rows[0].navyCash);
const adjusted=calculateScenario({...shared,civilianTax:80000,navyTax:40000,
  civilianBenefits:12000,health:7000,malpractice:4000});
assert.ok(Math.abs(adjusted.pv-243377.80898288265)<.01);
assert.ok(adjusted.pv<noBonus.pv);

assert.equal(pensionPresentValue({activeYears:10,additionalYears:9,pensionBase:120000}),0);
const vested=pensionPresentValue({activeYears:10,additionalYears:10,pensionBase:120000,
  retirement:'brs',paymentYears:30,pensionTax:.22,discount:.05});
assert.ok(Math.abs(vested-353334.4373448725)<.01);
assert.ok(vested>0);
assert.throws(()=>calculateScenario({...shared,civilianSalary:-1}),/salary/);
assert.throws(()=>calculateScenario({...shared,discount:.21}),/discount/);
console.log('Calculation-engine checks passed');


// Boundary and timing checks are independent of the engine's loop.
assert.deepEqual(signedBonus.rows.map(r=>r.basicMonthly),[9420,9420,9888.3,9888.3]);
assert.ok(Math.abs(signedBonus.rows[0].discountedGap-signedBonus.rows[0].gap/1.05)<1e-8);
const sd=calculateScenario({...shared,civilianSalary:459057,rbRemaining:4,currentBonus:48000});
const manual=182091.24/1.05+182091.24/1.05**2+176471.64/1.05**3+176471.64/1.05**4;
assert.ok(Math.abs(sd.pv-manual)<.000001);
assert.ok(Math.abs(sd.rows.reduce((s,r)=>s+r.grossGap,0)-717125.76)<.000001);
console.log('Year-end timing and pay-longevity boundary checks passed');

// Conditional pension sensitivity at three career stages; excludes taxes.
for (const [activeYears, expected] of [[10,452992.86839086225],[18,669276.779401702],[19,702740.6183717871]]) {
 const value=pensionPresentValue({activeYears,additionalYears:20-activeYears,pensionBase:120000,pensionTax:0,discount:.05});
 assert.ok(Math.abs(value-expected)<.001);
}
console.log('Conditional pension career-stage checks passed');

// Continuation pay, civilian ramp-up, transition and insurance costs (added 2026-09-29).
{
  const cp=calculateScenario({...shared,rbRemaining:4,currentBonus:48000,continuationPayMultiple:2.5});
  assert.equal(cp.rows[1].activeYos,12);
  assert.ok(Math.abs(cp.rows[1].continuationPay-23550)<.01);
  assert.equal(cp.rows[0].continuationPay+cp.rows[2].continuationPay+cp.rows[3].continuationPay,0);
  assert.ok(Math.abs((signedBonus.pv-cp.pv)-23550/1.05**2)<.01);
  const legacy=calculateScenario({...shared,isBrs:false,continuationPayMultiple:2.5});
  assert.equal(legacy.rows[1].continuationPay,0);
  const ramp=calculateScenario({...shared,civilianFirstYearShare:.8});
  assert.ok(Math.abs((noBonus.pv-ramp.pv)-.2*339274/1.05)<.01);
  const costs=calculateScenario({...shared,transitionCost:20000,civilianInsurance:5000});
  assert.ok(Math.abs((noBonus.pv-costs.pv)-(20000/1.05+5000*noBonus.annuity))<.01);
  assert.throws(()=>calculateScenario({...shared,civilianFirstYearShare:.3}),RangeError);
  console.log('Continuation-pay, ramp-up, and transition-cost checks passed');
}

{
  // Household spending: saving all extra pay leaves the present value unchanged;
  // spending half of the civilian path's extra take-home value halves it when
  // there is no pension; the break-even extra spending is the annual equivalent.
  const none=spendingAdjustment({rows:noBonus.rows,discount:.05,annualSpending:120000});
  assert.ok(Math.abs(none.savedPv-noBonus.pv)<.01);
  assert.ok(Math.abs(none.breakEvenExtraSpending-noBonus.annualGap)<.01);
  assert.ok(Math.abs(none.yearsOfSpending-noBonus.pv/120000)<1e-9);
  const half=spendingAdjustment({rows:noBonus.rows,discount:.05,extraSpendShare:.5});
  assert.ok(Math.abs(half.savedPv-noBonus.pv/2)<.01);
  assert.equal(half.yearsOfSpending,null);
  // The pension annual equivalent is not spendable while working.
  const pensioned=calculateScenario({...shared,pensionAnnual:30000});
  const p=spendingAdjustment({rows:pensioned.rows,discount:.05,pensionAnnual:30000,extraSpendShare:.5});
  assert.ok(Math.abs(p.savedPv-(pensioned.pv-.5*(pensioned.pv+30000*pensioned.annuity)))<.01);
  // Navy ahead: no extra civilian spending is modeled.
  const navyAhead=calculateScenario({...shared,civilianSalary:100000});
  const n=spendingAdjustment({rows:navyAhead.rows,discount:.05,extraSpendShare:.5});
  assert.ok(Math.abs(n.savedPv-navyAhead.pv)<.01);
  assert.throws(()=>spendingAdjustment({rows:noBonus.rows,discount:.05,extraSpendShare:1.5}),RangeError);
  console.log('Household spending checks passed');
}

// Years left at current rank (date-of-rank option).
{
  const {gradeForYear}=await import('../calc-engine.js');
  const g=n=>Array.from({length:12},(_,i)=>gradeForYear({rank:'O4',commissionYear:2016,promotionOn:true,nextPromotionIn:n},i));
  // 3 years left as O-4: rows 2027-2028 at O-4, O-5 from 2029, O-6 six years later (2035).
  assert.deepEqual(g(3).slice(0,9),['O4','O4','O5','O5','O5','O5','O5','O5','O6']);
  // Blank keeps the on-time schedule: 10 years in, O-5 at 15 (row 4), O-6 at 21 (row 10).
  assert.deepEqual(g(null).slice(0,11),['O4','O4','O4','O4','O5','O5','O5','O5','O5','O5','O6']);
  assert.equal(gradeForYear({rank:'O4',commissionYear:2016,promotionOn:false,nextPromotionIn:3},5),'O4');
  assert.equal(gradeForYear({rank:'O6',commissionYear:2000,promotionOn:true,nextPromotionIn:1},3),'O6');
  console.log('years-at-rank checks passed');
}

// Federal career after leaving: FERS vesting, buyback, split stints.
{
  const {federalCareerValue}=await import('../calc-engine.js');
  const base={currentAge:34,militaryYears:8,militaryBasicPaid:900000,high3:300000,pensionTax:.22,
    pensionDiscount:.03,payDiscount:.05,paymentYearsFor:a=>85-a,annualGiveUp:60000};
  const one=federalCareerValue({...base,stints:[{start:0,years:5}]});
  assert.equal(one.vested,true);
  assert.equal(one.creditYears,13);
  assert.equal(one.pension.annual,39000);            // 1% × 13 × 300k
  assert.equal(one.pension.startAge,62);             // separates at 39, deferred to 62
  assert.equal(one.deposit,27000);                   // 3% of 900k
  assert.ok(one.buybackGain>0);
  const noBuy=federalCareerValue({...base,stints:[{start:0,years:5}],buyback:false});
  assert.equal(noBuy.creditYears,5);
  assert.equal(noBuy.deposit,0);
  const short=federalCareerValue({...base,stints:[{start:0,years:4}]});
  assert.equal(short.vested,false);
  assert.equal(short.pension.value,0);
  assert.equal(short.deposit,0);
  const split=federalCareerValue({...base,stints:[{start:24,years:3},{start:0,years:2}]});
  assert.equal(split.civilianYears,5);
  assert.equal(split.sepAge,61);
  assert.equal(split.pension.startAge,62);
  assert.ok(split.giveUpValue<one.giveUpValue);      // later years discount more
  const late=federalCareerValue({...base,currentAge:40,stints:[{start:22,years:5}]});
  assert.equal(late.pension.startAge,67);            // immediate annuity when separating at 62+
  assert.equal(late.pension.multiplier,.01);         // 13 creditable years < 20, so no 1.1%
  assert.throws(()=>federalCareerValue({...base,stints:[{start:0,years:5},{start:3,years:2}]}),/overlap/);
}
console.log('federal career checks passed');
