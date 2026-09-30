export const boardCertificationPay = 8000; // FY26 paid BCP, not the $15,000 statutory ceiling.
export const fy26SpecialPayTableUrl = 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/HPO4/';
export function bonusStatusAllowsRate(status) { return status === 'signed' || status === 'eligible'; }
export const rbRates={
 FY25:{peds:{'2':15000,'3':20000,'4':35000,'6':null},im:{'2':13000,'3':23000,'4':40000,'6':null},fm:{'2':20000,'3':28000,'4':48000,'6':60000}},
 FY26:{peds:{'2':15000,'3':25000,'4':35000,'6':40000},im:{'2':20000,'3':28000,'4':48000,'6':60000},fm:{'2':20000,'3':28000,'4':48000,'6':60000}}
};
export const rbSourceUrls={FY25:'https://www.med.navy.mil/Portals/62/Documents/BUMED/Special%20Pays/FY25/FY25%20MC%20SPECIAL%20PAY%20GUIDANCE-Correction.pdf?ver=Fu3zLzlHCUzEu0ynrllaAQ%3D%3D',FY26:'https://www.med.navy.mil/Portals/62/Documents/BUMED/Special%20Pays/FY26/FY26%20MC%20SPECIAL%20PAY%20GUIDANCE.pdf?ver=rucne9MfWLwappLSef4R3w%3D%3D'};

export const benchmarks={
 doximity:{label:'Doximity',scope:'U.S. · 2026 report, 2025 compensation',values:{peds:273665,im:339274,fm:325040}},
 medscape:{label:'Medscape',scope:'U.S. · 2026 report, rounded',values:{peds:266000,im:307000,fm:288000}},
 salarydr:{label:'SalaryDr',scope:'U.S. · 2026 report, attending median',values:{peds:310000,im:345000,fm:310000}},
 marit:{label:'Marit',scope:'Selected civilian location',values:{peds:303974,im:459057,fm:373038}}
};
// Published 2026 state specialty ranges for $1M/$3M mature claims-made coverage; peds, IM, FM order.
export let malpracticeRanges=null;

export const paySteps={
 O4:[[0,6294.6],[2,7286.4],[3,7773.6],[4,7881],[6,8332.2],[8,8816.4],[10,9420],[12,9888.3],[14,10214.4],[16,10401.6],[18,10509.9]],
 O5:[[0,7295.4],[2,8218.2],[3,8787],[4,8894.1],[6,9249.6],[8,9461.4],[10,9928.5],[12,10271.7],[14,10715.1],[16,11391.3],[18,11713.8],[20,12032.7],[22,12394.8]],
 O6:[[0,8751.3],[2,9613.8],[3,10245],[4,10245],[6,10284.3],[8,10725],[10,10783.5],[12,10783.5],[14,11396.4],[16,12479.7],[18,13115.4],[20,13751.1],[22,14112.9],[24,14479.2],[26,15188.7],[30,15408.3]]
};
export let bahData=null;
let referenceDataPromise;
export function loadReferenceData(){
  if(!referenceDataPromise)referenceDataPromise=Promise.all([
    fetch(new URL('./data/bah-2026.json',import.meta.url)).then(response=>{if(!response.ok)throw Error('2026 BAH data unavailable');return response.json()}),
    fetch(new URL('./data/malpractice-ranges-2026.json',import.meta.url)).then(response=>{if(!response.ok)throw Error('2026 malpractice data unavailable');return response.json()})
  ]).then(([bah,malpractice])=>{
    if(bah.year!==2026||typeof bah.zipToMha!=='object'||Object.keys(bah.zipToMha).length<40000||!bah.areas||malpractice.year!==2026||!malpractice.ranges)throw Error('Invalid 2026 reference data');
    if(!Object.entries(bah.zipToMha).every(([zip,area])=>/^\d{5}$/.test(zip)&&(area==='XX499'||bah.areas[area])))throw Error('BAH ZIP mapping contains an invalid entry');
    bahData=bah;malpracticeRanges=malpractice.ranges;
  }).catch(error=>{referenceDataPromise=null;throw error});
  return referenceDataPromise;
}

