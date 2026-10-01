import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {stayOrGo, sensitivity, federalIncomeTax, wageTax, loadReferenceData, bahFor, goalCoverage, exitWindows, collegeBudgets2025} from '../stay-or-go.js';

globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(url,'utf8'))});
await loadReferenceData();
const stateData=JSON.parse(await fs.readFile(new URL('../data/state-tax-2026.json',import.meta.url),'utf8'));
const lifeTable=JSON.parse(await fs.readFile(new URL('../data/us-life-remaining-2024.json',import.meta.url),'utf8'));
const near=(a,b,tol=1)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);

// Federal tax: 2026 joint brackets, standard deduction, and Child Tax Credit phase-out.
near(federalIncomeTax(32200,true,0),0);
near(federalIncomeTax(100000,false,0),bracketCheck(100000-16100));
function bracketCheck(t){return .10*12400+.12*(50400-12400)+.22*(t-50400)}
assert.equal(federalIncomeTax(150000,true,1)+2200,federalIncomeTax(150000,true,0));
assert.equal(federalIncomeTax(459057,true,1),federalIncomeTax(459057,true,0)); // credit fully phased out
// A working spouse raises the tax attributed to the physician's pay.
const ctx={family:'married',kids:0,stateCode:'FL',stateData};
assert.ok(wageTax(300000,{...ctx,family:'marriedTwoIncomes',spouseWages:150000})>wageTax(300000,ctx));

const bah=bahFor('92134','O4','yes');
const base=stayOrGo({},{stateData,lifeTable,bah});
assert.equal(base.years,10);
assert.equal(base.rows.length,10);
near(base.net, base.pensionValue-base.costOfStaying, .001);
// Break-even path starts at the current decision and matches the headline.
near(base.path[0].net, base.net, .001);
assert.equal(base.path.at(-1).yos,19);
// A much higher civilian salary favors leaving and pushes break-even later.
const rich=stayOrGo({civilianSalary:650000},{stateData,lifeTable,bah});
assert.ok(rich.net<base.net);
assert.ok(rich.breakEven===null||rich.breakEven>10);
// Florida residency lowers Navy taxes and raises the value of staying.
assert.ok(stayOrGo({navyState:'FL'},{stateData,lifeTable,bah}).net>base.net);
// A higher pension discount rate lowers the pension value.
assert.ok(stayOrGo({pensionRate:.05},{stateData,lifeTable,bah}).pensionValue<base.pensionValue);
assert.throws(()=>stayOrGo({yos:20},{stateData,lifeTable,bah}),RangeError);
const sens=sensitivity({},{stateData,lifeTable,bah});
assert.equal(sens.length,9);
assert.ok(sens.every((s,i)=>i===0||sens[i-1].swing>=s.swing));
// Reserve route: points-based pension from 60, smaller than a full active-duty
// pension; more points or an earlier start raise it.
{
  const x={yos:15,specialty:'pulm',rank:'O5',retirement:'legacy',promotion:false};
  const r=stayOrGo(x,{stateData,lifeTable,bah});
  near(r.reserve.points,365*15+77*5,.001);
  near(r.reserve.equivalentYears,(365*15+77*5)/360,1e-9);
  near(r.reserve.annualPension,r.parts.pensionBase*.025*r.reserve.equivalentYears,.01);
  assert.ok(r.reserve.annualPension<r.parts.annualPension);
  assert.equal(r.reserve.startAge,60);
  near(r.reserve.net,r.reserve.pensionValue+r.reserve.healthValue+r.reserve.drillValue,.001);
  assert.ok(stayOrGo({...x,reservePoints:100},{stateData,lifeTable,bah}).reserve.net>r.reserve.net);
  assert.ok(stayOrGo({...x,reserveStartAge:57},{stateData,lifeTable,bah}).reserve.pensionValue>r.reserve.pensionValue);
  assert.ok(stayOrGo({...x,reserveDaysMissed:0},{stateData,lifeTable,bah}).reserve.drillValue>r.reserve.drillValue);
  // An obligation keeps you on active duty first: those years earn active points.
  const ob=stayOrGo({...x,obligationYears:2},{stateData,lifeTable,bah});
  near(ob.reserve.points,365*17+77*3,.001);
}
// VA route: FERS deposit buys back active years; valued against the private job.
{
  const c={stateData,lifeTable,bah};
  const r=stayOrGo({},c), w=r.va;
  assert.equal(w.salary,315000);                         // IM: private $339,274 capped at Table 1 Tier 1 max
  assert.equal(stayOrGo({specialty:'cards'},c).va.salary,400000);
  assert.equal(stayOrGo({vaSalary:280000},c).va.salary,280000);
  assert.equal(w.militaryYears,10); assert.equal(w.years,65-37);
  assert.equal(w.withBuyback.multiplier,.011);             // leaves at 65 with 20+ years
  near(w.withBuyback.annual,.011*(28+10)*315000,.01);
  near(w.noBuyback.annual,.011*28*315000,.01);
  assert.ok(w.deposit>20000 && w.deposit<35000);           // 3% of ~$1M military basic pay
  near(w.net,w.salaryGapValue+w.withBuyback.value-w.depositValue,.001);
  assert.ok(w.buybackGain>0);
  const off=stayOrGo({vaBuyback:false},c).va;
  assert.ok(!off.buyback && off.net<w.net);
  near(off.net,off.salaryGapValue+off.noBuyback.value,.001);
  // Buyback reaches 30 years at 57, so the pension starts at once; without it, deferred to 62.
  const early=stayOrGo({workUntilAge:57},c).va;
  assert.equal(early.withBuyback.startAge,57); assert.equal(early.noBuyback.startAge,62);
  // Fewer than 5 VA years: not vested.
  assert.equal(stayOrGo({yos:19,workUntilAge:49},c).va.pension.annual,0);
  // Higher VA pay raises the VA route.
  assert.ok(stayOrGo({vaSalary:340000},c).va.net>w.net);
  // Active-duty and Reserve results are unchanged by VA inputs.
  assert.equal(stayOrGo({vaSalary:200000,vaBuyback:false},c).net,r.net);
  console.log('VA route checks passed');
}
console.log('Stay-or-go checks passed');

