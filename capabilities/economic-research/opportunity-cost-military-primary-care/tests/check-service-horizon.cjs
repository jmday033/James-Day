const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=process.env.LAB_ROOT||path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const file=path.join(root,req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/physician-pay-lab.html');await page.waitForFunction(()=>document.querySelector('#zipNote').textContent.includes('2026 BAH'));
 const slider=page.locator('#moreSlider'),more=page.locator('#more'),label=page.locator('#serviceSpan');
 assert.equal(await slider.getAttribute('min'),'2027');
 await slider.focus();await page.keyboard.press('Home');assert.equal(await more.inputValue(),'1');
 await page.keyboard.press('ArrowRight');assert.equal(await more.inputValue(),'2');assert.match(await label.textContent(),/12 projected/);
 await page.keyboard.press('End');assert.equal(await more.inputValue(),'30');assert.match(await label.textContent(),/40 projected/);
 await more.fill('4');assert.equal(await slider.inputValue(),'2030');
 await slider.scrollIntoViewIfNeeded();const box=await slider.boundingBox();await page.mouse.move(box.x+box.width*.12,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height/2,{steps:15});await page.mouse.up();
 const dragged=Number(await more.inputValue());assert.ok(dragged>10&&dragged<30);assert.equal(Number(await slider.inputValue()),2026+dragged);
 await more.fill('4');const gapBefore=await page.locator('#gapOut').textContent();await more.fill('10');assert.notEqual(await page.locator('#gapOut').textContent(),gapBefore);assert.match(await page.locator('#pensionHorizonNote').textContent(),/reaches 20/);
 await page.locator('#zip').fill('');await slider.focus();await page.keyboard.press('Home');assert.match(await label.textContent(),/11 projected/);assert.match(await page.locator('#inputError').textContent(),/duty-station ZIP/);assert.equal(await page.locator('#gapOut').textContent(),'—');
 await page.locator('#activeDutyYear').selectOption('2020');assert.match(await label.textContent(),/7 projected/);
 await more.fill('12');assert.equal(await slider.inputValue(),'2038');assert.match(await label.textContent(),/18 projected/);
 await page.locator('#zip').fill('96863');assert.equal(await page.locator('#inputError').textContent(),'');assert.notEqual(await page.locator('#gapOut').textContent(),'—');
 assert.deepEqual(errors,[]);console.log('Service horizon: dragging, keyboard, numeric sync, active-year changes, pension threshold, calculations and invalid ZIP passed.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

