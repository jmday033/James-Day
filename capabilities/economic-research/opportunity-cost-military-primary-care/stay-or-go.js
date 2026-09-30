// Stay-or-go model for the answer-first page (stay-or-go.html).
// Question: for a physician below 20 active years, what is staying to 20
// worth, in today's dollars, compared with leaving now for a civilian job?
// Reuses calc-engine.js for Navy pay, bonus, promotion, continuation pay,
// pension, retiree health, VA and SBP rules. Taxes use 2026 federal rules and
// the lab's 2026 state wage-tax sample (data/state-tax-2026.json).
import {calculateScenario, payFor, rbRates, benchmarks, pensionPresentValue,
  vaAnnualFor, crdpThreshold, retireeTricareValue, kff2025} from './calc-engine.js?v=20260929-stayorgo';
// Re-exported so the page shares this module's single copy of the engine and its loaded BAH data.
export {loadReferenceData, bahFor, payFor, benchmarks, malpracticeRanges} from './calc-engine.js?v=20260929-stayorgo';

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

export function marginalFederalRate(income, joint) {
  const key = joint ? 'joint' : 'single', taxable = income - standardDeduction[key];
  return federalBrackets[key].reduce((rate,[floor,r]) => taxable > floor ? r : rate, 0);
}

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

// ---------- all specialties ----------
// civ: Doximity 2026 national average compensation. ip / rb4: FY 2026 Navy
// Medical Corps incentive pay and 4-year retention bonus (annual), DFAS table.
// cat: Navy subspecialty category where the specialty has no row of its own;
// category membership follows BUMED's published descriptions (Cat III: allergy,
// immunology, nephrology, hematology/oncology; Cat IV: other IM/peds
// subspecialties). Surgical subspecialties are assumed to be Category I.
const I={ip:72000,rb4:110000}, III={ip:46000,rb4:48000}, IV={ip:46000,rb4:48000};
export const specialtyTable = [
  // group, key, label, civilian, ip, rb4, note
  ['Primary care','im','Internal medicine',339274,43000,48000],
  ['Primary care','fm','Family medicine',325040,43000,48000],
  ['Primary care','peds','Pediatrics',273665,43000,35000],
  ['Primary care','medpeds','Medicine–pediatrics',319995,43000,48000,'Navy internal medicine rates assumed'],
  ['Medicine subspecialties','cards','Cardiology',604635,69000,76000],
  ['Medicine subspecialties','gi','Gastroenterology',531345,54000,58000],
  ['Medicine subspecialties','pulm','Pulmonary/critical care',441472,60000,63000],
  ['Medicine subspecialties','hemonc','Hematology/oncology',519715,III.ip,III.rb4,'Civilian: Doximity oncology; Navy subspecialty Category III'],
  ['Medicine subspecialties','nephro','Nephrology',385965,III.ip,III.rb4,'Navy subspecialty Category III'],
  ['Medicine subspecialties','allergy','Allergy and immunology',335978,III.ip,III.rb4,'Navy subspecialty Category III'],
  ['Medicine subspecialties','id','Infectious disease',337353,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Medicine subspecialties','rheum','Rheumatology',321778,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Medicine subspecialties','endo','Endocrinology',309782,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Medicine subspecialties','geri','Geriatrics',304411,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Hospital-based','em','Emergency medicine',423723,54000,76000],
  ['Hospital-based','anes','Anesthesiology',557131,66000,105000],
  ['Hospital-based','rads','Radiology (diagnostic)',609684,66000,76000],
  ['Hospital-based','ir','Interventional radiology',634658,66000,76000,'Navy radiology rates assumed'],
  ['Hospital-based','radonc','Radiation oncology',613837,66000,76000,'Navy radiology (therapeutic) rates'],
  ['Hospital-based','path','Pathology',410039,48000,35000],
  ['Surgery','gensurg','General surgery',501003,66000,105000],
  ['Surgery','ortho','Orthopedic surgery',696852,66000,105000],
  ['Surgery','neurosurg','Neurosurgery',829161,75000,150000],
  ['Surgery','ent','Otolaryngology (ENT)',549810,60000,48000],
  ['Surgery','uro','Urology',566740,60000,55000],
  ['Surgery','ophtho','Ophthalmology',487438,54000,37000],
  ['Surgery','obgyn','Obstetrics and gynecology',420859,60000,46000],
  ['Surgery','thoracic','Cardiothoracic surgery',749707,I.ip,I.rb4,'Assumed Navy subspecialty Category I; confirm with BUMED'],
  ['Surgery','vascular','Vascular surgery',600520,I.ip,I.rb4,'Assumed Navy subspecialty Category I; confirm with BUMED'],
  ['Surgery','plastics','Plastic surgery',625757,I.ip,I.rb4,'Assumed Navy subspecialty Category I; confirm with BUMED'],
  ['Surgery','pedsurg','Pediatric surgery',627126,I.ip,I.rb4,'Assumed Navy subspecialty Category I; confirm with BUMED'],
  ['Other adult specialties','derm','Dermatology',497509,48000,43000],
  ['Other adult specialties','neuro','Neurology',371087,48000,30000],
  ['Other adult specialties','psych','Psychiatry',350786,48000,65000],
  ['Other adult specialties','pmr','Physical medicine and rehabilitation',376234,43000,30000],
  ['Other adult specialties','occmed','Occupational medicine',329380,43000,35000],
  ['Other adult specialties','prevmed','Preventive medicine',265825,43000,35000],
  ['Pediatric subspecialties','neonat','Neonatology',364388,50000,63000],
  ['Pediatric subspecialties','pedcards','Pediatric cardiology',365395,69000,76000],
  ['Pediatric subspecialties','pedem','Pediatric emergency medicine',332579,54000,76000,'Navy emergency medicine rates assumed'],
  ['Pediatric subspecialties','childneuro','Child neurology',309593,48000,30000],
  ['Pediatric subspecialties','pedgi','Pediatric gastroenterology',311433,54000,58000],
  ['Pediatric subspecialties','pedpulm','Pediatric pulmonology',278452,60000,63000],
  ['Pediatric subspecialties','pedhemonc','Pediatric hematology/oncology',271021,III.ip,III.rb4,'Navy subspecialty Category III'],
  ['Pediatric subspecialties','pednephro','Pediatric nephrology',269825,III.ip,III.rb4,'Navy subspecialty Category III'],
  ['Pediatric subspecialties','pedendo','Pediatric endocrinology',242274,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Pediatric subspecialties','pedid','Pediatric infectious disease',217819,IV.ip,IV.rb4,'Navy subspecialty Category IV'],
  ['Pediatric subspecialties','pedrheum','Pediatric rheumatology',236011,IV.ip,IV.rb4,'Navy subspecialty Category IV']
].map(([group,key,label,civ,ip,rb4,note]) => ({group,key,label,civ,ip,rb4,note:note||''}));
export const specialtyByKey = Object.fromEntries(specialtyTable.map(r => [r.key, r]));
export const sanDiegoAvailable = key => ['im','fm','peds'].includes(key);

// ---------- defaults ----------
export const specialties = {im:'Internal medicine', fm:'Family medicine', peds:'Pediatrics'};
export function defaultCivilianSalary(specialty, source='national') {
  if (source === 'sandiego' && sanDiegoAvailable(specialty)) return benchmarks.marit.values[specialty];
  const row = specialtyByKey[specialty];
  if (!row) throw new RangeError('Unknown specialty');
  return row.civ;
}
// Published averages used as starting values. See `averageNotes` for sources.
export const averages = {
  spouseWages:65000,        // BLS: median full-time weekly earnings $1,251 in 2026 Q2 × 52
  employerRetirement:.046,  // Vanguard How America Saves 2025: average promised match 4.6% of pay
  disabilityShare:.03,      // White Coat Investor: own-occupation disability ~2–5% of income
  transitionCost:2500,      // DEA registration $888 per 3 years + state license, credentialing; moving often employer-paid
  civilianGrowth:0,         // Doximity 2026: physician pay +2% in 2025, below 3.4% CPI (Aug 2026)
  ageAtServiceStart:27,     // typical age at medical-school graduation, when active service usually begins
  survivorYears:7           // planning assumption
};
export const defaults = {
  yos:10, specialty:'im', rank:'O4', promotion:true, salarySource:'national', civilianSalary:null,
  family:'married', kids:0, spouseWages:averages.spouseWages,
  zip:'92134', bahMonthly:null, retentionBonus:true, continuationPay:true, retirement:'brs',
  navyState:'same', civilianState:'CA',
  pensionRate:.03, cashRate:.05, pensionTax:null, currentAge:null, paymentYears:null,
  tricare:'employer', tricareGroup:'A', vaRating:0, sbp:false, survivorYears:averages.survivorYears,
  firstYearShare:1, transitionCost:averages.transitionCost, insurance:null, civilianGrowth:averages.civilianGrowth,
  rbMode:'renew', obligationYears:0, postTwentyPenalty:.05, workUntilAge:65,
  employerRetirement:averages.employerRetirement, malpractice:0
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
  const spec = specialtyByKey[x.specialty];
  if (!spec) throw new RangeError('Unknown specialty');
  // Retention bonus: 'renew' = successive agreements through 20, 'one' = a single
  // 4-year agreement starting when any current obligation ends, 'none'.
  const rbMode = x.retentionBonus === false ? 'none' : x.rbMode;
  const rb = rbMode === 'none' ? 0 : spec.rb4;
  const obligation = Math.max(0, Math.min(years, Math.floor(x.obligationYears || 0)));
  const bahMonthly = Number.isFinite(x.bahMonthly) ? x.bahMonthly : (bah?.monthly ?? 0);   // bah = bahFor(zip, rank, deps)
  const age = Number.isFinite(x.currentAge) ? x.currentAge : averages.ageAtServiceStart + yos;
  const paymentYears = Number.isFinite(x.paymentYears) ? x.paymentYears : remainingYears(age + years, lifeTable);

  const cash = calculateScenario({rank:x.rank, commissionYear:2026 - yos, promotionOn:x.promotion,
    payYos:yos, base:payFor(x.rank, yos), bah:bahMonthly, bahLookup:Number.isFinite(x.bahMonthly) ? null : (bah ?? null), zip:x.zip,
    deps:withSpouse ? 'yes' : 'no', ip:spec.ip, rbRemaining:years, currentBonus:rb,
    continuationPayMultiple:x.continuationPay ? 2.5 : 0, isBrs,
    civilianSalary:civ, civilianGrowth:x.civilianGrowth, civilianFirstYearShare:1,
    discount:x.cashRate, years});

  const va = vaAnnualFor(x.vaRating, withSpouse);
  const workerPremium = withSpouse ? kff2025.familyWorker : kff2025.singleWorker;
  const taxCtx = {family, kids, spouseWages:x.spouseWages, stateData};
  const insurance = Number.isFinite(x.insurance) ? x.insurance : averages.disabilityShare * civ;
  const civNetOf = s => s - wageTax(s, {...taxCtx, stateCode:x.civilianState, civilianCa:true})
    + x.employerRetirement*Math.min(s, 360000) - averages.disabilityShare*s;
  const rows = cash.rows.map((r0, i) => {
    const inRb = rbMode === 'renew' || (rbMode === 'one' && i >= obligation && i < obligation + 4);
    const bonus = inRb ? r0.bonus : 0;
    const r = {...r0, navyCash:r0.navyCash - r0.bonus + bonus, bonus,
      civilianCash:r0.civilianCash * (i === obligation ? x.firstYearShare : 1)};
    const navyTaxable = r.navyCash - 12*(r.bahMonthly + 328.48);           // BAH and BAS are tax-free
    const navyTax = wageTax(navyTaxable, {...taxCtx, stateCode:navyState});
    const tsp = isBrs ? .05*12*r.basicMonthly : 0;                          // BRS matching
    const civilianTax = wageTax(r.civilianCash, {...taxCtx, stateCode:x.civilianState, civilianCa:true});
    const civilianRetirement = x.employerRetirement * Math.min(r.civilianCash, 360000);
    const navy = r.navyCash - navyTax + tsp;
    const civilian = r.civilianCash - civilianTax + civilianRetirement - workerPremium
      - x.malpractice - insurance - (i === obligation ? x.transitionCost : 0) + va;
    // Still obligated: both paths are in the Navy, so the year does not count.
    const obligated = i < obligation;
    return {year:r.year, yos:r.activeYos, grade:r.grade, navyCash:r.navyCash, civilianCash:r.civilianCash,
      navyTax, civilianTax, navy, civilian, gap:obligated ? 0 : civilian - navy, obligated, continuationPay:r.continuationPay,
      basicMonthly:r.basicMonthly, bonus:r.bonus};
  });

  const cashFactor = i => 1/Math.pow(1+x.cashRate, i+1);
  // After 20: the retiree starts a civilian job later than someone who left
  // earlier, so may earn less (lost seniority, partnership, clinical currency).
  const postYears = Math.max(0, Math.round(x.workUntilAge - (age + years)));
  const annuity = (r,n) => n <= 0 ? 0 : r === 0 ? n : (1-Math.pow(1+r,-n))/r;
  const civAt20 = civ*Math.pow(1+x.civilianGrowth, years);
  const postLoss = civNetOf(civAt20) - civNetOf(civAt20*(1 - x.postTwentyPenalty));
  const afterTwentyAt = k => postLoss*annuity(x.cashRate, postYears)/Math.pow(1+x.cashRate, years - k);
  const afterTwentyCost = afterTwentyAt(0);
  const costOfStaying = rows.reduce((s,r,i) => s + r.gap*cashFactor(i), 0) + afterTwentyCost;

  // High-3: average basic pay of the last three stay-path years.
  const lastThree = rows.slice(-3).map(r => 12*r.basicMonthly);
  const pensionBase = lastThree.reduce((a,b)=>a+b,0)/lastThree.length;
  const retireeHealth = retireeTricareValue({family:withSpouse, mode:x.tricare, group:x.tricareGroup});
  const vaOffset = x.vaRating >= crdpThreshold ? 0 : va;
  // Pension tax: if not entered, use the federal bracket the pension would fall in
  // while the retiree works the civilian job after 20.
  const grossPension = pensionBase*(isBrs?.02:.025)*20;
  const pensionTax = Number.isFinite(x.pensionTax) ? x.pensionTax : marginalFederalRate(civ + grossPension, withSpouse);
  const pensionAt = (activeYears, age0) => pensionPresentValue({activeYears, additionalYears:20-activeYears,
    retirement:x.retirement, pensionBase, currentAge:age0, paymentYears, pensionTax,
    discount:x.pensionRate, retireeHealthAnnual:retireeHealth, vaOffsetAnnual:vaOffset,
    sbp:x.sbp, survivorYears:x.survivorYears});
  const pensionValue = pensionAt(yos, age);
  const net = pensionValue - costOfStaying;

  // Break-even path: at each future year of service, pension kept vs the
  // remaining cost of staying, both valued at that year.
  const path = rows.map((_, k) => k).filter(k => k >= obligation).map(k => {
    const rest = rows.slice(k);
    const cost = rest.reduce((s,r,i) => s + r.gap/Math.pow(1+x.cashRate, i+1), 0) + afterTwentyAt(k);
    const pension = pensionAt(yos + k, age + k);
    return {yos:yos + k, pension, cost, net:pension - cost};
  });
  let breakEven = null;
  if (path[0].net >= 0) breakEven = path[0].yos;
  else for (let k = 1; k < path.length; k++) if (path[k-1].net < 0 && path[k].net >= 0) {
    breakEven = path[k-1].yos + (-path[k-1].net)/(path[k].net - path[k-1].net); break;
  }

  return {input:{...x, civilianSalary:civ, navyState, age, paymentYears, bahMonthly, insurance, pensionTax}, rows, years,
    costOfStaying, afterTwentyCost, pensionValue, net, breakEven, path, obligation, decisionYos:yos + obligation,
    parts:{retireeHealth, va, vaOffset, pensionBase, annualPension:pensionBase*(isBrs?.02:.025)*20, rb, rbMode, postYears}};
}

// Which inputs move the answer most: change one input at a time between a
// low and a high plausible value and record the net value of staying.
export function sensitivity(input, ctx) {
  const base = stayOrGo(input, ctx).net;
  const x = {...defaults, ...input};
  const civ = Number.isFinite(x.civilianSalary) && x.civilianSalary > 0 ? x.civilianSalary : defaultCivilianSalary(x.specialty, x.salarySource);
  const tests = [
    ['Civilian salary: 15% lower or higher', {civilianSalary:civ*.85}, {civilianSalary:civ*1.15}],
    ['How much the pension is worth today (2% to 5% discount rate)', {pensionRate:.02}, {pensionRate:.05}],
    ['Promoted to O-5, or not', {promotion:true}, {promotion:false}],
    ['Navy home state: no state income tax, or same state as the civilian job', {navyState:'FL'}, {navyState:'same'}],
    ['Retiree TRICARE: counted as worth $0, or as your only health plan', {tricare:'none'}, {tricare:'full'}],
    ['First civilian year: 80% or full pay while you ramp up', {firstYearShare:.8}, {firstYearShare:1}],
    ['Retention bonus: keep renewing to 20, or none', {rbMode:'renew'}, {rbMode:'none'}],
    ['Civilian job after retiring at 20: no pay cut, or 15% less', {postTwentyPenalty:0}, {postTwentyPenalty:.15}],
    ['How much future pay is worth today (3% to 7% discount rate)', {cashRate:.03}, {cashRate:.07}]
  ];
  return tests.map(([label, a, b]) => {
    const va = stayOrGo({...input, ...a}, ctx).net - base, vb = stayOrGo({...input, ...b}, ctx).net - base;
    return {label, low:Math.min(va,vb), high:Math.max(va,vb), swing:Math.abs(va - vb)};
  }).sort((p,q) => q.swing - p.swing);
}

// Likely range for the headline: combine the one-at-a-time swings in quadrature
// (treats them as independent), so it is wider than any single swing but
// narrower than stacking every worst case.
export function answerRange(net, sens) {
  const down = Math.sqrt(sens.reduce((s,t) => s + Math.min(0,t.low)**2, 0));
  const up = Math.sqrt(sens.reduce((s,t) => s + Math.max(0,t.high)**2, 0));
  return [net - down, net + up];
}
