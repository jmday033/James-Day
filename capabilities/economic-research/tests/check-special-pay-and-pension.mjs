import assert from 'node:assert/strict';
import {annualPension, boardCertificationPay, bonusStatusAllowsRate, rbRates} from '../calc-engine.js';

assert.equal(boardCertificationPay, 8000);
assert.deepEqual(rbRates.FY26.im, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.fm, {2:20000, 3:28000, 4:48000, 6:60000});
assert.deepEqual(rbRates.FY26.peds, {2:15000, 3:25000, 4:35000, 6:40000});
assert.equal(bonusStatusAllowsRate('unknown'), false);
assert.equal(bonusStatusAllowsRate('obligated'), false);
assert.equal(bonusStatusAllowsRate('signed'), true);
assert.equal(bonusStatusAllowsRate('eligible'), true);

// White Coat Investor cites roughly $48,400–$60,500 pretax for a historical
// O-5/20-year example. A $121,000 illustrative High-3 produces those amounts.
// A current scenario must use its own estimated retirement High-3.
assert.equal(annualPension({pensionBase:121000, creditableYears:20, retirement:'brs'}), 48400);
assert.equal(annualPension({pensionBase:121000, creditableYears:20, retirement:'legacy'}), 60500);
console.log('Special-pay and pension checks passed');

