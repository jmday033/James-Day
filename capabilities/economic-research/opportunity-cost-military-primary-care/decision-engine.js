import {calculateScenario, payFor, gradeForYear, annualPension} from './calc-engine.js?v=20260920-decisions';

export const modelVersion = '2026-09-20.1';
export function annuityFactor(years, rate) {
  return Array.from({length: years}, (_, i) => (1 + rate) ** -(i + 1)).reduce((a, b) => a + b, 0);
}
export function cumulativeCash(rows) {
  let total = 0;
  return rows.map(row => (total += row.discountedGap));
}

// Same year-start pay longevity convention as the annual cash engine.
export function projectedHigh3(input, serviceYears) {
  const annual = Array.from({length: 3}, (_, j) => {
    const i = serviceYears - 3 + j;
    const grade = i < 0 ? input.rank : gradeForYear(input, i);
    if (i === 0 && grade === input.rank) return 12 * input.base;
    return 12 * payFor(grade, Math.max(0, input.payYos + i));
  });
  return annual.reduce((a, b) => a + b, 0) / 3;
}

export function pensionAtSeparation(input, serviceYears) {
  if (!input.includePension) return {annual: 0, pv: 0, start: 0, payments: 0};
  const active = input.activeYears + serviceYears;
  let annual = 0, start = serviceYears;
  if (active >= 20) {
    const high3 = serviceYears === 0 ? (input.high3Now > 0 ? input.high3Now : projectedHigh3(input, 0))
      : input.retirement === 'legacy' ? input.high3 : projectedHigh3(input, serviceYears);
    annual = annualPension({pensionBase: high3, creditableYears: active + (input.usuYears || 0), retirement: input.retirement});
  } else if (serviceYears === 0 && input.includeReserve && input.reserveYears >= 20) {
    start = input.reservePayAge - input.currentAge;
    if (start < 0) throw new RangeError('Reserve pension cannot start before the current age.');
    annual = annualPension({pensionBase: input.reserveHigh3, creditableYears: input.reservePoints / 360, retirement: input.retirement});
  }
  const payments = input.paymentYearsForAge ? input.paymentYearsForAge(input.currentAge + start) : input.paymentYears;
  annual *= 1 - input.pensionTax;
  return {annual, start, payments, pv: annual * annuityFactor(payments, input.discount) / (1 + input.discount) ** start};
}

export function compareCareerPaths(input) {
  const horizon = input.comparisonYears;
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 60) throw new RangeError('Shared comparison period must be 1–60 years.');
  if (!Number.isFinite(input.currentAge) || !Number.isFinite(input.workUntilAge) || input.workUntilAge < input.currentAge || input.workUntilAge > 100) throw new RangeError('Civilian work-end age must be between your current age and 100.');
  if (![input.navyHours,input.civilianHours].every(n=>Number.isFinite(n)&&n>0&&n<=8760)) throw new RangeError('Annual work hours must be greater than zero and no more than 8760.');
  const retirementYears = Math.max(0, Math.ceil(20 - input.activeYears));
  const serviceChoices = [0, input.years, retirementYears];
  if (Math.max(...serviceChoices) > horizon) throw new RangeError('Shared comparison period must include all selected service paths.');
  const navy = calculateScenario({...input, years: Math.max(1, ...serviceChoices), pensionAnnual: 0, netPensionPV: 0});
  const names = ['Leave now', 'Stay through selected period', input.activeYears >= 20 ? 'Retire now (already eligible)' : 'Stay to 20 active years'];
  const paths = serviceChoices.map((serviceYears, pathIndex) => {
    const pension = pensionAtSeparation(input, serviceYears);
    let workPV = 0, pensionWithinPV = 0;
    const rows = Array.from({length: horizon}, (_, i) => {
      const military = i < serviceYears;
      const working = military || input.currentAge + i < input.workUntilAge;
      const salary = working && !military ? input.civilianSalary * (1 + input.civilianGrowth) ** i : 0;
      const tax = !salary ? 0 : input.civilianTaxForYear ? input.civilianTaxForYear(salary, i)
        : Math.max(0, input.civilianTax + (salary - input.civilianSalary) * input.growthTax);
      // A one-time tail is paid when civilian work ends, not in every future year.
      const tail = !military && working && input.currentAge + i + 1 >= input.workUntilAge ? (input.tailCost || 0) : 0;
      const cash = military ? navy.rows[i].navyTakeHome : salary - tax - (working ? input.malpractice + input.health : 0) - tail;
      const education = input.giTotal == null ? input.gi : serviceYears > 0 ? input.giTotal / serviceYears : 0;
      const benefits = military ? navy.rows[i].tsp + education : working ? input.civilianBenefits : 0;
      const pensionCash = i >= pension.start && i < pension.start + pension.payments ? pension.annual : 0;
      const factor = (1 + input.discount) ** -(i + 1);
      workPV += (cash + benefits) * factor;
      pensionWithinPV += pensionCash * factor;
      const hours = working ? military ? input.navyHours : input.civilianHours : 0;
      return {year: 2027 + i, stage: military ? 'Active Navy' : working ? 'Civilian work' : 'After work', cash, benefits, pensionCash,
        takeHome: cash + pensionCash, hourlyCash: hours > 0 ? cash / hours : null};
    });
    return {name: names[pathIndex], serviceYears, feasible: serviceYears >= (input.minimumServiceYears || 0), rows,
      workPV, pensionPV: pension.pv, pensionBeyondHorizonPV: Math.max(0, pension.pv - pensionWithinPV), totalPV: workPV + pension.pv};
  });
  const baseline = paths[0].totalPV;
  return paths.map(path => ({...path, advantageVsLeave: path.totalPV - baseline}));
}

export function solveThreshold(evaluate, lower = 0, upper = 2000000) {
  let lo = lower, hi = upper, a = evaluate(lo), b = evaluate(hi);
  if (![a,b].every(Number.isFinite)) return null;
  if (Math.abs(a) < .01) return lo;
  if (Math.abs(b) < .01) return hi;
  if (Math.sign(a) === Math.sign(b)) return null;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2, value = evaluate(mid);
    if (!Number.isFinite(value)) return null;
    if (Math.abs(value) < .01) return mid;
    if (Math.sign(value) === Math.sign(a)) { lo = mid; a = value; } else hi = mid;
  }
  return (lo + hi) / 2;
}

export function decisionSensitivity(input) {
  const difference = overrides => {
    const paths = compareCareerPaths({...input, ...overrides});
    return paths[1].advantageVsLeave;
  };
  return [
    {label:'Civilian salary −10% / +10%', low:difference({civilianSalary:input.civilianSalary*.9}), high:difference({civilianSalary:input.civilianSalary*1.1})},
    {label:'Discount rate −2 / +2 percentage points', low:difference({discount:Math.max(0,input.discount-.02)}), high:difference({discount:Math.min(.2,input.discount+.02)})},
    {label:'Annual RB −$10,000 / +$10,000 (existing term)', low:difference({currentBonus:Math.max(0,input.currentBonus-10000)}), high:difference({currentBonus:input.currentBonus+10000})},
    {label:'Leave selected path one year earlier / later', low:difference({years:Math.max(0,input.years-1)}), high:difference({years:Math.min(30,input.comparisonYears,input.years+1)})}
  ];
}