export function bahFor(zip,rank,deps){
 if(!bahData||!/^\d{5}$/.test(zip))return null;
 const code=bahData.zipToMha[zip],area=bahData.areas[code];
 return area?.rates?.[rank]?.[deps]!=null?{code,name:area.name,monthly:area.rates[rank][deps]}:null;
}
export const payFor=(rank,y)=>paySteps[rank].reduce((v,[at,p])=>y>=at?p:v,paySteps[rank][0][1]);

// One accounting engine powers both views. Monetary values remain exact until display.
export function gradeForYear({rank, commissionYear, promotionOn}, index) {
  if (!promotionOn) return rank;
  const commissionedYears = 2027 + index - commissionYear;
  const target = commissionedYears >= 21 ? 'O6' : commissionedYears >= 15 ? 'O5' : 'O4';
  return ['O4','O5','O6'][Math.max(['O4','O5','O6'].indexOf(rank), ['O4','O5','O6'].indexOf(target))];
}

export function calculateScenario(input) {
  const {rank, commissionYear, promotionOn, payYos, base, bah, bahLookup, zip, deps,
    bas=328.48, ip=43000, bcp=boardCertificationPay, rbRemaining=0, currentBonus=0,
    civilianSalary, civilianGrowth=0, civilianTax=0, navyTax=0, growthTax=0,
    civilianBenefits=0, navyTsp=0, navyTspAuto=false, isBrs=true,
    health=0, gi=0, pensionAnnual=0, malpractice=0, discount=0.05,
    continuationPayMultiple=0, continuationPayYos=12,
    civilianFirstYearShare=1, transitionCost=0, civilianInsurance=0, civilianVa=0,
    years=4} = input;
  if (!Number.isInteger(years) || years < 1 || years > 30) throw new RangeError('Comparison years must be 1–30');
  if (!Number.isFinite(discount) || discount < 0 || discount > 0.20) throw new RangeError('Real discount rate must be 0–20%');
  if (Number.isFinite(civilianSalary) && civilianSalary < 0) throw new RangeError('Civilian salary cannot be negative');
  if (!Number.isFinite(civilianGrowth) || civilianGrowth < -0.10 || civilianGrowth > 0.20) throw new RangeError('Real salary growth must be −10% to 20%');
  if (!Number.isFinite(continuationPayMultiple) || continuationPayMultiple < 0 || continuationPayMultiple > 13) throw new RangeError('Continuation pay must be 0–13 months of basic pay');
  if (!Number.isFinite(civilianFirstYearShare) || civilianFirstYearShare < 0.5 || civilianFirstYearShare > 1) throw new RangeError('First-year civilian pay share must be 50–100%');
  if (!Number.isFinite(transitionCost) || transitionCost < 0 || !Number.isFinite(civilianInsurance) || civilianInsurance < 0) throw new RangeError('Transition and insurance costs cannot be negative');
  const rows = [];
  let pv = 0, annuity = 0;
  for (let i = 0; i < years; i++) {
    const grade = gradeForYear({rank, commissionYear, promotionOn}, i);
    const basicMonthly = i === 0 && grade === rank ? base : payFor(grade, payYos + i);
    const mappedBah = grade !== rank && bahLookup && Math.abs(bah - bahLookup.monthly) <= 1
      ? bahFor(zip, grade, deps)?.monthly : null;
    const bahMonthly = mappedBah ?? bah;
    const bonus = i < rbRemaining ? currentBonus : 0;
    // BRS continuation pay: one-time, paid in the service year that reaches
    // `continuationPayYos` (Navy: 12th year, 2.5 months of basic pay).
    const continuationPay = isBrs && payYos + i + 1 === continuationPayYos ? continuationPayMultiple * basicMonthly : 0;
    const navyCash = 12 * (basicMonthly + bahMonthly + bas) + ip + bcp + bonus + continuationPay;
    // First civilian year may pay less while a panel or productivity ramps up.
    const civilianCash = civilianSalary * Math.pow(1 + civilianGrowth, i) * (i === 0 ? civilianFirstYearShare : 1);
    const annualCivilianTax = Math.max(0, civilianTax + (civilianCash - civilianSalary) * growthTax);
    const tsp = navyTspAuto && isBrs ? Math.round(0.05 * 12 * basicMonthly) : navyTsp;
    // Civilian-path costs: one-time transition (moving, licensure, credentialing,
    // pay gap) in year 1, and annual private disability/life insurance premiums.
    const civilianValue = civilianCash - annualCivilianTax + civilianBenefits - malpractice
      - (i === 0 ? transitionCost : 0) - civilianInsurance
      // Tax-free VA compensation received after separation on the leave path,
      // during years the stay path is still on active duty.
      + civilianVa;
    const navyValue = navyCash - navyTax + health + gi + pensionAnnual + tsp;
    const gap = civilianValue - navyValue;
    const factor = 1 / Math.pow(1 + discount, i + 1);
    annuity += factor;
    pv += gap * factor;
    rows.push({year:2027+i, activeYos:payYos+i+1, grade, basicMonthly, bahMonthly,
      bonus, continuationPay, navyCash, civilianCash, grossGap:civilianCash-navyCash,
      civilianTax:annualCivilianTax, navyTax, tsp, civilianValue, navyValue, gap,
      discountedGap:gap*factor});
  }
  return {rows, pv, annuity, annualGap:pv/annuity,
    navyCash:rows[0].navyCash, civilianCash:rows[0].civilianCash,
    grossGap:rows[0].grossGap, adjustedGap:rows[0].gap};
}

