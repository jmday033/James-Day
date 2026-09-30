// Stay-or-go model for the answer-first page (stay-or-go.html).
// Question: for a physician below 20 active years, what is staying to 20
// worth, in today's dollars, compared with leaving now for a civilian job?
// Reuses calc-engine.js for Navy pay, bonus, promotion, continuation pay,
// pension, retiree health, VA and SBP rules. Taxes use 2026 federal rules and
// the lab's 2026 state wage-tax sample (data/state-tax-2026.json).
import {calculateScenario, payFor, rbRates, benchmarks, pensionPresentValue,
  vaAnnualFor, crdpThreshold, retireeTricareValue, kff2025} from './calc-engine.js?v=20260929-stayorgo';
// Re-exported so the page shares this module's single copy of the engine and its loaded BAH data.
export {loadReferenceData, bahFor, payFor, benchmarks} from './calc-engine.js?v=20260929-stayorgo';

// ---------- 2026 federal income and payroll tax ----------
const federalBrackets = {
  single:[[0,.10],[12400,.12],[50400,.22],[105700,.24],[201775,.32],[256225,.35],[640600,.37]],
  joint:[[0,.10],[24800,.12],[100800,.22],[211400,.24],[403550,.32],[512450,.35],[768700,.37]]
};
const standardDeduction = {single:16100, joint:32200};
const bracketTax = (income, brackets) => brackets.reduce((tax,[floor,rate],i) => {
  const ceiling = i+1 < brackets.length ? brackets[i+1][0] : Infinity;
  return tax + Math.max(0, Math.min(Math.max(0,income), ceiling) - floor) * rate;
}, 0);

export function federalIncomeTax(income, joint, kids=0) {
  const key = joint ? 'joint' : 'single';
  const base = bracketTax(income - standardDeduction[key], federalBrackets[key]);
  const phaseStart = joint ? 400000 : 200000;
  const credit = Math.max(0, 2200*kids - 50*Math.ceil(Math.max(0, income - phaseStart)/1000));
  return Math.max(0, base - credit);
}

export function stateIncomeTax(income, joint, code, stateData) {
  const t = stateData?.states?.[code];
  if (!t) return 0;
  const deduction = joint ? t.dj + t.ej : t.ds + t.es;
  return bracketTax(income - deduction, joint ? t.j : t.s);
}

// Tax on one person's wages. A working spouse's wages are taxed on both paths,
// so only the extra tax caused by the physician's pay is counted.
export function wageTax(wages, {family, kids=0, spouseWages=0, stateCode, stateData, civilianCa=false}) {
  const joint = family !== 'single';
  const spouse = family === 'marriedTwoIncomes' ? spouseWages : 0;
  const income = total => federalIncomeTax(total, joint, kids) + stateIncomeTax(total, joint, stateCode, stateData);
  const threshold = joint ? 250000 : 200000;
  const fica = .062*Math.min(wages,184500) + .0145*wages
    + .009*(Math.max(0, wages+spouse-threshold) - Math.max(0, spouse-threshold));
  const sdi = civilianCa && stateCode === 'CA' ? .013*wages : 0;   // CA disability insurance
  return income(wages+spouse) - income(spouse) + fica + sdi;
}

// ---------- defaults ----------
export const specialties = {im:'Internal medicine', fm:'Family medicine', peds:'Pediatrics'};
export function defaultCivilianSalary(specialty, source='national') {
  return source === 'sandiego' ? benchmarks.marit.values[specialty] : benchmarks.doximity.values[specialty];
}
export const defaults = {
  yos:10, specialty:'im', rank:'O4', promotion:true, salarySource:'national', civilianSalary:null,
  family:'married', kids:0, spouseWages:80000,
  zip:'92134', bahMonthly:null, retentionBonus:true, continuationPay:true, retirement:'brs',
  navyState:'same', civilianState:'CA',
  pensionRate:.03, cashRate:.05, pensionTax:.22, currentAge:null, paymentYears:null,
  tricare:'employer', tricareGroup:'A', vaRating:0, sbp:false, survivorYears:7,
  firstYearShare:1, transitionCost:0, insurance:0, civilianGrowth:0,
  employerRetirement:.04, malpractice:0
};

