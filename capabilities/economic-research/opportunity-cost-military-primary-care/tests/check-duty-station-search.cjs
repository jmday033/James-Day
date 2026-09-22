const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=process.env.LAB_ROOT||path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const file=path.join(root,req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{
  for(const mode of ['normal','slow','failed']){
   const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   let release;const pending=new Promise(r=>release=r);
   await page.route('**/*',async route=>{
    const url=route.request().url();if(!url.startsWith(origin))return route.abort();
    if(url.includes('duty-stations.json')){if(mode==='slow')await pending;if(mode==='failed')return route.fulfill({status:503,body:'Unavailable'});}
    return route.continue();
   });
   await page.goto(origin+'/physician-pay-lab.html');
   await page.locator('#stationSearch').fill('marine corps base hawaii');
   if(mode==='slow'){assert.match(await page.locator('#stationResults').textContent(),/Loading duty stations/);release();}
   if(mode==='failed'){
    await page.waitForFunction(()=>document.querySelector('#stationResults').textContent.includes('unavailable'));
    await page.locator('#zip').fill('96863');
    await page.waitForFunction(()=>document.querySelector('#zipNote').textContent.includes('2026 BAH'));
   }else{
    await page.getByRole('button',{name:/Marine Corps Base Hawaii/}).click();
    assert.equal(await page.locator('#zip').inputValue(),'96863');
    assert.match(await page.locator('#zipNote').textContent(),/2026 BAH/);
    assert.notEqual(await page.locator('#bah').inputValue(),'');
    for(const query of ['MCBH','hawaii marine base']){
     // The primary aliases and reordered words must work.

     await page.locator('#stationSearch').fill(query);assert.equal(await page.getByRole('button',{name:/Marine Corps Base Hawaii/}).count(),1);
    }
    await page.locator('#stationSearch').fill('naval');assert.ok(await page.locator('#stationResults button').count()>10);
    await page.locator('#stationSearch').fill('zzzzstation');assert.match(await page.locator('#stationResults').textContent(),/No listed station/);
    await page.locator('#stationSearch').fill('kitsap');await page.getByRole('button',{name:/Naval Base Kitsap/}).click();
    assert.equal(await page.locator('#zip').inputValue(),'');assert.equal(await page.locator('#bah').inputValue(),'');assert.match(await page.locator('#stationNoteText').textContent(),/orders/);
    await page.locator('#stationSearch').fill('Iwakuni');await page.getByRole('button',{name:/Marine Corps Air Station Iwakuni/}).click();
    assert.equal(await page.locator('#bah').inputValue(),'');assert.match(await page.locator('#stationNoteText').textContent(),/overseas postal/);
    assert.equal(await page.locator('#inputError').textContent(),'');
   }
   assert.deepEqual(errors,[]);await page.close();console.log(mode+' passed');
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});


