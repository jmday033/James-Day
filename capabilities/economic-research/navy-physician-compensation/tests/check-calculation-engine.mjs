import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {bahFor,calculateScenario,loadReferenceData,payFor,pensionPresentValue} from '../calc-engine.js';

// Load the published JSON in Node, using the same URL paths as the browser.
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(url,'utf8'))});
await loadReferenceData();
const bah=bahFor('92134','O4','yes');
assert.equal(bah.monthly,5082);
assert.equal(bahFor('00000','O4','yes'),null);

const base=payFor('O4',10);
const shared={rank:'O4',commissionYear:2016,promotionOn:false,payYos:10,base,
  bah:bah.monthly,bahLookup:bah,zip:'92134',deps:'yes',civilianSalary:339274,
  years:4,discount:.05};
const noBonus=calculateScenario({...shared,rbRemaining:0,currentBonus:0});
const signedBonus=calculateScenario({...shared,rbRemaining:4,currentBonus:48000});
assert.ok(Math.abs(noBonus.pv-392021.0032869021)<.01);
assert.ok(Math.abs(signedBonus.pv-213305.09787711911)<.01);
assert.equal(signedBonus.navyCash,276965.76);
assert.equal(noBonus.rows.length,4);
assert.equal(signedBonus.rows[0].bonus,48000);
assert.ok(Math.abs((noBonus.pv-signedBonus.pv)-48000*signedBonus.annuity)<.01);

const promoted=calculateScenario({...shared,commissionYear:2012,promotionOn:true,payYos:14});
assert.equal(promoted.rows[0].grade,'O5');
assert.ok(promoted.rows[0].navyCash>noBonus.rows[0].navyCash);
const adjusted=calculateScenario({...shared,civilianTax:80000,navyTax:40000,
  civilianBenefits:12000,health:7000,malpractice:4000});
assert.ok(Math.abs(adjusted.pv-246814.33014145342)<.01);
assert.ok(adjusted.pv<noBonus.pv);

assert.equal(pensionPresentValue({activeYears:10,additionalYears:9,pensionBase:120000}),0);
const vested=pensionPresentValue({activeYears:10,additionalYears:10,pensionBase:120000,
  retirement:'brs',paymentYears:30,pensionTax:.22,discount:.05});
assert.ok(Math.abs(vested-353334.4373448725)<.01);
assert.ok(vested>0);
assert.throws(()=>calculateScenario({...shared,civilianSalary:-1}),/salary/);
assert.throws(()=>calculateScenario({...shared,discount:.21}),/discount/);
console.log('Calculation-engine checks passed');