// Remaining life expectancy (years) at a given age, from the embedded U.S. table.
export function remainingYears(age, lifeTable) {
  const a = Math.max(0, Math.min(100, Math.floor(age)));
  return lifeTable?.remaining?.[a] != null ? Math.max(1, Math.round(lifeTable.remaining[a])) : 30;
}

// ---------- main model ----------
export function stayOrGo(userInput, {stateData=null, lifeTable=null, bah=null} = {}) {
  const x = {...defaults, ...userInput};
  const yos = Math.floor(x.yos);
  if (!(yos >= 1 && yos <= 19)) throw new RangeError('Years of service must be 1–19 for a stay-to-20 decision');
  const years = 20 - yos;
  const family = x.family, withSpouse = family !== 'single', kids = family === 'single' ? 0 : x.kids;
  const civ = Number.isFinite(x.civilianSalary) && x.civilianSalary > 0 ? x.civilianSalary : defaultCivilianSalary(x.specialty, x.salarySource);
  const navyState = x.navyState === 'same' ? x.civilianState : x.navyState;
  const isBrs = x.retirement === 'brs';
  const rb = x.retentionBonus ? (rbRates.FY26[x.specialty]?.['4'] ?? 0) : 0;
  const bahMonthly = Number.isFinite(x.bahMonthly) ? x.bahMonthly : (bah?.monthly ?? 0);   // bah = bahFor(zip, rank, deps)
  const age = Number.isFinite(x.currentAge) ? x.currentAge : 26 + yos; // typical: active service starts after medical school at about 26
  const paymentYears = Number.isFinite(x.paymentYears) ? x.paymentYears : remainingYears(age + years, lifeTable);

  const cash = calculateScenario({rank:x.rank, commissionYear:2026 - yos, promotionOn:x.promotion,
    payYos:yos, base:payFor(x.rank, yos), bah:bahMonthly, bahLookup:Number.isFinite(x.bahMonthly) ? null : (bah ?? null), zip:x.zip,
    deps:withSpouse ? 'yes' : 'no', rbRemaining:Math.min(4, years), currentBonus:rb,
    continuationPayMultiple:x.continuationPay ? 2.5 : 0, isBrs,
    civilianSalary:civ, civilianGrowth:x.civilianGrowth, civilianFirstYearShare:x.firstYearShare,
    discount:x.cashRate, years});

  const va = vaAnnualFor(x.vaRating, withSpouse);
  const workerPremium = withSpouse ? kff2025.familyWorker : kff2025.singleWorker;
  const taxCtx = {family, kids, spouseWages:x.spouseWages, stateData};
  const rows = cash.rows.map((r, i) => {
    const navyTaxable = r.navyCash - 12*(r.bahMonthly + 328.48);           // BAH and BAS are tax-free
    const navyTax = wageTax(navyTaxable, {...taxCtx, stateCode:navyState});
    const tsp = isBrs ? .05*12*r.basicMonthly : 0;                          // BRS matching
    const civilianTax = wageTax(r.civilianCash, {...taxCtx, stateCode:x.civilianState, civilianCa:true});
    const civilianRetirement = x.employerRetirement * Math.min(r.civilianCash, 360000);
    const navy = r.navyCash - navyTax + tsp;
    const civilian = r.civilianCash - civilianTax + civilianRetirement - workerPremium
      - x.malpractice - x.insurance - (i === 0 ? x.transitionCost : 0) + va;
    return {year:r.year, yos:r.activeYos, grade:r.grade, navyCash:r.navyCash, civilianCash:r.civilianCash,
      navyTax, civilianTax, navy, civilian, gap:civilian - navy, continuationPay:r.continuationPay,
      basicMonthly:r.basicMonthly, bonus:r.bonus};
  });

  const cashFactor = i => 1/Math.pow(1+x.cashRate, i+1);
  const costOfStaying = rows.reduce((s,r,i) => s + r.gap*cashFactor(i), 0);

  // High-3: average basic pay of the last three stay-path years.
  const lastThree = rows.slice(-3).map(r => 12*r.basicMonthly);
  const pensionBase = lastThree.reduce((a,b)=>a+b,0)/lastThree.length;
  const retireeHealth = retireeTricareValue({family:withSpouse, mode:x.tricare, group:x.tricareGroup});
  const vaOffset = x.vaRating >= crdpThreshold ? 0 : va;
  const pensionAt = (activeYears, age0) => pensionPresentValue({activeYears, additionalYears:20-activeYears,
    retirement:x.retirement, pensionBase, currentAge:age0, paymentYears, pensionTax:x.pensionTax,
    discount:x.pensionRate, retireeHealthAnnual:retireeHealth, vaOffsetAnnual:vaOffset,
    sbp:x.sbp, survivorYears:x.survivorYears});
  const pensionValue = pensionAt(yos, age);
  const net = pensionValue - costOfStaying;

  // Break-even path: at each future year of service, pension kept vs the
  // remaining cost of staying, both valued at that year.
  const path = rows.map((_, k) => {
    const rest = rows.slice(k);
    const cost = rest.reduce((s,r,i) => s + r.gap/Math.pow(1+x.cashRate, i+1), 0);
    const pension = pensionAt(yos + k, age + k);
    return {yos:yos + k, pension, cost, net:pension - cost};
  });
  let breakEven = null;
  if (path[0].net >= 0) breakEven = yos;
  else for (let k = 1; k < path.length; k++) if (path[k-1].net < 0 && path[k].net >= 0) {
    breakEven = path[k-1].yos + (-path[k-1].net)/(path[k].net - path[k-1].net); break;
  }

  return {input:{...x, civilianSalary:civ, navyState, age, paymentYears, bahMonthly}, rows, years,
    costOfStaying, pensionValue, net, breakEven, path,
    parts:{retireeHealth, va, vaOffset, pensionBase, annualPension:pensionBase*(isBrs?.02:.025)*20, rb}};
}