export function annualPension({pensionBase, creditableYears, retirement='brs'}) {
  return pensionBase * (retirement === 'brs' ? 0.02 : 0.025) * creditableYears;
}

// Default real rate for pension-type flows: an inflation-indexed, federally backed
// annuity is closer to a TIPS than to risky civilian pay. Daily Treasury par real
// yields on 2026-09-28 were 3.14% (20-year) and 3.28% (30-year); 3% is a rounded
// planning default. Cash-pay comparisons keep their own discount rate.
export const defaultPensionDiscount = 0.03;
export const pensionDiscountSourceUrl = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_real_yield_curve&field_tdr_date_value=202609';

// Present value today of the conditional stay-path pension, plus an optional
// retiree-health value paid each year from retirement until Medicare age.
// `discount` is the pension (low-risk) real rate, not the cash-pay rate.
// ---- VA disability compensation, 2026 rates (effective 2025-12-01) ----
// Monthly amounts from VA.gov: veteran alone / veteran with spouse (no children).
// 10% and 20% ratings have no dependent differential. Ratings are in 10% steps.
export const vaRates2026Url = 'https://www.va.gov/disability/compensation-rates/veteran-rates/';
export const vaMonthly2026 = {
  0:{alone:0, spouse:0},
  20:{alone:356.66, spouse:356.66},
  30:{alone:552.47, spouse:617.47},
  50:{alone:1132.90, spouse:1241.90},
  60:{alone:1435.02, spouse:1566.02},
  100:{alone:3938.58, spouse:4158.17}
};
// CBO (2024) reports the average rating among compensation recipients rose to
// about 56% by 2020; 60% is the nearest VA rating step.
export const averageVaRating = 60;
export function vaAnnualFor(rating, withSpouse) {
  const row = vaMonthly2026[rating];
  if (!row) throw new RangeError('Unsupported VA rating');
  return 12 * (withSpouse ? row.spouse : row.alone);
}
// Concurrent Retirement and Disability Pay: at 50% or higher, a 20-year retiree
// keeps full retired pay plus VA compensation. Below 50%, retired pay is reduced
// dollar for dollar by the VA amount (the VA portion is tax-free).
export const crdpThreshold = 50;

// ---- Retiree TRICARE value before Medicare, based on published averages ----
// KFF 2025: average employer premium $26,993 family / $9,325 single; average
// worker contribution $6,850 family / $1,440 single. TRICARE Prime 2026 retiree
// enrollment fee: Group A $765 family / $381.96 individual; Group B $927 / $462.96.
export const kff2025 = {familyPremium:26993, singlePremium:9325, familyWorker:6850, singleWorker:1440};
export const tricarePrimeRetiree2026 = {A:{family:765, individual:381.96}, B:{family:927, individual:462.96}};
export function retireeTricareValue({family=true, mode='employer', group='A'} = {}) {
  if (mode === 'none') return 0;
  const fee = tricarePrimeRetiree2026[group]?.[family ? 'family' : 'individual'];
  if (fee == null) throw new RangeError('TRICARE group must be A or B');
  // 'employer': retiree works a civilian job with employer coverage, so TRICARE
  // replaces the average worker premium share. 'full': no employer coverage, so
  // TRICARE replaces the whole average premium.
  const avoided = mode === 'full' ? (family ? kff2025.familyPremium : kff2025.singlePremium)
    : mode === 'employer' ? (family ? kff2025.familyWorker : kff2025.singleWorker) : NaN;
  if (!Number.isFinite(avoided)) throw new RangeError('Unknown retiree health mode');
  return Math.max(0, avoided - fee);
}

