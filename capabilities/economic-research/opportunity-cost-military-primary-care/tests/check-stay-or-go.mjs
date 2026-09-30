import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {stayOrGo, sensitivity, federalIncomeTax, wageTax, loadReferenceData, bahFor} from '../stay-or-go.js';

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