// Which inputs move the answer most: change one input at a time between a
// low and a high plausible value and record the net value of staying.
export function sensitivity(input, ctx) {
  const base = stayOrGo(input, ctx).net;
  const x = {...defaults, ...input};
  const civ = Number.isFinite(x.civilianSalary) && x.civilianSalary > 0 ? x.civilianSalary : defaultCivilianSalary(x.specialty, x.salarySource);
  const tests = [
    ['Civilian salary ±15%', {civilianSalary:civ*.85}, {civilianSalary:civ*1.15}],
    ['Pension discount rate 2% to 5%', {pensionRate:.02}, {pensionRate:.05}],
    ['Promotion to O-5 / none', {promotion:true}, {promotion:false}],
    ['Navy tax state: no income tax / same as civilian', {navyState:'FL'}, {navyState:'same'}],
    ['Retiree TRICARE: none / no employer coverage', {tricare:'none'}, {tricare:'full'}],
    ['First civilian year at 80% / 100%', {firstYearShare:.8}, {firstYearShare:1}],
    ['Retention bonus: yes / no', {retentionBonus:true}, {retentionBonus:false}],
    ['Cash discount rate 3% to 7%', {cashRate:.03}, {cashRate:.07}]
  ];
  return tests.map(([label, a, b]) => {
    const va = stayOrGo({...input, ...a}, ctx).net - base, vb = stayOrGo({...input, ...b}, ctx).net - base;
    return {label, low:Math.min(va,vb), high:Math.max(va,vb), swing:Math.abs(va - vb)};
  }).sort((p,q) => q.swing - p.swing);
}
