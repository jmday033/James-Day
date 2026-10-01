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

// ---------- VA staff physician and FERS (2026) ----------
// VA pay: Title 38 Pay Table 1 or 2, Tier 1 (staff physician) maximum, effective
// Jan. 11, 2026 (va.gov/OHRM/Pay/2026/PDOP/PayTables.pdf). Table 2 lists the
// surgical, procedural, and hospital-based specialties below; all others are Table 1.
const vaTable2 = new Set(['anes','cards','pulm','derm','em','gi','obgyn','hemonc','nephro','ophtho','ent',
  'path','rads','ir','radonc','gensurg','ortho','neurosurg','uro','thoracic','vascular','plastics','pedsurg']);
export const vaPayCap = key => vaTable2.has(key) ? 400000 : 315000;
// FERS: 3% military deposit (OPM Service Credit, post-2000 service), FERS-FRAE
// employee contribution 4.4% (hired after 2013), TSP agency 1% + 4% match,
// minimum retirement age 57. colaGap: FERS COLA is CPI minus up to 1 point
// ("diet COLA"), so the annuity loses about 0.5% a year in real terms.
export const fers = {depositRate:.03, employeeRate:.044, tspAgency:.05, mra:57, colaGap:.005};

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
  employerRetirement:averages.employerRetirement, malpractice:0,
  reservePoints:77, reserveStartAge:60, reserveDaysMissed:10,
  vaSalary:null, vaBuyback:true
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

  // Third path: leave active duty now (or when the obligation ends), take the
  // civilian job, and finish 20 qualifying years in the Selected Reserve.
  // Valued against leaving outright, so the civilian career cancels out except
  // for workdays missed for annual training. Non-regular retirement (10 U.S.C.
  // 12731-12733): points/360 x multiplier x High-3, paid from age 60 (earlier
  // only with qualifying mobilizations, entered as the start age). TRICARE
  // before 60 is TRICARE Retired Reserve at full cost, so only 60-65 is valued.
  // High-3 reuses the active path's final-years basic pay in today's dollars.
  // Not modeled: Reserve special pays, mobilization, RCSBP, VA offset.
  const reserveYears = years - obligation;
  const points = 365*(yos + obligation) + x.reservePoints*reserveYears;
  const equivalentYears = points/360;
  const reservePension = pensionBase*(isBrs?.02:.025)*equivalentYears;
  const startAge = Math.max(age + years, x.reserveStartAge);
  const deathAge = age + years + paymentYears;
  const reservePayYears = Math.max(0, deathAge - startAge);
  const toStart = Math.pow(1+x.pensionRate, startAge - age);
  const reservePensionValue = reservePension*(1-pensionTax)*annuity(x.pensionRate, reservePayYears)/toStart;
  const reserveHealthValue = retireeHealth*annuity(x.pensionRate, Math.max(0, Math.min(65, deathAge) - startAge))/toStart;
  const missedLoss = civNetOf(civ) - civNetOf(civ*(1 - x.reserveDaysMissed/260));
  const reserveCash = rows.map((r,i) => {
    if (i < obligation) return 0;
    const drill = r.basicMonthly*(48 + 14)/30;            // 48 drills + 14 days annual training
    const tax = wageTax(civ + drill, {...taxCtx, stateCode:x.civilianState}) - wageTax(civ, {...taxCtx, stateCode:x.civilianState});
    return (drill - tax + (isBrs ? .05*drill : 0) - missedLoss)*cashFactor(i);
  });
  const reserveDrillValue = reserveCash.reduce((a,b)=>a+b,0);
  const reserve = {points, equivalentYears, annualPension:reservePension, startAge, payYears:reservePayYears,
    pensionValue:reservePensionValue, healthValue:reserveHealthValue, drillValue:reserveDrillValue,
    net:reservePensionValue + reserveHealthValue + reserveDrillValue};

  // Fourth path: leave active duty now (or when the obligation ends) for a VA
  // staff physician job and pay the FERS military service deposit to credit the
  // active years (5 U.S.C. 8411(c); OPM Service Credit). Valued against leaving
  // for the private civilian job, until the work-until age.
  const vaCap = vaPayCap(x.specialty);
  const vaSalary = Number.isFinite(x.vaSalary) && x.vaSalary > 0 ? x.vaSalary : Math.min(civ, vaCap);
  const militaryYears = yos + obligation;
  const decisionAge = age + obligation;
  const vaYears = Math.max(0, Math.round(x.workUntilAge - decisionAge));
  // Deposit: 3% of military basic pay (post-2000 rate). Past years use the
  // 2026 table at the grade held then (O-4 from commissioning, O-5 at 15,
  // O-6 at 21, capped at current rank), which overstates the deposit slightly.
  const ranks = ['O4','O5','O6'];
  const pastGrade = s => ranks[Math.min(ranks.indexOf(x.rank), s >= 21 ? 2 : s >= 15 ? 1 : 0)];
  const pastBasic = Array.from({length:yos}, (_, s) => 12*payFor(pastGrade(s), s)).reduce((a,b)=>a+b,0)
    + rows.slice(0, obligation).reduce((a,r)=>a + 12*r.basicMonthly, 0);
  const deposit = fers.depositRate*pastBasic;
  // Salary difference each year: VA pay after tax, TSP agency contributions and
  // the FERS-FRAE employee contribution, with FTCA malpractice coverage, versus
  // the private job as elsewhere on the page. Health premiums, disability
  // insurance, VA disability pay, and the cost of leaving are the same on both.
  let vaSalaryGap = 0;
  for (let k = 0; k < vaYears; k++) {
    const i = obligation + k, grow = Math.pow(1+x.civilianGrowth, i);
    const s = civ*grow*(k === 0 ? x.firstYearShare : 1), v = vaSalary*grow;
    const civNet = s - wageTax(s, {...taxCtx, stateCode:x.civilianState, civilianCa:true})
      + x.employerRetirement*Math.min(s, 360000) - x.malpractice;
    const vaNet = v - wageTax(v, {...taxCtx, stateCode:x.civilianState})
      + fers.tspAgency*v - fers.employeeRate*v;
    vaSalaryGap += (vaNet - civNet)*cashFactor(i);
  }
  const high3 = vaSalary*Math.pow(1+x.civilianGrowth, Math.max(0, obligation + vaYears - 2));
  const fersPension = creditYears => {
    const sepAge = decisionAge + vaYears;
    if (vaYears < 5) return {annual:0, startAge:sepAge, multiplier:0, value:0};   // not vested
    const immediate = (sepAge >= 62) || (sepAge >= 60 && creditYears >= 20) || (sepAge >= fers.mra && creditYears >= 30);
    const startAge = immediate ? sepAge : 62;                                     // otherwise deferred to 62
    const multiplier = startAge >= 62 && sepAge >= 62 && creditYears >= 20 ? .011 : .010;
    const annual = multiplier*creditYears*high3;
    const tax = Number.isFinite(x.pensionTax) ? x.pensionTax : marginalFederalRate(annual, withSpouse);
    const payYears = Math.max(0, deathAge - startAge);
    const eroded = (1+x.pensionRate)*(1+fers.colaGap) - 1;                     // FERS COLA trails CPI
    const value = annual*(1-tax)*annuity(eroded, payYears)/Math.pow(1+x.pensionRate, startAge - age);
    return {annual, startAge, multiplier, value};
  };
  const withBuyback = fersPension(vaYears + militaryYears), noBuyback = fersPension(vaYears);
  const depositValue = deposit*cashFactor(obligation);
  const buyback = x.vaBuyback !== false && vaYears >= 5;
  const vaPath = {salary:vaSalary, cap:vaCap, years:vaYears, militaryYears, salaryGapValue:vaSalaryGap,
    deposit, depositValue, withBuyback, noBuyback, buyback,
    buybackGain:withBuyback.value - noBuyback.value - depositValue,
    pension:buyback ? withBuyback : noBuyback,
    net:vaSalaryGap + (buyback ? withBuyback.value - depositValue : noBuyback.value)};

  return {input:{...x, civilianSalary:civ, navyState, age, paymentYears, bahMonthly, insurance, pensionTax}, rows, years,
    costOfStaying, afterTwentyCost, pensionValue, net, breakEven, path, obligation, decisionYos:yos + obligation, reserve, va:vaPath,
    parts:{retireeHealth, va, vaOffset, pensionBase, annualPension:pensionBase*(isBrs?.02:.025)*20, rb, rbMode, postYears}};
}