// Every specialty runs, uses its own Navy pay, and falls back to national pay outside primary care.
{
  const {specialtyTable, defaultCivilianSalary} = await import('../stay-or-go.js');
  assert.ok(specialtyTable.length >= 45);
  for (const row of specialtyTable) {
    const r = stayOrGo({specialty:row.key},{stateData,lifeTable,bah});
    assert.ok(Number.isFinite(r.net), row.key);
    assert.equal(r.input.civilianSalary, row.civ);
  }
  assert.equal(defaultCivilianSalary('cards','sandiego'), 604635);
  const cards = stayOrGo({specialty:'cards'},{stateData,lifeTable,bah}), im = stayOrGo({},{stateData,lifeTable,bah});
  assert.ok(cards.rows[0].navyCash - im.rows[0].navyCash === (69000-43000) + (76000-48000));
  console.log('All-specialty checks passed');
}

// Expert-review fixes: bonus renewals, obligation, pay after 20, range.
{
  const {answerRange} = await import('../stay-or-go.js');
  const c={stateData,lifeTable,bah};
  const renew=stayOrGo({rbMode:'renew'},c), one=stayOrGo({rbMode:'one'},c), none=stayOrGo({rbMode:'none'},c);
  assert.ok(renew.rows.every(r=>r.bonus===48000));
  assert.equal(one.rows.filter(r=>r.bonus>0).length,4);
  assert.ok(renew.net>one.net && one.net>none.net);
  // Obligation: obligated years count as zero gap, decision and break-even start after them.
  const obl=stayOrGo({obligationYears:3,rbMode:'one'},c);
  assert.ok(obl.rows.slice(0,3).every(r=>r.gap===0));
  assert.equal(obl.rows.filter(r=>r.bonus>0)[0].yos, 14);
  assert.equal(obl.path[0].yos,13); assert.equal(obl.decisionYos,13);
  // Pay penalty after 20 raises the cost of staying; 0% removes it.
  const p0=stayOrGo({postTwentyPenalty:0},c), p10=stayOrGo({postTwentyPenalty:.10},c);
  assert.equal(p0.afterTwentyCost,0); assert.ok(p10.afterTwentyCost>0 && p10.net<p0.net);
  const [lo,hi]=answerRange(renew.net,sensitivity({},c));
  assert.ok(lo<renew.net && hi>renew.net);
  console.log('Expert-review fix checks passed');
}

