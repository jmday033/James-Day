const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=process.env.LAB_ROOT||path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const file=path.join(root,req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{for(const failedData of [false,true]){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>!r.request().url().startsWith(origin)?r.abort():failedData&&r.request().url().includes('bah-2026.json')?r.fulfill({status:503,body:'Unavailable'}):r.continue());
  await page.goto(origin+'/physician-pay-lab.html');
  const term=n=>page.locator('#rbChoices input[value="'+n+'"]');
  await term('none').waitFor();assert.equal(await page.locator('#rbChoices input').count(),6);assert.equal(await term('4').isDisabled(),true);
  await page.locator('#zip').fill('');await page.locator('#rbStatus').selectOption('eligible');assert.equal(await term('4').isDisabled(),false);
  for(const [years,amount]of [[2,20000],[3,28000],[4,48000],[6,60000]]){await term(years).check();assert.equal(Number((await page.locator('#currentBonus').inputValue()).replaceAll(',','')),amount);assert.equal(await page.locator('#rbRemaining').inputValue(),String(years));}
  await page.locator('#specialty').selectOption('peds');assert.equal(Number((await page.locator('#currentBonus').inputValue()).replaceAll(',','')),40000);
  await page.locator('#rbStatus').selectOption('obligated');assert.equal(await term('none').isChecked(),true);assert.equal(await page.locator('#currentBonus').inputValue(),'0');assert.equal(await term('4').isDisabled(),true);
  await page.locator('#rbStatus').selectOption('signed');await term('custom').check();await page.locator('#currentBonus').fill('12345');assert.equal(await term('custom').isChecked(),true);
  assert.deepEqual(errors,[]);await page.close();console.log('Retention buttons passed; failed reference data: '+failedData);
 }}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