// ---------- what the difference buys ----------
// Translates the headline (today's dollars, after tax) into household goals.
// College: College Board, Trends in College Pricing and Student Aid 2025,
// average 2025-26 full budgets (tuition, fees, housing, food, books, transport).
export const collegeBudgets2025 = {public:30990, private:65470};
// 4% initial withdrawal rate (Bengen, 1994) used only to express the pension
// as the savings that would produce the same gross income.
export const withdrawalRate = .04;
export const goalDefaults = {annualSpending:120000, collegePerYear:collegeBudgets2025.public,
  collegeKids:null, debt:0, secondHome:0};
// Savings needed each year, at a real after-tax return, to build `target` in n
// years (future value of an annuity). Follows Dahle's WCI table (2012), which
// asked the same question at 5% after inflation, expenses, and taxes.
export const savingsReturn = .05;
export const annualSavingsFor = (target, n, rate=savingsReturn) =>
  n <= 0 ? target : rate === 0 ? target/n : target*rate/(Math.pow(1+rate, n) - 1);

export function goalCoverage(r, goals={}) {
  const g = {...goalDefaults, ...goals};
  const value = Math.abs(r.net), stayWins = r.net >= 0;
  const kids = Number.isFinite(g.collegeKids) ? g.collegeKids : r.input.family === 'single' ? 0 : r.input.kids;
  const items = [
    {key:'spending', label:'Years of household spending', need:g.annualSpending},
    {key:'college', label:kids + (kids === 1 ? ' child' : ' children') + ' through 4 years of college', need:kids*4*g.collegePerYear},
    {key:'debt', label:'Mortgage or other debt paid off', need:g.debt},
    {key:'home', label:'Second home', need:g.secondHome}
  ].filter(t => t.need > 0).map(t => ({...t, share:value/t.need}));
  // Timing: before 20 the civilian path pays more cash; after 20 the stay path
  // pays a pension for life. The pension is income, not a lump sum.
  const cashBefore20 = r.costOfStaying - r.afterTwentyCost;
  const pensionGross = r.parts.annualPension, pensionNet = pensionGross*(1 - r.input.pensionTax);
  const pensionStartAge = r.input.age + r.years;
  // Matching the pension by saving instead: the target is the same at 20,
  // so only the years left to save change with years already served.
  const savingsEquivalent = pensionGross/withdrawalRate;
  const yos = r.input.yos, savingsTable = [...new Set([4, 8, 12, 16, Math.floor(yos)])].sort((a,b) => a - b)
    .map(y => ({yos:y, yearsLeft:20 - y, perYear:annualSavingsFor(savingsEquivalent, 20 - y), current:y === Math.floor(yos)}));
  return {value, stayWins, kids, items, spendingYears:g.annualSpending > 0 ? value/g.annualSpending : null,
    savingsReturn, savingsPerYear:annualSavingsFor(savingsEquivalent, r.years), savingsTable,
    cashBefore20, pensionGross, pensionNet, pensionStartAge,
    pensionShareOfSpending:g.annualSpending > 0 ? pensionNet/g.annualSpending : null,
    savingsEquivalent, goals:{...g, collegeKids:kids}};
}