// ---------- goals translation ----------
{
  const c={stateData,lifeTable,bah};
  const r=stayOrGo({kids:2},c), g=goalCoverage(r,{annualSpending:100000,debt:200000});
  near(g.value,Math.abs(r.net),.001);
  near(g.spendingYears,Math.abs(r.net)/100000,1e-9);
  const college=g.items.find(t=>t.key==='college');
  assert.equal(college.need,2*4*collegeBudgets2025.public);
  near(g.items.find(t=>t.key==='debt').share,Math.abs(r.net)/200000,1e-9);
  assert.ok(!g.items.some(t=>t.key==='home'));                 // zero goals are hidden
  near(g.cashBefore20+r.afterTwentyCost,r.costOfStaying,.001);  // timing split adds back up
  near(g.pensionNet,r.parts.annualPension*(1-r.input.pensionTax),.001);
  near(g.savingsEquivalent,r.parts.annualPension/.04,.001);
  assert.equal(goalCoverage(stayOrGo({family:'single'},c)).kids,0);
}

// ---------- exit windows ----------
{
  const c={stateData,lifeTable,bah};
  const e=exitWindows({},c), w=e.windows;
  assert.equal(w[0].yos,10); assert.equal(w.at(-1).yos,20);
  assert.ok(w[0].free); near(w[0].net,0);
  near(w.at(-1).net,e.result.net,.001);                          // stay to 20 equals the headline
  // Renewed 4-year bonuses from 10 open windows at 14 and 18; continuation pay (12 to 16) closes 14.
  assert.deepEqual(w.filter(x=>x.free&&!x.atTwenty).map(x=>x.yos),[10,18]);
  assert.ok(w.find(x=>x.yos===14).lockedBy.includes('continuation pay obligation'));
  // Without bonus or continuation pay, every year is a window.
  const open=exitWindows({rbMode:'none',continuationPay:false},c);
  assert.ok(open.windows.every(x=>x.free));
  // Cost so far is the running present value of the yearly gaps.
  const r=e.result;let s=0;for(let i=0;i<4;i++)s+=r.rows[i].gap/Math.pow(1.05,i+1);
  near(w.find(x=>x.yos===14).costSoFar,s,.001);
  // A higher later salary (e.g., after a fellowship) helps only from the chosen year.
  const fel=exitWindows({yos:6},c,{laterSalary:604635,laterFromYos:12});
  assert.equal(fel.windows.find(x=>x.yos===11).laterGain,0);
  assert.ok(fel.windows.find(x=>x.yos===12).laterGain>0);
  assert.equal(fel.windows[0].net,0);                            // leaving now forgoes it
  // Obligation years are not exit windows.
  const ob=exitWindows({obligationYears:2},c);
  assert.equal(ob.windows[0].yos,12); assert.ok(ob.windows[0].free);
}
console.log('stay-or-go goals and exit-window checks passed');

// ---------- savings needed to match the pension ----------
{
  const {annualSavingsFor}=await import('../stay-or-go.js');
  // Future value check: saving P a year for n years at r builds the target.
  const P=annualSavingsFor(1e6,10,.05);near(P*(Math.pow(1.05,10)-1)/.05,1e6,.01);
  near(annualSavingsFor(1e6,10,0),1e5,1e-9);
  const g=goalCoverage(stayOrGo({},{stateData,lifeTable,bah}));
  near(g.savingsPerYear,annualSavingsFor(g.savingsEquivalent,10),.001);
  assert.deepEqual(g.savingsTable.map(t=>t.yos),[4,8,10,12,16]);
  assert.ok(g.savingsTable.find(t=>t.current).yos===10);
  assert.ok(g.savingsTable.every((t,i,a)=>i===0||a[i-1].perYear<t.perYear)); // fewer years left, more per year
}
console.log('savings-equivalent checks passed');
