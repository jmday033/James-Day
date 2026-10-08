// Reconcile the Stay or go? lab with the paper's adjusted base case (revision 16, Appendix D: -$58,419).
//   node paper/lab_reconciliation.mjs        (from the project folder)
// Step 0 sets the lab to the paper's assumptions. Each later step switches one input back to the lab's
// own default, so the printed changes attribute the gap between the two results. Read-only; no files written.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {stayOrGo, loadReferenceData, bahFor} from '../stay-or-go.js';

globalThis.fetch = async url => ({ok: true, json: async () => JSON.parse(await fs.readFile(url, 'utf8'))});
await loadReferenceData();
const stateData = JSON.parse(await fs.readFile(new URL('../data/state-tax-2026.json', import.meta.url), 'utf8'));
const lifeTable = JSON.parse(await fs.readFile(new URL('../data/us-life-remaining-2024.json', import.meta.url), 'utf8'));
const bah = bahFor('92134', 'O4', 'yes');
const run = input => stayOrGo(input, {stateData, lifeTable, bah});

// The paper's base case (Appendices A-D): O-4 internist, 10 years, San Diego, married one income,
// $459,057 Marit Health salary, no promotion, no continuation pay, no retiree health, no transition
// cost, no post-20 pay penalty, flat 32% pension tax, 30 pension payments, 3% pension / 5% cash rates.
const paper = {yos: 10, specialty: 'im', rank: 'O4', promotion: false, civilianSalary: 459057,
  family: 'married', kids: 0, zip: '92134', retentionBonus: true, continuationPay: false,
  navyState: 'same', civilianState: 'CA', pensionRate: .03, cashRate: .05, pensionTax: .32,
  paymentYears: 30, tricare: 'none', transitionCost: 0, postTwentyPenalty: 0, malpractice: 0};

const steps = [
  ['Paper assumptions in the lab', {}],
  ['+ pension tax at the marginal federal rate (lab default) instead of a flat 32%', {pensionTax: null}],
  ['+ pension paid for remaining life expectancy (lab default) instead of 30 years', {paymentYears: null}],
  ['+ retiree TRICARE valued (lab default)', {tricare: 'employer'}],
  ['+ continuation pay (lab default)', {continuationPay: true}],
  ['+ $2,500 cost of leaving (lab default)', {transitionCost: undefined}],
  ['+ 5% lower civilian pay after 20 (lab default)', {postTwentyPenalty: undefined}],
  ['+ promotion assumed (lab default)', {promotion: undefined}],
];

let input = {...paper}, previous = null;
const rows = [];
for (const [label, change] of steps) {
  for (const [k, v] of Object.entries(change)) { if (v === undefined) delete input[k]; else input[k] = v; }
  const r = run(input);
  rows.push({label, net: r.net, change: previous === null ? null : r.net - previous,
             pensionTax: r.input.pensionTax, paymentYears: r.input.paymentYears});
  previous = r.net;
}
const fmt = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
for (const r of rows) {
  console.log(`${r.label.padEnd(82)} net ${fmt(r.net).padStart(11)}`
    + (r.change === null ? '' : `   change ${fmt(r.change).padStart(10)}`)
    + `   (pension tax ${(r.pensionTax * 100).toFixed(0)}%, ${r.paymentYears} payments)`);
}

// A separate two-change scenario explains the historical -$8,042 comparison.
// It is NOT the result with all current defaults restored in the sequence above.
const paperResult = run(paper);
const lifeOnly = run({...paper, paymentYears: null});
const historical = run({...paper, paymentYears: null, transitionCost: 2500});
assert.equal(Math.round(paperResult.net), -58419);
assert.equal(Math.round(lifeOnly.net - paperResult.net), 47996);
assert.equal(Math.round(historical.net - lifeOnly.net), 2381);
assert.equal(Math.round(historical.net), -8042);
console.log(`Historical two-change scenario: ${fmt(historical.net)} = ${fmt(paperResult.net)} + ${fmt(lifeOnly.net-paperResult.net)} + ${fmt(historical.net-lifeOnly.net)}`);
console.log('This historical scenario keeps the other paper assumptions; it is not the current all-default lab result.');
