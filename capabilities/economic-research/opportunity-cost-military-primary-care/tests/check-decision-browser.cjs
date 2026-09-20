// Optional UI checks: install Playwright or set PLAYWRIGHT_MODULE to its package path.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{}),headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Deterministic local tests; no counter, location or other external requests.
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/physician-pay-lab.html');
    await page.waitForFunction(()=>document.querySelector('#dataStatus').textContent==='');
    await page.locator('#zip').fill('92134');await page.locator('#civilian').fill('300000');
    assert.equal(await page.locator('#inputError').innerText(),'');
    assert.equal(await page.locator('#decisionError').innerText(),'');
    assert.match(await page.locator('#decisionResults').innerText(),/Break-even civilian starting salary/);
    await page.locator('summary').filter({hasText:'Save, compare, or export scenarios'}).click();
    const before=await page.locator('#decisionResults').innerText();
    await page.locator('#saveScenario').click();await page.locator('#civilian').fill('400000');
    await page.locator('#loadScenario').click();
    assert.equal(await page.locator('#decisionResults').innerText(),before);
    const downloadPromise=page.waitForEvent('download');await page.locator('#exportScenario').click();
    const download=await downloadPromise,buffer=fs.readFileSync(await download.path()),snapshot=JSON.parse(buffer);
    assert.equal(snapshot.modelVersion,'2026-09-20.1');assert.equal(snapshot.results.paths.length,3);
    await page.locator('#civilian').fill('350000');
    await page.locator('#importScenario').setInputFiles({name:'scenario.json',mimeType:'application/json',buffer});
    await page.waitForFunction(()=>document.querySelector('#scenarioStatus').textContent.startsWith('Imported'));
    assert.equal(await page.locator('#decisionResults').innerText(),before);
    const csvPromise=page.waitForEvent('download');await page.locator('#exportCareerCsv').click();
    const csv=fs.readFileSync(await (await csvPromise).path(),'utf8');assert.equal(csv.split('\r\n').length,76);
    await page.locator('summary').filter({hasText:'Career, workload, and tax assumptions'}).click();
    await page.locator('#employmentType').selectOption('1099');
    assert.match(await page.locator('#inputError').innerText(),/manual/);
    assert.equal(await page.locator('#decisionResults').innerText(),'');
    await page.locator('#annualTaxMode').selectOption('manual');await page.locator('#civilianTax').fill('60000');
    assert.equal(await page.locator('#decisionError').innerText(),'');
    await page.locator('#comparisonYears').fill('2');assert.match(await page.locator('#decisionError').innerText(),/include all/);
    await page.locator('#comparisonYears').fill('25');await page.locator('#employmentType').selectOption('w2');
    await page.locator('#commissionYear').selectOption('2006').catch(async()=>page.locator('#commissionYear').fill('2006'));
    await page.locator('#activeDutyYear').selectOption('2006');
    assert.match(await page.locator('#decisionResults').innerText(),/Retire now/);
    // Both pages use identical pre-tax settings for an eligible pension case.
    await page.locator('#activeDutyYear').selectOption('2016');
    await page.locator('#promotionPath').selectOption('fixed');
    await page.locator('#more').fill('10');await page.locator('#useLifeTable').uncheck();await page.locator('#benefitYears').fill('30');
    await page.locator('#civilian').fill('339274');
    for(const id of ['navyTax','civilianTax','navyGrowthTax','growthTax','civilianBenefits','navyTsp','health','malpractice','tail'])await page.locator('#'+id).fill('0');
    const fullPV=await page.locator('#pvCurrentOut').innerText();
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.querySelector('#careerDecisions').getBoundingClientRect().width<=innerWidth));
    await page.goto(origin+'/quick-lab.html');await page.waitForFunction(()=>document.querySelector('#pv').textContent!=='—');
    await page.locator('#years').fill('10');
    const quickPV=await page.locator('#pv').innerText();
    assert.equal(Number(fullPV.replace(/[^0-9.-]/g,'')),Number(quickPV.replace(/[^0-9.-]/g,'')));
    assert.deepEqual(errors,[]);
    console.log('Browser checks passed: save/load, JSON round-trip, CSV, invalid input clearing, 1099 manual tax, post-20 retirement, mobile width, Quick/full pension parity, no page errors.');
  }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