// ---- Survivor Benefit Plan (spouse coverage, full base amount) ----
// Premium 6.5% of the base amount, paid from gross retired pay (pre-tax), until
// 30 years of payments and age 70; annuity to spouse 55% of the base amount.
export const sbpPremiumRate = 0.065, sbpAnnuityRate = 0.55, sbpPaidUpYears = 30;

// Present value today of the conditional stay-path pension, plus optional
// retiree-health value, VA offset below the CRDP threshold, and SBP.
// `discount` is the pension (low-risk) real rate, not the cash-pay rate.
export function pensionPresentValue({activeYears, additionalYears, retirement='brs',
  pensionBase, usuYears=0, currentAge=40, paymentYears=30, pensionTax=0.22,
  discount=defaultPensionDiscount, retireeHealthAnnual=0, medicareAge=65,
  vaOffsetAnnual=0, sbp=false, survivorYears=7}) {
  if (!Number.isFinite(discount) || discount < 0 || discount > 0.20) throw new RangeError('Real discount rate must be 0–20%');
  if (!Number.isFinite(retireeHealthAnnual) || retireeHealthAnnual < 0) throw new RangeError('Retiree health value cannot be negative');
  if (!Number.isFinite(vaOffsetAnnual) || vaOffsetAnnual < 0) throw new RangeError('VA offset cannot be negative');
  if (!Number.isFinite(survivorYears) || survivorYears < 0 || survivorYears > 50) throw new RangeError('Survivor years must be 0–50');
  if (activeYears >= 20 || activeYears + additionalYears < 20) return 0;
  const gross = annualPension({pensionBase, creditableYears:activeYears + additionalYears + usuYears, retirement});
  // Below 50%, VA replaces part of retired pay; both paths receive the VA amount
  // after 20, so only the remaining taxable retired pay is incremental to staying.
  const payable = Math.max(0, gross - vaOffsetAnnual);
  const annuityFactor = n => n <= 0 ? 0 : discount === 0 ? n : (1-Math.pow(1+discount,-n))/discount;
  const healthYears = Math.max(0, Math.min(paymentYears, medicareAge - (currentAge + additionalYears)));
  let atRetirement = payable * (1-pensionTax) * annuityFactor(paymentYears)
    + retireeHealthAnnual * annuityFactor(healthYears);
  if (sbp) {
    const premiumYears = Math.min(paymentYears, sbpPaidUpYears);
    atRetirement -= sbpPremiumRate * gross * (1-pensionTax) * annuityFactor(premiumYears);
    atRetirement += sbpAnnuityRate * gross * (1-pensionTax) * annuityFactor(survivorYears) / Math.pow(1+discount, paymentYears);
  }
  return atRetirement / Math.pow(1+discount,additionalYears);
}

// Stay-to-20 break-even view: at each active year of service from `fromYos`
// to 19, compare the pension value preserved by staying (pension rate) with the
// present value of the civilian-minus-Navy cash gap still to be forgone before
// 20 (cash rate). Positive net favors staying.
export function stayToTwentyCurve({fromYos=10, annualCashGap, annualPension:annualPay,
  paymentYears=30, pensionDiscount=defaultPensionDiscount, cashDiscount=0.05}) {
  const factor = (r,n) => r === 0 ? n : (1-Math.pow(1+r,-n))/r;
  const atRetirement = annualPay * factor(pensionDiscount, paymentYears);
  const rows = [];
  for (let yos = fromYos; yos < 20; yos++) {
    const left = 20 - yos;
    const pensionPV = atRetirement / Math.pow(1+pensionDiscount, left);
    const cashGapPV = annualCashGap * factor(cashDiscount, left);
    rows.push({yos, pensionPV, cashGapPV, net: pensionPV - cashGapPV});
  }
  let breakEven = null;
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i-1], b = rows[i];
    if (a.net < 0 && b.net >= 0) { breakEven = a.yos + (-a.net)/(b.net - a.net); break; }
  }
  return {rows, breakEven};
}

