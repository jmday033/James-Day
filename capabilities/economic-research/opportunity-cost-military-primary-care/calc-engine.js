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
    years=4, netPensionPV=0, navyTaxForYear, civilianTaxForYear, navyGrowthTax=0} = input;
  if (!Number.isInteger(years) || years < 1 || years > 30) throw new RangeError('Comparison years must be 1–30');
  if (!Number.isFinite(discount) || discount < 0 || discount > 0.20) throw new RangeError('Real discount rate must be 0–20%');
  if (!Number.isFinite(civilianSalary) || civilianSalary < 0) throw new RangeError('Civilian salary must be a finite nonnegative number');
  if (!Number.isFinite(civilianGrowth) || civilianGrowth < -0.10 || civilianGrowth > 0.20) throw new RangeError('Real salary growth must be −10% to 20%');
  const rows = [];
  let pv = 0, annuity = 0;
  for (let i = 0; i < years; i++) {
    const grade = gradeForYear({rank, commissionYear, promotionOn}, i);
    const basicMonthly = i === 0 && grade === rank ? base : payFor(grade, payYos + i);
    const mappedBah = grade !== rank && bahLookup && Math.abs(bah - bahLookup.monthly) <= 1
      ? bahFor(zip, grade, deps)?.monthly : null;
    const bahMonthly = mappedBah ?? bah;
    const bonus = i < rbRemaining ? currentBonus : 0;
    const navyCash = 12 * (basicMonthly + bahMonthly + bas) + ip + bcp + bonus;
    const civilianCash = civilianSalary * Math.pow(1 + civilianGrowth, i);
    const annualCivilianTax = civilianTaxForYear ? civilianTaxForYear(civilianCash, i) : Math.max(0, civilianTax + (civilianCash - civilianSalary) * growthTax);
    const taxableNavy = 12 * basicMonthly + ip + bcp + bonus;
    const initialTaxableNavy = 12 * base + ip + bcp + (rbRemaining > 0 ? currentBonus : 0);
    const annualNavyTax = navyTaxForYear ? navyTaxForYear(taxableNavy, i) : Math.max(0, navyTax + (taxableNavy - initialTaxableNavy) * navyGrowthTax);
    const tsp = navyTspAuto && isBrs ? Math.round(0.05 * 12 * basicMonthly) : navyTsp;
    const civilianValue = civilianCash - annualCivilianTax + civilianBenefits - malpractice;
    const navyValue = navyCash - annualNavyTax + health + gi + pensionAnnual + tsp;
    const gap = civilianValue - navyValue;
    const factor = 1 / Math.pow(1 + discount, i + 1);
    annuity += factor;
    pv += gap * factor;
    rows.push({year:2027+i, activeYos:payYos+i+1, grade, basicMonthly, bahMonthly,
      bonus, navyCash, civilianCash, grossGap:civilianCash-navyCash,
      civilianTax:annualCivilianTax, navyTax:annualNavyTax, tsp, civilianValue, navyValue, gap,
      navyTakeHome:navyCash-annualNavyTax, civilianTakeHome:civilianCash-annualCivilianTax-malpractice-health,
      discountedGap:gap*factor});
  }
  const cashPV = pv;
  pv -= netPensionPV;
  return {rows, pv, cashPV, netPensionPV, annuity, annualGap:pv/annuity,
    navyCash:rows[0].navyCash, civilianCash:rows[0].civilianCash,
    grossGap:rows[0].grossGap, adjustedGap:rows[0].gap};
}

export function annualPension({pensionBase, creditableYears, retirement='brs'}) {
  return pensionBase * (retirement === 'brs' ? 0.02 : 0.025) * creditableYears;
}

export function pensionPresentValue({activeYears, additionalYears, retirement='brs',
  pensionBase, usuYears=0, currentAge=40, paymentYears=30, pensionTax=0.22,
  discount=0.05}) {
  if (!Number.isFinite(discount) || discount < 0 || discount > 0.20) throw new RangeError('Real discount rate must be 0–20%');
  if (activeYears >= 20 || activeYears + additionalYears < 20) return 0;
  const annual = annualPension({pensionBase, creditableYears:activeYears + additionalYears + usuYears, retirement}) * (1-pensionTax);
  const stream = discount === 0 ? paymentYears : (1-Math.pow(1+discount,-paymentYears))/discount;
  return annual * stream / Math.pow(1+discount,additionalYears);
}

