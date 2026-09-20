import assert from 'node:assert/strict';
import {calculateScenario, payFor} from '../calc-engine.js?v=20260920-decisions';
import {annuityFactor, cumulativeCash, pensionAtSeparation, projectedHigh3, compareCareerPaths, solveThreshold, decisionSensitivity} from '../decision-engine.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<.02,`${a} != ${b}`);
const input={rank:'O4',commissionYear:2016,promotionOn:false,payYos:10,base:payFor('O4',10),bah:5082,bas:328.48,ip:43000,bcp:8000,
  civilianSalary:300000,civilianGrowth:0,civilianTax:60000,navyTax:40000,growthTax:.3,civilianBenefits:12000,navyTsp:5000,health:6000,gi:0,malpractice:10000,
  currentBonus:48000,rbRemaining:4,years:10,discount:.05,activeYears:10,retirement:'brs',includePension:true,currentAge:40,paymentYears:30,pensionTax:.22,
  comparisonYears:35,workUntilAge:65,navyHours:2400,civilianHours:2080,minimumServiceYears:0};
// A separately discounted lifetime pension must be recognized in full, not PV / (1+r).
const pension=pensionAtSeparation(input,10),cash=calculateScenario(input),adjusted=calculateScenario({...input,netPensionPV:pension.pv});
close(cash.pv-adjusted.pv,pension.pv);
close(adjusted.annualGap*annuityFactor(10,.05),adjusted.pv);
close(cumulativeCash(adjusted.rows).at(-1),adjusted.cashPV);
close(cumulativeCash(adjusted.rows)[0],adjusted.rows[0].gap/1.05);
close(adjusted.cashPV-adjusted.netPensionPV,adjusted.pv);
for(const discount of [0,.05,.20]) {
  const p=pensionAtSeparation({...input,retirement:'legacy',high3:120000,discount},10);
  const direct=Array.from({length:30},(_,i)=>120000*.025*20*.78/(1+discount)**(11+i)).reduce((a,b)=>a+b,0);
  close(p.pv,direct);
}
const paths=compareCareerPaths(input);
assert.ok(paths.every(p=>p.rows.length===35));
assert.equal(paths[1].rows[9].stage,'Active Navy');
assert.equal(paths[1].rows[10].stage,'Civilian work');
assert.ok(paths[1].rows[10].pensionCash>0);
assert.equal(paths[1].rows[25].stage,'After work');
close(paths[1].advantageVsLeave,-adjusted.pv);
const retired={...input,activeYears:20,payYos:20,currentAge:50,high3Now:120000,years:4};
const retireNow=pensionAtSeparation(retired,0),later=pensionAtSeparation(retired,4);
assert.ok(retireNow.pv>0&&later.pv>0);
assert.ok(later.annual>retireNow.annual);
const retiredPaths=compareCareerPaths(retired);
assert.ok(retiredPaths[0].rows[0].pensionCash>0);
assert.equal(retiredPaths[1].rows[0].pensionCash,0);
assert.ok(retiredPaths[1].rows[4].pensionCash>0);
const taxed=calculateScenario({...input,rbRemaining:1,navyTaxForYear:w=>w*.3,civilianTaxForYear:w=>w*.25,civilianGrowth:.03});
close(taxed.rows[0].navyTax-taxed.rows[1].navyTax,48000*.3);
assert.ok(taxed.rows[1].civilianTax>taxed.rows[0].civilianTax);
const promoted=calculateScenario({...input,commissionYear:2012,promotionOn:true,navyTaxForYear:w=>w*.3});
close(promoted.rows[0].navyTax,(12*payFor('O5',10)+43000+8000+48000)*.3);
close(projectedHigh3({...input,commissionYear:2012,promotionOn:true},3),promoted.rows.slice(0,3).reduce((a,r)=>a+12*r.basicMonthly,0)/3);
const simple={...input,includePension:false,years:1,navyTax:0,civilianTax:0,health:0,malpractice:0,civilianBenefits:0,navyTsp:0,currentBonus:0};
const threshold=solveThreshold(salary=>compareCareerPaths({...simple,civilianSalary:salary})[1].advantageVsLeave);
close(threshold,12*(input.base+input.bah+input.bas)+input.ip+input.bcp);
assert.equal(solveThreshold(x=>x+100),null);
assert.equal(solveThreshold(()=>NaN),null);
const hours=compareCareerPaths({...input,civilianHours:4160});
close(hours[0].rows[0].hourlyCash,paths[0].rows[0].hourlyCash/2);
close(hours[0].totalPV,paths[0].totalPV);
assert.ok(!compareCareerPaths({...input,minimumServiceYears:4})[0].feasible);
assert.ok(decisionSensitivity(input).every(s=>Number.isFinite(s.low)&&Number.isFinite(s.high)));
const finiteCosts=compareCareerPaths({...input,tailCost:20000,giTotal:40000});
close(paths[0].workPV-finiteCosts[0].workPV,20000/1.05**25);
close(finiteCosts[1].workPV-paths[1].workPV,4000*annuityFactor(10,.05)-20000/1.05**25);
assert.throws(()=>calculateScenario({...input,civilianSalary:NaN}),/salary/);
assert.throws(()=>compareCareerPaths({...input,comparisonYears:5}),/include all/);
assert.throws(()=>compareCareerPaths({...input,civilianHours:0}),/hours/);
assert.throws(()=>pensionAtSeparation({...input,includeReserve:true,reserveYears:20,reservePayAge:39},0),/before/);
console.log('Decision checks passed: pension reconciliation, year-end chart, shared horizon, post-retirement cash, post-20 accrual/deferral, annual taxes, break-even, workload and validation.');