// ---------- can you change your mind later? ----------
// When could someone who stays now still leave, and what would it cost by then?
// Obligations: the current obligation, 4-year retention-bonus agreements, and
// BRS continuation pay, which in the Navy obligates 4 years from the 12th year
// and runs concurrently with other obligations (MCCareer guest post, 2020;
// confirm with BUMED Special Pays). Shorter 2- or 3-year bonus agreements pay
// less per year but open more exit windows; only 4-year rates are modeled.
export const cpObligationYears = 4;

export function exitWindows(userInput, ctx={}, {laterSalary=null, laterFromYos=null}={}) {
  const r = stayOrGo(userInput, ctx);
  const f = r.input, yos = Math.floor(f.yos), years = r.years, ob = r.obligation;
  const rbMode = f.retentionBonus === false ? 'none' : f.rbMode;
  const cf = i => 1/Math.pow(1+f.cashRate, i+1);
  const civ = f.civilianSalary, later = Number.isFinite(laterSalary) && laterSalary > 0 ? laterSalary : civ;
  const taxCtx = {family:f.family, kids:f.family === 'single' ? 0 : f.kids, spouseWages:f.spouseWages, stateData:ctx.stateData};
  const civNetOf = s => s - wageTax(s, {...taxCtx, stateCode:f.civilianState, civilianCa:true})
    + f.employerRetirement*Math.min(s, 360000) - averages.disabilityShare*s;
  // Present value, at today's date, of earning `later` instead of `civ` from
  // year index i until the work-until age (pay cut p applies to both).
  // The later salary (e.g., after a Navy fellowship) is available only to
  // someone who stays at least until `laterFromYos`; leaving now forgoes it.
  const laterFrom = Number.isFinite(laterFromYos) ? laterFromYos : yos + ob + 1;
  const laterGainAt = (i, p) => {
    if (later === civ || yos + i < laterFrom) return 0;
    const n = Math.max(0, Math.round(f.workUntilAge - (f.age + i)));
    let s = 0;
    for (let k = 0; k < n; k++) {
      const j = i + k, grow = Math.pow(1+f.civilianGrowth, j);
      s += (civNetOf(later*grow*(1-p)) - civNetOf(civ*grow*(1-p)))*cf(j);
    }
    return s;
  };
  const cpIndex = f.retirement === 'brs' && f.continuationPay && yos < 12 ? 12 - yos : null;
  // The decision point itself (now, or when the current obligation ends) is
  // always a window: a physician who leaves then signs no new agreement.
  const lockedBy = i => {
    const why = [];
    if (i === ob) return why;
    if (i < ob) why.push('current obligation');
    if (rbMode === 'renew' && i > ob && (i - ob) % 4 !== 0) why.push('retention bonus agreement');
    if (rbMode === 'one' && i > ob && i < ob + 4) why.push('retention bonus agreement');
    if (cpIndex !== null && i >= cpIndex && i < cpIndex + cpObligationYears) why.push('continuation pay obligation');
    return why;
  };
  let costSoFar = 0;
  const windows = [];
  for (let i = 0; i <= years; i++) {
    if (i > 0) costSoFar += r.rows[i-1].gap*cf(i-1);
    if (i < ob) continue;
    const atTwenty = i === years, why = atTwenty ? [] : lockedBy(i);
    const laterGain = laterGainAt(i, atTwenty ? f.postTwentyPenalty : 0);
    const net = atTwenty ? r.net + laterGain : -costSoFar + laterGain;
    windows.push({yos:yos + i, index:i, free:why.length === 0, lockedBy:why, costSoFar, laterGain, net, atTwenty});
  }
  const freeBefore20 = windows.filter(w => w.free && !w.atTwenty && w.index > ob);
  return {result:r, windows, laterSalary:later, laterFromYos:laterFrom, nextExit:freeBefore20[0] ?? null,
    lastExit:freeBefore20.at(-1) ?? null, freeCount:freeBefore20.length};
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
