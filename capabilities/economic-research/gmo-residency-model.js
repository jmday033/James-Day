// Gross-cash illustration for a GMO choosing a primary-care residency.
// All amounts are held in 2026 dollars. Pension, taxes, RB, BCP, and benefits are excluded.
export const civilianResidentStipends = {1:68166, 2:70499, 3:73301}; // AAMC 2025 national means
export const gmoTrainingYears = {credited:2, restart:3};

export function calculateGmoResidency({
  specialty, rank, activeYears, bahMonthly, payFor, civilianAttending,
  creditedInternship=true, obligationYears=3, discount=.05,
  basMonthly=328.48, residentIpPgy1=1200, residentIpLater=8000,
  attendingIp=43000
}) {
  if (!['peds','im','fm'].includes(specialty)) throw new RangeError('Choose a primary-care specialty');
  if (!Number.isFinite(bahMonthly) || bahMonthly < 0) throw new RangeError('Enter a valid Navy housing allowance');
  if (!Number.isFinite(civilianAttending) || civilianAttending < 0) throw new RangeError('Enter a valid civilian attending salary');
  if (!Number.isInteger(obligationYears) || obligationYears < 1 || obligationYears > 10) throw new RangeError('Post-training years must be 1–10');
  const residentPgys = creditedInternship ? [2,3] : [1,2,3];
  const rows = [];
  for (let i=0; i<residentPgys.length+obligationYears; i++) {
    const training=i<residentPgys.length;
    const pgy=training?residentPgys[i]:null;
    const navyCash=12*(payFor(rank,activeYears+i)+bahMonthly+basMonthly)+(training?(pgy===1?residentIpPgy1:residentIpLater):attendingIp);
    const civilianCash=training?civilianResidentStipends[pgy]:civilianAttending;
    rows.push({year:2027+i,phase:training?'Residency':'After residency',pgy,navyCash,civilianCash,gap:civilianCash-navyCash,discountedGap:(civilianCash-navyCash)/Math.pow(1+discount,i)});
  }
  const trainingNavyAdvantage=rows.filter(r=>r.pgy).reduce((sum,r)=>sum-r.gap,0);
  const postCivilianAdvantage=rows.filter(r=>!r.pgy).reduce((sum,r)=>sum+r.gap,0);
  const presentValueGap=rows.reduce((sum,r)=>sum+r.discountedGap,0);
  let cumulative=-trainingNavyAdvantage, crossover=null;
  for (let year=1;year<=obligationYears;year++) {
    cumulative+=rows[residentPgys.length+year-1].gap;
    if(crossover===null && cumulative>=0) crossover=year;
  }
  return {rows,trainingYears:residentPgys.length,obligationYears,trainingNavyAdvantage,postCivilianAdvantage,presentValueGap,crossover};
}

